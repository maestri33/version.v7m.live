---
module: "notify.supletivo.net.br"
version: "0.0.0-sandbox.57"
date: "2026-10-05"
authorized_by: "Víctor"
commit: "377cb16"
summary: "Integração e homologação do Cloudflare Email Sending oficial: envio nativo de contato@v7m.org e contato@supletivo.net.br com SPF, DKIM e DMARC alinhados sem reescrita de remetente"
type: "patch"
---

### Mudanças Técnicas
- **Ativação do Cloudflare Email Sending**: Zonas `v7m.org` e `supletivo.net.br` integradas via Cloudflare REST API com suporte a subdomínios de bounce e seletores DKIM `cf-bounce` dedicados.
- **Micro-serviço Notify**: Módulo `mail/cloudflare_sending.py` e pipeline `notify/dispatch.py` atualizados para despachar via API oficial da Cloudflare, garantindo entrega confiável sem reescrita do cabeçalho `From:`.
- **Identidade e Validação**: Atualização da `MailIdentity` padrão para `contato@supletivo.net.br` e suporte a remetente dinâmico no payload de notificação. Disparos reais validados e confirmados na caixa postal de destino.
