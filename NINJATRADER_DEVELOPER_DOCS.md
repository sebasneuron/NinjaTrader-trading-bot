# NinjaTrader Developer Documentation Summary

Summary of NinjaTrader’s developer docs (from web search and official sites). Use this as a quick reference; always confirm details on the official docs.

---

## 1. Official Developer Hubs

| Resource | URL |
|----------|-----|
| **Developer Community (get started)** | https://developer-d.ninjatrader.com/get-started |
| **Desktop docs (NinjaScript)** | https://developer.ninjatrader.com/docs/desktop/index |
| **Trader APIs (REST / Swagger)** | https://developer.ninjatrader.com/products/api |
| **Support / Help** | https://support.ninjatrader.com |

---

## 2. What You Can Build

- **Indicators** – Chart indicators in **C#** (Desktop) or **JavaScript** (Web).
- **Strategies** – Automated strategies: point-and-click (Strategy Builder) or **C#** (NinjaScript).
- **Add-Ons** – Full custom apps with **C# and WPF** on NinjaTrader’s .NET runtime.
- **Chart components** – Drawing tools, chart painting, custom bar types.
- **APIs** – REST APIs (Swagger) for data and trading (any language).

---

## 3. NinjaScript (Desktop – C#)

### What it is

- C#-based language for indicators, strategies, and tools inside NinjaTrader Desktop.
- Uses NinjaTrader-specific classes and methods for market data and trading.

### Docs structure (Desktop)

**Guides**

- Introduction, Best Practices, Distribution, NinjaScript Editor, Educational Resources, User-Based Vendor Licensing.

**Reference**

- **Common** – Shared types/utilities  
- **Strategy** / **StrategyBase** – Strategy base class and lifecycle  
- **Indicator** – Indicator base class  
- **Add On**, **Bars Type**, **Chart Style**, **Drawing Tools**, **Import Type**  
- **Market Analyzer Column**, **Optimization Fitness**, **Optimizer**, **Performance Metrics**  
- **Share Service**, **SuperDOM Column**, **SharpDX**

### Strategy lifecycle (NinjaScript)

- **OnStateChange()** – State transitions: `SetDefaults` → `Configure` → `DataLoaded` → `Historical` → `Realtime`.
- **OnBarUpdate()** – Called when bar data updates; main place for logic and signals.
- **Calculate** – `OnBarClose` (once per closed bar), `OnPriceChange`, or `OnEachTick`.
- **BarsInProgress** – Which data series triggered the current `OnBarUpdate()` (e.g. 0 = primary).
- **IsFirstTickOfBar** – Whether the current tick is the first of a new bar.

### Order / position API (conceptual)

- **EnterLong()** / **EnterShort()**, **ExitLong()** / **ExitShort()**
- **SetStopLoss()**, **SetProfitTarget()**, **SetTrailStop()**
- **Position** – Current position info.

(Exact signatures and overloads are in the [Strategy](https://developer.ninjatrader.com/docs/desktop/strategy) / [StrategyBase](https://developer.ninjatrader.com/docs/desktop/strategybase) reference.)

### Prerequisites

- NinjaTrader Desktop installed.
- Basic C# knowledge.
- NinjaScript Editor inside NinjaTrader for editing/compiling.

---

## 4. Trader APIs (REST / external apps)

- **Style** – REST APIs with **Swagger**; you can generate client code in many languages.
- **Data** – Real-time and historical market data via **WebSockets** (high-performance).
- **Trading** – Live trading and trade history; integrate NinjaTrader with third-party systems.
- **Auth** – Typically involves an **API key** and **CID** from an org admin (see official Quick Start for current method).

Use these when building **external** apps (e.g. your “Ninja-trade-bot”) that talk to NinjaTrader instead of running inside it.

---

## 5. Quick links from the docs

- [OnBarUpdate()](https://developer.ninjatrader.com/docs/desktop/onbarupdate) – Bar update handler.
- [StrategyBase](https://developer.ninjatrader.com/docs/desktop/strategybase) – Strategy base class.
- [Code Snippets](https://developer.ninjatrader.com/docs/desktop/code_snippets) – Snippet library.
- [Reference Samples](https://developer.ninjatrader.com/docs/desktop/reference_samples) – Sample code.
- [User-Based Licensing Quick Start](https://developer.ninjatrader.com/docs/desktop/user_based_licensing_quick_start_guide) – Vendor/add-on licensing.
- [Ecosystem API](https://developer.ninjatrader.com/docs/ecosystem) – Ecosystem/vendor API.

---

## 6. Community and samples

- **Forums** – [NinjaTrader Support Forum](https://discourse.ninjatrader.com/).
- **User App Share** – Open-source strategies/indicators for examples.
- **Ecosystem** – Publish or find strategies/indicators and vendor licensing.

---

## 7. For your “Ninja-trade-bot” project

- **If the bot runs inside NinjaTrader**  
  Use **NinjaScript**: Strategy (or Indicator) in C# in the NinjaScript Editor; follow the [Desktop docs](https://developer.ninjatrader.com/docs/desktop/index) and Strategy/StrategyBase references.

- **If the bot is an external app**  
  Use the **Trader APIs** (REST + WebSockets): [products/api](https://developer.ninjatrader.com/products/api), then the API Quick Start and Swagger for auth and endpoints.

I can help next with either a NinjaScript strategy skeleton or an external bot that uses the REST/WebSocket API.
