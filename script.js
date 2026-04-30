const display = document.getElementById('display');
const currentHistory = document.getElementById('current-history');
const historyList = document.getElementById('history-list');
const glow = document.getElementById('glow');
let myChart = null;
let currentMode = 'calc';
let memoryValue = 0;
let calculationHistory = JSON.parse(localStorage.getItem('calc_history')) || [];

// Load stored history on startup
window.onload = () => { renderHistory(); };

// --- CORE UTILS ---
document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
});

function playClick() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(500, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.1);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.1);
}

// --- PERSISTENT HISTORY ENGINE ---
function toggleHistory() { document.getElementById('history-sidebar').classList.toggle('active'); }

function saveCalculation(eq, res) {
    const entry = { timestamp: new Date().toLocaleTimeString(), equation: eq, result: res };
    calculationHistory.unshift(entry); // Add to start
    if(calculationHistory.length > 50) calculationHistory.pop(); // Cap at 50
    localStorage.setItem('calc_history', JSON.stringify(calculationHistory));
    renderHistory();
}

function renderHistory() {
    historyList.innerHTML = calculationHistory.map(item => `
        <div class="history-item">
            <span>${item.timestamp}</span>
            ${item.equation} = <strong>${item.result}</strong>
        </div>
    `).join('');
}

function clearHistory() {
    calculationHistory = [];
    localStorage.removeItem('calc_history');
    renderHistory();
}

// --- EXPORT TO CSV ---
function exportToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,Time,Equation,Result\n";
    calculationHistory.forEach(r => {
        csvContent += `${r.timestamp},"${r.equation}",${r.result}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Calculations_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// --- CALCULATOR LOGIC ---
function calculate() {
    if (currentMode === 'calc') {
        try {
            const rawExpr = display.value;
            let expr = rawExpr.replace(/sin/g, 'Math.sin').replace(/cos/g, 'Math.cos');
            let res = eval(expr);
            res = Number.isInteger(res) ? res : res.toFixed(4);
            
            currentHistory.innerText = rawExpr + " =";
            saveCalculation(rawExpr, res); // Persist
            display.value = res;
        } catch { display.value = "Error"; }
    }
}

// (Include previous Graphing, Theme, and Mode Toggle functions here)
function appendToDisplay(val) { playClick(); display.value += val; }
function clearDisplay() { display.value = ""; currentHistory.innerText = "Ready"; }
function setTheme(t) { document.body.className = 'theme-' + t; }

function toggleGraph() {
    const panel = document.getElementById('graph-panel');
    panel.classList.toggle('active');
    if (panel.classList.contains('active')) drawGraph();
}

function drawGraph() {
    const ctx = document.getElementById('mathChart').getContext('2d');
    let xValues = []; let yValues = [];
    let expr = display.value.replace(/sin/g, 'Math.sin').replace(/cos/g, 'Math.cos');

    for (let x = -10; x <= 10; x += 0.5) {
        xValues.push(x);
        try { yValues.push(eval(expr.replace(/x/g, `(${x})`))); } catch (e) { yValues.push(null); }
    }
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xValues,
            datasets: [{ label: `f(x) = ${display.value}`, data: yValues, borderColor: '#00f2ff', tension: 0.4 }]
        }
    });
}