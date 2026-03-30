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

/* Grouped bar, reasons by preference group */
const dstGroupedBar = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "title": {
    "text": "Topics Discussed by Preference Group",
    "anchor": "start",
    "offset": 15,
  },
  "data": { "url": "data/dst_all_clean.csv" },
  "transform": [
    {
      "filter": "datum.preference != null && datum.preference != '' && datum.preference != 'Unsure' && datum.argument_type != null && datum.argument_type != ''"
    },
    {
      "calculate": "datum.preference == 'Permanent PDT' ? 0 : datum.preference == 'Permanent PST' ? 1 : datum.preference == 'Stop switching' ? 2 : 3",
      "as": "prefOrder"
    }
  ],
  "facet": {
    "row": {
      "field": "preference",
      "type": "nominal",
      "title": null,
      "sort": { "field": "prefOrder", "op": "min", "order": "ascending" },
      "header": {
        "labelFontSize": 10,
        "labelFontWeight": "bold",
        "labelColor": "#444",
        "labelAlign": "right",
        "labelAnchor": "middle",
        "labelOrient": "left",
        "labelPadding": 10,
      }
    }
  },
  "spec": {
    "width": 700,
    "height": 120,
    "mark": { "type": "bar", "cornerRadiusEnd": 2 },
    "encoding": {
      "y": {
        "field": "argument_type",
        "type": "nominal",
        "title": null,
        "sort": "-x",
        "axis": { "labelFontSize": 11, "labelLimit": 120 }
      },
      "x": {
        "aggregate": "count",
        "type": "quantitative",
        "title": "Number of Comments",
        "axis": { "grid": true },
        "scale": { "domain": [0, 52] }
      },
      "color": {
        "field": "preference",
        "type": "nominal",
        "scale": {
          "domain": ["Permanent PDT", "Permanent PST", "Stop switching", "Keep switching"],
          "range": ["#EFAA2A", "#E8634A", "#4BBFA8", "#5B8ED6"]
        },
        "legend":null
      },
      "opacity": {
        "condition": {
          "test": {
            "or": [
              "datum.preference == 'Permanent PDT' && datum.argument_type == 'Evening light'",
              "datum.preference == 'Permanent PST' && datum.argument_type == 'Health'",
              "datum.preference == 'Stop switching' && datum.argument_type == 'Disruption'",
              "datum.preference == 'Keep switching' && datum.argument_type == 'Morning light'"
            ]
          },
          "value": 1
        },
        "value": 0.25
      },
      "tooltip": [
        { "field": "preference",    "type": "nominal",      "title": "Preference" },
        { "field": "argument_type", "type": "nominal",      "title": "Reason" },
        { "aggregate": "count",     "type": "quantitative", "title": "Comments" }
      ]
    }
  },
  "resolve": { "scale": { "x": "shared", "y": "independent" } },
  "spacing": 8
};

vegaEmbed("#dst-bar", dstGroupedBar, {
  renderer: "svg",
  actions: false
});