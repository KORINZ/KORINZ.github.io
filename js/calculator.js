let currentInput = ''; // Represents the current numerical input value that's being typed by the user.
let operator = null; // Stores the current mathematical operator (e.g., '+', '-', '*', '/') selected by the user.
let firstInput = ''; // Stores the first numerical input provided by the user before an operator is chosen.
let previousAnswer = null; // Holds the result of the previous calculation, allowing it to be used in the next operation if desired.
let lastOperation = null; // Stores the last operation performed. Useful for repeating the last operation when the equals button is pressed multiple times.
let lastNumber = null; // Holds the last number used in an operation. Useful for repeating the last operation when the equals button is pressed multiple times.
let newInputAfterEquals = false; // A boolean flag that is set to `true` right after an equals operation. It helps in managing the flow of calculation, especially when a new operation is started after pressing equals.



function updateDisplay() {
    // Get your display element
    let display = document.getElementById('display');

    if (currentInput === 'Infinity') {
        // Set the innerHTML of the display to an infinity symbol
        display.innerHTML = '<i class="fa-solid fa-infinity"></i>';
    } else if (currentInput === '-Infinity') {
        // Set the innerHTML of the display to a negative infinity symbol
        display.innerHTML = '-<i class="fa-solid fa-infinity"></i>';
    } else {
        // Set the text content of the display to the current input
        display.textContent = currentInput;
    }
}


function clearDisplay() {
    currentInput = '';
    operator = null;
    firstInput = '';
    previousAnswer = null;
    lastOperation = null;
    lastNumber = null;
    newInputAfterEquals = false;
    // Get current log content
    var log = document.getElementById('calculation-log');
    var logContent = log.value.trim();
    // Check if the log is not empty and if the last line is not already a dashed line
    if (logContent !== '' && logContent.split('\n')[logContent.split('\n').length - 1] !== '-----------------') {
        addToLog('-----------------', ''); // Add a dashed line to the log when 'All Clear' is pressed
    }
    updateDisplay();
}


function deleteNumber() {
    // Get your display element
    let display = document.getElementById('display');

    if (newInputAfterEquals) {
        firstInput = '';
        operator = null;
        newInputAfterEquals = false;
    }

    if (display.innerHTML.includes('<i class="fa-solid fa-infinity"></i>')) {
        display.innerHTML = '';
        currentInput = '';
        firstInput = '';
        previousAnswer = null;
    } else if (currentInput) {
        currentInput = currentInput.slice(0, -1);
    } else if (previousAnswer && !currentInput) {
        currentInput = previousAnswer.slice(0, -1);
        firstInput = '';
        previousAnswer = null;
    } else if (firstInput && !currentInput) {
        operator = null;
        currentInput = firstInput.slice(0, -1);
    }

    updateDisplay();
}


function appendNumber(number) {
    if (newInputAfterEquals) {
        currentInput = '';
        firstInput = '';
        operator = null;
        newInputAfterEquals = false;
    }
    if (number === '0.') {
        if (currentInput === '' || currentInput === '0') {
            number = '0.';
        } else if (currentInput.includes('.')) {
            return;
        } else {
            number = '.';
        }
    }
    if (number === '0' && currentInput === '0' && !currentInput.includes('.')) {
        return;
    }
    if (number !== '0' && currentInput === '0' && !currentInput.includes('.')) {
        currentInput = number;
    } else {
        currentInput += number;
    }
    updateDisplay();
}


function changeSign() {
    if (currentInput) {
        currentInput = currentInput.includes('-') ? currentInput.replace('-', '') : '-' + currentInput;
        updateDisplay();
    }
    else if (previousAnswer) {
        currentInput = previousAnswer.includes('-') ? previousAnswer.replace('-', '') : '-' + previousAnswer;
        firstInput = null;
        previousAnswer = null;
        updateDisplay();
    }
    else {
        return;
    }
}


function equalsPressed() {
    if (currentInput !== '') {
        calculate();
    } else if (lastOperation && lastNumber) {
        firstInput = previousAnswer;
        currentInput = lastNumber.toString();
        operator = lastOperation;
        calculate();
    }
    newInputAfterEquals = true;
}


function chooseOperator(op) {
    if (newInputAfterEquals && previousAnswer) {
        firstInput = previousAnswer;
        currentInput = '';
        newInputAfterEquals = false;
    }
    if (currentInput !== '') {
        if (firstInput !== '') {
            calculate();
        }
    }
    if (currentInput === '') {
        operator = op; // Overwrite the operator if a new one is selected
    } else {
        firstInput = currentInput;
        currentInput = '';
        operator = op;
    }
}


