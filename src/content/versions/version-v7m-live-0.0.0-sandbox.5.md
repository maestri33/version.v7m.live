---
module: "version.v7m.live"
version: "0.0.0-sandbox.5"
date: "2026-09-16"
authorized_by: "Víctor"
commit: "489fa4b"
summary: "Configuração de rota de domínio customizado na Cloudflare, otimização de runtime e CI/CD"
type: "patch"
---

### Mudanças Técnicas
- Configuração de rota com domínio customizado `version.v7m.live` no `wrangler.jsonc`.
- Desativação do runtime de sessão desnecessário (`session: false`) no `astro.config.mjs`, reduzindo o bundle e eliminando namespaces KV.
- Criação da pipeline de deploy automatizado via GitHub Actions em `.github/workflows/deploy.yml`.
- Formalização da diretriz de domínios `*.v7m.live` no `AGENTS.md`.
