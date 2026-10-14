// Variables to store numbers and operation
let currentNumber = '0';
let previousNumber = '';
let operation = null;
let resetScreen = false;
let historyList = [];

// Get HTML elements
const currentDisplay = document.getElementById('current-op');
const previousDisplay = document.getElementById('previous-op');
const themeBtn = document.getElementById('theme-btn');
const historyListElement = document.getElementById('history-list');
const historyEmptyElement = document.getElementById('history-empty');
const clearHistoryBtn = document.getElementById('clear-history-btn');

// --- 1. Display Functions ---
function updateDisplay() {
  currentDisplay.textContent = currentNumber;
  if (operation !== null && previousNumber !== '') {
    previousDisplay.textContent = previousNumber + ' ' + operation;
  } else {
    previousDisplay.textContent = '';
  }
}

// --- 2. Number and Decimal Input ---
function appendNumber(number) {
  if (currentNumber === 'Cannot divide by zero') {
    clearAll();
  }

  if (resetScreen) {
    currentNumber = number;
    resetScreen = false;
  } else {
    if (currentNumber === '0') {
      currentNumber = number;
    } else {
      currentNumber = currentNumber + number;
    }
  }
  updateDisplay();
}

function appendDot() {
  if (resetScreen) {
    currentNumber = '0.';
    resetScreen = false;
    updateDisplay();
    return;
  }

  if (!currentNumber.includes('.')) {
    currentNumber = currentNumber + '.';
    updateDisplay();
  }
}

// --- 3. Operator and Calculation ---
function chooseOperation(op) {
  if (currentNumber === 'Cannot divide by zero') return;

  if (previousNumber !== '' && operation !== null && !resetScreen) {
    calculate();
  }

  operation = op;
  previousNumber = currentNumber;
  resetScreen = true;
  updateDisplay();
}

function calculate() {
  if (operation === null || previousNumber === '') return;

  let prev = parseFloat(previousNumber);
  let current = parseFloat(currentNumber);
  let result = 0;

  if (isNaN(prev) || isNaN(current)) return;

  if (operation === '+') {
    result = prev + current;
  } else if (operation === '−') {
    result = prev - current;
  } else if (operation === '×') {
    result = prev * current;
  } else if (operation === '÷') {
    if (current === 0) {
      currentNumber = 'Cannot divide by zero';
      previousNumber = '';
      operation = null;
      resetScreen = true;
      updateDisplay();
      return;
    }
    result = prev / current;
  }

  // Round floating point issues like 0.1 + 0.2
  result = Math.round(result * 10000000000) / 10000000000;

  let fullExpression = previousNumber + ' ' + operation + ' ' + currentNumber;
  saveHistory(fullExpression, result.toString());

  currentNumber = result.toString();
  previousDisplay.textContent = fullExpression + ' =';
  operation = null;
  previousNumber = '';
  resetScreen = true;
  updateDisplay();
}

// --- 4. Special Actions (Clear, Delete, Percent, Sign) ---
function clearAll() {
  currentNumber = '0';
  previousNumber = '';
  operation = null;
  resetScreen = false;
  updateDisplay();
}

function deleteLast() {
  if (currentNumber === 'Cannot divide by zero') {
    clearAll();
    return;
  }

  if (resetScreen) return;

  if (currentNumber.length > 1) {
    currentNumber = currentNumber.slice(0, -1);
  } else {
    currentNumber = '0';
  }
  updateDisplay();
}

function percentage() {
  let current = parseFloat(currentNumber);
  if (isNaN(current)) return;

  if (previousNumber !== '' && operation !== null) {
    let prev = parseFloat(previousNumber);
    let pct = (prev * current) / 100;
    currentNumber = pct.toString();
  } else {
    currentNumber = (current / 100).toString();
  }
  updateDisplay();
}

function toggleSign() {
  if (currentNumber === '0' || currentNumber === 'Cannot divide by zero') return;

  if (currentNumber.startsWith('-')) {
    currentNumber = currentNumber.substring(1);
  } else {
    currentNumber = '-' + currentNumber;
  }
  updateDisplay();
}

