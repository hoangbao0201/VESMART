import { createNameAssigner } from "./names.js";

/**
 * Map scraped FB post + comments → forum seed payload (VN display names).
 * @param {object} scraped - return value of scrapeFacebookPost
 * @param {{ namesPath?: string }} [options]
 */
export function buildForumPayload(scraped, options = {}) {
  const names = createNameAssigner(options.namesPath);
  const datapost = {
    author_name: names.assign(scraped.authorId || `post:${scraped.postId}`),
    content: scraped.content,
    source_url: scraped.sourceUrl,
  };
  const comments = (scraped.comments || []).map((c, i) => ({
    author_name: names.assign(c.author_id || c.author || `cmt:${i}`),
    content: c.message,
  }));
  return {
    postId: scraped.postId,
    datapost,
    comments,
  };
}
