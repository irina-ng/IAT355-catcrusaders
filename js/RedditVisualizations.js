const dstGroupedBar = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "title": {
    "text": "",
    "anchor": "start",
    "offset": 15
  },
  "data": { "url": "data/dst_all_clean.csv" },

  "transform": [
    {
      "filter": "trim(datum.preference) == 'Permanent PDT' || trim(datum.preference) == 'Permanent PST'"
    },
    {
      "filter": "datum.argument_type != null && datum.argument_type != ''"
    },
    {
      "calculate": "datum.preference == 'Permanent PDT' ? 0 : 1",
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
        "labelPadding": 10
      }
    }
  },

  "spec": {
    "width": 500,
    "height": 100,
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
        "scale": { "domain": [0, 55] }
      },

      "color": {
        "field": "preference",
        "type": "nominal",
        "scale": {
          "domain": ["Permanent PDT", "Permanent PST"],
          "range": ["#6c95e6", "#E8634A"]
        },
        "legend": null
      },

      "opacity": {
        "condition": {
          "test": {
            "or": [
              "datum.preference == 'Permanent PDT' && datum.argument_type == 'Evening light'",
              "datum.preference == 'Permanent PST' && datum.argument_type == 'Health'"
            ]
          },
          "value": 1
        },
        "value": 0.25
      },

      "tooltip": [
        { "field": "preference", "type": "nominal", "title": "Preference" },
        { "field": "argument_type", "type": "nominal", "title": "Reason" },
        { "aggregate": "count", "type": "quantitative", "title": "Comments" }
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