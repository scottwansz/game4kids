// 定义常量
const VOICE_RECOGNITION_DELAY = 3000; // 语音识别重启延迟时间
const SPEECH_SYNTHESIS_LANGUAGE = "en-US"; // 语音合成语言

// 初始化语音识别
let recognition = new webkitSpeechRecognition();
recognition.isListening = false;
// recognition.lang = "zh-CN";
recognition.continuous = true;
recognition.interimResults = false;

recognition.onstart = function () {
  console.log("Recognition started");
  recognition.isListening = true;
};

recognition.onend = function () {
  console.log("Recognition ended");
  recognition.isListening = false;
};

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

recognition.onend = function () {
  console.log("Recognition ended");
  // recognition.start();
  // console.log('Recognition started');
};

// 创建语音播报函数
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH_SYNTHESIS_LANGUAGE;
  
    recognition.stop();
    window.speechSynthesis.speak(utterance);
    // 播报完成后重新开启语音识别
    setTimeout(() => {
      if (!recognition.isListening) {
        recognition.start();
      }
    }, VOICE_RECOGNITION_DELAY);
  }

// speak(`What's ${num1} times ${num2} ?`);
speak(`Hello, Qiu Qiu`)