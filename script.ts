/** 
 * Ultima Pro Scientific - TypeScript Implementation
 */

interface HistoryItem {
    timestamp: string;
    equation: string;
    result: string | number;
}

interface UnitMap {
    [key: string]: { [unit: string]: number };
}

// Global Selectors with Type Casting
const display = document.getElementById('display') as HTMLInputElement;
const currentHistory = document.getElementById('current-history') as HTMLDivElement;
const historyList = document.getElementById('history-list') as HTMLDivElement;
const glow = document.getElementById('glow') as HTMLDivElement;

let myChart: any = null;
let currentMode: 'calc' | 'convert' = 'calc';
let memoryValue: number = 0;
let calculationHistory: HistoryItem[] = JSON.parse(localStorage.getItem('calc_history') || '[]');

const units: UnitMap = {
    currency: { 'USD': 1, 'EUR': 0.92, 'BTC': 0.000015, 'AED': 3.67 },
    length: { 'Meters': 1, 'KM': 0.001, 'Miles': 0.000621, 'Feet': 3.28 }
};

// --- INITIALIZATION ---
window.onload = (): void => {
    renderHistory();
};

// --- INTERACTIVE UI ---
document.addEventListener('mousemove', (e: MouseEvent): void => {
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
});

const playClick = (): void => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.1);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
};

// --- PERSISTENCE ---
const saveCalculation = (eq: string, res: string | number): void => {
    const entry: HistoryItem = {
        timestamp: new Date().toLocaleTimeString(),
        equation: eq,
        result: res
    };
    calculationHistory.unshift(entry);
    if (calculationHistory.length > 50) calculationHistory.pop();
    localStorage.setItem('calc_history', JSON.stringify(calculationHistory));
    renderHistory();
};

const renderHistory = (): void => {
    historyList.innerHTML = calculationHistory.map(item => `
        <div class="history-item">
            <span>${item.timestamp}</span>
            ${item.equation} = <strong>${item.result}</strong>
        </div>
    `).join('');
};

// --- GRAPHING ENGINE ---
const toggleGraph = (): void => {
    const panel = document.getElementById('graph-panel') as HTMLDivElement;
    panel.classList.toggle('active');
    if (panel.classList.contains('active')) drawGraph();
};

const drawGraph = (): void => {
    const canvas = document.getElementById('mathChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let xValues: number[] = [];
    let yValues: (number | null)[] = [];
    let expr: string = display.value.replace(/sin/g, 'Math.sin').replace(/cos/g, 'Math.cos');

    for (let x = -10; x <= 10; x += 0.5) {
        xValues.push(x);
        try {
            yValues.push(eval(expr.replace(/x/g, `(${x})`)));
        } catch {
            yValues.push(null);
        }
    }

    if (myChart) myChart.destroy();
    myChart = new (window as any).Chart(ctx, {
        type: 'line',
        data: {
            labels: xValues,
            datasets: [{
                label: `f(x) = ${display.value}`,
                data: yValues,
                borderColor: '#00f2ff',
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
};

// --- MAIN LOGIC ---
const calculate = (): void => {
    if (currentMode === 'calc') {
        try {
            const rawExpr: string = display.value;
            let res: any = eval(rawExpr.replace(/sin/g, 'Math.sin').replace(/cos/g, 'Math.cos'));
            res = Number.isInteger(res) ? res : res.toFixed(4);
            
            currentHistory.innerText = `${rawExpr} =`;
            saveCalculation(rawExpr, res);
            display.value = res.toString();
        } catch {
            display.value = "Error";
        }
    } else {
        // Converter Logic
        const type = (document.getElementById('unit-type') as HTMLSelectElement).value;
        const from = (document.getElementById('from-unit') as HTMLSelectElement).value;
        const to = (document.getElementById('to-unit') as HTMLSelectElement).value;
        const val = parseFloat(display.value);
        
        if (!isNaN(val)) {
            const res = (val / units[type][from]) * units[type][to];
            display.value = res.toFixed(2);
        }
    }
};

// Global Exposure (Necessary if not using a bundler)
(window as any).appendToDisplay = (val: string) => { playClick(); display.value += val; };
(window as any).clearDisplay = () => { display.value = ""; };
(window as any).setTheme = (t: string) => { document.body.className = `theme-${t}`; };
(window as any).toggleMode = () => {
    const ctrl = document.getElementById('converter-controls') as HTMLDivElement;
    currentMode = (currentMode === 'calc') ? 'convert' : 'calc';
    ctrl.style.display = (currentMode === 'convert') ? 'flex' : 'none';
};