// --- 5. History Functions ---
function saveHistory(expr, res) {
  let item = { expression: expr, result: res };
  historyList.unshift(item);

  // Keep only last 10
  if (historyList.length > 10) {
    historyList.pop();
  }

  localStorage.setItem('calculator_history', JSON.stringify(historyList));
  renderHistory();
}

function loadHistory() {
  let saved = localStorage.getItem('calculator_history');
  if (saved) {
    historyList = JSON.parse(saved);
  } else {
    historyList = [];
  }
  renderHistory();
}

function renderHistory() {
  historyListElement.innerHTML = '';

  if (historyList.length === 0) {
    historyEmptyElement.style.display = 'block';
    return;
  }

  historyEmptyElement.style.display = 'none';

  for (let i = 0; i < historyList.length; i++) {
    let li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = '<span>' + historyList[i].expression + ' =</span><strong>' + historyList[i].result + '</strong>';
    
    // Click history item to reload result
    li.onclick = function() {
      currentNumber = historyList[i].result;
      previousNumber = '';
      operation = null;
      resetScreen = true;
      updateDisplay();
    };

    historyListElement.appendChild(li);
  }
}

clearHistoryBtn.onclick = function() {
  historyList = [];
  localStorage.removeItem('calculator_history');
  renderHistory();
};

// --- 6. Theme Toggle ---
themeBtn.onclick = function() {
  document.body.classList.toggle('light-theme');
  if (document.body.classList.contains('light-theme')) {
    themeBtn.textContent = 'Dark Mode';
    localStorage.setItem('calculator_theme', 'light');
  } else {
    themeBtn.textContent = 'Light Mode';
    localStorage.setItem('calculator_theme', 'dark');
  }
};

function loadTheme() {
  let savedTheme = localStorage.getItem('calculator_theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    themeBtn.textContent = 'Dark Mode';
  } else {
    document.body.classList.remove('light-theme');
    themeBtn.textContent = 'Light Mode';
  }
}

// --- 7. Button Click Event Handlers ---
document.getElementById('btn-0').onclick = function() { appendNumber('0'); };
document.getElementById('btn-1').onclick = function() { appendNumber('1'); };
document.getElementById('btn-2').onclick = function() { appendNumber('2'); };
document.getElementById('btn-3').onclick = function() { appendNumber('3'); };
document.getElementById('btn-4').onclick = function() { appendNumber('4'); };
document.getElementById('btn-5').onclick = function() { appendNumber('5'); };
document.getElementById('btn-6').onclick = function() { appendNumber('6'); };
document.getElementById('btn-7').onclick = function() { appendNumber('7'); };
document.getElementById('btn-8').onclick = function() { appendNumber('8'); };
document.getElementById('btn-9').onclick = function() { appendNumber('9'); };
document.getElementById('btn-dot').onclick = function() { appendDot(); };

document.getElementById('btn-add').onclick = function() { chooseOperation('+'); };
document.getElementById('btn-subtract').onclick = function() { chooseOperation('−'); };
document.getElementById('btn-multiply').onclick = function() { chooseOperation('×'); };
document.getElementById('btn-divide').onclick = function() { chooseOperation('÷'); };

document.getElementById('btn-equals').onclick = function() { calculate(); };
document.getElementById('btn-clear').onclick = function() { clearAll(); };
document.getElementById('btn-delete').onclick = function() { deleteLast(); };
document.getElementById('btn-percent').onclick = function() { percentage(); };
document.getElementById('btn-sign').onclick = function() { toggleSign(); };

// --- 8. Basic Keyboard Support ---
window.onkeydown = function(e) {
  let key = e.key;

  if (key >= '0' && key <= '9') {
    appendNumber(key);
  } else if (key === '.') {
    appendDot();
  } else if (key === '+') {
    chooseOperation('+');
  } else if (key === '-') {
    chooseOperation('−');
  } else if (key === '*' || key === 'x' || key === 'X') {
    chooseOperation('×');
  } else if (key === '/') {
    chooseOperation('÷');
  } else if (key === 'Enter' || key === '=') {
    calculate();
  } else if (key === 'Backspace') {
    deleteLast();
  } else if (key === 'Escape') {
    clearAll();
  } else if (key === '%') {
    percentage();
  }
};

// --- 9. Initial Load ---
loadTheme();
loadHistory();
updateDisplay();
