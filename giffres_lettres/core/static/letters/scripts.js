let letters = "HELLOWORLD";
let token = "";
let previousText = "";

const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 10;
const ALERT_THRESHOLD = 5;

const COLOR_CODES = {
  info: {
    color: "green",
  },
  warning: {
    color: "orange",
    threshold: WARNING_THRESHOLD,
  },
  alert: {
    color: "red",
    threshold: ALERT_THRESHOLD,
  },
};

let TIME_LIMIT = 20;
let timePassed = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;
let remainingPathColor = COLOR_CODES.info.color;

// Initialization
// ============================================================================================================

document.getElementById("letters").innerHTML = letters;
document.getElementById("letters").parentElement.classList.add("d-none");
document.getElementById("vowel").addEventListener("click", vowel);
document.getElementById("consonant").addEventListener("click", consonant);

document.getElementById("clock").innerHTML = `
<div id="base-timer" class="base-timer d-none">
  <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g class="base-timer__circle">
      <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
      <path
        id="base-timer-path-remaining"
        stroke-dasharray="283"
        class="base-timer__path-remaining ${remainingPathColor}"
        d="
          M 50, 50
          m -45, 0
          a 45,45 0 1,0 90,0
          a 45,45 0 1,0 -90,0
        "
      ></path>
    </g>
  </svg>
  <span id="base-timer-label" class="base-timer__label">${formatTime(
    timeLeft
  )}</span>
</div>
`;

// ============================================================================================================

async function buttonAction(type) {
  // removes the clock and disables the buttons
  clearInterval(timerInterval);
  document.getElementById("vowel").disabled = true;
  document.getElementById("consonant").disabled = true;

  const response = await fetch(`/${type}/${token}`);
  const text = await response.text();
  console.log(text);
  [letters, token] = text.split(".");

  // updates the letter display
  document.getElementById("letters").innerHTML = letters;
  document.getElementById("letters").parentElement.classList.remove("d-none");

  if (letters.length >= 10) {
    endgame();
    return;
  }

  // adds the clock and the button
  document.getElementById("base-timer").classList.remove("d-none");
  startTimer();
  timeLeft = TIME_LIMIT;
  timePassed = 0;
  setCircleDasharray();
  setRemainingPathColor(timeLeft);
  document.getElementById("vowel").disabled = false;
  document.getElementById("consonant").disabled = false;
}

async function submit() {
  // removes the clock and disables the buttons
  clearInterval(timerInterval);
  document.getElementById("submit").disabled = true;
  document.getElementById("my-word").disabled = true;

  const word = document
    .getElementById("my-word")
    .value.toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const response = await fetch(`/verifyword/${token}/${word}`);
  const msg = await response.text();
  console.log(msg);

  // loads the score page
  location.replace(`/score/${msg}`);
}

function endgame() {
  document.getElementById("controls").classList.remove("flex-grow-0");
  document.getElementById("controls").classList.add("flex-grow-1");
  document.getElementById(
    "controls"
  ).innerHTML = `<form onsubmit="submit(); return false;" autocomplete="off">
  <div class="col-10 d-flex align-items-center justify-content-center">
    <input type="text" id="my-word" class="my-input border-bottom"/>
  </div>
  <div class="col d-flex align-items-center justify-content-center">
    <button
      id="submit"
      type="submit"
      class="btn btn-outline-light btn-rounded btn-lg"
      data-mdb-ripple-color="light"
    >
      Valider
    </button>
  </div>
</form>`;

  // document.getElementById("submit").addEventListener("click", submit);
  document.getElementById("my-word").addEventListener("input", onChange);
  document.getElementById("my-word").focus();
  TIME_LIMIT = 80;
  document.getElementById("base-timer").classList.remove("d-none");
  startTimer();
  timeLeft = TIME_LIMIT;
  timePassed = 0;
}

function onChange() {
  const value = document
    .getElementById("my-word")
    .value.toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  //   Validates input
  let str = letters;
  for (const c of value) {
    const i = str.indexOf(c);
    if (i === -1) {
      document.getElementById("my-word").classList.add("error");
      document.getElementById("submit").disabled = true;
      return;
    }
    str = str.slice(0, i) + str.slice(i + 1);
  }
  document.getElementById("my-word").classList.remove("error");
  document.getElementById("submit").disabled = false;

  //   Eye candy
  const l = letters.split("");
  str = value;
  for (i = 0; i < l.length; i++) {
    const j = str.indexOf(l[i]);
    if (j !== -1) {
      l[i] = `<span class='discrete'>${l[i]}</span>`;
      str = str.slice(0, j) + str.slice(j + 1);
    }
  }
  document.getElementById("letters").innerHTML = l.join("");
}

function vowel() {
  buttonAction("vowel");
}

function consonant() {
  buttonAction("consonant");
}

function onTimesUp() {
  clearInterval(timerInterval);
  location.replace(`/score/Il faut finir avant l'horloge`);
}

function startTimer() {
  timerInterval = setInterval(() => {
    timePassed = timePassed += 1;
    timeLeft = TIME_LIMIT - timePassed;
    document.getElementById("base-timer-label").innerHTML =
      formatTime(timeLeft);
    setCircleDasharray();
    setRemainingPathColor(timeLeft);

    if (timeLeft === 0) {
      onTimesUp();
    }
  }, 1000);
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;

  if (seconds < 10) {
    seconds = `0${seconds}`;
  }

  return `${minutes}:${seconds}`;
}

function setRemainingPathColor(timeLeft) {
  const { alert, warning, info } = COLOR_CODES;
  if (timeLeft <= alert.threshold) {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(warning.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(alert.color);
  } else if (timeLeft <= warning.threshold) {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(info.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(warning.color);
  } else {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(alert.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(warning.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(info.color);
  }
}

function calculateTimeFraction() {
  const rawTimeFraction = timeLeft / TIME_LIMIT;
  return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
}

function setCircleDasharray() {
  const circleDasharray = `${(
    calculateTimeFraction() * FULL_DASH_ARRAY
  ).toFixed(0)} 283`;
  document
    .getElementById("base-timer-path-remaining")
    .setAttribute("stroke-dasharray", circleDasharray);
}
