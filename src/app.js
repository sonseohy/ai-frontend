const chatContainer = document.getElementById("chat-container");
const messageForm = document.getElementById("message-form");
const userInput = document.getElementById("user-input");
const initialMessage = document.getElementById("initial-message");
const textarea = document.getElementById("user-input");
const apiSelector = document.getElementById("api-selector");

// Create a message bubble
function createMessageBubble(content, sender = "user") {
  const wrapper = document.createElement("div");
  wrapper.classList.add("message-wrapper");

  // Avatar (only show avatar for assistant)
  const avatar = document.createElement("div");
  
  if (sender === "assistant") {
    avatar.classList.add("avatar-assistant");
  }

  // Message
  const bubble = document.createElement("div");
  bubble.classList.add("message-bubble");

  if (sender === "assistant") {
    bubble.classList.add("assistant-message");
  } else {
    bubble.classList.add("user-message");
  }

  // 줄바꿈 유지
  bubble.textContent = content;

  if (sender === "assistant") {
    wrapper.appendChild(avatar);
  }
  wrapper.appendChild(bubble);
  return wrapper;
}

// Scroll to bottom
function scrollToBottom() {
  const scrollHeight = chatContainer.scrollHeight;
  chatContainer.scrollTo({
    top: scrollHeight,
    behavior: 'smooth'
  });
}

// Fetch assistant response from the selected backend endpoint
async function getAssistantResponse(userMessage) {
  const mode = apiSelector.value;
  const url =
    mode === "assistant"
      ? "http://localhost:8000/assistant"
      : "http://localhost:8000/chat";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: userMessage }),
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();
  return data.reply;
}

// Handle form submission
messageForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;

  // 초기 메시지 제거
  if (initialMessage) {
    initialMessage.remove();
  }

  // 사용자 메시지
  chatContainer.appendChild(createMessageBubble(message, "user"));
  userInput.value = "";
  scrollToBottom();

  // Assistant response
  try {
    const response = await getAssistantResponse(message);
    chatContainer.appendChild(createMessageBubble(response, "assistant"));
    scrollToBottom();
  } catch (error) {
    console.error("Error fetching assistant response:", error);
    chatContainer.appendChild(
      createMessageBubble(
        "Error fetching response. Check console.",
        "assistant"
      )
    );
    scrollToBottom();
  }
});

// Auto-resize textarea
textarea.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    if (!e.shiftKey) {
      e.preventDefault();
      // 내용이 있을 때만 전송
      if (this.value.trim()) {
        messageForm.dispatchEvent(new Event("submit"));
      }
    }
  }
});

// 자동 높이 조절
textarea.addEventListener("input", function() {
  this.style.height = "24px";
  const newHeight = Math.min(this.scrollHeight, 200);
  this.style.height = newHeight + "px";
  scrollToBottom();
});