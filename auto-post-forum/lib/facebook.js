const DESKTOP_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

/** Target: lấy ít nhất 50 bình luận chữ (cap cao hơn để bù lọc trùng). */
const MIN_COMMENTS = 50;
const MAX_COMMENTS = 100;
const MAX_COMMENT_PAGES = 25;


/** Known / recently seen CommentsList doc_ids (FB rotates these). */
const COMMENT_DOC_IDS = [
  "24339100875674342",
  "26104902314025443",
  "22172627752418328",
  "9927528857340152",
  "7274617722632877",
];

function desktopHeaders(cookie) {
  return {
    "User-Agent": DESKTOP_UA,
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
    "sec-ch-ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-User": "?1",
    "Sec-Fetch-Dest": "document",
    Cookie: cookie,
  };
}

export function validateCookie(cookie) {
  if (!cookie || !cookie.trim()) {
    return "Thiếu FB_COOKIE trong .env";
  }
  if (!/c_user=\d+/.test(cookie)) {
    return "FB_COOKIE thiếu c_user";
  }
  if (!/[; ]xs=/.test(`; ${cookie}`) && !cookie.trim().startsWith("xs=")) {
    return "FB_COOKIE thiếu xs (copy từ Chrome Network → cookie, không dùng document.cookie)";
  }
  return null;
}

export function isFacebookPostUrl(url) {
  try {
    const u = new URL(url);
    if (!/(^|\.)facebook\.com$/i.test(u.hostname)) return false;
    return (
      /\/groups\/[^/]+\/(posts|permalink)\/\d+/i.test(u.pathname) ||
      /\/share\/p\//i.test(u.pathname) ||
      /\/permalink\.php/i.test(u.pathname) ||
      /story_fbid=/i.test(u.search)
    );
  } catch {
    return false;
  }
}

function decodeJsString(value) {
  if (value == null) return "";
  try {
    return JSON.parse(`"${value}"`);
  } catch {
    return value;
  }
}

function unescapeHtml(s) {
  return String(s)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'");
}

function extractPostIdFromUrl(url) {
  const m =
    url.match(/\/(?:posts|permalink)\/(\d+)/i) ||
    url.match(/[?&]story_fbid=(\d+)/i) ||
    url.match(/\/(\d{10,})\/?(?:\?|$)/);
  return m ? m[1] : null;
}

/**
 * Resolve share URL via og:url (mobile UA often works without full login).
 */
export async function resolveShareUrl(shareUrl) {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
    Accept: "text/html,*/*;q=0.8",
    "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
  };
  const res = await fetch(shareUrl, { headers, redirect: "follow" });
  const html = await res.text();
  const og = html.match(/property="og:url" content="([^"]+)"/i);
  if (og) return unescapeHtml(og[1]);
  if (/\/(posts|permalink)\//i.test(res.url)) return res.url;
  return null;
}

function extractTokens(html) {
  const dtsg =
    html.match(/"DTSGInitialData",\[\],\{"token":"([^"]+)"/)?.[1] ||
    html.match(/"dtsg":\{"token":"([^"]+)"/)?.[1] ||
    html.match(/"dtsg"\s*:\s*"([^"]+)"/)?.[1] ||
    null;
  const lsd =
    html.match(/\["LSD",\[\],\{"token":"([^"]+)"\}\]/)?.[1] ||
    html.match(/"LSD",\[\],\{"token":"([^"]+)"/)?.[1] ||
    null;
  const jazoest =
    html.match(/jazoest=(\d+)/)?.[1] ||
    html.match(/"sprinkleValue"\s*:\s*"(\d+)"/)?.[1] ||
    null;
  const userId =
    html.match(/"USER_ID":"(\d+)"/)?.[1] ||
    html.match(/"actorID":"(\d+)"/)?.[1] ||
    null;

  return { dtsg, lsd, jazoest, userId };
}

