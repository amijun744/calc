const display = document.getElementById('display');
const historyBox = document.getElementById('history');
const glow = document.getElementById('glow');

let currentMode = 'calc';
let memoryValue = 0;

const units = {
    currency: { 'USD': 1, 'EUR': 0.92, 'BTC': 0.000015, 'AED': 3.67, 'SAR': 3.75 },
    length: { 'Meters': 1, 'KM': 0.001, 'Miles': 0.000621, 'Feet': 3.28 },
    weight: { 'KG': 1, 'LBS': 2.204, 'Grams': 1000, 'Ounces': 35.27 }
};

// 1. Interactive Mouse Glow
document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
});

// 2. Audio Feedback Engine
function playClick() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(500, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.1);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.1);
}

// 3. Mode Toggle Logic
function toggleMode() {
    const controls = document.getElementById('converter-controls');
    const btn = document.getElementById('mode-btn');
    if (currentMode === 'calc') {
        currentMode = 'convert';
        controls.style.display = 'flex';
        btn.innerText = 'Calculator Mode';
        updateUnitOptions();
    } else {
        currentMode = 'calc';
        controls.style.display = 'none';
        btn.innerText = 'Converter Mode';
    }
}

function updateUnitOptions() {
    const type = document.getElementById('unit-type').value;
    const from = document.getElementById('from-unit');
    const to = document.getElementById('to-unit');
    let opts = Object.keys(units[type]).map(u => `<option value="${u}">${u}</option>`).join('');
    from.innerHTML = opts; to.innerHTML = opts;
}

// 4. Core Calculator Actions
function appendToDisplay(val) { playClick(); display.value += val; }
function clearDisplay() { playClick(); display.value = ""; historyBox.innerText = "Cleared"; }
function deleteLast() { display.value = display.value.slice(0, -1); }

function calculate() {
    if (currentMode === 'calc') {
        try {
            let res = eval(display.value);
            historyBox.innerText = display.value + " =";
            display.value = Number.isInteger(res) ? res : res.toFixed(4);
        } catch { display.value = "Error"; }
    } else {
        const type = document.getElementById('unit-type').value;
        const from = document.getElementById('from-unit').value;
        const to = document.getElementById('to-unit').value;
        const val = parseFloat(display.value);
        if (isNaN(val)) return;
        const res = (val / units[type][from]) * units[type][to];
        historyBox.innerText = `${val} ${from} to ${to}`;
        display.value = res.toFixed(type === 'currency' ? 2 : 4);
    }
}

// 5. Memory & Themes
function memoryAdd() { memoryValue += parseFloat(display.value || 0); clearDisplay(); }
function memoryRecall() { display.value = memoryValue; }
function memoryClear() { memoryValue = 0; }
function setTheme(t) { document.body.className = 'theme-' + t; }

// 6. Scientific Logic
function calculateFact() {
    let n = parseInt(display.value);
    let f = 1; for(let i=1; i<=n; i++) f *= i;
    display.value = f;
}
function calculateSqrt() { display.value = Math.sqrt(eval(display.value)).toFixed(4); }
function calculateLog() { display.value = Math.log10(eval(display.value)).toFixed(4); }
function calculateSin() { display.value = Math.sin(eval(display.value) * Math.PI/180).toFixed(4); }
function calculateCos() { display.value = Math.cos(eval(display.value) * Math.PI/180).toFixed(4); }