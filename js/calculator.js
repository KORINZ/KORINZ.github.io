let currentInput = '';
let operator = null;
let firstInput = '';
let previousAnswer = null;

function updateDisplay() {
    document.getElementById('display').value = currentInput
}

function appendNumber(number) {
    // Check if the current input is "-" or empty
    if (currentInput === '-' || !currentInput) {
        if (number === '0.' && currentInput.includes('.')) return;
    } else if (currentInput) {
        if (number === '0.') number = '.';
    }

    currentInput = currentInput + number;

    updateDisplay();
}



function clearDisplay() {
    currentInput = '';
    operator = null;
    firstInput = '';
    // Get current log content
    var log = document.getElementById('calculation-log');
    var logContent = log.value.trim().split('\n');
    // Check if the last line is already a dashed line
    if (logContent[logContent.length - 1] !== '-----------------') {
        addToLog('-----------------', ''); // Add a dashed line to the log when 'All Clear' is pressed
    }
    updateDisplay();
}


function chooseOperator(op) {
    if (op === '-' && currentInput === '') {
        currentInput += op;
        updateDisplay();
        return;
    }
    if (op === '+' && currentInput === '-') {
        currentInput = '';
        updateDisplay();
        return;
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
    let result
    const prev = parseFloat(firstInput)
    const current = parseFloat(currentInput)
    if (isNaN(prev) || isNaN(current)) return
    switch (operator) {
        case '+':
            result = prev + current
            break
        case '-':
            result = prev - current
            break
        case '*':
            result = prev * current
            break
        case '/':
            if (current === 0) {
                alert("Cannot divide by zero!\n0で割ることはできません！");
                clearDisplay()
                return
            }
            result = prev / current
            break
        default:
            return
    }
    // Round the result to 6 decimal places
    result = parseFloat(result.toFixed(6))
    currentInput = result.toString()

    // Check if the firstInput is the same as the previous answer
    const logFirstInput = (firstInput === previousAnswer) ? 'Ans' : firstInput;
    // Add parentheses around negative numbers in a subtraction operation
    const logCurrent = (operator === '-' && current < 0) ? '(' + current + ')' : current;

    // Add the calculation to the log before clearing the operator and first input
    addToLog(logFirstInput + ' ' + operator + ' ' + logCurrent, currentInput);

    // Update the previousAnswer variable with the new result
    previousAnswer = currentInput;

    operator = null
    firstInput = ''
    updateDisplay()
}


window.onload = function () {
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

function addToLog(calculation, result) {
    var log = document.getElementById('calculation-log');
    log.value += calculation + (result ? ' = ' + result : '') + '\n';
    log.scrollTop = log.scrollHeight; // Scroll to the bottom
}

// TODO make = works again and again
// TODO add delete right most number button
// TODO after click =, click a number should reset the display and put the new number