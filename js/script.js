let userAnswers = {
  practice: {
    notAnswered: {},
    answers: {},
  },
  exam: {
    notAnswered: {},
    answers: {},
  },
};

let question = "";
let correctAnswer = 0; // 存储当前题目的正确答案
let answers = {};

const totalQuestions = 45; // 总题量

let examMode = false;
let examScores = {};
let currentQuestion = null;
let timerId = null;
let timerRunning = false;
let timeRemaining = 30;
let timerInterval;

let allQuestions = [];

function shuffleArray(array) {
  // 鱼洗牌算法，用于随机化数组
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function generateQuestion(n1, n2) {
  let num1 = 1,
    num2 = 1;

  if (n1 && n2) {
    num1 = n1;
    num2 = n2;
  } else {
    // 如果是考试模式，先随机化未回答的题目数组
    if (examMode) {
      shuffleArray(allQuestions);
    }

    const item = allQuestions.find((item) => !answers[item.question]);

    if (item) {
      // console.log("Generating question from item:", item);
      question = item.question;
      [num1, num2] = question.split(" x ").map(Number);
    } else {
      // 如果找不到未回答的题目，给出消息提示
      alert("No more question!");
      // return;
      [num1, num2] = [9, 9];
    }
  }

  const fingersDisplay = document.querySelector("fingers-display");
  fingersDisplay.renderFingers(num1, num2);

  const calculator = document.querySelector("calculator-component");
  calculator.setAttribute("question", `${num1} x ${num2}`);

  return num1 * num2;
}

function updateProgressBar() {
  const progressBar = document.querySelector(".progress-bar");

  correctAccount = Object.keys(answers).reduce((acc, curr) => {
    return acc + (answers[curr] ? 1 : 0);
  }, 0);

  console.log("correctAccount:", correctAccount);

  const percentage = (    (correctAccount / totalQuestions) *    100  ).toFixed(1);

  progressBar.style.width = `${percentage}%`;
  progressBar.textContent = `${percentage}%`;
  progressBar.setAttribute("aria-valuenow", percentage);

  // 根据值改变颜色
  if (percentage < 20) {
    progressBar.classList.add("red");
    progressBar.classList.remove("orange", "green");
  } else if (percentage >= 20 && percentage <= 60) {
    progressBar.classList.add("orange");
    progressBar.classList.remove("red", "green");
  } else {
    progressBar.classList.add("green");
    progressBar.classList.remove("red", "orange");
  }
}

function updateDisplay(value) {
  answerInput.value = value;
}

// 当问题被正确回答时，将正确答案保存到localStorage
function saveProgress() {
  if (examMode) {
    userAnswers.exam.answers = answers;
  } else {
    userAnswers.practice.answers = answers;
  }

  console.log("saveProgress:", userAnswers);

  localStorage.setItem("userAnswers", JSON.stringify(userAnswers));
}

// 页面加载时从localStorage加载正确答案
function loadProgress() {
  const savedAnswers = localStorage.getItem("userAnswers");
  userAnswers = savedAnswers ? JSON.parse(savedAnswers) : userAnswers;
  console.log("loadProgress:", userAnswers);
}

// 更新allQuestions数组，使其只包含未掌握的题目
// function updateAllQuestions() {
//   allQuestions = allQuestions.filter(
//     (question) => !correctAnswers[question.question]
//   );
// }

// 启动计时器
function startTimer() {
  document.querySelector("timer-component").startTimer();
}

// 停止计时器
function stopTimer() {
  document.querySelector("timer-component").stopTimer();
}

function restartTimer() {
  stopTimer();
  startTimer();
}

function reloadData() {
  // 生成题目并分配难度
  allQuestions = [];
  for (let i = 1; i <= 9; i++) {
    for (let j = 1; j <= i; j++) {
      allQuestions.push({ question: `${j} x ${i}`, answer: i * j });
    }
  }

  loadProgress(); // 页面加载时加载保存的进度

  answers = examMode ? userAnswers.exam.answers : userAnswers.practice.answers;

  console.log("userAnswers in reloadData:", userAnswers);
  console.log("answers in reloadData:", answers);

  document
    .querySelector("multiplication-table")
    .setAttribute("answers", JSON.stringify(answers));

  // updateAllQuestions(); // 更新题目列表，移除已掌握的题目
  updateProgressBar();
  correctAnswer = generateQuestion();
}

document.addEventListener("DOMContentLoaded", function () {
  const timerDisplay = document.getElementById("timerDisplay");
  const calculator = document.querySelector("calculator-component");

  reloadData();

  // 添加点击事件监听器
  examModeButton.addEventListener("click", () => {
    examMode = !examMode; // 切换考试模式

    examModeButton.textContent = examMode ? "Exit Exam Mode" : "Exam Mode";

    timerDisplay.classList.toggle("d-none", !examMode);
    document
      .querySelector("fingers-display")
      .classList.toggle("d-none", examMode);

    answers = examMode
      ? userAnswers.exam.answers
      : userAnswers.practice.answers;
    // console.log("answers in exam-mode change:", answers);

    reloadData();
    restartTimer();
  });

  const btnSkip = document.querySelector("#skipBtn");
  btnSkip.addEventListener("click", () => {
    console.log("Question when Skip button clicked:", question);
    answers[question] = false;
    document
      .querySelector("multiplication-table")
      .setAttribute("answers", JSON.stringify(answers));
    saveProgress();
    correctAnswer = generateQuestion();
    restartTimer();
  });

  document.getElementById("resetButton").addEventListener("click", function () {
    // 提示用户确认是否真的要消除记忆
    if (confirm("Do you really want to clear scores ?")) {
      // 清空已掌握的题目列表
      localStorage.removeItem("userAnswers"); // 清除localStorage中的数据

      // 更新题目列表，确保所有题目都可以再次出现
      // updateAllQuestions();

      // 刷新页面
      location.reload();
    }
  });

  // Listen for answer events
  calculator.addEventListener("correctAnswer", (event) => {
    console.log("Correct answer event:", event.detail);
  });

  calculator.addEventListener("wrongAnswer", (event) => {
    // Handle wrong answer
    console.log(
      "Wrong answer:",
      event.detail.question,
      "=",
      event.detail.answer
    );
  });

  calculator.addEventListener("answer", (event) => {
    // console.log("answers in main when answer event got:", answers)
    // console.log("answer:", event.detail.question, "=", event.detail.result);

    // qestion remembered with three states: true, false, undefined
    if (answers[event.detail.question] === false && event.detail.result) {
      // 如果上次回答错误，则标记为未掌握
      answers[event.detail.question] = null;
    } else {
      answers[event.detail.question] = event.detail.result;
    }

    document
      .querySelector("multiplication-table")
      .setAttribute("answers", JSON.stringify(answers));

    updateProgressBar();
    saveProgress(); // 正确回答后保存进度

    correctAnswer = generateQuestion();
  });

  document
    .querySelector("multiplication-table")
    .addEventListener("table-cell-click", (event) => {
      // console.log('event.detail: ', event.detail);
      const [n1, n2] = event.detail.split(" x ").map(Number);
      generateQuestion(n1, n2);
    });
});
