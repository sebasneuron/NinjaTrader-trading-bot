# Ninja Trade Bot

Semi-automated trading assistant for **NinjaTrader 8** that generates signals and supports manual confirmation with optional trade management. Connects to NinjaTrader via the **Automated Trading Interface (ATI)** or compatible REST/WebSocket gateways (e.g. CrossTrade).

## Features

- **Signal generation** – Configurable conditions (e.g. moving average crossover, order flow); real-time or simulated bar data
- **Alerts** – Visual/audio when conditions are met (console + optional sound)
- **Manual confirmation** – Pending signals queue; execute or reject from dashboard or API
- **Trade management** – Position monitoring, optional stop loss / profit target parameters
- **NinjaTrader integration** – REST client for ATI; mock client for development and tests
- **Web dashboard** – Pending signals, positions, live log; WebSocket for real-time updates
- **CLI** – Run assistant, serve dashboard, or print config

## Project structure

```
Ninja-trade-bot/
├── src/
│   ├── index.ts              # Entry point
│   ├── config/               # Configuration (env, schema)
│   ├── core/                 # Types, events, logger
│   ├── integration/
│   │   └── ninjatrader/      # ATI client (REST + mock)
│   ├── signals/              # Conditions, engine, alerts
│   ├── trade/                # Confirmation, position monitor, manager
│   ├── api/                  # Express server, routes, WebSocket
│   └── cli/                  # CLI parsing and config dump
├── tests/
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Requirements

- Node.js 18+
- NinjaTrader 8 with ATI enabled, or a compatible REST/Webhook gateway (e.g. [CrossTrade](https://crosstrade.io))

## Install

```bash
npm install
```

Copy `.env.example` to `.env` and set:

- `NINJATRADER_BASE_URL` – ATI or gateway URL (e.g. CrossTrade webhook base)
- `NINJATRADER_API_KEY` – If your gateway uses auth
- `PORT` – API/dashboard port (default 4000)

## Scripts

| Command        | Description                          |
|----------------|--------------------------------------|
| `npm run build`| Compile TypeScript to `dist/`        |
| `npm start`    | Run compiled app                     |
| `npm run dev`  | Run with ts-node                     |
| `npm run serve`| Run API server only (after build)    |
| `npm test`     | Run Jest tests                       |

## Usage

**Run assistant (signals + optional dashboard):**

```bash
npm run dev
# Or with dashboard on port 4000:
npm run dev -- --serve
```

**Mock NinjaTrader (no live connection):**

```bash
npm run dev -- --mock
npm run dev -- --serve --mock
```

**Print resolved config:**

```bash
npm run dev -- --config
```

**Dashboard**

With `--serve`, open `http://localhost:4000` for the web UI: pending signals (click to execute or reject), positions, and live log. WebSocket at `ws://localhost:4000/ws` streams signals and position updates.

## API (when running with `--serve`)

| Method | Path                      | Description           |
|--------|---------------------------|-----------------------|
| GET    | `/health`                 | Health check          |
| GET    | `/api/config`             | Current config        |
| GET    | `/api/signals/pending`    | Pending signals       |
| POST   | `/api/signals/confirm/:id`| Execute signal by id  |
| POST   | `/api/signals/reject/:id` | Reject signal         |
| GET    | `/api/account/positions`  | Positions             |
| GET    | `/api/account/summary`    | Account summary       |

## NinjaTrader connection

- **REST client** (`RestNinjaTraderClient`): expects an ATI-compatible HTTP API at `NINJATRADER_BASE_URL` with endpoints such as `GET /positions`, `GET /account`, `POST /order`. Use this with CrossTrade, a custom bridge, or NinjaTrader’s own API if available.
- **Mock client**: use `--mock` or set `NINJATRADER_ENABLED=false` so no real orders are sent; positions and account are simulated.

No official “ninjatrader-api” npm package is required; the app uses a small client interface that you can replace or extend for your broker/ATI.

## Configuration

See `.env.example`. Key options:

- **Strategy**: `DEFAULT_INSTRUMENT`, `MAX_POSITIONS`, `RISK_PER_TRADE_TICKS`, `REQUIRE_CONFIRMATION`, `AUTO_STOP_LOSS`, `AUTO_PROFIT_TARGET`, `STOP_LOSS_TICKS`, `PROFIT_TARGET_TICKS`
- **Signals**: `SIGNALS_ENABLED`, `ALERT_SOUND_ENABLED`, `FAST_MA_PERIOD`, `SLOW_MA_PERIOD`, `ORDER_FLOW_THRESHOLD`
- **Server**: `PORT`, `WS_PORT`

## Testing

```bash
npm test
```

Tests cover config loading, signal conditions (e.g. MA crossover), mock NinjaTrader client, and confirmation queue.

## License

MIT
