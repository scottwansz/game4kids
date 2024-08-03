class TimerComponent extends HTMLElement {
  constructor() {
    super();

    // 创建 Shadow DOM
    const shadow = this.attachShadow({ mode: 'open' });

    // 创建模板
    const template = document.createElement('template');
    template.innerHTML = `
      <style>
        :host {
          display: flex;
          align-items: center;
          border: 1px solid var(--border-color, #ccc);
          border-radius: 5px;
          padding: 5px;
          background-color: var(--background-color, #fff);
          color: var(--text-color, #000);
        }
        span {
          font-weight: bold;
          margin-right: 10px;
        }
      </style>
      <span id="timer">30:00</span>
    `;

    // 将模板内容添加到 Shadow DOM 中
    shadow.appendChild(template.content.cloneNode(true));

    // 获取元素引用
    this.timerElement = shadow.querySelector('#timer');

    // 初始化计时器状态
    this.timeRemaining = 30;
    this.timerRunning = false;
    this.timerInterval = null;

    // 绑定事件处理函数
    this.startTimer = this.startTimer.bind(this);
    this.updateTimerDisplay = this.updateTimerDisplay.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
    this.restartTimer = this.restartTimer.bind(this);
  }

  connectedCallback() {
    // 在元素插入文档时调用
    this.startTimer();
  }

  disconnectedCallback() {
    // 在元素从文档中移除时调用
    this.stopTimer();
  }

  // 启动计时器
  startTimer() {
    if (!this.timerRunning) {
      this.timerRunning = true;
      this.timerInterval = setInterval(() => {
        if (this.timeRemaining > 0) {
          this.timeRemaining--;
          this.updateTimerDisplay();
        } else {
          this.restartTimer();
        }
      }, 1000);
    }
  }

  // 更新计时器显示
  updateTimerDisplay() {
    let minutes = Math.floor(this.timeRemaining / 60);
    let seconds = this.timeRemaining % 60;
    this.timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // 停止计时器
  stopTimer() {
    clearInterval(this.timerInterval);
    this.timerRunning = false;
    this.timeRemaining = 30; // 重置时间
    this.updateTimerDisplay();
  }

  // 重置计时器
  restartTimer() {
    this.stopTimer();
    this.startTimer();
  }
}

// 注册自定义元素
customElements.define('timer-component', TimerComponent);