import { useState, useEffect, useMemo, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   DALIOS — AI TRADING ANALYST v4.0
   Systematic · Principled · All-Weather Framework
   
   Built on Ray Dalio's documented investment principles:
   ─ The Economic Machine (3 forces: productivity, short-term & long-term debt cycles)
   ─ The 4 Quadrants (growth × inflation matrix for asset allocation)
   ─ The Holy Grail of Investing (15+ uncorrelated return streams = 80% risk reduction)
   ─ All Weather Portfolio (risk parity: 30% stocks, 40% LT bonds, 15% IT bonds, 7.5% gold, 7.5% commodities)
   ─ Risk Parity (weight by risk contribution, not capital)
   ─ Pain + Reflection = Progress (systematic post-mortems on every trade)
   ─ Radical Transparency (all data, all reasoning, fully visible)
   ─ 3 Rules: Don't let debt rise faster than income; Don't let income rise faster than productivity; Do everything to raise productivity
   ─ The Holy Grail Chart: with 15-20 uncorrelated return streams, reduce risk by 5x without reducing returns
   ─ "Don't bet against hot trends" — follow momentum until data says otherwise
   ─ Systematic Decision-Making: 99% algorithmic, codified rules over gut feelings
   ─ Independent Thinking: consensus is priced in; to outperform, think differently AND be right
   ═══════════════════════════════════════════════════════════════════════════ */

const T = {
  bg: "#080a10", s1: "#0e1018", s2: "#151821", s3: "#1c2030",
  bd: "rgba(255,255,255,0.06)", bd2: "rgba(255,255,255,0.12)",
  acc: "#00e87b", acc2: "#00c9ff", warn: "#f5a623", danger: "#ff2d55", purple: "#7b61ff",
  t1: "#e4e8f1", t2: "rgba(255,255,255,0.55)", t3: "rgba(255,255,255,0.3)", t4: "rgba(255,255,255,0.14)",
};



const DALIO = {
  SYS: { name: "Systematic", w: 0.15, desc: "99% algorithmic. Codified rules over gut feelings. Every decision follows documented criteria.", rule: "Build a system. Shoot from the hip and you make all classic mistakes." },
  RPR: { name: "Risk Parity", w: 0.15, desc: "Weight positions by risk contribution, not capital. Balance across economic environments.", rule: "A stock carries more risk/dollar than a bond. Equalize risk, not dollars." },
  DIV: { name: "Holy Grail", w: 0.18, desc: "15+ uncorrelated return streams = 80% risk reduction. The single most important principle.", rule: "Making a handful of good uncorrelated bets, balanced and leveraged well, is the surest way to have upside without unacceptable downside." },
  ECM: { name: "Econ Machine", w: 0.15, desc: "3 forces: productivity growth, short-term debt cycle (5-8yr), long-term debt cycle (75-100yr).", rule: "Know your environment. Don't predict — prepare for all 4 quadrants." },
  PRG: { name: "Pain=Progress", w: 0.12, desc: "Every mistake is data. Diagnose root causes. Document lessons. Develop new principles.", rule: "Pain + Reflection = Progress. Those who fail well deserve more respect than those who succeed." },
  RAD: { name: "Transparency", w: 0.10, desc: "All data visible. No hidden assumptions. Idea meritocracy: best idea wins regardless of source.", rule: "Radical transparency and radical open-mindedness are invaluable for rapid learning." },
  MOM: { name: "Follow Trends", w: 0.08, desc: "Don't prematurely bet against hot trends. Markets continue longer than expected.", rule: "Follow momentum until data says otherwise. Consensus is already priced in." },
  IND: { name: "Think Different", w: 0.07, desc: "To outperform, think independently AND be right. Contrarian views grounded in data.", rule: "To make money you must be an independent thinker who bets against the consensus and is right." },
};

// Dalio's 4 Economic Quadrants — assets that perform well in each
const QUADRANTS = {
  Q1: { name: "Rising Growth + Rising Inflation", color: "#ff6b35", assets: ["OIL", "GOLD", "NATGAS", "WHEAT", "BTC"], bestFor: "Commodities, TIPS, EM stocks, crypto" },
  Q2: { name: "Rising Growth + Falling Inflation", color: T.acc, assets: ["NVDA", "AAPL", "TSLA", "ETH", "SOL", "ARM", "RDDT"], bestFor: "Stocks, corporate bonds, growth assets" },
  Q3: { name: "Falling Growth + Rising Inflation", color: T.danger, assets: ["GOLD", "SILVER", "OIL"], bestFor: "Gold, commodities, inflation-linked bonds — STAGFLATION" },
  Q4: { name: "Falling Growth + Falling Inflation", color: T.acc2, assets: ["GOLD", "SILVER"], bestFor: "Long-term bonds, gold — DEFLATION/RECESSION" },
};

// All Weather Portfolio target allocation
const ALL_WEATHER = {
  stocks: { pct: 30, label: "Stocks", color: T.acc, desc: "Growth during expansion" },
  ltBonds: { pct: 40, label: "Long-Term Bonds", color: T.acc2, desc: "Stability, deflation hedge" },
  itBonds: { pct: 15, label: "Intermed Bonds", color: T.purple, desc: "Income, moderate duration" },
  gold: { pct: 7.5, label: "Gold", color: T.warn, desc: "Inflation hedge, crisis safe haven" },
  commodities: { pct: 7.5, label: "Commodities", color: "#ff6b35", desc: "Inflation protection" },
};

// Dalio's 3 Rules of Thumb
const THREE_RULES = [
  { rule: "Don't let debt rise faster than income", desc: "Debt burdens will eventually crush you. Monitor debt-to-income at all levels.", icon: "⚖" },
  { rule: "Don't let income rise faster than productivity", desc: "You'll eventually become uncompetitive. Sustainable growth = productivity growth.", icon: "📈" },
  { rule: "Do everything to raise productivity", desc: "This is what matters most in the long run. Productivity is the real engine.", icon: "⚡" },
];

const seed = (s) => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
const genHistory = (base, vol, days = 120, s = 42) => {
  const rng = seed(s + base * 1000); const data = []; let price = base; const now = Date.now();
  for (let i = days; i >= 0; i--) {
    const drift = (rng() - 0.485) * vol;
    price = Math.max(price * (1 + drift / 100), base * 0.2);
    const high = price * (1 + rng() * vol * 0.003), low = price * (1 - rng() * vol * 0.003);
    data.push({ date: new Date(now - i * 864e5).toISOString().slice(0, 10), open: +(price * (1 + (rng() - 0.5) * vol * 0.002)).toFixed(4), high: +high.toFixed(4), low: +low.toFixed(4), close: +price.toFixed(4), price: +price.toFixed(4), volume: Math.floor(rng() * 8e6 + 2e6) });
  }
  for (let i = 0; i < data.length; i++) {
    data[i].sma20 = i >= 19 ? +(data.slice(i - 19, i + 1).reduce((s, d) => s + d.close, 0) / 20).toFixed(4) : null;
    data[i].sma50 = i >= 49 ? +(data.slice(i - 49, i + 1).reduce((s, d) => s + d.close, 0) / 50).toFixed(4) : null;
    if (i >= 14) { let a = 0; for (let j = i - 13; j <= i; j++) a += Math.max(data[j].high - data[j].low, Math.abs(data[j].high - data[j - 1].close), Math.abs(data[j].low - data[j - 1].close)); data[i].atr14 = +(a / 14).toFixed(4); }
    if (i >= 14) { let g = 0, l = 0; for (let j = i - 13; j <= i; j++) { const d = data[j].close - data[j - 1].close; d > 0 ? g += d : l -= d; } data[i].rsi14 = +(100 - 100 / (1 + (l === 0 ? 100 : g / l))).toFixed(1); }
    if (i >= 19) { const sl = data.slice(i - 19, i + 1).map(d => d.close); const m = sl.reduce((a, b) => a + b, 0) / 20; const sd = Math.sqrt(sl.reduce((a, b) => a + (b - m) ** 2, 0) / 20); data[i].bbUpper = +(m + 2 * sd).toFixed(4); data[i].bbLower = +(m - 2 * sd).toFixed(4); data[i].bbMid = +m.toFixed(4); }
  }
  return data;
};

const ASSETS = {
  crypto: { label: "Crypto", icon: "◈", items: [
    { id: "BTC", name: "Bitcoin", base: 67420, vol: 3.2, sector: "L1", s: 11 }, { id: "ETH", name: "Ethereum", base: 3520, vol: 4.1, sector: "L1", s: 22 },
    { id: "BNB", name: "BNB", base: 580, vol: 3.0, sector: "L1", s: 56 }, { id: "SOL", name: "Solana", base: 142, vol: 5.8, sector: "L1", s: 33 },
    { id: "XRP", name: "XRP", base: 0.62, vol: 4.8, sector: "Payment", s: 57 }, { id: "ADA", name: "Cardano", base: 0.45, vol: 5.1, sector: "L1", s: 58 },
    { id: "DOGE", name: "Dogecoin", base: 0.082, vol: 6.5, sector: "Meme", s: 59 }, { id: "AVAX", name: "Avalanche", base: 35.6, vol: 5.2, sector: "L1", s: 55 },
    { id: "DOT", name: "Polkadot", base: 6.8, vol: 4.9, sector: "L0", s: 60 }, { id: "TRX", name: "TRON", base: 0.12, vol: 3.8, sector: "L1", s: 300 },
    { id: "LINK", name: "Chainlink", base: 14.2, vol: 4.5, sector: "Oracle", s: 44 }, { id: "TON", name: "Toncoin", base: 5.8, vol: 5.2, sector: "L1", s: 337 },
    { id: "MATIC", name: "Polygon", base: 0.72, vol: 5.3, sector: "L2", s: 61 }, { id: "SHIB", name: "Shiba Inu", base: 0.0000092, vol: 7.8, sector: "Meme", s: 301 },
    { id: "UNI", name: "Uniswap", base: 7.2, vol: 5.0, sector: "DeFi", s: 62 }, { id: "LTC", name: "Litecoin", base: 72, vol: 4.0, sector: "Payment", s: 302 },
    { id: "BCH", name: "Bitcoin Cash", base: 245, vol: 4.5, sector: "Payment", s: 303 }, { id: "ATOM", name: "Cosmos", base: 8.9, vol: 4.7, sector: "L0", s: 64 },
    { id: "FIL", name: "Filecoin", base: 5.4, vol: 5.5, sector: "Storage", s: 304 }, { id: "APT", name: "Aptos", base: 8.2, vol: 5.8, sector: "L1", s: 305 },
    { id: "NEAR", name: "NEAR", base: 5.1, vol: 5.6, sector: "L1", s: 306 }, { id: "ICP", name: "Internet Computer", base: 12.5, vol: 5.2, sector: "L1", s: 307 },
    { id: "ETC", name: "Ethereum Classic", base: 25, vol: 4.8, sector: "L1", s: 308 }, { id: "AAVE", name: "Aave", base: 92, vol: 4.6, sector: "DeFi", s: 63 },
    { id: "ARB", name: "Arbitrum", base: 1.12, vol: 5.5, sector: "L2", s: 65 }, { id: "OP", name: "Optimism", base: 2.1, vol: 5.4, sector: "L2", s: 165 },
    { id: "SUI", name: "Sui", base: 1.35, vol: 6.8, sector: "L1", s: 166 }, { id: "SEI", name: "Sei", base: 0.38, vol: 7.2, sector: "L1", s: 167 },
    { id: "TIA", name: "Celestia", base: 8.5, vol: 6.0, sector: "Modular", s: 168 }, { id: "PEPE", name: "Pepe", base: 0.0000085, vol: 9.5, sector: "Meme", s: 169 },
    { id: "INJ", name: "Injective", base: 22, vol: 6.2, sector: "DeFi", s: 309 }, { id: "FET", name: "Fetch.ai", base: 1.5, vol: 7.0, sector: "AI", s: 310 },
    { id: "RNDR", name: "Render", base: 7.2, vol: 6.5, sector: "AI", s: 311 }, { id: "GRT", name: "The Graph", base: 0.22, vol: 5.8, sector: "Infra", s: 312 },
    { id: "STX", name: "Stacks", base: 2.1, vol: 5.9, sector: "L2", s: 313 }, { id: "IMX", name: "Immutable", base: 1.8, vol: 6.2, sector: "Gaming", s: 314 },
    { id: "MKR", name: "Maker", base: 2800, vol: 4.2, sector: "DeFi", s: 315 }, { id: "THETA", name: "Theta", base: 1.2, vol: 5.5, sector: "Video", s: 316 },
    { id: "FTM", name: "Fantom", base: 0.42, vol: 6.0, sector: "L1", s: 317 }, { id: "ALGO", name: "Algorand", base: 0.18, vol: 5.3, sector: "L1", s: 318 },
    { id: "XLM", name: "Stellar", base: 0.11, vol: 4.5, sector: "Payment", s: 319 }, { id: "SAND", name: "The Sandbox", base: 0.42, vol: 6.5, sector: "Metaverse", s: 320 },
    { id: "MANA", name: "Decentraland", base: 0.38, vol: 6.3, sector: "Metaverse", s: 321 }, { id: "AXS", name: "Axie Infinity", base: 7.2, vol: 6.8, sector: "Gaming", s: 322 },
    { id: "CRV", name: "Curve", base: 0.55, vol: 6.0, sector: "DeFi", s: 323 }, { id: "LDO", name: "Lido DAO", base: 2.1, vol: 5.5, sector: "LSD", s: 324 },
    { id: "SNX", name: "Synthetix", base: 2.8, vol: 5.8, sector: "DeFi", s: 325 }, { id: "COMP", name: "Compound", base: 52, vol: 5.0, sector: "DeFi", s: 326 },
    { id: "DYDX", name: "dYdX", base: 2.5, vol: 6.2, sector: "DEX", s: 327 }, { id: "ENS", name: "ENS", base: 12, vol: 5.5, sector: "Infra", s: 328 },
    { id: "WLD", name: "Worldcoin", base: 2.8, vol: 7.5, sector: "AI", s: 329 }, { id: "BONK", name: "Bonk", base: 0.000012, vol: 10, sector: "Meme", s: 330 },
    { id: "WIF", name: "dogwifhat", base: 1.8, vol: 9.0, sector: "Meme", s: 331 }, { id: "JUP", name: "Jupiter", base: 0.85, vol: 6.8, sector: "DEX", s: 332 },
    { id: "PYTH", name: "Pyth Network", base: 0.38, vol: 6.5, sector: "Oracle", s: 333 }, { id: "TAO", name: "Bittensor", base: 380, vol: 7.2, sector: "AI", s: 334 },
    { id: "PENDLE", name: "Pendle", base: 4.5, vol: 6.8, sector: "DeFi", s: 335 }, { id: "ENA", name: "Ethena", base: 0.72, vol: 7.0, sector: "DeFi", s: 336 },
    { id: "KAS", name: "Kaspa", base: 0.12, vol: 6.5, sector: "L1", s: 338 }, { id: "RUNE", name: "THORChain", base: 4.2, vol: 6.0, sector: "DeFi", s: 339 },
    { id: "FLOKI", name: "Floki", base: 0.00015, vol: 8.5, sector: "Meme", s: 340 }, { id: "CFX", name: "Conflux", base: 0.18, vol: 6.8, sector: "L1", s: 341 },
    { id: "1INCH", name: "1inch", base: 0.38, vol: 5.8, sector: "DEX", s: 342 }, { id: "CAKE", name: "PancakeSwap", base: 2.5, vol: 5.5, sector: "DEX", s: 343 },
    { id: "GALA", name: "Gala", base: 0.028, vol: 7.2, sector: "Gaming", s: 344 }, { id: "BLUR", name: "Blur", base: 0.35, vol: 7.0, sector: "NFT", s: 345 },
    { id: "ORDI", name: "ORDI", base: 42, vol: 7.5, sector: "BRC20", s: 346 }, { id: "ZRO", name: "LayerZero", base: 3.2, vol: 6.5, sector: "Infra", s: 347 },
    { id: "W", name: "Wormhole", base: 0.52, vol: 6.8, sector: "Bridge", s: 348 }, { id: "STRK", name: "Starknet", base: 1.2, vol: 6.5, sector: "L2", s: 349 },
    { id: "NOT", name: "Notcoin", base: 0.008, vol: 8.5, sector: "Gaming", s: 350 }, { id: "IO", name: "io.net", base: 2.8, vol: 7.0, sector: "AI", s: 351 },
    { id: "ZK", name: "zkSync", base: 0.18, vol: 7.2, sector: "L2", s: 352 }, { id: "EIGEN", name: "EigenLayer", base: 3.5, vol: 6.8, sector: "Restaking", s: 353 },
    // Memecoins
    { id: "APU", name: "Apu Apustaja", base: 0.00032, vol: 12, sector: "Meme", s: 700 }, { id: "BRETT", name: "Brett", base: 0.085, vol: 11, sector: "Meme", s: 701 },
    { id: "MOG", name: "Mog Coin", base: 0.0000018, vol: 11.5, sector: "Meme", s: 702 }, { id: "TURBO", name: "Turbo", base: 0.0045, vol: 10.5, sector: "Meme", s: 703 },
    { id: "NEIRO", name: "Neiro", base: 0.0012, vol: 11, sector: "Meme", s: 704 }, { id: "POPCAT", name: "Popcat", base: 0.65, vol: 10, sector: "Meme", s: 705 },
    { id: "MEW", name: "cat in a dogs world", base: 0.0035, vol: 10.5, sector: "Meme", s: 706 }, { id: "BOME", name: "Book of Meme", base: 0.008, vol: 10, sector: "Meme", s: 707 },
    { id: "MYRO", name: "Myro", base: 0.08, vol: 11, sector: "Meme", s: 708 }, { id: "SLERF", name: "Slerf", base: 0.22, vol: 12, sector: "Meme", s: 709 },
    { id: "TRUMP", name: "MAGA (Trump)", base: 4.5, vol: 13, sector: "Meme", s: 710 }, { id: "PNUT", name: "Peanut", base: 0.015, vol: 11.5, sector: "Meme", s: 711 },
    { id: "GIGA", name: "GigaChad", base: 0.012, vol: 12, sector: "Meme", s: 712 }, { id: "SPX", name: "SPX6900", base: 0.55, vol: 11, sector: "Meme", s: 713 },
    { id: "MICHI", name: "Michi", base: 0.12, vol: 10.5, sector: "Meme", s: 714 }, { id: "GOAT", name: "Goatseus Maximus", base: 0.35, vol: 11.5, sector: "Meme", s: 715 },
    { id: "FARTCOIN", name: "Fartcoin", base: 0.85, vol: 13, sector: "Meme", s: 716 }, { id: "AI16Z", name: "ai16z", base: 0.95, vol: 12, sector: "Meme", s: 717 },
    { id: "BABYDOGE", name: "Baby Doge", base: 0.0000000015, vol: 10, sector: "Meme", s: 718 }, { id: "LADYS", name: "Milady", base: 0.0000001, vol: 11, sector: "Meme", s: 719 },
    { id: "XMR", name: "Monero", base: 165, vol: 3.5, sector: "Privacy", s: 720 }, { id: "ZEC", name: "Zcash", base: 25, vol: 4.5, sector: "Privacy", s: 721 },
    { id: "DASH", name: "Dash", base: 28, vol: 4.0, sector: "Payments", s: 722 }, { id: "XTZ", name: "Tezos", base: 0.85, vol: 4.8, sector: "L1", s: 723 },
  ]},
  commodities: { label: "Commodities", icon: "⬡", items: [
    { id: "GOLD", name: "Gold", base: 2340, vol: 1.2, sector: "Precious", s: 66 }, { id: "SILVER", name: "Silver", base: 28.5, vol: 2.1, sector: "Precious", s: 77 },
    { id: "OIL", name: "Crude Oil", base: 78.4, vol: 2.8, sector: "Energy", s: 88 }, { id: "NATGAS", name: "Nat Gas", base: 2.14, vol: 4.5, sector: "Energy", s: 99 },
    { id: "WHEAT", name: "Wheat", base: 5.82, vol: 3.1, sector: "Agri", s: 110 }, { id: "COPPER", name: "Copper", base: 4.35, vol: 2.4, sector: "Industrial", s: 111 },
    { id: "URANIUM", name: "Uranium", base: 82, vol: 3.8, sector: "Energy", s: 112 }, { id: "LITHIUM", name: "Lithium", base: 14.2, vol: 5.5, sector: "Industrial", s: 113 },
    { id: "COFFEE", name: "Coffee", base: 182, vol: 3.2, sector: "Agri", s: 114 }, { id: "PLAT", name: "Platinum", base: 1020, vol: 2.0, sector: "Precious", s: 115 },
    { id: "COCOA", name: "Cocoa", base: 8200, vol: 4.8, sector: "Agri", s: 116 }, { id: "SOYBEAN", name: "Soybeans", base: 11.8, vol: 2.8, sector: "Agri", s: 117 },
    { id: "PALLAD", name: "Palladium", base: 985, vol: 2.5, sector: "Precious", s: 400 }, { id: "CORN", name: "Corn", base: 4.52, vol: 2.6, sector: "Agri", s: 401 },
    { id: "COTTON", name: "Cotton", base: 0.82, vol: 2.8, sector: "Agri", s: 402 }, { id: "SUGAR", name: "Sugar", base: 0.22, vol: 3.0, sector: "Agri", s: 403 },
    { id: "IRON", name: "Iron Ore", base: 118, vol: 3.2, sector: "Industrial", s: 404 }, { id: "NICKEL", name: "Nickel", base: 16800, vol: 3.5, sector: "Industrial", s: 405 },
    { id: "TIN", name: "Tin", base: 25200, vol: 2.8, sector: "Industrial", s: 406 }, { id: "ZINC", name: "Zinc", base: 2650, vol: 2.5, sector: "Industrial", s: 407 },
    { id: "LMBER", name: "Lumber", base: 545, vol: 4.2, sector: "Industrial", s: 408 }, { id: "BRENT", name: "Brent Crude", base: 82.5, vol: 2.6, sector: "Energy", s: 410 },
    { id: "COBALT", name: "Cobalt", base: 28500, vol: 4.0, sector: "Industrial", s: 411 }, { id: "RARE", name: "Rare Earths", base: 340, vol: 3.8, sector: "Industrial", s: 412 },
  ]},
  usEquities: { label: "US Equities", icon: "△", items: [
    { id: "NVDA", name: "NVIDIA", base: 875, vol: 4.2, sector: "Semi", s: 121 }, { id: "TSLA", name: "Tesla", base: 178, vol: 5.5, sector: "Auto", s: 132 },
    { id: "AAPL", name: "Apple", base: 192, vol: 1.8, sector: "Tech", s: 143 }, { id: "MSFT", name: "Microsoft", base: 420, vol: 1.6, sector: "Tech", s: 200 },
    { id: "AMZN", name: "Amazon", base: 185, vol: 2.5, sector: "Tech", s: 201 }, { id: "GOOGL", name: "Alphabet", base: 155, vol: 2.2, sector: "Tech", s: 202 },
    { id: "META", name: "Meta", base: 505, vol: 3.2, sector: "Tech", s: 203 }, { id: "JPM", name: "JPMorgan", base: 198, vol: 1.5, sector: "Finance", s: 204 },
    { id: "V", name: "Visa", base: 280, vol: 1.3, sector: "Finance", s: 205 }, { id: "JNJ", name: "J&J", base: 155, vol: 1.0, sector: "Health", s: 206 },
    { id: "AMD", name: "AMD", base: 158, vol: 4.8, sector: "Semi", s: 207 }, { id: "COIN", name: "Coinbase", base: 225, vol: 5.8, sector: "Crypto", s: 208 },
    { id: "DIS", name: "Disney", base: 112, vol: 2.5, sector: "Media", s: 420 }, { id: "NFLX", name: "Netflix", base: 625, vol: 3.0, sector: "Media", s: 421 },
    { id: "CRM", name: "Salesforce", base: 265, vol: 2.8, sector: "SaaS", s: 422 }, { id: "BA", name: "Boeing", base: 185, vol: 3.5, sector: "Aerospace", s: 423 },
    { id: "GS", name: "Goldman Sachs", base: 425, vol: 2.2, sector: "Finance", s: 424 }, { id: "INTC", name: "Intel", base: 32, vol: 4.5, sector: "Semi", s: 425 },
    { id: "UBER", name: "Uber", base: 72, vol: 3.2, sector: "Tech", s: 426 }, { id: "SQ", name: "Block/Square", base: 68, vol: 4.5, sector: "Fintech", s: 427 },
    { id: "PLTR", name: "Palantir", base: 22, vol: 5.5, sector: "AI", s: 428 }, { id: "SNOW", name: "Snowflake", base: 155, vol: 4.2, sector: "Cloud", s: 429 },
  ]},
  euEquities: { label: "EU Equities", icon: "△", items: [
    { id: "ASML", name: "ASML", base: 920, vol: 3.2, sector: "Semi", s: 210 }, { id: "LVMH", name: "LVMH", base: 785, vol: 2.1, sector: "Luxury", s: 211 },
    { id: "SAP", name: "SAP", base: 195, vol: 2.0, sector: "Tech", s: 212 }, { id: "NOVO", name: "Novo Nordisk", base: 125, vol: 3.5, sector: "Pharma", s: 213 },
    { id: "SHELL", name: "Shell", base: 32, vol: 1.8, sector: "Energy", s: 214 }, { id: "NESN", name: "Nestle", base: 98, vol: 1.2, sector: "Consumer", s: 215 },
    { id: "SIE", name: "Siemens", base: 188, vol: 1.9, sector: "Industrial", s: 216 }, { id: "AZN", name: "AstraZeneca", base: 125, vol: 1.7, sector: "Pharma", s: 217 },
    { id: "BAYER", name: "Bayer", base: 28, vol: 3.2, sector: "Pharma", s: 440 }, { id: "ADIDAS", name: "Adidas", base: 215, vol: 2.5, sector: "Consumer", s: 441 },
    { id: "DANONE", name: "Danone", base: 58, vol: 1.5, sector: "Consumer", s: 442 }, { id: "AIRBUS", name: "Airbus", base: 155, vol: 2.2, sector: "Aerospace", s: 443 },
    { id: "TOTALN", name: "TotalEnergies", base: 62, vol: 1.8, sector: "Energy", s: 444 }, { id: "INFN", name: "Infineon", base: 35, vol: 3.5, sector: "Semi", s: 445 },
    { id: "UBS", name: "UBS Group", base: 28, vol: 2.0, sector: "Finance", s: 446 }, { id: "SPOT", name: "Spotify", base: 285, vol: 3.8, sector: "Tech", s: 447 },
  ]},
  asx: { label: "ASX", icon: "🦘", items: [
    { id: "BHP", name: "BHP Group", base: 45.2, vol: 2.5, sector: "Mining", s: 500 }, { id: "CBA", name: "CommBank", base: 128.5, vol: 1.5, sector: "Finance", s: 501 },
    { id: "CSL", name: "CSL Ltd", base: 285, vol: 1.8, sector: "Biotech", s: 502 }, { id: "WBC", name: "Westpac", base: 26.8, vol: 1.8, sector: "Finance", s: 503 },
    { id: "NAB", name: "NAB", base: 35.4, vol: 1.6, sector: "Finance", s: 504 }, { id: "ANZ", name: "ANZ Group", base: 28.9, vol: 1.7, sector: "Finance", s: 505 },
    { id: "FMG", name: "Fortescue", base: 18.5, vol: 3.5, sector: "Mining", s: 506 }, { id: "WDS", name: "Woodside", base: 27.3, vol: 2.8, sector: "Energy", s: 507 },
    { id: "RIO", name: "Rio Tinto", base: 118.5, vol: 2.2, sector: "Mining", s: 508 }, { id: "MQG", name: "Macquarie", base: 195, vol: 2.0, sector: "Finance", s: 509 },
    { id: "TLS", name: "Telstra", base: 3.95, vol: 1.2, sector: "Telecom", s: 510 }, { id: "WES", name: "Wesfarmers", base: 62.8, vol: 1.5, sector: "Retail", s: 511 },
    { id: "WOW", name: "Woolworths", base: 32.5, vol: 1.3, sector: "Retail", s: 512 }, { id: "ALL", name: "Aristocrat", base: 42, vol: 2.5, sector: "Gaming", s: 513 },
    { id: "COL", name: "Coles", base: 18.2, vol: 1.2, sector: "Retail", s: 514 }, { id: "GMG", name: "Goodman Group", base: 28.5, vol: 2.2, sector: "REIT", s: 515 },
    { id: "TCL", name: "Transurban", base: 13.2, vol: 1.0, sector: "Infra", s: 516 }, { id: "REA", name: "REA Group", base: 185, vol: 2.8, sector: "Tech", s: 517 },
    { id: "XRO", name: "Xero", base: 128, vol: 3.0, sector: "SaaS", s: 518 }, { id: "STO", name: "Santos", base: 7.2, vol: 2.8, sector: "Energy", s: 519 },
    { id: "MIN", name: "Mineral Resources", base: 52, vol: 4.2, sector: "Mining", s: 520 }, { id: "PME", name: "Pro Medicus", base: 112, vol: 3.5, sector: "Health", s: 521 },
    { id: "JHX", name: "James Hardie", base: 48, vol: 2.5, sector: "Industrial", s: 522 }, { id: "SGP", name: "Stockland", base: 4.8, vol: 1.8, sector: "REIT", s: 523 },
    { id: "SHL", name: "Sonic Healthcare", base: 28, vol: 1.5, sector: "Health", s: 524 }, { id: "QAN", name: "Qantas", base: 6.5, vol: 2.8, sector: "Aviation", s: 525 },
    { id: "RHM", name: "Rheinmetall (ASX)", base: 58, vol: 3.8, sector: "Defence", s: 530 }, { id: "BSL", name: "BlueScope Steel", base: 20, vol: 3.2, sector: "Steel", s: 531 },
    { id: "S32", name: "South32", base: 3.8, vol: 3.5, sector: "Mining", s: 532 }, { id: "NHC", name: "New Hope Coal", base: 5.2, vol: 3.8, sector: "Coal", s: 533 },
    { id: "WHC", name: "Whitehaven Coal", base: 7.5, vol: 4.0, sector: "Coal", s: 534 }, { id: "LYC", name: "Lynas Rare Earths", base: 7.2, vol: 4.5, sector: "Rare Earths", s: 535 },
    { id: "PLS", name: "Pilbara Minerals", base: 3.5, vol: 5.0, sector: "Lithium", s: 536 }, { id: "LTR", name: "Liontown Resources", base: 1.2, vol: 5.5, sector: "Lithium", s: 537 },
    { id: "IGO", name: "IGO Limited", base: 6.8, vol: 4.0, sector: "Lithium", s: 538 }, { id: "AZJ", name: "Aurizon", base: 3.8, vol: 1.8, sector: "Rail", s: 539 },
    { id: "WTC", name: "WiseTech Global", base: 82, vol: 3.2, sector: "Tech", s: 540 }, { id: "CPU", name: "Computershare", base: 27, vol: 2.5, sector: "Fintech", s: 541 },
    { id: "ORI", name: "Orica", base: 17, vol: 2.0, sector: "Chemicals", s: 542 }, { id: "ILU", name: "Iluka Resources", base: 7.5, vol: 3.5, sector: "Mining", s: 543 },
    { id: "DRR", name: "Deterra Royalties", base: 4.5, vol: 2.2, sector: "Mining", s: 544 }, { id: "EVN", name: "Evolution Mining", base: 3.8, vol: 4.2, sector: "Gold", s: 545 },
    { id: "NST", name: "Northern Star", base: 13, vol: 3.8, sector: "Gold", s: 546 }, { id: "NEM", name: "Newmont (ASX)", base: 52, vol: 3.0, sector: "Gold", s: 547 },
    { id: "ALD", name: "Ampol", base: 32, vol: 2.5, sector: "Energy", s: 548 }, { id: "ORG", name: "Origin Energy", base: 9.5, vol: 2.2, sector: "Energy", s: 549 },
    { id: "APX", name: "Appen", base: 1.8, vol: 6.0, sector: "AI/Data", s: 550 }, { id: "MP1", name: "Megaport", base: 10, vol: 4.5, sector: "Tech", s: 551 },
    { id: "SEK", name: "SEEK", base: 24, vol: 2.8, sector: "Tech", s: 552 }, { id: "CAR", name: "CAR Group", base: 35, vol: 2.5, sector: "Tech", s: 553 },
    { id: "ALX", name: "Atlas Arteria", base: 5.5, vol: 1.5, sector: "Infra", s: 554 }, { id: "TWE", name: "Treasury Wine", base: 12, vol: 2.8, sector: "Consumer", s: 555 },
  ]},
  asiaEquities: { label: "Asia", icon: "🌏", items: [
    { id: "TSM", name: "TSMC", base: 142, vol: 2.8, sector: "Semi", s: 600 }, { id: "BABA", name: "Alibaba", base: 78, vol: 4.5, sector: "Tech", s: 601 },
    { id: "TCEHY", name: "Tencent", base: 42, vol: 3.5, sector: "Tech", s: 602 }, { id: "SONY", name: "Sony", base: 88, vol: 2.2, sector: "Tech", s: 604 },
    { id: "TM", name: "Toyota", base: 185, vol: 1.8, sector: "Auto", s: 605 }, { id: "SAMSUNG", name: "Samsung", base: 58, vol: 2.5, sector: "Tech", s: 606 },
    { id: "INFY", name: "Infosys", base: 18, vol: 2.2, sector: "IT", s: 607 }, { id: "RELIANCE", name: "Reliance Ind.", base: 28, vol: 2.0, sector: "Conglomerate", s: 608 },
    { id: "SFTBK", name: "SoftBank", base: 68, vol: 3.8, sector: "Invest", s: 609 }, { id: "NIO", name: "NIO", base: 5.2, vol: 6.5, sector: "EV", s: 610 },
    { id: "GRAB", name: "Grab", base: 3.5, vol: 5.0, sector: "Tech", s: 611 }, { id: "SE", name: "Sea Ltd", base: 52, vol: 5.2, sector: "Tech", s: 612 },
    { id: "MELI", name: "MercadoLibre", base: 1680, vol: 3.2, sector: "Ecomm", s: 613 }, { id: "HDFC", name: "HDFC Bank", base: 15.8, vol: 2.0, sector: "Finance", s: 614 },
  ]},
  ipo: { label: "IPO Pipeline", icon: "🚀", items: [
    { id: "RDDT", name: "Reddit", base: 62, vol: 6.2, sector: "Social", s: 154 }, { id: "ARM", name: "ARM Holdings", base: 132, vol: 4.8, sector: "Semi", s: 155 },
    { id: "STRIPE", name: "Stripe (Pre)", base: 70, vol: 7.0, sector: "Fintech", s: 220 }, { id: "SHEIN", name: "Shein (Pre)", base: 45, vol: 8.0, sector: "Retail", s: 221 },
    { id: "DBRX", name: "Databricks (Pre)", base: 55, vol: 6.5, sector: "AI/Data", s: 222 }, { id: "KLARNA", name: "Klarna", base: 22, vol: 5.8, sector: "Fintech", s: 223 },
    { id: "CANVA", name: "Canva (Pre)", base: 38, vol: 5.5, sector: "SaaS", s: 224 }, { id: "PLAID", name: "Plaid (Pre)", base: 15, vol: 6.0, sector: "Fintech", s: 225 },
    { id: "FIGMA", name: "Figma (Pre)", base: 12.5, vol: 5.5, sector: "Design", s: 650 }, { id: "DISCORD", name: "Discord (Pre)", base: 15, vol: 6.0, sector: "Social", s: 651 },
    { id: "EPIC", name: "Epic Games (Pre)", base: 32, vol: 5.8, sector: "Gaming", s: 652 }, { id: "SPACEX", name: "SpaceX (Pre)", base: 180, vol: 6.5, sector: "Space", s: 653 },
  ]},
  polymarket: { label: "Predictions", icon: "◎", items: [
    { id: "FEDCUT", name: "Fed Rate Cut \'26", base: 0.62, vol: 8, sector: "Macro", s: 176 }, { id: "BTC100K", name: "Bitcoin >$100K", base: 0.45, vol: 12, sector: "Crypto", s: 187 },
    { id: "RECESS", name: "US Recession", base: 0.31, vol: 10, sector: "Macro", s: 198 }, { id: "AGI27", name: "AGI by 2027", base: 0.18, vol: 15, sector: "Tech", s: 209 },
  ]},
};

// ─── BROKER INTEGRATION ────────────────────────────────────────────────────
const BROKERS = {
  // ── Crypto Exchanges ──────────────────────────────
  binance: { name: "Binance", type: "crypto", region: "Global", url: "https://api.binance.com", endpoints: { price: "/api/v3/ticker/price", order: "/api/v3/order", balance: "/api/v3/account", klines: "/api/v3/klines" }, fields: ["apiKey", "apiSecret"], desc: "World's largest crypto exchange. Spot, futures, margin. Free API, 1200 req/min.", signup: "binance.com/en/my/settings/api-management" },
  coinbase: { name: "Coinbase", type: "crypto", region: "US/EU/AU", url: "https://api.coinbase.com", endpoints: { price: "/v2/prices", order: "/v2/trades", balance: "/v2/accounts" }, fields: ["apiKey", "apiSecret"], desc: "Regulated US exchange. Spot trading. Advanced Trade for lower fees.", signup: "coinbase.com/settings/api" },
  kraken: { name: "Kraken", type: "crypto", region: "Global", url: "https://api.kraken.com", endpoints: { price: "/0/public/Ticker", order: "/0/private/AddOrder", balance: "/0/private/Balance" }, fields: ["apiKey", "apiSecret"], desc: "Established exchange. Spot, margin, futures. Strong security track record.", signup: "kraken.com/u/settings/api" },
  bybit: { name: "Bybit", type: "crypto", region: "Global", url: "https://api.bybit.com", endpoints: { price: "/v5/market/tickers", order: "/v5/order/create", balance: "/v5/account/wallet-balance" }, fields: ["apiKey", "apiSecret"], desc: "Top derivatives exchange. Spot, perpetual, options. Unified API v5.", signup: "bybit.com/app/user/api-management" },
  okx: { name: "OKX", type: "crypto", region: "Global", url: "https://www.okx.com", endpoints: { price: "/api/v5/market/ticker", order: "/api/v5/trade/order", balance: "/api/v5/account/balance" }, fields: ["apiKey", "apiSecret", "passphrase"], desc: "Major exchange. Spot, perps, options, earn. Requires passphrase.", signup: "okx.com/account/my-api" },
  kucoin: { name: "KuCoin", type: "crypto", region: "Global", url: "https://api.kucoin.com", endpoints: { price: "/api/v1/market/orderbook/level1", order: "/api/v1/orders", balance: "/api/v1/accounts" }, fields: ["apiKey", "apiSecret", "passphrase"], desc: "Altcoin-rich exchange. 800+ pairs. Requires passphrase for API.", signup: "kucoin.com/account/api" },
  gateio: { name: "Gate.io", type: "crypto", region: "Global", url: "https://api.gateio.ws", endpoints: { price: "/api/v4/spot/tickers", order: "/api/v4/spot/orders", balance: "/api/v4/spot/accounts" }, fields: ["apiKey", "apiSecret"], desc: "Wide altcoin selection. 1700+ pairs. Spot, margin, futures.", signup: "gate.io/myaccount/api_key_manage" },
  bitget: { name: "Bitget", type: "crypto", region: "Global", url: "https://api.bitget.com", endpoints: { price: "/api/v2/spot/market/tickers", order: "/api/v2/spot/trade/place-order", balance: "/api/v2/spot/account/assets" }, fields: ["apiKey", "apiSecret", "passphrase"], desc: "Copy trading leader. Spot & futures. Growing fast.", signup: "bitget.com/account/newapi" },
  // ── Stock & Multi-Asset Brokers ────────────────────
  alpaca: { name: "Alpaca", type: "equities", region: "US", url: "https://paper-api.alpaca.markets", endpoints: { price: "/v2/stocks", order: "/v2/orders", balance: "/v2/account" }, fields: ["apiKey", "apiSecret"], paper: true, desc: "Commission-free US stocks + crypto. Free paper trading. Best dev API.", signup: "alpaca.markets/sign-up" },
  ibkr: { name: "Interactive Brokers", type: "multi", region: "Global", url: "https://localhost:5000", endpoints: { price: "/v1/api/md/snapshot", order: "/v1/api/iserver/account/orders", balance: "/v1/api/portfolio/accounts" }, fields: ["apiKey", "apiSecret"], desc: "135+ markets, 33 countries. Stocks, options, futures, forex, bonds. REST + WebSocket. Requires Client Portal Gateway.", signup: "interactivebrokers.com/en/trading/ib-api.php" },
  tradier: { name: "Tradier", type: "equities", region: "US", url: "https://api.tradier.com", endpoints: { price: "/v1/markets/quotes", order: "/v1/accounts/{id}/orders", balance: "/v1/user/profile" }, fields: ["apiKey"], desc: "US stocks & options. Simple REST API. Free sandbox. $0 stock trades.", signup: "developer.tradier.com" },
  oanda: { name: "OANDA", type: "forex", region: "Global", url: "https://api-fxpractice.oanda.com", endpoints: { price: "/v3/instruments/{id}/candles", order: "/v3/accounts/{id}/orders", balance: "/v3/accounts/{id}" }, fields: ["apiKey"], desc: "Premier forex broker. 70+ currency pairs. REST API v20. Free practice account.", signup: "oanda.com/apply/demo" },
  // ── Australian Brokers ─────────────────────────────
  swyftx: { name: "Swyftx", type: "crypto", region: "Australia", url: "https://api.swyftx.com.au", endpoints: { price: "/markets/info/basic", order: "/orders", balance: "/user/balance" }, fields: ["apiKey"], desc: "Australian crypto exchange. 350+ assets. AUD pairs. ASIC regulated.", signup: "swyftx.com/profile/api" },
  btcmarkets: { name: "BTC Markets", type: "crypto", region: "Australia", url: "https://api.btcmarkets.net", endpoints: { price: "/v3/markets/{id}/ticker", order: "/v3/orders", balance: "/v3/accounts/me/balances" }, fields: ["apiKey", "apiSecret"], desc: "Australia's longest-running crypto exchange. AUD pairs. AUSTRAC registered.", signup: "btcmarkets.net/account/apikey" },
  coinspot: { name: "CoinSpot", type: "crypto", region: "Australia", url: "https://www.coinspot.com.au/api", endpoints: { price: "/ro/latest", order: "/my/buy", balance: "/my/balances" }, fields: ["apiKey", "apiSecret"], desc: "Popular Australian exchange. 400+ coins. AUD deposits. AUSTRAC registered.", signup: "coinspot.com.au/my/api" },
};

// Broker execution (framework — real impl connects to actual APIs)
const executeBrokerOrder = async (brokerKey, cfg, order) => {
  const b = BROKERS[brokerKey];
  if (!b) return { success: false, error: "Unknown broker" };
  // In production: POST to b.url + b.endpoints.order with auth headers
  return { success: true, orderId: `SIM_${Date.now()}`, broker: b.name, ...order, simulated: true };
};

// ─── MARKOWITZ PORTFOLIO OPTIMIZER ─────────────────────────────────────────
const markowitz = (assets, corrMatrix, targetReturn) => {
  // Mean-variance optimization (simplified closed-form for small portfolios)
  const n = assets.length;
  if (n < 2) return assets.map(a => ({ id: a.id, weight: 1 / n }));
  const returns = assets.map(a => a.mR / 30 || 0); // daily expected return
  const vols = assets.map(a => (a.vol || 20) / Math.sqrt(252)); // daily vol
  // Build covariance matrix from correlation + vols
  const cov = assets.map((a, i) => assets.map((b, j) => {
    const corr = i === j ? 1 : (corrMatrix[a.id]?.[b.id] || 0);
    return corr * vols[i] * vols[j];
  }));
  // Equal risk contribution as starting point (risk parity — Dalio's approach)
  const riskParity = assets.map((a, i) => {
    const invVol = 1 / (vols[i] || 0.01);
    return invVol;
  });
  const rpSum = riskParity.reduce((s, v) => s + v, 0);
  const rpWeights = riskParity.map(v => +(v / rpSum).toFixed(4));
  // Min-variance portfolio (analytical for 2 assets, numerical approx for N)
  // Use inverse-variance weighting as proxy for min-var
  const invVar = assets.map((_, i) => 1 / (cov[i][i] || 0.0001));
  const ivSum = invVar.reduce((s, v) => s + v, 0);
  const mvWeights = invVar.map(v => +(v / ivSum).toFixed(4));
  // Max Sharpe approximation: tilt toward higher return/vol ratio
  const sharpes = assets.map((a, i) => (returns[i] || 0) / (vols[i] || 0.01));
  const posSharpes = sharpes.map(s => Math.max(s, 0.001));
  const shSum = posSharpes.reduce((s, v) => s + v, 0);
  const msWeights = posSharpes.map(v => +(v / shSum).toFixed(4));
  // All Weather comparison
  const awMap = { crypto: 0.15, commodities: 0.075, usEquities: 0.15, euEquities: 0.15, ipo: 0.05, polymarket: 0.025 };
  // Portfolio metrics
  const calcPortMetrics = (w) => {
    const ret = w.reduce((s, wi, i) => s + wi * (returns[i] || 0), 0) * 252;
    let variance = 0;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) variance += w[i] * w[j] * cov[i][j];
    const vol = Math.sqrt(variance) * Math.sqrt(252);
    const sharpe = vol > 0 ? ret / vol : 0;
    return { ret: +(ret * 100).toFixed(2), vol: +(vol * 100).toFixed(1), sharpe: +sharpe.toFixed(3) };
  };
  return {
    riskParity: { weights: rpWeights.map((w, i) => ({ id: assets[i].id, w })), ...calcPortMetrics(rpWeights) },
    minVariance: { weights: mvWeights.map((w, i) => ({ id: assets[i].id, w })), ...calcPortMetrics(mvWeights) },
    maxSharpe: { weights: msWeights.map((w, i) => ({ id: assets[i].id, w })), ...calcPortMetrics(msWeights) },
  };
};

// ─── FULL DALIO BACKTEST ENGINE ────────────────────────────────────────────
const runFullBacktest = (allHist, cfg, days = 500) => {
  // Simulate running the Dalio scoring engine over history
  const results = [];
  let equity = cfg.portfolio;
  let peak = equity;
  let maxDD = 0;
  let wins = 0, losses = 0;
  const equityCurve = [{ day: 0, equity }];
  // Sample every 5 days over the history length
  const histLen = Math.min(days, Object.values(allHist)[0]?.length || 120);
  for (let d = 60; d < histLen - 5; d += 5) {
    // Find best signal at day d
    let bestAsset = null, bestSig = 0;
    Object.entries(allHist).forEach(([id, hist]) => {
      if (d >= hist.length - 5) return;
      const slice = hist.slice(0, d + 1);
      if (slice.length < 30) return;
      const L = slice[slice.length - 1];
      const sma20 = slice.length >= 20 ? slice.slice(-20).reduce((s, x) => s + x.close, 0) / 20 : null;
      const sma50 = slice.length >= 50 ? slice.slice(-50).reduce((s, x) => s + x.close, 0) / 50 : null;
      const rsi = L.rsi14 || 50;
      const mR = slice.length > 30 ? (L.close - slice[slice.length - 31].close) / slice[slice.length - 31].close * 100 : 0;
      const trend = sma20 && sma50 && sma20 > sma50;
      // Simple Dalio signal: trend + RSI + momentum
      const sig = (trend ? 30 : -10) + (rsi < 35 ? 20 : rsi > 70 ? -15 : 5) + Math.min(15, Math.max(-15, mR));
      if (sig > bestSig) { bestSig = sig; bestAsset = { id, entry: L.close, exitIdx: d + 5 }; }
    });
    if (bestAsset && bestAsset.exitIdx < (allHist[bestAsset.id]?.length || 0)) {
      const exitPrice = allHist[bestAsset.id][bestAsset.exitIdx].close;
      const ret = (exitPrice - bestAsset.entry) / bestAsset.entry;
      const posSize = equity * (cfg.maxRisk / 100) / (cfg.stopPct / 100);
      const pnl = posSize * ret;
      equity += pnl;
      peak = Math.max(peak, equity);
      const dd = (peak - equity) / peak * 100;
      maxDD = Math.max(maxDD, dd);
      if (pnl > 0) wins++; else losses++;
      results.push({ day: d, asset: bestAsset.id, entry: +bestAsset.entry.toFixed(2), exit: +exitPrice.toFixed(2), ret: +(ret * 100).toFixed(2), pnl: +pnl.toFixed(0), equity: +equity.toFixed(0) });
      equityCurve.push({ day: d, equity: +equity.toFixed(0) });
    }
  }
  const totalRet = ((equity - cfg.portfolio) / cfg.portfolio * 100);
  const winRate = wins + losses > 0 ? wins / (wins + losses) * 100 : 0;
  const avgWin = wins > 0 ? results.filter(r => r.pnl > 0).reduce((s, r) => s + r.ret, 0) / wins : 0;
  const avgLoss = losses > 0 ? results.filter(r => r.pnl <= 0).reduce((s, r) => s + r.ret, 0) / losses : 0;
  const profitFactor = avgLoss !== 0 ? Math.abs(avgWin * wins / (avgLoss * losses)) : 0;
  const sharpe = results.length > 1 ? (() => { const rets = results.map(r => r.ret); const m = rets.reduce((s, r) => s + r, 0) / rets.length; const sd = Math.sqrt(rets.reduce((s, r) => s + (r - m) ** 2, 0) / rets.length); return sd > 0 ? +(m / sd * Math.sqrt(52)).toFixed(2) : 0; })() : 0;
  return {
    trades: results.slice(-20), equityCurve, totalTrades: wins + losses,
    startEquity: cfg.portfolio, endEquity: +equity.toFixed(0), totalRet: +totalRet.toFixed(1),
    wins, losses, winRate: +winRate.toFixed(1), avgWin: +avgWin.toFixed(2), avgLoss: +avgLoss.toFixed(2),
    maxDD: +maxDD.toFixed(1), profitFactor: +profitFactor.toFixed(2), sharpe,
  };
};

const GEO = [
  // ── Active Conflicts & Military Operations ──────────
  { id: "G1", title: "Red Sea Shipping Crisis", sev: "CRITICAL", impact: ["OIL", "NATGAS", "GOLD", "BRENT"], dir: "bullish", desc: "Houthi Ansar Allah forces attacking commercial shipping in Bab el-Mandeb strait. 12% of global trade rerouting via Cape of Good Hope. +$1M/container extra cost. Insurance premiums 10x.", date: "2026-03-15", region: "Middle East", cat: "conflict" },
  { id: "G2", title: "US-China Chip Sanctions Escalation", sev: "CRITICAL", impact: ["NVDA", "AMD", "ARM", "ASML", "TSM", "INFN"], dir: "bearish", desc: "New CHIPS Act restrictions on H20/H200 exports. China retaliating with rare earth controls on gallium/germanium. ASML restricted from servicing installed base.", date: "2026-03-10", region: "Asia-Pacific", cat: "sanctions" },
  { id: "G4", title: "Ukraine-Russia Frontline Shifts", sev: "HIGH", impact: ["WHEAT", "NATGAS", "GOLD", "CORN", "URANIUM"], dir: "bullish", desc: "Heavy fighting around Zaporizhzhia. Black Sea grain corridor suspended. EU gas storage drawdown accelerating. Russian drone attacks on Ukrainian energy infrastructure.", date: "2026-03-12", region: "E. Europe", cat: "conflict" },
  { id: "G6", title: "Taiwan Strait Crisis", sev: "CRITICAL", impact: ["NVDA", "ARM", "AAPL", "TSM", "GOLD", "SAMSUNG"], dir: "mixed", desc: "PLA naval exercises encircling Taiwan. TSMC 3nm production at risk — supplies 90% of world's advanced chips. US carrier group deployed. Semiconductor supply chain 2-8 week disruption if escalates.", date: "2026-03-16", region: "Asia-Pacific", cat: "conflict" },
  { id: "G7", title: "Israel-Iran Proxy Escalation", sev: "HIGH", impact: ["OIL", "GOLD", "BRENT", "NATGAS"], dir: "bullish", desc: "Hezbollah rocket exchanges intensifying. Iranian IRGC naval movements in Strait of Hormuz. 21% of global oil transits through Hormuz. Brent risk premium +$8-15/barrel.", date: "2026-03-14", region: "Middle East", cat: "conflict" },
  { id: "G8", title: "Sudan Civil War — Humanitarian Crisis", sev: "HIGH", impact: ["GOLD", "WHEAT", "CORN"], dir: "bullish", desc: "RSF vs SAF fighting spreading to Darfur. Gold mining regions contested. 8M+ displaced. Agricultural production collapsed — regional food price inflation.", date: "2026-03-08", region: "Africa", cat: "conflict" },
  { id: "G9", title: "Myanmar Junta Collapse Accelerating", sev: "MEDIUM", impact: ["COPPER", "TIN", "NICKEL"], dir: "bullish", desc: "Resistance forces controlling 60%+ of territory. Rare earth and tin mining disrupted. China border trade affected. Regional instability impacting ASEAN supply chains.", date: "2026-03-11", region: "Asia-Pacific", cat: "conflict" },
  { id: "G10", title: "Sahel Region — Military Coups", sev: "MEDIUM", impact: ["URANIUM", "GOLD"], dir: "bullish", desc: "Mali/Burkina Faso/Niger military governments expelling French forces. Niger supplies 15% of EU uranium. Wagner/Africa Corps expanding operations. Gold mining permits revoked.", date: "2026-03-09", region: "Africa", cat: "conflict" },
  { id: "G11", title: "South China Sea Confrontation", sev: "HIGH", impact: ["OIL", "COPPER", "GOLD"], dir: "bullish", desc: "Philippine-China vessel collisions at Second Thomas Shoal. $5.3T annual trade transits SCS. US-PH mutual defense treaty activation risk. Shipping insurance rising.", date: "2026-03-13", region: "Asia-Pacific", cat: "conflict" },
  { id: "G12", title: "Ethiopian Tigray — Ceasefire Fragile", sev: "MEDIUM", impact: ["COFFEE", "GOLD"], dir: "mixed", desc: "Pretoria Agreement holding but Eritrean forces still present. Ethiopian coffee export disruptions ongoing. Afar region instability threatening Djibouti trade corridor.", date: "2026-03-07", region: "Africa", cat: "conflict" },
  // ── Sanctions & Economic Warfare ────────────────────
  { id: "G13", title: "Russia Sanctions — Energy Workarounds", sev: "HIGH", impact: ["OIL", "NATGAS", "BRENT", "GOLD"], dir: "bullish", desc: "Shadow fleet tankers operating via India/UAE. G7 price cap enforcement weakening. Russian oil flowing at $68-75/bbl above cap. EU 14th sanctions package targeting LNG.", date: "2026-03-14", region: "Global", cat: "sanctions" },
  { id: "G14", title: "Iran Nuclear Talks Breakdown", sev: "HIGH", impact: ["OIL", "GOLD", "URANIUM", "BRENT"], dir: "bullish", desc: "IAEA reports 84% enrichment detected. Snapback sanctions threat. Iranian oil exports 1.5M bpd could go to zero. Strait of Hormuz closure risk elevated.", date: "2026-03-11", region: "Middle East", cat: "sanctions" },
  // ── Defense & Military Spending ─────────────────────
  { id: "G15", title: "NATO 3% GDP Target", sev: "HIGH", impact: ["BA", "GOLD"], dir: "bullish", desc: "Members committing to 3% GDP defense spend by 2028. $400B+ new procurement. Rheinmetall, BAE, Lockheed order books full through 2030. European defense stocks +35% YTD.", date: "2026-03-10", region: "Europe", cat: "defense" },
  { id: "G16", title: "US Defense Budget $920B", sev: "MEDIUM", impact: ["BA", "PLTR", "GOLD"], dir: "bullish", desc: "FY2027 budget request includes AI/autonomous weapons surge. Palantir, Anduril, Shield AI contracts. Hypersonic missile production scaling.", date: "2026-03-12", region: "US", cat: "defense" },
  // ── Supply Chain & Trade Disruption ─────────────────
  { id: "G17", title: "Panama Canal Drought Crisis", sev: "MEDIUM", impact: ["OIL", "COPPER", "SOYBEAN", "CORN"], dir: "bullish", desc: "Water levels at historic lows. Daily transits reduced from 36 to 22. Commodity shipping delays 2-3 weeks. Rerouting costs +40%.", date: "2026-03-13", region: "Americas", cat: "supply" },
  { id: "G5", title: "OPEC+ Output Increase", sev: "MEDIUM", impact: ["OIL", "NATGAS", "BRENT"], dir: "bearish", desc: "Saudi signals +500K bpd Q3. Market share battle with US shale emerging. UAE pushing for higher quota.", date: "2026-03-14", region: "Global", cat: "energy" },
  { id: "G3", title: "EU MiCA Regulation", sev: "MEDIUM", impact: ["BTC", "ETH", "LINK"], dir: "bullish", desc: "Digital asset framework creating institutional on-ramp. Stablecoin rules clear. Exchange licensing underway.", date: "2026-03-08", region: "Europe", cat: "regulation" },
  { id: "G18", title: "Arctic Sea Route Militarization", sev: "MEDIUM", impact: ["NATGAS", "OIL", "NICKEL"], dir: "mixed", desc: "Russia deploying military assets along Northern Sea Route. Chinese icebreaker fleet expansion. New LNG shipping lanes cutting EU-Asia transit 40%. NATO surveillance missions.", date: "2026-03-15", region: "Arctic", cat: "conflict" },
];

// Conflict categories for filtering
const GEO_CATS = [
  { k: "all", l: "All", c: T.t1 }, { k: "conflict", l: "Active Conflicts", c: T.danger },
  { k: "sanctions", l: "Sanctions", c: T.warn }, { k: "defense", l: "Defense", c: T.purple },
  { k: "supply", l: "Supply Chain", c: T.acc2 }, { k: "energy", l: "Energy", c: T.acc },
  { k: "regulation", l: "Regulation", c: T.acc },
];

const WORLD=[
{c:"TZ",r:"af",d:"M570,253L581,259L585,263L583,268L585,270L585,272L585,275L588,279L585,280L581,281L578,282L574,282L571,278L570,276L566,275L563,274L562,273L559,268L559,265L559,262L561,260L562,258L561,257L562,256L561,253L565,253L570,253Z"},
{c:"CA",r:"na",d:"M152,114L133,95L104,67L138,54L173,61L209,62L226,50L252,56L247,70L238,91L270,104L278,77L308,82L330,106L297,116L311,126L293,120L270,129L260,131L254,120L228,114L152,114Z M270,49L282,51L290,53L301,58L307,62L314,66L302,66L301,69L308,74L297,73L304,78L287,74L280,70L271,71L283,68L286,63L280,60L274,56L268,56L248,55L244,52L242,47L249,47L260,45L270,49Z"},
{c:"US",r:"na",d:"M152,114L226,113L247,117L257,122L259,134L276,128L295,118L291,131L286,135L280,141L276,141L272,156L265,172L259,173L242,166L231,167L218,178L201,168L174,160L158,154L148,131L153,116L152,114Z M104,56L111,85L124,88L132,98L122,89L100,83L84,84L79,80L69,88L54,96L40,98L57,92L57,87L48,87L39,82L43,74L49,71L40,71L44,65L39,61L48,55L68,54L86,55L104,56Z"},
{c:"KZ",r:"ca",d:"M713,113L702,119L694,131L683,131L672,131L663,137L656,133L643,127L629,135L620,134L616,128L619,124L617,119L608,117L607,110L625,108L640,109L642,104L655,98L673,99L684,100L702,108L712,112L713,113Z"},
{c:"UZ",r:"ca",d:"M629,135L636,123L641,126L645,129L653,129L656,133L658,136L662,137L664,135L669,133L668,135L672,135L671,138L668,138L668,136L664,139L661,140L662,142L661,147L657,146L654,143L649,141L645,136L641,136L640,133L634,133L632,135L629,135Z"},
{c:"PG",r:"oc",d:"M856,257L861,259L866,261L867,262L869,264L869,265L874,267L874,268L872,269L873,271L875,272L877,275L878,275L878,276L880,277L879,277L882,279L880,280L879,279L877,279L874,278L872,276L871,275L869,272L866,271L864,272L862,273L862,275L860,276L859,275L856,275L856,266L856,257Z M883,266L882,267L881,268L879,268L877,267L876,266L876,265L878,266L880,265L880,264L881,265L882,265L883,264L884,263L884,262L886,262L886,264L885,265L884,265L883,266Z"},
{c:"ID",r:"sea",d:"M808,248L814,245L812,249L807,249L800,249L802,254L809,252L808,253L804,255L806,260L808,265L806,265L805,263L804,262L803,257L801,261L799,266L799,262L798,260L798,256L800,250L802,246L808,248Z M794,239L793,241L795,244L794,245L797,247L794,248L793,250L793,252L791,254L791,257L790,261L789,260L786,261L785,260L783,260L782,259L779,260L778,258L776,258L774,258L774,254L772,254L771,251L771,249L771,246L772,244L773,246L775,248L776,247L778,247L780,246L781,246L783,247L786,246L787,242L788,241L789,238L792,238L794,239Z"},
{c:"AR",r:"na",d:"M326,334L324,344L329,353L314,360L307,363L311,368L303,375L304,384L296,394L287,393L286,386L289,375L288,371L290,358L292,348L294,334L297,324L301,313L312,311L326,320L331,326L337,325L326,334Z M297,396L298,397L299,400L303,401L307,402L305,403L303,403L301,402L300,402L297,402L297,396Z"},
{c:"CL",r:"na",d:"M294,299L297,307L301,314L297,324L293,332L294,342L290,352L289,361L288,371L290,374L287,383L284,390L288,394L293,396L287,399L279,393L280,383L282,373L283,370L285,359L287,349L290,334L292,316L294,300L294,299Z M297,396L297,402L300,402L301,402L301,404L298,404L297,404L295,404L293,403L291,403L287,401L285,400L281,397L283,397L287,399L290,400L292,399L293,397L295,396L297,396Z"},
{c:"CD",r:"af",d:"M558,262L562,273L556,280L557,287L549,283L543,280L538,275L534,269L528,272L516,266L513,265L518,263L524,255L527,248L530,237L541,237L547,236L556,238L562,240L560,248L558,256L558,262Z"},
{c:"SO",r:"af",d:"M591,255L589,252L589,242L592,239L592,238L594,238L596,236L600,236L607,228L609,225L611,224L611,222L611,219L611,218L613,218L614,218L615,217L616,217L616,219L616,220L616,221L615,224L614,228L612,231L610,235L607,238L604,242L602,244L598,247L595,249L592,253L591,254L591,255Z"},
{c:"KE",r:"af",d:"M585,263L581,260L581,259L571,253L570,253L570,250L571,249L572,247L573,245L572,242L572,240L571,238L572,237L574,235L576,235L576,237L576,238L578,238L582,240L583,240L584,240L585,240L586,239L589,238L590,239L592,239L589,242L589,252L591,255L589,256L588,257L587,257L587,259L586,260L586,262L585,263Z"},
{c:"SD",r:"af",d:"M546,227L543,223L541,218L538,215L540,211L544,207L547,189L579,192L581,199L578,203L577,212L573,220L571,224L569,220L567,217L565,221L559,222L555,224L551,223L546,223L546,227Z"},
{c:"TD",r:"af",d:"M544,196L541,206L539,210L539,212L539,214L539,215L540,218L541,219L538,221L533,225L530,225L529,227L525,229L523,228L521,229L520,227L519,225L518,222L520,222L520,220L520,216L519,213L517,211L517,206L521,200L522,193L521,192L520,186L533,190L544,196Z"},
{c:"HT",r:"na",d:"M289,195L289,197L289,198L288,198L289,199L289,200L287,199L286,200L284,199L283,200L281,199L282,198L284,199L286,199L287,198L286,197L286,196L284,195L285,195L286,195L289,195Z"},
{c:"DO",r:"na",d:"M289,200L289,199L288,198L289,198L289,197L289,195L291,195L293,195L294,196L295,196L295,197L297,197L298,198L297,199L296,199L294,199L293,199L292,199L291,199L290,201L289,201L289,200Z"},
{c:"RU",r:"ca",d:"M611,121L583,127L573,108L560,95L557,64L579,71L625,59L667,47L679,48L744,38L788,45L888,53L956,72L911,96L898,79L849,119L838,119L798,111L742,110L685,99L631,108L611,121Z M623,45L629,43L628,41L634,40L643,38L652,38L657,37L662,36L664,37L662,38L652,40L644,41L636,44L632,46L628,49L628,51L633,54L632,54L623,53L622,52L618,51L617,50L620,49L620,48L625,45L623,45Z"},
{c:"NO",r:"eu",d:"M563,57L556,58L554,55L549,58L543,59L537,57L533,58L528,60L525,61L520,66L517,71L514,72L512,78L513,83L509,87L502,88L495,87L493,78L503,74L513,67L524,60L537,55L545,53L555,52L560,55L563,57Z M520,29L521,28L525,28L529,29L537,31L531,32L529,34L527,34L526,37L522,37L517,35L519,34L515,33L510,31L508,29L515,28L517,29L520,29Z"},
{c:"ZA",r:"af",d:"M524,329L528,330L533,319L536,325L541,321L547,321L551,318L558,311L563,312L565,322L562,323L566,324L566,330L562,335L553,342L547,344L540,344L532,347L529,345L529,340L526,333L524,329Z M557,330L556,330L555,330L553,331L552,333L554,335L555,335L555,334L557,334L557,333L558,331L557,330Z"},
{c:"MX",r:"na",d:"M168,160L191,162L205,170L216,177L219,189L231,199L241,191L247,196L242,200L238,204L231,207L216,204L200,196L198,188L187,176L178,164L175,167L181,175L188,185L181,179L173,173L169,162L168,160Z"},
{c:"UY",r:"na",d:"M326,334L328,334L331,336L332,336L334,337L337,339L338,341L337,342L338,344L337,346L334,347L332,347L330,347L328,346L326,346L324,344L324,342L325,342L325,339L326,336L326,334Z"},
{c:"BR",r:"na",d:"M338,344L333,327L333,317L326,305L319,292L306,282L293,281L283,270L295,254L299,245L309,245L313,239L320,240L329,245L337,243L347,245L361,257L387,270L375,300L356,317L341,340L338,344Z"},
{c:"BO",r:"na",d:"M295,280L299,280L306,277L306,282L313,286L317,287L319,291L320,295L325,298L326,303L325,306L320,304L314,308L309,311L303,311L298,310L296,303L296,296L295,292L296,286L295,280Z"},
{c:"PE",r:"na",d:"M294,262L289,263L285,267L283,270L285,275L288,278L292,281L297,285L296,290L295,294L294,300L289,298L277,291L274,284L268,272L263,267L264,261L265,261L268,262L271,261L279,254L280,250L284,254L289,256L293,258L294,262Z"},
{c:"CO",r:"na",d:"M302,247L294,245L293,248L294,262L290,257L282,253L277,249L270,246L272,243L273,234L274,229L277,224L282,219L289,215L287,219L286,225L287,229L295,233L300,235L301,241L302,247Z"},
{c:"PA",r:"na",d:"M274,226L274,228L273,229L271,229L272,227L270,226L268,225L266,227L265,228L266,229L264,230L263,229L262,227L260,227L259,228L259,227L259,226L259,225L260,223L261,225L262,225L264,225L267,224L269,223L271,224L273,225L274,226Z"},
{c:"CR",r:"na",d:"M260,223L259,224L259,225L259,226L259,227L257,227L257,226L257,225L256,224L255,224L254,223L254,222L253,222L254,223L253,223L252,223L252,222L251,222L251,221L252,220L251,220L251,219L252,219L254,220L254,219L255,219L255,220L256,220L257,220L258,221L259,222L260,223Z"},
{c:"NI",r:"na",d:"M257,220L255,220L254,219L252,219L251,218L249,216L246,214L247,214L248,214L249,213L249,212L250,211L251,211L253,210L254,209L255,209L256,209L257,208L258,209L258,210L257,212L257,214L257,216L257,218L257,219L257,220Z"},
{c:"HN",r:"na",d:"M258,208L257,209L255,209L254,209L253,210L252,211L251,212L250,212L249,212L248,213L247,214L246,213L246,211L244,212L243,211L242,210L242,209L244,207L245,206L246,206L247,206L249,206L251,206L252,206L253,206L255,206L257,207L258,208Z"},
{c:"GT",r:"na",d:"M234,210L234,209L234,208L235,205L239,205L239,204L238,204L237,203L236,202L237,202L237,201L240,201L242,201L242,203L242,206L243,206L244,206L245,206L244,207L242,208L242,209L242,210L241,210L241,211L240,211L240,212L238,211L237,211L235,211L234,210Z"},
{c:"VE",r:"na",d:"M318,236L313,239L307,239L311,243L308,246L302,247L301,241L299,235L298,233L292,230L287,229L286,225L286,220L290,218L288,223L290,222L293,216L298,221L307,222L315,220L318,224L319,228L317,231L318,236Z"},
{c:"GY",r:"na",d:"M329,245L327,245L325,246L324,246L321,245L320,242L321,239L320,237L319,235L316,233L317,231L319,230L319,228L322,228L324,231L327,232L327,236L326,237L326,241L328,242L329,245Z"},
{c:"SR",r:"na",d:"M335,244L333,243L332,243L331,243L330,244L331,244L331,245L329,245L328,242L327,241L326,241L325,239L326,237L327,236L328,233L331,234L331,233L333,233L336,234L335,236L335,238L336,240L336,241L335,242L335,244Z"},
{c:"FR",r:"eu",d:"M496,113L502,114L500,118L498,118L496,120L497,121L498,123L498,125L500,127L497,130L488,130L485,132L481,132L475,129L477,122L472,118L468,115L476,115L477,113L484,108L487,109L490,110L493,111L496,113Z M342,238L341,241L340,243L339,244L338,244L337,244L337,243L336,244L335,244L335,242L336,241L336,240L335,238L335,236L336,234L337,234L339,235L342,237L342,238Z"},
{c:"EC",r:"na",d:"M279,250L279,253L279,254L276,257L272,258L271,261L270,263L269,264L268,262L267,262L265,262L265,261L266,261L266,259L267,257L267,256L266,257L264,256L265,255L264,253L265,253L266,251L267,249L266,248L268,247L270,246L272,248L273,248L274,249L276,249L277,249L278,250L279,250Z"},
{c:"CU",r:"na",d:"M261,186L265,186L269,188L272,188L276,191L278,192L280,193L282,194L278,195L273,195L273,193L271,192L269,190L265,189L261,188L259,187L256,188L255,189L255,188L257,187L260,186L261,186Z"},
{c:"ZW",r:"af",d:"M563,312L562,312L561,312L560,311L558,311L557,310L555,310L554,308L554,307L553,307L550,304L549,302L548,301L547,299L550,300L551,300L552,300L554,298L556,296L557,296L557,295L559,293L561,293L561,294L563,294L564,295L565,295L566,296L568,296L568,300L567,302L567,304L567,305L567,306L567,307L566,309L563,312Z"},
{c:"BW",r:"af",d:"M558,311L552,315L551,318L549,320L547,321L543,321L541,321L539,323L536,325L535,322L533,319L536,311L538,301L543,301L545,300L547,299L549,302L553,307L554,308L557,310L558,311Z"},
{c:"NA",r:"af",d:"M533,319L531,330L528,330L526,329L524,329L521,325L519,321L518,313L517,310L514,305L511,300L513,298L516,297L518,298L531,299L542,299L546,298L547,299L545,300L542,300L536,301L533,311L533,319Z"},
{c:"SN",r:"af",d:"M435,212L433,209L435,207L437,204L440,204L442,205L446,207L448,211L449,213L449,215L447,215L447,216L443,215L438,215L436,216L438,214L439,213L441,213L443,212L442,212L440,211L438,212L435,212Z"},
{c:"ML",r:"af",d:"M449,215L448,213L448,209L452,208L455,207L465,205L467,181L485,194L488,197L490,205L484,207L479,209L475,210L472,212L469,213L466,218L464,222L463,221L460,222L458,221L457,220L457,217L455,216L453,217L451,216L449,215Z"},
{c:"NE",r:"af",d:"M520,186L521,192L522,193L521,200L517,206L517,211L519,213L518,214L517,215L515,212L511,213L509,213L505,214L501,213L498,214L495,211L491,212L490,215L488,216L486,217L483,214L481,211L481,209L484,207L490,207L491,203L495,196L512,185L518,188L520,186Z"},
{c:"NG",r:"af",d:"M487,233L487,226L489,224L490,221L490,219L490,215L491,212L495,211L498,214L501,213L505,214L509,213L511,213L515,212L517,215L519,216L518,218L515,222L515,224L513,227L512,229L509,232L507,230L505,232L503,237L499,238L496,238L493,234L490,233L487,233Z"},
{c:"CM",r:"af",d:"M519,214L520,220L519,222L519,225L521,229L519,233L519,237L521,241L523,244L518,244L513,244L506,244L504,239L503,237L505,232L509,232L512,228L515,224L516,220L519,216L519,214Z"},
{c:"GH",r:"af",d:"M480,219L480,220L481,222L481,224L481,226L482,227L481,229L482,231L482,233L483,234L479,235L477,236L475,237L472,236L473,235L471,233L472,230L473,227L472,223L472,221L472,220L477,219L478,220L479,219L480,219Z"},
{c:"CI",r:"af",d:"M459,222L460,222L462,221L463,221L464,222L467,222L468,223L471,222L473,227L471,233L472,236L469,236L464,236L460,238L460,236L460,234L458,233L458,231L457,229L458,227L458,224L458,222L459,222Z"},
{c:"BF",r:"af",d:"M466,221L465,220L466,218L466,217L468,215L469,213L471,213L472,212L474,210L475,210L477,208L479,208L479,209L481,209L481,210L481,211L483,213L483,214L486,215L486,217L485,218L484,218L483,219L482,219L480,219L479,219L478,220L477,219L472,220L472,221L472,223L471,222L469,223L468,223L467,223L467,222L466,221Z"},
{c:"CF",r:"af",d:"M553,235L548,235L546,236L541,237L538,238L532,236L529,240L524,241L522,242L520,238L519,235L521,229L524,229L529,227L531,225L538,221L541,220L542,224L546,227L549,231L553,235Z"},
{c:"CG",r:"af",d:"M529,240L528,243L527,248L527,250L527,252L524,255L523,260L520,262L518,263L516,262L515,263L513,263L510,261L511,258L513,257L515,257L518,256L518,252L518,247L515,246L515,244L520,245L523,244L526,240L529,240Z"},
{c:"GA",r:"af",d:"M510,244L511,244L513,244L515,244L515,245L515,246L517,246L518,247L517,250L518,252L518,254L518,256L517,257L515,257L514,255L513,257L512,257L511,258L512,260L510,261L507,258L505,256L503,253L504,252L504,251L505,249L505,247L506,247L510,247L510,244Z"},
{c:"ZM",r:"af",d:"M562,273L566,275L569,279L569,285L569,289L559,293L556,296L551,300L547,299L544,298L538,295L544,285L544,281L545,281L549,283L553,284L557,287L558,284L556,280L557,274L562,273Z"},
{c:"MW",r:"af",d:"M567,276L570,276L571,277L571,278L572,282L571,284L572,288L573,288L574,289L575,291L575,294L574,295L573,297L572,295L571,293L572,292L572,291L571,290L570,290L569,289L567,288L568,286L569,285L568,282L569,280L569,279L569,277L567,276Z"},
{c:"MZ",r:"af",d:"M572,282L578,282L582,281L588,279L588,283L589,291L585,296L577,302L573,305L574,311L575,314L575,317L568,320L568,323L565,323L565,318L566,309L567,305L568,300L565,295L561,294L569,289L572,291L572,295L575,294L573,288L572,282Z"},
{c:"AO",r:"af",d:"M513,267L516,266L525,270L528,272L531,271L534,269L538,270L538,275L539,281L543,280L544,283L544,286L540,297L531,299L517,298L513,298L511,294L513,288L516,283L516,279L514,275L514,269L513,267Z M515,263L514,264L513,265L513,266L512,266L512,264L513,263L514,262L515,263Z"},
{c:"IL",r:"me",d:"M575,159L575,160L574,160L573,161L574,162L573,162L573,163L574,163L574,164L573,168L573,167L571,163L572,162L573,161L573,159L574,158L575,158L576,158L576,159L575,159Z"},
{c:"LB",r:"me",d:"M576,158L575,158L574,158L575,156L576,154L577,154L578,155L576,156L576,158Z"},
{c:"MG",r:"af",d:"M612,285L613,288L615,292L614,294L612,294L613,297L612,300L609,307L607,316L603,320L600,320L597,318L596,313L596,309L597,308L599,304L597,301L598,297L600,295L602,294L605,292L608,289L609,288L610,285L612,285Z"},
{c:"TN",r:"af",d:"M505,166L504,161L503,160L502,159L500,157L500,155L502,154L502,151L502,149L502,147L505,146L507,147L507,148L509,147L510,148L508,149L508,150L509,151L509,153L507,155L508,156L509,156L510,158L511,158L510,160L509,161L508,162L507,163L507,164L507,165L505,166Z"},
{c:"DZ",r:"af",d:"M457,174L457,170L466,167L470,162L477,160L475,156L477,151L484,148L494,148L501,148L502,151L500,157L504,161L506,170L506,175L506,180L509,182L503,190L488,197L485,194L467,181L457,174Z"},
{c:"JO",r:"me",d:"M575,160L575,159L578,160L583,157L585,161L584,161L579,162L581,165L580,166L580,167L578,167L577,168L576,169L573,168L574,164L574,163L575,162L575,160Z"},
{c:"AE",r:"me",d:"M618,183L620,183L622,183L624,183L626,181L628,179L630,178L630,179L630,181L629,181L629,183L628,184L628,185L627,186L627,187L627,188L619,186L618,183Z"},
{c:"IQ",r:"me",d:"M585,161L583,157L589,154L590,151L590,149L592,148L593,147L594,146L597,147L598,147L599,147L601,150L603,151L603,153L602,153L601,156L603,158L606,160L608,162L607,164L608,164L608,165L610,167L608,167L606,167L604,169L599,169L592,163L588,161L585,161Z"},
{c:"OM",r:"me",d:"M627,187L628,185L629,183L629,181L632,183L635,184L638,186L639,187L639,190L637,191L635,193L634,195L634,197L631,198L630,200L627,201L626,203L623,204L621,202L627,194L627,187Z M630,179L630,178L630,177L631,177L630,178L630,179Z"},
{c:"KH",r:"sea",d:"M754,216L753,213L755,210L758,210L761,210L763,211L764,210L766,211L767,212L767,216L762,218L763,220L761,220L758,221L756,220L755,219L754,216Z"},
{c:"TH",r:"sea",d:"M761,210L753,213L749,215L747,216L745,224L748,229L752,233L750,233L746,231L743,227L742,225L746,217L744,212L743,207L741,201L742,195L747,193L750,196L752,200L755,199L759,204L761,210Z"},
{c:"LA",r:"sea",d:"M766,211L764,210L763,211L761,210L761,209L762,207L759,204L759,202L757,199L755,199L755,200L753,200L752,200L749,201L749,199L750,196L748,196L748,194L747,193L748,192L750,190L750,191L751,191L751,188L752,188L754,190L755,192L758,192L760,195L758,195L757,196L760,198L762,201L764,204L766,206L767,208L766,211Z"},
{c:"MM",r:"sea",d:"M747,193L742,195L741,201L743,207L744,212L746,217L743,220L743,214L740,205L734,206L732,202L730,195L726,190L728,188L729,183L732,180L737,174L740,173L742,173L743,178L743,183L745,189L750,189L747,193Z"},
{c:"VN",r:"sea",d:"M758,221L763,220L767,216L766,211L766,206L762,201L757,196L760,195L755,192L752,188L756,187L761,185L765,187L765,189L765,193L762,197L766,204L770,208L771,218L766,221L760,226L760,222L758,221Z"},
{c:"KP",r:"ea",d:"M828,132L829,133L827,133L826,136L824,138L821,139L820,141L821,142L822,143L819,144L817,145L815,145L814,145L813,145L813,143L814,142L814,140L811,139L816,136L820,135L821,133L827,131L828,132Z"},
{c:"KR",r:"ea",d:"M816,145L817,145L818,145L819,144L821,144L822,143L825,146L825,148L825,151L824,153L822,153L820,154L817,154L817,153L817,151L816,148L818,148L816,145Z"},
{c:"MN",r:"ea",d:"M714,113L726,109L733,111L742,110L747,107L753,110L762,110L769,113L778,113L787,111L790,114L790,117L797,117L797,120L789,123L780,125L778,128L774,131L763,133L755,134L745,132L735,130L729,125L722,123L717,116L714,113Z"},
{c:"IN",r:"sa",d:"M740,171L734,178L728,187L723,185L720,180L715,181L717,190L704,199L694,206L692,221L684,225L679,209L670,192L664,182L668,172L681,160L685,154L689,159L696,171L713,177L717,174L726,174L736,168L740,171Z"},
{c:"BD",r:"sa",d:"M727,189L727,191L726,190L726,193L726,191L725,190L725,188L724,187L721,187L722,188L721,189L720,189L719,189L718,189L717,189L717,186L716,184L717,183L715,182L715,181L717,180L715,178L716,177L718,178L720,178L720,180L722,180L725,180L726,181L725,183L724,183L723,185L725,186L725,184L726,184L727,189Z"},
{c:"NP",r:"sa",d:"M715,173L715,174L715,176L715,177L713,177L709,176L707,176L706,174L702,174L699,172L696,171L694,170L695,167L696,166L697,165L700,166L702,168L704,169L705,170L707,170L709,172L712,172L715,173Z"},
{c:"PK",r:"sa",d:"M688,151L678,153L679,159L678,164L671,172L667,176L669,182L660,183L652,180L645,177L647,174L644,169L649,168L653,168L659,163L663,162L665,160L666,156L670,154L670,150L678,148L682,148L688,151Z"},
{c:"AF",r:"sa",d:"M657,146L662,147L665,146L668,144L670,145L672,148L675,146L680,147L674,148L671,151L670,155L668,157L665,161L661,162L657,165L652,168L647,169L645,163L641,158L642,154L648,152L652,149L655,145L657,146Z"},
{c:"TJ",r:"ca",d:"M661,147L662,142L661,140L664,139L668,136L668,138L668,139L665,140L671,141L677,143L680,143L680,146L675,146L673,147L671,147L670,145L669,143L667,145L665,146L664,146L661,147Z"},
{c:"KG",r:"ca",d:"M669,133L670,131L672,131L676,132L676,130L678,130L682,131L683,131L687,131L691,131L692,132L694,132L694,133L689,134L688,136L685,136L684,138L681,137L679,138L677,139L677,140L676,140L671,141L668,140L665,140L665,139L668,139L669,138L671,138L675,136L672,135L670,136L668,135L670,133L669,133Z"},
{c:"TM",r:"ca",d:"M620,134L624,132L628,135L632,135L634,133L640,133L641,136L645,136L649,141L654,143L657,146L655,145L653,147L651,150L648,152L643,151L641,149L636,146L631,144L628,145L624,147L624,142L622,139L621,136L626,136L623,133L621,136L620,134Z"},
{c:"IR",r:"me",d:"M610,167L607,164L603,158L603,153L599,147L598,144L600,141L604,142L609,141L610,144L616,148L624,147L630,145L636,146L643,149L641,156L642,161L645,165L645,170L649,174L644,180L633,179L629,175L620,173L614,166L610,167Z"},
{c:"SY",r:"me",d:"M575,159L576,159L576,158L576,156L578,155L577,154L576,154L576,152L576,150L577,150L578,149L578,148L579,148L582,147L583,148L585,148L588,147L590,147L593,147L592,148L590,149L590,151L589,154L583,157L578,160L575,159Z"},
{c:"AM",r:"ca",d:"M604,142L603,142L602,141L602,140L601,140L600,140L599,140L598,139L596,138L597,137L596,136L600,135L600,136L601,137L602,138L602,139L603,140L604,140L604,142Z"},
{c:"SE",r:"eu",d:"M509,87L513,83L512,78L514,72L517,71L520,66L525,61L528,60L533,58L539,59L543,66L539,67L537,71L528,76L528,82L528,86L524,92L519,94L515,96L511,90L509,87Z"},
{c:"BY",r:"eu",d:"M555,94L558,95L562,96L562,98L565,100L566,101L566,102L563,103L565,105L562,105L561,107L558,107L556,107L553,107L548,106L544,107L543,105L543,104L543,101L545,100L549,98L551,96L555,94Z"},
{c:"UA",r:"eu",d:"M565,105L570,105L573,108L580,110L587,113L583,117L578,120L573,123L569,122L562,121L556,124L557,122L559,121L559,120L556,116L551,116L546,117L541,117L540,114L544,110L545,106L555,107L560,107L565,105Z M569,122L570,122L572,122L573,122L573,123L575,124L577,124L577,125L574,125L570,127L569,126L569,125L567,124L570,123L569,122Z"},
{c:"PL",r:"eu",d:"M543,100L543,103L542,104L543,107L544,110L540,113L540,114L536,113L533,113L530,113L529,111L527,110L525,111L523,109L520,108L519,105L518,103L518,101L524,99L530,98L532,99L541,99L543,100Z"},
{c:"AT",r:"eu",d:"M525,116L525,117L524,117L524,118L523,120L520,120L519,121L517,121L513,120L512,119L510,120L509,120L508,120L506,120L505,119L506,118L508,119L508,118L510,118L512,117L514,118L515,118L514,116L515,116L516,114L518,115L520,114L521,114L523,115L524,114L525,115L525,116Z"},
{c:"HU",r:"eu",d:"M539,115L540,116L541,117L539,118L538,119L536,121L534,122L532,122L530,122L529,123L527,122L525,121L524,121L524,120L523,120L524,118L524,117L525,117L525,116L527,117L528,117L530,117L530,116L531,116L532,116L533,116L534,116L535,115L538,116L539,115Z"},
{c:"MD",r:"eu",d:"M551,116L552,116L553,115L555,116L556,116L558,117L557,118L558,118L559,120L560,120L560,121L559,121L558,121L557,121L557,122L556,122L556,123L555,124L555,122L555,121L555,120L553,118L553,117L552,116L551,116Z"},
{c:"RO",r:"eu",d:"M555,124L558,124L559,125L557,125L555,128L550,128L544,128L541,128L540,127L540,126L537,126L536,124L534,122L538,119L541,117L543,117L546,117L549,117L551,116L553,117L555,120L555,122L555,124Z"},
{c:"LT",r:"eu",d:"M551,96L551,97L549,98L548,99L545,100L543,100L542,99L541,99L540,98L541,98L540,97L537,97L536,94L539,94L544,94L546,93L547,94L548,94L551,96Z"},
{c:"LV",r:"eu",d:"M553,90L554,91L554,92L555,94L552,95L551,96L548,94L547,94L546,93L544,94L539,94L536,94L536,92L538,91L540,90L542,92L544,92L545,89L547,89L548,89L551,90L553,90Z"},
{c:"EE",r:"eu",d:"M555,85L553,87L554,89L553,90L551,90L548,89L547,89L545,89L545,88L544,88L542,87L542,86L546,85L549,84L552,85L555,85Z"},
{c:"DE",r:"eu",d:"M518,101L518,103L519,105L520,108L518,108L516,109L513,110L513,112L516,114L514,116L514,118L512,117L508,118L506,118L503,117L500,118L502,114L496,113L496,111L496,106L498,105L498,101L501,101L503,100L503,97L506,97L509,99L512,99L516,100L518,101Z"},
{c:"BG",r:"eu",d:"M540,127L541,128L542,128L544,128L548,129L550,128L553,127L555,128L556,129L555,130L554,132L555,133L552,133L550,134L550,135L547,135L545,134L543,135L541,135L541,133L540,132L540,131L541,130L540,129L540,128L540,127Z"},
{c:"GR",r:"eu",d:"M541,135L545,134L550,135L551,135L549,137L546,136L545,139L542,139L540,138L542,141L543,143L544,145L542,146L542,149L538,148L536,144L534,141L535,139L536,137L538,136L540,136L541,135Z M550,152L550,153L546,153L543,152L543,151L545,152L547,152L549,152L550,152Z"},
{c:"TR",r:"me",d:"M599,147L597,147L593,147L588,147L583,148L579,148L578,149L576,150L576,148L573,148L567,150L562,148L559,150L554,148L550,144L550,140L557,138L563,136L569,133L578,135L585,136L591,135L596,136L596,138L599,140L598,144L599,147Z M550,134L552,133L555,133L555,134L557,135L557,136L554,136L553,137L550,138L549,137L550,136L551,135L550,134Z"},
{c:"AL",r:"eu",d:"M536,137L535,138L535,139L534,140L533,140L533,139L532,138L532,137L532,135L532,134L531,133L533,131L533,132L534,132L535,133L535,134L535,135L535,136L536,137Z"},
{c:"HR",r:"eu",d:"M524,121L527,122L530,122L532,124L529,125L525,124L524,125L522,126L524,128L526,129L529,132L525,130L520,127L520,126L518,124L516,125L517,124L519,123L521,124L522,123L524,121Z"},
{c:"CH",r:"eu",d:"M506,118L505,119L506,120L508,120L508,121L506,121L504,121L504,122L503,122L502,122L501,123L499,123L498,122L497,121L496,121L496,120L498,119L498,118L499,118L500,118L502,118L503,117L506,118Z"},
{c:"BE",r:"eu",d:"M496,109L496,111L495,111L495,112L493,111L491,111L490,110L488,109L487,109L487,108L489,107L491,108L493,107L495,108L496,109Z"},
{c:"NL",r:"eu",d:"M498,101L499,102L498,105L498,106L496,106L496,109L495,108L493,107L491,108L489,107L490,107L493,103L496,101L498,101Z"},
{c:"PT",r:"eu",d:"M456,134L457,133L458,133L459,134L460,134L461,134L462,134L463,135L462,136L462,138L461,138L461,140L460,140L461,142L460,143L461,144L461,145L460,146L460,147L459,148L458,147L456,148L457,145L456,144L455,143L455,142L455,141L456,140L456,138L457,137L457,136L456,135L456,134Z"},
{c:"ES",r:"eu",d:"M460,147L461,145L460,143L460,140L461,138L462,136L462,134L460,134L458,133L456,134L455,130L462,129L468,129L475,129L481,132L485,132L488,134L482,136L480,139L480,142L478,145L474,148L468,148L466,150L463,149L460,147Z"},
{c:"IE",r:"eu",d:"M463,100L464,102L462,105L457,106L453,106L456,103L454,100L458,98L460,97L460,98L460,100L461,100L463,100Z"},
{c:"NZ",r:"oc",d:"M952,361L951,363L949,365L947,366L947,365L946,365L947,362L946,361L944,360L944,359L946,358L946,356L946,354L945,352L945,351L944,350L941,348L940,346L941,346L943,347L945,348L946,350L948,353L948,351L949,352L949,354L951,355L953,355L955,354L956,355L955,357L955,359L953,359L952,360L952,361Z M932,371L935,370L936,368L938,366L939,365L939,364L941,362L941,364L942,365L944,364L945,365L945,366L944,367L942,369L941,370L942,372L939,372L937,373L936,375L935,378L933,379L932,380L929,380L927,379L924,378L924,377L925,375L929,373L931,372L932,371Z"},
{c:"AU",r:"oc",d:"M816,339L797,346L789,339L783,324L783,312L797,306L810,297L818,289L830,284L842,283L843,293L857,294L860,280L868,292L877,307L888,324L883,345L868,357L852,350L845,344L825,338L816,339Z M874,363L875,364L876,367L875,368L874,370L874,369L872,371L871,371L869,371L868,369L867,367L866,364L866,363L868,363L870,364L872,364L874,363Z"},
{c:"LK",r:"sa",d:"M698,229L698,232L697,233L694,233L693,231L693,227L694,223L696,224L697,226L698,229Z"},
{c:"CN",r:"ea",d:"M694,132L713,113L734,127L767,132L789,123L788,116L806,102L833,117L828,131L808,140L793,142L799,151L804,172L778,190L762,186L748,190L742,173L723,172L704,169L690,155L677,140L694,132Z M772,199L770,199L770,196L771,195L774,194L775,194L776,195L775,197L774,198L772,199Z"},
{c:"TW",r:"ea",d:"M805,182L803,187L802,189L801,187L800,185L802,182L804,180L805,181L805,182Z"},
{c:"IT",r:"eu",d:"M508,120L512,119L517,122L513,124L514,128L520,133L522,135L529,138L527,138L526,140L523,144L522,142L521,139L517,137L512,134L507,128L502,127L500,127L499,124L499,123L503,122L506,121L508,120Z M519,144L521,144L520,146L521,147L520,148L518,147L517,147L513,146L514,144L517,144L519,144Z"},
{c:"DK",r:"eu",d:"M506,97L505,98L503,97L502,96L502,93L502,92L503,91L505,91L506,90L508,90L508,91L507,92L508,93L509,93L508,94L506,96L506,97Z M513,94L514,96L512,98L509,96L509,95L513,94Z"},
{c:"GB",r:"eu",d:"M472,102L472,100L470,98L466,97L467,95L465,94L465,89L469,87L469,90L475,90L472,95L475,95L479,99L481,103L484,105L484,108L478,109L472,109L468,110L465,111L471,107L467,107L469,105L468,101L472,102Z M463,100L461,100L460,100L460,98L460,97L462,97L465,98L463,100Z"},
{c:"IS",r:"eu",d:"M441,65L441,67L444,69L440,71L433,73L430,74L427,73L419,72L422,71L416,70L421,69L421,68L415,68L417,66L421,66L425,67L429,66L433,67L437,65L441,65Z"},
{c:"AZ",r:"ca",d:"M604,134L606,136L608,136L608,135L610,134L611,135L612,137L614,137L614,138L612,138L612,141L611,142L610,142L610,144L608,142L609,141L608,140L607,140L604,142L604,140L603,140L602,139L602,138L601,137L600,136L600,135L601,135L603,136L604,136L603,134L604,134Z M603,142L601,142L600,141L599,140L600,140L601,140L602,140L602,141L603,142Z"},
{c:"GE",r:"ca",d:"M587,129L589,129L593,130L597,131L597,132L599,131L601,132L602,133L604,134L603,134L604,136L603,136L601,135L600,135L596,136L594,134L591,135L591,133L591,132L589,131L588,130L587,129Z"},
{c:"PH",r:"sea",d:"M806,199L806,201L807,203L806,205L804,206L804,208L805,210L806,211L807,210L811,212L810,213L811,214L811,215L809,214L808,212L807,213L805,212L803,212L802,212L802,210L803,210L802,209L802,210L800,208L800,207L800,205L801,205L801,201L802,199L804,199L805,199L806,199Z M817,227L817,228L817,230L817,233L816,230L814,231L815,233L814,234L811,233L811,231L811,230L810,228L809,229L808,229L806,231L805,230L806,228L808,227L809,226L810,227L812,226L813,225L815,225L814,223L817,224L817,226L817,227Z"},
{c:"MY",r:"sea",d:"M794,239L792,238L789,238L788,241L787,242L786,246L783,247L781,246L780,246L778,247L776,247L775,248L773,246L772,244L774,245L776,245L777,243L778,242L781,241L783,239L785,237L786,239L786,238L788,238L788,236L788,235L790,233L791,231L792,231L794,232L794,233L796,234L798,235L798,236L796,236L796,238L794,239Z M747,232L750,233L750,234L752,234L752,233L753,233L755,235L756,237L756,238L756,240L756,241L756,242L757,243L758,245L758,246L756,247L754,245L750,242L750,241L749,239L748,237L747,235L747,233L747,232Z"},
{c:"SI",r:"eu",d:"M517,121L519,121L520,120L523,120L524,120L524,121L522,122L522,123L521,123L521,124L520,124L519,123L518,124L517,124L517,123L517,122L517,121Z"},
{c:"FI",r:"eu",d:"M556,58L560,62L561,67L561,72L564,75L561,78L555,82L550,82L541,84L537,81L536,76L540,73L548,69L544,67L543,61L535,58L540,59L546,59L550,56L557,56L556,58Z"},
{c:"SK",r:"eu",d:"M540,114L539,114L539,115L538,116L535,115L534,116L533,116L532,116L531,116L530,116L530,117L528,117L527,117L525,116L525,115L526,114L527,114L528,114L528,113L529,113L530,113L532,112L533,113L534,113L536,113L538,113L540,114Z"},
{c:"CZ",r:"eu",d:"M520,108L521,109L523,109L523,110L525,111L525,110L527,110L527,111L529,111L530,113L529,113L528,113L528,114L527,114L526,114L525,115L524,114L523,115L521,114L520,114L518,115L516,114L515,113L513,112L513,111L513,110L515,110L516,109L517,109L518,108L519,108L520,108Z"},
{c:"ER",r:"af",d:"M577,210L577,209L578,205L578,203L579,202L581,202L582,200L584,203L585,206L586,207L590,210L591,211L593,213L594,214L595,215L594,215L593,215L592,214L591,213L590,212L589,211L587,210L585,210L584,209L583,210L581,208L580,211L577,210Z"},
{c:"JP",r:"ea",d:"M858,141L856,144L856,147L855,149L855,150L854,152L851,154L846,154L842,157L840,156L840,154L836,155L832,156L829,156L832,158L830,163L828,164L827,163L828,160L826,159L825,158L828,157L829,155L832,153L834,152L839,151L842,151L845,146L846,148L850,145L852,144L853,140L853,137L854,136L857,135L858,139L858,141Z M866,128L868,127L868,130L864,131L862,133L858,131L856,134L853,135L853,132L854,130L857,129L858,126L859,123L862,126L864,127L866,128Z"},
{c:"PY",r:"na",d:"M325,306L326,308L326,311L328,312L329,311L331,312L332,313L332,315L332,317L333,317L334,316L335,317L335,318L335,320L334,321L334,324L331,326L329,327L326,326L324,325L326,321L326,320L323,319L320,317L318,316L313,312L314,308L314,307L315,305L320,304L322,304L325,305L325,306Z"},
{c:"YE",r:"me",d:"M619,197L622,204L619,206L616,208L610,211L608,211L605,213L602,213L600,214L599,215L596,215L595,212L594,209L594,208L594,206L595,204L596,201L598,202L601,202L605,202L607,202L611,198L619,197Z"},
{c:"SA",r:"me",d:"M573,168L578,167L581,165L585,161L599,169L607,171L611,174L614,177L615,180L616,182L618,183L627,187L619,197L607,202L604,202L598,202L595,203L594,203L591,200L587,194L584,189L581,183L579,180L577,176L572,172L573,168Z"},
{c:"MA",r:"af",d:"M474,152L476,159L473,161L470,164L464,167L457,173L455,175L452,175L448,178L442,188L435,190L436,188L437,184L440,180L443,176L446,172L452,169L455,161L460,156L464,151L470,152L474,152Z"},
{c:"EG",r:"af",d:"M578,189L557,189L547,179L546,167L546,164L551,162L556,164L559,163L563,162L565,164L568,164L571,163L573,167L572,169L571,173L570,172L566,167L567,170L571,177L573,180L575,184L578,188L578,189Z"},
{c:"LY",r:"af",d:"M547,189L544,194L533,190L520,186L516,186L511,183L507,182L506,180L506,176L506,173L506,170L505,166L507,164L508,162L510,160L514,159L517,159L522,163L528,165L532,165L533,162L536,159L541,159L543,161L546,161L546,164L546,167L547,179L547,189Z"},
{c:"ET",r:"af",d:"M607,228L596,236L592,238L590,239L586,239L584,240L582,240L578,238L576,237L574,235L571,231L570,229L569,227L571,226L571,220L573,219L576,215L577,210L581,208L584,209L587,210L590,212L592,214L592,216L591,218L593,219L594,220L594,222L596,224L607,228Z"},
{c:"UG",r:"af",d:"M570,253L565,253L562,253L561,253L560,254L559,254L559,252L560,251L560,248L560,247L561,246L562,245L563,244L562,244L562,240L563,239L565,240L567,239L569,239L571,238L572,240L572,242L573,245L572,247L571,249L570,250L570,253Z"},
{c:"BA",r:"eu",d:"M529,132L527,130L526,129L525,129L524,128L523,127L522,126L523,124L524,125L524,124L525,124L528,125L529,125L531,125L532,125L531,127L532,128L532,129L531,129L530,130L529,132Z"},
{c:"MK",r:"eu",d:"M540,132L541,133L541,135L540,136L539,136L538,136L536,137L535,136L535,135L535,134L535,133L537,133L538,133L538,132L540,132Z"},
{c:"RS",r:"eu",d:"M530,122L532,122L535,123L537,124L539,126L541,126L540,127L540,129L540,131L540,132L538,132L537,132L538,131L537,131L536,130L535,131L534,131L532,130L531,129L532,128L532,125L531,125L531,124L530,122Z"},
{c:"SS",r:"af",d:"M562,240L558,238L555,238L551,233L547,229L544,226L546,223L549,222L552,223L557,224L559,222L564,223L566,218L567,216L569,220L570,224L570,227L570,229L573,232L571,238L565,240L562,240Z"}
];

const CLABELS=[{c:"US",x:219,y:144,n:"USA"},{c:"CA",x:224,y:83,n:"Canada"},{c:"MX",x:208,y:186,n:"Mexico"},{c:"BR",x:341,y:278,n:"Brazil"},{c:"AR",x:309,y:344,n:"Argentina"},{c:"CO",x:288,y:239,n:"Colombia"},{c:"VE",x:304,y:231,n:"Venezuela"},{c:"PE",x:277,y:278,n:"Peru"},{c:"CL",x:291,y:342,n:"Chile"},{c:"GB",x:475,y:100,n:"UK"},{c:"FR",x:485,y:122,n:"France"},{c:"DE",x:507,y:108,n:"Germany"},{c:"IT",x:512,y:133,n:"Italy"},{c:"ES",x:469,y:139,n:"Spain"},{c:"PL",x:533,y:106,n:"Poland"},{c:"UA",x:565,y:114,n:"Ukraine"},{c:"NO",x:507,y:72,n:"Norway"},{c:"SE",x:523,y:78,n:"Sweden"},{c:"FI",x:549,y:72,n:"Finland"},{c:"RO",x:547,y:122,n:"Romania"},{c:"RU",x:747,y:78,n:"Russia"},{c:"SA",x:600,y:183,n:"Saudi"},{c:"IR",x:621,y:161,n:"Iran"},{c:"IQ",x:597,y:158,n:"Iraq"},{c:"TR",x:573,y:142,n:"Turkey"},{c:"YE",x:608,y:208,n:"Yemen"},{c:"SY",x:581,y:153,n:"Syria"},{c:"EG",x:560,y:175,n:"Egypt"},{c:"NG",x:501,y:222,n:"Nigeria"},{c:"ZA",x:547,y:331,n:"S.Africa"},{c:"SD",x:560,y:208,n:"Sudan"},{c:"ET",x:587,y:228,n:"Ethiopia"},{c:"CD",x:544,y:258,n:"DR Congo"},{c:"LY",x:525,y:175,n:"Libya"},{c:"ML",x:475,y:203,n:"Mali"},{c:"DZ",x:488,y:172,n:"Algeria"},{c:"MA",x:464,y:161,n:"Morocco"},{c:"KE",x:581,y:250,n:"Kenya"},{c:"TZ",x:573,y:267,n:"Tanzania"},{c:"AO",x:528,y:283,n:"Angola"},{c:"MZ",x:573,y:300,n:"Mozambique"},{c:"MG",x:605,y:303,n:"Madagascar"},{c:"NE",x:501,y:203,n:"Niger"},{c:"TD",x:531,y:208,n:"Chad"},{c:"SO",x:603,y:236,n:"Somalia"},{c:"SS",x:560,y:231,n:"S.Sudan"},{c:"CF",x:533,y:233,n:"CAR"},{c:"CN",x:760,y:153,n:"China"},{c:"JP",x:848,y:147,n:"Japan"},{c:"KR",x:821,y:150,n:"S.Korea"},{c:"KP",x:819,y:139,n:"N.Korea"},{c:"MN",x:760,y:119,n:"Mongolia"},{c:"TW",x:803,y:183,n:"Taiwan"},{c:"IN",x:691,y:189,n:"India"},{c:"PK",x:664,y:167,n:"Pakistan"},{c:"AF",x:656,y:158,n:"Afghan."},{c:"BD",x:720,y:183,n:"Bangladesh"},{c:"NP",x:704,y:172,n:"Nepal"},{c:"TH",x:749,y:208,n:"Thailand"},{c:"VN",x:763,y:206,n:"Vietnam"},{c:"MM",x:736,y:194,n:"Myanmar"},{c:"ID",x:795,y:256,n:"Indonesia"},{c:"PH",x:805,y:217,n:"Philippines"},{c:"MY",x:773,y:239,n:"Malaysia"},{c:"KH",x:760,y:214,n:"Cambodia"},{c:"LA",x:755,y:200,n:"Laos"},{c:"AU",x:837,y:319,n:"Australia"},{c:"NZ",x:944,y:364,n:"N.Zealand"},{c:"PG",x:867,y:267,n:"PNG"},{c:"KZ",x:661,y:117,n:"Kazakhstan"},{c:"UZ",x:651,y:136,n:"Uzbekistan"},{c:"GE",x:597,y:133,n:"Georgia"},{c:"AZ",x:613,y:139,n:"Azerbaijan"}];

const NEWS = [
  { id: "N1", t: "Bitcoin ETF inflows hit $2.1B weekly — BlackRock leads", cat: "crypto", sent: 0.82, time: "2h", impact: ["BTC"] },
  { id: "N2", t: "Fed minutes: hawkish tilt, rate cuts delayed to Q4", cat: "macro", sent: -0.65, time: "4h", impact: ["FEDCUT", "GOLD"] },
  { id: "N3", t: "NVIDIA Blackwell Ultra: 2x throughput, sold out", cat: "equities", sent: 0.71, time: "6h", impact: ["NVDA"] },
  { id: "N4", t: "Gold breaks $2,400 ATH on safe haven demand", cat: "commodities", sent: 0.55, time: "8h", impact: ["GOLD", "SILVER"] },
  { id: "N5", t: "Stripe S-1 filed — $70B target valuation", cat: "ipo", sent: 0.88, time: "1d", impact: [] },
  { id: "N6", t: "Nat gas inventory 18% below 5yr average", cat: "commodities", sent: 0.45, time: "1d", impact: ["NATGAS"] },
  { id: "N7", t: "Tesla short interest at 18-month high", cat: "shorts", sent: -0.72, time: "3h", impact: ["TSLA"] },
  { id: "N8", t: "Solana DEX volume overtakes Ethereum", cat: "crypto", sent: 0.6, time: "5h", impact: ["SOL", "ETH"] },
  // Conflict-specific news (Popular Front style)
  { id: "N9", t: "Houthi anti-ship missile hits container vessel off Mocha — crew evacuated", cat: "conflict", sent: -0.85, time: "1h", impact: ["OIL", "GOLD", "BRENT"] },
  { id: "N10", t: "Ukraine strikes Russian oil refinery in Ryazan — 200K bpd offline", cat: "conflict", sent: -0.6, time: "3h", impact: ["OIL", "BRENT", "NATGAS"] },
  { id: "N11", t: "PLA Eastern Theater Command announces live-fire exercises near Taiwan", cat: "conflict", sent: -0.9, time: "30m", impact: ["TSM", "NVDA", "GOLD", "AAPL"] },
  { id: "N12", t: "Hezbollah launches 150+ rockets into northern Israel — IDF mobilizing reserves", cat: "conflict", sent: -0.8, time: "2h", impact: ["OIL", "GOLD", "BRENT"] },
  { id: "N13", t: "Niger junta revokes Orano uranium mining license — EU supply at risk", cat: "conflict", sent: -0.65, time: "6h", impact: ["URANIUM"] },
  { id: "N14", t: "Russian shadow fleet tanker runs aground in Danish straits — environmental emergency", cat: "conflict", sent: -0.5, time: "4h", impact: ["OIL", "BRENT"] },
  { id: "N15", t: "Rheinmetall wins €8B EU ammunition contract — largest European defense deal", cat: "defense", sent: 0.7, time: "5h", impact: ["BA", "GOLD"] },
  { id: "N16", t: "Philippine Coast Guard vessel rammed by Chinese maritime militia in Scarborough Shoal", cat: "conflict", sent: -0.55, time: "3h", impact: ["OIL", "COPPER", "GOLD"] },
];

const DEBT_DATA = {
  US: { name: "United States", fedFunds: 5.25, spread2y10y: -0.34, hySpread: 3.85, debtGdp: 123.4, phase: "Late Expansion", longPhase: "Deleveraging", pos: 72, currency: "USD",
    indicators: [{ name: "Yield Curve", value: "Inverted", sig: "WARN", detail: "2Y-10Y at -34bps" }, { name: "Credit Spreads", value: "Widening", sig: "CAUTION", detail: "HY +45bps in 30d" }, { name: "M2 Supply", value: "+3.2% YoY", sig: "NEUTRAL", detail: "Recovery but below trend" }, { name: "Real Rates", value: "+2.15%", sig: "TIGHT", detail: "Most restrictive since '07" }, { name: "Debt/GDP", value: "123.4%", sig: "ELEVATED", detail: "Fiscal capacity constrained" }, { name: "Consumer Credit", value: "Slowing", sig: "CAUTION", detail: "Delinquencies at 12yr high" }] },
  CN: { name: "China", fedFunds: 3.45, spread2y10y: 0.42, hySpread: 2.8, debtGdp: 83.6, phase: "Deleveraging", longPhase: "Debt Crisis", pos: 85, currency: "CNY",
    indicators: [{ name: "Yield Curve", value: "Normal", sig: "NEUTRAL", detail: "Flattening trend" }, { name: "Property Crisis", value: "Ongoing", sig: "WARN", detail: "Evergrande ripple effects" }, { name: "M2 Supply", value: "+9.1% YoY", sig: "LOOSE", detail: "Aggressive easing" }, { name: "Real Rates", value: "+0.8%", sig: "LOOSE", detail: "Below neutral" }, { name: "Debt/GDP", value: "83.6%", sig: "ELEVATED", detail: "Local gov debt hidden" }, { name: "Capital Flows", value: "Outflow", sig: "WARN", detail: "FDI declining 3rd year" }] },
  EU: { name: "Eurozone", fedFunds: 4.0, spread2y10y: -0.12, hySpread: 3.2, debtGdp: 88.7, phase: "Stagnation", longPhase: "Restructuring", pos: 62, currency: "EUR",
    indicators: [{ name: "Yield Curve", value: "Flat", sig: "CAUTION", detail: "Near inversion" }, { name: "Credit Spreads", value: "Stable", sig: "NEUTRAL", detail: "ECB backstop holding" }, { name: "M2 Supply", value: "+1.8% YoY", sig: "TIGHT", detail: "Below inflation target" }, { name: "Real Rates", value: "+1.6%", sig: "TIGHT", detail: "Restrictive but easing" }, { name: "Debt/GDP", value: "88.7%", sig: "ELEVATED", detail: "Italy/Greece elevated" }, { name: "PMI", value: "47.2", sig: "WARN", detail: "Manufacturing contraction" }] },
  JP: { name: "Japan", fedFunds: 0.25, spread2y10y: 0.65, hySpread: 1.8, debtGdp: 263.9, phase: "Reflation", longPhase: "Yield Curve Control Exit", pos: 35, currency: "JPY",
    indicators: [{ name: "Yield Curve", value: "Steepening", sig: "NEUTRAL", detail: "BOJ allowing rise" }, { name: "Inflation", value: "3.2% YoY", sig: "CAUTION", detail: "Above target first time in 30yr" }, { name: "M2 Supply", value: "+2.5% YoY", sig: "NEUTRAL", detail: "Normalizing" }, { name: "Real Rates", value: "-2.95%", sig: "LOOSE", detail: "Deeply negative" }, { name: "Debt/GDP", value: "263.9%", sig: "CRITICAL", detail: "Highest globally" }, { name: "Yen", value: "Weakening", sig: "WARN", detail: "¥149/$ intervention risk" }] },
  AU: { name: "Australia", fedFunds: 4.35, spread2y10y: -0.18, hySpread: 2.9, debtGdp: 52.1, phase: "Late Expansion", longPhase: "Commodity Cycle Peak", pos: 68, currency: "AUD",
    indicators: [{ name: "Yield Curve", value: "Inverted", sig: "WARN", detail: "Shallow -18bps" }, { name: "Housing", value: "Cooling", sig: "CAUTION", detail: "Prices -2% from peak" }, { name: "M2 Supply", value: "+4.1% YoY", sig: "NEUTRAL", detail: "Normalizing post-COVID" }, { name: "Real Rates", value: "+1.0%", sig: "NEUTRAL", detail: "Mildly restrictive" }, { name: "Debt/GDP", value: "52.1%", sig: "NEUTRAL", detail: "Low vs peers" }, { name: "Iron Ore", value: "$118/t", sig: "NEUTRAL", detail: "China demand softening" }] },
  GB: { name: "United Kingdom", fedFunds: 5.0, spread2y10y: -0.22, hySpread: 3.5, debtGdp: 101.2, phase: "Stagflation Risk", longPhase: "Fiscal Squeeze", pos: 75, currency: "GBP",
    indicators: [{ name: "Yield Curve", value: "Inverted", sig: "WARN", detail: "Gilt curve stressed" }, { name: "Inflation", value: "4.2% YoY", sig: "WARN", detail: "Sticky services" }, { name: "M2 Supply", value: "+0.8% YoY", sig: "TIGHT", detail: "Credit contracting" }, { name: "Real Rates", value: "+0.8%", sig: "NEUTRAL", detail: "Turning restrictive" }, { name: "Debt/GDP", value: "101.2%", sig: "ELEVATED", detail: "Post-Truss recovery" }, { name: "Housing", value: "Falling", sig: "CAUTION", detail: "Mortgage rates elevated" }] },
};
const DEBT = DEBT_DATA.US; // Default for backward compat

// ─── ANALYSIS ──────────────────────────────────────────────────────────────
const corrPair = (a, b) => {
  const n = Math.min(a.length, b.length, 30);
  const ra = a.slice(-n).map((d, i, arr) => i > 0 ? (d.close - arr[i - 1].close) / arr[i - 1].close : 0).slice(1);
  const rb = b.slice(-n).map((d, i, arr) => i > 0 ? (d.close - arr[i - 1].close) / arr[i - 1].close : 0).slice(1);
  const ma = ra.reduce((s, v) => s + v, 0) / ra.length, mb = rb.reduce((s, v) => s + v, 0) / rb.length;
  let cv = 0, va = 0, vb = 0;
  for (let i = 0; i < ra.length; i++) { cv += (ra[i] - ma) * (rb[i] - mb); va += (ra[i] - ma) ** 2; vb += (rb[i] - mb) ** 2; }
  const d = Math.sqrt(va * vb); return d === 0 ? 0 : +(cv / d).toFixed(3);
};

const bt = (hist) => {
  const res = [];
  for (let i = 50; i < hist.length - 10; i++) {
    const d = hist[i], p = hist[i - 1];
    if (!d.sma20 || !d.sma50 || !p.sma20 || !p.sma50) continue;
    const up = p.sma20 <= p.sma50 && d.sma20 > d.sma50, dn = p.sma20 >= p.sma50 && d.sma20 < d.sma50;
    if (up || dn) { const f5 = hist[i + 5] ? +((hist[i + 5].close - d.close) / d.close * 100).toFixed(2) : null; const f10 = hist[i + 10] ? +((hist[i + 10].close - d.close) / d.close * 100).toFixed(2) : null; res.push({ date: d.date, sig: up ? "GOLDEN" : "DEATH", price: d.close, f5, f10, rsi: d.rsi14 }); }
  }
  const gc = res.filter(r => r.sig === "GOLDEN" && r.f10 !== null), dc = res.filter(r => r.sig === "DEATH" && r.f10 !== null);
  return { signals: res.slice(-5), total: res.length, gcWR: gc.length ? +(gc.filter(r => r.f10 > 0).length / gc.length * 100).toFixed(0) : null, dcWR: dc.length ? +(dc.filter(r => r.f10 < 0).length / dc.length * 100).toFixed(0) : null, avgRet: res.filter(r => r.f10 !== null).length ? +(res.filter(r => r.f10 !== null).reduce((s, r) => s + r.f10, 0) / res.filter(r => r.f10 !== null).length).toFixed(2) : null };
};

// ─── PATTERN RECOGNITION ENGINE ────────────────────────────────────────────

// 1. Candlestick Pattern Detection
const detectCandles = (hist) => {
  const patterns = [];
  const n = hist.length;
  if (n < 5) return patterns;
  for (let i = Math.max(2, n - 20); i < n; i++) {
    const c = hist[i], p = hist[i - 1], pp = hist[i - 2];
    const body = Math.abs(c.close - c.open), range = c.high - c.low;
    const pBody = Math.abs(p.close - p.open), pRange = p.high - p.low;
    const bullish = c.close > c.open, pBullish = p.close > p.open;
    // Doji: tiny body relative to range
    if (range > 0 && body / range < 0.1) patterns.push({ date: c.date, name: "Doji", dir: "neutral", strength: 60, desc: "Indecision — trend may reverse" });
    // Hammer: small body at top, long lower wick (bullish reversal)
    if (!bullish && range > 0 && (c.close - c.low) / range > 0.65 && body / range < 0.3) patterns.push({ date: c.date, name: "Hammer", dir: "bullish", strength: 72, desc: "Bullish reversal signal" });
    // Shooting Star: small body at bottom, long upper wick (bearish)
    if (bullish && range > 0 && (c.high - c.close) / range > 0.65 && body / range < 0.3) patterns.push({ date: c.date, name: "Shooting Star", dir: "bearish", strength: 70, desc: "Bearish reversal signal" });
    // Bullish Engulfing
    if (bullish && !pBullish && c.open < p.close && c.close > p.open && body > pBody * 1.2) patterns.push({ date: c.date, name: "Bullish Engulf", dir: "bullish", strength: 78, desc: "Strong bullish reversal" });
    // Bearish Engulfing
    if (!bullish && pBullish && c.open > p.close && c.close < p.open && body > pBody * 1.2) patterns.push({ date: c.date, name: "Bearish Engulf", dir: "bearish", strength: 78, desc: "Strong bearish reversal" });
    // Morning Star (3-candle bullish)
    if (i >= 2 && !pp.close > pp.open && pBody / pRange < 0.2 && bullish && c.close > (pp.open + pp.close) / 2) patterns.push({ date: c.date, name: "Morning Star", dir: "bullish", strength: 82, desc: "3-bar bullish reversal" });
    // Three White Soldiers
    if (i >= 2 && bullish && pBullish && pp.close > pp.open && c.close > p.close && p.close > pp.close) patterns.push({ date: c.date, name: "3 Soldiers", dir: "bullish", strength: 80, desc: "Strong continuation up" });
  }
  return patterns.slice(-8);
};

// 2. Support/Resistance Levels
const detectSR = (hist, levels = 5) => {
  if (hist.length < 20) return [];
  const pivots = [];
  for (let i = 2; i < hist.length - 2; i++) {
    if (hist[i].high > hist[i - 1].high && hist[i].high > hist[i + 1].high && hist[i].high > hist[i - 2].high && hist[i].high > hist[i + 2].high) pivots.push({ price: hist[i].high, type: "R", date: hist[i].date });
    if (hist[i].low < hist[i - 1].low && hist[i].low < hist[i + 1].low && hist[i].low < hist[i - 2].low && hist[i].low < hist[i + 2].low) pivots.push({ price: hist[i].low, type: "S", date: hist[i].date });
  }
  // Cluster nearby levels
  const clustered = [];
  const sorted = pivots.sort((a, b) => a.price - b.price);
  const threshold = (hist[hist.length - 1].close) * 0.015;
  sorted.forEach(p => {
    const existing = clustered.find(c => Math.abs(c.price - p.price) < threshold);
    if (existing) { existing.touches++; existing.price = (existing.price + p.price) / 2; }
    else clustered.push({ ...p, touches: 1 });
  });
  return clustered.sort((a, b) => b.touches - a.touches).slice(0, levels);
};

// 3. Volume Profile Analysis
const volumeProfile = (hist) => {
  const n = hist.length;
  if (n < 10) return { climax: false, divergence: "none", accumulation: "neutral" };
  const last5Vol = hist.slice(-5).reduce((s, d) => s + d.volume, 0) / 5;
  const avg30Vol = hist.slice(-30).reduce((s, d) => s + d.volume, 0) / Math.min(30, n);
  const climax = last5Vol > avg30Vol * 2;
  // Price up but volume declining = bearish divergence
  const priceUp = hist[n - 1].close > hist[Math.max(n - 10, 0)].close;
  const volDown = last5Vol < avg30Vol * 0.7;
  const divergence = priceUp && volDown ? "bearish" : !priceUp && volDown ? "bullish" : "none";
  const accumulation = last5Vol > avg30Vol * 1.3 && priceUp ? "accumulating" : last5Vol > avg30Vol * 1.3 && !priceUp ? "distributing" : "neutral";
  return { climax, divergence, accumulation, ratio: +(last5Vol / avg30Vol).toFixed(2) };
};

// 4. MACD
const calcMACD = (hist) => {
  if (hist.length < 26) return null;
  const ema = (data, period) => { const k = 2 / (period + 1); let e = data[0]; return data.map(v => e = v * k + e * (1 - k)); };
  const closes = hist.map(d => d.close);
  const ema12 = ema(closes, 12), ema26 = ema(closes, 26);
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signal = ema(macdLine.slice(26), 9);
  const ml = macdLine[macdLine.length - 1], sl = signal[signal.length - 1];
  const prevMl = macdLine[macdLine.length - 2], prevSl = signal.length > 1 ? signal[signal.length - 2] : sl;
  const crossUp = prevMl <= prevSl && ml > sl, crossDn = prevMl >= prevSl && ml < sl;
  return { macd: +ml.toFixed(4), signal: +sl.toFixed(4), histogram: +(ml - sl).toFixed(4), crossUp, crossDn, bullish: ml > sl };
};

// 5. Fibonacci Retracement
const calcFib = (hist) => {
  if (hist.length < 20) return null;
  const recent = hist.slice(-60);
  const high = Math.max(...recent.map(d => d.high)), low = Math.min(...recent.map(d => d.low));
  const range = high - low;
  if (range === 0) return null;
  const current = hist[hist.length - 1].close;
  const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1].map(f => ({ level: f, label: `${(f * 100).toFixed(1)}%`, price: +(high - range * f).toFixed(4) }));
  const nearest = levels.reduce((best, l) => Math.abs(l.price - current) < Math.abs(best.price - current) ? l : best, levels[0]);
  return { levels, nearest, high, low, currentPct: +((high - current) / range * 100).toFixed(1) };
};

// 6. Volatility Regime Detection
const volRegime = (hist) => {
  if (hist.length < 40) return { regime: "unknown", transition: "none" };
  const vol20 = (() => { const r = hist.slice(-20).map((d, i, a) => i > 0 ? Math.abs((d.close - a[i - 1].close) / a[i - 1].close) : 0).slice(1); return r.reduce((s, v) => s + v, 0) / r.length; })();
  const vol40 = (() => { const r = hist.slice(-40).map((d, i, a) => i > 0 ? Math.abs((d.close - a[i - 1].close) / a[i - 1].close) : 0).slice(1); return r.reduce((s, v) => s + v, 0) / r.length; })();
  const ratio = vol20 / vol40;
  const regime = vol20 * 252 * 100 > 50 ? "high" : vol20 * 252 * 100 > 25 ? "medium" : "low";
  const transition = ratio > 1.5 ? "expanding" : ratio < 0.6 ? "compressing" : "stable";
  return { regime, transition, vol20: +(vol20 * Math.sqrt(252) * 100).toFixed(1), vol40: +(vol40 * Math.sqrt(252) * 100).toFixed(1), ratio: +ratio.toFixed(2) };
};

// 7. Momentum Confluence (RSI + MACD + Stochastic + SMA alignment)
const momConfluence = (hist) => {
  if (hist.length < 30) return { score: 0, signals: 0, total: 4, bias: "neutral" };
  const L = hist[hist.length - 1];
  let bullSignals = 0, bearSignals = 0;
  // RSI
  if (L.rsi14 && L.rsi14 < 30) bullSignals++; else if (L.rsi14 && L.rsi14 > 70) bearSignals++;
  // SMA trend
  if (L.sma20 && L.sma50 && L.sma20 > L.sma50) bullSignals++; else if (L.sma20 && L.sma50) bearSignals++;
  // MACD
  const macd = calcMACD(hist);
  if (macd?.bullish) bullSignals++; else if (macd) bearSignals++;
  // Price vs BB
  if (L.bbLower && L.close < L.bbLower * 1.01) bullSignals++; else if (L.bbUpper && L.close > L.bbUpper * 0.99) bearSignals++;
  const net = bullSignals - bearSignals;
  return { score: net, bullish: bullSignals, bearish: bearSignals, total: 4, bias: net >= 2 ? "STRONG BULL" : net >= 1 ? "BULL" : net <= -2 ? "STRONG BEAR" : net <= -1 ? "BEAR" : "NEUTRAL" };
};

// 8. Seasonal Patterns
const seasonal = (hist) => {
  if (hist.length < 30) return null;
  const month = new Date().getMonth(); // 0-11
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  // Historical monthly bias (simplified — would use real data in production)
  const cryptoBias = [0.08, 0.05, -0.02, 0.12, -0.05, -0.03, 0.04, -0.01, -0.06, 0.15, 0.18, -0.04];
  const equityBias = [0.03, -0.01, 0.01, 0.04, -0.03, 0.02, 0.01, -0.02, -0.04, 0.03, 0.05, 0.04];
  const commodBias = [0.02, 0.01, 0.03, 0.02, -0.01, 0.04, 0.03, 0.01, -0.02, -0.01, -0.03, 0.01];
  return { month: monthNames[month], cryptoBias: +(cryptoBias[month] * 100).toFixed(1), equityBias: +(equityBias[month] * 100).toFixed(1), commodBias: +(commodBias[month] * 100).toFixed(1) };
};

// ─── PREDICTION ACCURACY SYSTEMS ───────────────────────────────────────────

// 10. Order Flow & Liquidity (simulated from volume profile)
const orderFlow = (hist) => {
  if (hist.length < 10) return { bidAsk: "balanced", whaleWall: null, liquidityThin: false, pressure: 0 };
  const L = hist[hist.length - 1], P = hist[hist.length - 2];
  const volRatio = L.volume / P.volume;
  const priceUp = L.close > P.close;
  // Large volume + price move = directional pressure
  const pressure = +(((priceUp ? 1 : -1) * Math.min(volRatio, 3) * 30) - 50 + 50).toFixed(0);
  const bidAsk = volRatio > 1.5 && priceUp ? "bid_heavy" : volRatio > 1.5 && !priceUp ? "ask_heavy" : "balanced";
  // Detect whale walls (unusual volume at specific price clusters)
  const avgVol = hist.slice(-20).reduce((s, d) => s + d.volume, 0) / 20;
  const whaleWall = L.volume > avgVol * 2.5 ? { price: L.close, type: priceUp ? "support" : "resistance", strength: +(volRatio).toFixed(1) } : null;
  const liquidityThin = hist.slice(-5).every(d => d.volume < avgVol * 0.6);
  return { bidAsk, whaleWall, liquidityThin, pressure: Math.min(100, Math.max(0, pressure)) };
};

// 11. On-Chain Proxy Metrics (simulated — real impl would use Glassnode/CryptoQuant)
const onChain = (hist, asset) => {
  if (!["BTC", "ETH", "SOL", "LINK", "AVAX"].includes(asset.id)) return null;
  const rng = seed(asset.s + hist.length);
  const exchangeFlow = rng() > 0.5 ? "outflow" : "inflow"; // outflow = bullish, inflow = bearish
  const whaleAccum = rng() > 0.4;
  const activeAddrTrend = rng() > 0.3 ? "rising" : "flat";
  const mvrv = +(1.5 + rng() * 3).toFixed(2); // 1-4.5, >3.5 = overheated
  return { exchangeFlow, whaleAccum, activeAddrTrend, mvrv, overheated: mvrv > 3.5, signal: exchangeFlow === "outflow" && whaleAccum ? "bullish" : exchangeFlow === "inflow" && !whaleAccum ? "bearish" : "neutral" };
};

// 12. Funding Rate & Open Interest (crypto futures proxy)
const fundingRate = (hist, asset) => {
  if (!["BTC", "ETH", "SOL", "LINK", "AVAX"].includes(asset.id)) return null;
  const rng = seed(asset.s + hist.length * 2);
  const rate = +((rng() - 0.45) * 0.15).toFixed(4); // -0.07 to +0.08
  const oiChange = +((rng() - 0.5) * 20).toFixed(1); // -10% to +10%
  const longShortRatio = +(0.8 + rng() * 0.8).toFixed(2);
  const squeezRisk = rate > 0.05 ? "long_squeeze" : rate < -0.03 ? "short_squeeze" : "none";
  return { rate, oiChange, longShortRatio, squeezRisk, signal: rate > 0.05 ? "bearish" : rate < -0.03 ? "bullish" : "neutral" };
};

// 13. Economic Calendar & Events (simplified)
const eventCalendar = (asset) => {
  const events = [
    { date: "2026-03-18", event: "FOMC Meeting", impact: "HIGH", affects: ["BTC", "ETH", "GOLD", "FEDCUT", "NVDA"] },
    { date: "2026-03-19", event: "CPI Release", impact: "HIGH", affects: ["GOLD", "SILVER", "BTC", "FEDCUT", "OIL"] },
    { date: "2026-03-20", event: "Options Expiry (OpEx)", impact: "MEDIUM", affects: ["BTC", "ETH", "NVDA", "TSLA", "AAPL"] },
    { date: "2026-03-22", event: "Nvidia Earnings", impact: "HIGH", affects: ["NVDA", "ARM"] },
    { date: "2026-03-25", event: "BOJ Rate Decision", impact: "MEDIUM", affects: ["GOLD", "BTC"] },
  ];
  const upcoming = events.filter(e => e.affects.includes(asset.id));
  const daysOut = upcoming.map(e => { const d = (new Date(e.date) - new Date()) / 864e5; return { ...e, daysOut: +d.toFixed(0) }; }).filter(e => e.daysOut >= 0 && e.daysOut <= 7);
  return { events: daysOut, hasHighImpact: daysOut.some(e => e.impact === "HIGH"), daysToNext: daysOut.length ? daysOut[0].daysOut : null, eventRisk: daysOut.length > 0 ? "elevated" : "low" };
};

// 14. Sentiment Divergence (price vs sentiment direction)
const sentDivergence = (hist, asset) => {
  const priceDir = hist[hist.length - 1].close > hist[Math.max(hist.length - 8, 0)].close ? "up" : "down";
  const newsHits = NEWS.filter(n => n.impact.includes(asset.id));
  const avgSent = newsHits.length ? newsHits.reduce((s, n) => s + n.sent, 0) / newsHits.length : 0;
  const sentDir = avgSent > 0.2 ? "bullish" : avgSent < -0.2 ? "bearish" : "neutral";
  const divergent = (priceDir === "down" && sentDir === "bullish") || (priceDir === "up" && sentDir === "bearish");
  return { priceDir, sentDir, avgSent: +avgSent.toFixed(2), divergent, signal: divergent ? (sentDir === "bullish" ? "hidden_bull" : "hidden_bear") : "aligned" };
};

// 15. Mean Reversion Detector
const meanReversion = (hist) => {
  if (hist.length < 50 || !hist[hist.length - 1].sma50) return null;
  const L = hist[hist.length - 1];
  const devFromSMA50 = +((L.close - L.sma50) / L.sma50 * 100).toFixed(2);
  // Calculate std dev of deviations
  const devs = hist.slice(-50).filter(d => d.sma50).map(d => (d.close - d.sma50) / d.sma50 * 100);
  const mean = devs.reduce((s, v) => s + v, 0) / devs.length;
  const stdDev = Math.sqrt(devs.reduce((s, v) => s + (v - mean) ** 2, 0) / devs.length);
  const zScore = stdDev > 0 ? +((devFromSMA50 - mean) / stdDev).toFixed(2) : 0;
  const signal = zScore > 2 ? "overbought" : zScore < -2 ? "oversold" : zScore > 1 ? "extended_up" : zScore < -1 ? "extended_down" : "normal";
  return { devFromSMA50, zScore, stdDev: +stdDev.toFixed(2), signal, reversionTarget: +L.sma50.toFixed(4), reversionPct: +(-devFromSMA50).toFixed(1) };
};

// 16. Multi-Timeframe Trend Alignment
const mtfAlignment = (hist) => {
  if (hist.length < 60) return { aligned: false, daily: "—", weekly: "—", monthly: "—", strength: 0 };
  const L = hist[hist.length - 1];
  const d7 = hist[Math.max(hist.length - 8, 0)];
  const d30 = hist[Math.max(hist.length - 31, 0)];
  const d60 = hist[Math.max(hist.length - 61, 0)];
  const daily = L.close > d7.close ? "BULL" : "BEAR";
  const weekly = d7.close > d30.close ? "BULL" : "BEAR";
  const monthly = d30.close > d60.close ? "BULL" : "BEAR";
  const aligned = daily === weekly && weekly === monthly;
  const strength = (daily === "BULL" ? 1 : -1) + (weekly === "BULL" ? 1 : -1) + (monthly === "BULL" ? 1 : -1);
  return { aligned, daily, weekly, monthly, strength, direction: strength > 0 ? "BULL" : strength < 0 ? "BEAR" : "MIXED" };
};

// 17. Relative Strength Ranking (vs all tracked assets)
const relStrength = (hist, allHist) => {
  if (hist.length < 20) return { rank: 0, percentile: 50, quartile: 2 };
  const myRet = (hist[hist.length - 1].close - hist[Math.max(hist.length - 21, 0)].close) / hist[Math.max(hist.length - 21, 0)].close;
  const allRets = Object.values(allHist).filter(h => h.length >= 20).map(h => (h[h.length - 1].close - h[Math.max(h.length - 21, 0)].close) / h[Math.max(h.length - 21, 0)].close).sort((a, b) => b - a);
  const rank = allRets.indexOf(allRets.find(r => r <= myRet)) + 1;
  const percentile = allRets.length > 0 ? +((1 - rank / allRets.length) * 100).toFixed(0) : 50;
  return { rank, total: allRets.length, percentile, quartile: percentile > 75 ? 1 : percentile > 50 ? 2 : percentile > 25 ? 3 : 4, ret20d: +(myRet * 100).toFixed(2) };
};

// 18. Volatility-Adjusted Return (Z-Score)
const volAdjReturn = (hist) => {
  if (hist.length < 30) return { zScore: 0, significant: false };
  const rets = hist.slice(-30).map((d, i, a) => i > 0 ? (d.close - a[i - 1].close) / a[i - 1].close * 100 : 0).slice(1);
  const mean = rets.reduce((s, r) => s + r, 0) / rets.length;
  const stdDev = Math.sqrt(rets.reduce((s, r) => s + (r - mean) ** 2, 0) / rets.length);
  const lastRet = rets[rets.length - 1];
  const zScore = stdDev > 0 ? +((lastRet - mean) / stdDev).toFixed(2) : 0;
  return { zScore, lastRet: +lastRet.toFixed(2), mean: +mean.toFixed(2), stdDev: +stdDev.toFixed(2), significant: Math.abs(zScore) > 2 };
};

// 19. Implied vs Realized Volatility Gap
const volGap = (hist) => {
  if (hist.length < 30) return null;
  const realized = +(hist.slice(-20).map((d, i, a) => i > 0 ? Math.abs((d.close - a[i - 1].close) / a[i - 1].close) : 0).slice(1).reduce((s, v) => s + v, 0) / 19 * Math.sqrt(252) * 100).toFixed(1);
  // Implied vol proxy: use ATR-based estimate (real impl would use options chain)
  const implied = hist[hist.length - 1].atr14 ? +(hist[hist.length - 1].atr14 / hist[hist.length - 1].close * Math.sqrt(252) * 100).toFixed(1) : realized;
  const gap = +(implied - realized).toFixed(1);
  const signal = gap > 10 ? "overpriced_vol" : gap < -10 ? "underpriced_vol" : "fair";
  return { implied, realized, gap, signal, premiumSelling: gap > 10 };
};

// 9. Aggregate pattern score — now includes all new systems
const patternScore = (candles, volProf, macd, confluence, volReg, fib, oFlow, onCh, funding, events, sentDiv, meanRev, mtf, relStr, volAdj, vGap) => {
  let score = 50;
  const bullCandles = candles.filter(c => c.dir === "bullish").length;
  const bearCandles = candles.filter(c => c.dir === "bearish").length;
  score += (bullCandles - bearCandles) * 4;
  if (volProf.accumulation === "accumulating") score += 6; if (volProf.accumulation === "distributing") score -= 6;
  if (volProf.divergence === "bearish") score -= 8; if (volProf.divergence === "bullish") score += 5;
  if (macd?.crossUp) score += 10; if (macd?.crossDn) score -= 10;
  if (macd?.bullish) score += 3; else if (macd) score -= 3;
  score += confluence.score * 5;
  if (volReg.transition === "compressing") score += 2;
  if (volReg.transition === "expanding" && volReg.regime === "high") score -= 4;
  if (fib && fib.currentPct > 60) score += 4; if (fib && fib.currentPct < 25) score -= 4;
  // New systems
  if (oFlow.bidAsk === "bid_heavy") score += 5; if (oFlow.bidAsk === "ask_heavy") score -= 5;
  if (oFlow.liquidityThin) score -= 3; // thin liquidity = unpredictable
  if (onCh?.signal === "bullish") score += 6; if (onCh?.signal === "bearish") score -= 6;
  if (funding?.signal === "bullish") score += 4; if (funding?.signal === "bearish") score -= 4;
  if (funding?.squeezRisk === "short_squeeze") score += 5; if (funding?.squeezRisk === "long_squeeze") score -= 5;
  if (events?.hasHighImpact) score *= 0.9; // reduce confidence near events (binary risk)
  if (sentDiv?.divergent && sentDiv.signal === "hidden_bull") score += 6;
  if (sentDiv?.divergent && sentDiv.signal === "hidden_bear") score -= 6;
  if (meanRev?.signal === "oversold") score += 7; if (meanRev?.signal === "overbought") score -= 7;
  if (meanRev?.signal === "extended_up") score -= 3; if (meanRev?.signal === "extended_down") score += 3;
  if (mtf?.aligned && mtf.direction === "BULL") score += 8;
  if (mtf?.aligned && mtf.direction === "BEAR") score -= 8;
  if (relStr?.quartile === 1) score += 5; if (relStr?.quartile === 4) score -= 5; // relative strength momentum
  if (volAdj?.significant && volAdj.zScore > 2) score -= 3; // unusually large move, caution
  if (volAdj?.significant && volAdj.zScore < -2) score += 3; // oversold on vol-adjusted basis
  if (vGap?.signal === "underpriced_vol") score -= 2; // vol expansion coming
  return Math.min(100, Math.max(0, +score.toFixed(0)));
};

const analyze = (asset, hist, cfg, allPd) => {
  const L = hist[hist.length - 1], P = hist[hist.length - 2], W = hist[Math.max(hist.length - 8, 0)], M = hist[Math.max(hist.length - 31, 0)];
  const dR = +((L.close - P.close) / P.close * 100).toFixed(2), wR = +((L.close - W.close) / W.close * 100).toFixed(2), mR = +((L.close - M.close) / M.close * 100).toFixed(2);
  const rets = hist.slice(-30).map((d, i, a) => i > 0 ? (d.close - a[i - 1].close) / a[i - 1].close : 0).slice(1);
  const avg = rets.reduce((s, r) => s + r, 0) / rets.length;
  const vol = +(Math.sqrt(rets.reduce((s, r) => s + (r - avg) ** 2, 0) / rets.length) * Math.sqrt(252) * 100).toFixed(1);
  const trend = L.sma20 && L.sma50 ? (L.sma20 > L.sma50 ? "BULL" : "BEAR") : "—";
  const mom = +Math.min(100, Math.max(0, 50 + mR * 3 + wR * 5)).toFixed(0);
  const rsi = L.rsi14 || 50;
  const geoHits = GEO.filter(e => e.impact.includes(asset.id));
  const geoScore = geoHits.reduce((s, e) => s + (e.sev === "CRITICAL" ? 30 : e.sev === "HIGH" ? 20 : 10) * (e.dir === "bullish" ? 1 : e.dir === "bearish" ? -1 : 0), 0);
  // Pattern Recognition (original 8)
  const candles = detectCandles(hist);
  const sr = detectSR(hist);
  const volProf = volumeProfile(hist);
  const macd = calcMACD(hist);
  const fib = calcFib(hist);
  const volReg = volRegime(hist);
  const confluence = momConfluence(hist);
  const season = seasonal(hist);
  // New prediction systems (10)
  const oFlow = orderFlow(hist);
  const onCh = onChain(hist, asset);
  const funding = fundingRate(hist, asset);
  const events = eventCalendar(asset);
  const sentDiv = sentDivergence(hist, asset);
  const meanRev = meanReversion(hist);
  const mtf = mtfAlignment(hist);
  const relStr = relStrength(hist, allPd || {});
  const volAdj = volAdjReturn(hist);
  const vGap = volGap(hist);
  const patScore = patternScore(candles, volProf, macd, confluence, volReg, fib, oFlow, onCh, funding, events, sentDiv, meanRev, mtf, relStr, volAdj, vGap);
  // Dalio scores
  const ds = { sys: +Math.min(100, Math.max(10, Math.abs(dR) < vol / 16 ? 80 : 40 + (rsi > 30 && rsi < 70 ? 20 : 0))).toFixed(0), rpr: +Math.max(5, 100 - vol * 1.8).toFixed(0), div: 65, ecm: +Math.min(100, Math.max(5, 50 + geoScore + (DEBT.pos > 60 ? -10 : 10))).toFixed(0), prg: +(mR < -5 ? 25 : mR > 10 ? 85 : 55 + mR * 2).toFixed(0), rad: 70, mom: +(trend === "BULL" && mR > 0 ? 80 : trend === "BEAR" && mR < -5 ? 20 : 50 + mR).toFixed(0), ind: +(rsi < 30 ? 85 : rsi > 70 ? 30 : 50).toFixed(0) };
  const comp = +(ds.sys * DALIO.SYS.w + ds.rpr * DALIO.RPR.w + ds.div * DALIO.DIV.w + ds.ecm * DALIO.ECM.w + ds.prg * DALIO.PRG.w + ds.rad * DALIO.RAD.w + ds.mom * DALIO.MOM.w + ds.ind * DALIO.IND.w).toFixed(1);
  const atr = L.atr14 || L.close * 0.02;
  const stopP = cfg.useAtr ? +(L.close - atr * cfg.atrMult).toFixed(4) : +(L.close * (1 - cfg.stopPct / 100)).toFixed(4);
  const stopDist = +(((L.close - stopP) / L.close) * 100).toFixed(2);
  const posSize = +(cfg.portfolio * (cfg.maxRisk / 100) / (stopDist / 100)).toFixed(0);
  const tp = +(L.close + (L.close - stopP) * cfg.rr).toFixed(4);
  const sig = comp * 0.25 + mom * 0.15 + patScore * 0.25 + (50 + geoScore) * 0.1 + (rsi > 50 ? 10 : rsi < 30 ? -5 : 0) * 0.05 + confluence.score * 2 + (mtf?.aligned ? (mtf.direction === "BULL" ? 5 : -5) : 0) + (relStr?.quartile === 1 ? 3 : relStr?.quartile === 4 ? -3 : 0);
  let rec = "HOLD", conf = 50;
  if (sig > 72) { rec = "STRONG BUY"; conf = Math.min(95, +sig.toFixed(0)); } else if (sig > 60) { rec = "BUY"; conf = +sig.toFixed(0); } else if (sig < 33) { rec = "STRONG SELL"; conf = Math.min(95, +(100 - sig).toFixed(0)); } else if (sig < 44) { rec = "SELL"; conf = +(100 - sig).toFixed(0); }
  return { id: asset.id, name: asset.name, sector: asset.sector, price: L.close, dR, wR, mR, vol, trend, mom, rsi, atr: +atr.toFixed(4), bb: { u: L.bbUpper, l: L.bbLower, m: L.bbMid }, sma: { s20: L.sma20, s50: L.sma50 }, geoHits, geoScore, dalio: { comp, ...ds }, rec, conf, posSize: Math.max(0, posSize), stop: stopP, stopDist, tp, short: trend === "BEAR" && mR < -3 && vol > 30 && geoScore < 0, bt: bt(hist), ts: new Date().toISOString(),
    patterns: { candles, sr, volProf, macd, fib, volReg, confluence, season, patScore, oFlow, onChain: onCh, funding, events, sentDiv, meanRev, mtf, relStr, volAdj, volGap: vGap }
  };
};

// ═══ VISUAL CHART COMPONENTS ═══════════════════════════════════════════════

// Price + BB + SMA Chart
const PriceChart = ({ data, w = 600, h = 75, showBB }) => {
  if (!data || data.length < 3) return null;
  const p = data.map(d => d.close);
  const vals = [...p, ...(showBB ? data.filter(d => d.bbLower).map(d => d.bbLower) : []), ...(showBB ? data.filter(d => d.bbUpper).map(d => d.bbUpper) : [])];
  const mn = Math.min(...vals) * 0.999, mx = Math.max(...vals) * 1.001, rng = mx - mn || 1;
  const X = i => (i / (data.length - 1)) * w, Y = v => h - ((v - mn) / rng) * h;
  const path = data.map((d, i) => `${i ? "L" : "M"}${X(i)},${Y(d.close)}`).join("");
  const up = p[p.length - 1] >= p[0]; const col = up ? T.acc : T.danger;
  const s20 = data.filter(d => d.sma20).map((d, i) => `${i ? "L" : "M"}${X(data.indexOf(d))},${Y(d.sma20)}`).join("");
  const s50 = data.filter(d => d.sma50).map((d, i) => `${i ? "L" : "M"}${X(data.indexOf(d))},${Y(d.sma50)}`).join("");
  let bbA = "";
  if (showBB) { const bb = data.filter(d => d.bbUpper); if (bb.length > 1) { bbA = bb.map((d, i) => `${i ? "L" : "M"}${X(data.indexOf(d))},${Y(d.bbUpper)}`).join("") + [...bb].reverse().map(d => `L${X(data.indexOf(d))},${Y(d.bbLower)}`).join("") + " Z"; } }
  const gridY = [0.25, 0.5, 0.75].map(f => mn + rng * f);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <defs><linearGradient id={`pg${up ? 1 : 0}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={col} stopOpacity="0.08" /><stop offset="100%" stopColor={col} stopOpacity="0" /></linearGradient></defs>
      {gridY.map((v, i) => <line key={i} x1="0" y1={Y(v)} x2={w} y2={Y(v)} stroke="rgba(255,255,255,0.02)" strokeWidth="0.2" />)}
      {bbA && <path d={bbA} fill="rgba(123,97,255,0.03)" />}
      <path d={`${path} L${w},${h} L0,${h} Z`} fill={`url(#pg${up ? 1 : 0})`} />
      <path d={path} fill="none" stroke={col} strokeWidth="0.5" />
      {s20 && <path d={s20} fill="none" stroke={T.warn} strokeWidth="0.3" strokeDasharray="1.5,1.5" opacity="0.35" />}
      {s50 && <path d={s50} fill="none" stroke={T.acc2} strokeWidth="0.3" strokeDasharray="1.5,1.5" opacity="0.35" />}
      <text x="2" y="5" fill={T.t4} fontSize="5.5">{mx.toFixed(mx > 100 ? 0 : 2)}</text>
      <text x="2" y={h - 1} fill={T.t4} fontSize="5.5">{mn.toFixed(mn > 100 ? 0 : 2)}</text>
    </svg>
  );
};

// Volume Bars
const VolBars = ({ data, w = 600, h = 14 }) => {
  if (!data || data.length < 2) return null;
  const mx = Math.max(...data.map(d => d.volume)); const bw = w / data.length;
  return <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto", display: "block" }}>{data.map((d, i) => <rect key={i} x={i * bw} y={h - (d.volume / mx) * h} width={Math.max(bw - 0.2, 0.2)} height={(d.volume / mx) * h} fill={i > 0 && d.close >= data[i - 1].close ? "rgba(0,232,123,0.15)" : "rgba(255,45,85,0.15)"} />)}</svg>;
};

// RSI Oscillator Chart
const RSIChart = ({ data, w = 600, h = 24 }) => {
  const rsiData = data.filter(d => d.rsi14);
  if (rsiData.length < 3) return null;
  const X = i => (i / (rsiData.length - 1)) * w, Y = v => h - (v / 100) * h;
  const path = rsiData.map((d, i) => `${i ? "L" : "M"}${X(i)},${Y(d.rsi14)}`).join("");
  const last = rsiData[rsiData.length - 1].rsi14;
  const col = last > 70 ? T.danger : last < 30 ? T.acc : T.purple;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <rect x="0" y={Y(70)} width={w} height={Y(30) - Y(70)} fill="rgba(255,255,255,0.015)" />
      <line x1="0" y1={Y(70)} x2={w} y2={Y(70)} stroke="rgba(255,45,85,0.1)" strokeWidth="0.2" strokeDasharray="2,2" />
      <line x1="0" y1={Y(30)} x2={w} y2={Y(30)} stroke="rgba(0,232,123,0.1)" strokeWidth="0.2" strokeDasharray="2,2" />
      <line x1="0" y1={Y(50)} x2={w} y2={Y(50)} stroke="rgba(255,255,255,0.02)" strokeWidth="0.2" />
      <path d={path} fill="none" stroke={col} strokeWidth="0.4" />
      <circle cx={X(rsiData.length - 1)} cy={Y(last)} r="1" fill={col} />
      <text x={w - 2} y={Y(70) - 0.5} fill="rgba(255,45,85,0.25)" fontSize="6" textAnchor="end">70</text>
      <text x={w - 2} y={Y(30) + 3.5} fill="rgba(0,232,123,0.25)" fontSize="6" textAnchor="end">30</text>
      <text x={X(rsiData.length - 1) + 2} y={Y(last) + 1.5} fill={col} fontSize="5.5" fontWeight="700">{last}</text>
    </svg>
  );
};

// Dalio Radar Chart
const RadarChart = ({ values, size = 180 }) => {
  const keys = Object.keys(DALIO);
  const n = keys.length;
  const cx = size / 2, cy = size / 2, r = size * 0.38;
  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i, pct) => ({ x: cx + r * pct * Math.cos(angle(i)), y: cy + r * pct * Math.sin(angle(i)) });
  const rings = [0.25, 0.5, 0.75, 1];
  const dataPath = keys.map((k, i) => { const p = pt(i, (values[k.toLowerCase()] || 0) / 100); return `${i ? "L" : "M"}${p.x},${p.y}`; }).join("") + "Z";
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", maxWidth: size, height: "auto", display: "block", margin: "0 auto" }}>
      {rings.map((rv, ri) => <polygon key={ri} points={keys.map((_, i) => { const p = pt(i, rv); return `${p.x},${p.y}`; }).join(" ")} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />)}
      {keys.map((_, i) => { const p = pt(i, 1); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />; })}
      <polygon points={keys.map((k, i) => { const p = pt(i, (values[k.toLowerCase()] || 0) / 100); return `${p.x},${p.y}`; }).join(" ")} fill="rgba(0,232,123,0.08)" stroke={T.acc} strokeWidth="1.2" />
      {keys.map((k, i) => { const p = pt(i, (values[k.toLowerCase()] || 0) / 100); return <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={T.acc} />; })}
      {keys.map((k, i) => { const p = pt(i, 1.18); return <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fill={T.t3} fontSize="6.5" fontWeight="600">{DALIO[k].name}</text>; })}
      <text x={cx} y={cx} textAnchor="middle" dominantBaseline="middle" fill={T.acc} fontSize="14" fontWeight="800">{values.comp}</text>
    </svg>
  );
};

// Donut Chart
const DonutChart = ({ segments, size = 140, label }) => {
  const total = segments.reduce((s, seg) => s + seg.v, 0);
  const cx = size / 2, cy = size / 2, r = size * 0.38, sw = size * 0.09;
  let cum = 0;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", maxWidth: size, height: "auto", display: "block", margin: "0 auto" }}>
      {segments.map((seg, i) => {
        const start = cum / total * 2 * Math.PI - Math.PI / 2;
        cum += seg.v;
        const end = cum / total * 2 * Math.PI - Math.PI / 2;
        const large = (end - start) > Math.PI ? 1 : 0;
        const d = `M${cx + r * Math.cos(start)},${cy + r * Math.sin(start)} A${r},${r} 0 ${large} 1 ${cx + r * Math.cos(end)},${cy + r * Math.sin(end)}`;
        return <path key={i} d={d} fill="none" stroke={seg.c} strokeWidth={sw} strokeLinecap="round" />;
      })}
      {label && <text x={cx} y={cy - 3} textAnchor="middle" fill={T.t1} fontSize="11" fontWeight="800">{label}</text>}
      <text x={cx} y={cy + 9} textAnchor="middle" fill={T.t3} fontSize="6">{total} total</text>
    </svg>
  );
};

// Horizontal Bar Chart
const HBarChart = ({ items, w = 300, barH = 12 }) => {
  const maxAbs = Math.max(...items.map(i => Math.abs(i.v)), 1);
  const h = items.length * (barH + 3) + 2;
  const mid = w * 0.4;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto", display: "block" }}>
      {items.map((item, i) => {
        const y = i * (barH + 3) + 1;
        const bw = (Math.abs(item.v) / maxAbs) * (w * 0.42);
        const isPos = item.v >= 0;
        return (
          <g key={i}>
            <text x={mid - 6} y={y + barH / 2 + 0.5} textAnchor="end" fill={T.t2} fontSize="6" fontWeight="600" dominantBaseline="middle">{item.label}</text>
            <rect x={isPos ? mid : mid - bw} y={y} width={bw} height={barH} rx="2" fill={isPos ? T.acc : T.danger} opacity="0.15" />
            <rect x={isPos ? mid : mid - bw} y={y} width={bw} height={barH} rx="2" fill="none" stroke={isPos ? T.acc : T.danger} strokeWidth="0.4" opacity="0.4" />
            <text x={isPos ? mid + bw + 3 : mid - bw - 3} y={y + barH / 2 + 0.5} textAnchor={isPos ? "start" : "end"} fill={isPos ? T.acc : T.danger} fontSize="6" fontWeight="700" dominantBaseline="middle">{isNaN(item.v) ? "—" : `${item.v > 0 ? "+" : ""}${item.v}%`}</text>
          </g>
        );
      })}
      <line x1={mid} y1="0" x2={mid} y2={h} stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" />
    </svg>
  );
};

// Correlation Heatmap Cell Grid
const CorrHeatmap = ({ matrix, ids, maxCorr }) => {
  const sz = 16, pad = 40;
  const w = pad + ids.length * sz, h = pad + ids.length * sz;
  const colFor = v => { if (v >= 0.6) return T.acc; if (v >= 0.3) return "rgba(0,232,123,0.5)"; if (v <= -0.6) return T.danger; if (v <= -0.3) return "rgba(255,45,85,0.5)"; return "rgba(255,255,255,0.1)"; };
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto", display: "block" }}>
      {ids.map((a, ai) => <text key={`r${ai}`} x={pad - 3} y={pad + ai * sz + sz / 2 + 1} textAnchor="end" fill={T.t3} fontSize="6" dominantBaseline="middle">{a}</text>)}
      {ids.map((b, bi) => <text key={`c${bi}`} x={pad + bi * sz + sz / 2} y={pad - 4} textAnchor="middle" fill={T.t3} fontSize="6" transform={`rotate(-45,${pad + bi * sz + sz / 2},${pad - 4})`}>{b}</text>)}
      {ids.map((a, ai) => ids.map((b, bi) => {
        const v = matrix[a]?.[b] || 0; const abs = Math.abs(v);
        return <g key={`${ai}-${bi}`}>
          <rect x={pad + bi * sz} y={pad + ai * sz} width={sz - 1} height={sz - 1} rx="2" fill={a === b ? "rgba(255,255,255,0.03)" : colFor(v)} opacity={a === b ? 1 : Math.max(0.15, abs * 0.7)} stroke={abs > maxCorr && a !== b ? T.danger : "none"} strokeWidth="0.8" />
          {a !== b && abs > 0.15 && <text x={pad + bi * sz + sz / 2 - 0.5} y={pad + ai * sz + sz / 2 + 1} textAnchor="middle" dominantBaseline="middle" fill={abs > 0.5 ? "#fff" : T.t3} fontSize="5.5" fontWeight={abs > 0.5 ? "700" : "400"}>{v.toFixed(2)}</text>}
        </g>;
      }))}
    </svg>
  );
};

// Debt Cycle Arc Gauge
const CycleGauge = ({ pos, size = 180 }) => {
  const cx = size / 2, cy = size * 0.55, r = size * 0.42, sw = 8;
  const startA = Math.PI * 0.85, endA = Math.PI * 0.15;
  const totalA = (2 * Math.PI) - (startA - endA);
  const pctA = startA - (pos / 100) * totalA;
  const arcPt = (a) => ({ x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) });
  const s = arcPt(startA), e = arcPt(endA), p = arcPt(pctA);
  const labels = [{ t: "Recovery", a: startA }, { t: "Growth", a: startA - totalA * 0.25 }, { t: "Peak", a: startA - totalA * 0.5 }, { t: "Slowdown", a: startA - totalA * 0.75 }, { t: "Recession", a: endA }];
  return (
    <svg viewBox={`0 0 ${size} ${size * 0.7}`} style={{ width: "100%", maxWidth: size, height: "auto", display: "block", margin: "0 auto" }}>
      <path d={`M${s.x},${s.y} A${r},${r} 0 1 0 ${e.x},${e.y}`} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw} strokeLinecap="round" />
      <path d={`M${s.x},${s.y} A${r},${r} 0 ${totalA * (pos / 100) > Math.PI ? 1 : 0} 0 ${p.x},${p.y}`} fill="none" stroke={`url(#cycleGrad)`} strokeWidth={sw} strokeLinecap="round" />
      <defs><linearGradient id="cycleGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={T.acc} /><stop offset="50%" stopColor={T.warn} /><stop offset="100%" stopColor={T.danger} /></linearGradient></defs>
      <circle cx={p.x} cy={p.y} r="5" fill={T.warn} stroke={T.bg} strokeWidth="2" />
      <text x={cx} y={cy - 6} textAnchor="middle" fill={T.t1} fontSize="16" fontWeight="800">{pos}</text>
      <text x={cx} y={cy + 7} textAnchor="middle" fill={T.t3} fontSize="6">/100</text>
      {labels.map((lb, i) => { const lp = arcPt(lb.a); const ox = (lp.x - cx) * 0.2, oy = (lp.y - cy) * 0.2; return <text key={i} x={lp.x + ox} y={lp.y + oy} textAnchor="middle" fill={T.t4} fontSize="6">{lb.t}</text>; })}
    </svg>
  );
};

// Sparkline (tiny)
const Spark = ({ data, w = 80, h = 20 }) => {
  if (!data || data.length < 3) return null;
  const p = data.map(d => d.close); const mn = Math.min(...p), mx = Math.max(...p), rng = mx - mn || 1;
  const pts = p.map((v, i) => `${(i / (p.length - 1)) * w},${h - ((v - mn) / rng) * h}`).join(" ");
  const up = p[p.length - 1] >= p[0];
  return <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto" }}><polyline points={pts} fill="none" stroke={up ? T.acc : T.danger} strokeWidth="1.2" /></svg>;
};

// Sentiment Bar
const SentBar = ({ value, w = 80, h = 6 }) => {
  const pct = (value + 1) / 2;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", maxWidth: w, height: h }}>
      <rect x="0" y="0" width={w} height={h} rx={h / 2} fill="rgba(255,255,255,0.04)" />
      <rect x="0" y="0" width={w * pct} height={h} rx={h / 2} fill={value > 0.3 ? T.acc : value < -0.3 ? T.danger : T.warn} opacity="0.6" />
    </svg>
  );
};

const Gauge = ({ value, label, size = 64 }) => {
  const pct = Math.min(+value / 100, 1), r = size / 2 - 4, cx = size / 2, cy = size / 2;
  const a = pct * 180, ex = cx + r * Math.cos(Math.PI * (180 - a) / 180), ey = cy - r * Math.sin(Math.PI * (180 - a) / 180);
  const col = pct > 0.65 ? T.acc : pct > 0.35 ? T.warn : T.danger;
  return (
    <div style={{ textAlign: "center", flex: "1 1 0" }}>
      <svg viewBox={`0 0 ${size} ${size / 2 + 6}`} style={{ width: "100%", maxWidth: size, height: "auto" }}>
        <path d={`M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" strokeLinecap="round" />
        {pct > 0.01 && <path d={`M${cx - r},${cy} A${r},${r} 0 ${a > 180 ? 1 : 0} 1 ${ex},${ey}`} fill="none" stroke={col} strokeWidth="3.5" strokeLinecap="round" />}
        <text x={cx} y={cy - 1} textAnchor="middle" fill={col} fontSize="11" fontWeight="800">{value}</text>
      </svg>
      <div style={{ fontSize: 12, color: T.t3, letterSpacing: 0.6, marginTop: -1 }}>{label}</div>
    </div>
  );
};

// ─── SMALL COMPONENTS ──────────────────────────────────────────────────────
const Pill = ({ children, c = T.t2, bg = "rgba(255,255,255,0.05)", onClick, style = {} }) => <span className="pill" onClick={onClick} style={{ background: bg, color: c, ...style, ...(onClick ? { cursor: "pointer" } : {}) }}>{children}</span>;
const SevBadge = ({ s }) => { const m = { CRITICAL: T.danger, HIGH: T.warn, MEDIUM: T.t2 }; return <Pill c={m[s] || T.t3} bg={m[s] === T.danger ? "rgba(255,45,85,0.12)" : m[s] === T.warn ? "rgba(245,166,35,0.12)" : "rgba(255,255,255,0.04)"}>{s}</Pill>; };
const RecPill = ({ r }) => { const c = r.includes("BUY") ? T.acc : r.includes("SELL") ? T.danger : T.warn; return <Pill c={c} bg={c === T.acc ? "rgba(0,232,123,0.12)" : c === T.danger ? "rgba(255,45,85,0.12)" : "rgba(245,166,35,0.12)"}>{r}</Pill>; };
const Btn = ({ children, onClick, v = "primary", full }) => {
  const s = { primary: { bg: `linear-gradient(135deg,${T.acc},#00b862)`, c: "#000" }, danger: { bg: `linear-gradient(135deg,${T.danger},#cc0040)`, c: "#fff" }, ghost: { bg: "rgba(255,255,255,0.06)", c: T.t2 }, purple: { bg: `linear-gradient(135deg,${T.purple},#5a3fd4)`, c: "#fff" } }[v];
  return <button onClick={onClick} className="btn" style={{ background: s.bg, color: s.c, width: full ? "100%" : undefined }}>{children}</button>;
};
const Stat = ({ l, v, s, c = T.acc }) => <div className="stat-card"><div className="label">{l}</div><div className="stat-val" style={{ color: c }}>{v}</div>{s && <div className="stat-sub">{s}</div>}</div>;

// ─── MAIN APP ──────────────────────────────────────────────────────────────
export default function App() {
  const [cat, setCat] = useState("crypto");
  const [sel, setSel] = useState(null);
  const [tab, setTab] = useState("overview");
  const [sideOpen, setSideOpen] = useState(false);
  const [cfgOpen, setCfgOpen] = useState(false);
  const [cfg, setCfg] = useState({ portfolio: 100000, maxRisk: 2, stopPct: 5, rr: 2.5, maxPos: 10, maxCorr: 0.6, atrMult: 2, useAtr: true, dalio: true, shorts: true, trail: true, trailPct: 3, timeStop: 14, drawdownHalt: 15 });
  const [pd, setPd] = useState({});
  const [anl, setAnl] = useState({});
  const [corr, setCorr] = useState({});
  const [trades, setTrades] = useState([]);
  const [journal, setJournal] = useState([]);
  const [watch, setWatch] = useState(["BTC", "GOLD", "NVDA"]);
  const [alerts, setAlerts] = useState([{ id: 1, asset: "BTC", cond: "vol_below", val: 25, and: "trend_bull", on: true, label: "BTC low vol+bull" }, { id: 2, asset: "OIL", cond: "price_above", val: 85, and: null, on: true, label: "OIL >$85" }]);
  const [log, setLog] = useState([]);
  const [scenario, setScenario] = useState(null);
  const [tick, setTick] = useState(0);
  const [scenAsset, setScenAsset] = useState("");
  const [liveData, setLiveData] = useState(null);
  const [liveStatus, setLiveStatus] = useState("SIMULATED");
  const [timeframe, setTimeframe] = useState(90);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizStep, setWizStep] = useState(0);
  const [wizChecks, setWizChecks] = useState({ coingecko: null, feargreed: null, coincap: null });
  const [wizProfile, setWizProfile] = useState({ experience: "", goal: "", horizon: "" });
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiAutoRun, setAiAutoRun] = useState(false);
  const [aiProvider, setAiProvider] = useState("anthropic_artifact");
  const AI_PROVIDERS = {
    anthropic_artifact: { name: "Claude (Built-in)", desc: "Uses the Anthropic API built into this Claude artifact. No key needed.", model: "claude-sonnet-4-20250514", keyNeeded: false, color: T.purple },
    anthropic: { name: "Anthropic API", desc: "Direct Anthropic API. Requires API key from console.anthropic.com", model: "claude-sonnet-4-20250514", keyNeeded: true, color: T.purple },
    anthropic_opus: { name: "Claude Opus", desc: "Most capable model. Higher cost. Requires Anthropic API key.", model: "claude-opus-4-20250514", keyNeeded: true, color: "#ff6b35" },
    openai_gpt4: { name: "OpenAI GPT-4o", desc: "OpenAI's GPT-4o model. Requires key from platform.openai.com", model: "gpt-4o", keyNeeded: true, color: T.acc },
    openai_o1: { name: "OpenAI o1", desc: "OpenAI's reasoning model. Best for complex analysis. Requires key.", model: "o1", keyNeeded: true, color: T.acc },
    openai_mini: { name: "GPT-4o Mini", desc: "Fast & cheap. Good for frequent auto-analysis. Requires key.", model: "gpt-4o-mini", keyNeeded: true, color: T.acc2 },
    deepseek: { name: "DeepSeek V3", desc: "Open-source quality at lowest cost. Requires key from platform.deepseek.com", model: "deepseek-chat", keyNeeded: true, color: T.acc2 },
    groq_llama: { name: "Groq (Llama 3)", desc: "Fastest inference. Free tier available. Get key at console.groq.com", model: "llama-3.3-70b-versatile", keyNeeded: true, color: T.warn },
    gemini: { name: "Google Gemini", desc: "Gemini 2.0 Flash. Free tier available. Get key at aistudio.google.com", model: "gemini-2.0-flash", keyNeeded: true, color: T.acc2 },
    ollama: { name: "Ollama (Local)", desc: "Run locally. Free, private. Requires Ollama running on localhost:11434", model: "llama3.1", keyNeeded: false, color: T.warn },
    custom: { name: "Custom Endpoint", desc: "Any OpenAI-compatible API. Set URL and key below.", model: "custom", keyNeeded: true, color: T.t2 },
  };
  const [aiConfig, setAiConfig] = useState({ openaiKey: "", deepseekKey: "", groqKey: "", geminiKey: "", ollamaUrl: "http://localhost:11434", customUrl: "", customKey: "", customModel: "" });
  const [chatOpen, setChatOpen] = useState(true);
  const [chatMsgs, setChatMsgs] = useState([{ role: "assistant", text: "Hi! I'm your Dalios AI assistant. I can see your portfolio, current page, and all asset data. Ask me anything — should you buy, sell, or hold? What's the outlook? I'll use the live data to answer." }]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [mktData, setMktData] = useState({ crypto: null, loading: false, ts: null });
  const [broker, setBroker] = useState({ active: null, apiKey: "", apiSecret: "", paper: true, connected: false });
  const [mktSearch, setMktSearch] = useState("");
  const [mktView, setMktView] = useState("all");
  const [conflictData, setConflictData] = useState({ feeds: [], loading: false, ts: null, geoFilter: "all" }); // "all" | "movers"
  const [apiKeys, setApiKeys] = useState({
    coingecko: { key: "", enabled: true, free: true, status: "default" },
    feargreed: { key: "", enabled: true, free: true, status: "default" },
    alphavantage: { key: "", enabled: false, free: true, status: "none" },
    finnhub: { key: "", enabled: false, free: true, status: "none" },
    anthropic: { key: "", enabled: false, free: false, status: "none" },
    binance: { key: "", secret: "", enabled: false, free: true, status: "none" },
    coinbase: { key: "", secret: "", enabled: false, free: false, status: "none" },
    alpaca: { key: "", secret: "", enabled: false, free: true, status: "none" },
    polygon: { key: "", enabled: false, free: true, status: "none" },
    newsapi: { key: "", enabled: false, free: true, status: "none" },
  });
  const [btResult, setBtResult] = useState(null);
  const [optResult, setOptResult] = useState(null);

  const all = useMemo(() => Object.values(ASSETS).flatMap(c => c.items), []);

  // ─── TRY LIVE DATA (CoinGecko + Fear&Greed) ──────────────────────────────
  useEffect(() => {
    const fetchLive = async () => {
      try {
        const [cgRes, fgRes] = await Promise.all([
          fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,chainlink,avalanche-2&vs_currencies=usd&include_24hr_change=true").then(r => r.ok ? r.json() : null).catch(() => null),
          fetch("https://api.alternative.me/fng/?limit=7").then(r => r.ok ? r.json() : null).catch(() => null),
        ]);
        if (cgRes || fgRes) {
          setLiveData({ crypto: cgRes, fearGreed: fgRes?.data || null, ts: new Date().toISOString() });
          setLiveStatus(cgRes ? "LIVE" : "PARTIAL");
          if (cgRes) {
            const map = { bitcoin: "BTC", ethereum: "ETH", solana: "SOL", chainlink: "LINK", "avalanche-2": "AVAX" };
            setPd(prev => {
              const n = { ...prev };
              Object.entries(map).forEach(([cgId, id]) => {
                if (cgRes[cgId] && n[id]) {
                  const arr = [...n[id]]; const l = { ...arr[arr.length - 1] };
                  l.close = cgRes[cgId].usd; l.price = cgRes[cgId].usd;
                  arr[arr.length - 1] = l; n[id] = arr;
                }
              });
              return n;
            });
          }
        }
      } catch { /* silent fallback to simulated */ }
    };
    fetchLive();
    const iv = setInterval(fetchLive, 30000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => { const d = {}; all.forEach(a => { d[a.id] = genHistory(a.base, a.vol, 120, a.s); }); setPd(d); }, []);
  useEffect(() => { const iv = setInterval(() => { setPd(prev => { const n = { ...prev }; all.forEach(a => { if (n[a.id]) { const arr = [...n[a.id]]; const l = { ...arr[arr.length - 1] }; const c = (Math.random() - 0.48) * a.vol * 0.15; l.close = +(l.close * (1 + c / 100)).toFixed(4); l.price = l.close; l.high = Math.max(l.high, l.close); l.low = Math.min(l.low, l.close); arr[arr.length - 1] = l; n[a.id] = arr; } }); return n; }); setTick(t => t + 1); }, 5000); return () => clearInterval(iv); }, []);
  useEffect(() => { if (!Object.keys(pd).length) return; const r = {}; all.forEach(a => { if (pd[a.id]) r[a.id] = analyze(a, pd[a.id], cfg, pd); }); setAnl(r); }, [pd, cfg]);
  useEffect(() => { if (!Object.keys(pd).length) return; const ids = all.map(a => a.id); const mx = {}; ids.forEach(a => { mx[a] = {}; ids.forEach(b => { if (a === b) mx[a][b] = 1; else if (mx[b]?.[a] !== undefined) mx[a][b] = mx[b][a]; else mx[a][b] = pd[a] && pd[b] ? corrPair(pd[a], pd[b]) : 0; }); }); setCorr(mx); }, [pd]);

  // Fetch broad market movers (crypto via CoinGecko, rest simulated)
  useEffect(() => {
    const fetchMarkets = async () => {
      setMktData(p => ({ ...p, loading: true }));
      let crypto = null;
      try {
        const r = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=30&sparkline=false&price_change_percentage=24h");
        if (r.ok) crypto = await r.json();
      } catch {}
      // Simulated commodity, ASX, forex movers (would be live API in production)
      const rng = seed(Date.now() % 10000);
      const simMovers = (names) => names.map(([sym, name, base]) => ({ sym, name, price: +(base * (0.95 + rng() * 0.1)).toFixed(2), chg24: +((rng() - 0.45) * 8).toFixed(2) }));
      const commodities = simMovers([["XAU", "Gold", 2340], ["XAG", "Silver", 28.5], ["CL", "Crude Oil", 78.4], ["NG", "Natural Gas", 2.14], ["HG", "Copper", 4.35], ["ZW", "Wheat", 5.82], ["ZS", "Soybeans", 11.8], ["PL", "Platinum", 1020], ["PA", "Palladium", 985], ["CC", "Cocoa", 8200]]);
      const asx = simMovers([["BHP", "BHP Group", 45.2], ["CBA", "CommBank", 128.5], ["CSL", "CSL Ltd", 285], ["WBC", "Westpac", 26.8], ["NAB", "NAB", 35.4], ["ANZ", "ANZ Group", 28.9], ["FMG", "Fortescue", 18.5], ["WDS", "Woodside", 27.3], ["RIO", "Rio Tinto", 118.5], ["MQG", "Macquarie", 195], ["TLS", "Telstra", 3.95], ["WES", "Wesfarmers", 62.8]]);
      const forex = simMovers([["AUDUSD", "AUD/USD", 0.665], ["EURUSD", "EUR/USD", 1.085], ["GBPUSD", "GBP/USD", 1.272], ["USDJPY", "USD/JPY", 149.5], ["USDCAD", "USD/CAD", 1.358], ["NZDUSD", "NZD/USD", 0.612], ["USDCHF", "USD/CHF", 0.878], ["EURGBP", "EUR/GBP", 0.853]]);
      const indices = simMovers([["SPX", "S&P 500", 5280], ["NDX", "Nasdaq 100", 18500], ["DJI", "Dow Jones", 39200], ["AXJO", "ASX 200", 7850], ["FTSE", "FTSE 100", 8100], ["DAX", "DAX 40", 18200], ["N225", "Nikkei 225", 39800], ["HSI", "Hang Seng", 17400]]);
      setMktData({ crypto, commodities, asx, forex, indices, loading: false, ts: new Date().toISOString() });
    };
    fetchMarkets();
    const iv = setInterval(fetchMarkets, 60000);
    return () => clearInterval(iv);
  }, []);

  // ─── CONFLICT INTELLIGENCE AGGREGATOR ──────────────────────────────────
  useEffect(() => {
    const fetchConflict = async () => {
      setConflictData(p => ({ ...p, loading: true }));
      const feeds = [];
      // Try fetching Reuters conflict RSS via a CORS proxy or direct
      const sources = [
        { name: "Reuters World", url: "https://feeds.reuters.com/reuters/worldNews", type: "rss" },
        { name: "ACLED", url: "https://api.acleddata.com/acled/read?terms=accept&limit=10", type: "json" },
      ];
      for (const src of sources) {
        try {
          const r = await fetch(src.url, { signal: AbortSignal.timeout(5000) });
          if (r.ok) {
            if (src.type === "json") {
              const d = await r.json();
              if (d.data) d.data.slice(0, 8).forEach(e => feeds.push({
                source: "ACLED", title: `${e.event_type}: ${e.sub_event_type}`,
                desc: `${e.country} — ${e.notes?.slice(0, 120) || e.location}`,
                date: e.event_date, fatalities: e.fatalities, region: e.region,
                cat: "conflict", sev: e.fatalities > 10 ? "HIGH" : e.fatalities > 0 ? "MEDIUM" : "LOW",
              }));
            }
          }
        } catch {}
      }
      // If no live feeds available, use curated conflict intel (always available)
      if (feeds.length === 0) {
        [
          { source: "OSINT", title: "Russian Kinzhal missile strikes Odesa port grain terminal", desc: "3 grain silos destroyed. 50K tons wheat lost. Black Sea shipping suspended 48h. Grain futures +4%.", date: "2026-03-16", cat: "conflict", sev: "HIGH", region: "E. Europe" },
          { source: "OSINT", title: "IDF ground operation in Rafah — 4 battalions deployed", desc: "Humanitarian corridor closed. Egypt border tensions. Regional escalation risk HIGH. Oil +$2.", date: "2026-03-15", cat: "conflict", sev: "CRITICAL", region: "Middle East" },
          { source: "OSINT", title: "Chinese coast guard fires water cannon at Philippine vessels", desc: "Second Thomas Shoal confrontation. US 7th Fleet repositioning. ASEAN emergency session called.", date: "2026-03-15", cat: "conflict", sev: "HIGH", region: "Asia-Pacific" },
          { source: "OSINT", title: "Wagner forces seize artisanal gold mine in Central African Republic", desc: "Russian proxy expanding mineral control. 200+ miners displaced. Gold supply from region -15%.", date: "2026-03-14", cat: "conflict", sev: "MEDIUM", region: "Africa" },
          { source: "OSINT", title: "Iranian IRGC fast boats harass US destroyer in Strait of Hormuz", desc: "3 boats came within 150m. US fired warning flares. Hormuz handles 21% of global oil. Risk premium +$3.", date: "2026-03-14", cat: "conflict", sev: "HIGH", region: "Middle East" },
          { source: "OSINT", title: "Myanmar resistance captures Lashio — junta's northern command falls", desc: "Key city controlling Shan State trade routes. China-Myanmar border disrupted. Rare earth shipments halted.", date: "2026-03-13", cat: "conflict", sev: "HIGH", region: "Asia-Pacific" },
          { source: "OSINT", title: "EU sanctions 12th Russian oil tanker — shadow fleet shrinking", desc: "Insurance void on 40+ tankers. India/China refiners scrambling for alternatives. Urals discount narrowing.", date: "2026-03-13", cat: "sanctions", sev: "MEDIUM", region: "Global" },
          { source: "OSINT", title: "Houthi launches first cruise missile at commercial vessel in Red Sea", desc: "Capability escalation — previous attacks were ballistic/drone only. Naval task force expanding rules of engagement.", date: "2026-03-12", cat: "conflict", sev: "CRITICAL", region: "Middle East" },
          { source: "Defense", title: "Poland orders 500 HIMARS launchers — largest NATO procurement", desc: "$10B deal. European defense stocks rally. Rheinmetall +8%, BAE +5%. NATO eastern flank hardening.", date: "2026-03-11", cat: "defense", sev: "MEDIUM", region: "Europe" },
          { source: "OSINT", title: "North Korea tests ICBM with potential MIRV capability", desc: "3 warhead separation detected. Japan activates missile defense. Regional risk elevated. Gold +1.2%.", date: "2026-03-10", cat: "conflict", sev: "HIGH", region: "Asia-Pacific" },
        ].forEach(f => feeds.push(f));
      }
      setConflictData({ feeds, loading: false, ts: new Date().toISOString(), geoFilter: conflictData.geoFilter });
    };
    fetchConflict();
    const iv2 = setInterval(fetchConflict, 300000); // 5min refresh
    return () => clearInterval(iv2);
  }, []);

  const addLog = m => setLog(p => [{ id: Date.now(), ts: new Date().toISOString(), m }, ...p.slice(0, 99)]);
  const exec = (a, action) => { setTrades(p => [{ id: Date.now(), asset: a.id, name: a.name, action, price: a.price, stop: a.stop, tp: a.tp, size: a.posSize, conf: a.conf, dalio: a.dalio.comp, ts: new Date().toISOString(), status: "OPEN" }, ...p]); addLog(`EXEC ${action} ${a.id} @$${a.price} SL:$${a.stop} TP:$${a.tp}`); setSideOpen(false); };
  const closeTrade = (tid, reason) => { const t = trades.find(x => x.id === tid); if (!t) return; const cp = anl[t.asset]?.price || t.price; const pnl = +(t.action === "BUY" ? (cp - t.price) / t.price * 100 : (t.price - cp) / t.price * 100).toFixed(2); setTrades(p => p.map(x => x.id === tid ? { ...x, status: "CLOSED", pnl, reason } : x)); setJournal(p => [{ id: Date.now(), asset: t.asset, action: t.action, entry: t.price, exit: cp, pnl, reason, dalio: t.dalio, reflection: "", principle: "", lesson: "" }, ...p]); addLog(`CLOSE ${t.asset} PnL:${pnl}%`); };
  const runScen = (aid, pct) => { const imp = []; all.forEach(a => { if (a.id === aid) imp.push({ id: a.id, pct, reason: "Direct" }); else if (corr[aid]?.[a.id] && Math.abs(corr[aid][a.id]) > 0.2) imp.push({ id: a.id, pct: +(pct * corr[aid][a.id]).toFixed(2), reason: `ρ=${corr[aid][a.id]}` }); }); const pi = trades.filter(t => t.status === "OPEN").reduce((s, t) => { const h = imp.find(i => i.id === t.asset); return s + (h ? t.size * (h.pct / 100) : 0); }, 0); setScenario({ asset: aid, change: pct, imp, pi: +pi.toFixed(0) }); addLog(`SCENARIO: ${aid} ${pct > 0 ? "+" : ""}${pct}%`); };


  const selA = sel ? anl[sel] : null;
  const selH = sel ? pd[sel] : null;
  const items = ASSETS[cat]?.items || [];

  const sectorPerf = useMemo(() => {
    const sectors = {};
    Object.values(anl).forEach(a => { if (!sectors[a.sector]) sectors[a.sector] = []; if (isFinite(a.mR)) sectors[a.sector].push(a.mR); });
    return Object.entries(sectors).filter(([_, v]) => v.length > 0).map(([k, v]) => ({ label: k, v: +(v.reduce((s, x) => s + x, 0) / v.length).toFixed(1) })).sort((a, b) => b.v - a.v);
  }, [anl]);

  const recCounts = useMemo(() => {
    const c = { buy: 0, sell: 0, hold: 0 };
    Object.values(anl).forEach(a => { if (a.rec.includes("BUY")) c.buy++; else if (a.rec.includes("SELL")) c.sell++; else c.hold++; });
    return c;
  }, [anl]);

  // Holy Grail Score: count truly uncorrelated positions (|corr| < 0.3)
  const holyGrail = useMemo(() => {
    const active = [...new Set([...watch, ...trades.filter(t => t.status === "OPEN").map(t => t.asset)])];
    if (active.length < 2 || !Object.keys(corr).length) return { streams: active.length, uncorrelated: active.length, score: Math.min(100, +(active.length / 15 * 100).toFixed(0)), target: 15, categories: 0 };
    // Count distinct uncorrelated clusters using greedy grouping
    const used = new Set();
    let clusters = 0;
    active.forEach(a => {
      if (used.has(a)) return;
      clusters++;
      used.add(a);
      // Group correlated peers into same cluster
      active.forEach(b => {
        if (a !== b && !used.has(b) && corr[a]?.[b] && Math.abs(corr[a][b]) > 0.5) used.add(b);
      });
    });
    // Also count how many asset categories are covered
    const cats = new Set();
    active.forEach(id => { Object.entries(ASSETS).forEach(([k, v]) => { if (v.items.find(a => a.id === id)) cats.add(k); }); });
    // Effective streams = clusters (corr < 0.5 treated as separate) 
    const effective = Math.min(active.length, clusters + cats.size);
    return { streams: active.length, uncorrelated: effective, score: Math.min(100, +(effective / 15 * 100).toFixed(0)), target: 15, categories: cats.size };
  }, [watch, trades, corr]);

  // Kelly Criterion per asset
  const kelly = useMemo(() => {
    const k = {};
    Object.values(anl).forEach(a => {
      if (!a.bt || !a.bt.gcWR) { k[a.id] = null; return; }
      const winRate = (+a.bt.gcWR) / 100;
      const avgWin = Math.abs(+(a.bt.avgRet || 2));
      const avgLoss = a.stopDist || 5;
      const payoff = avgWin / avgLoss;
      const kellyPct = +((winRate - (1 - winRate) / payoff) * 100).toFixed(1);
      k[a.id] = { kellyPct: Math.max(0, Math.min(kellyPct, 25)), winRate: +(winRate * 100).toFixed(0), payoff: +payoff.toFixed(2) };
    });
    return k;
  }, [anl]);

  // Equity curve from closed trades
  const equityCurve = useMemo(() => {
    const closed = trades.filter(t => t.status === "CLOSED" && t.pnl !== undefined).reverse();
    let cum = cfg.portfolio;
    return [{ x: 0, y: cfg.portfolio }, ...closed.map((t, i) => { cum += t.size * (t.pnl / 100); return { x: i + 1, y: +cum.toFixed(0), asset: t.asset, pnl: t.pnl }; })];
  }, [trades, cfg.portfolio]);

  // Regime detection from debt cycle data
  const regime = useMemo(() => {
    const growth = DEBT.pos < 50 ? "falling" : "rising";
    const inflation = DEBT.fedFunds > 4 ? "rising" : "falling";
    if (growth === "rising" && inflation === "falling") return { q: "Q2", name: "Growth + Disinflation", color: T.acc, advice: "Favor stocks, corporate bonds, growth assets. Best environment for equities." };
    if (growth === "rising" && inflation === "rising") return { q: "Q1", name: "Growth + Inflation", color: "#ff6b35", advice: "Favor commodities, TIPS, crypto, EM stocks. Reduce duration." };
    if (growth === "falling" && inflation === "rising") return { q: "Q3", name: "Stagflation", color: T.danger, advice: "DANGER ZONE. Favor gold, commodities. Reduce equities. Cash is king." };
    return { q: "Q4", name: "Deflation/Recession", color: T.acc2, advice: "Favor long-term bonds, gold. Reduce risk. Prepare for recovery entry." };
  }, []);

  // Drawdown tracking
  const drawdown = useMemo(() => {
    const openPnl = trades.filter(t => t.status === "OPEN").reduce((s, t) => {
      const cur = anl[t.asset]?.price || t.price;
      return s + (t.action === "BUY" ? (cur - t.price) / t.price * t.size : (t.price - cur) / t.price * t.size);
    }, 0);
    const closedPnl = trades.filter(t => t.status === "CLOSED" && t.pnl !== undefined).reduce((s, t) => s + t.size * (t.pnl / 100), 0);
    const totalPnl = openPnl + closedPnl;
    const ddPct = cfg.portfolio > 0 ? +((totalPnl < 0 ? Math.abs(totalPnl) / cfg.portfolio * 100 : 0)).toFixed(1) : 0;
    const halted = ddPct >= cfg.drawdownHalt;
    return { pnl: +totalPnl.toFixed(0), ddPct, halted, limit: cfg.drawdownHalt };
  }, [trades, anl, cfg]);

  // Dalio Advisory — plain language synthesis
  const advisory = useMemo(() => {
    const msgs = [];
    const actions = [];
    const anlArr = Object.values(anl);
    const openIds = trades.filter(t => t.status === "OPEN").map(t => t.asset);

    // Prediction engine: estimate expected % gain from trade
    const predict = (a, action) => {
      if (!a) return null;
      const dir = action === "SHORT" ? -1 : 1;
      // Base: R:R ratio target = stop distance × rr ratio
      const rrTarget = +(a.stopDist * cfg.rr).toFixed(1);
      // Confidence-weighted expected value
      const winProb = Math.min(0.85, Math.max(0.2, a.conf / 100));
      const lossProb = 1 - winProb;
      const ev = +(winProb * rrTarget - lossProb * a.stopDist).toFixed(1);
      // Pattern boost: patternScore > 60 adds edge, < 40 subtracts
      const patBoost = a.patterns ? +((a.patterns.patScore - 50) * 0.08).toFixed(1) : 0;
      // Momentum factor
      const momFactor = +((a.mom - 50) * 0.04 * dir).toFixed(1);
      // Backtest historical average
      const btAvg = a.bt?.avgRet ? +a.bt.avgRet : 0;
      // Regime alignment bonus
      const qBonus = Object.entries(QUADRANTS).find(([_, q]) => q.assets.includes(a.id))?.[0] === regime.q ? 1.5 : 0;
      // Seasonal
      const sBias = a.patterns?.season ? +(a.sector === "L1" || a.sector === "Oracle" ? a.patterns.season.cryptoBias : a.sector === "Precious" || a.sector === "Energy" || a.sector === "Agri" ? a.patterns.season.commodBias : a.patterns.season.equityBias) : 0;
      // Confluence strength
      const confBoost = a.patterns?.confluence ? +(a.patterns.confluence.score * 0.8 * dir).toFixed(1) : 0;
      // Weighted composite prediction
      const raw = ev * 0.3 + patBoost + momFactor + btAvg * 0.2 + qBonus + sBias * 0.5 + confBoost;
      const pred = +(raw * dir).toFixed(1);
      const predDollar = a.posSize ? +(a.posSize * pred / 100).toFixed(0) : 0;
      // Confidence band
      const low = +(pred - a.stopDist * 0.5).toFixed(1);
      const high = +(pred + rrTarget * 0.3).toFixed(1);

      // ─── ESTIMATED HOLD TIMER ────────────────────────────────────────
      // Calculate how long to hold before selling, based on multiple factors
      const volDaily = (a.vol || 20) / Math.sqrt(252); // daily vol %
      const targetMove = Math.abs(rrTarget); // % needed to hit TP
      // Days to reach target at average daily volatility (simplified diffusion model)
      const daysToTarget = volDaily > 0 ? Math.ceil((targetMove / volDaily) ** 2 / 2) : 14;
      // Adjust for momentum: strong momentum = faster, weak = slower
      const momAdj = a.mom > 70 ? 0.5 : a.mom > 55 ? 0.75 : a.mom < 35 ? 1.8 : a.mom < 45 ? 1.3 : 1.0;
      // Adjust for confluence: aligned indicators = faster resolution
      const confAdj = a.patterns?.confluence?.bias?.includes("STRONG") ? 0.7 : a.patterns?.confluence?.score > 0 ? 0.85 : 1.1;
      // Adjust for vol regime: compressing = slower, expanding = faster
      const volAdj2 = a.patterns?.volReg?.transition === "expanding" ? 0.7 : a.patterns?.volReg?.transition === "compressing" ? 1.4 : 1.0;
      // Adjust for trend alignment: all aligned = faster
      const mtfAdj = a.patterns?.mtf?.aligned ? 0.75 : 1.15;
      // Time stop cap from config
      const rawDays = Math.max(1, Math.min(cfg.timeStop || 30, Math.round(daysToTarget * momAdj * confAdj * volAdj2 * mtfAdj)));
      const estHours = rawDays * 24;
      // Sell date/time
      const sellDate = new Date(Date.now() + rawDays * 864e5);
      const sellDateStr = sellDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const sellTimeStr = sellDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      // Phase breakdown
      const entryPhase = Math.min(rawDays, Math.max(1, Math.round(rawDays * 0.15))); // first 15%: position building
      const holdPhase = Math.max(1, rawDays - entryPhase - Math.max(1, Math.round(rawDays * 0.1))); // middle: hold
      const exitPhase = Math.max(1, Math.round(rawDays * 0.1)); // last 10%: exit window
      // Urgency color
      const timerColor = rawDays <= 3 ? T.danger : rawDays <= 7 ? T.warn : rawDays <= 14 ? T.acc2 : T.t3;
      // Label
      const timerLabel = rawDays <= 1 ? "SCALP" : rawDays <= 3 ? "DAY TRADE" : rawDays <= 7 ? "SWING" : rawDays <= 14 ? "SHORT-TERM" : rawDays <= 30 ? "POSITION" : "LONG-TERM";
      
      const holdTimer = {
        days: rawDays, hours: estHours,
        sellDate: sellDateStr, sellTime: sellTimeStr,
        entryDays: entryPhase, holdDays: holdPhase, exitDays: exitPhase,
        label: timerLabel, color: timerColor,
        factors: { base: daysToTarget, momentum: +momAdj.toFixed(2), confluence: +confAdj.toFixed(2), volRegime: +volAdj2.toFixed(2), mtf: +mtfAdj.toFixed(2) },
      };

      // ─── PRICE PROJECTIONS (1h, 1d, 7d, 30d) ────────────────────────
      const price = a.price;
      const dailyDrift = pred / (rawDays || 7) / 100; // predicted daily % move
      const hourlyDrift = dailyDrift / 24;
      const projections = [
        { label: "1H", t: 1/24, price: +(price * (1 + hourlyDrift)).toFixed(price > 100 ? 0 : price > 1 ? 2 : 6), pct: +(hourlyDrift * 100).toFixed(3) },
        { label: "1D", t: 1, price: +(price * (1 + dailyDrift)).toFixed(price > 100 ? 0 : price > 1 ? 2 : 6), pct: +(dailyDrift * 100).toFixed(2) },
        { label: "7D", t: 7, price: +(price * (1 + dailyDrift * 7)).toFixed(price > 100 ? 0 : price > 1 ? 2 : 6), pct: +(dailyDrift * 7 * 100).toFixed(1) },
        { label: "30D", t: 30, price: +(price * (1 + dailyDrift * 30)).toFixed(price > 100 ? 0 : price > 1 ? 2 : 6), pct: +(dailyDrift * 30 * 100).toFixed(1) },
      ];
      // Band edges (1σ uncertainty) using daily vol
      projections.forEach(p => {
        const sigma = volDaily / 100 * Math.sqrt(p.t) * price;
        p.high = +(p.price + sigma).toFixed(price > 100 ? 0 : price > 1 ? 2 : 6);
        p.low = +(p.price - sigma).toFixed(price > 100 ? 0 : price > 1 ? 2 : 6);
      });

      return { pct: pred, dollar: predDollar, ev, winProb: +(winProb * 100).toFixed(0), low, high, days: `${rawDays}d`, rrTarget, patBoost, momFactor, confBoost, holdTimer, projections, currentPrice: price };
    };
    // 1. Regime-based advice
    if (regime.q === "Q3") msgs.push({ type: "DANGER", msg: `Regime: ${regime.name}. Reduce equities, increase gold & commodities. Cash is king.` });
    else if (regime.q === "Q4") msgs.push({ type: "WARN", msg: `Regime: ${regime.name}. Favor long-term bonds and gold. Prepare dry powder for recovery.` });
    else msgs.push({ type: "INFO", msg: `Regime: ${regime.name}. ${regime.advice}` });

    // 2. Circuit breaker
    if (drawdown.halted) {
      msgs.push({ type: "DANGER", msg: `CIRCUIT BREAKER: Drawdown ${drawdown.ddPct}% exceeds ${drawdown.limit}%. Close losing positions. No new trades.` });
      const losers = trades.filter(t => t.status === "OPEN").map(t => { const cur = anl[t.asset]?.price || t.price; const pnl = t.action === "BUY" ? (cur - t.price) / t.price * 100 : (t.price - cur) / t.price * 100; return { ...t, curPnl: +pnl.toFixed(2) }; }).filter(t => t.curPnl < -2).sort((a, b) => a.curPnl - b.curPnl);
      losers.slice(0, 3).forEach(t => actions.push({ action: "CLOSE", asset: t.asset, reason: `Losing ${t.curPnl}%. Circuit breaker active.`, urgency: "HIGH", color: T.danger }));
    } else if (drawdown.ddPct > drawdown.limit * 0.7) {
      msgs.push({ type: "WARN", msg: `Drawdown at ${drawdown.ddPct}% — near halt. Reduce exposure or tighten stops.` });
    }

    // 3. Fear & Greed driven actions
    if (liveData?.fearGreed?.[0]) {
      const fg = +liveData.fearGreed[0].value;
      if (fg < 25) {
        msgs.push({ type: "OPPORTUNITY", msg: `Fear & Greed: ${fg} (Extreme Fear). Dalio: contrarian buying opportunity.` });
        const bestBuys = anlArr.filter(a => a.rec.includes("BUY") && !openIds.includes(a.id)).sort((a, b) => b.conf - a.conf).slice(0, 2);
        bestBuys.forEach(a => { const p = predict(a, "BUY"); actions.push({ action: "BUY", asset: a.id, reason: `${a.rec} (${a.conf}% conf). Extreme fear = opportunity. Dalio composite: ${a.dalio.comp}.`, size: `$${a.posSize.toLocaleString()}`, stop: `$${a.stop}`, tp: `$${a.tp}`, urgency: "HIGH", color: T.acc, pred: p }); });
      } else if (fg > 75) {
        msgs.push({ type: "WARN", msg: `Fear & Greed: ${fg} (Extreme Greed). Market due for correction. Take profits.` });
        const winners = trades.filter(t => t.status === "OPEN").map(t => { const cur = anl[t.asset]?.price || t.price; const pnl = t.action === "BUY" ? (cur - t.price) / t.price * 100 : (t.price - cur) / t.price * 100; return { ...t, curPnl: +pnl.toFixed(2) }; }).filter(t => t.curPnl > 3).sort((a, b) => b.curPnl - a.curPnl);
        winners.slice(0, 2).forEach(t => actions.push({ action: "TAKE PROFIT", asset: t.asset, reason: `Up ${t.curPnl}%. Extreme greed — lock in gains before correction.`, urgency: "MEDIUM", color: T.warn }));
      }
    }

    // 4. Top trade recommendations from Dalio scoring (if not halted)
    if (!drawdown.halted) {
      const topBuys = anlArr.filter(a => a.rec.includes("BUY") && !openIds.includes(a.id) && a.conf >= 60).sort((a, b) => b.dalio.comp - a.dalio.comp).slice(0, 3);
      topBuys.forEach(a => {
        const k = kelly[a.id];
        const quadrant = Object.entries(QUADRANTS).find(([_, q]) => q.assets.includes(a.id));
        const qMatch = quadrant && quadrant[0] === regime.q;
        if (!actions.find(x => x.asset === a.id)) {
          actions.push({ action: "BUY", asset: a.id, reason: `${a.rec} · Dalio: ${a.dalio.comp} · Trend: ${a.trend} · Mom: ${a.mom}${qMatch ? " · Regime-aligned ✓" : ""}${k ? ` · Kelly: ${k.kellyPct}%` : ""}`, size: `$${a.posSize.toLocaleString()}`, stop: `$${a.stop}`, tp: `$${a.tp}`, urgency: a.rec === "STRONG BUY" ? "HIGH" : "MEDIUM", color: T.acc, pred: predict(a, "BUY") });
        }
      });

      // Short candidates
      if (cfg.shorts) {
        const topShorts = anlArr.filter(a => a.short && !openIds.includes(a.id)).sort((a, b) => a.dalio.comp - b.dalio.comp).slice(0, 2);
        topShorts.forEach(a => actions.push({ action: "SHORT", asset: a.id, reason: `Bearish trend · Vol: ${a.vol}% · Geo: ${a.geoScore < 0 ? "negative" : "neutral"} · Dalio: ${a.dalio.comp}`, size: `$${a.posSize.toLocaleString()}`, stop: `$${a.stop}`, tp: `$${a.tp}`, urgency: "MEDIUM", color: T.danger, pred: predict(a, "SHORT") }));
      }
    }

    // 5. Holy Grail diversification gaps
    if (holyGrail.uncorrelated < 5) {
      const coveredIds = [...new Set([...openIds, ...watch])];
      const missingClasses = Object.entries(ASSETS).filter(([cat]) => !coveredIds.some(id => ASSETS[cat].items.find(a => a.id === id))).map(([_, c]) => c.label);
      if (missingClasses.length > 0) {
        msgs.push({ type: "WARN", msg: `Holy Grail: ${holyGrail.uncorrelated}/15 streams. Missing exposure: ${missingClasses.join(", ")}. Add uncorrelated assets from these categories.` });
      } else {
        msgs.push({ type: "INFO", msg: `Holy Grail: ${holyGrail.uncorrelated}/15 streams. All categories covered — add more assets within each to reach 15 uncorrelated streams.` });
      }
      // Suggest best asset from missing categories
      missingClasses.forEach(catLabel => {
        const catEntry = Object.values(ASSETS).find(c => c.label === catLabel);
        if (catEntry) {
          const best = catEntry.items.map(a => anl[a.id]).filter(Boolean).sort((a, b) => b.dalio.comp - a.dalio.comp)[0];
          if (best && !actions.find(x => x.asset === best.id)) {
            actions.push({ action: "BUY", asset: best.id, reason: `Diversification: fills ${catLabel} gap. Dalio: ${best.dalio.comp}. Holy Grail compliance.`, size: `$${best.posSize.toLocaleString()}`, stop: `$${best.stop}`, tp: `$${best.tp}`, urgency: "LOW", color: T.purple, pred: predict(best, "BUY") });
          }
        }
      });
    }

    // 6. Correlation warnings
    const highCorr = trades.filter(t => t.status === "OPEN").filter((t, i, arr) => arr.some((t2, j) => j !== i && corr[t.asset]?.[t2.asset] && Math.abs(corr[t.asset][t2.asset]) > cfg.maxCorr));
    if (highCorr.length > 0) msgs.push({ type: "WARN", msg: `${highCorr.length} positions exceed correlation limit (${cfg.maxCorr}). Consider closing: ${highCorr.map(t => t.asset).join(", ")}.` });

    // 7. Open position management
    trades.filter(t => t.status === "OPEN").forEach(t => {
      const a = anl[t.asset]; if (!a) return;
      const cur = a.price;
      const pnl = +(t.action === "BUY" ? (cur - t.price) / t.price * 100 : (t.price - cur) / t.price * 100).toFixed(2);
      if (pnl < -(cfg.stopPct * 1.5)) {
        actions.push({ action: "CLOSE", asset: t.asset, reason: `Loss of ${pnl}% exceeds 1.5x stop. Pain+Reflection: cut and learn.`, urgency: "HIGH", color: T.danger });
      } else if (a.trend === "BEAR" && t.action === "BUY" && pnl < 0) {
        actions.push({ action: "TIGHTEN", asset: t.asset, reason: `Trend flipped bearish while in loss (${pnl}%). Tighten stop or exit.`, urgency: "MEDIUM", color: T.warn });
      }
    });

    return { msgs, actions: actions.slice(0, 8) };
  }, [regime, holyGrail, drawdown, liveData, trades, corr, cfg, anl, kelly]);

  // Export / Import state
  const exportState = () => {
    const state = { v: "4.0.0", ts: new Date().toISOString(), cfg, trades, journal, watch, alerts, log: log.slice(0, 20) };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `dalios-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(url);
  };
  const importState = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const s = JSON.parse(ev.target.result);
        if (s.cfg) setCfg(s.cfg); if (s.trades) setTrades(s.trades); if (s.journal) setJournal(s.journal);
        if (s.watch) setWatch(s.watch); if (s.alerts) setAlerts(s.alerts);
        addLog("STATE IMPORTED from file");
      } catch { addLog("IMPORT FAILED — invalid JSON"); }
    };
    reader.readAsText(file);
  };

  // ─── SETUP WIZARD ────────────────────────────────────────────────────────
  const runWizardChecks = async () => {
    setWizChecks({ coingecko: "checking", feargreed: "checking", coincap: "checking" });
    const check = async (url, key) => {
      try { const r = await fetch(url); if (r.ok) { const d = await r.json(); setWizChecks(p => ({ ...p, [key]: d ? "ok" : "fail" })); return d; } setWizChecks(p => ({ ...p, [key]: "fail" })); } catch { setWizChecks(p => ({ ...p, [key]: "cors" })); }
      return null;
    };
    const [cg, fg, cc] = await Promise.all([
      check("https://api.coingecko.com/api/v3/ping", "coingecko"),
      check("https://api.alternative.me/fng/?limit=1", "feargreed"),
      check("https://api.coincap.io/v2/assets?limit=1", "coincap"),
    ]);
    // Apply wizard profile to config
    if (wizProfile.experience === "beginner") setCfg(c => ({ ...c, maxRisk: 1, stopPct: 3, rr: 2, drawdownHalt: 10, shorts: false, useAtr: false }));
    else if (wizProfile.experience === "advanced") setCfg(c => ({ ...c, maxRisk: 3, stopPct: 7, rr: 3, drawdownHalt: 20, shorts: true, useAtr: true }));
    if (wizProfile.goal === "conservative") setCfg(c => ({ ...c, maxRisk: 1, maxPos: 5, trail: true, trailPct: 2 }));
    else if (wizProfile.goal === "aggressive") setCfg(c => ({ ...c, maxRisk: 3, maxPos: 15, trail: true, trailPct: 5 }));
    if (wizProfile.horizon === "short") setCfg(c => ({ ...c, timeStop: 7 }));
    else if (wizProfile.horizon === "long") setCfg(c => ({ ...c, timeStop: 30 }));
    addLog(`WIZARD: Setup complete. APIs: CG=${cg ? "✓" : "✗"} FG=${fg ? "✓" : "✗"} CC=${cc ? "✓" : "✗"}. Profile: ${wizProfile.experience}/${wizProfile.goal}/${wizProfile.horizon}`);
  };

  // ─── AI ANALYSIS (Multi-Provider) ──────────────────────────────────────────
  const SYSTEM_PROMPT = `You are a senior trading analyst operating strictly within Ray Dalio's investment principles framework. You have access to a real-time portfolio state from the "Dalios" trading tool.

Your role: Analyze the recommended trades and current portfolio state. For each recommended action, provide:
1. VERDICT: APPROVE, MODIFY, or REJECT
2. REASONING: Why, citing specific Dalio principles (Holy Grail, Risk Parity, 4 Quadrants, Pain+Reflection, Follow Trends, Independent Thinking)
3. RISK ASSESSMENT: What could go wrong and how it aligns with the current regime
4. MODIFICATIONS: If modifying, specify exact changes to position size, stops, or targets

Also provide:
- PORTFOLIO HEALTH: Overall assessment of diversification, regime alignment, and risk exposure
- TOP PRIORITY ACTION: The single most important thing to do right now
- CONTRARIAN VIEW: One thing the data suggests that goes against consensus (Dalio's Independent Thinking principle)

Be concise, direct, and quantitative. Use specific numbers. Format as structured sections.`;

  // ─── AI CHAT ASSISTANT ─────────────────────────────────────────────────
  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMsgs(p => [...p, { role: "user", text: userMsg }]);
    setChatLoading(true);
    try {
      // Build context from current page state
      const currentAsset = selA ? { id: selA.id, name: selA.name, price: selA.price, dR: selA.dR, wR: selA.wR, mR: selA.mR, vol: selA.vol, rsi: selA.rsi, trend: selA.trend, mom: selA.mom, rec: selA.rec, conf: selA.conf, dalio: selA.dalio.comp, patterns: selA.patterns ? { patScore: selA.patterns.patScore, confluence: selA.patterns.confluence?.bias, macd: selA.patterns.macd?.bullish ? "bullish" : "bearish", volRegime: selA.patterns.volReg?.regime, mtf: selA.patterns.mtf?.aligned ? selA.patterns.mtf.direction : "mixed", relStrength: selA.patterns.relStr?.quartile, meanRev: selA.patterns.meanRev?.signal } : null, stop: selA.stop, tp: selA.tp, posSize: selA.posSize } : null;
      const ctx = {
        currentTab: tab,
        currentAsset,
        portfolio: { capital: cfg.portfolio, openTrades: trades.filter(t => t.status === "OPEN").length, pnl: drawdown.pnl, drawdownPct: drawdown.ddPct, halted: drawdown.halted },
        regime: { quadrant: regime.q, name: regime.name },
        holyGrail: { uncorrelated: holyGrail.uncorrelated, score: holyGrail.score },
        fearGreed: liveData?.fearGreed?.[0] ? { value: +liveData.fearGreed[0].value, label: liveData.fearGreed[0].value_classification } : null,
        topSignals: Object.values(anl).filter(a => a.rec !== "HOLD").sort((a, b) => b.conf - a.conf).slice(0, 5).map(a => ({ id: a.id, rec: a.rec, conf: a.conf, price: a.price, trend: a.trend })),
        watchlist: watch,
        recentAdvisory: advisory.actions.slice(0, 3).map(a => ({ action: a.action, asset: a.asset, reason: a.reason.slice(0, 80) })),
      };
      const systemPrompt = `You are the Dalios AI assistant — a trading analyst embedded in the Dalios trading platform. You have access to real-time portfolio data, asset analysis, and Dalio's investment principles.

CURRENT CONTEXT:
${JSON.stringify(ctx, null, 2)}

RULES:
- Use the data provided to give specific, quantitative answers
- Reference exact prices, percentages, indicators, and scores
- Apply Dalio's principles: Risk Parity, Holy Grail (15 uncorrelated streams), 4 Quadrants, systematic decision-making
- When asked about buy/sell/hold, cite the confidence %, Dalio composite score, pattern score, trend, and RSI
- Be concise and direct — this is a trading terminal, not a chatbot
- If the user asks about an asset not in context, say what data you'd need
- Always mention risk and position sizing`;

      const prov = AI_PROVIDERS[aiProvider];
      let reply = "";

      // Build messages history (last 6 for context)
      const history = chatMsgs.slice(-6).map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text }));
      history.push({ role: "user", content: userMsg });

      if (aiProvider === "anthropic_artifact" || aiProvider === "anthropic" || aiProvider === "anthropic_opus") {
        const headers = { "Content-Type": "application/json" };
        if (aiProvider !== "anthropic_artifact" && apiKeys.anthropic.key) headers["x-api-key"] = apiKeys.anthropic.key;
        const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers, body: JSON.stringify({ model: prov.model, max_tokens: 600, system: systemPrompt, messages: history }) });
        if (!r.ok) throw new Error(`${r.status}`);
        const d = await r.json(); reply = d.content?.map(c => c.type === "text" ? c.text : "").join("\n") || "No response";
      } else if (aiProvider.startsWith("openai") || aiProvider === "deepseek") {
        const url = aiProvider === "deepseek" ? "https://api.deepseek.com/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
        const key = aiProvider === "deepseek" ? aiConfig.deepseekKey : aiConfig.openaiKey;
        if (!key) throw new Error("API key required");
        const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` }, body: JSON.stringify({ model: prov.model, max_tokens: 600, messages: [{ role: "system", content: systemPrompt }, ...history] }) });
        if (!r.ok) throw new Error(`${r.status}`);
        const d = await r.json(); reply = d.choices?.[0]?.message?.content || "No response";
      } else if (aiProvider === "groq_llama") {
        if (!aiConfig.groqKey) throw new Error("Groq key required");
        const r = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${aiConfig.groqKey}` }, body: JSON.stringify({ model: prov.model, max_tokens: 600, messages: [{ role: "system", content: systemPrompt }, ...history] }) });
        if (!r.ok) throw new Error(`${r.status}`);
        const d = await r.json(); reply = d.choices?.[0]?.message?.content || "No response";
      } else if (aiProvider === "gemini") {
        if (!aiConfig.geminiKey) throw new Error("Gemini key required");
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${prov.model}:generateContent?key=${aiConfig.geminiKey}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ system_instruction: { parts: [{ text: systemPrompt }] }, contents: [{ parts: [{ text: history.map(m => `${m.role}: ${m.content}`).join("\n") }] }] }) });
        if (!r.ok) throw new Error(`${r.status}`);
        const d = await r.json(); reply = d.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
      } else if (aiProvider === "ollama") {
        const r = await fetch(`${aiConfig.ollamaUrl || "http://localhost:11434"}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: prov.model, stream: false, messages: [{ role: "system", content: systemPrompt }, ...history] }) });
        if (!r.ok) throw new Error(`Ollama ${r.status}`);
        const d = await r.json(); reply = d.message?.content || "No response";
      } else if (aiProvider === "custom") {
        if (!aiConfig.customUrl) throw new Error("Custom URL required");
        const headers = { "Content-Type": "application/json" };
        if (aiConfig.customKey) headers["Authorization"] = `Bearer ${aiConfig.customKey}`;
        const r = await fetch(aiConfig.customUrl, { method: "POST", headers, body: JSON.stringify({ model: aiConfig.customModel || "default", max_tokens: 600, messages: [{ role: "system", content: systemPrompt }, ...history] }) });
        if (!r.ok) throw new Error(`${r.status}`);
        const d = await r.json(); reply = d.choices?.[0]?.message?.content || d.content?.map(c => c.text).join("\n") || "No response";
      } else { reply = "Select an AI provider in Settings → APIs"; }

      setChatMsgs(p => [...p, { role: "assistant", text: reply }]);
    } catch (err) {
      setChatMsgs(p => [...p, { role: "assistant", text: `Error: ${err.message}. Check your API key in Settings → APIs.` }]);
    } finally { setChatLoading(false); }
  };

  const runAiAnalysis = async () => {
    if (!aiEnabled) { setAiError("AI not enabled. Configure in Setup Wizard or API tab."); return; }
    const prov = AI_PROVIDERS[aiProvider];
    if (!prov) { setAiError("Invalid AI provider selected."); return; }
    setAiLoading(true); setAiError(null); setAiAnalysis(null);
    try {
      const portfolioState = {
        regime: { quadrant: regime.q, name: regime.name, advice: regime.advice },
        portfolio: { capital: cfg.portfolio, pnl: drawdown.pnl, drawdown_pct: drawdown.ddPct, halted: drawdown.halted, open_trades: trades.filter(t => t.status === "OPEN").length },
        holy_grail: { uncorrelated: holyGrail.uncorrelated, target: 15, score: holyGrail.score },
        fear_greed: liveData?.fearGreed?.[0] ? { value: +liveData.fearGreed[0].value, label: liveData.fearGreed[0].value_classification } : null,
        risk_config: { max_risk: cfg.maxRisk, rr: cfg.rr, stop_type: cfg.useAtr ? "ATR" : "FLAT", drawdown_halt: cfg.drawdownHalt },
        investor: { experience: wizProfile.experience, goal: wizProfile.goal, horizon: wizProfile.horizon },
        recommended_actions: advisory.actions.slice(0, 6).map(a => ({ action: a.action, asset: a.asset, reason: a.reason, size: a.size, stop: a.stop, tp: a.tp, urgency: a.urgency })),
        open_positions: trades.filter(t => t.status === "OPEN").map(t => {
          const cur = anl[t.asset]?.price || t.price;
          const pnl = +(t.action === "BUY" ? (cur - t.price) / t.price * 100 : (t.price - cur) / t.price * 100).toFixed(2);
          return { asset: t.asset, action: t.action, entry: t.price, current: cur, pnl, stop: t.stop, tp: t.tp };
        }),
        top_assets: Object.values(anl).sort((a, b) => b.dalio.comp - a.dalio.comp).slice(0, 8).map(a => ({
          id: a.id, price: a.price, rec: a.rec, conf: a.conf, dalio: a.dalio.comp, trend: a.trend, vol: a.vol, rsi: a.rsi, momentum: a.mom,
          kelly: kelly[a.id]?.kellyPct || null,
        })),
        geopolitical: GEO.slice(0, 4).map(g => ({ title: g.title, severity: g.sev, direction: g.dir })),
        recent_journal: journal.slice(0, 3).map(j => ({ asset: j.asset, pnl: j.pnl, lesson: j.lesson })),
      };
      const userMsg = `Analyze this portfolio state and validate/modify the recommended trades:\n\n${JSON.stringify(portfolioState, null, 2)}`;
      let text = "", modelUsed = prov.model;

      // Route to correct provider
      if (aiProvider === "anthropic_artifact" || aiProvider === "anthropic" || aiProvider === "anthropic_opus") {
        const headers = { "Content-Type": "application/json" };
        if (aiProvider !== "anthropic_artifact" && apiKeys.anthropic.key) headers["x-api-key"] = apiKeys.anthropic.key;
        const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers, body: JSON.stringify({ model: prov.model, max_tokens: 1000, system: SYSTEM_PROMPT, messages: [{ role: "user", content: userMsg }] }) });
        if (!r.ok) throw new Error(`Anthropic ${r.status}: ${r.statusText}`);
        const d = await r.json(); text = d.content?.map(c => c.type === "text" ? c.text : "").join("\n") || "No response";

      } else if (aiProvider.startsWith("openai") || aiProvider === "deepseek") {
        const url = aiProvider === "deepseek" ? "https://api.deepseek.com/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
        const key = aiProvider === "deepseek" ? aiConfig.deepseekKey : aiConfig.openaiKey;
        if (!key) throw new Error(`${prov.name} API key required. Set in API tab.`);
        const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` }, body: JSON.stringify({ model: prov.model, max_tokens: 1000, messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userMsg }] }) });
        if (!r.ok) throw new Error(`${prov.name} ${r.status}: ${r.statusText}`);
        const d = await r.json(); text = d.choices?.[0]?.message?.content || "No response";

      } else if (aiProvider === "groq_llama") {
        if (!aiConfig.groqKey) throw new Error("Groq API key required. Get free key at console.groq.com");
        const r = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${aiConfig.groqKey}` }, body: JSON.stringify({ model: prov.model, max_tokens: 1000, messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userMsg }] }) });
        if (!r.ok) throw new Error(`Groq ${r.status}: ${r.statusText}`);
        const d = await r.json(); text = d.choices?.[0]?.message?.content || "No response";

      } else if (aiProvider === "gemini") {
        if (!aiConfig.geminiKey) throw new Error("Gemini API key required. Get free key at aistudio.google.com");
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${prov.model}:generateContent?key=${aiConfig.geminiKey}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ system_instruction: { parts: [{ text: SYSTEM_PROMPT }] }, contents: [{ parts: [{ text: userMsg }] }] }) });
        if (!r.ok) throw new Error(`Gemini ${r.status}: ${r.statusText}`);
        const d = await r.json(); text = d.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

      } else if (aiProvider === "ollama") {
        const url = aiConfig.ollamaUrl || "http://localhost:11434";
        const r = await fetch(`${url}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: prov.model, stream: false, messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userMsg }] }) });
        if (!r.ok) throw new Error(`Ollama ${r.status}. Is Ollama running on ${url}?`);
        const d = await r.json(); text = d.message?.content || "No response";

      } else if (aiProvider === "custom") {
        if (!aiConfig.customUrl) throw new Error("Custom endpoint URL required.");
        const headers = { "Content-Type": "application/json" };
        if (aiConfig.customKey) headers["Authorization"] = `Bearer ${aiConfig.customKey}`;
        const r = await fetch(aiConfig.customUrl, { method: "POST", headers, body: JSON.stringify({ model: aiConfig.customModel || "default", max_tokens: 1000, messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userMsg }] }) });
        if (!r.ok) throw new Error(`Custom API ${r.status}: ${r.statusText}`);
        const d = await r.json(); text = d.choices?.[0]?.message?.content || d.content?.map(c => c.text).join("\n") || "No response";
        modelUsed = aiConfig.customModel || "custom";
      }

      setAiAnalysis({ text, ts: new Date().toISOString(), model: modelUsed, provider: prov.name });
      addLog(`AI: Analysis complete (${text.length} chars). Provider: ${prov.name} Model: ${modelUsed}`);
    } catch (err) {
      setAiError(err.message || "AI analysis failed");
      addLog(`AI ERROR [${prov.name}]: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Auto-run AI analysis when advisory changes (if enabled)
  const prevAdvisoryRef = useRef(null);
  useEffect(() => {
    if (!aiAutoRun || !aiEnabled || aiLoading) return;
    const key = advisory.actions.map(a => `${a.action}:${a.asset}`).join(",");
    if (key && key !== prevAdvisoryRef.current) {
      prevAdvisoryRef.current = key;
      const timer = setTimeout(() => runAiAnalysis(), 2000);
      return () => clearTimeout(timer);
    }
  }, [advisory, aiAutoRun, aiEnabled]);

  const WIZARD_STEPS = [
    { title: "Welcome", desc: "Dalio's Principal — AI Trading Analyst built on Ray Dalio's systematic investment principles. This wizard will configure your environment." },
    { title: "Investor Profile", desc: "Tell us about yourself so we can calibrate risk parameters to match Dalio's principle of radical self-awareness." },
    { title: "Risk Tolerance", desc: "Dalio says: 'Don't have debt rise faster than income.' Set your portfolio size and maximum acceptable drawdown." },
    { title: "API Connections", desc: "We'll test free data sources. No API keys required — all endpoints are public and free." },
    { title: "AI Analyst", desc: "Connect Claude Sonnet to review every recommended trade before execution. The AI validates actions against Dalio's principles." },
    { title: "Asset Selection", desc: "Dalio's Holy Grail: 15+ uncorrelated return streams. Select which asset classes to track." },
    { title: "Complete", desc: "Your system is configured. All Dalio principles are active." },
  ];

  const api = useMemo(() => { const recs = { STRONG_BUY: [], BUY: [], HOLD: [], SELL: [], STRONG_SELL: [] }; Object.values(anl).forEach(a => recs[a.rec.replace(" ", "_")]?.push(a.id)); return { v: "4.0.0", ts: new Date().toISOString(), data_source: liveStatus, fresh: `${tick * 5}s`, portfolio: { capital: cfg.portfolio, open: trades.filter(t => t.status === "OPEN").length, pnl: drawdown.pnl, drawdown_pct: drawdown.ddPct, halted: drawdown.halted }, risk: { per_trade: cfg.maxRisk, stop: cfg.useAtr ? `ATR×${cfg.atrMult}` : `${cfg.stopPct}%`, rr: cfg.rr }, regime: { quadrant: regime.q, name: regime.name, advice: regime.advice }, holy_grail: { uncorrelated_streams: holyGrail.uncorrelated, target: 15, score: holyGrail.score }, debt: { phase: DEBT.phase, pos: DEBT.pos }, fear_greed: liveData?.fearGreed?.[0] ? { value: +liveData.fearGreed[0].value, label: liveData.fearGreed[0].value_classification } : null, advisory: { alerts: advisory.msgs.map(a => ({ type: a.type, msg: a.msg })), recommended_trades: advisory.actions.map(a => ({ action: a.action, asset: a.asset, reason: a.reason, size: a.size, stop: a.stop, tp: a.tp, urgency: a.urgency })) }, recs, top3: Object.values(anl).filter(a => a.rec.includes("BUY")).sort((a, b) => b.conf - a.conf).slice(0, 3).map(a => ({ action: a.rec, asset: a.id, conf: a.conf, dalio: a.dalio.comp, size: a.posSize, kelly: kelly[a.id]?.kellyPct })), shorts: Object.values(anl).filter(a => a.short).map(a => a.id), watch }; }, [anl, cfg, trades, watch, tick, drawdown, regime, holyGrail, advisory, liveData, liveStatus, kelly]);

  // Run full Dalio backtest
  const runBt = () => { setBtResult(runFullBacktest(pd, cfg)); addLog("BACKTEST: Full Dalio system backtest complete"); };
  // Run Markowitz optimizer
  const runOpt = () => {
    const assets = Object.values(anl).filter(a => watch.includes(a.id) || trades.some(t => t.status === "OPEN" && t.asset === a.id));
    if (assets.length < 2) { addLog("OPTIMIZER: Need 2+ assets"); return; }
    setOptResult(markowitz(assets, corr)); addLog(`OPTIMIZER: Markowitz computed for ${assets.length} assets`);
  };

  const TABS = [{ k: "overview", l: "Overview", i: "◈" }, { k: "markets", l: "Markets", i: "📊" }, { k: "analysis", l: "Analysis", i: "△" }, { k: "geo", l: "Geo", i: "⚑" }, { k: "news", l: "News", i: "◎" }, { k: "corr", l: "Correlation", i: "◫" }, { k: "debt", l: "Debt Cycle", i: "⚡" }, { k: "scenario", l: "Scenario", i: "⧫" }, { k: "watch", l: "Watch", i: "★" }, { k: "trades", l: "Trades", i: "☰" }, { k: "journal", l: "Journal", i: "✎" }, { k: "settings", l: "Settings", i: "⚙" }];
  const [settingsTab, setSettingsTab] = useState("broker");
  const [debtCountry, setDebtCountry] = useState("US");

  return (
    <div className="root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        .root{font-family:'IBM Plex Mono','Menlo',monospace;background:${T.bg};color:${T.t1};min-height:100vh;font-size:11px;line-height:1.5;overflow-x:hidden}
        .pill{font-size:8px;padding:2px 7px;border-radius:3px;font-weight:700;letter-spacing:.4px;white-space:nowrap;display:inline-block}
        .btn{padding:8px 14px;border-radius:6px;border:none;font-weight:800;font-size:10px;cursor:pointer;font-family:inherit;letter-spacing:.7px;touch-action:manipulation;min-height:36px}
        .label{font-size:8px;color:${T.t3};letter-spacing:1.2px;text-transform:uppercase;margin-bottom:4px}
        .card{background:${T.s1};border:1px solid ${T.bd};border-radius:8px;padding:12px}
        .card-dark{background:${T.s2};border:1px solid ${T.bd};border-radius:6px;padding:10px}
        .stat-card{background:${T.s1};border:1px solid ${T.bd};border-radius:8px;padding:10px 12px}
        .stat-val{font-size:16px;font-weight:800}
        .stat-sub{font-size:8px;color:${T.t3};margin-top:2px}
        .row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid ${T.bd}}.row:last-child{border-bottom:none}
        .g2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
        .g4{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
        .g5{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}
        .g6{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}
        .scroll-x{overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}.scroll-x::-webkit-scrollbar{display:none}
        .header{background:linear-gradient(180deg,${T.s1},${T.bg});border-bottom:1px solid ${T.bd};padding:10px 14px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
        .hdr-btn{padding:4px 10px;border-radius:4px;font-size:8px;letter-spacing:.7px;cursor:pointer;font-family:inherit;font-weight:700;border:1px solid ${T.bd};background:rgba(255,255,255,.03);color:${T.t3};touch-action:manipulation}
        .hdr-btn.on{background:rgba(0,232,123,.08);border-color:rgba(0,232,123,.2);color:${T.acc}}
        .layout{display:flex;min-height:calc(100vh - 52px)}
        .sidebar{width:250px;min-width:250px;border-right:1px solid ${T.bd};background:${T.s1};display:flex;flex-direction:column;overflow:hidden}
        .si{padding:8px 10px;border-radius:6px;cursor:pointer;margin-bottom:2px;transition:.12s;border:1px solid transparent}
        .si:hover,.si.on{background:rgba(0,232,123,.06);border-color:rgba(0,232,123,.15)}
        .main{flex:1;overflow:auto;display:flex;flex-direction:column;min-width:0}
        .tabs{display:flex;gap:2px;padding:6px 12px;border-bottom:1px solid ${T.bd};background:${T.s1};overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;flex-shrink:0}.tabs::-webkit-scrollbar{display:none}
        .tab{padding:6px 10px;border-radius:4px;cursor:pointer;font-size:9px;letter-spacing:.3px;font-weight:600;color:${T.t3};white-space:nowrap;transition:.12s;flex-shrink:0;touch-action:manipulation}
        .tab.on{background:rgba(0,232,123,.08);color:${T.acc}}
        .content{flex:1;padding:14px;overflow:auto}
        .cg{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;padding:6px}
        .cb{padding:6px 2px;text-align:center;cursor:pointer;border-radius:4px;font-size:8px;font-weight:700;letter-spacing:.4px;color:${T.t3};transition:.12s;border:1px solid transparent}
        .cb.on{background:rgba(0,232,123,.07);color:${T.acc};border-color:rgba(0,232,123,.12)}
        .cfg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
        .ci{width:100%;background:${T.s2};border:1px solid ${T.bd};border-radius:4px;padding:5px 7px;color:${T.t1};font-size:11px;font-family:inherit;outline:none}
        .tg{display:flex;align-items:center;gap:7px;cursor:pointer;padding:5px 0}
        .tt{width:26px;height:13px;border-radius:7px;position:relative;transition:.2s}
        .th{width:9px;height:9px;border-radius:50%;background:#fff;position:absolute;top:2px;transition:.2s}
        .pre{background:#050710;border-radius:5px;padding:10px;overflow:auto;font-size:8px;line-height:1.7;color:#7799bb;max-height:300px;border:1px solid ${T.bd};word-break:break-all}
        .mt{display:none}.so{display:none}
        select{background:${T.s2};border:1px solid ${T.bd};border-radius:4px;padding:5px 8px;color:${T.t1};font-size:10px;font-family:inherit}select option{background:${T.s2}}
        textarea{width:100%;background:${T.s2};border:1px solid ${T.bd};border-radius:4px;padding:6px 8px;color:${T.t1};font-size:10px;font-family:inherit;resize:vertical;min-height:34px;outline:none}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.07);border-radius:2px}
        @media(max-width:860px){.layout{flex-direction:column}.sidebar{display:none;position:fixed;bottom:0;left:0;right:0;width:100%;min-width:unset;max-height:70vh;z-index:200;border-right:none;border-top:1px solid ${T.bd};border-radius:16px 16px 0 0;overflow:auto}.sidebar.open{display:flex}.so{display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:199}.so.open{display:block}.mt{display:flex;align-items:center;justify-content:center;position:fixed;bottom:14px;right:14px;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,${T.acc},${T.acc2});z-index:198;box-shadow:0 4px 20px rgba(0,232,123,.3);cursor:pointer;font-size:18px;color:#000;font-weight:900}.g5,.g4{grid-template-columns:repeat(2,1fr)}.g6,.g3{grid-template-columns:repeat(2,1fr)}.g2{grid-template-columns:1fr}.stat-val{font-size:14px}.content{padding:10px}.header{padding:8px 10px}.tabs{padding:4px 8px}.tab{font-size:8px;padding:5px 8px}}
        @media(max-width:480px){.g5,.g4,.g3{grid-template-columns:1fr 1fr}.stat-val{font-size:13px}.root{font-size:10px}.btn{padding:7px 12px;font-size:9px}}
      `}</style>

      <div className="header">
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <div style={{ minWidth: 0, cursor: "pointer" }} onClick={() => { setTab("overview"); setSel(null); }}><pre style={{ fontSize: 4.5, lineHeight: 1, fontFamily: "monospace", color: T.t1, margin: 0, letterSpacing: 0 }}>{`'||''|.           '||   ||
 ||   ||   ....    ||  ...    ...    ....
 ||    || '' .||   ||   ||  .|  '|. ||. '
 ||    || .|' ||   ||   ||  ||   || . '|..
.||...|'  '|..'|' .||. .||.  '|..|' |'..|'`}</pre><div style={{ fontSize: 7, color: T.t4, letterSpacing: 1.5, marginTop: 1 }}>v4.0 · <span style={{ color: liveStatus === "LIVE" ? T.acc : T.warn, animation: "pulse 2s infinite" }}>●</span> {liveStatus} {tick * 5}s</div></div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <div className={`hdr-btn ${tab === "overview" ? "on" : ""}`} onClick={() => { setTab("overview"); setSel(null); }}>⌂ HOME</div>
          <div className="hdr-btn" onClick={() => { setWizardOpen(true); setWizStep(0); }} style={{ background: "rgba(123,97,255,.1)", borderColor: "rgba(123,97,255,.25)", color: T.purple }}>⚡ SETUP</div>
          <div className={`hdr-btn ${cfg.dalio ? "on" : ""}`} onClick={() => setCfg(c => ({ ...c, dalio: !c.dalio }))}>DALIO</div>
          <div className={`hdr-btn ${cfgOpen ? "on" : ""}`} onClick={() => setCfgOpen(!cfgOpen)}>⚙</div>
        </div>
      </div>

      {/* ═══ SETUP WIZARD ═══ */}
      {wizardOpen && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ background: T.s1, border: `1px solid ${T.bd}`, borderRadius: 12, maxWidth: 520, width: "100%", maxHeight: "90vh", overflow: "auto", padding: 24 }}>
          {/* Progress bar */}
          <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
            {WIZARD_STEPS.map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= wizStep ? T.acc : "rgba(255,255,255,.06)", transition: ".3s" }} />)}
          </div>
          <div style={{ fontSize: 12, color: T.t4, letterSpacing: 1.5, marginBottom: 4 }}>STEP {wizStep + 1} OF {WIZARD_STEPS.length}</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: T.t1, marginBottom: 6 }}>{WIZARD_STEPS[wizStep].title}</div>
          <div style={{ fontSize: 12, color: T.t2, lineHeight: 1.5, marginBottom: 16 }}>{WIZARD_STEPS[wizStep].desc}</div>

          {/* Step 0: Welcome */}
          {wizStep === 0 && <div>
            <div style={{ background: T.s2, borderRadius: 8, padding: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: T.acc, fontWeight: 700, marginBottom: 8 }}>This wizard will:</div>
              {["Configure your investor profile & risk parameters", "Test connections to free market data APIs", "Set up asset tracking across crypto, commodities, equities & prediction markets", "Activate Dalio's 8 principle scoring engine", "Enable Holy Grail diversification tracking (15 uncorrelated streams)", "Configure circuit breaker & drawdown protection"].map((t, i) => <div key={i} style={{ fontSize: 12, color: T.t2, padding: "3px 0", display: "flex", gap: 6 }}><span style={{ color: T.acc }}>✓</span>{t}</div>)}
            </div>
            <div style={{ fontSize: 12, color: T.t3, padding: 8, background: "rgba(123,97,255,.06)", borderRadius: 6, border: `1px solid rgba(123,97,255,.12)` }}>
              <b style={{ color: T.purple }}>No API keys required.</b> All data sources are free public endpoints (CoinGecko, Alternative.me Fear & Greed, CoinCap). If any fail due to CORS, the system falls back to high-fidelity simulation.
            </div>
          </div>}

          {/* Step 1: Profile */}
          {wizStep === 1 && <div>
            <div style={{ marginBottom: 12 }}>
              <div className="label">Experience Level</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[{ k: "beginner", l: "Beginner", d: "New to trading. Conservative defaults." }, { k: "intermediate", l: "Intermediate", d: "Some experience. Balanced risk." }, { k: "advanced", l: "Advanced", d: "Experienced. Higher risk tolerance." }].map(o => (
                  <div key={o.k} onClick={() => setWizProfile(p => ({ ...p, experience: o.k }))} style={{ flex: "1 1 120px", padding: 10, borderRadius: 6, cursor: "pointer", background: wizProfile.experience === o.k ? "rgba(0,232,123,.08)" : T.s2, border: `1px solid ${wizProfile.experience === o.k ? "rgba(0,232,123,.25)" : T.bd}`, transition: ".15s" }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: wizProfile.experience === o.k ? T.acc : T.t1 }}>{o.l}</div>
                    <div style={{ fontSize: 12, color: T.t3, marginTop: 2 }}>{o.d}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div className="label">Investment Goal</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[{ k: "conservative", l: "Preserve Capital", d: "Low drawdown, stable returns." }, { k: "balanced", l: "Balanced Growth", d: "Moderate risk for growth." }, { k: "aggressive", l: "Max Returns", d: "Higher risk accepted." }].map(o => (
                  <div key={o.k} onClick={() => setWizProfile(p => ({ ...p, goal: o.k }))} style={{ flex: "1 1 120px", padding: 10, borderRadius: 6, cursor: "pointer", background: wizProfile.goal === o.k ? "rgba(0,232,123,.08)" : T.s2, border: `1px solid ${wizProfile.goal === o.k ? "rgba(0,232,123,.25)" : T.bd}`, transition: ".15s" }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: wizProfile.goal === o.k ? T.acc : T.t1 }}>{o.l}</div>
                    <div style={{ fontSize: 12, color: T.t3, marginTop: 2 }}>{o.d}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="label">Time Horizon</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[{ k: "short", l: "Short-Term", d: "Days to weeks." }, { k: "medium", l: "Medium-Term", d: "Weeks to months." }, { k: "long", l: "Long-Term", d: "Months to years." }].map(o => (
                  <div key={o.k} onClick={() => setWizProfile(p => ({ ...p, horizon: o.k }))} style={{ flex: "1 1 120px", padding: 10, borderRadius: 6, cursor: "pointer", background: wizProfile.horizon === o.k ? "rgba(0,232,123,.08)" : T.s2, border: `1px solid ${wizProfile.horizon === o.k ? "rgba(0,232,123,.25)" : T.bd}`, transition: ".15s" }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: wizProfile.horizon === o.k ? T.acc : T.t1 }}>{o.l}</div>
                    <div style={{ fontSize: 12, color: T.t3, marginTop: 2 }}>{o.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>}

          {/* Step 2: Risk */}
          {wizStep === 2 && <div>
            {[{ k: "portfolio", l: "Portfolio Size ($)", desc: "Total capital to allocate" }, { k: "maxRisk", l: "Max Risk Per Trade (%)", desc: "Dalio: never risk what you can't lose" }, { k: "drawdownHalt", l: "Circuit Breaker (%)", desc: "Halt all trading if drawdown exceeds this" }, { k: "maxPos", l: "Max Open Positions", desc: "Limits concentration risk" }].map(({ k, l, desc }) => (
              <div key={k} style={{ marginBottom: 12 }}>
                <div className="label">{l}</div>
                <div style={{ fontSize: 12, color: T.t4, marginBottom: 4 }}>{desc}</div>
                <input type="number" className="ci" value={cfg[k]} onChange={e => setCfg(c => ({ ...c, [k]: +e.target.value }))} />
              </div>
            ))}
            <div style={{ padding: 10, borderRadius: 6, background: "rgba(245,166,35,.06)", border: `1px solid rgba(245,166,35,.12)`, fontSize: 12, color: T.warn }}>
              <b>Dalio's Rule:</b> "Don't have debt rise faster than income, and don't have income rise faster than productivity." These limits protect you from the #1 cause of ruin — overleveraging.
            </div>
          </div>}

          {/* Step 3: API Connections */}
          {wizStep === 3 && <div>
            <div style={{ marginBottom: 12 }}>
              {[
                { key: "coingecko", name: "CoinGecko", url: "api.coingecko.com", desc: "Crypto prices (BTC, ETH, SOL, LINK, AVAX). Free, no key, 30 calls/min.", icon: "◈" },
                { key: "feargreed", name: "Fear & Greed Index", url: "api.alternative.me", desc: "Market sentiment 0-100. Free, no key. Dalio contrarian signal.", icon: "◎" },
                { key: "coincap", name: "CoinCap", url: "api.coincap.io", desc: "Backup crypto data. Free, no key, real-time WebSocket available.", icon: "⬡" },
              ].map(api => (
                <div key={api.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.bd}` }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12 }}><span style={{ marginRight: 4 }}>{api.icon}</span>{api.name}</div>
                    <div style={{ fontSize: 12, color: T.t4 }}>{api.url}</div>
                    <div style={{ fontSize: 12, color: T.t3, marginTop: 1 }}>{api.desc}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
                    {wizChecks[api.key] === null && <Pill c={T.t3}>PENDING</Pill>}
                    {wizChecks[api.key] === "checking" && <Pill c={T.warn} bg="rgba(245,166,35,.1)">TESTING...</Pill>}
                    {wizChecks[api.key] === "ok" && <Pill c={T.acc} bg="rgba(0,232,123,.12)">✓ CONNECTED</Pill>}
                    {wizChecks[api.key] === "fail" && <Pill c={T.danger} bg="rgba(255,45,85,.1)">✗ FAILED</Pill>}
                    {wizChecks[api.key] === "cors" && <Pill c={T.warn} bg="rgba(245,166,35,.1)">CORS BLOCKED</Pill>}
                  </div>
                </div>
              ))}
            </div>
            <Btn v="purple" full onClick={runWizardChecks}>⚡ TEST ALL CONNECTIONS</Btn>
            <div style={{ fontSize: 12, color: T.t4, marginTop: 8, textAlign: "center" }}>
              If any connection fails, the system uses high-fidelity simulation with live-like price movements. No functionality is lost.
            </div>
          </div>}

          {/* Step 4: Asset Selection */}
          {/* Step 4: AI Analyst */}
          {wizStep === 4 && <div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div><div style={{ fontWeight: 700, fontSize: 12 }}>AI Trade Analyst</div><div style={{ fontSize: 12, color: T.t3 }}>Reviews every trade against Dalio's 8 principles</div></div>
                <div className="tg" onClick={() => setAiEnabled(!aiEnabled)} style={{ padding: 0 }}><div className="tt" style={{ background: aiEnabled ? T.acc : "rgba(255,255,255,.08)" }}><div className="th" style={{ left: aiEnabled ? 15 : 2 }} /></div></div>
              </div>
            </div>
            {aiEnabled && <>
              <div className="label">SELECT AI PROVIDER</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
                {Object.entries(AI_PROVIDERS).map(([k, p]) => (
                  <div key={k} onClick={() => setAiProvider(k)} style={{ padding: "8px 10px", borderRadius: 6, cursor: "pointer", background: aiProvider === k ? `${p.color}10` : T.s2, border: `1px solid ${aiProvider === k ? `${p.color}35` : T.bd}`, display: "flex", justifyContent: "space-between", alignItems: "center", transition: ".15s" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 12, color: aiProvider === k ? p.color : T.t1 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: T.t4 }}>{p.desc}</div>
                    </div>
                    <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
                      {!p.keyNeeded && <Pill c={T.acc} bg="rgba(0,232,123,.08)">NO KEY</Pill>}
                      <div style={{ width: 10, height: 10, borderRadius: "50%", border: `2px solid ${aiProvider === k ? p.color : T.t4}`, background: aiProvider === k ? p.color : "transparent" }} />
                    </div>
                  </div>
                ))}
              </div>
              {/* Provider-specific key inputs */}
              {AI_PROVIDERS[aiProvider]?.keyNeeded && <div style={{ marginBottom: 12 }}>
                <div className="label">API KEY FOR {AI_PROVIDERS[aiProvider].name.toUpperCase()}</div>
                {(aiProvider === "anthropic" || aiProvider === "anthropic_opus") && <input className="ci" type="password" placeholder="sk-ant-xxxxx (from console.anthropic.com)" value={apiKeys.anthropic.key} onChange={e => setApiKeys(p => ({ ...p, anthropic: { ...p.anthropic, key: e.target.value } }))} />}
                {aiProvider.startsWith("openai") && <input className="ci" type="password" placeholder="sk-xxxxx (from platform.openai.com)" value={aiConfig.openaiKey} onChange={e => setAiConfig(p => ({ ...p, openaiKey: e.target.value }))} />}
                {aiProvider === "deepseek" && <input className="ci" type="password" placeholder="sk-xxxxx (from platform.deepseek.com)" value={aiConfig.deepseekKey} onChange={e => setAiConfig(p => ({ ...p, deepseekKey: e.target.value }))} />}
                {aiProvider === "groq_llama" && <input className="ci" type="password" placeholder="gsk_xxxxx (from console.groq.com)" value={aiConfig.groqKey} onChange={e => setAiConfig(p => ({ ...p, groqKey: e.target.value }))} />}
                {aiProvider === "gemini" && <input className="ci" type="password" placeholder="AIza... (from aistudio.google.com)" value={aiConfig.geminiKey} onChange={e => setAiConfig(p => ({ ...p, geminiKey: e.target.value }))} />}
                {aiProvider === "custom" && <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <input className="ci" placeholder="Endpoint URL (OpenAI-compatible)" value={aiConfig.customUrl} onChange={e => setAiConfig(p => ({ ...p, customUrl: e.target.value }))} />
                  <input className="ci" type="password" placeholder="API Key" value={aiConfig.customKey} onChange={e => setAiConfig(p => ({ ...p, customKey: e.target.value }))} />
                  <input className="ci" placeholder="Model name" value={aiConfig.customModel} onChange={e => setAiConfig(p => ({ ...p, customModel: e.target.value }))} />
                </div>}
              </div>}
              {aiProvider === "ollama" && <div style={{ marginBottom: 12 }}><div className="label">OLLAMA URL</div><input className="ci" placeholder="http://localhost:11434" value={aiConfig.ollamaUrl} onChange={e => setAiConfig(p => ({ ...p, ollamaUrl: e.target.value }))} /></div>}
              <div className="tg" onClick={() => setAiAutoRun(!aiAutoRun)} style={{ marginBottom: 8 }}>
                <div className="tt" style={{ background: aiAutoRun ? T.purple : "rgba(255,255,255,.08)" }}><div className="th" style={{ left: aiAutoRun ? 15 : 2 }} /></div>
                <div><span style={{ fontSize: 12, color: aiAutoRun ? T.purple : T.t2 }}>Auto-analyze on new signals</span><div style={{ fontSize: 12, color: T.t4 }}>Runs automatically when recommendations change</div></div>
              </div>
            </>}
          </div>}

          {/* Step 5: Asset Selection */}
          {wizStep === 5 && <div>
            {Object.entries(ASSETS).map(([key, cat]) => (
              <div key={key} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: T.acc, marginBottom: 6 }}>{cat.icon} {cat.label}</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {cat.items.map(a => {
                    const inWatch = watch.includes(a.id);
                    return <div key={a.id} onClick={() => setWatch(w => inWatch ? w.filter(x => x !== a.id) : [...w, a.id])} style={{ padding: "6px 10px", borderRadius: 5, cursor: "pointer", background: inWatch ? "rgba(0,232,123,.08)" : T.s2, border: `1px solid ${inWatch ? "rgba(0,232,123,.25)" : T.bd}`, fontSize: 12, fontWeight: 600, color: inWatch ? T.acc : T.t2, transition: ".15s" }}>
                      {inWatch ? "✓ " : ""}{a.id} <span style={{ fontSize: 12, color: T.t4, fontWeight: 400 }}>{a.name}</span>
                    </div>;
                  })}
                </div>
              </div>
            ))}
            <div style={{ padding: 8, borderRadius: 6, background: "rgba(0,232,123,.05)", border: `1px solid rgba(0,232,123,.12)`, fontSize: 12, color: T.acc, marginTop: 6 }}>
              <b>Holy Grail Target:</b> {watch.length} assets selected. Dalio recommends 15+ uncorrelated streams for 80% risk reduction. Select across ALL categories for maximum diversification.
            </div>
          </div>}

          {/* Step 6: Complete */}
          {wizStep === 6 && <div>
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.acc, marginBottom: 4 }}>SETUP COMPLETE</div>
              <div style={{ fontSize: 12, color: T.t2, marginBottom: 16 }}>All systems configured. Dalio's principles are active.</div>
            </div>
            <div style={{ background: T.s2, borderRadius: 8, padding: 12, marginBottom: 12 }}>
              {[
                { l: "Profile", v: `${wizProfile.experience || "—"} / ${wizProfile.goal || "—"} / ${wizProfile.horizon || "—"}` },
                { l: "Portfolio", v: `$${cfg.portfolio.toLocaleString()}` },
                { l: "Risk/Trade", v: `${cfg.maxRisk}%` },
                { l: "Circuit Breaker", v: `${cfg.drawdownHalt}%` },
                { l: "Watchlist", v: `${watch.length} assets` },
                { l: "APIs", v: `CG: ${wizChecks.coingecko === "ok" ? "✓" : "—"} FG: ${wizChecks.feargreed === "ok" ? "✓" : "—"} CC: ${wizChecks.coincap === "ok" ? "✓" : "—"}` },
                { l: "AI Analyst", v: aiEnabled ? `${AI_PROVIDERS[aiProvider]?.name} ✓` : "Disabled" },
                { l: "Dalio Engine", v: "8 principles active" },
              ].map((r, i) => <div key={i} className="row" style={{ fontSize: 12 }}><span style={{ color: T.t3 }}>{r.l}</span><span style={{ fontWeight: 600 }}>{r.v}</span></div>)}
            </div>
          </div>}

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, gap: 8 }}>
            {wizStep > 0 ? <Btn v="ghost" onClick={() => setWizStep(s => s - 1)}>← Back</Btn> : <div />}
            {wizStep < WIZARD_STEPS.length - 1 ? <Btn onClick={() => setWizStep(s => s + 1)}>Next →</Btn> : <Btn onClick={() => setWizardOpen(false)}>Launch Dashboard →</Btn>}
          </div>
          {wizStep > 0 && <div style={{ textAlign: "center", marginTop: 8 }}><span onClick={() => setWizardOpen(false)} style={{ fontSize: 12, color: T.t4, cursor: "pointer" }}>Skip wizard</span></div>}
        </div>
      </div>}

      {cfgOpen && <div style={{ background: T.s1, borderBottom: `1px solid ${T.bd}`, padding: "12px 14px" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: T.acc, letterSpacing: 1.2, marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${T.bd}` }}>CONFIG</div>
        <div className="cfg-grid">
          {[{ k: "portfolio", l: "Portfolio ($)" }, { k: "maxRisk", l: "Risk (%)" }, { k: "stopPct", l: "Flat SL (%)" }, { k: "atrMult", l: "ATR Mult" }, { k: "rr", l: "R:R" }, { k: "maxPos", l: "Max Pos" }, { k: "maxCorr", l: "Max Corr" }, { k: "trailPct", l: "Trail (%)" }, { k: "timeStop", l: "Time (d)" }, { k: "drawdownHalt", l: "Halt (%)" }].map(({ k, l }) => <div key={k}><div className="label">{l}</div><input type="number" className="ci" value={cfg[k]} onChange={e => setCfg(c => ({ ...c, [k]: +e.target.value }))} /></div>)}
          {[{ k: "dalio", l: "Dalio" }, { k: "useAtr", l: "ATR" }, { k: "shorts", l: "Shorts" }, { k: "trail", l: "Trail" }].map(({ k, l }) => <div key={k} className="tg" onClick={() => setCfg(c => ({ ...c, [k]: !c[k] }))}><div className="tt" style={{ background: cfg[k] ? T.acc : "rgba(255,255,255,.08)" }}><div className="th" style={{ left: cfg[k] ? 15 : 2 }} /></div><span style={{ fontSize: 12, color: T.t2 }}>{l}</span></div>)}
        </div>
      </div>}

      <div className="mt" onClick={() => setSideOpen(!sideOpen)}>{sideOpen ? "✕" : "☰"}</div>
      <div className={`so ${sideOpen ? "open" : ""}`} onClick={() => setSideOpen(false)} />

      <div className="layout">
        <div className={`sidebar ${sideOpen ? "open" : ""}`}>
          {sideOpen && <div style={{ padding: "10px 14px 4px", textAlign: "center" }}><div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,.15)", margin: "0 auto 6px" }} /></div>}
          <div className="cg">{Object.entries(ASSETS).map(([k, v]) => <div key={k} className={`cb ${cat === k ? "on" : ""}`} onClick={() => { setCat(k); setSel(null); }}><div style={{ fontSize: 12 }}>{v.icon}</div>{v.label}</div>)}</div>
          <div style={{ flex: 1, overflow: "auto", padding: "0 6px 6px" }}>
            {items.map(a => { const d = anl[a.id]; if (!d) return null; return (
              <div key={a.id} className={`si ${sel === a.id ? "on" : ""}`} onClick={() => { setSel(a.id); setTab("analysis"); setSideOpen(false); }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>{watch.includes(a.id) && <span style={{ color: T.warn, fontSize: 12 }}>★</span>}<span style={{ fontWeight: 700, fontSize: 12 }}>{a.id}</span><span style={{ fontSize: 12, color: T.t4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</span></div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}><div style={{ fontWeight: 600, fontSize: 12 }}>${d.price.toLocaleString()}</div><div style={{ fontSize: 12, color: d.dR >= 0 ? T.acc : T.danger, fontWeight: 700 }}>{d.dR >= 0 ? "+" : ""}{d.dR}%</div></div>
                </div>
                <div style={{ marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ display: "flex", gap: 3 }}><RecPill r={d.rec} />{d.short && cfg.shorts && <Pill c={T.purple} bg="rgba(123,97,255,.1)">SHORT</Pill>}</div><span style={{ fontSize: 12, color: T.t4 }}>D:{d.dalio.comp}</span></div>
                {pd[a.id] && <div style={{ marginTop: 3 }}><Spark data={pd[a.id].slice(-25)} w={220} h={28} /></div>}
              </div>
            ); })}
          </div>
        </div>

        <div className="main">
          <div className="tabs">{TABS.map(({ k, l, i }) => <div key={k} className={`tab ${tab === k ? "on" : ""}`} onClick={() => setTab(k)}><span style={{ marginRight: 3 }}>{i}</span>{l}</div>)}</div>
          <div className="content">

            {tab === "overview" && <div>
              {/* DALIO ADVISORY */}
              {(advisory.msgs.length > 0 || advisory.actions.length > 0) && <div className="card" style={{ marginBottom: 12, borderColor: advisory.msgs[0]?.type === "DANGER" ? "rgba(255,45,85,.2)" : advisory.msgs[0]?.type === "WARN" ? "rgba(245,166,35,.15)" : T.bd }}>
                <div className="label" style={{ color: T.warn, fontSize: 12 }}>◉ DALIO ADVISORY</div>
                {advisory.msgs.map((a, i) => <div key={`m${i}`} style={{ padding: "4px 0", borderBottom: `1px solid ${T.bd}`, display: "flex", gap: 6, alignItems: "flex-start" }}>
                  <Pill c={a.type === "DANGER" ? T.danger : a.type === "WARN" ? T.warn : a.type === "OPPORTUNITY" ? T.acc : T.acc2} bg={a.type === "DANGER" ? "rgba(255,45,85,.12)" : a.type === "WARN" ? "rgba(245,166,35,.1)" : a.type === "OPPORTUNITY" ? "rgba(0,232,123,.1)" : "rgba(0,201,255,.08)"}>{a.type}</Pill>
                  <span style={{ fontSize: 12, color: T.t2, lineHeight: 1.4 }}>{a.msg}</span>
                </div>)}

                {advisory.actions.length > 0 && <>
                  <div style={{ fontSize: 12, fontWeight: 800, color: T.acc, letterSpacing: 1.2, marginTop: 10, marginBottom: 6, paddingTop: 8, borderTop: `1px solid ${T.bd}` }}>RECOMMENDED ACTIONS</div>
                  {advisory.actions.map((a, i) => {
                    const assetCat = Object.entries(ASSETS).find(([_, c]) => c.items.find(x => x.id === a.asset));
                    const catLabel = assetCat ? assetCat[1].label : "";
                    const catIcon = assetCat ? assetCat[1].icon : "";
                    const assetInfo = assetCat ? assetCat[1].items.find(x => x.id === a.asset) : null;
                    return (
                    <div key={`a${i}`} style={{ padding: "8px", marginBottom: 4, borderRadius: 6, background: `${a.color}06`, border: `1px solid ${a.color}18` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 4, marginBottom: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Pill c={a.color} bg={`${a.color}18`}>{a.action}</Pill>
                          <div>
                            <div style={{ fontSize: 12, color: T.t4, fontWeight: 600, letterSpacing: 0.5, lineHeight: 1 }}>{catIcon} {catLabel}{assetInfo ? ` · ${assetInfo.sector}` : ""}</div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                              <span style={{ fontWeight: 800, fontSize: 12, color: T.t1 }}>{a.asset}</span>
                              {assetInfo && <span style={{ fontSize: 12, color: T.t3 }}>{assetInfo.name}</span>}
                            </div>
                          </div>
                          <Pill c={a.urgency === "HIGH" ? T.danger : a.urgency === "MEDIUM" ? T.warn : T.t3} bg={a.urgency === "HIGH" ? "rgba(255,45,85,.1)" : a.urgency === "MEDIUM" ? "rgba(245,166,35,.08)" : "rgba(255,255,255,.04)"}>{a.urgency}</Pill>
                        </div>
                        {a.size && <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
                          <span style={{ color: T.t2 }}>Size: <b>{a.size}</b></span>
                          {a.stop && <span style={{ color: T.danger }}>SL: {a.stop}</span>}
                          {a.tp && <span style={{ color: T.acc }}>TP: {a.tp}</span>}
                        </div>}
                      </div>
                      <div style={{ fontSize: 12, color: T.t3, lineHeight: 1.4 }}>{a.reason}</div>
                      {/* Prediction */}
                      {a.pred && <div style={{ marginTop: 6, padding: "6px 8px", borderRadius: 5, background: `${a.pred.pct >= 0 ? "rgba(0,232,123,.06)" : "rgba(255,45,85,.06)"}`, border: `1px solid ${a.pred.pct >= 0 ? "rgba(0,232,123,.12)" : "rgba(255,45,85,.12)"}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                            <span style={{ fontSize: 16, fontWeight: 800, color: a.pred.pct >= 0 ? T.acc : T.danger }}>{a.pred.pct >= 0 ? "+" : ""}{a.pred.pct}%</span>
                            <span style={{ fontSize: 12, color: T.t3 }}>predicted gain</span>
                            {a.pred.dollar !== 0 && <span style={{ fontSize: 12, fontWeight: 700, color: a.pred.pct >= 0 ? T.acc : T.danger }}>({a.pred.dollar >= 0 ? "+" : ""}${a.pred.dollar.toLocaleString()})</span>}
                          </div>
                          <div style={{ display: "flex", gap: 6, fontSize: 12, color: T.t4 }}>
                            <span>Win: {a.pred.winProb}%</span>
                            <span>EV: {a.pred.ev > 0 ? "+" : ""}{a.pred.ev}%</span>
                            <span>Range: {a.pred.low}% to +{a.pred.high}%</span>
                          </div>
                        </div>
                        {/* Visual prediction bar */}
                        <div style={{ marginTop: 4, position: "relative", height: 6, borderRadius: 3, background: "rgba(255,255,255,.04)", overflow: "hidden" }}>
                          <div style={{ position: "absolute", left: "50%", top: 0, width: 1, height: 6, background: "rgba(255,255,255,.15)" }} />
                          <div style={{ position: "absolute", left: `${Math.max(0, Math.min(100, 50 + a.pred.low * 2))}%`, right: `${Math.max(0, Math.min(100, 50 - a.pred.high * 2))}%`, top: 1, height: 4, borderRadius: 2, background: a.pred.pct >= 0 ? "rgba(0,232,123,.2)" : "rgba(255,45,85,.2)" }} />
                          <div style={{ position: "absolute", left: `${Math.max(2, Math.min(98, 50 + a.pred.pct * 2))}%`, top: 0, width: 4, height: 6, borderRadius: 2, background: a.pred.pct >= 0 ? T.acc : T.danger, transform: "translateX(-2px)" }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.t4, marginTop: 2 }}>
                          <span>Downside</span>
                          <span>Pat:{a.pred.patBoost > 0 ? "+" : ""}{a.pred.patBoost} Mom:{a.pred.momFactor > 0 ? "+" : ""}{a.pred.momFactor} Conf:{a.pred.confBoost > 0 ? "+" : ""}{a.pred.confBoost}</span>
                          <span>Upside</span>
                        </div>
                        {/* ═══ HOLD TIMER ═══ */}
                        {a.pred.holdTimer && <div style={{ marginTop: 6, padding: "6px 8px", borderRadius: 5, background: "rgba(255,255,255,.02)", border: `1px solid ${T.bd}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 4, marginBottom: 4 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 12, color: T.t3 }}>⏱ ESTIMATED HOLD</span>
                              <span style={{ fontSize: 16, fontWeight: 800, color: a.pred.holdTimer.color }}>{a.pred.holdTimer.days}d</span>
                              <span style={{ fontSize: 12, color: T.t4 }}>({a.pred.holdTimer.hours}h)</span>
                              <Pill c={a.pred.holdTimer.color} bg={`${a.pred.holdTimer.color}15`}>{a.pred.holdTimer.label}</Pill>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: T.t2 }}>Sell by: {a.pred.holdTimer.sellDate}</div>
                              <div style={{ fontSize: 12, color: T.t4 }}>{a.pred.holdTimer.sellTime}</div>
                            </div>
                          </div>
                          {/* Phase timeline bar */}
                          <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", gap: 1, marginBottom: 4 }}>
                            <div style={{ width: `${(a.pred.holdTimer.entryDays / a.pred.holdTimer.days) * 100}%`, background: T.acc2, borderRadius: "4px 0 0 4px", minWidth: 4 }} title="Entry phase" />
                            <div style={{ flex: 1, background: a.pred.holdTimer.color, opacity: 0.3 }} title="Hold phase" />
                            <div style={{ width: `${(a.pred.holdTimer.exitDays / a.pred.holdTimer.days) * 100}%`, background: T.warn, borderRadius: "0 4px 4px 0", minWidth: 4 }} title="Exit window" />
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.t4 }}>
                            <span style={{ color: T.acc2 }}>Entry {a.pred.holdTimer.entryDays}d</span>
                            <span>Hold {a.pred.holdTimer.holdDays}d</span>
                            <span style={{ color: T.warn }}>Exit {a.pred.holdTimer.exitDays}d</span>
                          </div>
                          {/* Timer factors */}
                          <div style={{ display: "flex", gap: 6, marginTop: 4, fontSize: 12, color: T.t4, flexWrap: "wrap" }}>
                            <span>Base: {a.pred.holdTimer.factors.base}d</span>
                            <span>Mom: ×{a.pred.holdTimer.factors.momentum}</span>
                            <span>Conf: ×{a.pred.holdTimer.factors.confluence}</span>
                            <span>Vol: ×{a.pred.holdTimer.factors.volRegime}</span>
                            <span>MTF: ×{a.pred.holdTimer.factors.mtf}</span>
                          </div>
                        </div>}
                        {/* ═══ LIVE CHART + PREDICTION ═══ */}
                        {a.pred.projections && (() => {
                          const assetHist = pd[a.asset];
                          if (!assetHist || assetHist.length < 10) return null;
                          const hist = assetHist.slice(-30);
                          const projPts = a.pred.projections;
                          const histDays = hist.length;
                          const totalDays = histDays + 30;
                          const allPrices = [...hist.map(d => d.close), ...hist.map(d => d.high), ...hist.map(d => d.low), ...projPts.map(p => p.price), ...projPts.map(p => p.high), ...projPts.map(p => p.low)];
                          const mn = Math.min(...allPrices), mx = Math.max(...allPrices), rng = mx - mn || 1;
                          const W = 320, H = 28, pad = { t: 2, b: 3, l: 1, r: 1 };
                          const plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
                          const X = i => pad.l + (i / (totalDays - 1)) * plotW;
                          const Y = v => pad.t + plotH - ((v - mn) / rng) * plotH;
                          const histPath = hist.map((d, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(d.close).toFixed(1)}`).join("");
                          const projMap = [{ t: 0, p: hist[histDays - 1].close }, { t: 1/30, p: projPts[0].price }, { t: 7/30, p: projPts[1].price }, { t: 1, p: projPts[3].price }];
                          const predPath = projMap.map((pt, i) => `${i ? "L" : "M"}${X(histDays - 1 + pt.t * 30).toFixed(1)},${Y(pt.p).toFixed(1)}`).join("");
                          const bandPts = [{ t: 0, h: hist[histDays-1].close, l: hist[histDays-1].close }, ...projPts.map((p, i) => ({ t: [1/30, 1/30, 7/30, 1][i], h: p.high, l: p.low }))];
                          const bandTop = bandPts.map((p, i) => `${i ? "L" : "M"}${X(histDays - 1 + p.t * 30).toFixed(1)},${Y(p.h).toFixed(1)}`).join("");
                          const bandBot = bandPts.slice().reverse().map(p => `L${X(histDays - 1 + p.t * 30).toFixed(1)},${Y(p.l).toFixed(1)}`).join("");
                          const up = projPts[3].price >= hist[histDays - 1].close;
                          const col = up ? T.acc : T.danger;
                          return <div style={{ marginTop: 3, padding: "1px 3px", borderRadius: 3, background: "rgba(123,97,255,.02)", border: `1px solid rgba(123,97,255,.06)` }}>
                            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
                              <line x1={X(histDays - 1)} y1={pad.t} x2={X(histDays - 1)} y2={H - pad.b} stroke="rgba(255,255,255,.06)" strokeWidth="0.15" strokeDasharray="0.8,0.8" />
                              <path d={`${bandTop} ${bandBot} Z`} fill={up ? "rgba(0,232,123,.04)" : "rgba(255,45,85,.04)"} />
                              <path d={histPath} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="0.4" />
                              <path d={predPath} fill="none" stroke={col} strokeWidth="0.4" strokeDasharray="1.2,1" />
                              <circle cx={X(histDays - 1)} cy={Y(hist[histDays - 1].close)} r="0.8" fill={T.t1} />
                              {projPts.map((p, i) => { const tx = [1/30, 1/30, 7/30, 1][i]; return <circle key={i} cx={X(histDays - 1 + tx * 30)} cy={Y(p.price)} r="0.5" fill={col} />; })}
                              <text x={W - 2} y={Y(projPts[3].price) + 1} textAnchor="end" fill={col} fontSize="2.5" fontWeight="600">${projPts[3].price.toLocaleString()}</text>
                              <text x={X(histDays - 1) - 1} y={H - 0.5} textAnchor="end" fill={T.t4} fontSize="2">hist</text>
                              <text x={X(histDays - 1) + 1} y={H - 0.5} fill={col} fontSize="2">pred</text>
                            </svg>
                            <div style={{ display: "flex", gap: 0 }}>
                              {projPts.map((pr, i) => (
                                <div key={i} style={{ flex: 1, textAlign: "center", padding: "0px 1px", fontSize: 12 }}>
                                  <span style={{ color: T.t4, fontSize: 4 }}>{pr.label} </span>
                                  <span style={{ fontWeight: 700, color: pr.pct >= 0 ? T.acc : T.danger, fontSize: 7 }}>{pr.pct > 0 ? "+" : ""}{pr.pct}%</span>
                                </div>
                              ))}
                            </div>
                          </div>;
                        })()}
                      </div>}
                      {(a.action === "BUY" || a.action === "SHORT") && !drawdown.halted && <div style={{ marginTop: 6 }}>
                        <Btn v={a.action === "BUY" ? "primary" : "danger"} onClick={() => { const asset = Object.values(anl).find(x => x.id === a.asset); if (asset) exec(asset, a.action); }}>EXECUTE {a.action} {a.asset}</Btn>
                      </div>}
                      {a.action === "CLOSE" && <div style={{ marginTop: 6 }}>
                        <Btn v="ghost" onClick={() => { const t = trades.find(t => t.status === "OPEN" && t.asset === a.asset); if (t) closeTrade(t.id, a.reason.slice(0, 40)); }}>CLOSE {a.asset}</Btn>
                      </div>}
                    </div>
                  )})}
                </>}
              </div>}

              {/* AI ANALYSIS PANEL */}
              {aiEnabled && <div className="card" style={{ marginBottom: 12, borderColor: `${AI_PROVIDERS[aiProvider]?.color || T.purple}30` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div className="label" style={{ color: AI_PROVIDERS[aiProvider]?.color || T.purple, fontSize: 12, marginBottom: 0 }}>🧠 AI ANALYST</div>
                    <Pill c={AI_PROVIDERS[aiProvider]?.color || T.purple} bg={`${AI_PROVIDERS[aiProvider]?.color || T.purple}15`}>{AI_PROVIDERS[aiProvider]?.name || aiProvider}</Pill>
                  </div>
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    {aiAnalysis && <span style={{ fontSize: 12, color: T.t4 }}>{aiAnalysis.provider} · {new Date(aiAnalysis.ts).toLocaleTimeString()}</span>}
                    <Btn v="purple" onClick={runAiAnalysis}>{aiLoading ? "Analyzing..." : "⚡ Run Analysis"}</Btn>
                  </div>
                </div>
                {aiLoading && <div style={{ padding: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 18, marginBottom: 6, animation: "pulse 1.5s infinite" }}>🧠</div>
                  <div style={{ fontSize: 12, color: T.purple }}>Claude is reviewing {advisory.actions.length} recommended actions against Dalio's 8 principles...</div>
                </div>}
                {aiError && <div style={{ padding: 10, borderRadius: 6, background: "rgba(255,45,85,.06)", border: `1px solid rgba(255,45,85,.15)`, fontSize: 12, color: T.danger }}>{aiError}</div>}
                {aiAnalysis && !aiLoading && <div>
                  <div style={{ background: "#050710", borderRadius: 6, padding: 12, fontSize: 12, lineHeight: 1.6, color: "#99bbdd", maxHeight: 350, overflow: "auto", border: `1px solid ${T.bd}`, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {aiAnalysis.text}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: T.t4 }}>
                    <span>Model: {aiAnalysis.model}</span>
                    <span>Analysis at: {new Date(aiAnalysis.ts).toLocaleString()}</span>
                  </div>
                </div>}
                {!aiAnalysis && !aiLoading && !aiError && <div style={{ padding: 12, textAlign: "center", fontSize: 12, color: T.t3 }}>
                  Click "Run Analysis" to have Claude review the {advisory.actions.length} recommended actions above. The AI will validate each trade against Dalio's principles and provide APPROVE/MODIFY/REJECT verdicts.
                </div>}
              </div>}

              {/* STATS ROW 1: Portfolio + Regime + Holy Grail + Drawdown + Fear&Greed */}
              <div className="g5" style={{ marginBottom: 12 }}>
                <Stat l="PORTFOLIO" v={`$${(cfg.portfolio / 1000).toFixed(0)}K`} s={`PnL: ${drawdown.pnl >= 0 ? "+" : ""}$${drawdown.pnl.toLocaleString()}`} c={drawdown.pnl >= 0 ? T.acc : T.danger} />
                <div className="stat-card" style={{ borderColor: regime.color + "30" }}>
                  <div className="label">REGIME</div>
                  <div className="stat-val" style={{ color: regime.color, fontSize: 12 }}>{regime.q}</div>
                  <div className="stat-sub">{regime.name}</div>
                </div>
                <div className="stat-card">
                  <div className="label">HOLY GRAIL</div>
                  <div className="stat-val" style={{ color: holyGrail.uncorrelated >= 10 ? T.acc : holyGrail.uncorrelated >= 5 ? T.warn : T.danger }}>{holyGrail.uncorrelated}/{holyGrail.target}</div>
                  <div style={{ height: 4, background: "rgba(255,255,255,.04)", borderRadius: 2, marginTop: 4 }}><div style={{ height: 4, borderRadius: 2, background: T.acc, width: `${holyGrail.score}%`, transition: "0.3s" }} /></div>
                  <div className="stat-sub">{holyGrail.categories}/4 categories · {holyGrail.streams} tracked</div>
                </div>
                <div className="stat-card" style={{ borderColor: drawdown.halted ? "rgba(255,45,85,.3)" : T.bd }}>
                  <div className="label" style={{ color: drawdown.halted ? T.danger : T.t3 }}>DRAWDOWN</div>
                  <div className="stat-val" style={{ color: drawdown.ddPct > drawdown.limit * 0.7 ? T.danger : drawdown.ddPct > 0 ? T.warn : T.acc }}>{drawdown.ddPct}%</div>
                  <div style={{ height: 4, background: "rgba(255,255,255,.04)", borderRadius: 2, marginTop: 4 }}><div style={{ height: 4, borderRadius: 2, background: drawdown.ddPct > drawdown.limit * 0.7 ? T.danger : T.warn, width: `${Math.min(drawdown.ddPct / drawdown.limit * 100, 100)}%` }} /></div>
                  <div className="stat-sub">{drawdown.halted ? "⚠ HALTED" : `limit: ${drawdown.limit}%`}</div>
                </div>
                <div className="stat-card">
                  <div className="label">FEAR & GREED</div>
                  {liveData?.fearGreed?.[0] ? <><div className="stat-val" style={{ color: +liveData.fearGreed[0].value > 60 ? T.acc : +liveData.fearGreed[0].value < 40 ? T.danger : T.warn }}>{liveData.fearGreed[0].value}</div><div className="stat-sub">{liveData.fearGreed[0].value_classification}</div></> : <><div className="stat-val" style={{ color: T.t4 }}>—</div><div className="stat-sub">connecting...</div></>}
                </div>
              </div>

              {/* STATS ROW 2 */}
              <div className="g5" style={{ marginBottom: 12 }}>
                <Stat l="OPEN" v={trades.filter(t => t.status === "OPEN").length} s={`of ${cfg.maxPos}`} c={T.acc2} />
                <Stat l="RISK" v={`${cfg.maxRisk}%`} s={`$${(cfg.portfolio * cfg.maxRisk / 100).toLocaleString()}`} c={T.warn} />
                <Stat l="STOPS" v={cfg.useAtr ? `ATR×${cfg.atrMult}` : `${cfg.stopPct}%`} c={T.danger} />
                <Stat l="DATA" v={liveStatus} s={liveStatus === "LIVE" ? "CoinGecko API" : "Simulated"} c={liveStatus === "LIVE" ? T.acc : T.warn} />
                <div className="stat-card">
                  <div className="label">EXPORT / IMPORT</div>
                  <div style={{ display: "flex", gap: 4, marginTop: 4 }}><Btn v="ghost" onClick={exportState}>↓ Export</Btn><label className="btn" style={{ background: "rgba(255,255,255,.06)", color: T.t2, padding: "6px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 800, fontFamily: "inherit" }}>↑ Import<input type="file" accept=".json" onChange={importState} style={{ display: "none" }} /></label></div>
                </div>
              </div>

              {/* Equity Curve (if trades exist) */}
              {equityCurve.length > 1 && <div className="card" style={{ marginBottom: 12 }}>
                <div className="label" style={{ color: T.acc }}>EQUITY CURVE</div>
                <svg viewBox={`0 0 400 80`} style={{ width: "100%", height: "auto" }}>
                  {(() => {
                    const pts = equityCurve; const mn = Math.min(...pts.map(p => p.y)), mx = Math.max(...pts.map(p => p.y)), rng = mx - mn || 1;
                    const X = i => (i / (pts.length - 1)) * 400, Y = v => 75 - ((v - mn) / rng) * 70;
                    const path = pts.map((p, i) => `${i ? "L" : "M"}${X(i)},${Y(p.y)}`).join("");
                    const up = pts[pts.length - 1].y >= pts[0].y;
                    return <><path d={`${path} L400,80 L0,80 Z`} fill={up ? "rgba(0,232,123,.1)" : "rgba(255,45,85,.1)"} /><path d={path} fill="none" stroke={up ? T.acc : T.danger} strokeWidth="1.5" /><line x1="0" y1={Y(cfg.portfolio)} x2="400" y2={Y(cfg.portfolio)} stroke="rgba(255,255,255,.08)" strokeWidth="0.5" strokeDasharray="4,3" /><text x="2" y={Y(mx) + 3} fill={T.t4} fontSize="6">${(mx / 1000).toFixed(1)}K</text><text x="2" y={Y(mn) - 1} fill={T.t4} fontSize="6">${(mn / 1000).toFixed(1)}K</text></>;
                  })()}
                </svg>
              </div>}

              {/* VISUAL: Signal Distribution + Sector Performance + Sparkline Grid */}
              <div className="g3" style={{ marginBottom: 12 }}>
                <div className="card">
                  <div className="label" style={{ color: T.acc2 }}>SIGNAL DISTRIBUTION</div>
                  <DonutChart segments={[{ v: recCounts.buy, c: T.acc }, { v: recCounts.hold, c: T.warn }, { v: recCounts.sell, c: T.danger }]} size={120} label={`${Object.keys(anl).length}`} />
                  <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 8, fontSize: 12 }}>
                    <span><span style={{ color: T.acc }}>●</span> Buy {recCounts.buy}</span>
                    <span><span style={{ color: T.warn }}>●</span> Hold {recCounts.hold}</span>
                    <span><span style={{ color: T.danger }}>●</span> Sell {recCounts.sell}</span>
                  </div>
                </div>
                <div className="card">
                  <div className="label" style={{ color: T.warn }}>SECTOR 30D PERFORMANCE</div>
                  <HBarChart items={sectorPerf} w={260} barH={16} />
                </div>
                <div className="card">
                  <div className="label" style={{ color: T.purple }}>WATCHLIST SPARKLINES</div>
                  {watch.slice(0, 4).map(id => anl[id] ? <div key={id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 12, width: 36 }}>{id}</span>
                    <div style={{ flex: 1 }}>{pd[id] && <Spark data={pd[id].slice(-30)} w={120} h={18} />}</div>
                    <span style={{ fontSize: 12, color: anl[id].dR >= 0 ? T.acc : T.danger, fontWeight: 700, width: 40, textAlign: "right" }}>{anl[id].dR >= 0 ? "+" : ""}{anl[id].dR}%</span>
                  </div> : null)}
                </div>
              </div>

              <div className="g2">
                <div className="card"><div className="label" style={{ color: T.acc }}>▲ TOP OPPORTUNITIES</div>{Object.values(anl).filter(a => a.rec.includes("BUY")).sort((a, b) => b.conf - a.conf).slice(0, 4).map(a => <div key={a.id} className="row"><div><b>{a.id}</b> <span style={{ fontSize: 12, color: T.t4 }}>{a.name}</span></div><div style={{ display: "flex", gap: 5, alignItems: "center" }}><span style={{ fontSize: 12, color: T.acc }}>{a.conf}%</span><RecPill r={a.rec} /></div></div>)}</div>
                <div className="card"><div className="label" style={{ color: T.danger }}>⚠ RISK + VOLATILITY</div>{Object.values(anl).sort((a, b) => b.vol - a.vol).slice(0, 5).map(a => <div key={a.id} className="row" style={{ fontSize: 12 }}><b>{a.id}</b><div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 50 }}><div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,.04)" }}><div style={{ height: 4, borderRadius: 2, background: a.vol > 50 ? T.danger : a.vol > 30 ? T.warn : T.acc, width: `${Math.min(a.vol, 100)}%`, opacity: 0.6 }} /></div></div><span style={{ color: a.vol > 50 ? T.danger : T.warn, fontSize: 12 }}>{a.vol}%</span></div></div>)}</div>
              </div>
            </div>}

            {/* ═══ MARKETS TAB ═══ */}
            {tab === "markets" && <div>
              {/* Search + View Toggle */}
              <div style={{ display: "flex", gap: 6, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 150, position: "relative" }}>
                  <input className="ci" placeholder="Search assets... (name, ticker, sector)" value={mktSearch} onChange={e => setMktSearch(e.target.value)} style={{ fontSize: 12, paddingLeft: 24 }} />
                  <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: T.t4 }}>🔍</span>
                </div>
                <div style={{ display: "flex", gap: 2 }}>
                  {[{ k: "all", l: "All Assets" }, { k: "movers", l: "Movers" }].map(v => (
                    <div key={v.k} onClick={() => setMktView(v.k)} style={{ padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: "pointer", background: mktView === v.k ? "rgba(0,201,255,.12)" : "rgba(255,255,255,.03)", color: mktView === v.k ? T.acc2 : T.t3, border: `1px solid ${mktView === v.k ? "rgba(0,201,255,.2)" : T.bd}` }}>{v.l}</div>
                  ))}
                </div>
                {mktData.ts && <span style={{ fontSize: 12, color: T.t4 }}>Updated: {new Date(mktData.ts).toLocaleTimeString()}</span>}
              </div>

              {mktView === "all" && (() => {
                const q = mktSearch.toLowerCase().trim();
                // Build full listings from internal ASSETS + live market data
                const sections = [
                  { key: "crypto", title: "Crypto", icon: "◈", color: T.acc2, internal: ASSETS.crypto.items, live: mktData.crypto?.map(c => ({ sym: c.symbol?.toUpperCase(), name: c.name, price: c.current_price, chg24: c.price_change_percentage_24h ? +c.price_change_percentage_24h.toFixed(2) : 0, img: c.image, sector: "Crypto" })) },
                  { key: "asx", title: "ASX (Australia)", icon: "🦘", color: T.acc, internal: ASSETS.asx.items },
                  { key: "usEquities", title: "US Equities", icon: "△", color: T.warn, internal: ASSETS.usEquities.items },
                  { key: "euEquities", title: "EU Equities", icon: "△", color: T.purple, internal: ASSETS.euEquities.items },
                  { key: "asiaEquities", title: "Asia", icon: "🌏", color: T.acc2, internal: ASSETS.asiaEquities.items },
                  { key: "commodities", title: "Commodities", icon: "⬡", color: T.warn, internal: ASSETS.commodities.items },
                  { key: "ipo", title: "IPO Pipeline", icon: "🚀", color: "#ff6b35", internal: ASSETS.ipo.items },
                  { key: "polymarket", title: "Predictions", icon: "◎", color: T.t3, internal: ASSETS.polymarket.items },
                ];
                return sections.map(sec => {
                  // Merge internal assets with live data where available
                  let items = sec.internal.map(a => {
                    const liveA = anl[a.id];
                    return { sym: a.id, name: a.name, price: liveA?.price || a.base, chg24: liveA?.dR || 0, sector: a.sector, vol: liveA?.vol || a.vol, trend: liveA?.trend, rec: liveA?.rec, dalio: liveA?.dalio?.comp, watched: watch.includes(a.id) };
                  });
                  // Add extra live crypto not in internal list
                  if (sec.live) {
                    const internalIds = new Set(sec.internal.map(a => a.id));
                    sec.live.filter(l => !internalIds.has(l.sym)).forEach(l => items.push({ sym: l.sym, name: l.name, price: l.price, chg24: l.chg24, sector: l.sector || "Crypto", img: l.img, external: true }));
                  }
                  // Filter by search
                  if (q) items = items.filter(i => i.sym.toLowerCase().includes(q) || i.name.toLowerCase().includes(q) || (i.sector || "").toLowerCase().includes(q));
                  if (q && items.length === 0) return null;
                  return <div key={sec.key} className="card" style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ fontSize: 12 }}>{sec.icon}</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: sec.color }}>{sec.title}</span>
                        <span style={{ fontSize: 12, color: T.t4 }}>{items.length} assets</span>
                      </div>
                    </div>
                    <div style={{ maxHeight: items.length > 12 ? 280 : "none", overflow: items.length > 12 ? "auto" : "visible" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                        <thead style={{ position: "sticky", top: 0, background: T.s1 }}><tr>
                          {["", "Ticker", "Name", "Price", "24h", "Sector", "Vol", "Signal", ""].map((h, i) => <th key={i} style={{ padding: "2px 4px", textAlign: "left", color: T.t4, fontWeight: 600, borderBottom: `1px solid ${T.bd}`, whiteSpace: "nowrap", fontSize: 12 }}>{h}</th>)}
                        </tr></thead>
                        <tbody>{items.map((r, i) => (
                          <tr key={i} style={{ borderBottom: `1px solid ${T.bd}`, cursor: "pointer" }} onClick={() => { if (!r.external && anl[r.sym]) { setSel(r.sym); setTab("analysis"); } }}>
                            <td style={{ padding: "3px 4px", width: 14 }}>{r.img ? <img src={r.img} width="12" height="12" style={{ borderRadius: 2 }} /> : null}</td>
                            <td style={{ padding: "3px 4px", fontWeight: 700, color: T.t1 }}>{r.sym}</td>
                            <td style={{ padding: "3px 4px", color: T.t3, maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</td>
                            <td style={{ padding: "3px 4px", color: T.t2, fontWeight: 600 }}>${typeof r.price === "number" ? r.price.toLocaleString(undefined, { maximumFractionDigits: r.price > 100 ? 0 : r.price > 1 ? 2 : r.price > 0.01 ? 4 : 8 }) : "—"}</td>
                            <td style={{ padding: "3px 4px", fontWeight: 700, color: r.chg24 >= 0 ? T.acc : T.danger }}>{r.chg24 > 0 ? "+" : ""}{r.chg24}%</td>
                            <td style={{ padding: "3px 4px", color: T.t4 }}>{r.sector}</td>
                            <td style={{ padding: "3px 4px", color: r.vol > 50 ? T.danger : r.vol > 30 ? T.warn : T.t4 }}>{r.vol ? `${r.vol}%` : "—"}</td>
                            <td style={{ padding: "3px 4px" }}>{r.rec ? <Pill c={r.rec.includes("BUY") ? T.acc : r.rec.includes("SELL") ? T.danger : T.t3} bg={r.rec.includes("BUY") ? "rgba(0,232,123,.08)" : r.rec.includes("SELL") ? "rgba(255,45,85,.08)" : "rgba(255,255,255,.03)"}>{r.rec}</Pill> : <span style={{ color: T.t4 }}>—</span>}</td>
                            <td style={{ padding: "3px 4px" }}><span onClick={e => { e.stopPropagation(); if (!r.external) setWatch(w => w.includes(r.sym) ? w.filter(x => x !== r.sym) : [...w, r.sym]); }} style={{ cursor: "pointer", color: r.watched ? T.warn : T.t4, fontSize: 12 }}>{r.watched ? "★" : "☆"}</span></td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  </div>;
                });
              })()}

              {mktView === "movers" && (() => {
                const MoverRow = ({ data, isCrypto }) => {
                  if (!data || data.length === 0) return <div style={{ fontSize: 12, color: T.t4, padding: 4 }}>No data</div>;
                  const items = isCrypto ? data.map(c => ({ sym: c.symbol?.toUpperCase(), name: c.name, price: c.current_price, chg24: c.price_change_percentage_24h ? +c.price_change_percentage_24h.toFixed(2) : 0, img: c.image })) : data;
                  const risers = [...items].filter(i => i.chg24 > 0).sort((a, b) => b.chg24 - a.chg24).slice(0, 6);
                  const fallers = [...items].filter(i => i.chg24 < 0).sort((a, b) => a.chg24 - b.chg24).slice(0, 6);
                  const Row = ({ r, up }) => <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0", borderBottom: `1px solid ${T.bd}`, fontSize: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {isCrypto && r.img && <img src={r.img} width="10" height="10" style={{ borderRadius: 2 }} />}
                      <span style={{ fontWeight: 700 }}>{r.sym}</span>
                      <span style={{ color: T.t4, fontSize: 12 }}>{r.name}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <span style={{ color: T.t3 }}>${typeof r.price === "number" ? r.price.toLocaleString(undefined, { maximumFractionDigits: r.price > 100 ? 0 : r.price > 1 ? 2 : 4 }) : r.price}</span>
                      <span style={{ fontWeight: 800, color: up ? T.acc : T.danger, minWidth: 40, textAlign: "right" }}>{up ? "+" : ""}{r.chg24}%</span>
                    </div>
                  </div>;
                  return <div className="g2">
                    <div><div style={{ fontSize: 12, fontWeight: 800, color: T.acc, letterSpacing: 0.8, marginBottom: 4 }}>▲ RISERS</div>{risers.map((r, i) => <Row key={i} r={r} up />)}</div>
                    <div><div style={{ fontSize: 12, fontWeight: 800, color: T.danger, letterSpacing: 0.8, marginBottom: 4 }}>▼ FALLERS</div>{fallers.map((r, i) => <Row key={i} r={r} />)}</div>
                  </div>;
                };
                return <>
                  {[{ t: "CRYPTO", icon: "◈", c: T.acc2, d: mktData.crypto, crypto: true },
                    { t: "COMMODITIES", icon: "⬡", c: T.warn, d: mktData.commodities },
                    { t: "ASX", icon: "🦘", c: T.acc, d: mktData.asx },
                    { t: "INDICES", icon: "◎", c: T.purple, d: mktData.indices },
                    { t: "FOREX", icon: "⚡", c: T.acc2, d: mktData.forex },
                  ].map((s, i) => <div key={i} className="card" style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}><span style={{ fontSize: 12 }}>{s.icon}</span><span style={{ fontSize: 12, fontWeight: 800, color: s.c }}>{s.t}</span></div>
                    <MoverRow data={s.d} isCrypto={s.crypto} />
                  </div>)}
                </>;
              })()}

              {mktData.loading && <div style={{ textAlign: "center", padding: 20, color: T.t3, fontSize: 12 }}>Loading market data...</div>}
            </div>}

            {/* ═══ PORTFOLIO OPTIMIZER (Markowitz) ═══ */}
            {tab === "settings" && <div style={{ display: "flex", gap: 3, marginBottom: 12, flexWrap: "wrap" }}>
              {[{ k: "broker", l: "🔗 Broker" }, { k: "api", l: "⬡ APIs" }, { k: "optimize", l: "⚖ Optimizer" }, { k: "fullbt", l: "↻ Backtest" }, { k: "backtest", l: "📊 Signals" }, { k: "alerts", l: "⚡ Alerts" }].map(t => (
                <div key={t.k} onClick={() => setSettingsTab(t.k)} style={{ padding: "5px 12px", borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: "pointer", background: settingsTab === t.k ? "rgba(0,201,255,.1)" : "rgba(255,255,255,.03)", color: settingsTab === t.k ? T.acc2 : T.t3, border: `1px solid ${settingsTab === t.k ? "rgba(0,201,255,.2)" : T.bd}` }}>{t.l}</div>
              ))}
            </div>}

            {tab === "settings" && settingsTab === "optimize" && <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div className="label" style={{ color: T.purple, fontSize: 12, marginBottom: 0 }}>⚖ MARKOWITZ PORTFOLIO OPTIMIZATION</div>
                <Btn v="purple" onClick={runOpt}>⚡ Run Optimizer</Btn>
              </div>
              <div style={{ fontSize: 12, color: T.t3, marginBottom: 12 }}>Computes optimal weights across your watchlisted/active assets using mean-variance optimization. Compares Risk Parity (Dalio), Min Variance, and Max Sharpe portfolios.</div>
              {!optResult && <div className="card" style={{ textAlign: "center", padding: 24, color: T.t4 }}>Add assets to watchlist, then click Run Optimizer</div>}
              {optResult && <div>
                <div className="g3" style={{ marginBottom: 12 }}>
                  {[
                    { title: "Risk Parity (Dalio)", data: optResult.riskParity, color: T.acc, desc: "Equal risk contribution — Dalio's All Weather approach" },
                    { title: "Min Variance", data: optResult.minVariance, color: T.acc2, desc: "Lowest possible portfolio volatility" },
                    { title: "Max Sharpe", data: optResult.maxSharpe, color: T.warn, desc: "Best risk-adjusted return (return per unit of risk)" },
                  ].map((p, i) => <div key={i} className="card" style={{ borderColor: `${p.color}25` }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: p.color, marginBottom: 4 }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: T.t4, marginBottom: 8 }}>{p.desc}</div>
                    <div className="g3" style={{ gap: 4, marginBottom: 8 }}>
                      <div style={{ textAlign: "center" }}><div style={{ fontSize: 14, fontWeight: 800, color: p.data.ret >= 0 ? T.acc : T.danger }}>{p.data.ret > 0 ? "+" : ""}{p.data.ret}%</div><div style={{ fontSize: 12, color: T.t4 }}>Ann. Return</div></div>
                      <div style={{ textAlign: "center" }}><div style={{ fontSize: 14, fontWeight: 800, color: p.data.vol > 30 ? T.danger : T.warn }}>{p.data.vol}%</div><div style={{ fontSize: 12, color: T.t4 }}>Volatility</div></div>
                      <div style={{ textAlign: "center" }}><div style={{ fontSize: 14, fontWeight: 800, color: p.data.sharpe > 1 ? T.acc : T.warn }}>{p.data.sharpe}</div><div style={{ fontSize: 12, color: T.t4 }}>Sharpe</div></div>
                    </div>
                    {p.data.weights.filter(w => w.w > 0.01).sort((a, b) => b.w - a.w).map((w, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                        <span style={{ fontWeight: 700, fontSize: 12, width: 40 }}>{w.id}</span>
                        <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,.04)", borderRadius: 3 }}><div style={{ height: 6, borderRadius: 3, background: p.color, width: `${w.w * 100}%`, opacity: 0.5 }} /></div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: p.color, width: 36, textAlign: "right" }}>{(w.w * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>)}
                </div>
                <div className="card">
                  <div className="label" style={{ color: T.acc2 }}>OPTIMIZATION vs ALL WEATHER</div>
                  <div style={{ fontSize: 12, color: T.t2, lineHeight: 1.5, padding: "4px 0" }}>
                    Dalio's All Weather: 30% stocks, 40% LT bonds, 15% IT bonds, 7.5% gold, 7.5% commodities. The optimizer above computes what the math says is optimal given YOUR specific asset universe and current correlations. Risk Parity is closest to Dalio's philosophy — it doesn't try to predict returns, just balances risk.
                  </div>
                </div>
              </div>}
            </div>}

            {/* ═══ FULL SYSTEM BACKTEST ═══ */}
            {tab === "settings" && settingsTab === "fullbt" && <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div className="label" style={{ color: T.acc, fontSize: 12, marginBottom: 0 }}>↻ DALIO SYSTEM BACKTEST</div>
                <Btn onClick={runBt}>⚡ Run Backtest</Btn>
              </div>
              <div style={{ fontSize: 12, color: T.t3, marginBottom: 12 }}>Runs the full Dalio scoring engine over historical data. Simulates taking the best signal every 5 days and holding for 5 days. Shows what following this system would have produced.</div>
              {!btResult && <div className="card" style={{ textAlign: "center", padding: 24, color: T.t4 }}>Click Run Backtest to simulate the Dalio system over historical data</div>}
              {btResult && <div>
                <div className="g4" style={{ marginBottom: 12 }}>
                  <Stat l="TOTAL RETURN" v={`${btResult.totalRet > 0 ? "+" : ""}${btResult.totalRet}%`} c={btResult.totalRet > 0 ? T.acc : T.danger} s={`$${btResult.startEquity.toLocaleString()} → $${btResult.endEquity.toLocaleString()}`} />
                  <Stat l="WIN RATE" v={`${btResult.winRate}%`} c={btResult.winRate > 55 ? T.acc : T.danger} s={`${btResult.wins}W / ${btResult.losses}L`} />
                  <Stat l="MAX DRAWDOWN" v={`${btResult.maxDD}%`} c={btResult.maxDD > 15 ? T.danger : T.warn} />
                  <Stat l="SHARPE" v={btResult.sharpe} c={btResult.sharpe > 1 ? T.acc : btResult.sharpe > 0.5 ? T.warn : T.danger} s={`PF: ${btResult.profitFactor}`} />
                </div>
                <div className="g2" style={{ marginBottom: 12 }}>
                  <div className="card">
                    <div className="label">EQUITY CURVE</div>
                    <svg viewBox="0 0 400 100" style={{ width: "100%", height: "auto" }}>
                      {(() => {
                        const pts = btResult.equityCurve; if (pts.length < 2) return null;
                        const mn = Math.min(...pts.map(p => p.equity)), mx = Math.max(...pts.map(p => p.equity)), rng = mx - mn || 1;
                        const X = i => (i / (pts.length - 1)) * 400, Y = v => 90 - ((v - mn) / rng) * 80;
                        const path = pts.map((p, i) => `${i ? "L" : "M"}${X(i)},${Y(p.equity)}`).join("");
                        const up = pts[pts.length - 1].equity >= pts[0].equity;
                        return <><path d={`${path} L400,95 L0,95 Z`} fill={up ? "rgba(0,232,123,.1)" : "rgba(255,45,85,.1)"} /><path d={path} fill="none" stroke={up ? T.acc : T.danger} strokeWidth="1.5" /><line x1="0" y1={Y(cfg.portfolio)} x2="400" y2={Y(cfg.portfolio)} stroke="rgba(255,255,255,.06)" strokeWidth="0.5" strokeDasharray="3,3" /><text x="2" y="8" fill={T.t4} fontSize="6">${(mx/1000).toFixed(0)}K</text><text x="2" y="92" fill={T.t4} fontSize="6">${(mn/1000).toFixed(0)}K</text></>;
                      })()}
                    </svg>
                  </div>
                  <div className="card">
                    <div className="label">RETURN PROFILE</div>
                    {[
                      { l: "Avg Win", v: `+${btResult.avgWin}%`, c: T.acc },
                      { l: "Avg Loss", v: `${btResult.avgLoss}%`, c: T.danger },
                      { l: "Profit Factor", v: btResult.profitFactor, c: btResult.profitFactor > 1.5 ? T.acc : T.warn },
                      { l: "Total Trades", v: btResult.totalTrades, c: T.t1 },
                      { l: "Sharpe Ratio", v: btResult.sharpe, c: btResult.sharpe > 1 ? T.acc : T.warn },
                    ].map((r, i) => <div key={i} className="row" style={{ fontSize: 12 }}><span style={{ color: T.t2 }}>{r.l}</span><span style={{ fontWeight: 600, color: r.c }}>{r.v}</span></div>)}
                  </div>
                </div>
                <div className="card">
                  <div className="label">RECENT TRADES (last 20)</div>
                  <div className="scroll-x" style={{ maxHeight: 200, overflow: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead style={{ position: "sticky", top: 0, background: T.s1 }}><tr>{["Day", "Asset", "Entry", "Exit", "Return", "PnL", "Equity"].map(h => <th key={h} style={{ padding: "2px 4px", textAlign: "left", color: T.t3, fontWeight: 700, borderBottom: `1px solid ${T.bd}` }}>{h}</th>)}</tr></thead>
                      <tbody>{btResult.trades.map((t, i) => <tr key={i} style={{ borderBottom: `1px solid ${T.bd}` }}>
                        <td style={{ padding: "2px 4px", color: T.t4 }}>{t.day}</td>
                        <td style={{ padding: "2px 4px", fontWeight: 700, color: T.t1 }}>{t.asset}</td>
                        <td style={{ padding: "2px 4px", color: T.t3 }}>${t.entry}</td>
                        <td style={{ padding: "2px 4px", color: T.t3 }}>${t.exit}</td>
                        <td style={{ padding: "2px 4px", fontWeight: 700, color: t.ret >= 0 ? T.acc : T.danger }}>{t.ret > 0 ? "+" : ""}{t.ret}%</td>
                        <td style={{ padding: "2px 4px", color: t.pnl >= 0 ? T.acc : T.danger }}>${t.pnl.toLocaleString()}</td>
                        <td style={{ padding: "2px 4px", color: T.t2 }}>${t.equity.toLocaleString()}</td>
                      </tr>)}</tbody>
                    </table>
                  </div>
                </div>
              </div>}
            </div>}

            {/* ═══ BROKER INTEGRATION ═══ */}
            {tab === "settings" && settingsTab === "broker" && <div>
              <div className="label" style={{ color: T.acc2, fontSize: 12, marginBottom: 12 }}>🔗 BROKER INTEGRATION — {Object.keys(BROKERS).length} Brokers</div>
              {/* Group by type */}
              {[
                { type: "crypto", label: "Crypto Exchanges", icon: "◈", color: T.acc2 },
                { type: "equities", label: "Stock Brokers", icon: "△", color: T.warn },
                { type: "multi", label: "Multi-Asset", icon: "⚖", color: T.purple },
                { type: "forex", label: "Forex", icon: "⚡", color: T.acc },
              ].map(group => {
                const brokers = Object.entries(BROKERS).filter(([_, b]) => b.type === group.type);
                if (brokers.length === 0) return null;
                return <div key={group.type} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                    <span style={{ fontSize: 12 }}>{group.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: group.color, letterSpacing: 0.5 }}>{group.label}</span>
                    <span style={{ fontSize: 12, color: T.t4 }}>{brokers.length}</span>
                  </div>
                  <div className="g3" style={{ gap: 4 }}>
                    {brokers.map(([key, b]) => (
                      <div key={key} onClick={() => setBroker(prev => ({ ...prev, active: key }))} style={{ padding: "6px 8px", borderRadius: 5, cursor: "pointer", background: broker.active === key ? `${group.color}08` : T.s2, border: `1px solid ${broker.active === key ? `${group.color}30` : T.bd}`, transition: ".15s" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                          <span style={{ fontWeight: 800, fontSize: 12, color: broker.active === key ? group.color : T.t1 }}>{b.name}</span>
                          <div style={{ display: "flex", gap: 3 }}>
                            <Pill c={T.t4} bg="rgba(255,255,255,.04)">{b.region}</Pill>
                            {broker.active === key && broker.connected && <Pill c={T.acc} bg="rgba(0,232,123,.1)">✓</Pill>}
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: T.t4, lineHeight: 1.3 }}>{b.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>;
              })}
              {broker.active && BROKERS[broker.active] && <div className="card" style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div className="label" style={{ marginBottom: 0 }}>{BROKERS[broker.active].name}</div>
                  <span style={{ fontSize: 12, color: T.t4 }}>{BROKERS[broker.active].signup}</span>
                </div>
                {BROKERS[broker.active].fields.map(f => (
                  <div key={f} style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: 12, color: T.t4, marginBottom: 1 }}>{f}</div>
                    <input type={f.includes("ecret") || f.includes("assphrase") ? "password" : "text"} className="ci" placeholder={`Enter ${f}...`} value={broker[f] || ""} onChange={e => setBroker(prev => ({ ...prev, [f]: e.target.value }))} style={{ fontSize: 12 }} />
                  </div>
                ))}
                <div className="tg" onClick={() => setBroker(prev => ({ ...prev, paper: !prev.paper }))}>
                  <div className="tt" style={{ background: broker.paper ? T.warn : T.danger }}><div className="th" style={{ left: broker.paper ? 15 : 2 }} /></div>
                  <span style={{ fontSize: 12, color: broker.paper ? T.warn : T.danger }}>{broker.paper ? "Paper Trading (Safe)" : "⚠ LIVE TRADING"}</span>
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                  <Btn v="purple" onClick={() => { setBroker(prev => ({ ...prev, connected: true })); addLog(`BROKER: Connected to ${BROKERS[broker.active].name} (${broker.paper ? "paper" : "LIVE"})`); }}>Connect</Btn>
                  {broker.connected && <Btn v="ghost" onClick={() => { setBroker(prev => ({ ...prev, connected: false })); addLog("BROKER: Disconnected"); }}>Disconnect</Btn>}
                </div>
              </div>}
              {broker.connected && <div className="card">
                <div className="label" style={{ color: T.acc }}>STATUS</div>
                {[{ l: "Broker", v: BROKERS[broker.active]?.name }, { l: "Region", v: BROKERS[broker.active]?.region }, { l: "Type", v: BROKERS[broker.active]?.type }, { l: "Mode", v: broker.paper ? "PAPER" : "LIVE", c: broker.paper ? T.warn : T.danger }, { l: "API", v: "Connected ✓", c: T.acc }].map((r, i) => <div key={i} className="row" style={{ fontSize: 12 }}><span style={{ color: T.t3 }}>{r.l}</span><span style={{ fontWeight: 600, color: r.c || T.t1 }}>{r.v}</span></div>)}
              </div>}
            </div>}

            {tab === "analysis" && <div>
              {/* Search + Back bar */}
              <div style={{ display: "flex", gap: 6, marginBottom: 10, alignItems: "center" }}>
                {selA && <div onClick={() => setSel(null)} style={{ padding: "4px 10px", borderRadius: 4, cursor: "pointer", background: "rgba(255,255,255,.04)", border: `1px solid ${T.bd}`, fontSize: 12, fontWeight: 700, color: T.t2, display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>← Back</div>}
                <div style={{ flex: 1, position: "relative" }}>
                  <input className="ci" placeholder="Search assets... (ticker, name, sector)" value={mktSearch} onChange={e => setMktSearch(e.target.value)} style={{ fontSize: 12, paddingLeft: 22 }} />
                  <span style={{ position: "absolute", left: 7, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: T.t4 }}>🔍</span>
                </div>
              </div>
              {/* Search results dropdown */}
              {mktSearch.trim() && <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  {(() => {
                    const q = mktSearch.toLowerCase().trim();
                    return all.filter(a => a.id.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.sector.toLowerCase().includes(q))
                      .slice(0, 16).map(a => {
                        const an = anl[a.id];
                        return <div key={a.id} onClick={() => { setSel(a.id); setMktSearch(""); }} style={{ padding: "6px 10px", borderRadius: 4, cursor: "pointer", background: T.s2, border: `1px solid ${T.bd}`, minWidth: 75, transition: ".15s" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 4, alignItems: "center" }}>
                            <span style={{ fontWeight: 800, fontSize: 12 }}>{a.id}</span>
                            {an && <span style={{ fontSize: 12, color: an.dR >= 0 ? T.acc : T.danger }}>{an.dR >= 0 ? "+" : ""}{an.dR}%</span>}
                          </div>
                          <div style={{ fontSize: 12, color: T.t4 }}>{a.name}</div>
                          <div style={{ display: "flex", gap: 3, marginTop: 2 }}>
                            {an && <span style={{ fontSize: 12, color: T.t3 }}>${an.price > 100 ? Math.round(an.price).toLocaleString() : an.price}</span>}
                            <span onClick={e => { e.stopPropagation(); setWatch(w => w.includes(a.id) ? w.filter(x => x !== a.id) : [...w, a.id]); }} style={{ fontSize: 12, color: watch.includes(a.id) ? T.warn : T.t4, cursor: "pointer" }}>{watch.includes(a.id) ? "★" : "☆"}</span>
                          </div>
                        </div>;
                      });
                  })()}
                </div>
                {all.filter(a => { const q = mktSearch.toLowerCase().trim(); return a.id.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.sector.toLowerCase().includes(q); }).length === 0 && <div style={{ fontSize: 12, color: T.t4, padding: 8 }}>No assets match "{mktSearch}"</div>}
              </div>}
              {selA && selH ? <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>{selA.id} <span style={{ fontSize: 12, color: T.t2, fontWeight: 400 }}>{selA.name}</span><span onClick={() => setWatch(w => w.includes(selA.id) ? w.filter(x => x !== selA.id) : [...w, selA.id])} style={{ cursor: "pointer", marginLeft: 6, fontSize: 14, color: watch.includes(selA.id) ? T.warn : T.t4 }}>{watch.includes(selA.id) ? "★" : "☆"}</span></div>
                    <div style={{ fontSize: 24, fontWeight: 700 }}>${selA.price.toLocaleString()} <span style={{ fontSize: 12, color: selA.dR >= 0 ? T.acc : T.danger }}>{selA.dR >= 0 ? "+" : ""}{selA.dR}%</span></div>
                  </div>
                  <div style={{ padding: "5px 14px", borderRadius: 6, background: selA.rec.includes("BUY") ? "rgba(0,232,123,.1)" : selA.rec.includes("SELL") ? "rgba(255,45,85,.1)" : "rgba(245,166,35,.1)", border: `1px solid ${selA.rec.includes("BUY") ? "rgba(0,232,123,.2)" : selA.rec.includes("SELL") ? "rgba(255,45,85,.2)" : "rgba(245,166,35,.2)"}` }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: selA.rec.includes("BUY") ? T.acc : selA.rec.includes("SELL") ? T.danger : T.warn, textAlign: "center" }}>{selA.rec}</div>
                    <div style={{ fontSize: 12, color: T.t2, textAlign: "center" }}>{selA.conf}% conf</div>
                  </div>
                </div>

                <div className="card" style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2, flexWrap: "wrap", gap: 3 }}>
                    <span style={{ fontSize: 12, color: T.t3, fontWeight: 700 }}>PRICE · BB · SMA</span>
                    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
                      {[30, 60, 90, 120].map(tf => <span key={tf} onClick={() => setTimeframe(tf)} style={{ fontSize: 12, padding: "1px 4px", borderRadius: 2, cursor: "pointer", background: timeframe === tf ? "rgba(0,232,123,.08)" : "transparent", color: timeframe === tf ? T.acc : T.t4, fontWeight: 700 }}>{tf}D</span>)}
                      <span style={{ color: T.warn, fontSize: 12 }}>━ 20</span><span style={{ color: T.acc2, fontSize: 12 }}>━ 50</span>
                    </div>
                  </div>
                  <PriceChart data={selH.slice(-timeframe)} w={600} h={75} showBB={true} />
                  <VolBars data={selH} w={600} h={14} />
                </div>

                {/* RSI Chart */}
                <div className="card" style={{ marginBottom: 8, padding: "6px 10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 12, color: T.t3, fontWeight: 700 }}>RSI</span><span style={{ fontSize: 12, fontWeight: 700, color: selA.rsi > 70 ? T.danger : selA.rsi < 30 ? T.acc : T.t1 }}>{selA.rsi}</span></div>
                  <RSIChart data={selH} w={600} h={24} />
                </div>

                <div className="g6" style={{ marginBottom: 8, gap: 3 }}>
                  {[{ l: "1D", v: `${selA.dR > 0 ? "+" : ""}${selA.dR}%`, c: selA.dR >= 0 ? T.acc : T.danger }, { l: "7D", v: `${selA.wR > 0 ? "+" : ""}${selA.wR}%`, c: selA.wR >= 0 ? T.acc : T.danger }, { l: "30D", v: `${selA.mR > 0 ? "+" : ""}${selA.mR}%`, c: selA.mR >= 0 ? T.acc : T.danger }, { l: "VOL", v: `${selA.vol}%`, c: selA.vol > 50 ? T.danger : selA.vol > 30 ? T.warn : T.acc }, { l: "MOM", v: selA.mom, c: selA.mom > 60 ? T.acc : selA.mom < 40 ? T.danger : T.warn }, { l: "ATR", v: `$${selA.atr}`, c: T.t1 }].map((m, i) => <div key={i} className="card-dark" style={{ padding: "3px 4px" }}><div style={{ fontSize: 12, color: T.t4 }}>{m.l}</div><div style={{ fontSize: 12, fontWeight: 700, color: m.c }}>{m.v}</div></div>)}
                </div>

                {/* PATTERN RECOGNITION */}
                {selA.patterns && <div className="g2" style={{ marginBottom: 10 }}>
                  {/* Left: Candlesticks + S/R + Volume */}
                  <div className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span className="label" style={{ marginBottom: 0, color: T.warn }}>PATTERN SCORE</span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: selA.patterns.patScore > 60 ? T.acc : selA.patterns.patScore < 40 ? T.danger : T.warn }}>{selA.patterns.patScore}<span style={{ fontSize: 12, color: T.t4 }}>/100</span></span>
                    </div>
                    {/* Candlestick Patterns */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 12, color: T.t3, fontWeight: 700, letterSpacing: 0.8, marginBottom: 4 }}>CANDLESTICK PATTERNS</div>
                      {selA.patterns.candles.length === 0 ? <div style={{ fontSize: 12, color: T.t4, padding: 4 }}>No patterns detected</div> : selA.patterns.candles.slice(-4).map((c, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0", borderBottom: `1px solid ${T.bd}` }}>
                          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                            <Pill c={c.dir === "bullish" ? T.acc : c.dir === "bearish" ? T.danger : T.warn} bg={c.dir === "bullish" ? "rgba(0,232,123,.1)" : c.dir === "bearish" ? "rgba(255,45,85,.1)" : "rgba(245,166,35,.08)"}>{c.name}</Pill>
                            <span style={{ fontSize: 12, color: T.t4 }}>{c.date}</span>
                          </div>
                          <span style={{ fontSize: 12, color: T.t3 }}>{c.strength}%</span>
                        </div>
                      ))}
                    </div>
                    {/* Support/Resistance */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 12, color: T.t3, fontWeight: 700, letterSpacing: 0.8, marginBottom: 4 }}>SUPPORT / RESISTANCE</div>
                      {selA.patterns.sr.slice(0, 4).map((s, i) => {
                        const dist = +((s.price - selA.price) / selA.price * 100).toFixed(1);
                        return <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: `1px solid ${T.bd}`, fontSize: 12 }}>
                          <span><Pill c={s.type === "S" ? T.acc : T.danger} bg={s.type === "S" ? "rgba(0,232,123,.08)" : "rgba(255,45,85,.08)"}>{s.type === "S" ? "SUP" : "RES"}</Pill> ${s.price.toLocaleString()}</span>
                          <span style={{ color: T.t3 }}>{dist > 0 ? "+" : ""}{dist}% · {s.touches} touches</span>
                        </div>;
                      })}
                    </div>
                    {/* Volume Profile */}
                    <div>
                      <div style={{ fontSize: 12, color: T.t3, fontWeight: 700, letterSpacing: 0.8, marginBottom: 4 }}>VOLUME PROFILE</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12 }}>
                        <span style={{ color: selA.patterns.volProf.climax ? T.danger : T.t3 }}>Climax: {selA.patterns.volProf.climax ? "YES ⚠" : "No"}</span>
                        <span style={{ color: selA.patterns.volProf.divergence !== "none" ? T.warn : T.t3 }}>Divergence: {selA.patterns.volProf.divergence}</span>
                        <span style={{ color: selA.patterns.volProf.accumulation === "accumulating" ? T.acc : selA.patterns.volProf.accumulation === "distributing" ? T.danger : T.t3 }}>Flow: {selA.patterns.volProf.accumulation}</span>
                        <span style={{ color: T.t4 }}>V.Ratio: {selA.patterns.volProf.ratio}x</span>
                      </div>
                    </div>
                  </div>
                  {/* Right: MACD + Fib + Vol Regime + Confluence + Seasonal */}
                  <div className="card">
                    {/* MACD */}
                    {selA.patterns.macd && <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 12, color: T.t3, fontWeight: 700, letterSpacing: 0.8, marginBottom: 4 }}>MACD</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", fontSize: 12 }}>
                        <span style={{ color: selA.patterns.macd.bullish ? T.acc : T.danger }}>Signal: {selA.patterns.macd.bullish ? "BULLISH" : "BEARISH"}</span>
                        <span style={{ color: T.t3 }}>Hist: {selA.patterns.macd.histogram}</span>
                        {selA.patterns.macd.crossUp && <Pill c={T.acc} bg="rgba(0,232,123,.12)">CROSS UP ↑</Pill>}
                        {selA.patterns.macd.crossDn && <Pill c={T.danger} bg="rgba(255,45,85,.12)">CROSS DN ↓</Pill>}
                      </div>
                    </div>}
                    {/* Fibonacci */}
                    {selA.patterns.fib && <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 12, color: T.t3, fontWeight: 700, letterSpacing: 0.8, marginBottom: 4 }}>FIBONACCI RETRACEMENT</div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", fontSize: 12 }}>
                        {selA.patterns.fib.levels.map((l, i) => {
                          const isNearest = Math.abs(l.price - selA.price) < Math.abs(selA.patterns.fib.nearest.price - selA.price) * 1.5;
                          return <span key={i} style={{ padding: "2px 5px", borderRadius: 3, background: isNearest ? "rgba(123,97,255,.12)" : "rgba(255,255,255,.03)", color: isNearest ? T.purple : T.t4, fontWeight: isNearest ? 700 : 400 }}>{l.label} ${l.price.toLocaleString()}</span>;
                        })}
                      </div>
                      <div style={{ fontSize: 12, color: T.purple, marginTop: 3 }}>Nearest: {selA.patterns.fib.nearest.label} · Retraced: {selA.patterns.fib.currentPct}%</div>
                    </div>}
                    {/* Volatility Regime */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 12, color: T.t3, fontWeight: 700, letterSpacing: 0.8, marginBottom: 4 }}>VOLATILITY REGIME</div>
                      <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
                        <Pill c={selA.patterns.volReg.regime === "high" ? T.danger : selA.patterns.volReg.regime === "medium" ? T.warn : T.acc} bg={selA.patterns.volReg.regime === "high" ? "rgba(255,45,85,.1)" : selA.patterns.volReg.regime === "medium" ? "rgba(245,166,35,.08)" : "rgba(0,232,123,.08)"}>{selA.patterns.volReg.regime.toUpperCase()}</Pill>
                        <Pill c={selA.patterns.volReg.transition === "expanding" ? T.danger : selA.patterns.volReg.transition === "compressing" ? T.acc2 : T.t3}>{selA.patterns.volReg.transition}</Pill>
                        <span style={{ color: T.t4 }}>20d:{selA.patterns.volReg.vol20}% 40d:{selA.patterns.volReg.vol40}%</span>
                      </div>
                    </div>
                    {/* Momentum Confluence */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 12, color: T.t3, fontWeight: 700, letterSpacing: 0.8, marginBottom: 4 }}>MOMENTUM CONFLUENCE</div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: selA.patterns.confluence.bias.includes("BULL") ? T.acc : selA.patterns.confluence.bias.includes("BEAR") ? T.danger : T.warn }}>{selA.patterns.confluence.bias}</span>
                        <span style={{ fontSize: 12, color: T.t3 }}>{selA.patterns.confluence.bullish} bull / {selA.patterns.confluence.bearish} bear of {selA.patterns.confluence.total} indicators</span>
                      </div>
                      <div style={{ display: "flex", gap: 2, marginTop: 4 }}>
                        {Array.from({ length: selA.patterns.confluence.total }).map((_, i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < selA.patterns.confluence.bullish ? T.acc : i < selA.patterns.confluence.bullish + (selA.patterns.confluence.total - selA.patterns.confluence.bullish - selA.patterns.confluence.bearish) ? T.warn : T.danger, opacity: 0.6 }} />)}
                      </div>
                    </div>
                    {/* Seasonal */}
                    {selA.patterns.season && <div>
                      <div style={{ fontSize: 12, color: T.t3, fontWeight: 700, letterSpacing: 0.8, marginBottom: 4 }}>SEASONAL ({selA.patterns.season.month})</div>
                      <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
                        <span style={{ color: selA.patterns.season.cryptoBias > 0 ? T.acc : T.danger }}>Crypto: {selA.patterns.season.cryptoBias > 0 ? "+" : ""}{selA.patterns.season.cryptoBias}%</span>
                        <span style={{ color: selA.patterns.season.equityBias > 0 ? T.acc : T.danger }}>Equity: {selA.patterns.season.equityBias > 0 ? "+" : ""}{selA.patterns.season.equityBias}%</span>
                        <span style={{ color: selA.patterns.season.commodBias > 0 ? T.acc : T.danger }}>Commod: {selA.patterns.season.commodBias > 0 ? "+" : ""}{selA.patterns.season.commodBias}%</span>
                      </div>
                    </div>}
                  </div>
                </div>}

                {/* ADVANCED PREDICTION SIGNALS */}
                {selA.patterns && <div className="g2" style={{ marginBottom: 10 }}>
                  <div className="card">
                    {/* Order Flow */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 12, color: T.t3, fontWeight: 700, letterSpacing: 0.8, marginBottom: 4 }}>ORDER FLOW & LIQUIDITY</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", fontSize: 12 }}>
                        <Pill c={selA.patterns.oFlow.bidAsk === "bid_heavy" ? T.acc : selA.patterns.oFlow.bidAsk === "ask_heavy" ? T.danger : T.t3} bg={selA.patterns.oFlow.bidAsk === "bid_heavy" ? "rgba(0,232,123,.1)" : selA.patterns.oFlow.bidAsk === "ask_heavy" ? "rgba(255,45,85,.1)" : "rgba(255,255,255,.04)"}>{selA.patterns.oFlow.bidAsk.replace("_", " ")}</Pill>
                        {selA.patterns.oFlow.liquidityThin && <Pill c={T.warn} bg="rgba(245,166,35,.1)">THIN LIQUIDITY</Pill>}
                        {selA.patterns.oFlow.whaleWall && <Pill c={T.purple} bg="rgba(123,97,255,.1)">WHALE {selA.patterns.oFlow.whaleWall.type} @${selA.patterns.oFlow.whaleWall.price.toLocaleString()} ({selA.patterns.oFlow.whaleWall.strength}x)</Pill>}
                        <span style={{ color: T.t4 }}>Pressure: {selA.patterns.oFlow.pressure}/100</span>
                      </div>
                    </div>
                    {/* On-Chain */}
                    {selA.patterns.onChain && <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 12, color: T.t3, fontWeight: 700, letterSpacing: 0.8, marginBottom: 4 }}>ON-CHAIN SIGNALS</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", fontSize: 12 }}>
                        <Pill c={selA.patterns.onChain.exchangeFlow === "outflow" ? T.acc : T.danger} bg={selA.patterns.onChain.exchangeFlow === "outflow" ? "rgba(0,232,123,.1)" : "rgba(255,45,85,.1)"}>{selA.patterns.onChain.exchangeFlow}</Pill>
                        {selA.patterns.onChain.whaleAccum && <Pill c={T.acc} bg="rgba(0,232,123,.1)">WHALE ACCUM</Pill>}
                        <span style={{ color: T.t3 }}>Addr: {selA.patterns.onChain.activeAddrTrend}</span>
                        <span style={{ color: selA.patterns.onChain.overheated ? T.danger : T.t3 }}>MVRV: {selA.patterns.onChain.mvrv}{selA.patterns.onChain.overheated ? " ⚠" : ""}</span>
                        <Pill c={selA.patterns.onChain.signal === "bullish" ? T.acc : selA.patterns.onChain.signal === "bearish" ? T.danger : T.t3}>{selA.patterns.onChain.signal}</Pill>
                      </div>
                    </div>}
                    {/* Funding Rate */}
                    {selA.patterns.funding && <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 12, color: T.t3, fontWeight: 700, letterSpacing: 0.8, marginBottom: 4 }}>FUNDING & OPEN INTEREST</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", fontSize: 12 }}>
                        <span style={{ color: selA.patterns.funding.rate > 0.03 ? T.danger : selA.patterns.funding.rate < -0.02 ? T.acc : T.t3 }}>Rate: {(selA.patterns.funding.rate * 100).toFixed(2)}%</span>
                        <span style={{ color: T.t3 }}>OI Δ: {selA.patterns.funding.oiChange > 0 ? "+" : ""}{selA.patterns.funding.oiChange}%</span>
                        <span style={{ color: T.t4 }}>L/S: {selA.patterns.funding.longShortRatio}</span>
                        {selA.patterns.funding.squeezRisk !== "none" && <Pill c={T.warn} bg="rgba(245,166,35,.12)">{selA.patterns.funding.squeezRisk.replace("_", " ").toUpperCase()}</Pill>}
                      </div>
                    </div>}
                    {/* Mean Reversion */}
                    {selA.patterns.meanRev && <div>
                      <div style={{ fontSize: 12, color: T.t3, fontWeight: 700, letterSpacing: 0.8, marginBottom: 4 }}>MEAN REVERSION</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", fontSize: 12 }}>
                        <span style={{ color: Math.abs(selA.patterns.meanRev.zScore) > 2 ? T.danger : T.t3 }}>Z-Score: {selA.patterns.meanRev.zScore}</span>
                        <span style={{ color: T.t4 }}>Dev: {selA.patterns.meanRev.devFromSMA50 > 0 ? "+" : ""}{selA.patterns.meanRev.devFromSMA50}%</span>
                        <Pill c={selA.patterns.meanRev.signal === "oversold" ? T.acc : selA.patterns.meanRev.signal === "overbought" ? T.danger : T.t3}>{selA.patterns.meanRev.signal}</Pill>
                        {Math.abs(selA.patterns.meanRev.zScore) > 1.5 && <span style={{ color: T.acc2, fontSize: 12 }}>Revert → ${selA.patterns.meanRev.reversionTarget} ({selA.patterns.meanRev.reversionPct > 0 ? "+" : ""}{selA.patterns.meanRev.reversionPct}%)</span>}
                      </div>
                    </div>}
                  </div>
                  <div className="card">
                    {/* Multi-Timeframe */}
                    {selA.patterns.mtf && <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 12, color: T.t3, fontWeight: 700, letterSpacing: 0.8, marginBottom: 4 }}>MULTI-TIMEFRAME ALIGNMENT</div>
                      <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 4 }}>
                        {[{ l: "Daily", v: selA.patterns.mtf.daily }, { l: "Weekly", v: selA.patterns.mtf.weekly }, { l: "Monthly", v: selA.patterns.mtf.monthly }].map((tf, i) => (
                          <div key={i} style={{ flex: 1, textAlign: "center", padding: "4px 2px", borderRadius: 4, background: tf.v === "BULL" ? "rgba(0,232,123,.08)" : "rgba(255,45,85,.08)", border: `1px solid ${tf.v === "BULL" ? "rgba(0,232,123,.15)" : "rgba(255,45,85,.15)"}` }}>
                            <div style={{ fontSize: 12, color: T.t4 }}>{tf.l}</div>
                            <div style={{ fontSize: 12, fontWeight: 800, color: tf.v === "BULL" ? T.acc : T.danger }}>{tf.v}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: selA.patterns.mtf.aligned ? (selA.patterns.mtf.direction === "BULL" ? T.acc : T.danger) : T.warn }}>{selA.patterns.mtf.aligned ? `✓ ALL ALIGNED ${selA.patterns.mtf.direction}` : "✗ CONFLICTING TIMEFRAMES"}</div>
                    </div>}
                    {/* Relative Strength */}
                    {selA.patterns.relStr && <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 12, color: T.t3, fontWeight: 700, letterSpacing: 0.8, marginBottom: 4 }}>RELATIVE STRENGTH</div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: selA.patterns.relStr.quartile === 1 ? T.acc : selA.patterns.relStr.quartile === 4 ? T.danger : T.t1 }}>Q{selA.patterns.relStr.quartile}</span>
                        <span style={{ color: T.t3 }}>Rank #{selA.patterns.relStr.rank}/{selA.patterns.relStr.total} · P{selA.patterns.relStr.percentile}</span>
                        <span style={{ color: selA.patterns.relStr.ret20d >= 0 ? T.acc : T.danger }}>20d: {selA.patterns.relStr.ret20d > 0 ? "+" : ""}{selA.patterns.relStr.ret20d}%</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,.04)", marginTop: 4 }}><div style={{ height: 4, borderRadius: 2, background: selA.patterns.relStr.quartile === 1 ? T.acc : selA.patterns.relStr.quartile === 4 ? T.danger : T.warn, width: `${selA.patterns.relStr.percentile}%` }} /></div>
                    </div>}
                    {/* Vol-Adjusted Return */}
                    {selA.patterns.volAdj && <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 12, color: T.t3, fontWeight: 700, letterSpacing: 0.8, marginBottom: 4 }}>VOL-ADJUSTED Z-SCORE</div>
                      <div style={{ display: "flex", gap: 6, fontSize: 12 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: Math.abs(selA.patterns.volAdj.zScore) > 2 ? T.danger : T.t1 }}>{selA.patterns.volAdj.zScore > 0 ? "+" : ""}{selA.patterns.volAdj.zScore}σ</span>
                        <span style={{ color: T.t4 }}>Last: {selA.patterns.volAdj.lastRet > 0 ? "+" : ""}{selA.patterns.volAdj.lastRet}% · Avg: {selA.patterns.volAdj.mean > 0 ? "+" : ""}{selA.patterns.volAdj.mean}%</span>
                        {selA.patterns.volAdj.significant && <Pill c={T.warn} bg="rgba(245,166,35,.1)">UNUSUAL MOVE</Pill>}
                      </div>
                    </div>}
                    {/* Implied vs Realized Vol */}
                    {selA.patterns.volGap && <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 12, color: T.t3, fontWeight: 700, letterSpacing: 0.8, marginBottom: 4 }}>IMPLIED vs REALIZED VOL</div>
                      <div style={{ display: "flex", gap: 6, fontSize: 12 }}>
                        <span style={{ color: T.t3 }}>Impl: {selA.patterns.volGap.implied}%</span>
                        <span style={{ color: T.t3 }}>Real: {selA.patterns.volGap.realized}%</span>
                        <span style={{ fontWeight: 700, color: Math.abs(selA.patterns.volGap.gap) > 10 ? T.warn : T.t3 }}>Gap: {selA.patterns.volGap.gap > 0 ? "+" : ""}{selA.patterns.volGap.gap}%</span>
                        <Pill c={selA.patterns.volGap.signal === "overpriced_vol" ? T.acc : selA.patterns.volGap.signal === "underpriced_vol" ? T.danger : T.t3}>{selA.patterns.volGap.signal.replace("_", " ")}</Pill>
                      </div>
                    </div>}
                    {/* Events Calendar */}
                    {selA.patterns.events?.events.length > 0 && <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 12, color: T.t3, fontWeight: 700, letterSpacing: 0.8, marginBottom: 4 }}>UPCOMING EVENTS</div>
                      {selA.patterns.events.events.map((e, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: `1px solid ${T.bd}`, fontSize: 12 }}>
                          <div style={{ display: "flex", gap: 4, alignItems: "center" }}><Pill c={e.impact === "HIGH" ? T.danger : T.warn} bg={e.impact === "HIGH" ? "rgba(255,45,85,.1)" : "rgba(245,166,35,.08)"}>{e.impact}</Pill><span>{e.event}</span></div>
                          <span style={{ color: T.t4 }}>{e.daysOut === 0 ? "TODAY" : `${e.daysOut}d`}</span>
                        </div>
                      ))}
                    </div>}
                    {/* Sentiment Divergence */}
                    {selA.patterns.sentDiv && <div>
                      <div style={{ fontSize: 12, color: T.t3, fontWeight: 700, letterSpacing: 0.8, marginBottom: 4 }}>SENTIMENT DIVERGENCE</div>
                      <div style={{ display: "flex", gap: 6, fontSize: 12 }}>
                        <span style={{ color: T.t3 }}>Price: {selA.patterns.sentDiv.priceDir}</span>
                        <span style={{ color: T.t3 }}>Sentiment: {selA.patterns.sentDiv.sentDir} ({selA.patterns.sentDiv.avgSent > 0 ? "+" : ""}{selA.patterns.sentDiv.avgSent})</span>
                        {selA.patterns.sentDiv.divergent && <Pill c={selA.patterns.sentDiv.signal === "hidden_bull" ? T.acc : T.danger} bg={selA.patterns.sentDiv.signal === "hidden_bull" ? "rgba(0,232,123,.12)" : "rgba(255,45,85,.12)"}>{selA.patterns.sentDiv.signal.replace("_", " ")}</Pill>}
                        {!selA.patterns.sentDiv.divergent && <Pill c={T.t3}>aligned</Pill>}
                      </div>
                    </div>}
                  </div>
                </div>}

                <div className="g2" style={{ marginBottom: 10 }}>
                  {cfg.dalio && <div className="card">
                    <div className="label" style={{ color: T.warn, marginBottom: 6 }}>DALIO PRINCIPLES RADAR</div>
                    <RadarChart values={{ comp: selA.dalio.comp, sys: selA.dalio.sys, rpr: selA.dalio.rpr, div: selA.dalio.div, ecm: selA.dalio.ecm, prg: selA.dalio.prg, rad: selA.dalio.rad, mom: selA.dalio.mom, ind: selA.dalio.ind }} size={110} />
                  </div>}
                  <div className="card">
                    <div className="label" style={{ color: T.acc, marginBottom: 6 }}>TRADE SETUP</div>
                    {[{ l: "Size", v: `$${selA.posSize.toLocaleString()}` }, { l: "Stop", v: `$${selA.stop} (${selA.stopDist}%)`, c: T.danger }, { l: "Type", v: cfg.useAtr ? `ATR×${cfg.atrMult}` : `Flat ${cfg.stopPct}%` }, { l: "Target", v: `$${selA.tp}`, c: T.acc }, { l: "R:R", v: `1:${cfg.rr}` }, { l: "Trail", v: cfg.trail ? `${cfg.trailPct}%` : "OFF" }].map((r, i) => <div key={i} className="row" style={{ fontSize: 12 }}><span style={{ color: T.t2 }}>{r.l}</span><span style={{ fontWeight: 600, color: r.c || T.t1 }}>{r.v}</span></div>)}
                    {kelly[selA.id] && <div className="row" style={{ fontSize: 12 }}>
                      <span style={{ color: T.purple }}>Kelly Criterion</span>
                      <span style={{ fontWeight: 700, color: T.purple }}>{kelly[selA.id].kellyPct}% <span style={{ fontSize: 12, color: T.t3 }}>(WR:{kelly[selA.id].winRate}% Pay:{kelly[selA.id].payoff})</span></span>
                    </div>}
                    {drawdown.halted && <div style={{ padding: "8px", borderRadius: 6, background: "rgba(255,45,85,.1)", border: "1px solid rgba(255,45,85,.2)", marginTop: 8, fontSize: 12, color: T.danger, textAlign: "center", fontWeight: 700 }}>⚠ CIRCUIT BREAKER ACTIVE — Drawdown {drawdown.ddPct}% exceeds {drawdown.limit}% limit. Trading halted.</div>}
                    {!drawdown.halted && <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                      <Btn onClick={() => exec(selA, "BUY")} full>BUY</Btn>
                      {cfg.shorts && <Btn onClick={() => exec(selA, "SHORT")} v="danger" full>SHORT</Btn>}
                    </div>}
                  </div>
                </div>

                {selA.geoHits.length > 0 && <div className="card" style={{ marginBottom: 10 }}><div className="label" style={{ color: T.warn }}>GEO FACTORS</div>{selA.geoHits.map(g => <div key={g.id} className="row"><div style={{ minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 12 }}>{g.title}</div><div style={{ fontSize: 12, color: T.t4 }}>{g.desc}</div></div><div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}><SevBadge s={g.sev} /><div style={{ fontSize: 12, color: g.dir === "bullish" ? T.acc : T.danger, marginTop: 2, fontWeight: 700 }}>{g.dir.toUpperCase()}</div></div></div>)}</div>}

                {/* ═══ PRICE HISTORY & STATISTICAL ANALYSIS ═══ */}
                {selH && <div className="card" style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div className="label" style={{ color: T.acc2, marginBottom: 0, fontSize: 12 }}>PRICE HISTORY & STATISTICAL ANALYSIS</div>
                    <span style={{ fontSize: 12, color: T.t4 }}>{selH.length} data points</span>
                  </div>

                  {/* Multi-period returns chart */}
                  {(() => {
                    const periods = [7, 14, 30, 60, 90].map(d => {
                      const start = selH[Math.max(selH.length - d - 1, 0)];
                      const end = selH[selH.length - 1];
                      const ret = +((end.close - start.close) / start.close * 100).toFixed(2);
                      const maxP = Math.max(...selH.slice(-d).map(x => x.high));
                      const minP = Math.min(...selH.slice(-d).map(x => x.low));
                      const maxDD = +(((minP - maxP) / maxP) * 100).toFixed(2);
                      const avgVol = +(selH.slice(-d).reduce((s, x) => s + x.volume, 0) / d / 1e6).toFixed(1);
                      return { d, ret, maxDD, maxP: +maxP.toFixed(2), minP: +minP.toFixed(2), avgVol };
                    });
                    return <>
                      {/* Returns bar chart */}
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 12, color: T.t3, fontWeight: 700, letterSpacing: 0.6, marginBottom: 2 }}>PERIOD RETURNS</div>
                        <svg viewBox="0 0 400 22" style={{ width: "100%", height: "auto" }}>
                          {periods.map((p, i) => {
                            const maxAbs = Math.max(...periods.map(x => Math.abs(x.ret)), 1);
                            const bw = 400 / periods.length; const bh = Math.abs(p.ret) / maxAbs * 8;
                            const x = i * bw + bw * 0.2; const w = bw * 0.6;
                            const y = p.ret >= 0 ? 11 - bh : 11;
                            return <g key={i}>
                              <rect x={x} y={y} width={w} height={bh} rx="1" fill={p.ret >= 0 ? T.acc : T.danger} opacity="0.2" />
                              <text x={x + w / 2} y={p.ret >= 0 ? y - 1 : y + bh + 3.5} textAnchor="middle" fill={p.ret >= 0 ? T.acc : T.danger} fontSize="6" fontWeight="700">{p.ret > 0 ? "+" : ""}{p.ret}%</text>
                              <text x={x + w / 2} y="21" textAnchor="middle" fill={T.t4} fontSize="6">{p.d}D</text>
                            </g>;
                          })}
                          <line x1="0" y1="11" x2="400" y2="11" stroke="rgba(255,255,255,.03)" strokeWidth="0.2" />
                        </svg>
                      </div>

                      {/* History data table */}
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 12, color: T.t3, fontWeight: 700, letterSpacing: 0.6, marginBottom: 2 }}>PERIOD STATISTICS</div>
                        <div className="scroll-x">
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                            <thead><tr>
                              {["Period", "Return", "High", "Low", "Max DD", "Avg Vol (M)"].map(h => <th key={h} style={{ padding: "2px 4px", textAlign: "left", color: T.t3, fontWeight: 700, borderBottom: `1px solid ${T.bd}`, whiteSpace: "nowrap" }}>{h}</th>)}
                            </tr></thead>
                            <tbody>{periods.map((p, i) => <tr key={i}>
                              <td style={{ padding: "2px 4px", color: T.t2, fontWeight: 600 }}>{p.d}D</td>
                              <td style={{ padding: "2px 4px", color: p.ret >= 0 ? T.acc : T.danger, fontWeight: 700 }}>{p.ret > 0 ? "+" : ""}{p.ret}%</td>
                              <td style={{ padding: "2px 4px", color: T.t2 }}>${p.maxP.toLocaleString()}</td>
                              <td style={{ padding: "2px 4px", color: T.t2 }}>${p.minP.toLocaleString()}</td>
                              <td style={{ padding: "2px 4px", color: T.danger }}>{p.maxDD}%</td>
                              <td style={{ padding: "2px 4px", color: T.t3 }}>{p.avgVol}M</td>
                            </tr>)}</tbody>
                          </table>
                        </div>
                      </div>
                    </>;
                  })()}

                  {/* Daily price history table (last 20 days) */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, color: T.t3, fontWeight: 700, letterSpacing: 0.6, marginBottom: 2 }}>DAILY PRICE LOG (LAST 20 SESSIONS)</div>
                    <div className="scroll-x" style={{ maxHeight: 220, overflow: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                        <thead style={{ position: "sticky", top: 0, background: T.s1 }}><tr>
                          {["Date", "Open", "High", "Low", "Close", "Chg%", "Vol", "RSI", "SMA20"].map(h => <th key={h} style={{ padding: "2px 4px", textAlign: "left", color: T.t3, fontWeight: 700, borderBottom: `1px solid ${T.bd}`, whiteSpace: "nowrap" }}>{h}</th>)}
                        </tr></thead>
                        <tbody>{selH.slice(-20).reverse().map((d, i) => {
                          const prev = selH[selH.length - 21 + (19 - i)];
                          const chg = prev ? +((d.close - prev.close) / prev.close * 100).toFixed(2) : 0;
                          return <tr key={i} style={{ borderBottom: `1px solid ${T.bd}` }}>
                            <td style={{ padding: "2px 4px", color: T.t2 }}>{d.date.slice(5)}</td>
                            <td style={{ padding: "2px 4px", color: T.t3 }}>{d.open.toLocaleString(undefined, { maximumFractionDigits: d.open > 100 ? 0 : 2 })}</td>
                            <td style={{ padding: "2px 4px", color: T.t3 }}>{d.high.toLocaleString(undefined, { maximumFractionDigits: d.high > 100 ? 0 : 2 })}</td>
                            <td style={{ padding: "2px 4px", color: T.t3 }}>{d.low.toLocaleString(undefined, { maximumFractionDigits: d.low > 100 ? 0 : 2 })}</td>
                            <td style={{ padding: "2px 4px", color: T.t1, fontWeight: 600 }}>{d.close.toLocaleString(undefined, { maximumFractionDigits: d.close > 100 ? 0 : 2 })}</td>
                            <td style={{ padding: "2px 4px", color: chg >= 0 ? T.acc : T.danger, fontWeight: 600 }}>{chg > 0 ? "+" : ""}{chg}%</td>
                            <td style={{ padding: "2px 4px", color: T.t4 }}>{(d.volume / 1e6).toFixed(1)}M</td>
                            <td style={{ padding: "2px 4px", color: d.rsi14 > 70 ? T.danger : d.rsi14 < 30 ? T.acc : T.t3 }}>{d.rsi14 || "—"}</td>
                            <td style={{ padding: "2px 4px", color: T.t4 }}>{d.sma20 ? d.sma20.toLocaleString(undefined, { maximumFractionDigits: d.sma20 > 100 ? 0 : 2 }) : "—"}</td>
                          </tr>;
                        })}</tbody>
                      </table>
                    </div>
                  </div>

                  {/* Historical distribution analysis for prediction */}
                  {(() => {
                    const rets = selH.slice(1).map((d, i) => +((d.close - selH[i].close) / selH[i].close * 100).toFixed(2));
                    const posRets = rets.filter(r => r > 0), negRets = rets.filter(r => r < 0);
                    const avgRet = +(rets.reduce((s, r) => s + r, 0) / rets.length).toFixed(3);
                    const stdDev = +(Math.sqrt(rets.reduce((s, r) => s + (r - avgRet) ** 2, 0) / rets.length)).toFixed(3);
                    const winRate = +(posRets.length / rets.length * 100).toFixed(1);
                    const avgWin = posRets.length ? +(posRets.reduce((s, r) => s + r, 0) / posRets.length).toFixed(2) : 0;
                    const avgLoss = negRets.length ? +(negRets.reduce((s, r) => s + r, 0) / negRets.length).toFixed(2) : 0;
                    const profitFactor = negRets.length && avgLoss !== 0 ? +Math.abs(posRets.reduce((s, r) => s + r, 0) / negRets.reduce((s, r) => s + r, 0)).toFixed(2) : 0;
                    const maxConsWin = (() => { let m = 0, c = 0; rets.forEach(r => { if (r > 0) c++; else { m = Math.max(m, c); c = 0; } }); return Math.max(m, c); })();
                    const maxConsLoss = (() => { let m = 0, c = 0; rets.forEach(r => { if (r < 0) c++; else { m = Math.max(m, c); c = 0; } }); return Math.max(m, c); })();
                    const bestDay = Math.max(...rets), worstDay = Math.min(...rets);
                    // Histogram bins
                    const bins = [-4, -3, -2, -1, 0, 1, 2, 3, 4].map(b => ({ bin: b, count: rets.filter(r => r >= b && r < b + 1).length }));
                    const maxBin = Math.max(...bins.map(b => b.count));
                    // Forward projection based on historical stats
                    const proj7d = +(avgRet * 7).toFixed(2);
                    const proj30d = +(avgRet * 30).toFixed(2);
                    const proj7dBull = +(avgWin * winRate / 100 * 7 + avgLoss * (100 - winRate) / 100 * 7).toFixed(2);

                    return <>
                      <div style={{ fontSize: 12, color: T.t3, fontWeight: 700, letterSpacing: 0.6, marginBottom: 2 }}>RETURN DISTRIBUTION</div>

                      {/* Distribution histogram */}
                      <svg viewBox="0 0 400 20" style={{ width: "100%", height: "auto", marginBottom: 3 }}>
                        {bins.map((b, i) => {
                          const bw = 400 / bins.length; const bh = maxBin > 0 ? (b.count / maxBin) * 14 : 0;
                          const x = i * bw + 2; const w = bw - 4;
                          return <g key={i}>
                            <rect x={x} y={17 - bh} width={w} height={bh} rx="1" fill={b.bin >= 0 ? T.acc : T.danger} opacity="0.15" />
                            <text x={x + w / 2} y={17 - bh - 1} textAnchor="middle" fill={T.t4} fontSize="6">{b.count}</text>
                            <text x={x + w / 2} y="20" textAnchor="middle" fill={T.t4} fontSize="6">{b.bin > 0 ? "+" : ""}{b.bin}%</text>
                          </g>;
                        })}
                      </svg>

                      {/* Stats grid */}
                      <div className="g3" style={{ gap: 2, marginBottom: 4 }}>
                        {[
                          { l: "Win Rate", v: `${winRate}%`, c: winRate > 55 ? T.acc : winRate < 45 ? T.danger : T.warn },
                          { l: "Avg Daily", v: `${avgRet > 0 ? "+" : ""}${avgRet}%`, c: avgRet > 0 ? T.acc : T.danger },
                          { l: "Std Dev", v: `${stdDev}%`, c: T.t1 },
                          { l: "Avg Win", v: `+${avgWin}%`, c: T.acc },
                          { l: "Avg Loss", v: `${avgLoss}%`, c: T.danger },
                          { l: "PF", v: profitFactor, c: profitFactor > 1.5 ? T.acc : profitFactor > 1 ? T.warn : T.danger },
                          { l: "Best", v: `+${bestDay}%`, c: T.acc },
                          { l: "Worst", v: `${worstDay}%`, c: T.danger },
                          { l: "Streak", v: `${maxConsWin}W/${maxConsLoss}L`, c: T.t2 },
                        ].map((s, i) => <div key={i} style={{ background: T.s2, borderRadius: 2, padding: "2px 3px", border: `1px solid ${T.bd}` }}>
                          <div style={{ fontSize: 12, color: T.t4 }}>{s.l}</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: s.c }}>{s.v}</div>
                        </div>)}
                      </div>

                      {/* Historical projection */}
                      <div style={{ padding: "4px 6px", borderRadius: 4, background: "rgba(0,201,255,.03)", border: `1px solid rgba(0,201,255,.08)` }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: T.acc2, letterSpacing: 0.6, marginBottom: 2 }}>PROJECTION ({rets.length}d)</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12 }}>
                          <div><span style={{ color: T.t3 }}>7D avg path: </span><span style={{ fontWeight: 700, color: proj7d >= 0 ? T.acc : T.danger }}>{proj7d > 0 ? "+" : ""}{proj7d}%</span></div>
                          <div><span style={{ color: T.t3 }}>30D avg path: </span><span style={{ fontWeight: 700, color: proj30d >= 0 ? T.acc : T.danger }}>{proj30d > 0 ? "+" : ""}{proj30d}%</span></div>
                          <div><span style={{ color: T.t3 }}>7D EV (w/l weighted): </span><span style={{ fontWeight: 700, color: proj7dBull >= 0 ? T.acc : T.danger }}>{proj7dBull > 0 ? "+" : ""}{proj7dBull}%</span></div>
                          <div><span style={{ color: T.t3 }}>1σ range (daily): </span><span style={{ color: T.t2 }}>{(avgRet - stdDev).toFixed(2)}% to +{(+avgRet + +stdDev).toFixed(2)}%</span></div>
                          <div><span style={{ color: T.t3 }}>2σ range: </span><span style={{ color: T.t2 }}>{(avgRet - stdDev * 2).toFixed(2)}% to +{(+avgRet + stdDev * 2).toFixed(2)}%</span></div>
                        </div>
                      </div>
                    </>;
                  })()}
                </div>}

                <div className="card"><div className="label" style={{ color: T.purple }}>AI JSON</div><pre className="pre">{JSON.stringify({ asset: selA.id, price: selA.price, returns: { d: selA.dR, w: selA.wR, m: selA.mR }, vol: selA.vol, rsi: selA.rsi, trend: selA.trend, rec: selA.rec, conf: selA.conf, dalio: selA.dalio, trade: { size: selA.posSize, stop: selA.stop, tp: selA.tp, rr: cfg.rr }, geo: selA.geoHits.map(g => ({ e: g.title, sev: g.sev, dir: g.dir })), bt: selA.bt, short: selA.short }, null, 2)}</pre></div>
              </div> : <div>
                <div style={{ textAlign: "center", padding: "16px 0", color: T.t3, marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Select an asset to analyze</div>
                  <div style={{ fontSize: 12, color: T.t4 }}>Pick from your watchlist or browse all assets below</div>
                </div>
                {watch.length > 0 && <div style={{ marginBottom: 12 }}>
                  <div className="label" style={{ color: T.warn }}>WATCHLIST</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {watch.map(id => { const a = anl[id]; return a ? <div key={id} onClick={() => setSel(id)} style={{ padding: "6px 10px", borderRadius: 5, cursor: "pointer", background: T.s2, border: `1px solid ${T.bd}`, minWidth: 80 }}>
                      <div style={{ fontWeight: 800, fontSize: 12 }}>{id}</div>
                      <div style={{ fontSize: 12, color: T.t3 }}>${a.price.toLocaleString()} <span style={{ color: a.dR >= 0 ? T.acc : T.danger }}>{a.dR >= 0 ? "+" : ""}{a.dR}%</span></div>
                    </div> : null; })}
                  </div>
                </div>}
                <div className="label" style={{ color: T.acc2 }}>TOP SIGNALS</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {Object.values(anl).filter(a => a.rec !== "HOLD").sort((a, b) => b.conf - a.conf).slice(0, 12).map(a => (
                    <div key={a.id} onClick={() => setSel(a.id)} style={{ padding: "6px 10px", borderRadius: 5, cursor: "pointer", background: a.rec.includes("BUY") ? "rgba(0,232,123,.04)" : "rgba(255,45,85,.04)", border: `1px solid ${a.rec.includes("BUY") ? "rgba(0,232,123,.1)" : "rgba(255,45,85,.1)"}`, minWidth: 80 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}><span style={{ fontWeight: 800, fontSize: 12 }}>{a.id}</span><RecPill r={a.rec} /></div>
                      <div style={{ fontSize: 12, color: T.t3 }}>${a.price.toLocaleString()} · {a.conf}%</div>
                    </div>
                  ))}
                </div>
              </div>}
            </div>}

            {tab === "debt" && <div>
              {(() => { const D = DEBT_DATA[debtCountry]; return <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: T.purple }}>⚡ ECONOMIC MACHINE</div>
                <div style={{ display: "flex", gap: 2 }}>
                  {Object.entries(DEBT_DATA).map(([k, v]) => (
                    <div key={k} onClick={() => setDebtCountry(k)} style={{ padding: "2px 6px", borderRadius: 3, fontSize: 11, fontWeight: 700, cursor: "pointer", background: debtCountry === k ? "rgba(123,97,255,.12)" : "rgba(255,255,255,.03)", color: debtCountry === k ? T.purple : T.t4, border: `1px solid ${debtCountry === k ? "rgba(123,97,255,.25)" : T.bd}` }}>{k}</div>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 12, color: T.t3, marginBottom: 8 }}>{D.name} · {D.currency}</div>
              <div className="g2" style={{ marginBottom: 8, gap: 6 }}>
                <div className="card" style={{ textAlign: "center", padding: "6px" }}>
                  <div style={{ fontSize: 12, color: T.t4 }}>CYCLE</div>
                  <CycleGauge pos={D.pos} size={100} />
                  <div style={{ fontSize: 12, fontWeight: 800, color: T.warn }}>{D.phase}</div>
                </div>
                <div>
                  <div className="g2" style={{ marginBottom: 6, gap: 3 }}>
                    {[{ l: "RATE", v: `${D.fedFunds}%`, c: T.danger }, { l: "2Y10Y", v: `${D.spread2y10y}%`, c: D.spread2y10y < 0 ? T.danger : T.acc }, { l: "HY", v: `${D.hySpread}%`, c: T.warn }, { l: "D/GDP", v: `${D.debtGdp}%`, c: D.debtGdp > 100 ? T.danger : T.warn }].map((s, i) => <div key={i} style={{ background: T.s2, borderRadius: 3, padding: "3px 5px", border: `1px solid ${T.bd}`, textAlign: "center" }}><div style={{ fontSize: 12, color: T.t4 }}>{s.l}</div><div style={{ fontSize: 12, fontWeight: 700, color: s.c }}>{s.v}</div></div>)}
                  </div>
                  <div style={{ padding: "4px 6px", background: T.s2, borderRadius: 3, border: `1px solid ${T.bd}` }}><div style={{ fontSize: 12, color: T.t4 }}>LONG-TERM</div><div style={{ fontSize: 12, fontWeight: 800, color: T.danger }}>{D.longPhase}</div></div>
                </div>
              </div>
              <div className="card" style={{ marginBottom: 8, padding: "4px 6px" }}>{D.indicators.map((ind, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2px 0", borderBottom: i < D.indicators.length - 1 ? `1px solid ${T.bd}` : "none", fontSize: 12 }}><div><span style={{ fontWeight: 600 }}>{ind.name}</span> <span style={{ color: T.acc2 }}>{ind.value}</span> <span style={{ fontSize: 12, color: T.t4 }}>{ind.detail}</span></div><Pill c={ind.sig === "WARN" || ind.sig === "TIGHT" || ind.sig === "CRITICAL" ? T.danger : ind.sig === "CAUTION" || ind.sig === "ELEVATED" ? T.warn : ind.sig === "LOOSE" ? T.acc : T.t2} bg={ind.sig === "WARN" || ind.sig === "TIGHT" || ind.sig === "CRITICAL" ? "rgba(255,45,85,.08)" : ind.sig === "CAUTION" || ind.sig === "ELEVATED" ? "rgba(245,166,35,.08)" : "rgba(255,255,255,.03)"}>{ind.sig}</Pill></div>)}</div>

              {/* Scenario simulator inline */}
              <div className="card" style={{ marginBottom: 8, padding: "4px 6px" }}>
                <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.purple }}>SCENARIO</span>
                  <select value={scenAsset} onChange={e => { setScenAsset(e.target.value); setSel(e.target.value); }} style={{ fontSize: 12, padding: "1px 3px" }}><option value="">Asset</option>{all.map(a => <option key={a.id} value={a.id}>{a.id}</option>)}</select>
                  {[-20, -10, -5, 5, 10, 25].map(p => <span key={p} onClick={() => scenAsset && runScen(scenAsset, p)} style={{ padding: "1px 5px", borderRadius: 2, fontSize: 11, fontWeight: 700, cursor: "pointer", background: p > 0 ? "rgba(0,232,123,.06)" : "rgba(255,45,85,.06)", color: p > 0 ? T.acc : T.danger, border: `1px solid ${p > 0 ? "rgba(0,232,123,.1)" : "rgba(255,45,85,.1)"}` }}>{p > 0 ? "+" : ""}{p}%</span>)}
                </div>
                {scenario && <div style={{ marginTop: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: scenario.pi >= 0 ? T.acc : T.danger, marginBottom: 3 }}>Portfolio: {scenario.pi >= 0 ? "+" : ""}${scenario.pi.toLocaleString()}</div>
                  <HBarChart items={scenario.imp.map(x => ({ label: x.id, v: x.pct }))} w={300} barH={8} />
                </div>}
              </div>

              {/* Quadrants compact */}
              <div className="card" style={{ marginBottom: 8, padding: "4px 6px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.warn, marginBottom: 4 }}>4 QUADRANTS</div>
                <div className="g2" style={{ gap: 3 }}>
                  {Object.entries(QUADRANTS).map(([k, q]) => (
                    <div key={k} style={{ padding: "4px 6px", borderRadius: 4, border: `1px solid ${q.color}15`, background: `${q.color}05` }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: q.color }}>{q.name}</div>
                      <div style={{ fontSize: 12, color: T.t3, marginBottom: 3 }}>{q.bestFor}</div>
                      <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>{q.assets.slice(0, 5).map(id => <span key={id} style={{ fontSize: 12, color: q.color, opacity: 0.7 }}>{id}</span>)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* All Weather compact */}
              <div className="card" style={{ marginBottom: 8, padding: "4px 6px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.acc2, marginBottom: 4 }}>ALL WEATHER</div>
                <div style={{ display: "flex", gap: 3 }}>
                  {Object.values(ALL_WEATHER).map((aw, i) => (
                    <div key={i} style={{ flex: 1, padding: "3px", borderRadius: 3, border: `1px solid ${aw.color}15`, background: `${aw.color}05`, textAlign: "center" }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: aw.color }}>{aw.pct}%</div>
                      <div style={{ fontSize: 12, color: T.t3 }}>{aw.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules compact */}
              <div className="card" style={{ padding: "4px 6px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.acc, marginBottom: 3 }}>3 RULES</div>
                {THREE_RULES.map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 4, alignItems: "center", padding: "2px 0", borderBottom: i < 2 ? `1px solid ${T.bd}` : "none" }}>
                    <span style={{ fontSize: 12 }}>{r.icon}</span>
                    <div><span style={{ fontSize: 12, fontWeight: 700, color: T.acc }}>{r.rule}</span> <span style={{ fontSize: 12, color: T.t4 }}>{r.desc}</span></div>
                  </div>
                ))}
              </div>
              </>; })()}
            </div>}

            {tab === "corr" && <div>
              <div className="label" style={{ color: T.acc2, fontSize: 12, marginBottom: 12 }}>◫ CORRELATION HEATMAP</div>
              <div className="card scroll-x"><CorrHeatmap matrix={corr} ids={all.map(a => a.id)} maxCorr={cfg.maxCorr} /></div>
              <div style={{ marginTop: 8, fontSize: 12, color: T.t3 }}>Bordered cells exceed max correlation ({cfg.maxCorr}).</div>
            </div>}

            {tab === "geo" && <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div className="label" style={{ color: T.warn, fontSize: 12, marginBottom: 0 }}>⚑ GEOPOLITICAL & CONFLICT INTELLIGENCE</div>
                <span style={{ fontSize: 12, color: T.t4 }}>{GEO.length} events · {conflictData.feeds.length} intel reports</span>
              </div>

              {/* ═══ INTERACTIVE WORLD MAP ═══ */}
              <div style={{ marginBottom: 8, padding: "2px", borderRadius: 4, overflow: "hidden", background: "rgba(3,6,12,.9)", border: `1px solid ${T.bd}` }}>
                {(() => {
                  const regionMap2 = { "Middle East": "me", "Asia-Pacific": "ea", "E. Europe": "eu", "Europe": "eu", "Africa": "af", "Americas": "na", "Global": "me", "US": "na", "Arctic": "ar", "Australia": "oc" };
                  const regionNames = { na: "Americas", eu: "Europe", af: "Africa", me: "Middle East", ca: "C.Asia", sa: "S.Asia", ea: "E.Asia", sea: "SE.Asia", oc: "Oceania" };
                  const rCounts = {};
                  GEO.forEach(g => { const r = regionMap2[g.region] || "me"; rCounts[r] = (rCounts[r] || 0) + (g.sev === "CRITICAL" ? 3 : g.sev === "HIGH" ? 2 : 1); });
                  conflictData.feeds.forEach(f => { const r = regionMap2[f.region] || "me"; rCounts[r] = (rCounts[r] || 0) + 1; });
                  const maxC = Math.max(...Object.values(rCounts), 1);
                  const pins = [
                    { lon: 43, lat: 14, sev: "CRITICAL" }, { lon: 121, lat: 24, sev: "CRITICAL" },
                    { lon: 35, lat: 48, sev: "HIGH" }, { lon: 52, lat: 32, sev: "HIGH" },
                    { lon: 30, lat: 15, sev: "HIGH" }, { lon: 115, lat: 10, sev: "HIGH" },
                    { lon: 96, lat: 20, sev: "HIGH" }, { lon: -2, lat: 15, sev: "MEDIUM" },
                    { lon: -80, lat: 9, sev: "MEDIUM" }, { lon: 50, lat: 72, sev: "MEDIUM" },
                  ].map(p => ({ ...p, x: +((p.lon + 180) / 360 * 960).toFixed(1), y: +((90 - p.lat) / 180 * 500).toFixed(1) }));
                  return <>
                    <svg viewBox="30 40 900 380" style={{ width: "100%", height: "auto" }}>
                      <rect x="30" y="40" width="900" height="380" fill="rgba(3,8,18,.6)" />
                      {/* Fine grid */}
                      {[80,120,160,200,240,280,320,360,400].map(y => <line key={`h${y}`} x1="30" y1={y} x2="930" y2={y} stroke="rgba(255,255,255,.01)" strokeWidth="0.3" />)}
                      {[80,160,240,320,400,480,560,640,720,800,880].map(x => <line key={`v${x}`} x1={x} y1="40" x2={x} y2="420" stroke="rgba(255,255,255,.01)" strokeWidth="0.3" />)}
                      {/* Equator + tropics */}
                      <line x1="30" y1="250" x2="930" y2="250" stroke="rgba(255,255,255,.025)" strokeWidth="0.2" strokeDasharray="3,3" />
                      <line x1="30" y1="185" x2="930" y2="185" stroke="rgba(255,255,255,.012)" strokeWidth="0.15" strokeDasharray="1.5,3" />
                      <line x1="30" y1="315" x2="930" y2="315" stroke="rgba(255,255,255,.012)" strokeWidth="0.15" strokeDasharray="1.5,3" />
                      {/* Countries */}
                      {WORLD.map((c, i) => {
                        const heat = (rCounts[c.r] || 0) / maxC;
                        const isSel = conflictData.geoFilter === c.r;
                        const fill = isSel ? "rgba(0,201,255,.15)" : heat > 0.6 ? `rgba(255,45,85,${0.04 + heat * 0.1})` : heat > 0.3 ? `rgba(245,166,35,${0.03 + heat * 0.06})` : "rgba(255,255,255,.025)";
                        const stroke = isSel ? "rgba(0,201,255,.4)" : heat > 0.5 ? "rgba(255,45,85,.15)" : "rgba(255,255,255,.045)";
                        return <path key={i} d={c.d} fill={fill} stroke={stroke} strokeWidth={isSel ? "0.8" : "0.25"} style={{ cursor: "pointer" }}
                          onClick={() => setConflictData(p => ({ ...p, geoFilter: p.geoFilter === c.r ? "all" : c.r }))} />;
                      })}
                      {/* Country labels - tiny */}
                      {CLABELS.map(l => {
                        const cData = WORLD.find(w => w.c === l.c);
                        const heat = cData ? (rCounts[cData.r] || 0) / maxC : 0;
                        const isSel = cData && conflictData.geoFilter === cData.r;
                        return <text key={`lbl${l.c}`} x={l.x} y={l.y} textAnchor="middle" dominantBaseline="middle" fill={isSel ? "rgba(0,201,255,.5)" : heat > 0.5 ? "rgba(255,200,200,.22)" : "rgba(255,255,255,.12)"} fontSize="5.5" fontWeight="400" style={{ pointerEvents: "none" }}>{l.n}</text>;
                      })}
                      {/* Conflict pins - minimal */}
                      {pins.map((p, i) => <g key={`pin${i}`}>
                        {p.sev === "CRITICAL" && <circle cx={p.x} cy={p.y} r="6" fill="none" stroke={T.danger} strokeWidth="0.2" opacity="0.2"><animate attributeName="r" values="3;8;3" dur="3s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.25;0;0.25" dur="3s" repeatCount="indefinite" /></circle>}
                        <circle cx={p.x} cy={p.y} r={p.sev === "CRITICAL" ? "2.5" : "1.8"} fill={p.sev === "CRITICAL" ? T.danger : p.sev === "HIGH" ? T.warn : T.t3} opacity="0.4" />
                        <circle cx={p.x} cy={p.y} r={p.sev === "CRITICAL" ? "1" : "0.7"} fill={p.sev === "CRITICAL" ? T.danger : p.sev === "HIGH" ? T.warn : T.t3} opacity="0.8" />
                      </g>)}
                      {/* Coordinate labels */}
                      <text x="32" y="253" fill="rgba(255,255,255,.06)" fontSize="6">0°</text>
                      <text x="32" y="188" fill="rgba(255,255,255,.04)" fontSize="6">23.4°N</text>
                      <text x="32" y="318" fill="rgba(255,255,255,.04)" fontSize="6">23.4°S</text>
                    </svg>
                    {conflictData.geoFilter !== "all" && !GEO_CATS.find(c => c.k === conflictData.geoFilter) && <div style={{ fontSize: 12, color: T.acc2, fontWeight: 600, marginTop: 2, padding: "2px 6px", background: "rgba(0,201,255,.04)", borderRadius: 3, display: "inline-block" }}>
                      {regionNames[conflictData.geoFilter] || conflictData.geoFilter} <span onClick={() => setConflictData(p => ({ ...p, geoFilter: "all" }))} style={{ cursor: "pointer", color: T.t4, marginLeft: 4 }}>✕</span>
                    </div>}
                  </>;
                })()}
              </div>

              {/* Category filters */}
              <div style={{ display: "flex", gap: 3, marginBottom: 10, flexWrap: "wrap" }}>
                {GEO_CATS.map(c => (
                  <div key={c.k} onClick={() => setConflictData(p => ({ ...p, geoFilter: c.k }))} style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: "pointer", background: conflictData.geoFilter === c.k ? `${c.c}15` : "rgba(255,255,255,.03)", color: conflictData.geoFilter === c.k ? c.c : T.t4, border: `1px solid ${conflictData.geoFilter === c.k ? `${c.c}30` : T.bd}` }}>
                    {c.l} {c.k !== "all" && <span style={{ opacity: 0.6 }}>({GEO.filter(g => g.cat === c.k).length})</span>}
                  </div>
                ))}
              </div>
              {/* Geo events — filter by both category AND region */}
              {GEO.filter(g => {
                if (conflictData.geoFilter === "all") return true;
                if (GEO_CATS.find(c => c.k === conflictData.geoFilter)) return g.cat === conflictData.geoFilter;
                // Region filter from map click
                const regionMap = { "Middle East": "me", "Asia-Pacific": "ea", "E. Europe": "eu", "Europe": "eu", "Africa": "af", "Americas": "na", "Global": "me", "US": "na", "Arctic": "ar" };
                return regionMap[g.region] === conflictData.geoFilter;
              }).map(g => <div key={g.id} className="card" style={{ marginBottom: 6, padding: "6px 8px", borderColor: g.sev === "CRITICAL" ? "rgba(255,45,85,.18)" : T.bd }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3, flexWrap: "wrap" }}>
                      <SevBadge s={g.sev} />
                      <span style={{ fontWeight: 700, fontSize: 12 }}>{g.title}</span>
                      <Pill c={T.t4}>{g.region}</Pill>
                      {g.cat && <Pill c={g.cat === "conflict" ? T.danger : g.cat === "sanctions" ? T.warn : g.cat === "defense" ? T.purple : T.acc2} bg={g.cat === "conflict" ? "rgba(255,45,85,.06)" : "rgba(255,255,255,.03)"}>{g.cat}</Pill>}
                    </div>
                    <div style={{ fontSize: 12, color: T.t2, marginBottom: 4, lineHeight: 1.4 }}>{g.desc}</div>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>{g.impact.map(id => { const a = anl[id]; return <Pill key={id} c={T.acc2} bg="rgba(0,201,255,.06)" onClick={() => { if (a) { setSel(id); setTab("analysis"); } }}>
                      {id}{a ? <span style={{ marginLeft: 3, fontSize: 12, color: a.dR >= 0 ? T.acc : T.danger }}>${a.price > 100 ? Math.round(a.price).toLocaleString() : a.price.toFixed(2)} {a.dR >= 0 ? "▲" : "▼"}{Math.abs(a.dR)}%</span> : null}
                    </Pill>; })}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: g.dir === "bullish" ? T.acc : g.dir === "bearish" ? T.danger : T.warn }}>{g.dir === "bullish" ? "▲" : g.dir === "bearish" ? "▼" : "◆"}</div>
                    <div style={{ fontSize: 12, color: T.t4 }}>{g.date}</div>
                  </div>
                </div>
              </div>)}

              {/* Conflict Intelligence Feed */}
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${T.bd}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div className="label" style={{ color: T.danger, fontSize: 12, marginBottom: 0 }}>🔴 CONFLICT INTELLIGENCE FEED</div>
                  {conflictData.ts && <span style={{ fontSize: 12, color: T.t4 }}>Updated: {new Date(conflictData.ts).toLocaleTimeString()} · Sources: OSINT, ACLED, Reuters</span>}
                </div>
                {conflictData.loading && <div style={{ textAlign: "center", padding: 12, color: T.t3, fontSize: 12 }}>Fetching conflict data...</div>}
                {conflictData.feeds.map((f, i) => {
                  // Auto-detect affected assets from title + desc
                  const text = `${f.title} ${f.desc}`.toUpperCase();
                  const linked = all.filter(a => text.includes(a.id) || text.includes(a.name.toUpperCase())).map(a => a.id);
                  // Also match commodity keywords
                  const kwMap = { "OIL": "OIL", "CRUDE": "OIL", "BRENT": "BRENT", "GOLD": "GOLD", "WHEAT": "WHEAT", "GRAIN": "WHEAT", "GAS": "NATGAS", "LNG": "NATGAS", "URANIUM": "URANIUM", "COPPER": "COPPER", "RARE EARTH": "COBALT", "CHIP": "NVDA", "SEMICONDUCTOR": "TSM", "DEFENSE": "BA" };
                  Object.entries(kwMap).forEach(([kw, id]) => { if (text.includes(kw) && !linked.includes(id)) linked.push(id); });
                  return (
                  <div key={i} style={{ padding: "5px 8px", marginBottom: 3, borderRadius: 4, background: f.sev === "CRITICAL" ? "rgba(255,45,85,.04)" : "rgba(255,255,255,.02)", borderLeft: `2px solid ${f.sev === "CRITICAL" ? T.danger : f.sev === "HIGH" ? T.warn : T.t4}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 2 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: T.danger, letterSpacing: 0.5 }}>{f.source}</span>
                          <SevBadge s={f.sev} />
                          {f.fatalities > 0 && <span style={{ fontSize: 12, color: T.danger }}>☠ {f.fatalities}</span>}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: T.t1, marginBottom: 2 }}>{f.title}</div>
                        <div style={{ fontSize: 12, color: T.t3, lineHeight: 1.3, marginBottom: linked.length ? 3 : 0 }}>{f.desc}</div>
                        {linked.length > 0 && <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                          {linked.slice(0, 6).map(id => <Pill key={id} c={T.acc2} bg="rgba(0,201,255,.06)" onClick={() => { if (anl[id]) { setSel(id); setTab("analysis"); } }}>{id}</Pill>)}
                        </div>}
                      </div>
                      <div style={{ flexShrink: 0, textAlign: "right" }}>
                        <div style={{ fontSize: 12, color: T.t4 }}>{f.date}</div>
                        {f.region && <div style={{ fontSize: 12, color: T.t4 }}>{f.region}</div>}
                      </div>
                    </div>
                  </div>);
                })}
              </div>
            </div>}

            {tab === "news" && <div>
              <div className="label" style={{ color: T.acc2, fontSize: 12, marginBottom: 12 }}>◎ NEWS & SENTIMENT</div>
              {NEWS.map(n => <div key={n.id} className="card" style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>{n.t}</div><SentBar value={n.sent} w={80} h={5} /><div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginTop: 4 }}><Pill>{n.cat}</Pill><span style={{ fontSize: 12, color: T.t4 }}>{n.time}</span>{n.impact.map(id => { const a = anl[id]; return <Pill key={id} c={T.acc2} bg="rgba(0,201,255,.07)" onClick={() => { if (a) { setSel(id); setTab("analysis"); } }}>
                    {id}{a ? <span style={{ marginLeft: 3, fontSize: 12, color: a.dR >= 0 ? T.acc : T.danger }}>{a.dR >= 0 ? "▲" : "▼"}{Math.abs(a.dR)}%</span> : null}
                  </Pill>; })}</div></div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}><div style={{ fontSize: 15, fontWeight: 800, color: n.sent > 0.3 ? T.acc : n.sent < -0.3 ? T.danger : T.warn }}>{n.sent > 0 ? "+" : ""}{(n.sent * 100).toFixed(0)}</div><div style={{ fontSize: 12, color: T.t4 }}>SENT</div></div>
                </div>
              </div>)}
            </div>}

            {tab === "settings" && settingsTab === "backtest" && <div>
              <div className="label" style={{ color: T.acc, fontSize: 12, marginBottom: 12 }}>↻ BACKTEST</div>
              {selA?.bt ? <div>
                <div className="g4" style={{ marginBottom: 12 }}><Stat l="SIGNALS" v={selA.bt.total} c={T.acc2} /><Stat l="GOLDEN WR" v={selA.bt.gcWR ? `${selA.bt.gcWR}%` : "—"} c={T.acc} /><Stat l="DEATH WR" v={selA.bt.dcWR ? `${selA.bt.dcWR}%` : "—"} c={T.danger} /><Stat l="AVG 10D" v={selA.bt.avgRet ? `${selA.bt.avgRet}%` : "—"} c={selA.bt.avgRet > 0 ? T.acc : T.danger} /></div>
                <div className="card"><div className="label">RECENT SIGNALS</div>{selA.bt.signals.length === 0 ? <div style={{ color: T.t4, fontSize: 12, padding: 8 }}>No signals</div> : selA.bt.signals.map((s, i) => <div key={i} className="row" style={{ flexWrap: "wrap", gap: 4 }}><div style={{ display: "flex", gap: 4, alignItems: "center" }}><Pill c={s.sig === "GOLDEN" ? T.acc : T.danger} bg={s.sig === "GOLDEN" ? "rgba(0,232,123,.1)" : "rgba(255,45,85,.1)"}>{s.sig}</Pill><span style={{ color: T.t3, fontSize: 12 }}>{s.date}</span></div><div style={{ display: "flex", gap: 8, fontSize: 12 }}><span style={{ color: T.t3 }}>5D:<span style={{ color: s.f5 > 0 ? T.acc : T.danger, fontWeight: 600 }}>{s.f5 ?? "—"}%</span></span><span style={{ color: T.t3 }}>10D:<span style={{ color: s.f10 > 0 ? T.acc : T.danger, fontWeight: 600 }}>{s.f10 ?? "—"}%</span></span></div></div>)}</div>
              </div> : <div style={{ color: T.t4, padding: 16 }}>Select an asset</div>}
            </div>}

            {tab === "scenario" && <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: T.purple, marginBottom: 8 }}>⧫ SCENARIO SIMULATOR</div>
              <div className="card" style={{ marginBottom: 8, padding: "4px 6px" }}>
                <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: T.t3 }}>If</span>
                  <select value={scenAsset} onChange={e => { setScenAsset(e.target.value); setSel(e.target.value); }} style={{ fontSize: 12, padding: "2px 4px" }}><option value="">Pick asset</option>{all.map(a => <option key={a.id} value={a.id}>{a.id} — {a.name}</option>)}</select>
                  <span style={{ fontSize: 12, color: T.t3 }}>moves</span>
                  {[-20, -10, -5, 5, 10, 15, 25].map(p => <span key={p} onClick={() => scenAsset && runScen(scenAsset, p)} style={{ padding: "2px 6px", borderRadius: 3, fontSize: 11, fontWeight: 700, cursor: "pointer", background: p > 0 ? "rgba(0,232,123,.06)" : "rgba(255,45,85,.06)", color: p > 0 ? T.acc : T.danger, border: `1px solid ${p > 0 ? "rgba(0,232,123,.1)" : "rgba(255,45,85,.1)"}` }}>{p > 0 ? "+" : ""}{p}%</span>)}
                </div>
              </div>
              {scenario && <div>
                <div className="card" style={{ marginBottom: 6, padding: "6px 10px", borderColor: scenario.pi < 0 ? "rgba(255,45,85,.12)" : "rgba(0,232,123,.08)" }}>
                  <div style={{ fontSize: 12, color: T.t4 }}>PORTFOLIO IMPACT</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: scenario.pi >= 0 ? T.acc : T.danger }}>{scenario.pi >= 0 ? "+" : ""}${scenario.pi.toLocaleString()}</div>
                </div>
                <div className="card" style={{ padding: "4px 6px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.t3, marginBottom: 3 }}>CASCADE ({scenario.imp.length} assets)</div>
                  <HBarChart items={scenario.imp.map(x => ({ label: x.id, v: x.pct }))} w={300} barH={8} />
                </div>
              </div>}
            </div>}

            {tab === "watch" && <div>
              <div className="label" style={{ color: T.warn, fontSize: 12, marginBottom: 12 }}>★ WATCHLIST</div>
              <div className="card" style={{ marginBottom: 10 }}><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{all.filter(a => !watch.includes(a.id)).map(a => <Btn key={a.id} v="ghost" onClick={() => setWatch(w => [...w, a.id])}>+ {a.id}</Btn>)}</div></div>
              {watch.map(id => { const a = anl[id]; if (!a) return null; return <div key={id} className="card" style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><b style={{ fontSize: 12 }}>{id}</b><span style={{ color: T.t3, fontSize: 12 }}>{a.name}</span><RecPill r={a.rec} /></div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ fontWeight: 600 }}>${a.price.toLocaleString()}</span><span style={{ color: a.dR >= 0 ? T.acc : T.danger, fontWeight: 700, fontSize: 12 }}>{a.dR >= 0 ? "+" : ""}{a.dR}%</span><span onClick={() => setWatch(w => w.filter(x => x !== id))} style={{ cursor: "pointer", color: T.danger, fontSize: 12 }}>✕</span></div>
                </div>
                {pd[id] && <div style={{ marginTop: 4 }}><PriceChart data={pd[id].slice(-30)} w={580} h={50} /></div>}
              </div>; })}
            </div>}

            {tab === "settings" && settingsTab === "alerts" && <div>
              <div className="label" style={{ color: T.warn, fontSize: 12, marginBottom: 12 }}>⚡ ALERTS</div>
              <div className="card" style={{ marginBottom: 12 }}>{alerts.map(al => <div key={al.id} className="row" style={{ fontSize: 12, flexWrap: "wrap", gap: 4 }}><div><b>{al.asset}</b> <span style={{ color: T.t3 }}>{al.cond.replace("_", " ")} {al.val}</span>{al.and && <span style={{ color: T.purple }}> & {al.and.replace("_", " ")}</span>}</div><div style={{ display: "flex", gap: 4, alignItems: "center" }}><Pill c={al.on ? T.acc : T.t4} bg={al.on ? "rgba(0,232,123,.1)" : "rgba(255,255,255,.03)"}>{al.on ? "ON" : "OFF"}</Pill><span onClick={() => setAlerts(a => a.map(x => x.id === al.id ? { ...x, on: !x.on } : x))} style={{ cursor: "pointer", fontSize: 12, color: T.t3 }}>toggle</span><span onClick={() => setAlerts(a => a.filter(x => x.id !== al.id))} style={{ cursor: "pointer", color: T.danger }}>✕</span></div></div>)}</div>
              <div className="card"><div className="label">ADD</div><div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap", marginTop: 4 }}><select id="na"><option value="">Asset</option>{all.map(a => <option key={a.id} value={a.id}>{a.id}</option>)}</select><select id="nc"><option value="price_above">price above</option><option value="price_below">price below</option><option value="vol_below">vol below</option></select><input id="nv" type="number" placeholder="val" className="ci" style={{ width: 60 }} /><select id="nw"><option value="">None</option><option value="trend_bull">& bull</option><option value="trend_bear">& bear</option></select><Btn v="purple" onClick={() => { const a = document.getElementById("na").value, c = document.getElementById("nc").value, v = +document.getElementById("nv").value, w = document.getElementById("nw").value; if (a && v) setAlerts(p => [...p, { id: Date.now(), asset: a, cond: c, val: v, and: w || null, on: true, label: `${a} ${c} ${v}` }]); }}>ADD</Btn></div></div>
            </div>}

            {tab === "trades" && <div>
              <div className="label" style={{ color: T.acc, fontSize: 12, marginBottom: 12 }}>☰ TRADES</div>
              {trades.length === 0 ? <div className="card" style={{ textAlign: "center", color: T.t4, padding: 24 }}>No trades</div> : trades.map(t => <div key={t.id} className="card" style={{ marginBottom: 5 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}><div style={{ display: "flex", alignItems: "center", gap: 6 }}><Pill c={t.action === "BUY" ? T.acc : T.danger} bg={t.action === "BUY" ? "rgba(0,232,123,.1)" : "rgba(255,45,85,.1)"}>{t.action}</Pill><b>{t.asset}</b></div><div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, flexWrap: "wrap" }}><span>@${t.price}</span><span style={{ color: T.danger }}>SL:${t.stop}</span><span style={{ color: T.acc }}>TP:${t.tp}</span><Pill c={t.status === "OPEN" ? T.acc : T.t3} bg={t.status === "OPEN" ? "rgba(0,232,123,.08)" : "rgba(255,255,255,.03)"}>{t.status}</Pill>{t.status === "OPEN" && <Btn v="ghost" onClick={() => closeTrade(t.id, "Manual")}>CLOSE</Btn>}</div></div></div>)}
            </div>}

            {tab === "journal" && <div>
              <div className="label" style={{ color: T.purple, fontSize: 12, marginBottom: 12 }}>✎ PAIN + REFLECTION</div>
              {journal.length === 0 ? <div className="card" style={{ textAlign: "center", color: T.t4, padding: 24 }}>Close trades to build entries</div> : journal.map(j => <div key={j.id} className="card" style={{ marginBottom: 10, borderColor: j.pnl >= 0 ? "rgba(0,232,123,.12)" : "rgba(255,45,85,.12)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 4 }}><div style={{ display: "flex", gap: 5, alignItems: "center" }}><b>{j.asset}</b><Pill c={j.action === "BUY" ? T.acc : T.danger} bg={j.action === "BUY" ? "rgba(0,232,123,.1)" : "rgba(255,45,85,.1)"}>{j.action}</Pill></div><div style={{ fontSize: 16, fontWeight: 800, color: j.pnl >= 0 ? T.acc : T.danger }}>{j.pnl >= 0 ? "+" : ""}{j.pnl}%</div></div>
                <div style={{ display: "flex", gap: 10, fontSize: 12, color: T.t3, marginBottom: 8, flexWrap: "wrap" }}><span>Entry: ${j.entry}</span><span>Exit: ${j.exit}</span></div>
                {[{ k: "reflection", l: "Pain + Reflection = Progress:", ph: "What was painful? Diagnose the root cause systematically." }, { k: "principle", l: "Which Dalio Principle applies?", ph: "Systematic? Holy Grail? Risk Parity? Follow Trends? Think Different?" }, { k: "lesson", l: "New codified rule:", ph: "Write a rule you'll follow next time. Add it to your system." }].map(({ k, l, ph }) => <div key={k} style={{ marginBottom: 5 }}><div style={{ fontSize: 12, color: T.purple, fontWeight: 700, marginBottom: 2 }}>{l}</div><textarea value={j[k]} onChange={e => setJournal(p => p.map(x => x.id === j.id ? { ...x, [k]: e.target.value } : x))} placeholder={ph} /></div>)}
              </div>)}
            </div>}

            {tab === "settings" && settingsTab === "api" && <div>
              <div className="label" style={{ color: T.purple, fontSize: 12, marginBottom: 12 }}>⬡ API CONFIGURATION & STATUS</div>

              {/* API Keys Configuration */}
              <div className="card" style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div className="label" style={{ color: T.acc, fontSize: 12, marginBottom: 0 }}>DATA SOURCE APIs</div>
                  <span style={{ fontSize: 12, color: T.t4 }}>Green = connected · Yellow = key needed · Red = error</span>
                </div>

                {[
                  { id: "coingecko", name: "CoinGecko", desc: "Crypto prices, market data, top 100 coins. Free demo: 30 calls/min, no key needed for basic. Pro key unlocks 500/min.", url: "coingecko.com/en/api", icon: "◈", fields: [{ k: "key", l: "API Key (optional for free tier)", ph: "CG-xxxxx" }] },
                  { id: "feargreed", name: "Fear & Greed Index", desc: "Crypto market sentiment 0-100. Completely free, no key required.", url: "alternative.me/crypto/fear-and-greed-index", icon: "◎", fields: [] },
                  { id: "alphavantage", name: "Alpha Vantage", desc: "US/global stock prices, forex, technical indicators. Free: 25 calls/day. Get key at alphavantage.co/support", url: "alphavantage.co", icon: "△", fields: [{ k: "key", l: "API Key", ph: "XXXXXXXXXX" }] },
                  { id: "finnhub", name: "Finnhub", desc: "Real-time US stocks, forex, crypto. Free: 60 calls/min. Signup at finnhub.io", url: "finnhub.io", icon: "⚡", fields: [{ k: "key", l: "API Key", ph: "xxxxxxxxxx" }] },
                  { id: "polygon", name: "Polygon.io", desc: "US stocks, options, forex, crypto. Free: 5 calls/min. Signup at polygon.io", url: "polygon.io", icon: "◫", fields: [{ k: "key", l: "API Key", ph: "xxxxxxxxxx" }] },
                  { id: "newsapi", name: "NewsAPI", desc: "Financial news headlines & sentiment. Free: 100 calls/day. Signup at newsapi.org", url: "newsapi.org", icon: "◎", fields: [{ k: "key", l: "API Key", ph: "xxxxxxxxxx" }] },
                ].map(api => (
                  <div key={api.id} style={{ padding: "10px 0", borderBottom: `1px solid ${T.bd}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 6 }}>
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                          <span style={{ fontSize: 12 }}>{api.icon}</span>
                          <span style={{ fontWeight: 800, fontSize: 12 }}>{api.name}</span>
                          {apiKeys[api.id].free && <Pill c={T.acc} bg="rgba(0,232,123,.08)">FREE</Pill>}
                          <Pill c={apiKeys[api.id].status === "ok" ? T.acc : apiKeys[api.id].status === "default" ? T.acc2 : apiKeys[api.id].status === "error" ? T.danger : T.t4}
                            bg={apiKeys[api.id].status === "ok" ? "rgba(0,232,123,.1)" : apiKeys[api.id].status === "default" ? "rgba(0,201,255,.08)" : apiKeys[api.id].status === "error" ? "rgba(255,45,85,.1)" : "rgba(255,255,255,.03)"}>
                            {apiKeys[api.id].status === "ok" ? "✓ CONNECTED" : apiKeys[api.id].status === "default" ? "DEFAULT" : apiKeys[api.id].status === "error" ? "ERROR" : "NOT SET"}
                          </Pill>
                        </div>
                        <div style={{ fontSize: 12, color: T.t3, marginBottom: 4 }}>{api.desc}</div>
                        <div style={{ fontSize: 12, color: T.t4 }}>→ {api.url}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 200 }}>
                        {api.fields.map(f => (
                          <input key={f.k} type={f.k.includes("secret") ? "password" : "text"} className="ci" placeholder={f.ph} value={apiKeys[api.id][f.k] || ""} onChange={e => setApiKeys(prev => ({ ...prev, [api.id]: { ...prev[api.id], [f.k]: e.target.value } }))} style={{ fontSize: 12 }} />
                        ))}
                        <div style={{ display: "flex", gap: 4 }}>
                          <div className="tg" onClick={() => setApiKeys(prev => ({ ...prev, [api.id]: { ...prev[api.id], enabled: !prev[api.id].enabled } }))} style={{ padding: 0 }}>
                            <div className="tt" style={{ background: apiKeys[api.id].enabled ? T.acc : "rgba(255,255,255,.08)" }}><div className="th" style={{ left: apiKeys[api.id].enabled ? 15 : 2 }} /></div>
                            <span style={{ fontSize: 12, color: T.t3 }}>{apiKeys[api.id].enabled ? "ON" : "OFF"}</span>
                          </div>
                          <Btn v="ghost" onClick={async () => {
                            setApiKeys(prev => ({ ...prev, [api.id]: { ...prev[api.id], status: "checking" } }));
                            try {
                              const urls = { coingecko: "https://api.coingecko.com/api/v3/ping", feargreed: "https://api.alternative.me/fng/?limit=1", alphavantage: `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&apikey=${apiKeys.alphavantage.key || "demo"}&datatype=json`, finnhub: `https://finnhub.io/api/v1/quote?symbol=AAPL&token=${apiKeys.finnhub.key}`, polygon: `https://api.polygon.io/v2/aggs/ticker/AAPL/prev?apiKey=${apiKeys.polygon.key}`, newsapi: `https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=${apiKeys.newsapi.key}` };
                              const r = await fetch(urls[api.id]); const ok = r.ok;
                              setApiKeys(prev => ({ ...prev, [api.id]: { ...prev[api.id], status: ok ? "ok" : "error" } }));
                              addLog(`API TEST: ${api.name} → ${ok ? "SUCCESS" : "FAILED"}`);
                            } catch { setApiKeys(prev => ({ ...prev, [api.id]: { ...prev[api.id], status: "error" } })); addLog(`API TEST: ${api.name} → CORS/NETWORK ERROR`); }
                          }}>Test</Btn>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Chat Toggle */}
              <div className="card" style={{ marginBottom: 10, padding: "8px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: T.purple }}>🧠 AI Chat Assistant</div>
                    <div style={{ fontSize: 12, color: T.t3, marginTop: 2 }}>Context-aware AI that sees your portfolio, current page, and all asset data</div>
                  </div>
                  <div onClick={() => setAiEnabled(p => !p)} style={{ width: 36, height: 18, borderRadius: 9, background: aiEnabled ? T.purple : "rgba(255,255,255,.08)", cursor: "pointer", position: "relative", transition: ".2s" }}>
                    <div style={{ width: 14, height: 14, borderRadius: 7, background: "#fff", position: "absolute", top: 2, left: aiEnabled ? 20 : 2, transition: ".2s", boxShadow: "0 1px 3px rgba(0,0,0,.3)" }} />
                  </div>
                </div>
                {aiEnabled && <div style={{ marginTop: 8, padding: "6px 8px", background: "rgba(123,97,255,.04)", borderRadius: 4, border: `1px solid rgba(123,97,255,.1)` }}>
                  <div style={{ fontSize: 12, color: T.t3, marginBottom: 4 }}>Active provider: <span style={{ color: T.purple, fontWeight: 700 }}>{AI_PROVIDERS[aiProvider]?.name}</span></div>
                  <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    {Object.entries(AI_PROVIDERS).map(([k, v]) => (
                      <span key={k} onClick={() => setAiProvider(k)} style={{ padding: "2px 6px", borderRadius: 3, fontSize: 7, cursor: "pointer", background: aiProvider === k ? "rgba(123,97,255,.15)" : "rgba(255,255,255,.03)", color: aiProvider === k ? T.purple : T.t4, border: `1px solid ${aiProvider === k ? "rgba(123,97,255,.2)" : T.bd}`, fontWeight: aiProvider === k ? 700 : 400 }}>{v.name}</span>
                    ))}
                  </div>
                </div>}
              </div>

              {/* AI & Broker APIs */}
              <div className="card" style={{ marginBottom: 12 }}>
                <div className="label" style={{ color: T.purple, fontSize: 12, marginBottom: 10 }}>AI & BROKER APIs</div>
                {[
                  { id: "anthropic", name: "Anthropic (Claude)", desc: "AI trade analysis via Claude Sonnet. Built into this artifact — no key needed when running inside Claude. For standalone deployment, get key at console.anthropic.com", icon: "🧠", fields: [{ k: "key", l: "API Key (for standalone only)", ph: "sk-ant-xxxxx" }] },
                  { id: "binance", name: "Binance", desc: "Crypto trading execution. Create API key at binance.com/en/my/settings/api-management. Enable spot trading.", icon: "◈", fields: [{ k: "key", l: "API Key", ph: "xxxxx" }, { k: "secret", l: "API Secret", ph: "xxxxx" }] },
                  { id: "coinbase", name: "Coinbase", desc: "Crypto trading. Create API key at coinbase.com/settings/api. Grant trade permissions.", icon: "◈", fields: [{ k: "key", l: "API Key", ph: "xxxxx" }, { k: "secret", l: "API Secret", ph: "xxxxx" }] },
                  { id: "alpaca", name: "Alpaca", desc: "US stock trading (free paper trading). Signup at alpaca.markets. Paper trading enabled by default.", icon: "△", fields: [{ k: "key", l: "API Key ID", ph: "PKxxxxx" }, { k: "secret", l: "Secret Key", ph: "xxxxx" }] },
                ].map(api => (
                  <div key={api.id} style={{ padding: "10px 0", borderBottom: `1px solid ${T.bd}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 6 }}>
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                          <span style={{ fontSize: 12 }}>{api.icon}</span>
                          <span style={{ fontWeight: 800, fontSize: 12 }}>{api.name}</span>
                          <Pill c={apiKeys[api.id].status === "ok" ? T.acc : apiKeys[api.id].status === "error" ? T.danger : T.t4}
                            bg={apiKeys[api.id].status === "ok" ? "rgba(0,232,123,.1)" : apiKeys[api.id].status === "error" ? "rgba(255,45,85,.1)" : "rgba(255,255,255,.03)"}>
                            {apiKeys[api.id].status === "ok" ? "✓ CONNECTED" : apiKeys[api.id].status === "error" ? "ERROR" : "NOT SET"}
                          </Pill>
                        </div>
                        <div style={{ fontSize: 12, color: T.t3 }}>{api.desc}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 200 }}>
                        {api.fields.map(f => (
                          <div key={f.k}>
                            <div style={{ fontSize: 12, color: T.t4, marginBottom: 1 }}>{f.l}</div>
                            <input type="password" className="ci" placeholder={f.ph} value={apiKeys[api.id][f.k] || ""} onChange={e => setApiKeys(prev => ({ ...prev, [api.id]: { ...prev[api.id], [f.k]: e.target.value } }))} style={{ fontSize: 12 }} />
                          </div>
                        ))}
                        <div className="tg" onClick={() => setApiKeys(prev => ({ ...prev, [api.id]: { ...prev[api.id], enabled: !prev[api.id].enabled } }))} style={{ padding: 0 }}>
                          <div className="tt" style={{ background: apiKeys[api.id].enabled ? T.acc : "rgba(255,255,255,.08)" }}><div className="th" style={{ left: apiKeys[api.id].enabled ? 15 : 2 }} /></div>
                          <span style={{ fontSize: 12, color: T.t3 }}>{apiKeys[api.id].enabled ? "Enabled" : "Disabled"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Connection status summary */}
              <div className="card" style={{ marginBottom: 12 }}>
                <div className="label" style={{ color: T.acc2, fontSize: 12, marginBottom: 8 }}>CONNECTION STATUS</div>
                <div className="g5">
                  {Object.entries(apiKeys).map(([id, v]) => (
                    <div key={id} style={{ textAlign: "center", padding: 6, borderRadius: 4, background: v.status === "ok" ? "rgba(0,232,123,.06)" : v.status === "default" ? "rgba(0,201,255,.05)" : v.status === "error" ? "rgba(255,45,85,.06)" : "rgba(255,255,255,.02)", border: `1px solid ${v.status === "ok" ? "rgba(0,232,123,.12)" : v.status === "error" ? "rgba(255,45,85,.12)" : T.bd}` }}>
                      <div style={{ fontSize: 12, color: v.status === "ok" ? T.acc : v.status === "default" ? T.acc2 : v.status === "error" ? T.danger : T.t4 }}>{v.status === "ok" ? "✓" : v.status === "default" ? "◈" : v.status === "error" ? "✗" : "—"}</div>
                      <div style={{ fontSize: 12, color: T.t3, marginTop: 2 }}>{id}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  <Btn v="purple" onClick={async () => {
                    addLog("API: Testing all connections...");
                    for (const [id] of Object.entries(apiKeys)) {
                      const testBtn = document.querySelector(`[data-api-test="${id}"]`);
                      if (testBtn) testBtn.click();
                    }
                  }}>⚡ Test All Connections</Btn>
                  <Btn v="ghost" onClick={() => {
                    const exp = {};
                    Object.entries(apiKeys).forEach(([k, v]) => { if (v.key || v.secret) exp[k] = { key: v.key, secret: v.secret }; });
                    navigator.clipboard?.writeText(JSON.stringify(exp, null, 2));
                    addLog("API: Keys exported to clipboard (JSON)");
                  }}>Export Keys</Btn>
                </div>
              </div>

              {/* Quick Setup Guide */}
              <div className="card" style={{ marginBottom: 12, borderColor: "rgba(0,201,255,.12)" }}>
                <div className="label" style={{ color: T.acc2, fontSize: 12, marginBottom: 8 }}>QUICK SETUP GUIDE</div>
                <div style={{ fontSize: 12, color: T.t2, lineHeight: 1.6 }}>
                  <div style={{ marginBottom: 8 }}><b style={{ color: T.acc }}>Minimum (works out of the box):</b> CoinGecko + Fear & Greed — both free, no keys needed. Already enabled by default.</div>
                  <div style={{ marginBottom: 8 }}><b style={{ color: T.warn }}>Recommended:</b> Add Alpha Vantage (free, 25 calls/day) for US stock data and Finnhub (free, 60 calls/min) for real-time prices.</div>
                  <div style={{ marginBottom: 8 }}><b style={{ color: T.purple }}>Full power:</b> Add Polygon.io for comprehensive market data, NewsAPI for live sentiment, and connect a broker (Alpaca paper trading is free).</div>
                  <div><b style={{ color: T.t3 }}>AI Analysis:</b> Anthropic key is only needed if deploying standalone. Inside this Claude artifact, AI analysis works automatically.</div>
                </div>
              </div>

              {/* API Output */}
              <div className="card" style={{ marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span className="label">/portfolio/summary</span><Pill c={T.acc} bg="rgba(0,232,123,.08)">LIVE</Pill></div><pre className="pre">{JSON.stringify(api, null, 2)}</pre></div>
              <div className="card"><div className="label">AI LOG</div>{log.length === 0 ? <div style={{ color: T.t4, fontSize: 12, padding: 8 }}>No actions</div> : <div className="pre" style={{ maxHeight: 200 }}>{log.slice(0, 25).map(l => <div key={l.id} style={{ padding: "2px 0", borderBottom: `1px solid ${T.bd}` }}><span style={{ color: T.purple }}>[{new Date(l.ts).toLocaleTimeString()}]</span> {l.m}</div>)}</div>}</div>
            </div>}

          </div>
        </div>
      </div>

      {/* ═══ AI CHAT ASSISTANT ═══ */}
      {aiEnabled && <>
        {/* Toggle button */}
        <div onClick={() => setChatOpen(p => !p)} style={{ position: "fixed", bottom: 16, right: 16, width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${T.purple}, ${T.acc2})`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 24px rgba(123,97,255,.5)", zIndex: 99999, transition: "transform .2s", transform: chatOpen ? "scale(0.9)" : "scale(1)" }}>
          <span style={{ fontSize: 20, color: "#fff" }}>{chatOpen ? "✕" : "🧠"}</span>
        </div>
        {/* Chat panel */}
        {chatOpen && <div style={{ position: "fixed", bottom: 68, right: 16, width: 340, maxWidth: "calc(100vw - 32px)", height: 440, maxHeight: "calc(100vh - 100px)", borderRadius: 12, background: T.bg, border: `1px solid ${T.purple}40`, boxShadow: "0 12px 48px rgba(0,0,0,.7), 0 0 0 1px rgba(123,97,255,.1)", display: "flex", flexDirection: "column", zIndex: 99998, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "10px 14px", background: "rgba(123,97,255,.1)", borderBottom: `1px solid ${T.purple}25`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: T.purple }}>🧠 Dalios AI</div>
              <div style={{ fontSize: 12, color: T.t3 }}>{AI_PROVIDERS[aiProvider]?.name} · {tab}{selA ? ` · ${selA.id}` : ""}</div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <span onClick={() => setChatMsgs([{ role: "assistant", text: "Chat cleared. Ask me anything about your portfolio or any asset." }])} style={{ fontSize: 12, color: T.t4, cursor: "pointer", padding: "3px 8px", borderRadius: 4, background: "rgba(255,255,255,.05)", border: `1px solid ${T.bd}` }}>Clear</span>
              <span onClick={() => setChatOpen(false)} style={{ fontSize: 14, color: T.t4, cursor: "pointer", padding: "0 4px" }}>✕</span>
            </div>
          </div>
          {/* Messages */}
          <div ref={el => { if (el) el.scrollTop = el.scrollHeight; }} style={{ flex: 1, overflow: "auto", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
            {chatMsgs.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%", padding: "8px 12px", borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", background: m.role === "user" ? "rgba(123,97,255,.15)" : "rgba(255,255,255,.04)", border: `1px solid ${m.role === "user" ? "rgba(123,97,255,.25)" : T.bd}` }}>
                <div style={{ fontSize: 12, color: m.role === "user" ? T.purple : T.t1, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{m.text}</div>
              </div>
            ))}
            {chatLoading && <div style={{ alignSelf: "flex-start", padding: "8px 12px", borderRadius: "12px 12px 12px 2px", background: "rgba(255,255,255,.04)", border: `1px solid ${T.bd}` }}>
              <div style={{ fontSize: 12, color: T.t3 }}>● ● ●</div>
            </div>}
          </div>
          {/* Input */}
          <div style={{ padding: "8px 10px", borderTop: `1px solid ${T.bd}`, display: "flex", gap: 6, flexShrink: 0, background: "rgba(255,255,255,.02)" }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }} placeholder={selA ? `Ask about ${selA.id}...` : "Ask anything..."} style={{ flex: 1, background: "rgba(255,255,255,.05)", border: `1px solid ${T.bd}`, borderRadius: 8, padding: "8px 12px", color: T.t1, fontSize: 12, outline: "none", fontFamily: "inherit" }} />
            <div onClick={sendChat} style={{ padding: "8px 12px", borderRadius: 8, background: chatInput.trim() ? `linear-gradient(135deg, ${T.purple}, ${T.acc2})` : "rgba(255,255,255,.05)", cursor: chatInput.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 12, color: chatInput.trim() ? "#fff" : T.t4 }}>▶</span>
            </div>
          </div>
        </div>}
      </>}
    </div>
  );
}
