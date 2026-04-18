// Sun Animation - Fixed sky colors using real dataset times
let sunData = [];
let cities = [];
let currentCity = "Vancouver";
let currentMonth = 5;
let currentTimeDecimal = 14;

const canvas = document.getElementById('sun-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  const container = document.getElementById('sun-animation-container');
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
}

// Responsiveness
window.addEventListener('resize', () => {
  resizeCanvas();
  updateVisualization(); 
});

async function loadSunData() {
  try {
    const response = await fetch('data/canada_sun_2026.csv');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const text = await response.text();
    const rows = text.trim().split('\n');
    const headers = rows[0].split(',').map(h => h.trim());

    sunData = rows.slice(1).map(row => {
      const values = row.split(',');
      const obj = {};
      headers.forEach((header, i) => obj[header] = values[i] ? values[i].trim() : '');
      return obj;
    });

    cities = [...new Set(sunData.map(r => r.City))].sort();

    populateSelects();
    updateVisualization();

  } catch (err) {
    console.error("Load error:", err);
  }
}

function populateSelects() {
  const citySelect = document.getElementById('city-select');
  citySelect.innerHTML = cities.map(city => 
    `<option value="${city}" ${city === currentCity ? 'selected' : ''}>${city}</option>`
  ).join('');

  const monthSelect = document.getElementById('month-select');
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  monthSelect.innerHTML = monthNames.map((name, i) => 
    `<option value="${i+1}" ${i+1 === currentMonth ? 'selected' : ''}>${name}</option>`
  ).join('');
}

function timeToDecimal(timeStr) {
  if (!timeStr || timeStr === '--:--') return null;
  const [h, m] = timeStr.split(':').map(Number);
  return h + (m || 0) / 60;
}

function decimalToTime(decimal) {
  if (decimal === null) return '--:--';
  let hours = Math.floor(decimal);
  let minutes = Math.round((decimal % 1) * 60);
  if (minutes === 60) { hours++; minutes = 0; }
  const period = hours < 12 ? 'AM' : 'PM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const minStr = minutes < 10 ? '0' + minutes : minutes;
  return `${displayHour}:${minStr} ${period}`;
}

function getDayData(city, month) {
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthAbbr = monthNames[month - 1];
  const day = 15;
  const dateStr1 = `${monthAbbr} ${day} 2026`;
  const dateStr2 = `${monthAbbr}  ${day} 2026`;

  return sunData.find(row => 
    row.City === city && (row.Date.includes(dateStr1) || row.Date.includes(dateStr2))
  );
}

