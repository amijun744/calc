/** 
 * Ultima Pro Scientific - Corrected TypeScript Implementation
 */

// 1. Extend the Global Window Interface
// This tells TypeScript that these specific properties/libraries exist on 'window'
declare global {
    interface Window {
        Chart: any;
        appendToDisplay: (val: string) => void;
        clearDisplay: () => void;
        setTheme: (t: string) => void;
        toggleMode: () => void;
        calculateSin: () => void;
        calculateCos: () => void;
        calculateSqrt: () => void;
        calculateFact: () => void;
    }
}

interface HistoryItem {
    timestamp: string;
    equation: string;
    result: string | number;
}

interface UnitMap {
    [key: string]: { [unit: string]: number };
}

// Global Selectors with proper Null Checks
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

// --- CORE UTILS ---
window.onload = (): void => { renderHistory(); };

document.addEventListener('mousemove', (e: MouseEvent): void => {
    if (glow) {
        glow.style.left = `${e.clientX}px`;
        glow.style.top = `${e.clientY}px`;
    }
});

const playClick = (): void => {
    try {
        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.1);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    } catch (e) { console.log("Audio not supported"); }
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
    if (historyList) {
        historyList.innerHTML = calculationHistory.map(item => `
            <div class="history-item">
                <span>${item.timestamp}</span>
                ${item.equation} = <strong>${item.result}</strong>
            </div>
        `).join('');
    }
};

// --- GRAPHING ENGINE ---
// Defined globally to be accessible from HTML onclick
(window as any).toggleGraph = (): void => {
    const panel = document.getElementById('graph-panel') as HTMLDivElement;
    panel.classList.toggle('active');
    if (panel.classList.contains('active')) drawGraph();
};

const drawGraph = (): void => {
    const canvas = document.getElementById('mathChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let xValues: number[] = [];
    let yValues: (number | null)[] = [];
    
    // Safety check for empty display
    const expressionText = display.value || "0";
    let expr: string = expressionText.replace(/sin/g, 'Math.sin').replace(/cos/g, 'Math.cos');

    for (let x = -10; x <= 10; x += 0.5) {
        xValues.push(x);
        try {
            // Using Function constructor instead of direct eval for slight safety boost
            const func = new Function('x', `return ${expr}`);
            const result = func(x);
            yValues.push(isFinite(result) ? result : null);
        } catch {
            yValues.push(null);
        }
    }

    if (myChart) myChart.destroy();
    myChart = new window.Chart(ctx, {
        type: 'line',
        data: {
            labels: xValues,
            datasets: [{
                label: `f(x) = ${expressionText}`,
                data: yValues,
                borderColor: '#00f2ff',
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
};

// --- CALCULATOR OPERATIONS ---
window.calculate = (): void => {
    if (currentMode === 'calc') {
        try {
            const rawExpr: string = display.value;
            // Safer evaluation pattern
            const safeExpr = rawExpr.replace(/sin/g, 'Math.sin').replace(/cos/g, 'Math.cos').replace(/π/g, 'Math.PI');
            let res: any = new Function(`return ${safeExpr}`)();
            
            res = Number.isInteger(res) ? res : parseFloat(res.toFixed(4));
            
            currentHistory.innerText = `${rawExpr} =`;
            saveCalculation(rawExpr, res);
            display.value = res.toString();
        } catch {
            display.value = "Error";
        }
    }
};

// Expose functions to the HTML window scope
window.appendToDisplay = (val: string) => { playClick(); display.value += val; };
window.clearDisplay = () => { display.value = ""; currentHistory.innerText = "Ready"; };
window.setTheme = (t: string) => { document.body.className = `theme-${t}`; };
window.toggleMode = () => {
    const ctrl = document.getElementById('converter-controls') as HTMLDivElement;
    currentMode = (currentMode === 'calc') ? 'convert' : 'calc';
    if (ctrl) ctrl.style.display = (currentMode === 'convert') ? 'flex' : 'none';
};

// Scientific functions
window.calculateSin = () => { display.value = Math.sin(parseFloat(display.value)).toFixed(4); };
window.calculateCos = () => { display.value = Math.cos(parseFloat(display.value)).toFixed(4); };
window.calculateSqrt = () => { display.value = Math.sqrt(parseFloat(display.value)).toFixed(4); };