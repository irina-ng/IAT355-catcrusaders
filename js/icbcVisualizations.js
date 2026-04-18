console.log("vis.js is connected");

async function initICBCChart() {
  let data;
  try {
    data = await d3.csv("./data/ICBC_Crashes.csv", d3.autoType);
  } catch (err) {
    console.error("Could not load ICBC_Crashes.csv", err);
    return;
  }

  const MONTH_ABBR = {
    January: "Jan", February: "Feb", March: "Mar",
    April: "Apr", May: "May", June: "Jun",
    July: "Jul", August: "Aug", September: "Sep",
    October: "Oct", November: "Nov", December: "Dec"
  };

  const cleaned = data.map(d => ({
    ...d,
    MonthShort: MONTH_ABBR[d.Month]
  }));

  const isMobile = window.innerWidth < 700;

  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: { step: isMobile ? 22 : 38 },
    height: { step: isMobile ? 22 : 38 },
    data: { values: cleaned },

    mark: {
      type: "rect",
      cornerRadius: 0
    },

    encoding: {
      x: {
        field: "MonthShort",
        type: "nominal",
        sort: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
        title: "Month",
        axis: {
          labelFont: "Urbanist",
          titleFont: "Urbanist",
          labelAngle: -30,
          labelFontSize: isMobile ? 8 : 11,
          titleFontSize: isMobile ? 10 : 12
        }
      },

      y: {
        field: "Year",
        type: "nominal",
        title: "Year",
        axis: {
          labelFont: "Urbanist",
          titleFont: "Urbanist",
          labelFontSize: isMobile ? 9 : 11,
          titleFontSize: isMobile ? 10 : 12
        }
      },

      color: {
        field: "Unrounded Count",
        type: "quantitative",
        title: "Crashes",
        scale: {
          domain: [0, 3500],
          range: ["#1f2f6b", "#f0c7c7", "#c81818"]
        },
        legend: {
          titleFont: "Urbanist",
          labelFont: "Urbanist"
        }
      },

      tooltip: [
        { field: "MonthShort", type: "nominal", title: "Month" },
        { field: "Year", type: "nominal" },
        { field: "Unrounded Count", type: "quantitative", title: "Crashes" }
      ]
    },

    title: {
      text: "The ICBC Crash Heatmap",
      fontSize: isMobile ? 12 : 16,
      fontWeight: "bold",
      color: "#1a3a5c",
      anchor: "middle",
      font: "Urbanist",
      offset: 12
    },

    config: {
      view: { stroke: null },
      background: "transparent",
      axis: { grid: false },
      scale: {
        bandPaddingInner: 0.05,
        bandPaddingOuter: 0.02
      }
    }
  };

  vegaEmbed(".icbc-vis", spec, {
    renderer: "svg",
    actions: false
  }).catch(err => console.error("Vega embed error (ICBC):", err));
}

window.addEventListener("load", initICBCChart);