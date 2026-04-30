const display = document.getElementById('display');
const historyBox = document.getElementById('history');
const glow = document.getElementById('glow');
let myChart = null;
let currentMode = 'calc';
let memoryValue = 0;

const units = {
    currency: { 'USD': 1, 'EUR': 0.92, 'BTC': 0.000015, 'AED': 3.67, 'SAR': 3.75 },
    length: { 'Meters': 1, 'KM': 0.001, 'Miles': 0.000621, 'Feet': 3.28 },
    weight: { 'KG': 1, 'LBS': 2.204, 'Grams': 1000, 'Ounces': 35.27 }
};

// 1. Cursor Glow Effect
document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
});

// 2. Audio Engine
function playClick() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(500, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.1);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.1);
}

// 3. Graphing Logic
function toggleGraph() {
    const panel = document.getElementById('graph-panel');
    panel.classList.toggle('active');
    if (panel.classList.contains('active')) drawGraph();
}

function drawGraph() {
    const ctx = document.getElementById('mathChart').getContext('2d');
    let xValues = [];
    let yValues = [];
    
    // Replace human readable math with JS Math object
    let expr = display.value.replace(/sin/g, 'Math.sin').replace(/cos/g, 'Math.cos').replace(/log/g, 'Math.log10');

    for (let x = -10; x <= 10; x += 0.5) {
        xValues.push(x);
        try {
            // Evaluates the expression by replacing x with the current loop value
            let val = eval(expr.replace(/x/g, `(${x})`));
            yValues.push(val);
        } catch (e) { yValues.push(null); }
    }

    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xValues,
            datasets: [{
                label: `f(x) = ${display.value}`,
                data: yValues,
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });
}

// 4. Core Calculator & Mode Switching
function appendToDisplay(val) { playClick(); display.value += val; }
function clearDisplay() { playClick(); display.value = ""; }
function calculate() {
    if (currentMode === 'calc') {
        try {
            let res = eval(display.value.replace(/sin/g, 'Math.sin').replace(/cos/g, 'Math.cos'));
            historyBox.innerText = display.value + " =";
            display.value = Number.isInteger(res) ? res : res.toFixed(4);
        } catch { display.value = "Error"; }
    } else {
        const type = document.getElementById('unit-type').value;
        const from = document.getElementById('from-unit').value;
        const to = document.getElementById('to-unit').value;
        const res = (parseFloat(display.value) / units[type][from]) * units[type][to];
        display.value = res.toFixed(2);
    }
}

function toggleMode() {
    const controls = document.getElementById('converter-controls');
    currentMode = (currentMode === 'calc') ? 'convert' : 'calc';
    controls.style.display = (currentMode === 'convert') ? 'flex' : 'none';
    if(currentMode === 'convert') updateUnitOptions();
}

function updateUnitOptions() {
    const type = document.getElementById('unit-type').value;
    const from = document.getElementById('from-unit');
    const to = document.getElementById('to-unit');
    let opts = Object.keys(units[type]).map(u => `<option value="${u}">${u}</option>`).join('');
    from.innerHTML = opts; to.innerHTML = opts;
}

// 5. Themes & Memory
function setTheme(t) { document.body.className = 'theme-' + t; }
function memoryAdd() { memoryValue += parseFloat(display.value || 0); clearDisplay(); }
function memoryRecall() { display.value = memoryValue; }
function memoryClear() { memoryValue = 0; }