function calculateSquareRoot() {
    let inputValue;
    let logInput;
    if (currentInput === '') {
        if (previousAnswer === null) {
            // No action if there's no previous answer
            return;
        } else {
            inputValue = parseFloat(previousAnswer);
            logInput = 'Ans'; // Use 'Ans' when calculating square root of previous answer
        }
    } else {
        inputValue = parseFloat(currentInput);
        logInput = currentInput; // Use the actual input value otherwise
    }

    if (inputValue < 0) {
        alert("Cannot take square root of a negative number!\n負の数の平方根は取れません！");
        return;
    }

    let result = Math.sqrt(inputValue);
    // Round the result to 6 decimal places
    result = parseFloat(result.toFixed(6));

    if (previousAnswer === currentInput) {
        logInput = 'Ans';
    }

    // Add the calculation to the log before updating the current input
    addToLog('√' + logInput, result);

    // Update the currentInput and previousAnswer variable with the new result
    currentInput = result.toString();
    previousAnswer = currentInput;

    operator = null;
    firstInput = '';
    updateDisplay();
}


function calculate() {
    // If newInputAfterEquals is true, start a new calculation
    if (newInputAfterEquals) {
        lastOperation = null;
        lastNumber = null;
        newInputAfterEquals = false;
    }

    let result;
    let prev = parseFloat(firstInput);
    let current = parseFloat(currentInput);

    if (isNaN(prev)) return;

    // If current is not a number (empty input) and lastOperation and lastNumber are set,
    // use them for the calculation
    if (isNaN(current) && lastOperation !== null && lastNumber !== null) {
        current = lastNumber;
        operator = lastOperation;
    } else if (isNaN(current)) {
        // If no second number entered, simply return and do nothing.
        return;
    } else {
        // Otherwise, if it's a legitimate calculation, save the operator and the second number
        lastOperation = operator;
        lastNumber = current;
    }

    switch (operator) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            if (current === 0) {
                alert("Cannot divide by zero!\n0で割ることはできません！");
                clearDisplay();
                return;
            }
            result = prev / current;
            break;
        default:
            return;
    }

    // Round the result to 6 decimal places
    result = parseFloat(result.toFixed(6));
    currentInput = result.toString();

    // Check if the firstInput is the same as the previous answer
    const logFirstInput = (firstInput === previousAnswer) ? 'Ans' : firstInput;

    // Add parentheses around negative numbers
    const logCurrent = (current < 0) ? '(' + current + ')' : current;

    // Add the calculation to the log before clearing the operator and first input
    addToLog(logFirstInput + ' ' + operator + ' ' + logCurrent, currentInput);

    // Update the previousAnswer variable with the new result
    previousAnswer = currentInput;

    // Store first input as the result of the operation for continuous operations
    firstInput = currentInput;
    updateDisplay();
    currentInput = '';
}

function storeLog() {
    let log = document.getElementById('calculation-log');
    localStorage.setItem('calculationLog', log.value);
}

function loadLog() {
    let storedLog = localStorage.getItem('calculationLog');
    let log = document.getElementById('calculation-log');
    if (storedLog) {
        log.value = storedLog;
    }
}

function clearLog() {
    let log = document.getElementById('calculation-log');
    log.value = '';
    localStorage.removeItem('calculationLog');
}

function addToLog(calculation, result) {
    let log = document.getElementById('calculation-log');
    log.value += calculation + (result ? ' = ' + result : '') + '\n';
    log.scrollTop = log.scrollHeight; // Scroll to the bottom
    storeLog();
}

window.onload = function () {
    loadLog();
    // Get all buttons with the 'calc-button' class
    const buttons = document.querySelectorAll('.calc-button');
    // Get all buttons with the 'operator-button' class
    const operatorButtons = document.querySelectorAll('.operator-button');

    // Add the 'click' event listener to all buttons
    buttons.forEach((button) => {
        button.addEventListener('click', function (event) {
            // Remove the 'calc-button-highlight' class from all operator buttons
            operatorButtons.forEach((button) => {
                button.classList.remove('calc-button-highlight');
            });
        });
    });

    // Add the 'click' event listener to operator buttons
    operatorButtons.forEach((button) => {
        button.addEventListener('click', function (event) {
            // Add the 'calc-button-highlight' class to the clicked operator button
            event.currentTarget.classList.add('calc-button-highlight');
        });
    });
};
