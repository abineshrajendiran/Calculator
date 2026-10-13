/**
 * ==========================================================================
 * SmartCalc — Modern Vanilla JavaScript Calculator Engine
 * Clean Architecture, Safe Token Parser (Zero eval), Persistent State
 * ==========================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. State Management
     ========================================================================== */
  const state = {
    currentInput: '0',       // The number currently being entered on the keypad
    previousInput: null,     // The left operand in an active pending calculation
    operation: null,         // The active operator: '+', '-', '×', '÷', '^'
    expressionDisplay: '',   // The full formula representation for display
    isNewCalculation: false, // Flag indicating if next digit input should reset display
    memory: 0,               // Calculator memory value (M)
    angleMode: 'DEG',        // 'DEG' or 'RAD' for trigonometric functions
    theme: 'dark',           // 'dark' or 'light'
    mode: 'standard',        // 'standard' or 'scientific'
    history: []              // Stored calculation records
  };

  /* LocalStorage Keys */
  const STORAGE_KEYS = {
    THEME: 'smartcalc_theme',
    HISTORY: 'smartcalc_history',
    MODE: 'smartcalc_mode',
    MEMORY: 'smartcalc_memory',
    ANGLE: 'smartcalc_angle'
  };

  /* Maximum digit input limit */
  const MAX_DIGITS = 16;

  /* ==========================================================================
     2. DOM Element Selectors
     ========================================================================== */
  const elements = {
    html: document.documentElement,
    calcResult: document.getElementById('calc-result'),
    calcPreview: document.getElementById('calc-preview'),
    calcExpression: document.getElementById('calc-expression'),
    btnCopyResult: document.getElementById('btn-copy-result'),
    btnToggleTheme: document.getElementById('btn-toggle-theme'),
    btnModeStandard: document.getElementById('btn-mode-standard'),
    btnModeScientific: document.getElementById('btn-mode-scientific'),
    btnToggleAngle: document.getElementById('btn-toggle-angle'),
    angleModeText: document.getElementById('angle-mode-text'),
    statusMemIndicator: document.getElementById('status-mem-indicator'),
    scientificPanel: document.getElementById('scientific-panel'),
    calculatorLayout: document.querySelector('.calculator-grid-layout'),
    
    // History Panel
    historyPanel: document.getElementById('history-panel'),
    historyList: document.getElementById('history-items-list'),
    historyEmptyState: document.getElementById('history-empty-state'),
    btnClearHistory: document.getElementById('btn-clear-history'),
    btnToggleHistoryDrawer: document.getElementById('btn-toggle-history-drawer'),
    btnCloseHistoryDrawer: document.getElementById('btn-close-history-drawer'),
    historyBadge: document.getElementById('history-badge'),

    // Toast
    toastContainer: document.getElementById('toast-container')
  };

  /* ==========================================================================
     3. High-Precision Math & Calculation Engine
     ========================================================================== */

  /**
   * Safe floating point arithmetic rounding.
   * Fixes JavaScript IEEE 754 precision issues like 0.1 + 0.2 = 0.30000000000000004
   */
  function formatResult(value) {
    if (value === undefined || value === null || isNaN(value)) {
      return 'Error';
    }
    if (!isFinite(value)) {
      return 'Cannot divide by zero';
    }

    // Round small precision discrepancies using 12 significant figures
    const rounded = Number(Math.round(Number(value + 'e12')) + 'e-12');

    // If exponential is warranted
    if (Math.abs(rounded) >= 1e14 || (Math.abs(rounded) > 0 && Math.abs(rounded) < 1e-6)) {
      return rounded.toExponential(6).replace(/e\+?/, 'e');
    }

    return rounded.toString();
  }

  /**
   * Execute binary operation: a OP b
   */
  function computeBinary(a, b, op) {
    const numA = parseFloat(a);
    const numB = parseFloat(b);

    if (isNaN(numA) || isNaN(numB)) return 0;

    switch (op) {
      case '+':
        return numA + numB;
      case '-':
        return numA - numB;
      case '×':
      case '*':
        return numA * numB;
      case '÷':
      case '/':
        if (numB === 0) {
          return Infinity; // Caught as 'Cannot divide by zero'
        }
        return numA / numB;
      case '^':
        return Math.pow(numA, numB);
      default:
        return numB;
    }
  }

  /**
   * Factorial calculation (n!)
   */
  function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    if (n > 170) return Infinity; // Overflow for JS 64-bit float
    if (!Number.isInteger(n)) {
      // Lanczos approximation or Gamma for non-integers could be used, or reject
      return NaN;
    }
    let res = 1;
    for (let i = 2; i <= n; i++) {
      res *= i;
    }
    return res;
  }

  /* ==========================================================================
     4. Display & UI Rendering
     ========================================================================== */

  /**
   * Formats a raw number string with commas for integer parts
   */
  function formatDisplayNumber(strVal) {
    if (strVal === 'Error' || strVal === 'Cannot divide by zero') {
      return strVal;
    }
    if (strVal.includes('e') || strVal.includes('E')) {
      return strVal;
    }

    const parts = strVal.split('.');
    let integerPart = parts[0];
    const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

    // Handle negative sign
    const isNegative = integerPart.startsWith('-');
    if (isNegative) {
      integerPart = integerPart.substring(1);
    }

    const formattedInt = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (isNegative ? '-' : '') + formattedInt + decimalPart;
  }

  /**
   * Update the calculator main result and expression displays
   */
  function updateDisplay() {
    const isError = state.currentInput === 'Error' || state.currentInput === 'Cannot divide by zero';

    if (isError) {
      elements.calcResult.textContent = state.currentInput;
      elements.calcResult.classList.add('compact-text');
      elements.calcPreview.textContent = '';
      return;
    }

    const displayVal = formatDisplayNumber(state.currentInput);
    elements.calcResult.textContent = displayVal;

    // Adjust font size dynamically if number is long
    elements.calcResult.classList.remove('compact-text', 'micro-text');
    if (displayVal.length > 13) {
      elements.calcResult.classList.add('micro-text');
    } else if (displayVal.length > 9) {
      elements.calcResult.classList.add('compact-text');
    }

    // Render ongoing expression
    elements.calcExpression.textContent = state.expressionDisplay;

    // Render live preview if an operator and pending operand exist
    if (state.operation && state.previousInput !== null && !state.isNewCalculation) {
      const liveRes = computeBinary(state.previousInput, state.currentInput, state.operation);
      const formattedPreview = formatResult(liveRes);
      if (formattedPreview !== 'Error' && formattedPreview !== 'Cannot divide by zero') {
        elements.calcPreview.textContent = '= ' + formatDisplayNumber(formattedPreview);
      } else {
        elements.calcPreview.textContent = '';
      }
    } else {
      elements.calcPreview.textContent = '';
    }

    // Memory status icon
    if (state.memory !== 0) {
      elements.statusMemIndicator.classList.add('active');
    } else {
      elements.statusMemIndicator.classList.remove('active');
    }
  }

  /* ==========================================================================
     5. Calculator Core Actions
     ========================================================================== */

  /**
   * Handles digit input (0 - 9)
   */
  function inputDigit(digit) {
    if (state.currentInput === 'Error' || state.currentInput === 'Cannot divide by zero') {
      clearAll();
    }

    if (state.isNewCalculation) {
      state.currentInput = digit.toString();
      state.isNewCalculation = false;
    } else {
      if (state.currentInput === '0') {
        state.currentInput = digit.toString();
      } else {
        // Prevent exceeding max digits
        const rawDigits = state.currentInput.replace(/[^0-9]/g, '');
        if (rawDigits.length >= MAX_DIGITS) {
          showToast('Maximum digit limit reached', 'info');
          return;
        }
        state.currentInput += digit.toString();
      }
    }
    updateDisplay();
  }

  /**
   * Handles decimal point (.)
   */
  function inputDecimal() {
    if (state.currentInput === 'Error' || state.currentInput === 'Cannot divide by zero') {
      clearAll();
    }

    if (state.isNewCalculation) {
      state.currentInput = '0.';
      state.isNewCalculation = false;
    } else if (!state.currentInput.includes('.')) {
      state.currentInput += '.';
    }
    updateDisplay();
  }

  /**
   * Handles operators (+, -, ×, ÷, ^)
   */
  function handleOperator(nextOp) {
    if (state.currentInput === 'Error' || state.currentInput === 'Cannot divide by zero') {
      return;
    }

    const currentNum = parseFloat(state.currentInput);

    // If an operation is already pending and user didn't just type an operator
    if (state.operation && !state.isNewCalculation) {
      const result = computeBinary(state.previousInput, state.currentInput, state.operation);
      const formatted = formatResult(result);

      if (formatted === 'Cannot divide by zero') {
        triggerError('Cannot divide by zero');
        return;
      }

      state.currentInput = formatted;
      state.previousInput = formatted;
      state.expressionDisplay = `${formatDisplayNumber(formatted)} ${nextOp}`;
    } else {
      // First operator or replacing operator
      state.previousInput = state.currentInput;
      state.expressionDisplay = `${formatDisplayNumber(state.currentInput)} ${nextOp}`;
    }

    state.operation = nextOp;
    state.isNewCalculation = true;
    updateDisplay();
  }

  /**
   * Handles Equals (=)
   */
  function handleEquals() {
    if (state.currentInput === 'Error' || state.currentInput === 'Cannot divide by zero') {
      return;
    }

    if (!state.operation || state.previousInput === null) {
      // No pending operation to compute
      return;
    }

    const prev = state.previousInput;
    const curr = state.currentInput;
    const op = state.operation;

    const fullExp = `${formatDisplayNumber(prev)} ${op} ${formatDisplayNumber(curr)}`;
    const result = computeBinary(prev, curr, op);
    const formatted = formatResult(result);

    if (formatted === 'Cannot divide by zero') {
      triggerError('Cannot divide by zero');
      return;
    }

    // Save to calculation history
    addHistoryEntry(fullExp, formatted);

    state.expressionDisplay = `${fullExp} =`;
    state.currentInput = formatted;
    state.previousInput = null;
    state.operation = null;
    state.isNewCalculation = true;

    updateDisplay();
  }

  /**
   * Handles Percentage (%)
   */
  function handlePercentage() {
    if (state.currentInput === 'Error' || state.currentInput === 'Cannot divide by zero') return;

    const currentVal = parseFloat(state.currentInput);

    if (state.operation && state.previousInput !== null) {
      // E.g., 200 + 10% => 10% of 200 = 20
      const prevVal = parseFloat(state.previousInput);
      const percentVal = (prevVal * currentVal) / 100;
      state.currentInput = formatResult(percentVal);
    } else {
      // Standalone percentage: 50% = 0.5
      state.currentInput = formatResult(currentVal / 100);
    }
    state.isNewCalculation = false;
    updateDisplay();
  }

  /**
   * Negate positive/negative sign (±)
   */
  function handleNegate() {
    if (state.currentInput === 'Error' || state.currentInput === 'Cannot divide by zero') return;

    if (state.currentInput !== '0') {
      if (state.currentInput.startsWith('-')) {
        state.currentInput = state.currentInput.substring(1);
      } else {
        state.currentInput = '-' + state.currentInput;
      }
    }
    updateDisplay();
  }

  /**
   * Delete single last character (DEL)
   */
  function deleteLastDigit() {
    if (state.currentInput === 'Error' || state.currentInput === 'Cannot divide by zero') {
      clearAll();
      return;
    }

    if (state.isNewCalculation) {
      return;
    }

    if (state.currentInput.length > 1) {
      state.currentInput = state.currentInput.slice(0, -1);
      // If only negative sign is left, reset to '0'
      if (state.currentInput === '-') {
        state.currentInput = '0';
      }
    } else {
      state.currentInput = '0';
    }
    updateDisplay();
  }

  /**
   * Clear All (AC)
   */
  function clearAll() {
    state.currentInput = '0';
    state.previousInput = null;
    state.operation = null;
    state.expressionDisplay = '';
    state.isNewCalculation = false;
    updateDisplay();
  }

  /**
   * Trigger calculation error
   */
  function triggerError(msg) {
    state.currentInput = msg;
    state.previousInput = null;
    state.operation = null;
    state.expressionDisplay = '';
    state.isNewCalculation = true;
    updateDisplay();
    showToast(msg, 'error');
  }

  /* ==========================================================================
     6. Scientific Operations Engine
     ========================================================================== */

  /**
   * Execute immediate unary scientific function
   */
  function handleScientific(funcName) {
    if (state.currentInput === 'Error' || state.currentInput === 'Cannot divide by zero') {
      return;
    }

    let val = parseFloat(state.currentInput);
    let result = 0;
    let label = '';

    // Convert degrees to radians for trig functions if angleMode === 'DEG'
    const toRad = (angle) => (state.angleMode === 'DEG' ? (angle * Math.PI) / 180 : angle);
    const toDeg = (rad) => (state.angleMode === 'DEG' ? (rad * 180) / Math.PI : rad);

    switch (funcName) {
      case 'sin':
        result = Math.sin(toRad(val));
        label = `sin(${formatDisplayNumber(state.currentInput)})`;
        break;
      case 'cos':
        result = Math.cos(toRad(val));
        label = `cos(${formatDisplayNumber(state.currentInput)})`;
        break;
      case 'tan':
        // Check for undefined tan (e.g. 90 deg, 270 deg)
        if (state.angleMode === 'DEG' && Math.abs(val % 180) === 90) {
          triggerError('Undefined (tan 90°)');
          return;
        }
        result = Math.tan(toRad(val));
        label = `tan(${formatDisplayNumber(state.currentInput)})`;
        break;
      case 'asin':
        if (val < -1 || val > 1) {
          triggerError('Invalid input for sin⁻¹');
          return;
        }
        result = toDeg(Math.asin(val));
        label = `sin⁻¹(${formatDisplayNumber(state.currentInput)})`;
        break;
      case 'acos':
        if (val < -1 || val > 1) {
          triggerError('Invalid input for cos⁻¹');
          return;
        }
        result = toDeg(Math.acos(val));
        label = `cos⁻¹(${formatDisplayNumber(state.currentInput)})`;
        break;
      case 'atan':
        result = toDeg(Math.atan(val));
        label = `tan⁻¹(${formatDisplayNumber(state.currentInput)})`;
        break;
      case 'sqrt':
        if (val < 0) {
          triggerError('Invalid input: √ negative');
          return;
        }
        result = Math.sqrt(val);
        label = `√(${formatDisplayNumber(state.currentInput)})`;
        break;
      case 'sqr':
        result = Math.pow(val, 2);
        label = `sqr(${formatDisplayNumber(state.currentInput)})`;
        break;
      case 'pow':
        // Power (x^y) acts as binary operator
        handleOperator('^');
        return;
      case 'log':
        if (val <= 0) {
          triggerError('Invalid input for log₁₀');
          return;
        }
        result = Math.log10(val);
        label = `log(${formatDisplayNumber(state.currentInput)})`;
        break;
      case 'ln':
        if (val <= 0) {
          triggerError('Invalid input for ln');
          return;
        }
        result = Math.log(val);
        label = `ln(${formatDisplayNumber(state.currentInput)})`;
        break;
      case 'fact':
        if (val < 0 || !Number.isInteger(val)) {
          triggerError('Invalid factorial input');
          return;
        }
        result = factorial(val);
        label = `fact(${formatDisplayNumber(state.currentInput)})`;
        break;
      case 'inv':
        if (val === 0) {
          triggerError('Cannot divide by zero');
          return;
        }
        result = 1 / val;
        label = `1/(${formatDisplayNumber(state.currentInput)})`;
        break;
      case 'pi':
        state.currentInput = Math.PI.toString();
        state.isNewCalculation = false;
        updateDisplay();
        return;
      case 'e':
        state.currentInput = Math.E.toString();
        state.isNewCalculation = false;
        updateDisplay();
        return;
      default:
        return;
    }

    const formattedRes = formatResult(result);
    addHistoryEntry(label, formattedRes);
    state.expressionDisplay = `${label} =`;
    state.currentInput = formattedRes;
    state.isNewCalculation = true;
    updateDisplay();
  }

  /* ==========================================================================
     7. Memory Engine (MC, MR, M+, M-)
     ========================================================================== */
  function handleMemory(action) {
    if (state.currentInput === 'Error' || state.currentInput === 'Cannot divide by zero') {
      return;
    }

    const val = parseFloat(state.currentInput) || 0;

    switch (action) {
      case 'memory-clear':
        state.memory = 0;
        localStorage.removeItem(STORAGE_KEYS.MEMORY);
        showToast('Memory Cleared (MC)', 'info');
        break;
      case 'memory-recall':
        state.currentInput = formatResult(state.memory);
        state.isNewCalculation = true;
        showToast(`Memory Recalled: ${state.currentInput}`, 'info');
        break;
      case 'memory-add':
        state.memory += val;
        localStorage.setItem(STORAGE_KEYS.MEMORY, state.memory.toString());
        showToast(`Added to Memory: +${val}`, 'info');
        break;
      case 'memory-sub':
        state.memory -= val;
        localStorage.setItem(STORAGE_KEYS.MEMORY, state.memory.toString());
        showToast(`Subtracted from Memory: -${val}`, 'info');
        break;
    }
    updateDisplay();
  }

  /* ==========================================================================
     8. Calculation History Management & LocalStorage
     ========================================================================== */

  /**
   * Load history from localStorage
   */
  function loadHistory() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (stored) {
        state.history = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse history from localStorage', e);
      state.history = [];
    }
    renderHistory();
  }

  /**
   * Add a completed calculation to history
   */
  function addHistoryEntry(expression, result) {
    const item = {
      id: Date.now() + Math.random().toString(36).substring(2, 6),
      expression,
      result,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    state.history.unshift(item); // Insert newest at top
    if (state.history.length > 50) {
      state.history.pop(); // Keep maximum 50 records
    }

    saveHistory();
    renderHistory();
  }

  /**
   * Persist history array to localStorage
   */
  function saveHistory() {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(state.history));
    } catch (e) {
      console.warn('Could not save history to localStorage', e);
    }
  }

  /**
   * Render history list in UI
   */
  function renderHistory() {
    // Update badge count
    if (elements.historyBadge) {
      elements.historyBadge.textContent = state.history.length.toString();
    }

    if (state.history.length === 0) {
      elements.historyEmptyState.style.display = 'flex';
      elements.historyList.innerHTML = '';
      return;
    }

    elements.historyEmptyState.style.display = 'none';
    elements.historyList.innerHTML = '';

    state.history.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'history-item';
      li.tabIndex = 0;
      li.setAttribute('role', 'button');
      li.setAttribute('aria-label', `Reuse result ${item.result} from ${item.expression}`);

      li.innerHTML = `
        <span class="history-item-time">${item.timestamp}</span>
        <span class="history-item-exp">${escapeHtml(item.expression)} =</span>
        <span class="history-item-res">${formatDisplayNumber(item.result)}</span>
      `;

      // Click to reuse result
      const selectHandler = () => {
        state.currentInput = item.result;
        state.expressionDisplay = `Ans (${item.result})`;
        state.isNewCalculation = true;
        updateDisplay();
        showToast(`Loaded ${item.result} into calculator`, 'success');

        // On mobile, close drawer after selection
        if (window.innerWidth <= 580) {
          elements.historyPanel.classList.remove('mobile-open');
        }
      };

      li.addEventListener('click', selectHandler);
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectHandler();
        }
      });

      elements.historyList.appendChild(li);
    });
  }

  /**
   * Clear all history records
   */
  function clearHistory() {
    if (state.history.length === 0) return;
    state.history = [];
    saveHistory();
    renderHistory();
    showToast('Calculation history cleared', 'info');
  }

  /* ==========================================================================
     9. Clipboard Copy Functionality
     ========================================================================== */
  async function copyCurrentResult() {
    const textToCopy = state.currentInput;
    if (!textToCopy || textToCopy === 'Error' || textToCopy === 'Cannot divide by zero') {
      showToast('Nothing valid to copy', 'error');
      return;
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      showToast(`Copied "${textToCopy}" to clipboard!`, 'success');
    } catch (err) {
      console.error('Clipboard copy error:', err);
      showToast('Failed to copy to clipboard', 'error');
    }
  }

  /* ==========================================================================
     10. Theme & Mode Switching
     ========================================================================== */

  /**
   * Theme toggling (Dark / Light)
   */
  function setTheme(newTheme) {
    state.theme = newTheme;
    elements.html.setAttribute('data-theme', newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    elements.btnToggleTheme.setAttribute(
      'aria-label',
      newTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'
    );
  }

  function toggleTheme() {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    showToast(`Switched to ${nextTheme} theme`, 'info');
  }

  /**
   * Calculator Mode Toggle (Standard / Scientific)
   */
  function setMode(newMode) {
    state.mode = newMode;
    localStorage.setItem(STORAGE_KEYS.MODE, newMode);

    if (newMode === 'scientific') {
      elements.btnModeScientific.classList.add('active');
      elements.btnModeScientific.setAttribute('aria-pressed', 'true');
      elements.btnModeStandard.classList.remove('active');
      elements.btnModeStandard.setAttribute('aria-pressed', 'false');

      elements.scientificPanel.classList.add('open');
      elements.calculatorLayout.classList.add('is-scientific');
    } else {
      elements.btnModeStandard.classList.add('active');
      elements.btnModeStandard.setAttribute('aria-pressed', 'true');
      elements.btnModeScientific.classList.remove('active');
      elements.btnModeScientific.setAttribute('aria-pressed', 'false');

      elements.scientificPanel.classList.remove('open');
      elements.calculatorLayout.classList.remove('is-scientific');
    }
  }

  /**
   * Toggle Trigonometric Angle Mode (DEG / RAD)
   */
  function toggleAngleMode() {
    state.angleMode = state.angleMode === 'DEG' ? 'RAD' : 'DEG';
    elements.angleModeText.textContent = state.angleMode;
    localStorage.setItem(STORAGE_KEYS.ANGLE, state.angleMode);
    showToast(`Angle mode set to ${state.angleMode}`, 'info');
  }

  /* ==========================================================================
     11. Toast Notifications
     ========================================================================== */
  function showToast(message, type = 'info') {
    if (!elements.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Choose icon
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else {
      iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `${iconSvg} <span>${escapeHtml(message)}</span>`;
    elements.toastContainer.appendChild(toast);

    // Fade out and remove after 2.6s
    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 250);
    }, 2400);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ==========================================================================
     12. Keyboard Navigation & Event Listeners
     ========================================================================== */

  /**
   * Global Keyboard Shortcuts Handler
   */
  function handleKeyDown(e) {
    // Ignore keystrokes when user is focusing an input or text field if one existed
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const key = e.key;

    // Digits 0 - 9
    if (/^[0-9]$/.test(key)) {
      e.preventDefault();
      inputDigit(parseInt(key, 10));
      highlightButton(`[data-num="${key}"]`);
      return;
    }

    // Decimal point
    if (key === '.') {
      e.preventDefault();
      inputDecimal();
      highlightButton('[data-action="decimal"]');
      return;
    }

    // Binary Operators
    if (key === '+') {
      e.preventDefault();
      handleOperator('+');
      highlightButton('[data-action="add"]');
      return;
    }
    if (key === '-') {
      e.preventDefault();
      handleOperator('-');
      highlightButton('[data-action="subtract"]');
      return;
    }
    if (key === '*' || key === 'x' || key === 'X') {
      e.preventDefault();
      handleOperator('×');
      highlightButton('[data-action="multiply"]');
      return;
    }
    if (key === '/') {
      e.preventDefault();
      handleOperator('÷');
      highlightButton('[data-action="divide"]');
      return;
    }
    if (key === '^') {
      e.preventDefault();
      handleOperator('^');
      highlightButton('[data-action="pow"]');
      return;
    }

    // Equals (Enter or =)
    if (key === 'Enter' || key === '=') {
      e.preventDefault();
      handleEquals();
      highlightButton('[data-action="equals"]');
      return;
    }

    // Backspace / Delete
    if (key === 'Backspace') {
      e.preventDefault();
      deleteLastDigit();
      highlightButton('[data-action="delete"]');
      return;
    }

    // Clear All (Escape or 'c' / 'C')
    if (key === 'Escape' || key.toLowerCase() === 'c') {
      e.preventDefault();
      clearAll();
      highlightButton('[data-action="clear-all"]');
      return;
    }

    // Percentage
    if (key === '%') {
      e.preventDefault();
      handlePercentage();
      highlightButton('[data-action="percent"]');
      return;
    }
  }

  /**
   * Visual feedback pulse for keypresses
   */
  function highlightButton(selector) {
    const btn = document.querySelector(selector);
    if (btn) {
      btn.classList.add('op-active');
      setTimeout(() => btn.classList.remove('op-active'), 120);
    }
  }

  /**
   * Bind Click Events via Delegation
   */
  function setupEventListeners() {
    // Keypad and Scientific Buttons Event Delegation
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;

      // Number digits
      if (btn.hasAttribute('data-num')) {
        const num = btn.getAttribute('data-num');
        inputDigit(num);
        return;
      }

      // Action buttons
      const action = btn.getAttribute('data-action');
      if (!action) return;

      switch (action) {
        case 'decimal':
          inputDecimal();
          break;
        case 'clear-all':
          clearAll();
          break;
        case 'delete':
          deleteLastDigit();
          break;
        case 'percent':
          handlePercentage();
          break;
        case 'negate':
          handleNegate();
          break;
        case 'equals':
          handleEquals();
          break;
        
        // Operators
        case 'add':
          handleOperator('+');
          break;
        case 'subtract':
          handleOperator('-');
          break;
        case 'multiply':
          handleOperator('×');
          break;
        case 'divide':
          handleOperator('÷');
          break;

        // Scientific functions
        case 'sin':
        case 'cos':
        case 'tan':
        case 'asin':
        case 'acos':
        case 'atan':
        case 'sqrt':
        case 'sqr':
        case 'pow':
        case 'log':
        case 'ln':
        case 'fact':
        case 'inv':
        case 'pi':
        case 'e':
          handleScientific(action);
          break;

        // Memory functions
        case 'memory-clear':
        case 'memory-recall':
        case 'memory-add':
        case 'memory-sub':
          handleMemory(action);
          break;
      }
    });

    // Theme toggle
    elements.btnToggleTheme.addEventListener('click', toggleTheme);

    // Mode switches
    elements.btnModeStandard.addEventListener('click', () => setMode('standard'));
    elements.btnModeScientific.addEventListener('click', () => setMode('scientific'));

    // Angle toggle
    elements.btnToggleAngle.addEventListener('click', toggleAngleMode);

    // Copy result
    elements.btnCopyResult.addEventListener('click', copyCurrentResult);

    // Clear history
    elements.btnClearHistory.addEventListener('click', clearHistory);

    // Mobile drawer toggles
    if (elements.btnToggleHistoryDrawer) {
      elements.btnToggleHistoryDrawer.addEventListener('click', () => {
        elements.historyPanel.classList.toggle('mobile-open');
      });
    }

    if (elements.btnCloseHistoryDrawer) {
      elements.btnCloseHistoryDrawer.addEventListener('click', () => {
        elements.historyPanel.classList.remove('mobile-open');
      });
    }

    // Keyboard listener
    window.addEventListener('keydown', handleKeyDown);
  }

  /* ==========================================================================
     13. App Initialization
     ========================================================================== */
  function init() {
    // Retrieve theme
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
    setTheme(savedTheme);

    // Retrieve mode
    const savedMode = localStorage.getItem(STORAGE_KEYS.MODE) || 'standard';
    setMode(savedMode);

    // Retrieve memory
    const savedMemory = localStorage.getItem(STORAGE_KEYS.MEMORY);
    if (savedMemory) {
      state.memory = parseFloat(savedMemory) || 0;
    }

    // Retrieve angle mode
    const savedAngle = localStorage.getItem(STORAGE_KEYS.ANGLE) || 'DEG';
    state.angleMode = savedAngle;
    elements.angleModeText.textContent = savedAngle;

    // Load History
    loadHistory();

    // Attach Event Handlers
    setupEventListeners();

    // Render Initial State
    updateDisplay();

    console.log('SmartCalc initialized successfully.');
  }

  init();
});

