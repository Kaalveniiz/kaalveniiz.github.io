const AI_USER_AGENT = /gptbot|chatgpt-user|oai-searchbot|claudebot|claude-searchbot|claude-user|anthropic-ai|perplexitybot|perplexity-user|google-cloudvertexbot|bytespider|ccbot|cohere-ai|meta-externalagent|meta-externalfetcher|facebookbot|amazonbot|applebot|duckassistbot|mistralai-user/i;
const BOT_USER_AGENT = /bot|crawler|spider|slurp|facebookexternalhit|googlebot|bingbot|duckduckbot|yandexbot|baiduspider/i;
const AI_CATEGORIES = new Set(["AI Assistant", "AI Crawler", "AI Search", "Agent", "Search", "Training"]);
const AI_READ_CATEGORIES = ["crawler", "search", "assistant"];
const AI_USER_AGENTS = {
  crawler: [
    "GPTBot",
    "ClaudeBot",
    "Google-CloudVertexBot",
    "Bytespider",
    "CCBot",
    "meta-externalagent",
    "FacebookBot",
    "Amazonbot"
  ],
  search: ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot", "Applebot"],
  assistant: [
    "ChatGPT-User",
    "Claude-User",
    "Perplexity-User",
    "meta-externalfetcher",
    "DuckAssistBot",
    "MistralAI-User"
  ]
};

function allowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function isAllowedOrigin(origin, env) {
  return Boolean(origin) && allowedOrigins(env).includes(origin);
}

function corsHeaders(origin, env) {
  const origins = allowedOrigins(env);
  const allowedOrigin = isAllowedOrigin(origin, env) ? origin : origins[0] || "null";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

function json(data, status, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers
    }
  });
}

