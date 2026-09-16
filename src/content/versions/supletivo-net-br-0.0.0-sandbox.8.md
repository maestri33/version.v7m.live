---
module: "supletivo.net.br"
version: "0.0.0-sandbox.8"
date: "2026-09-16"
authorized_by: "Víctor"
commit: "fd81939"
summary: "Correção de versão do pnpm para v10 no CI e integração da captura Sofia"
type: "patch"
---

### Mudanças Técnicas
- Ajuste da versão do pnpm para v10 em `.github/workflows/ci.yml` resolvendo violação de política de supply-chain (release age).
- Integração do componente de captura de leads `SofiaLeadCapture` em substituição ao modal legado.
- Build estático verificado com 8 páginas geradas e 36 testes unitários passando com sucesso.