function extractFeedbackId(html, postId) {
  const ids = [...html.matchAll(/"feedback(?:_id)?"\s*:\s*\{?"id":"([^"]+)"/g)].map(
    (m) => m[1]
  );
  ids.push(...[...html.matchAll(/"feedback_id"\s*:\s*"([^"]+)"/g)].map((m) => m[1]));

  // Prefer root feedback for this post: base64("feedback:{postId}")
  if (postId) {
    const encoded = Buffer.from(`feedback:${postId}`, "utf8").toString("base64");
    const hit = ids.find((id) => id === encoded || id.startsWith(encoded.replace(/=+$/, "")));
    if (hit) return hit;
    // Also match decoded
    for (const id of ids) {
      try {
        const decoded = Buffer.from(id, "base64").toString("utf8");
        if (decoded === `feedback:${postId}`) return id;
      } catch {
        /* ignore */
      }
    }
  }

  // Shortest feedback id is often the root (no comment suffix)
  const feedbackLike = ids.filter((id) => {
    try {
      return Buffer.from(id, "base64").toString("utf8").startsWith("feedback:");
    } catch {
      return false;
    }
  });
  feedbackLike.sort((a, b) => a.length - b.length);
  return feedbackLike[0] || ids[0] || null;
}

function discoverCommentDocIds(html) {
  const found = [];
  const names = [
    "CommentsListComponentsPaginationQuery",
    "Depth1CommentsListPaginationQuery",
    "CometUFICommentsProviderPaginationQuery",
  ];
  for (const name of names) {
    let idx = 0;
    while ((idx = html.indexOf(name, idx)) !== -1) {
      const snip = html.slice(idx, idx + 400);
      const ids = snip.match(/\d{16,22}/g) || [];
      for (const id of ids) found.push(id);
      idx += name.length;
    }
  }
  return [...new Set([...found, ...COMMENT_DOC_IDS])];
}

/**
 * Extract main post message text (not comments).
 * Strategy: prefer story/message near post_id; fall back to og:description minus title noise.
 */
function extractPostContent(html, postId) {
  // 1) message blocks that sit near this post_id
  if (postId) {
    const marker = `"post_id":"${postId}"`;
    let from = 0;
    while ((from = html.indexOf(marker, from)) !== -1) {
      const window = html.slice(Math.max(0, from - 8000), from + 12000);
      const msg =
        window.match(/"message"\s*:\s*\{\s*"text"\s*:\s*"((?:\\.|[^"\\])*)"/)?.[1] ||
        window.match(/"message_content"\s*:\s*\{\s*"text"\s*:\s*"((?:\\.|[^"\\])*)"/)?.[1] ||
        window.match(
          /"comet_sections"[^]{0,2000}?"message"\s*:\s*\{\s*"text"\s*:\s*"((?:\\.|[^"\\])*)"/
        )?.[1];
      if (msg) {
        const text = decodeJsString(msg).trim();
        if (text) return text;
      }
      from += marker.length;
    }
  }

  // 2) og:description often has the post text
  const og = html.match(/property="og:description" content="([^"]*)"/i)?.[1];
  if (og) {
    const text = unescapeHtml(og).trim();
    if (text) return text;
  }

  // 3) First substantial story message that is NOT inside a Comment typename nearby
  const allMsgs = [
    ...html.matchAll(/"message"\s*:\s*\{\s*"text"\s*:\s*"((?:\\.|[^"\\])*)"/g),
  ];
  for (const m of allMsgs) {
    const idx = m.index ?? 0;
    const before = html.slice(Math.max(0, idx - 400), idx);
    if (before.includes('"__typename":"Comment"')) continue;
    const text = decodeJsString(m[1]).trim();
    if (text.length >= 3) return text;
  }

  return "";
}

function extractPostAuthorId(html, postId) {
  if (postId) {
    const marker = `"post_id":"${postId}"`;
    const from = html.indexOf(marker);
    if (from !== -1) {
      const window = html.slice(Math.max(0, from - 5000), from + 8000);
      const actors = window.match(
        /"actors"\s*:\s*\[\s*\{\s*"__typename"\s*:\s*"User"\s*,\s*"id"\s*:\s*"(\d+)"/
      );
      if (actors) return actors[1];
      const author = window.match(
        /"author"\s*:\s*\{\s*"__typename"\s*:\s*"User"\s*,\s*"id"\s*:\s*"(\d+)"/
      );
      if (author) return author[1];
    }
  }
  return null;
}

function parseCommentsFromHtml(html) {
  const marker = '__typename":"Comment"';
  const comments = [];
  let idx = 0;

  while ((idx = html.indexOf(marker, idx)) !== -1) {
    const snip = html.slice(idx, idx + 2500);
    const window = html.slice(Math.max(0, idx - 1500), idx + 2500);

    const cid =
      snip.match(/"id":"((?:comment|Y29t|ZmVl)[^"]+)"/)?.[1] ||
      snip.match(/"id":"([^"]+)"/)?.[1] ||
      null;
    const body = window.match(/"body":\{"text":"((?:\\.|[^"\\])*)"/)?.[1];
    const author = window.match(
      /"author":\{"__typename":"User","id":"(\d+)","name":"((?:\\.|[^"\\])*)"/
    );

    const message = body ? decodeJsString(body).trim() : "";
    if (!message) {
      idx += marker.length;
      continue;
    }

    // Skip root feedback-looking nodes without author when message already seen
    comments.push({
      id: cid,
      message,
      author_id: author ? author[1] : null,
      author: author ? decodeJsString(author[2]) : null,
    });
    idx += marker.length;
  }

  return dedupeComments(comments);
}

