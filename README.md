# VESMART web monorepo

## Layout (outside fe/be)

| Path | Purpose |
|------|---------|
| `.cursor/rules/` | Agent rules (SEO blog, forum, deploy, auth) |
| `be/scripts/lib/` | Shared seed helpers (CTA, env, images) |
| `docs/` | Architecture notes (optional copies) |
| `deploy/` | VPS deploy scripts (**local only**, gitignored secrets) |

## Apps

- `fe/` — Next.js site (vesmart.vn)
- `be/` — NestJS API + Prisma

## Do not commit

- `.env*` (use `.env.example`)
- `deploy/*.log`, `deploy/*.tar.gz`, `deploy/*` secrets (VPS password, R2 keys)
- TLS: `OriginCertificate.txt`, `PrivateKey.txt`
- Google: `client_secret*.json`
- `tool-facebook/`, unrelated scrapers
- `project/` (legacy scaffold; not production)

## Production

- Site: https://vesmart.vn
- API: https://vesmart.vn/api/v1
- Deploy: Paramiko scripts under `deploy/` (never push passwords)
