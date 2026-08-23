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
  if (!endpoint) {
    text("yesterday-visitors", "--");
    text("total-visitors", "--");
    text("ai-yesterday-total", "--");
    text("ai-overall-total", "--");
    text("stats-day", "--");
    text("stats-note", "Visitor counter is not connected yet.");
    return;
  }

  try {
    fetch(endpoint + "/collect", {
      method: "POST",
      keepalive: true
    }).catch(function () {});
  } catch (_err) {}

  if (!document.getElementById("total-visitors")) return;

  fetch(endpoint + "/stats")
    .then(safeJson)
    .then(function (data) {
      if (!data) {
        text("stats-note", "Stats endpoint unavailable.");
        return;
      }
      text("total-visitors", data.total_visitors || 0);
      text("yesterday-visitors", data.yesterday_visitors || 0);
      text("stats-day", data.day || "--");

      var aiReads = data.ai_reads || {};
      var yesterday = aiReads.yesterday || {};
      var overall = aiReads.overall || {};
      ["crawler", "search", "assistant", "total"].forEach(function (category) {
        text("ai-yesterday-" + category, yesterday[category] || 0);
        text("ai-overall-" + category, overall[category] || 0);
      });
    })
    .catch(function () {
      text("stats-note", "Stats endpoint unavailable.");
    });
})();
