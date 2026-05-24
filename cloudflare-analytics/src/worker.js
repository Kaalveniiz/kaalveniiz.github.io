function isLikelyBot(ua) {
  const s = String(ua || "").toLowerCase();
  return /bot|crawler|spider|gptbot|chatgpt-user|oai-searchbot|claudebot|anthropic-ai|bytespider|facebookexternalhit|googlebot|bingbot|duckduckbot|yandexbot|slurp/.test(s);
}

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders
    }
  });
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

async function ensureSeed(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS totals (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      total_visits INTEGER NOT NULL DEFAULT 0,
      total_bot_visits INTEGER NOT NULL DEFAULT 0
    );
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS daily (
      day TEXT PRIMARY KEY,
      today_visits INTEGER NOT NULL DEFAULT 0,
      today_bot_visits INTEGER NOT NULL DEFAULT 0
    );
  `);
  await db.prepare("INSERT OR IGNORE INTO totals (id, total_visits, total_bot_visits) VALUES (1, 0, 0)").run();
}

async function handleCollect(request, env) {
  const origin = request.headers.get("Origin") || "*";
  const ua = request.headers.get("User-Agent") || "";
  const bot = isLikelyBot(ua) ? 1 : 0;
  const day = todayUtc();

  const db = env.ANALYTICS_DB;
  await ensureSeed(db);

  await db.batch([
    db.prepare(
      "UPDATE totals SET total_visits = total_visits + 1, total_bot_visits = total_bot_visits + ? WHERE id = 1"
    ).bind(bot),
    db.prepare(
      "INSERT INTO daily (day, today_visits, today_bot_visits) VALUES (?, 1, ?) ON CONFLICT(day) DO UPDATE SET today_visits = today_visits + 1, today_bot_visits = today_bot_visits + ?"
    ).bind(day, bot, bot)
  ]);

  return json({ ok: true }, 200, corsHeaders(origin));
}

async function handleStats(request, env) {
  const origin = request.headers.get("Origin") || "*";
  const db = env.ANALYTICS_DB;
  await ensureSeed(db);

  const day = todayUtc();

  const totalsRow = await db
    .prepare("SELECT total_visits, total_bot_visits FROM totals WHERE id = 1")
    .first();

  const dailyRow = await db
    .prepare("SELECT today_visits, today_bot_visits FROM daily WHERE day = ?")
    .bind(day)
    .first();

  return json(
    {
      total_visits: (totalsRow && totalsRow.total_visits) || 0,
      total_bot_visits: (totalsRow && totalsRow.total_bot_visits) || 0,
      today_visits: (dailyRow && dailyRow.today_visits) || 0,
      today_bot_visits: (dailyRow && dailyRow.today_bot_visits) || 0,
      day
    },
    200,
    corsHeaders(origin)
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(request.headers.get("Origin") || "*") });
    }

    if (url.pathname === "/collect" && request.method === "POST") {
      return handleCollect(request, env);
    }

    if (url.pathname === "/stats" && request.method === "GET") {
      return handleStats(request, env);
    }

    return json({ error: "not found" }, 404, corsHeaders(request.headers.get("Origin") || "*"));
  }
};
