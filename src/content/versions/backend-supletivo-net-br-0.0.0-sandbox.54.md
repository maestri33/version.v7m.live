---
module: "backend.supletivo.net.br"
version: "0.0.0-sandbox.54"
date: "2026-09-29"
authorized_by: "Víctor"
commit: "c56df0a"
summary: "Contrato completo no checkout InfinitePay: envio de nome, telefone E.164, e-mail, CPF, webhook personalizado com order_nsu e redirect_url integrado ao app"
type: "patch"
---

### Mudanças Técnicas
- **Contrato Completo de Checkout InfinitePay**: O payload de criação (`POST /links`) agora envia os 5 parâmetros essenciais:
  1. `customer.name`: Nome completo do pagador / lead.
  2. `customer.phone_number`: Telefone no padrão internacional E.164 (`+55...`).
  3. `customer.email`: E-mail de contato do aluno.
  4. `customer.cpf`: CPF numérico (11 dígitos).
  5. `webhook_url`: Rota personalizada no gateway Cloudflare (`https://webhooks.v7m.live/bank/infinitepay?order_nsu=<uuid>`).
  6. `redirect_url`: Retorno para o app do aluno (`https://app.supletivo.net.br/student/lead?from=infinitepay&order_nsu=<uuid>`).
- **Lead Service**: Atualizado `_fill_card` em `users/roles/lead/service.py` para pré-preencher CPF e redirecionamento no app.
- **Validação E2E no Navegador**: Testado via Playwright Headless contra o endpoint oficial da InfinitePay, renderizando dados preenchidos e vínculo `$v7m`.
