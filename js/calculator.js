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
    if (currentInput !== '') {
        if (firstInput !== '') {
            calculate()
        } else {
            firstInput = currentInput
            currentInput = ''
        }
    }
    operator = op
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
                alert("Cannot divide by zero!")
                clearDisplay()
                return
            }
            result = prev / current
            break
        default:
            return
    }
    currentInput = Number(result.toFixed(10)).toString()
    operator = null
    firstInput = ''
    updateDisplay()
}


function updateDisplay() {
    document.getElementById('display').value = currentInput
}
