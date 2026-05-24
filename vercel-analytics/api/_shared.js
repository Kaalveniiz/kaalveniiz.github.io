function isLikelyBot(ua) {
  const s = String(ua || "").toLowerCase();
  return /bot|crawler|spider|gptbot|chatgpt-user|oai-searchbot|claudebot|anthropic-ai|bytespider|facebookexternalhit|googlebot|bingbot|duckduckbot|yandexbot|slurp/.test(s);
}

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

function cors(res, req) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function json(res, req, status, data) {
  cors(res, req);
  res.status(status).json(data);
}

function requireEnv(name) {
  const val = process.env[name];
  if (!val) throw new Error(`Missing env var: ${name}`);
  return val;
}

async function redisCall(path, method = "POST") {
  const base = requireEnv("UPSTASH_REDIS_REST_URL").replace(/\/+$/, "");
  const token = requireEnv("UPSTASH_REDIS_REST_TOKEN");

  const resp = await fetch(`${base}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Redis call failed (${resp.status}): ${text}`);
  }

  const out = await resp.json();
  return out && out.result;
}

module.exports = {
  isLikelyBot,
  todayUtc,
  cors,
  json,
  redisCall
};
