const VITE_GEMINI_API_KEY = "AIzaSyAij1xmZY2TD9MisoUGpT-kCXsYcLZUGhU";
const SYSTEM_CONTEXT = "You are a trading co-pilot for an NQ futures trader. The trader uses a methodology called PB Trading Theory. Rules: one trade per day, 1% risk, trade only 9:30-11AM NY time. Entry is based on 5 minute FVG inversions. Only trade with the trend. Breakeven is moved at intermediate highs and lows. Assess the setup the trader describes and give a quick verdict: high probability, medium probability, or low probability. If high probability suggest they can risk up to 1.5%. Be concise, maximum 3 sentences.";

// Inject UI
const root = document.createElement('div');
root.id = 'pb-copilot-root';
root.style.top = '100px';
root.style.right = '20px';
document.body.appendChild(root);

root.innerHTML = `
  <div id="pb-copilot-button">
    <svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
  </div>
  <div id="pb-copilot-panel">
    <div class="pb-panel-header">
      <span>PB Co-Pilot</span>
      <button id="pb-close-btn" style="background:none;border:none;color:white;cursor:pointer;font-size:16px;">&times;</button>
    </div>
    <div class="pb-mic-container">
      <button id="pb-mic-btn">
        <svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
      </button>
      <div id="pb-status-text">Click to start speaking</div>
    </div>
    <div id="pb-response-text">Waiting for setup description...</div>
  </div>
`;

const button = document.getElementById('pb-copilot-button');
const panel = document.getElementById('pb-copilot-panel');
const micBtn = document.getElementById('pb-mic-btn');
const statusText = document.getElementById('pb-status-text');
const responseText = document.getElementById('pb-response-text');
const closeBtn = document.getElementById('pb-close-btn');

// Draggable logic
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

button.addEventListener('mousedown', dragStart);
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', dragEnd);

function dragStart(e) {
  initialX = e.clientX - xOffset;
  initialY = e.clientY - yOffset;
  if (e.target === button || button.contains(e.target)) {
    isDragging = true;
  }
}

function drag(e) {
  if (isDragging) {
    e.preventDefault();
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;
    xOffset = currentX;
    yOffset = currentY;
    setTranslate(currentX, currentY, root);
  }
}

function setTranslate(xPos, yPos, el) {
  el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
}

function dragEnd() {
  initialX = currentX;
  initialY = currentY;
  isDragging = false;
}

// UI Toggle
button.addEventListener('click', () => {
  if (!isDragging) {
    panel.classList.toggle('visible');
  }
});

closeBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  panel.classList.remove('visible');
});

// Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    micBtn.classList.add('listening');
    statusText.innerText = "Listening...";
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    statusText.innerText = "Processing...";
    processSetup(transcript);
  };

  recognition.onerror = (event) => {
    micBtn.classList.remove('listening');
    if (event.error === 'not-allowed') {
      statusText.innerText = "Error: Mic access denied. Check browser permissions.";
    } else {
      statusText.innerText = "Error: " + event.error;
    }
  };

  recognition.onend = () => {
    micBtn.classList.remove('listening');
  };
} else {
  statusText.innerText = "Speech Recognition not supported";
}

micBtn.addEventListener('click', () => {
  if (recognition) {
    recognition.start();
  }
});

async function processSetup(text) {
  responseText.innerText = "Analyzing setup...";
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${VITE_GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${SYSTEM_CONTEXT}\n\nTrader says: ${text}` }]
        }]
      })
    });

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    responseText.innerText = aiResponse;
    statusText.innerText = "Analysis complete";
    
    speak(aiResponse);
  } catch (error) {
    console.error("Gemini Error:", error);
    responseText.innerText = "Error connecting to Gemini API.";
    statusText.innerText = "Click to try again";
  }
}

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
}
