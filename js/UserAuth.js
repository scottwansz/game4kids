class UserAuth extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.render();
  }

  async render() {
    this.shadowRoot.innerHTML = `
        <style>
            /* Add styles here */
        </style>
        <div id="authContainer"></div>
        <div id="userInfo" style="display:none;">
            <img id="userAvatar" src="">
            <span id="userName"></span>
        </div>
        <video id="video" width="320" height="240" autoplay></video>
        <canvas id="canvas" style="display:none;"></canvas>
    `;
    this.addForms();
  }

  async addForms() {
    const container = this.shadowRoot.getElementById("authContainer");
    container.innerHTML = `
        <form id="loginForm">
            <button type="button" id="loginWithCamera">Login with Camera</button>
        </form>
        <form id="registerForm">
            <input type="text" id="usernameInput" placeholder="Enter your name">
            <button type="button" id="registerWithCamera">Register with Camera</button>
        </form>
    `;
    await this.addEventListeners();
  }

  async addEventListeners() {
    // Schedule the requestCameraAccess call to run after a short delay
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Now request camera access
    const stream = await this.requestCameraAccess();

    // Continue with the rest of the method
    const loginButton = this.shadowRoot.getElementById("loginWithCamera");
    const registerButton = this.shadowRoot.getElementById("registerWithCamera");
    loginButton.addEventListener("click", this.loginWithCamera.bind(this));
    registerButton.addEventListener(
      "click",
      this.registerWithCamera.bind(this)
    );
  }

  async loginWithCamera() {
    const stream = await this.requestCameraAccess();
    const capturedImageData = await this.captureImage(stream);
    const detection = await faceapi
      .detectAllFaces(capturedImageData)
      .withFaceLandmarks()
      .withFaceDescriptors();
    const storedDescriptors = JSON.parse(
      localStorage.getItem("userFaceDescriptor")
    );

    if (storedDescriptors && detection.length > 0) {
      const similarity = faceapi.computeCosineSimilarity(
        storedDescriptors[0],
        detection[0].descriptor
      );
      if (similarity > 0.6) {
        // Adjust threshold as needed
        const username = localStorage.getItem("username");
        alert(`Welcome back, ${username}!`);
        this.showUserInfo();
      } else {
        alert("Login failed. Please try again.");
      }
    } else {
      alert("No face detected or no stored data.");
    }
  }

  async registerWithCamera() {
    const username = this.shadowRoot.getElementById("usernameInput").value;
    const stream = await this.requestCameraAccess();
    const imageData = await this.captureImage(stream);
    const detection = await faceapi
      .detectAllFaces(imageData)
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (detection.length > 0) {
      localStorage.setItem("username", username);
      localStorage.setItem(
        "userFaceDescriptor",
        JSON.stringify(detection[0].descriptor)
      );
      alert("Registration successful!");
    } else {
      alert("No face detected. Please try again.");
    }
  }

  showUserInfo() {
    const userName = this.shadowRoot.querySelector("#userName");
    const userAvatar = this.shadowRoot.querySelector("#userAvatar");
    userName.textContent = localStorage.getItem("username");
    userAvatar.src = localStorage.getItem("userImage");
    const userInfoDiv = this.shadowRoot.querySelector("#userInfo");
    userInfoDiv.style.display = "block";
  }

  hideUserInfo() {
    const userInfoDiv = this.shadowRoot.querySelector("#userInfo");
    userInfoDiv.style.display = "none";
  }

  async requestCameraAccess() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      return stream;
    } catch (error) {
      console.error("Error accessing camera:", error);
      throw error;
    }
  }

  captureImage(stream) {
    const video = this.shadowRoot.getElementById("video");
    const canvas = this.shadowRoot.getElementById("canvas");
    video.srcObject = stream;

    return new Promise((resolve) => {
      video.addEventListener("playing", () => {
        canvas.getContext("2d").drawImage(video, 0, 0, 320, 240);
        const imageDataUrl = canvas.toDataURL();
        const image = new Image();
        image.src = imageDataUrl;
        image.onload = () => resolve(image);
      });

      // 如果 playing 事件未触发，则使用 canplay 作为备选
      video.addEventListener("canplay", () => {
        canvas.getContext("2d").drawImage(video, 0, 0, 320, 240);
        const imageDataUrl = canvas.toDataURL();
        const image = new Image();
        image.src = imageDataUrl;
        image.onload = () => resolve(image);
      });
    });
  }
}

customElements.define("user-auth", UserAuth);
