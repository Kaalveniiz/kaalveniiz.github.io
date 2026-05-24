const { isLikelyBot, todayUtc, cors, json, redisCall } = require("./_shared");

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    cors(res, req);
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    json(res, req, 405, { error: "method not allowed" });
    return;
  }

  try {
    const ua = req.headers["user-agent"] || "";
    const bot = isLikelyBot(ua) ? 1 : 0;
    const day = todayUtc();

    await Promise.all([
      redisCall(`/incr/visits:total`, "POST"),
      redisCall(`/incrby/visits:total:bots/${bot}`, "POST"),
      redisCall(`/incr/visits:daily:${day}:total`, "POST"),
      redisCall(`/incrby/visits:daily:${day}:bots/${bot}`, "POST")
    ]);

    json(res, req, 200, { ok: true });
  } catch (err) {
    json(res, req, 500, { error: "collect_failed", detail: String(err && err.message || err) });
  }
};
