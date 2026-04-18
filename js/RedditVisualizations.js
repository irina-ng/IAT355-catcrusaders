let redditData = [];

const FOUR_PREFERENCES = [
  "Permanent PDT",
  "Permanent PST",
  "Stop switching",
  "Keep switching"
];

function matchesArgument(row, tabText) {
  const tabLower = tabText.toLowerCase().trim();
  const arg1 = (row.argument_type || "").toLowerCase();
  const arg2 = (row.argument_type_2 || "").toLowerCase();
  
  return arg1.includes(tabLower) || arg2.includes(tabLower);
}


// rendering function
function renderPreferenceChart(tabArgument) {
  const filtered = redditData.filter(row => matchesArgument(row, tabArgument));

  const counts = {};
  FOUR_PREFERENCES.forEach(pref => { counts[pref] = 0; });

  filtered.forEach(row => {
    const pref = row.preference;
    if (pref && FOUR_PREFERENCES.includes(pref)) {
      counts[pref]++;
    }
  });

  // find dominant preference
  let maxCount = 0;
  let dominantPref = "Stop switching";
  Object.keys(counts).forEach(pref => {
    if (counts[pref] > maxCount) {
      maxCount = counts[pref];
      dominantPref = pref;
    }
  });

  const totalMentions = filtered.length;

  // update comment number
  const bigNumberEl = document.querySelector(".big-number");
  if (bigNumberEl) {
    bigNumberEl.textContent = totalMentions || "0";
  }

    // update reason text 
  const reasonEl = document.querySelector(".reason");
  if (reasonEl) {
    reasonEl.innerHTML = `
      Comments mention topics relating to <strong>${tabArgument.toLowerCase()}</strong>. 
      Most prefer <strong>${dominantPref}</strong>.
    `;
  }

  //update fotter text
  const footerEl = document.querySelector(".footer-text");
  if (footerEl) {
    let footerMsg = "";

    switch(tabArgument.toLowerCase()) {
      case "evening light":
        footerMsg = "Most people who talk about evening light strongly prefer Permanent Daylight Time so they can enjoy brighter afternoons and evenings year round.";
        break;
      case "disruption":
        footerMsg = "Comments focused on disruption overwhelmingly want to stop the twice-yearly clock changes that mess with sleep and routines.";
        break;
      case "health":
        footerMsg = "Health related comments tend to support Permanent Standard Time, aligning with sleep scientists' recommendations for better circadian rhythm.";
        break;
      case "safety":
        footerMsg = "Safety concerns such as accidents, visibility, fatigue, lead most commenters to favor either stopping the switches or staying on Permanent Standard Time.";
        break;
      case "work":
        footerMsg = "People mentioning work life balance strongly lean toward Permanent PDT for more usable daylight after their workday.";
        break;
      case "political":
        footerMsg = "Political comments often urge BC to stop waiting on the US and make its own decision, most want to end the switching altogether.";
        break;
      case "morning light":
        footerMsg = "Comments about morning light usually support Permanent Standard Time for brighter winter mornings and better natural alignment.";
        break;
      default:
        footerMsg = "Reddit commenters show varied preferences depending on what aspect of daylight saving time matters most to them.";
    }

    footerEl.textContent = footerMsg;
  }

  // bar chart
  const chartData = FOUR_PREFERENCES.map(pref => ({
    preference: pref,
    count: counts[pref]
  }));

  const isMobile = window.innerWidth < 700;

  const spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": {
      "text": ``,
      "font": "Urbanist",
      "fontSize": 16,
      "anchor": "start"
    },
    "data": { "values": chartData },
    "mark": {
      "type": "bar",
      "cornerRadiusEnd": 4,
      "tooltip": true
    },
    "encoding": {
      "y": {
        "field": "preference",
        "type": "nominal",
        "sort": "-x",
        "axis": {
          "title": null,
          "labelFont": "Urbanist",
          "labelFontSize": isMobile ? 10 : 13,
          "labelPadding": 8
        }
      },
      "x": {
        "field": "count",
        "type": "quantitative",
        "axis": {
          "title": "Number of Comments",
          "titleFont": "Urbanist",
          "labelFont": "Urbanist",
          "labelFontSize": isMobile ? 10 : 12
        }
      },
      "color": {
        "field": "preference",
        "type": "nominal",
        "scale": { "scheme": "tableau10" },
        "legend": null
      }
    },
    "width": isMobile ? 220 : 340,
    "height": isMobile ? 160 : 240,
    "config": {
      "view": { "stroke": "transparent" },
      "axis": {
        "grid": true,
        "gridColor": "#f0f0f0"
      }
    }
  };

  vegaEmbed("#dst-bar", spec, {
    renderer: "svg",
    actions: false
  }).catch(err => console.error("Vega embed error:", err));
}

// Tab setup
function setupTabs() {
  const tabs = document.querySelectorAll(".tabs .tab");
  
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const tabText = tab.textContent.trim();
      renderPreferenceChart(tabText);
    });
  });
}

// Initialize
async function initRedditVisualizations() {
  try {
    redditData = await d3.csv("data/dst_all_clean.csv");

    setupTabs();

    const activeTab = document.querySelector(".tab.active");
    if (activeTab) {
      renderPreferenceChart(activeTab.textContent.trim());
    }
  } catch (err) {
    console.error("Could not load data/dst_all_clean.csv", err);
  }
}

window.addEventListener("load", initRedditVisualizations);