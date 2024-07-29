class MultiplicationTable extends HTMLElement {
  static observedAttributes = ["correct-answers"];

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });
    // this.correctAnswers = JSON.parse(this.getAttribute("correctAnswers")) || {};
  }

  connectedCallback() {
    // console.log("connectedCallback");
    // this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // console.log("attributeChangedCallback", name, oldValue, newValue);
    if (name === "correct-answers") {
      this.correctAnswers = JSON.parse(newValue);
      this.render();
    }
  }

  render() {
    const template = document.createElement("template");
    template.innerHTML = `
        <link href="/css/bootstrap.min.css" rel="stylesheet">
        <style>
            table {
                border-collapse: collapse;
                width: 100%;
            }
            table tr:nth-child(even) {
                background-color: #f2f2f2;
            }
            td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: center;
            }
            .correct-answer {
                background-color: green;
                color: white;
            }
        </style>
        <table></table>
    `;

    const table = template.content.querySelector("table");
    // this.correctAnswers = {'1 x 1': true, '2 x 2': true, '3 x 3': true, '4 x 4': true, '5 x 5': true, '6 x 6': true, '7 x 7': true, '8 x 8': true, '9 x 9': true}

    for (let i = 1; i <= 9; i++) {
      let row = document.createElement("tr");

      for (let j = 1; j <= 9; j++) {
        if (j <= i) {
          let expression = `${j} x ${i}`;
          let cell = document.createElement("td");

          if (this.correctAnswers[expression]) {
            cell.classList.add("correct-answer");
          }

          // 添加onclick事件监听器
          cell.onclick = () => handleCellClick(expression);
          cell.textContent = expression;

          row.appendChild(cell);
        } else {
          // 当 j 大于 i 时，生成一个没有onclick的td，且设置为不可见
          let invisibleCell = document.createElement("td");
          invisibleCell.classList.add("d-none");
          row.appendChild(invisibleCell);
        }
      }

      table.appendChild(row);
    }

    this.shadowRoot.innerHTML = "";
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
}

customElements.define("multiplication-table", MultiplicationTable);
