---
module: "backend.supletivo.net.br"
version: "0.0.0-sandbox.10"
date: "2026-09-16"
authorized_by: "Víctor"
commit: "aeb5dd4"
summary: "Decouple biometric service to microservice, replace pypdfium2 with pypdf and introduce unified tasks facade with cron triggers"
type: "patch"
---

### Mudanças Técnicas
- Desacoplamento do motor biométrico InsightFace do monólito Django para microsserviço HTTP isolado (reduzindo imagem de 3.5GB para 180MB).
- Substituição completa de pypdfium2 por pypdf puro Python no processamento de PDFs para OCR multimodal.
- Criação de facade unificada de tarefas em core/tasks.py e endpoints dedicados de webhook para Cloudflare Cron Triggers em api/tools/router.py.
- Lançamento do Cloudflare Worker de Cron Triggers no domínio técnico oficial cron.v7m.live.
