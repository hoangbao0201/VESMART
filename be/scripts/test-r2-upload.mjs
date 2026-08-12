import { HeadBucketCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env");

for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (!m) continue;
  const key = m[1].trim();
  const value = m[2].trim().replace(/^['"]|['"]$/g, "");
  if (!process.env[key]) process.env[key] = value;
}

const accountId = process.env.R2_ACCOUNT_ID;
const bucket = process.env.R2_BUCKET;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

if (!accountId || !bucket || !accessKeyId || !secretAccessKey) {
  console.error("Missing R2 env vars");
  process.exit(1);
}

const client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

try {
  await client.send(new HeadBucketCommand({ Bucket: bucket }));
  console.log("HeadBucket: OK", bucket);
} catch (error) {
  console.error("HeadBucket FAIL:", error.name, error.message);
}

const key = `uploads/test/${Date.now()}-ping.png`;
try {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: png,
      ContentType: "image/png",
    }),
  );
  console.log("PutObject: OK");
  console.log("key=", key);
  if (process.env.R2_PUBLIC_URL) {
    console.log("publicUrl=", `${process.env.R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`);
  } else {
    console.log("R2_PUBLIC_URL is empty — set pub-*.r2.dev or custom domain for browser access");
  }
} catch (error) {
  console.error("PutObject FAIL:", error.name, error.message);
  process.exit(1);
}
