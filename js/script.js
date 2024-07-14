let correctAnswers = {};
let correctAnswer = 0;

const totalQuestions = 45; // 总题量

// 生成题目并分配难度
let allQuestions = [];
for (let i = 1; i <= 9; i++) {
  for (let j = 1; j <= i; j++) {
    allQuestions.push({ question: `${j} x ${i}`, answer: i * j });
  }
}

// 修改getNextQuestion函数以确保不会返回已掌握的题目
// function getNextQuestion() {
//   updateAllQuestions(); // 确保allQuestions只包含未掌握的题目
//   if (allQuestions.length > 0) {
//     return allQuestions.shift();
//   } else {
//     // 如果所有题目都已掌握，可以考虑重置或提示用户已完成所有题目
//     return null;
//   }
// }

// 初始化语音识别
const recognition = new webkitSpeechRecognition();
// recognition.lang = "zh-CN";
recognition.continuous = true;
recognition.interimResults = false;

// 创建语音播报函数
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';

  recognition.stop();
  window.speechSynthesis.speak(utterance);
  // 播报完成后重新开启语音识别;
  setTimeout(() => {
    recognition.start();
  }, 3000); // 假设语音播报大约需要1秒
}

function handleCellClick(expression) {
  clearResult();
  // 分解表达式获取操作数
  const [num1, num2] = expression.split(" x ").map(Number);

  // 更新题目显示
  if (num1 > num2) {
    correctAnswer = generateQuestion(num2, num1);
  } else {
    correctAnswer = generateQuestion(num1, num2);
  }
}

function updateMultiplicationTable() {
  const multiplicationTable = document.getElementById("multiplicationTable");
  multiplicationTable.innerHTML = ""; // 清空现有内容

  let table = "<table>";
  for (let i = 1; i <= 9; i++) {
    table += "<tr>";
    for (let j = 1; j <= 9; j++) {
      if (j <= i) {
        // 只有当 j 小于或等于 i 时才生成 td 元素
        let expression = `${j} x ${i}`;
        let cellClass = correctAnswers[expression] ? "correct-answer" : "";
        // 添加 onclick 事件监听器
        table += `<td class="${cellClass}" onclick="handleCellClick('${expression}')">${expression}</td>`;
      } else {
        // 当 j 大于 i 时，生成一个没有 onclick 的 td，且设置为不可见
        table += `<td class="d-none"></td>`;
      }
    }
    table += "</tr>";
  }
  table += "</table>";

  multiplicationTable.innerHTML = table;
}

function generateQuestion(n1, n2) {
  answerInput.value = "";
  clearResult();

  let num1 = 1,
    num2 = 1;

  if (n1 && n2) {
    num1 = n1;
    num2 = n2;
  } else {
    const item = allQuestions.shift();

    if (item) {
      // console.log("Generating question from item:", item);
      const question = item.question;
      [num1, num2] = question.split(" x ").map(Number);
    } else {
      [num1, num2] = [9, 9];
    }
  }

  // let num1 = n1 || Math.floor(Math.random() * 9) + 1;
  // let num2 = n2 || Math.floor(Math.random() * 9) + 1;

  showFingers(num1, num2);
  // 更新题目显示
  questionDisplay.textContent = `${num1} x ${num2} =`;

  speak(`What's ${num1} times ${num2} ?`);

  return num1 * num2;
}

function clearResult() {
  const resultEl = document.getElementById("result");
  resultEl.textContent = "";
  resultEl.classList.remove("correct");
  resultEl.classList.remove("incorrect");
}

