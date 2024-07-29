class FingersDisplay extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <link href="css/bootstrap.min.css" rel="stylesheet">
      <link href="css/style.css" rel="stylesheet">
      <style>
        .fingers-display {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          /* 确保列不换行 */
          justify-content: center;
          align-items: center;
          padding: 1rem;

          /* 下面的属性用于分配空间 */
          flex-grow: 1;
          /* 允许手指展示区扩展以填充可用空间 */
          flex-basis: 0;
          /* 初始基础宽度为0，允许扩展 */
          max-width: calc(85% - 2rem);
          /* 限制最大宽度 */
        }

        .fingers-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-right: 5px;
          /* 或者使用 auto margin 来平均分布列 */
          flex-shrink: 0;
          /* 防止列缩小 */
        }

        .fingers-column img {
          max-width: 100%;
          /* 确保图片宽度不超过其容器 */
          max-height: 100px;
          /* 减小图片高度 */
          object-fit: contain;
        }

        .fingers-column:nth-child(5) {
          border-right: 2px dashed green;
        }

        .column-number {
          display: block;
          text-align: center;
          font-size: 2em;
          margin-bottom: 5px;
          color: #afaeae;
          font-weight: bold;
        }

        .cumulative-sum {
          font-size: 2em;
          /* Large font size */
          font-weight: bold;
          /* Bold font */
          color: rgb(235, 136, 136);
          /* Bright red color */
        }
      </style>
      <div class="fingers-display" id="fingersContainer"></div>
    `;
  }

  connectedCallback() {
    this.renderFingers(0, 0);
  }

  renderFingers(m, n) {
    const fingersContainer = this.shadowRoot.getElementById("fingersContainer");
    fingersContainer.innerHTML = ""; // Clear previous content

    let cumulativeSum = 0;

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
        const imgPart1 = this.createFingerImage(n - 5);
        column.appendChild(imgPart1);

        // Add an image representing 5
        const imgPart2 = this.createFingerImage(5);
        column.appendChild(imgPart2);
      } else {
        // Add a single image representing n
        const img = this.createFingerImage(n);
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

      fingersContainer.appendChild(column);
    }
  }

  createFingerImage(num) {
    const img = document.createElement("img");
    img.src = `image/${num}.png`;
    return img;
  }
}

customElements.define("fingers-display", FingersDisplay);
