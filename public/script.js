// Connect to the socket.io server
const socket = io();

// Get DOM elements
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message");
const messagesContainer = document.getElementById("messages");
const usersList = document.getElementById("users");
const typingIndicator = document.getElementById("typing-indicator");

let username = null;

// Prompt user for their name
while (!username) {
  username = prompt("Enter your name to join the chat:");
  if (username) {
    socket.emit("join", username);
  }
}

// Listen for the updated user list
socket.on("userList", (users) => {
  usersList.innerHTML = ""; // Clear the current list
  users.forEach((user) => {
    const li = document.createElement("li");
    li.textContent = user;
    usersList.appendChild(li);
  });
});

// Listen for incoming messages
socket.on("chatMessage", (data) => {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  messageDiv.classList.add(data.username === username ? "right" : "left");
  messageDiv.innerHTML = `
    <span class="username">${data.username}</span>
    ${data.message}
  `;
  messagesContainer.appendChild(messageDiv);

  // Auto-scroll to the bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

// Listen for typing indication
socket.on("typing", (user) => {
  typingIndicator.textContent = `${user} is typing...`;
});

// Remove typing indication when user stops typing
socket.on("stopTyping", () => {
  typingIndicator.textContent = "";
});

// Send a message
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (message) {
    socket.emit("chatMessage", { username, message });
    messageInput.value = "";
    messageInput.focus();
  }
});

// Notify server when typing
let typingTimeout;
messageInput.addEventListener("input", () => {
  socket.emit("typing", username);
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit("stopTyping");
  }, 1000); // Stop typing after 1 second of inactivity
});