function drawSun(timeDecimal, dayData, showDST) {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Get times from data
  let sunrise     = timeToDecimal(dayData ? dayData.Sunrise : null);
  let sunset      = timeToDecimal(dayData ? dayData.Sunset : null);
  let nauticalDawn = timeToDecimal(dayData ? dayData['Nautical Twilight Start'] : null);
  let civilDawn   = timeToDecimal(dayData ? dayData['Civil Twilight Start'] : null);
  let civilDusk   = timeToDecimal(dayData ? dayData['Civil Twilight End'] : null);
  let nauticalDusk= timeToDecimal(dayData ? dayData['Nautical Twilight End'] : null);
  let solarNoon   = timeToDecimal(dayData ? dayData['Solar Noon'] : null);

  // dst shift
  if (showDST) {
    if (nauticalDawn !== null) nauticalDawn += 1;
    if (civilDawn   !== null) civilDawn   += 1;
    if (sunrise     !== null) sunrise     += 1;
    if (sunset      !== null) sunset      += 1;
    if (civilDusk   !== null) civilDusk   += 1;
    if (nauticalDusk!== null) nauticalDusk+= 1;
    if (solarNoon   !== null) solarNoon   += 1;
  }

  // based on data
  let skyFrames = [
    [0, '#0a1428', '#1a2a4a'], 
  ];

  if (nauticalDawn !== null) skyFrames.push([nauticalDawn, '#1a1a4a', '#37220a']);
  if (civilDawn   !== null) skyFrames.push([civilDawn,   '#1e3a6b', '#ffab6b']);
  if (sunrise     !== null) {
    skyFrames.push([sunrise,     '#2a5a9b', '#ffde5c']);
    skyFrames.push([sunrise + 1.5, '#5eb3ff', '#b0e0ff']);
  }

  const midday = solarNoon !== null ? solarNoon : 13;
  skyFrames.push([midday, '#4aa8ff', '#90d4ff']);

  if (sunset !== null) {
    skyFrames.push([sunset - 1.0, '#5eb3ff', '#b0e0ff']); 
    skyFrames.push([sunset,       '#2a4a8a', '#ffde5c']); 
  }
  if (civilDusk   !== null) skyFrames.push([civilDusk,   '#1e2a6b', '#ffab6b']);
  if (nauticalDusk!== null) skyFrames.push([nauticalDusk, '#2d1b69', '#704118']);

  const lateDusk = nauticalDusk !== null ? nauticalDusk + 1.2 : 22;
  skyFrames.push([lateDusk, '#0d1b3e', '#1a2a5c']);
  skyFrames.push([24, '#0a1428', '#1a2a4a']);

  skyFrames.sort((a, b) => a[0] - b[0]);

  let topColor = '#0a1428', bottomColor = '#1a2a4a';
  for (let i = 0; i < skyFrames.length - 1; i++) {
    const [t0, top0, bot0] = skyFrames[i];
    const [t1, top1, bot1] = skyFrames[i + 1];
    if (timeDecimal >= t0 && timeDecimal <= t1) {
      const t = (timeDecimal - t0) / (t1 - t0);
      topColor    = lerpColor(top0, top1, t);
      bottomColor = lerpColor(bot0, bot1, t);
      break;
    }
  }

  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.87);
  skyGrad.addColorStop(0, topColor);
  skyGrad.addColorStop(1, bottomColor);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // sun progress and draw
  let progress = 0.5;
  if (sunrise !== null && sunset !== null) {
    if (timeDecimal <= sunrise) {
      progress = 0;
    } else if (timeDecimal >= sunset) {
      progress = 1;
    } else {
      let rawProgress = (timeDecimal - sunrise) / (sunset - sunrise);
      
      progress = Math.pow(rawProgress, 0.55);
    }
  }

  const sunX = w * (0.15 + progress * 0.70);

  let heightFactor = Math.sin(progress * Math.PI);
  heightFactor = Math.pow(heightFactor, 0.88); 

  let sunY = h * 0.79 - heightFactor * (h * 0.23); 

  const horizonY = h * 0.85;

  // Draw sun  when it's daytime and clearly above horizon
  if (sunrise !== null && sunset !== null &&
      timeDecimal >= sunrise && timeDecimal <= sunset && 
      sunY < horizonY - 25) {
    
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 31, 0, Math.PI * 2);
    ctx.fill();

    //glow
    ctx.save();
    ctx.shadowColor = '#ffe050';
    ctx.shadowBlur = 28;
    ctx.fillStyle = 'rgba(255, 240, 100, 0.35)';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 37, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Ground
  ctx.fillStyle = '#182d41';
  ctx.fillRect(0, horizonY, w, h - horizonY);

  // Update 
  if (dayData) {
    document.getElementById('current-date').textContent = 
      `${new Date(2026, currentMonth-1, 15).toLocaleString('default', { month: 'long' })} 15, 2026`;

    let displayRise = dayData.Sunrise || '--:--';
    let displaySet  = dayData.Sunset  || '--:--';

    if (showDST) {
      let r = timeToDecimal(dayData.Sunrise);
      let s = timeToDecimal(dayData.Sunset);
      if (r !== null) r += 1;
      if (s !== null) s += 1;
      displayRise = decimalToTime(r);
      displaySet  = decimalToTime(s);
    } else {
      displayRise = decimalToTime(timeToDecimal(dayData.Sunrise));
      displaySet  = decimalToTime(timeToDecimal(dayData.Sunset));
    }

    document.getElementById('info-sunrise').textContent = displayRise;
    document.getElementById('info-sunset').textContent = displaySet;
  }
}

// color
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return [r, g, b];
}

function lerpColor(a, b, t) {
  const [r1,g1,b1] = hexToRgb(a);
  const [r2,g2,b2] = hexToRgb(b);
  const r  = Math.round(r1 + (r2-r1) * t);
  const g  = Math.round(g1 + (g2-g1) * t);
  const bl = Math.round(b1 + (b2-b1) * t);
  return `rgb(${r},${g},${bl})`;
}

function updateVisualization() {
  currentCity = document.getElementById('city-select').value || currentCity;
  currentMonth = parseInt(document.getElementById('month-select').value) || currentMonth;

  const dayData = getDayData(currentCity, currentMonth);
  const showDST = document.getElementById('dst-toggle').checked;

  drawSun(currentTimeDecimal, dayData, showDST);
}

// Events
document.getElementById('time-slider').addEventListener('input', (e) => {
  currentTimeDecimal = parseFloat(e.target.value);
  document.getElementById('selected-time').textContent = formatTime(currentTimeDecimal);
  updateVisualization();
});

document.getElementById('city-select').addEventListener('change', updateVisualization);
document.getElementById('month-select').addEventListener('change', updateVisualization);
document.getElementById('dst-toggle').addEventListener('change', updateVisualization);

function formatTime(value) {
  const hours = Math.floor(value);
  const minutes = (value % 1 === 0.5) ? '30' : '00';
  const period = hours < 12 ? 'AM' : 'PM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${minutes} ${period}`;
}

// Start
window.addEventListener('load', () => {
  loadSunData();
  resizeCanvas();

  const tickContainer = document.getElementById('tick-labels');
  tickContainer.innerHTML = '';
  ['12am','3am','6am','9am','12pm','3pm','6pm','9pm','12am'].forEach(label => {
    const span = document.createElement('span');
    span.textContent = label;
    span.style.cssText = 'font-size: 11px; color: var(--color-text-tertiary);';
    tickContainer.appendChild(span);
  });
});