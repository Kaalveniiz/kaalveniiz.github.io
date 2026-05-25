(function () {
  function text(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = String(value);
  }

  function endpointFromMeta() {
    var meta = document.querySelector('meta[name="analytics-endpoint"]');
    if (!meta) return "";
    return (meta.getAttribute("content") || "").trim().replace(/\/+$/, "");
  }

  function safeJson(resp) {
    if (!resp || !resp.ok) return null;
    return resp.json().catch(function () { return null; });
  }

  var endpoint = endpointFromMeta();
  if (!endpoint) return;

  try {
    fetch(endpoint + "/collect", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: location.pathname, referrer: document.referrer || "" })
    }).catch(function () {});
  } catch (_err) {}

  if (!document.getElementById("total-visits")) return;

  fetch(endpoint + "/stats")
    .then(safeJson)
    .then(function (data) {
      if (!data) {
        text("stats-note", "Stats endpoint unavailable.");
        return;
      }
      text("total-visits", data.total_visits || 0);
      text("total-bot-visits", data.total_bot_visits || 0);
      text("today-visits", data.today_visits || 0);
      text("today-bot-visits", data.today_bot_visits || 0);
    })
    .catch(function () {
      text("stats-note", "Stats endpoint unavailable.");
    });
})();