function hongKongDay(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function yesterdayHongKong(date = new Date()) {
  return hongKongDay(new Date(date.getTime() - 24 * 60 * 60 * 1000));
}

function hongKongDayBounds(day) {
  const start = new Date(`${day}T00:00:00+08:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1000);

  if (Number.isNaN(start.getTime())) throw new Error("Invalid Hong Kong day");
  return { start: start.toISOString(), end: end.toISOString() };
}

function classifyRequest(request) {
  const category = request.cf && request.cf.verifiedBotCategory;
  const userAgent = request.headers.get("User-Agent") || "";

  if ((category && AI_CATEGORIES.has(category)) || AI_USER_AGENT.test(userAgent)) {
    return "ai";
  }

  if (category || BOT_USER_AGENT.test(userAgent)) {
    return "bot";
  }

  return "browser";
}

async function visitorHash(request, secret) {
  if (!secret) throw new Error("VISITOR_HASH_SECRET is not configured");

  const ip = request.headers.get("CF-Connecting-IP");
  if (!ip) return "";

  const userAgent = (request.headers.get("User-Agent") || "").slice(0, 512);
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(`v1\0${ip}\0${userAgent}`));

  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function handleCollect(request, env) {
  const origin = request.headers.get("Origin") || "";
  if (!isAllowedOrigin(origin, env)) {
    return json({ error: "origin_not_allowed" }, 403, corsHeaders(origin, env));
  }

  const classification = classifyRequest(request);
  if (classification !== "browser") {
    return json({ ok: true, counted: false }, 200, corsHeaders(origin, env));
  }

  const hash = await visitorHash(request, env.VISITOR_HASH_SECRET);
  if (!hash) {
    return json({ error: "client_identity_unavailable" }, 503, corsHeaders(origin, env));
  }

  const day = hongKongDay();
  const results = await env.ANALYTICS_DB.batch([
    env.ANALYTICS_DB.prepare(
      "INSERT OR IGNORE INTO visitors (visitor_hash, first_seen_day, last_seen_day) VALUES (?, ?, ?)"
    ).bind(hash, day, day),
    env.ANALYTICS_DB.prepare(
      "UPDATE visitors SET last_seen_day = ? WHERE visitor_hash = ? AND last_seen_day < ?"
    ).bind(day, hash, day),
    env.ANALYTICS_DB.prepare(
      "INSERT OR IGNORE INTO daily_visitors (day, visitor_hash) VALUES (?, ?)"
    ).bind(day, hash)
  ]);

  const counted = Boolean(results[2] && results[2].meta && results[2].meta.changes);
  return json({ ok: true, counted }, 200, corsHeaders(origin, env));
}

async function handleStats(request, env) {
  const completedDay = yesterdayHongKong();
  const [yesterday, overall, aiYesterday, aiOverall] = await env.ANALYTICS_DB.batch([
    env.ANALYTICS_DB.prepare("SELECT COUNT(*) AS count FROM daily_visitors WHERE day = ?").bind(completedDay),
    env.ANALYTICS_DB.prepare("SELECT COUNT(*) AS count FROM visitors WHERE first_seen_day <= ?").bind(completedDay),
    env.ANALYTICS_DB.prepare(
      "SELECT category, reads FROM daily_ai_reads WHERE day = ?"
    ).bind(completedDay),
    env.ANALYTICS_DB.prepare(
      "SELECT category, SUM(reads) AS reads FROM daily_ai_reads WHERE day <= ? GROUP BY category"
    ).bind(completedDay)
  ]);

  const aiReads = (result) => {
    const counts = { crawler: 0, search: 0, assistant: 0, total: 0 };
    for (const row of (result && result.results) || []) {
      if (!AI_READ_CATEGORIES.includes(row.category)) continue;
      counts[row.category] = Number(row.reads) || 0;
      counts.total += counts[row.category];
    }
    return counts;
  };

  return json(
    {
      yesterday_visitors: Number(yesterday && yesterday.results[0] && yesterday.results[0].count) || 0,
      total_visitors: Number(overall && overall.results[0] && overall.results[0].count) || 0,
      ai_reads: {
        yesterday: aiReads(aiYesterday),
        overall: aiReads(aiOverall)
      },
      day: completedDay
    },
    200,
    {
      ...corsHeaders(request.headers.get("Origin") || "", env),
      "Cache-Control": "public, max-age=3600, s-maxage=3600"
    }
  );
}

function userAgentFilters(userAgents) {
  return userAgents.map((userAgent) => `{ userAgent_like: "%${userAgent}%" }`).join("\n");
}

function aiAnalyticsQuery(zoneId, start, end) {
  const categoryQuery = (category) => `
    ${category}: httpRequestsAdaptiveGroups(
      filter: {
        datetime_geq: "${start}"
        datetime_leq: "${end}"
        requestSource: "eyeball"
        edgeResponseStatus_geq: 200
        edgeResponseStatus_lt: 400
        clientRequestPath_like: "%/"
        OR: [${userAgentFilters(AI_USER_AGENTS[category])}]
      }
      limit: 5000
    ) { count }
  `;

  return `{
    viewer {
      zones(filter: { zoneTag: "${zoneId}" }) {
        ${AI_READ_CATEGORIES.map(categoryQuery).join("\n")}
      }
    }
  }`;
}

function sumGroupCounts(groups) {
  return (groups || []).reduce((total, group) => total + (Number(group.count) || 0), 0);
}

async function syncAiReads(env, now = new Date()) {
  const zoneId = String(env.CLOUDFLARE_ZONE_ID || "").trim();
  if (!zoneId) return { skipped: true, reason: "zone_not_configured" };
  if (!/^[a-f0-9]{32}$/i.test(zoneId)) throw new Error("CLOUDFLARE_ZONE_ID is invalid");
  if (!env.CLOUDFLARE_API_TOKEN) throw new Error("CLOUDFLARE_API_TOKEN is not configured");

  const day = yesterdayHongKong(now);
  const bounds = hongKongDayBounds(day);
  const response = await fetch("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query: aiAnalyticsQuery(zoneId, bounds.start, bounds.end) })
  });
  const payload = await response.json();

  if (!response.ok || (payload.errors && payload.errors.length)) {
    throw new Error("Cloudflare AI analytics query failed");
  }

  const zones = payload.data && payload.data.viewer && payload.data.viewer.zones;
  const zone = zones && zones[0];
  if (!zone) throw new Error("Cloudflare zone was not returned");

  const statements = AI_READ_CATEGORIES.map((category) =>
    env.ANALYTICS_DB.prepare(
      "INSERT INTO daily_ai_reads (day, category, reads) VALUES (?, ?, ?) " +
      "ON CONFLICT(day, category) DO UPDATE SET reads = excluded.reads"
    ).bind(day, category, sumGroupCounts(zone[category]))
  );
  await env.ANALYTICS_DB.batch(statements);

  return { day, synced: true };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (request.method === "OPTIONS") {
        const origin = request.headers.get("Origin") || "";
        if (!isAllowedOrigin(origin, env)) {
          return json({ error: "origin_not_allowed" }, 403, corsHeaders(origin, env));
        }
        return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
      }

      if (url.pathname === "/collect" && request.method === "POST") {
        return handleCollect(request, env);
      }

      if (url.pathname === "/stats" && request.method === "GET") {
        return handleStats(request, env);
      }

      return json({ error: "not_found" }, 404);
    } catch (_error) {
      return json({ error: "service_unavailable" }, 503);
    }
  },

  async scheduled(controller, env, ctx) {
    ctx.waitUntil(
      syncAiReads(env, new Date(controller.scheduledTime)).catch((error) => {
        console.error("AI analytics sync failed", error);
      })
    );
  }
};
