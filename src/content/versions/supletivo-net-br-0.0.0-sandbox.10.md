---
module: "supletivo.net.br"
version: "0.0.0-sandbox.10"
date: "2026-09-16"
authorized_by: "Víctor"
commit: "f1257ba"
summary: "Migração do deploy para Cloudflare Workers Static Assets e desacoplamento do runner self-hosted (Issue #5)"
type: "patch"
---

### Mudanças Técnicas
- Criação de `wrangler.jsonc` configurado para `assets` estáticos de `./dist` e rotas para `supletivo.net.br` e `www.supletivo.net.br`.
- Migração de `.github/workflows/deploy.yml` de runner `self-hosted` para `ubuntu-latest` utilizando `cloudflare/wrangler-action@v3`.
- Desoneração total da infraestrutura de VM/LXC Proxmox (CT 30100) para entrega na borda global Cloudflare Anycast com zero custo.
- Resolução da Issue #5 no repositório `supletivo.net.br`.
