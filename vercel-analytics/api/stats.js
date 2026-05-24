const { todayUtc, cors, json, redisCall } = require("./_shared");

function n(v) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    cors(res, req);
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    json(res, req, 405, { error: "method not allowed" });
    return;
  }

  try {
    const day = todayUtc();

    const [total, totalBots, today, todayBots] = await Promise.all([
      redisCall(`/get/visits:total`, "GET"),
      redisCall(`/get/visits:total:bots`, "GET"),
      redisCall(`/get/visits:daily:${day}:total`, "GET"),
      redisCall(`/get/visits:daily:${day}:bots`, "GET")
    ]);

    json(res, req, 200, {
      total_visits: n(total),
      total_bot_visits: n(totalBots),
      today_visits: n(today),
      today_bot_visits: n(todayBots),
      day
    });
  } catch (err) {
    json(res, req, 500, { error: "stats_failed", detail: String(err && err.message || err) });
  }
};
