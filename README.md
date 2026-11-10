# Anaya.ai — Autonomous AI Operations & Interactive Sandbox for WooCommerce

**Anaya.ai** is an agentic e-commerce operations showcase and interactive sandbox built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma + SQLite**, and the **Model Context Protocol (`@modelcontextprotocol/sdk`)**.

## Key Features

- **Brand Landing Page (`/`)**:
  - Sub-second uncached WooCommerce checkout positioning (`236ms` cart / `321ms` checkout) with an interactive **16x Flash-Sale Surge** simulator.
  - Interactive previews for **Revenue AI (Guards)**, **Builder AI (Ships)**, and **Analytics AI (Decides)**.
  - Isolated **DEV -> QA -> PROD** environment architecture, **BYOM (MCP)** client integration snippets, and **1x–16x** load surge benchmarks.
- **Interactive Sandbox Workbench (`/demo`)**:
  - **Built-in Demo Storefront**: Real products, cart drawer, and live `/?wc-ajax=checkout` simulation backed by SQLite.
  - **Fault & Chaos Injector**: Inject N+1 SQL queries, Payment Webhook 401 bugs, or Shipping API timeouts and resolve them via **Revenue AI** APM traces and auto-generated PR diffs.
  - **Builder AI**: Stage plain-English storefront updates in QA and promote them to Production to update the Demo Storefront live, with 1-click rollback.
  - **Catalog & SEO Auditor**: Flags Uncategorized SKUs, missing alt tags, and thin descriptions with 1-click metadata fixes.
  - **WooCommerce REST v3 Connector**: Test live connectivity against any WooCommerce store URL + Consumer Key/Secret or stay in local Sandbox mode.
- **Docs & Live MCP Playground (`/docs`, `/api/mcp`)**:
  - Standards-compliant JSON-RPC 2.0 Model Context Protocol endpoint and interactive browser playground.
- **Architecture Evaluation Form (`/contact`)**:
  - Persists migration requests in SQLite via `/api/contact`.

## Local Development

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Open `http://localhost:3000`.
