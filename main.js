
const display = document.getElementById("display");
const previous = document.getElementById("previous");
const historyBox = document.getElementById("history");
const themeBtn = document.getElementById("themeBtn");

let expression = "";
let justCalculated = false;

// Update display
function updateDisplay() {
  display.value = expression || "0";
}

// Append numbers and operators
function appendValue(value) {

  if (justCalculated) {
    if (/[0-9.(]/.test(value)) {
      expression = "";
    }
    justCalculated = false;
  }

  const operators = ["+", "-", "*", "/"];
  const last = expression.slice(-1);

  // Replace the previous operator
  if (operators.includes(value)) {
    if (!expression && value !== "-") return;

    if (operators.includes(last)) {
      expression = expression.slice(0, -1);
    }
  }

  // Avoid repeated decimal points
  if (value === ".") {
    const currentNumber = expression.split(/[+\-*/()%]/).pop();
    if (currentNumber.includes(".")) return;
  }

  // Avoid invalid closing parentheses
  if (value === ")") {
    const opens = (expression.match(/\(/g) || []).length;
    const closes = (expression.match(/\)/g) || []).length;

    if (opens <= closes || /[+\-*/.(]$/.test(expression)) return;
  }

  expression += value;
  updateDisplay();
}

// Clear everything
function clearDisplay() {
  expression = "";
  previous.textContent = "";
  justCalculated = false;
  updateDisplay();
}

// Delete last character
function backspace() {
  if (justCalculated) {
    clearDisplay();
    return;
  }

  expression = expression.slice(0, -1);
  updateDisplay();
}

// Percentage
function percentage() {
  if (/[0-9)]$/.test(expression)) {
    expression += "%";
    updateDisplay();
  }
}

// Safe mathematical parser (no eval or Function)
function calculateExpression(input) {

  const tokens = input.match(
    /(?:\d+(?:\.\d*)?|\.\d+)|[+\-*/()%]/g
  ) || [];

  if (tokens.join("") !== input.replace(/\s/g, "")) {
    throw new Error("Invalid expression");
  }

  let position = 0;

  function expressionParser() {
    let result = term();

    while (tokens[position] === "+" ||
           tokens[position] === "-") {

      const operator = tokens[position++];

      const right = term();

      result = operator === "+"
        ? result + right
        : result - right;
    }

    return result;
  }

  function term() {
    let result = unary();

    while (tokens[position] === "*" ||
           tokens[position] === "/") {

      const operator = tokens[position++];

      const right = unary();

      if (operator === "/" && right === 0) {
        throw new Error("Cannot divide by zero");
      }

      result = operator === "*"
        ? result * right
        : result / right;
    }

    return result;
  }

  function unary() {
    if (tokens[position] === "+") {
      position++;
      return unary();
    }

    if (tokens[position] === "-") {
      position++;
      return -unary();
    }

    return postfix();
  }

  function postfix() {
    let result = primary();

    while (tokens[position] === "%") {
      position++;
      result /= 100;
    }

    return result;
  }

  function primary() {
    const token = tokens[position++];

    if (token === "(") {
      const result = expressionParser();

      if (tokens[position] !== ")") {
        throw new Error("Missing parenthesis");
      }

      position++;
      return result;
    }

    if (token === undefined || !/^(?:\d+\.?\d*|\.\d+)$/.test(token)) {
      throw new Error("Invalid number");
    }

    return Number(token);
  }

  if (!tokens.length) {
    throw new Error("Empty expression");
  }

  const result = expressionParser();

  if (position !== tokens.length || !Number.isFinite(result)) {
    throw new Error("Invalid calculation");
  }

  return Number(result.toPrecision(12));
}

// Calculate
function calculate() {

  if (!expression) return;

  try {

    const original = expression;
    const result = calculateExpression(expression);

    previous.textContent = original + " =";

    expression = String(result);

    justCalculated = true;

    updateDisplay();

    addHistory(original, result);

  } catch (error) {

    display.value = "Error";
    expression = "";
    justCalculated = true;

  }
}

// Add calculation history
function addHistory(original, result) {

  const empty = historyBox.querySelector(".empty");

  if (empty) {
    empty.remove();
  }

  const item = document.createElement("div");
  item.className = "history-item";

  const calculation = document.createElement("span");
  calculation.textContent = original;

  const answer = document.createElement("strong");
  answer.textContent = "= " + result;

  item.append(calculation, answer);

  historyBox.prepend(item);

  // Keep only 10 calculations
  while (historyBox.children.length > 10) {
    historyBox.lastElementChild.remove();
  }
}

// Clear history
document.getElementById("clearHistory").addEventListener("click", () => {
  historyBox.innerHTML =
    '<p class="empty">Your calculations will appear here.</p>';
});

// Button events
document.querySelector(".buttons").addEventListener("click", (event) => {

  const button = event.target.closest("button");

  if (!button) return;

  const action = button.dataset.action;
  const value = button.dataset.value;

  if (action === "clear") clearDisplay();
  else if (action === "backspace") backspace();
  else if (action === "calculate") calculate();
  else if (action === "percent") percentage();
  else if (value !== undefined) appendValue(value);

});

// Dark and Light mode
themeBtn.addEventListener("click", () => {

  document.body.classList.toggle("dark");

  const dark = document.body.classList.contains("dark");

  themeBtn.textContent = dark ? "☀" : "☾";

});

// Keyboard support
document.addEventListener("keydown", (event) => {

  const key = event.key;

  if (/^[0-9.]$/.test(key)) {
    appendValue(key);
  }

  else if (["+", "-", "*", "/", "(", ")"].includes(key)) {
    appendValue(key);
  }

  else if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculate();
  }

  else if (key === "Backspace") {
    backspace();
  }

  else if (key === "Escape") {
    clearDisplay();
  }

  else if (key === "%") {
    percentage();
  }

});
