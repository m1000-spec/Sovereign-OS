// Sovereign Trading Bridge - Content Script
// This script acts as a bridge between the trader's voice and the Sovereign Analyst app.

// Inject UI
const root = document.createElement('div');
root.id = 'sovereign-bridge-root';
root.style.top = '100px';
root.style.right = '20px';
document.body.appendChild(root);

root.innerHTML = `
  <div id="sovereign-bridge-button">
    <svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
  </div>
  <div id="sovereign-bridge-panel">
    <div class="sovereign-panel-header">
      <span>Sovereign Bridge</span>
      <button id="sovereign-close-btn" style="background:none;border:none;color:white;cursor:pointer;font-size:16px;">&times;</button>
    </div>
    <div class="sovereign-mic-container">
      <button id="sovereign-mic-btn">
        <svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
      </button>
      <div id="sovereign-status-text">Click to start speaking</div>
    </div>
    <div id="sovereign-response-text">Bridge active. Speak to send data to Sovereign Analyst.</div>
  </div>
`;

const button = document.getElementById('sovereign-bridge-button');
const panel = document.getElementById('sovereign-bridge-panel');
const micBtn = document.getElementById('sovereign-mic-btn');
const statusText = document.getElementById('sovereign-status-text');
const responseText = document.getElementById('sovereign-response-text');
const closeBtn = document.getElementById('sovereign-close-btn');

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
    statusText.innerText = "Sending to Sovereign Analyst...";
    bridgeToApp(transcript);
  };

  recognition.onerror = (event) => {
    micBtn.classList.remove('listening');
    if (event.error === 'not-allowed') {
      statusText.innerText = "Error: Mic access denied.";
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

function bridgeToApp(text) {
  // Send message to the Sovereign Analyst page
  window.postMessage({
    type: 'SOVEREIGN_BRIDGE_DATA',
    payload: text
  }, "*");
  
  responseText.innerText = `Sent: "${text}"`;
  statusText.innerText = "Data bridged successfully";
}
