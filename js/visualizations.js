/*Reddit comment chart*/
const redditChart  = {
  "width": 600,
  "height": 400,
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "title": "What do people actually want?",
  "data": { "url": "data/dst_all_clean.csv" },
  "transform": [
    { "filter": "datum.preference != null && datum.preference != ''" }
  ],
  "mark": "bar",
  "encoding": {
    "y": { 
      "field": "preference", 
      "type": "nominal", 
      "title": null,
      "sort": "-x"
    },
    "x": { 
      "aggregate": "count", 
      "type": "quantitative", 
      "title": "Number of comments" 
    },
    "color": { "value": "steelblue" },
    "tooltip": [
      { "field": "preference", "type": "nominal", "title": "Preference" },
      { "aggregate": "count", "type": "quantitative", "title": "Comments" }
    ]
  }
}

vegaEmbed("#reddit-chart", redditChart , {
  renderer: "svg",
  actions: false
})