function dedupeComments(comments) {
  const uniq = [];
  const seen = new Set();
  const messagesWithAuthor = new Set();

  for (const c of comments) {
    const key = `${c.author_id || c.author || ""}|${c.message}`;
    if (seen.has(key)) continue;
    if (!c.author && !c.author_id && messagesWithAuthor.has(c.message)) continue;
    seen.add(key);
    if (c.author || c.author_id) messagesWithAuthor.add(c.message);
    uniq.push(c);
  }
  return uniq;
}

function walkComments(obj, out, depth = 0) {
  if (depth > 30 || obj == null) return;
  if (Array.isArray(obj)) {
    for (const v of obj) walkComments(v, out, depth + 1);
    return;
  }
  if (typeof obj !== "object") return;

  const body =
    (obj.body && typeof obj.body === "object" && obj.body.text) ||
    (obj.preferred_body && typeof obj.preferred_body === "object" && obj.preferred_body.text) ||
    null;

  let author = null;
  for (const key of ["author", "comment_author", "actor"]) {
    const a = obj[key];
    if (a && typeof a === "object" && a.name) {
      author = { id: a.id || null, name: a.name };
      break;
    }
  }

  if (body && typeof body === "string" && body.trim() && (author || obj.id)) {
    out.push({
      id: obj.id || null,
      message: body.trim(),
      author_id: author?.id || null,
      author: author?.name || null,
    });
  }

  for (const v of Object.values(obj)) walkComments(v, out, depth + 1);
}

async function fetchCommentsGraphql({
  cookie,
  tokens,
  feedbackId,
  docIds,
  cursor = null,
  postUrl,
  count = 50,
}) {
  const variables = {
    commentsIntentToken: "RANKED_UNFILTERED_CHRONOLOGICAL_REPLIES_INTENT_V1",
    feedLocation: "DEDICATED_COMMENTING_SURFACE",
    feedbackSource: 2,
    focusCommentID: null,
    scale: 1,
    useDefaultActor: false,
    id: feedbackId,
    __relay_internal__pv__IsWorkUserrelayprovider: false,
    // Relay page size — thiếu count thì FB thường chỉ trả vài comment/page
    count,
    first: count,
  };
  if (cursor) {
    variables.cursor = cursor;
    variables.after = cursor;
  }

  const userId = tokens.userId || cookie.match(/c_user=(\d+)/)?.[1] || "0";

  for (const docId of docIds) {
    const body = new URLSearchParams({
      av: userId,
      __user: userId,
      __a: "1",
      __req: "1",
      dpr: "1",
      __ccg: "EXCELLENT",
      __comet_req: "15",
      fb_dtsg: tokens.dtsg || "",
      jazoest: tokens.jazoest || "2",
      fb_api_caller_class: "RelayModern",
      fb_api_req_friendly_name: "CommentsListComponentsPaginationQuery",
      variables: JSON.stringify(variables),
      server_timestamps: "true",
      doc_id: docId,
    });
    if (tokens.lsd) body.set("lsd", tokens.lsd);

    const headers = {
      "User-Agent": DESKTOP_UA,
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookie,
      Origin: "https://www.facebook.com",
      Referer: postUrl,
      "x-fb-friendly-name": "CommentsListComponentsPaginationQuery",
      Accept: "*/*",
    };
    if (tokens.lsd) headers["x-fb-lsd"] = tokens.lsd;

    const res = await fetch("https://www.facebook.com/api/graphql/", {
      method: "POST",
      headers,
      body,
    });
    const text = await res.text();
    if (
      text.includes("was not found") ||
      (text.includes("CRITICAL") && text.length < 400)
    ) {
      continue;
    }

    const parsed = [];
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        walkComments(JSON.parse(trimmed), parsed);
      } catch {
        /* ignore non-json line */
      }
    }
    if (parsed.length === 0) {
      // try whole body
      try {
        walkComments(JSON.parse(text), parsed);
      } catch {
        /* ignore */
      }
    }

    // next cursor (best-effort)
    const nextCursor =
      text.match(/"end_cursor"\s*:\s*"([^"]+)"/)?.[1] ||
      text.match(/"cursor"\s*:\s*"([^"]+)"/)?.[1] ||
      null;
    const hasNext =
      /"has_next_page"\s*:\s*true/.test(text) || Boolean(nextCursor && parsed.length > 0);

    if (parsed.length > 0) {
      return {
        comments: dedupeComments(parsed),
        docId,
        nextCursor: hasNext ? nextCursor : null,
      };
    }
  }

  return { comments: [], docId: null, nextCursor: null };
}

