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
    width: isMobile ? 260 : 500,
    height: isMobile ? 180 : 300,
    data: { values: cleaned },

    mark: {
      type: "rect",
      cornerRadius: 0
    },

    encoding: {
      x: {
        field: "MonthShort", // ✅ use shortened month
        type: "nominal",
        sort: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
        title: "Month",
        axis: {
          labelFont: "Urbanist",
          titleFont: "Urbanist",
          labelAngle: -30, // ✅ prevents overlap
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
        { field: "MonthShort", type: "nominal", title: "Month" }, // ✅ match display
        { field: "Year", type: "nominal" },
        { field: "Unrounded Count", type: "quantitative", title: "Crashes" }
      ]
    },

    title: {
      text: "The ICBC Crash Heatmap",
      fontSize: isMobile ? 12 : 14,
      fontWeight: "normal",
      color: "#444",
      anchor: "start",
      font: "Urbanist"
    },

    config: {
      view: { stroke: null },
      background: "transparent",
      axis: {
        grid: false
      },
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

// console.log("vis.js is connected");

// async function fetchData() {
//   const data = await d3.csv("./data/ICBC_Crashes.csv", d3.autoType);
//   return data;
// }

// async function render(viewID, spec) {
//   const result = await vegaEmbed(viewID, spec, {
//     actions: false
//   });
//   result.view.run();
// }

// fetchData().then(async (data) => {
//   const icbc = vl
//     .markRect()
//     .data(data)
//     .encode(
//       vl.y().fieldN("Year").title("Year"),
//       vl.x()
//         .fieldN("Month")
//         .title("Month")  .sort(["January","February","March","April","May","June",
//          "July","August","September","October","November","December"]),
        

//       vl.color()
//         .fieldQ("Unrounded Count")
//         .title("Crashes")
//         .scale({
//   range: ["#1f2f6b", "#f0c7c7", "#c81818"],
//   domain: [0, 3500]
// })
// ,
//       vl.tooltip([
//         vl.fieldN("Month"),
//         vl.fieldN("Year"),
//         vl.fieldQ("Unrounded Count")
//       ])
//     )
//     .title({
//   text: "The ICBC Crash Heatmap",
//   fontSize: 18,
//   anchor: "middle"
// })
//     .toSpec();

//   render(".icbc-vis", icbc);

// });

// async function render(viewID, spec) {
//   const result = await vegaEmbed(viewID, spec);
//   result.view.run();
// }