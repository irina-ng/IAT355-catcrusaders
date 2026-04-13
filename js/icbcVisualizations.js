console.log("vis.js is connected");

async function fetchData() {
  const data = await d3.csv("./data/ICBC_Crashes.csv", d3.autoType);
  return data;
}

async function render(viewID, spec) {
  const result = await vegaEmbed(viewID, spec);
  result.view.run();
}

fetchData().then(async (data) => {
  const icbc = vl
    .markRect()
    .data(data)
    .encode(
      vl.y().fieldN("Year").title("Year"),
      vl.x()
        .fieldN("Month")
        .title("Month"),

      vl.color()
        .fieldQ("Unrounded Count")
        .title("Crashes")
        .scale({
  range: ["#1f2f6b", "#f0c7c7", "#c81818"],
  domain: [0, 3500]
})
,
      vl.tooltip([
        vl.fieldN("Month"),
        vl.fieldN("Year"),
        vl.fieldQ("Unrounded Count")
      ])
    )
    .title({
  text: "The ICBC Crash Heatmap",
  fontSize: 18,
  anchor: "middle"
})
    .toSpec();

  render(".icbc-vis", icbc);

});

async function render(viewID, spec) {
  const result = await vegaEmbed(viewID, spec);
  result.view.run();
}