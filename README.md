# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## Module 3 — Material Price Movement Analytics (demo)

Route: `/market-monitor` (card on the landing page). Code lives in `src/mpm/` and does not touch the other two modules.

Flow: **Trigger → Investigation → Evidence → Output**

1. **Live Monitor** – live price vs previous close for the watchlist (SBI Card, NSE, HDFC Bank, Infosys, Tata Motors). A move of ±threshold (default 3%) triggers the pipeline. Demo controls inject a spike / crash / official-news spike / market-wide fall.
2. **Alert** – trigger alert e-mailed to configured members.
3. **Data pull** – X, YouTube, Reddit, Telegram, stock forums, digital news, BSE announcements, SEBI / regulatory.
4. **AI identification & clustering** – rumour clusters with direction (positive / negative / neutral), confidence, credibility, propagation, timing correlation, duplicate detection; timeline of how the move happened; evidence log (source, link, timestamp, reach, AI relevance).
5. **Material movement assessment** – index-adjusted check, pre/post 9:30 window, disclosure check (NSE/SURV/62122, SEBI LODR Reg. 30(11)).
6. **Report** – shown on page, printable, auto-e-mailed and shareable by e-mail.

All market data, posts, links and e-mails are simulated (`src/mpm/mockData.js`). For production, replace:
- the tick simulator in `MpmContext.jsx` with a market-data websocket,
- `buildInvestigation()` with backend calls to news / social APIs + Azure OpenAI / Claude,
- `sendEmail()` with an SMTP / SendGrid / Azure Communication Services endpoint.
