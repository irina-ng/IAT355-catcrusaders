console.log("sunriseVisualizations.js is connected");

const CITIES = ["Vancouver", "Toronto", "Yellowknife", "Victoria"];

function parseTime(str) {
  if (!str || str.trim() === "") return null;
  const [h, m] = str.trim().split(":").map(Number);
  return h + m / 60;
}

function parseDate(str) {
  return new Date(str.trim()).toISOString().slice(0, 10);
}

d3.csv("./data/canada_sun_2026.csv").then(raw => {

  const records = [];

  raw
    .filter(d => CITIES.includes(d.City))
    .forEach(d => {
      const dateStr = parseDate(d.Date);
      const sunrise = parseTime(d.Sunrise);
      const sunset  = parseTime(d.Sunset);

      records.push({ city: d.City, date: dateStr, type: "Sunrise", scenario: "Permanent Standard Time", hour: sunrise });
      records.push({ city: d.City, date: dateStr, type: "Sunset",  scenario: "Permanent Standard Time", hour: sunset  });
      records.push({ city: d.City, date: dateStr, type: "Sunrise", scenario: "Permanent DST", hour: sunrise !== null ? sunrise + 1 : null });
      records.push({ city: d.City, date: dateStr, type: "Sunset",  scenario: "Permanent DST", hour: sunset  !== null ? sunset  + 1 : null });
    });

  renderStandardTimeChart(records);
  renderDaylightTimeChart(records);

}).catch(err => {
  console.error("Sunrise CSV load failed:", err);
});

function renderStandardTimeChart(records) {
  const container = document.getElementById("standard-time-chart");
  if (!container) return;

  container.innerHTML = `
    <div class="sunrise-controls">
      <div class="sunrise-control-group">
        <label>City</label>
        <select id="st-city-select">
          ${CITIES.map(c => `<option value="${c}">${c}</option>`).join("")}
        </select>
      </div>
    </div>
    <div id="st-vl"></div>
  `;

  function getSpec(city) {
    const filtered = records.filter(d => d.city === city && d.scenario === "Permanent Standard Time");
    return {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      width: 600, height: 300,
      data: { values: filtered },
      transform: [
  {
    calculate: "hours(datum.hour * 3600 * 1000)",
    as: "dummy"
  },
  {
    calculate: "floor(datum.hour) + ':' + (((datum.hour % 1) * 60 < 10) ? '0' : '') + floor((datum.hour % 1) * 60) + (datum.hour >= 12 ? ' PM' : ' AM')",
    as: "timeLabel"
  }
],
      mark: { type: "line", strokeWidth: 2 },
      encoding: {
        x: { field: "date", type: "temporal", title: null, axis: { format: "%b", labelAngle: 0, grid: false } },
        y: {
          field: "hour", type: "quantitative", title: "Time of day",
          scale: { domain: [2, 22] },
          axis: { tickCount: 8, labelExpr: "datum.value < 12 ? datum.value + ':00 AM' : datum.value == 12 ? '12:00 PM' : (datum.value - 12) + ':00 PM'" }
        },
        color: {
          field: "type", type: "nominal", title: null,
          scale: { domain: ["Sunrise", "Sunset"], range: ["#F4A261", "#1D3557"] },
          legend: { orient: "top-left" }
        },
        tooltip: [
          { field: "date", type: "temporal", title: "Date", format: "%b %d" },
          { field: "type", type: "nominal", title: "Type" },
          { field: "timeLabel", type: "nominal", title: "Time" }
        ]
      },
      title: { text: city + " — Sunrise & Sunset under Permanent Standard Time", fontSize: 13, fontWeight: "normal", color: "#444", anchor: "start" },
      config: { view: { stroke: null }, background: "transparent" }
    };
  }

  let selectedCity = "Vancouver";
  function render() { vegaEmbed("#st-vl", getSpec(selectedCity), { actions: false, renderer: "svg" }); }
  document.getElementById("st-city-select").addEventListener("change", e => { selectedCity = e.target.value; render(); });
  render();
}

function renderDaylightTimeChart(records) {
  const container = document.getElementById("daylight-time-chart");
  if (!container) return;

  container.innerHTML = `
    <div class="sunrise-controls">
      <div class="sunrise-control-group">
        <label>City</label>
        <select id="dt-city-select">
          ${CITIES.map(c => `<option value="${c}">${c}</option>`).join("")}
        </select>
      </div>
    </div>
    <div id="dt-vl"></div>
  `;

  function getSpec(city) {
    const filtered = records.filter(d => d.city === city && d.type === "Sunset");
    return {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      width: 400, height: 300,
      data: { values: filtered },
      transform: [
  {
    calculate: "hours(datum.hour * 3600 * 1000)",
    as: "dummy"
  },
  {
    calculate: "floor(datum.hour) + ':' + (((datum.hour % 1) * 60 < 10) ? '0' : '') + floor((datum.hour % 1) * 60) + (datum.hour >= 12 ? ' PM' : ' AM')",
    as: "timeLabel"
  }
],
      mark: { type: "line", strokeWidth: 2 },
      encoding: {
        x: { field: "date", type: "temporal", title: null, axis: { format: "%b", labelAngle: 0, grid: false } },
        y: {
          field: "hour", type: "quantitative", title: "Sunset time",
          scale: { domain: [14, 23] },
          axis: { tickCount: 8, labelExpr: "datum.value < 12 ? datum.value + ':00 AM' : datum.value == 12 ? '12:00 PM' : (datum.value - 12) + ':00 PM'" }
        },
        color: {
          field: "scenario", type: "nominal", title: null,
          scale: { domain: ["Permanent Standard Time", "Permanent DST"], range: ["#6b7280", "#F4A261"] },
          legend: { orient: "top-left" }
        },
        tooltip: [
          { field: "date", type: "temporal", title: "Date", format: "%b %d" },
          { field: "scenario", type: "nominal", title: "Scenario" },
          { field: "timeLabel", type: "nominal", title: "Time" }
        ]
      },
      title: { text: city + " — Evening Light: Permanent DST vs Standard Time", fontSize: 13, fontWeight: "normal", color: "#444", anchor: "start" },
      config: { view: { stroke: null }, background: "transparent" }
    };
  }

  let selectedCity = "Vancouver";
  function render() { vegaEmbed("#dt-vl", getSpec(selectedCity), { actions: false, renderer: "svg" }); }
  document.getElementById("dt-city-select").addEventListener("change", e => { selectedCity = e.target.value; render(); });
  render();
}