---
module: "supletivo.net.br"
version: "0.0.0-sandbox.9"
date: "2026-09-16"
authorized_by: "Víctor"
commit: "0f8a1d1"
summary: "Reintegração da captura Sofia no Hero e conformidade total com testes E2E e WCAG 2A/AA"
type: "patch"
---

### Mudanças Técnicas
- Reintegração do `@astrojs/svelte` e do componente `SofiaLeadCapture` no `Hero.astro` com fallback `noscript`.
- Validação completa com Playwright (20/20 testes E2E passando, incluindo Módulo 11 de CPF, cópia de Pix e Axe WCAG 2A/AA com zero violações).
- Alinhamento de tokens CSS no `ProgressBar.astro` e `StickyCta.astro` com as variáveis oficiais de `DESIGN.md`.
