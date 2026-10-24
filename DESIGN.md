---
version: alpha
name: version.v7m.live-oracle-design
description: "Design system specification for the version.v7m.live Platform Version Oracle. Deep dark authoritative interface (#0b1220) with high-contrast Brazilian-flag primary tokens, Archivo Black display, Inter typography, and Antigravity Zero-G glassmorphism."

colors:
  primary: "#ffc400"           # Yellow conversion & primary accent
  on-primary: "#0b1220"        # Dark text on yellow
  primary-hover: "#ffd75e"
  canvas: "#0b1220"            # Deep ink background
  surface-1: "#121d33"         # Ink soft for cards
  surface-2: "#001a52"         # Blue deep for prominent panels
  surface-light: "#ffffff"     # Pure paper
  hairline: "rgba(255, 255, 255, 0.12)"
  hairline-strong: "rgba(255, 255, 255, 0.20)"
  ink: "#0b1220"
  ink-light: "#ffffff"
  muted-on-dark: "#b9c3db"
  muted-on-light: "#49536a"
  brand-green: "#00734d"
  brand-green-deep: "#005238"
  brand-blue: "#002776"
  brand-blue-deep: "#001a52"
  semantic-danger: "#b91c1c"
  semantic-danger-bg: "#fee2e2"
  semantic-success: "#15803d"
  semantic-success-bg: "#dcfce7"
  semantic-warning: "#92400e"
  semantic-warning-bg: "#fef3c7"
  semantic-info: "#0369a1"
  semantic-info-bg: "#e0f2fe"

typography:
  display:
    fontFamily: "Archivo Black, system-ui, sans-serif"
    fontWeight: 400
    lineHeight: 1.08
  body:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontWeight: 400
    lineHeight: 1.50
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontWeight: 400
    lineHeight: 1.40

rounded:
  sm: 6px
  md: 10px
  card: 18px
  hero: 28px
  pill: 999px

spacing:
  section: "clamp(4.5rem, 3rem + 6vw, 9rem)"
  container: "68rem"
  container-narrow: "46rem"
  gutter: "clamp(1.25rem, 4vw, 2.5rem)"
---

# Design System — `version.v7m.live`

## 1. Princípios do Oráculo de Versão
1. **Autoridade e Verdade Única**: O oráculo de versão é a fonte primária de verdade (`Source of Truth`) de toda a plataforma Supletivo Brasil e ecossistema V7M. O design transmite precisão técnica, estabilidade e transparência.
2. **Contraste Auditado (WCAG AAA/AA)**: Textos técnicos, hashes e semver sobre fundos escuros (`#0b1220`) devem utilizar `--muted-on-dark` (`#b9c3db`) ou `--paper` (`#ffffff`), garantindo contraste superior a 7:1.
3. **Física Espacial (Antigravity Zero-G)**: Painéis com `backdrop-filter: blur(16px)` e sombras multicamadas (`--shadow-zero-g`), sem cortes abruptos.

## 2. Componentes Centrais

### Badge de Versão Ativa
- **Fundo**: `--glass-bg-dark` (`rgba(11, 18, 32, 0.75)`) com borda translúcida.
- **Tipografia**: SemVer em destaque com `Archivo Black` e cor `--yellow` (`#ffc400`).
- **Status Dot**: Indicador pulsante verde (`#15803d`) sinalizando saúde do oráculo.

### Cartão de Módulo da Plataforma
- **Fundo**: `--ink-soft` (`#121d33`) com hairline de 1px em `rgba(255, 255, 255, 0.12)`.
- **Raio de Borda**: 18px (`--radius`).
- **Hover**: Elevação sutil `translateY(-2px)` com transição `cubic-bezier(0.16, 1, 0.3, 1)`.

### Tabela de Histórico de Releases
- **Cabeçalho**: Fundo sutilmente escurecido, texto em caixa alta discreta (`uppercase`, `letter-spacing: 0.1em`).
- **Tipo de Release**:
  - `patch`: badge azul suave (`var(--blue-deep)`).
  - `minor`: badge verde esmeralda (`var(--green-deep)`).
  - `major`: badge amarelo solene (`var(--yellow)` com texto `--ink`).
