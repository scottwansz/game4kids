class CalculatorComponent extends HTMLElement {
  static get observedAttributes() {
    return ["question"]; // 观察 question 属性的变化
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.correctAnswer = 0;
    this.question = "";

    this.render();
    this.initListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "question" && oldValue !== newValue) {
      this.question = newValue;
      this.updateQuestionDisplay(newValue);
      this.calculateCorrectAnswer(newValue);
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link href="css/bootstrap.min.css" rel="stylesheet">
      <link href="css/style.css" rel="stylesheet">
      <style>
        .game-controls {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            width: 200px;
            /* 调整宽度以适应布局需求 */
            /* 添加下面的属性以允许计算器扩展 */
            flex-shrink: 0;
            /* 防止缩小 */
            flex-grow: 0;
            /* 不允许增长 */
        }

        #calculatorDisplay {
            display: flex;
            align-items: center;
            /* 垂直居中对齐 */
            font-weight: bold;
        }

        #questionDisplay {
            flex: 2;
            /* 占据2份空间 */
            font-size: 1.2em;
            /* 调整字体大小以匹配输入框 */
            white-space: nowrap;
            /* 确保文本不会换行 */
            margin-right: 5px;
            /* 与输入框之间留出一些空隙 */
            text-align: center;
            /* 靠右对齐 */
        }

        #answerInput {
            flex: 1;
            /* 占据1份空间 */
            width: 100%;
            /* 确保输入框占据其分配的所有空间 */
            font-weight: bold;
        }

        .calculator-buttons-container {
            display: flex;
            flex-wrap: wrap;
            /* 允许按钮换行 */
            justify-content: space-between;
            gap: 5px;
            /* 按钮间的间隙 */
        }

        /* 普通按钮 */
        .calculator-button {
            /* flex: 1; 默认占据一列 */
            width: calc(33.33% - 10px);
            /* 减去两边的gap */
            font-weight: bold;
        }
      </style>
      <div class="game-controls">
        <div id="calculatorDisplay" class="mb-3 d-flex align-items-center">
          <div id="questionDisplay" class="mr-2">${this.question}</div>
          <input type="text" id="answerInput" class="form-control">
        </div>
        <div class="calculator-buttons-container">
          <button class="btn btn-light calculator-button" data-value="1">1</button>
          <button class="btn btn-light calculator-button" data-value="2">2</button>
          <button class="btn btn-light calculator-button" data-value="3">3</button>

          <button class="btn btn-light calculator-button" data-value="4">4</button>
          <button class="btn btn-light calculator-button" data-value="5">5</button>
          <button class="btn btn-light calculator-button" data-value="6">6</button>

          <button class="btn btn-light calculator-button" data-value="7">7</button>
          <button class="btn btn-light calculator-button" data-value="8">8</button>
          <button class="btn btn-light calculator-button" data-value="9">9</button>

          <button class="btn btn-light calculator-button" data-value="0">0</button>
          <button class="btn btn-light calculator-button" data-action="clear">C</button>

          <button class="btn btn-primary calculator-button" id="submitBtn">O</button>
        </div>
        <p id="result" class="mt-3"></p>
      </div>
    `;
  }

  updateQuestionDisplay(question) {
    const questionDisplay = this.shadowRoot.querySelector("#questionDisplay");
    questionDisplay.textContent = question + " = ";
  }

  calculateCorrectAnswer(question) {
    // 解析问题字符串，计算正确答案
    const match = question.match(/(\d+) x (\d+)/);
    if (match) {
      this.correctAnswer = parseInt(match[1], 10) * parseInt(match[2], 10);
    }
  }

  initListeners() {
    const buttons = this.shadowRoot.querySelectorAll(".calculator-button");
    buttons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const action = button.dataset.action;
        const value = button.dataset.value;

        if (action === "clear") {
          this.clearDisplay();
        } else if (value) {
          this.updateDisplay(value);
        }
      });
    });

    const submitBtn = this.shadowRoot.querySelector("#submitBtn");
    submitBtn.addEventListener("click", () => {
      // 使用组件内部的状态来检查答案
      const userAnswer = parseInt(
        this.shadowRoot.querySelector("#answerInput").value
      );

      //   console.log("this.question in caculator:", this.question);

      if (userAnswer === this.correctAnswer) {
        // 清除答案输入框
        this.shadowRoot.querySelector("#answerInput").value = "";
        this.dispatchEvent(
          new CustomEvent("correctAnswer", {
            detail: { question: this.question, answer: userAnswer },
          })
        );
      } else {
        this.dispatchEvent(
          new CustomEvent("wrongAnswer", {
            detail: { question: this.question, answer: userAnswer },
          })
        );
      }
    });

    const answerInput = this.shadowRoot.getElementById("answerInput");
    answerInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        submitBtn.click();
      }
    });
  }

  clearDisplay() {
    const answerInput = this.shadowRoot.querySelector("#answerInput");
    answerInput.value = "";
  }

  updateDisplay(value) {
    const answerInput = this.shadowRoot.querySelector("#answerInput");
    answerInput.value += value;
  }
}

customElements.define("calculator-component", CalculatorComponent);
