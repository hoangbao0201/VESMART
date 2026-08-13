import { config } from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  isFacebookPostUrl,
  scrapeFacebookPost,
  validateCookie,
} from "./lib/facebook.js";
import { buildForumPayload } from "./lib/payload.js";
import { writeResult } from "./lib/output.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, ".env") });

function usage() {
  console.log(`Usage:
  node index.js "<facebook-group-post-url>"

Example:
  node index.js "https://www.facebook.com/groups/senbot.robothutbuilaunha/permalink/27696141106722062/"

Yêu cầu: file .env với FB_COOKIE (c_user + xs). Xem .env.example
`);
}

async function main() {
  const url = process.argv[2];
  if (!url) {
    usage();
    process.exit(1);
  }

  if (!isFacebookPostUrl(url)) {
    console.error("✗ URL không hợp lệ. Cần link bài Facebook (groups/.../posts|permalink/...).");
    process.exit(1);
  }

  const cookie = process.env.FB_COOKIE || "";
  const cookieErr = validateCookie(cookie);
  if (cookieErr) {
    console.error(`✗ ${cookieErr}`);
    console.error("  Copy cookie từ Chrome → Network → request facebook.com → Request Headers → cookie");
    console.error("  Rồi ghi vào auto-post-forum/.env (xem .env.example)");
    process.exit(1);
  }

  console.log("→ Đang lấy bài viết...");
  let scraped;
  try {
    scraped = await scrapeFacebookPost(url, cookie);
  } catch (err) {
    if (err.code === "IMAGE_ONLY") {
      console.error(`✗ ${err.message}`);
      process.exit(1);
    }
    console.error(`✗ ${err.message || err}`);
    process.exit(1);
  }

  const { postId, datapost, comments } = buildForumPayload(scraped);

  const outPath = writeResult(join(__dirname, "result"), {
    postId,
    datapost,
    comments,
  });

  console.log(`✓ Bài viết: ${datapost.content.slice(0, 80)}${datapost.content.length > 80 ? "..." : ""}`);
  console.log(`✓ Author (random): ${datapost.author_name}`);
  console.log(`✓ Comments: ${comments.length}`);
  console.log(`✓ Saved: ${outPath}`);
}

main();
