console.log("sleepVisualizations.js is connected");

async function initSleepChart() {
  let raw;
  try {
    raw = await d3.csv("./data/Sleep_Efficiency.csv", d3.autoType);
  } catch (err) {
    console.error("Could not load Sleep_Efficiency.csv", err);
    return;
  }

  const ORDER = [
    "Before 9 PM", "9:00", "9:30", "10:00", "10:30",
    "11:00", "11:30", "12:00 AM", "12:30 AM", "After 1 AM"
  ];

  const records = raw
    .filter(d => d.Bedtime && d["Sleep efficiency"] != null)
    .map(d => {
      const timeStr = d.Bedtime.split(" ")[1];
      const [h, m] = timeStr.split(":").map(Number);
      let hour = h + m / 60;
      if (hour < 12) hour += 24;

      let group;
      if (hour < 21)       group = "Before 9 PM";
      else if (hour < 21.5) group = "9:00";
      else if (hour < 22)   group = "9:30";
      else if (hour < 22.5) group = "10:00";
      else if (hour < 23)   group = "10:30";
      else if (hour < 23.5) group = "11:00";
      else if (hour < 24)   group = "11:30";
      else if (hour < 24.5) group = "12:00 AM";
      else if (hour < 25)   group = "12:30 AM";
      else                  group = "After 1 AM";

      return {
        group,
        sleep_efficiency: Math.round(d["Sleep efficiency"] * 100)
      };
    });

  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: 500,
    height: 260,
    data: { values: records },
    mark: {
      type: "bar",
      cornerRadiusTopLeft: 4,
      cornerRadiusTopRight: 4
    },
    encoding: {
      x: {
        field: "group",
        type: "nominal",
        title: "Bedtime",
        sort: ORDER,
        axis: {
          labelFont: "Urbanist",
          titleFont: "Urbanist",
          labelAngle: 0
        }
      },
      y: {
        field: "sleep_efficiency",
        type: "quantitative",
        aggregate: "mean",
        title: "Average Sleep Efficiency (%)",
        scale: { domain: [60, 90] },
        axis: {
          titleFont: "Urbanist",
          labelFont: "Urbanist",
          grid: true,
          gridColor: "#f0f0f0"
        }
      },
      color: {
        field: "group",
        type: "nominal",
        sort: ORDER,
        scale: {
          domain: ORDER,
          range: [
            "#1a3a5c", "#1f4a74", "#2a5a8c", "#3a6ea0",
            "#4a7aac", "#5a8ab8", "#7aaad0", "#8abcdc",
            "#aad0f0", "#c0e0f8"
          ]
        },
        legend: null
      },
      tooltip: [
        { field: "group", type: "nominal", title: "Bedtime" },
        { field: "sleep_efficiency", aggregate: "mean", type: "quantitative", title: "Avg Efficiency (%)", format: ".1f" },
        { field: "sleep_efficiency", aggregate: "count", type: "quantitative", title: "Sample size" }
      ]
    },
    title: {
      text: "Sleep Efficiency by Bedtime",
      fontSize: 13,
      fontWeight: "normal",
      color: "#444",
      anchor: "start",
      font: "Urbanist"
    },
    config: {
      view: { stroke: null },
      background: "transparent"
    }
  };

  vegaEmbed("#sleep-efficiency-chart", spec, {
    renderer: "svg",
    actions: false
  }).catch(err => console.error("Vega embed error (sleep):", err));
}

window.addEventListener("load", initSleepChart);