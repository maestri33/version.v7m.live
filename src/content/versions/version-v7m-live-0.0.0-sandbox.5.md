---
module: "version.v7m.live"
version: "0.0.0-sandbox.5"
date: "2026-09-16"
authorized_by: "Víctor"
commit: "d4e5f6a"
summary: "Configured Cloudflare custom domain routing, disabled unused session runtime, and created GitHub Actions CI/CD"
type: "patch"
---

### Technical Changes
- Configured native custom domain route `version.v7m.live` in `wrangler.jsonc`.
- Disabled unused SSR session runtime (`session: false`) in `astro.config.mjs`, trimming worker bundle footprint and eliminating default KV namespace provisioning.
- Added automated GitHub Actions deployment pipeline in `.github/workflows/deploy.yml` with type checking, build validation, and Cloudflare deployment.
- Formalized ecosystem domain directive in `AGENTS.md` reserving `*.v7m.live` for developer tools/infrastructure and `*.supletivo.net.br` for business portals.
