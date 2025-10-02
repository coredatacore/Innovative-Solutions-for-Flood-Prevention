/* ========= Interactive Header Color Cycle ========= */
const header = document.getElementById('header');
const colors = ['#004a99', '#1f6feb', '#0f766e', '#b45309', '#be123c'];
let currentColorIndex = 0;
header.addEventListener('click', () => {
  currentColorIndex = (currentColorIndex + 1) % colors.length;
  header.style.backgroundColor = colors[currentColorIndex];
});

/* ========= Smooth nav active state ========= */
const navLinks = [...document.querySelectorAll('#topnav a')];
const sections = navLinks.map(a => document.querySelector(a.getAttribute('href')));
const onScroll = () => {
  const pos = window.scrollY + 100;
  sections.forEach((sec, i) => {
    const link = navLinks[i];
    if (!sec) return;
    const top = sec.offsetTop, bottom = top + sec.offsetHeight;
    link.classList.toggle('active', pos >= top && pos < bottom);
  });
};
document.addEventListener('scroll', onScroll);

/* ========= Flood Alerts interactions ========= */
const riskSpan = document.getElementById('current-risk');
document.querySelectorAll('.alert-color').forEach(btn => {
  btn.addEventListener('click', () => {
    riskSpan.textContent = btn.dataset.risk;
  });
});

/* ========= Leaflet Map ========= */
(function initMap(){
  const map = L.map('map').setView([8.5981, 123.3489], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:'&copy; OpenStreetMap contributors'
  }).addTo(map);

  const marker = L.marker([8.5981, 123.3489]).addTo(map);
  marker.bindPopup('<b>Minaog River Forest</b><br>Dipolog City, Zamboanga del Norte').openPopup();
})();

/* ========= Real-time (dummy) water level + Chart ========= */
const waterLevelEl = document.getElementById('water-level');
const levelCtx = document.getElementById('water-level-chart').getContext('2d');

const timeLabels = ['08:00','10:00','12:00','14:00','16:00','18:00','20:00'];
const levelData = [2.4, 2.8, 3.1, 3.2, 3.35, 3.1, 2.9];

const waterLevelChart = new Chart(levelCtx, {
  type: 'line',
  data: {
    labels: timeLabels,
    datasets: [{
      label: 'Water Level (m)',
      data: levelData,
      tension: 0.3,
      pointRadius: 3
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: true }
    },
    scales: {
      y: { title: { display: true, text: 'meters' } },
      x: { title: { display: true, text: 'time' } }
    }
  }
});

// Simulate a small update every 10s (demo)
setInterval(() => {
  const next = +(levelData[levelData.length-1] + (Math.random()*0.2 - 0.1)).toFixed(2);
  const nextLabel = new Date().toTimeString().slice(0,5);
  timeLabels.push(nextLabel); levelData.push(next);
  if (timeLabels.length > 12){ timeLabels.shift(); levelData.shift(); }
  waterLevelChart.update();
  waterLevelEl.textContent = `${next} meters`;
}, 10000);

/* ========= Forecast Chart (dummy 7-day) ========= */
const forecastCtx = document.getElementById('forecast-chart').getContext('2d');
const days = ['Day 1','Day 2','Day 3','Day 4','Day 5','Day 6','Day 7'];
const forecast = [10, 25, 40, 60, 55, 30, 20]; // % chance of river rise
new Chart(forecastCtx, {
  type: 'bar',
  data: { labels: days, datasets: [{ label: 'Chance of High Water (%)', data: forecast }] },
  options: {
    responsive:true,
    scales:{ y:{ beginAtZero:true, max:100 } },
    plugins:{ legend:{ display:true } }
  }
});

/* ========= SMS Subscribe (quick demo) ========= */
document.getElementById('btn-subscribe-sms').addEventListener('click', () => {
  const status = document.getElementById('sms-status');
  status.textContent = 'Subscribed (demo). You will receive alerts for Code Yellow and above.';
});

/* ========= SMS Form (mock) ========= */
document.getElementById('sms-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const phone = document.getElementById('sms-phone').value.trim();
  const terms = document.getElementById('sms-terms').checked;
  const out = document.getElementById('sms-form-status');
  if (!/^\+?\d[\d\s\-]{8,}$/.test(phone) || !terms) {
    out.textContent = 'Please enter a valid number and accept the terms.';
    return;
    }
  out.textContent = 'SMS alerts enabled (demo).';
});

/* ========= Historical CSV (generate + preview) ========= */
const makeDummyCSV = () => {
  // 3 days, 24 readings, 2 stations (demo)
  const rows = [['timestamp','station_id','water_level_m']];
  const start = new Date(); start.setHours(start.getHours()-72);
  for (let i=0;i<72;i++){
    const t = new Date(start.getTime() + i*3600*1000).toISOString();
    const s1 = (2.0 + Math.sin(i/6)*0.6 + Math.random()*0.1).toFixed(2);
    const s2 = (2.3 + Math.cos(i/7)*0.7 + Math.random()*0.1).toFixed(2);
    rows.push([t,'MNG-01',s1]);
    rows.push([t,'MNG-02',s2]);
  }
  return rows.map(r=>r.join(',')).join('\n');
};

const downloadCSV = (filename, text) => {
  const blob = new Blob([text], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  URL.revokeObjectURL(url); a.remove();
};

document.getElementById('btn-download-csv').addEventListener('click', () => {
  downloadCSV('historical_water_levels.csv', makeDummyCSV());
});

const previewWrap = document.getElementById('csv-preview');
document.getElementById('btn-preview-csv').addEventListener('click', () => {
  const csv = makeDummyCSV();
  const lines = csv.split('\n').slice(0, 21); // show ~10 rows (2 stations/ts)
  const table = document.createElement('table');
  const [header, ...rows] = lines.map(l=>l.split(','));
  const thead = document.createElement('thead'); const trh = document.createElement('tr');
  header.forEach(h=>{ const th=document.createElement('th'); th.textContent=h; trh.appendChild(th); });
  thead.appendChild(trh);
  const tbody = document.createElement('tbody');
  rows.forEach(r=>{
    const tr=document.createElement('tr');
    r.forEach(c=>{ const td=document.createElement('td'); td.textContent=c; tr.appendChild(td); });
    tbody.appendChild(tr);
  });
  table.append(thead,tbody);
  previewWrap.innerHTML=''; previewWrap.appendChild(table);
});

/* ========= View Historical button (scroll to section) ========= */
document.getElementById('btn-view-historical').addEventListener('click', () => {
  document.querySelector('#historical-data').scrollIntoView({behavior:'smooth'});
});

/* ========= Small helpers ========= */
['btn-get-involved','btn-learn-more'].forEach(id=>{
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', ()=> alert('Thanks for your interest! (demo)'));
});
