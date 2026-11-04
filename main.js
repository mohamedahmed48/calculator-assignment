
let display = document.getElementById("display");

function appendValue(value) {

  if (display.value === "0" || display.value === "Error") {
    display.value = value;
  } else {
    display.value += value;
  }

}

function clearDisplay() {
  display.value = "0";
}

function calculate() {

  try {

    let expression = display.value;

    if (!/^[0-9+\-*/. ]+$/.test(expression)) {
      throw new Error("Invalid");
    }

    let result = Function(
      '"use strict"; return (' + expression + ')'
    )();

    if (!Number.isFinite(result)) {
      throw new Error("Invalid");
    }

    display.value = Number(result.toFixed(10)).toString();

  } catch (error) {

    display.value = "Error";

  }

}