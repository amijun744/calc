const display = document.getElementById('display');
const historyBox = document.getElementById('history');
const glow = document.getElementById('glow');

let memoryValue = 0;

// Dynamic Mouse Glow
document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
});

// Audio Feedback (Short sine wave beep)
function playClick() {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start();
    osc.stop(context.currentTime + 0.1);
}

function appendToDisplay(val) {
    playClick();
    display.value += val;
}

function clearDisplay() {
    playClick();
    display.value = "";
}

function calculate() {
    try {
        let result = eval(display.value);
        historyBox.innerText = display.value + " =";
        display.value = Number.isInteger(result) ? result : result.toFixed(4);
    } catch {
        display.value = "Error";
    }
}

// Memory Functions
function memoryAdd() { memoryValue += parseFloat(display.value || 0); clearDisplay(); }
function memoryRecall() { display.value = memoryValue; }
function memoryClear() { memoryValue = 0; }

// Theme Logic
function setTheme(theme) {
    document.body.className = 'theme-' + theme;
}

// Advanced Math
function calculateFact() {
    let n = parseInt(display.value);
    let f = 1;
    for(let i=1; i<=n; i++) f *= i;
    display.value = f;
}

function calculateSqrt() { display.value = Math.sqrt(eval(display.value)).toFixed(4); }
function calculateLog() { display.value = Math.log10(eval(display.value)).toFixed(4); }
function calculateSin() { display.value = Math.sin(eval(display.value) * Math.PI/180).toFixed(4); }
function calculateCos() { display.value = Math.cos(eval(display.value) * Math.PI/180).toFixed(4); }