/**
 * Fetch post + ít nhất ~50 bình luận chữ (cap MAX_COMMENTS).
 * @throws {Error} with code IMAGE_ONLY | FETCH_FAILED | ...
 */
export async function scrapeFacebookPost(postUrl, cookie) {
  let url = postUrl.trim();
  if (/\/share\//i.test(url)) {
    const resolved = await resolveShareUrl(url);
    if (!resolved) {
      const err = new Error("Không resolve được share URL");
      err.code = "RESOLVE_FAILED";
      throw err;
    }
    url = resolved;
  }

  const res = await fetch(url, {
    headers: desktopHeaders(cookie),
    redirect: "follow",
  });
  const html = await res.text();

  if (!res.ok || html.length < 5000 || /Sorry, something went wrong/i.test(html)) {
    const err = new Error(
      `Facebook trả về trang lỗi/blocked (HTTP ${res.status}, len=${html.length}). Kiểm tra FB_COOKIE (c_user+xs) từ Chrome desktop.`
    );
    err.code = "FETCH_FAILED";
    throw err;
  }

  const postId = extractPostIdFromUrl(url) || extractPostIdFromUrl(res.url) || null;
  const content = extractPostContent(html, postId).trim();

  if (!content) {
    const err = new Error(
      "Bài viết không có nội dung chữ (chỉ ảnh/video hoặc không đọc được text). Dừng."
    );
    err.code = "IMAGE_ONLY";
    throw err;
  }

  const authorId = extractPostAuthorId(html, postId);
  const tokens = extractTokens(html);
  if (!tokens.userId) {
    tokens.userId = cookie.match(/c_user=(\d+)/)?.[1] || null;
  }
  const feedbackId = extractFeedbackId(html, postId);
  const docIds = discoverCommentDocIds(html);

  let comments = parseCommentsFromHtml(html);
  let usedGraphql = false;

  if (comments.length < MAX_COMMENTS && feedbackId && tokens.dtsg) {
    let cursor = null;
    let workingDocIds = docIds;
    let stagnant = 0;
    for (
      let page = 0;
      page < MAX_COMMENT_PAGES && comments.length < MAX_COMMENTS;
      page++
    ) {
      const before = comments.length;
      const pageResult = await fetchCommentsGraphql({
        cookie,
        tokens,
        feedbackId,
        docIds: workingDocIds,
        cursor,
        postUrl: res.url || url,
        count: 50,
      });
      if (!pageResult.comments.length) {
        if (page === 0) {
          console.warn(
            "⚠ GraphQL không lấy thêm comment (doc_id có thể đổi). Dùng comment embed trong HTML."
          );
        }
        break;
      }
      usedGraphql = true;
      if (pageResult.docId) workingDocIds = [pageResult.docId, ...docIds];
      comments = dedupeComments([...comments, ...pageResult.comments]);
      if (comments.length <= before) {
        stagnant += 1;
        if (stagnant >= 2) break;
      } else {
        stagnant = 0;
      }
      cursor = pageResult.nextCursor;
      if (!cursor) break;
    }
  } else if (comments.length < MAX_COMMENTS && !feedbackId) {
    console.warn("⚠ Không tìm thấy feedback_id — chỉ dùng comment trong HTML.");
  }

  // Keep only text comments, cap MAX_COMMENTS
  comments = comments.filter((c) => c.message && c.message.trim()).slice(0, MAX_COMMENTS);

  if (comments.length < MIN_COMMENTS) {
    console.warn(
      `⚠ Chỉ lấy được ${comments.length}/${MIN_COMMENTS}+ comment. Bài có thể ít comment hoặc cookie/doc_id hạn chế.`
    );
  } else if (!usedGraphql && comments.length > 0 && comments.length < MAX_COMMENTS) {
    console.warn(
      `⚠ Lấy ${comments.length} comment chủ yếu từ HTML (chưa GraphQL đầy đủ).`
    );
  }

  return {
    postId: postId || "unknown",
    sourceUrl: res.url || url,
    content,
    authorId,
    comments,
    meta: {
      htmlLen: html.length,
      feedbackId,
      usedGraphql,
      commentCount: comments.length,
      minTarget: MIN_COMMENTS,
    },
  };
}
