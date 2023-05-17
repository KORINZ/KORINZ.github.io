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
    if (currentInput !== '') {
        if (firstInput !== '') {
            calculate();
        }
    }
    if (op === '-' && currentInput === '') {
        currentInput += op;
        updateDisplay();
        return;
    }
    firstInput = currentInput;
    currentInput = '';
    operator = op;
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
