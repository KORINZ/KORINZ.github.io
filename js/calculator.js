let currentInput = ''
let operator = null
let firstInput = ''

function appendNumber(number) {
    if (number === '.' && currentInput.includes('.')) return
    if (currentInput === '0' && number !== '.') {
        currentInput = number.toString()
    } else {
        currentInput = currentInput.toString() + number.toString()
    }
    updateDisplay()
}


function clearDisplay() {
    currentInput = ''
    operator = null
    firstInput = ''
    updateDisplay()
}

function chooseOperator(op) {
    if (currentInput === '.' || firstInput === '.') {
        alert("Invalid input! Please enter a valid number.\n無効な入力です！有効な数値を入力してください。");
        clearDisplay();
        return;
    }
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
    let resultStr = result.toString()
    let decimalIndex = resultStr.indexOf('.')
    if (decimalIndex !== -1 && resultStr.length > decimalIndex + 10) {
        resultStr = resultStr.substring(0, decimalIndex + 10)
    }
    currentInput = resultStr
    operator = null
    firstInput = ''
    updateDisplay()
}



function updateDisplay() {
    document.getElementById('display').value = currentInput
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