function updateProgressBar() {
  const progressBar = document.querySelector(".progress-bar");
  const percentage = (
    (Object.keys(correctAnswers).length / totalQuestions) *
    100
  ).toFixed(1);
  
  progressBar.style.width = `${percentage}%`;
  progressBar.textContent = `${percentage}`;
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

function clearDisplay() {
  while (fingersDisplay.firstChild) {
    fingersDisplay.removeChild(fingersDisplay.firstChild);
  }
}

function addFingerImage(num) {
  const img = document.createElement("img");
  img.src = `image/${num}.png`;
  return img;
}

function showFingers(m, n) {
  clearDisplay();

  let cumulativeSum = 0;

  const columns = [];
  for (let i = 0; i < m; i++) {
    const column = document.createElement("div");
    column.className = "fingers-column";

    // Add the column number at the top
    const columnNumber = document.createElement("span");
    columnNumber.className = "column-number";
    columnNumber.textContent = i + 1;
    column.appendChild(columnNumber);

    // Determine how many images to add based on the value of n
    if (n > 5) {
      // Add an image representing the remainder of n
      const imgPart1 = addFingerImage(n - 5);
      column.appendChild(imgPart1);

      // Add an image representing 5
      const imgPart2 = addFingerImage(5);
      column.appendChild(imgPart2);
    } else {
      // Add a single image representing n
      const img = addFingerImage(n);
      column.appendChild(img);
    }

    // Calculate and display cumulative sum below each column except the last one
    if (i !== m - 1) {
      cumulativeSum += n;
      const sumText = document.createElement("span");
      sumText.className = "cumulative-sum";
      sumText.textContent = `${cumulativeSum}`;
      sumText.style.display = "block";
      sumText.style.textAlign = "center";
      sumText.style.marginTop = "10px";
      column.appendChild(sumText);
    } else {
      // For the last column, display a question mark instead of the cumulative sum
      const questionMark = document.createElement("span");
      questionMark.className = "cumulative-sum";
      questionMark.textContent = "?";
      questionMark.style.display = "block";
      questionMark.style.textAlign = "center";
      questionMark.style.marginTop = "10px";
      questionMark.style.color = "red";
      column.appendChild(questionMark);
    }

    columns.push(column);
  }

  fingersDisplay.append(...columns);
}

// 当问题被正确回答时，将正确答案保存到localStorage
function saveProgress() {
  localStorage.setItem("correctAnswers", JSON.stringify(correctAnswers));
}

// 页面加载时从localStorage加载正确答案
function loadProgress() {
  const savedAnswers = localStorage.getItem("correctAnswers");
  if (savedAnswers) {
    correctAnswers = JSON.parse(savedAnswers);
  }
}

// 更新allQuestions数组，使其只包含未掌握的题目
function updateAllQuestions() {
  allQuestions = allQuestions.filter(
    (question) => !correctAnswers[question.question]
  );
}

document.addEventListener("DOMContentLoaded", function () {
  const questionDisplay = document.getElementById("questionDisplay");
  const answerInput = document.getElementById("answerInput");
  const calculatorButtons = document.querySelectorAll(".calculator-button");
  const submitBtn = document.getElementById("submitBtn");
  const resultEl = document.getElementById("result");
  const fingersDisplay = document.getElementById("fingersDisplay");

  recognition.onresult = function (event) {
    const transcript = Array.from(event.results)
      .map((result) => result[0])
      .map((result) => result.transcript)
      .join("");

    console.log("Transcript:", transcript);

    // 提取数字
    const numbers = transcript.match(/\d+/g);
    if (numbers) {
      console.log("Transcript numbers:", numbers);
      // 将提取到的数字转换为整数并连接起来
      const numericInput = numbers[numbers.length - 1];
      answerInput.value += numericInput;

      console.log("answerInput.value:", answerInput.value);

      // 如果输入框中有完整的数字，则提交答案
      if (numericInput.trim().length > 0) {
        submitBtn.click();
      }
    }

    // 检查整个文本是否为数字
    // if (/^\d+$/.test(transcript)) {
    //     answerInput.value += transcript;

    //     // 如果输入框中有完整的数字，则提交答案
    //     if (transcript.trim().length > 0) {
    //         submitBtn.click();
    //     }
    // }
  };

  recognition.onend = function() {
      console.log('Recognition ended');
      // recognition.start();
      // console.log('Recognition started');
  };

  loadProgress(); // 页面加载时加载保存的进度
  updateAllQuestions(); // 更新题目列表，移除已掌握的题目
  updateProgressBar();
  updateMultiplicationTable();

  calculatorButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      const value = button.dataset.value;

      if (action === "clear") {
        updateDisplay("");
      } else if (value) {
        updateDisplay(answerInput.value + value);
      }
    });
  });

  correctAnswer = generateQuestion();

  // // 开始监听
  // recognition.start();
  // console.log('Recognition started');

  submitBtn.addEventListener("click", () => {
    const userAnswer = parseInt(answerInput.value);
    // console.log(`Correct answer: ${correctAnswer}`);
    // console.log(`User answer: ${userAnswer}`);

    if (userAnswer === correctAnswer) {
      resultEl.textContent = "Correct!";
      resultEl.classList.add("correct"); // 添加正确类
      resultEl.classList.remove("incorrect"); // 移除错误类，以防之前是错误的

      // 更新乘法表显示
      const expression = questionDisplay.textContent.split("=")[0].trim();
      correctAnswers[expression] = true;
      updateMultiplicationTable();
      updateProgressBar();
      saveProgress(); // 正确回答后保存进度

      // recognition.stop();
      correctAnswer = generateQuestion();
      // recognition.start();
    } else {
      resultEl.textContent = "Try again.";
      resultEl.classList.add("incorrect"); // 添加错误类
      resultEl.classList.remove("correct"); // 移除正确类，以防之前是正确的
    }

    answerInput.value = "";
  });

  answerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      submitBtn.click();
    }
  });

  document.getElementById("resetButton").addEventListener("click", function () {
    // 清空已掌握的题目列表
    correctAnswers = {};
    localStorage.removeItem("correctAnswers"); // 清除localStorage中的数据

    // 更新题目列表，确保所有题目都可以再次出现
    updateAllQuestions();

    // 刷新页面
    location.reload();
  });

  document.addEventListener("keydown", function (event) {
    if (!answerInput.matches(":focus")) {
      // 检查输入框是否未获得焦点
      if (event.key >= "0" && event.key <= "9") {
        // 数字键
        answerInput.value += event.key;

        // 检查输入框中的字符数量
        if (answerInput.value.length === 2) {
          submitBtn.click(); // 自动提交答案
        }
        // answerInput.focus(); // 设置焦点，以便后续键盘输入直接生效
      } else if (event.key === "Backspace") {
        // 退格键
        answerInput.value = answerInput.value.slice(0, -1);
        answerInput.focus();
      } else if (event.key === "Enter") {
        // 回车键
        submitBtn.click();
      }
    }
  });
});
