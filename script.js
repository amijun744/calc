const display = document.getElementById('display');

// Adds numbers/operators to the screen
function appendToDisplay(input) {
    display.value += input;
}

// Clears everything
function clearDisplay() {
    display.value = "";
}

// Deletes the last character typed
function deleteLast() {
    display.value = display.value.slice(0, -1);
}

// Main calculation logic
function calculate() {
    try {
        // Use eval safely for simple calculator strings
        let result = eval(display.value);
        
        // Check if result is a number and fix decimals
        if (!isNaN(result)) {
            display.value = Number.isInteger(result) ? result : result.toFixed(4);
        }
    } catch (error) {
        display.value = "Error";
        setTimeout(clearDisplay, 1500); // Reset after error
    }
}

/* --- Scientific Functions --- */

function calculateSqrt() {
    if (display.value) {
        display.value = Math.sqrt(eval(display.value)).toFixed(4);
    }
}

function calculateSin() {
    if (display.value) {
        // Converts degrees to radians
        display.value = Math.sin(eval(display.value) * (Math.PI / 180)).toFixed(4);
    }
}

function calculateCos() {
    if (display.value) {
        // Converts degrees to radians
        display.value = Math.cos(eval(display.value) * (Math.PI / 180)).toFixed(4);
    }
}