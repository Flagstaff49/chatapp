if (location.host.includes("localhost")) {
  // Load livereload script if we are on localhost
  document.write(
    '<script src="http://' +
      (location.host || "localhost").split(":")[0] +
      ':35729/livereload.js?snipver=1"></' +
      "script>"
  );
}
const backendUrl = window.location.origin
  .replace(/^http/, "ws")
  .replace(/^https/, "wss");
const socket = new WebSocket(backendUrl);

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!! DON'T TOUCH ANYTHING ABOVE THIS LINE !!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

socket.addEventListener("open", async (event) => {
  console.log("WebSocket connected!");
  // TODO: create message object to transmit the user to the backend
  const username = document.getElementById("username").value;
  const message = { type: "newUser", username };
  socket.send(JSON.stringify(message));
});

socket.addEventListener("message", (event) => {
  const messageObject = JSON.parse(event.data);
  console.log("Received message from server: " + messageObject.type);
  switch (messageObject.type) {
    case "users":
      // TODO: Show the current users as DOM elements
      showUsers(messageObject.users);
      break;
    case "message":
      // TODO: Show new message as DOM element append to chat history
      showMessage(messageObject);
      break;
    default:
      console.error("Unknown message type: " + messageObject.type);
  }
});

function showUsers(users) {
  // TODO: Show the current users as DOM elements
  const activeUsersContainer = document.getElementById("userCard");
  activeUsersContainer.innerHTML = "";
  users.forEach((user) => {
    const userDiv = document.createElement("div");
    userDiv.className = "p-2 d-flex align-items-center mb-2 bg-light rounded";
    const icon = document.createElement("i");
    icon.className = "bi bi-person-fill me-2 text-success";
    userDiv.appendChild(icon);
    const usernameSpan = document.createElement("span");
    usernameSpan.innerHTML = user;
    userDiv.appendChild(usernameSpan);
    activeUsersContainer.appendChild(userDiv);
  });
}

function showMessage(message) {
  // TODO: Show new message as DOM element append to chat history
  const messageContainer = document.createElement("div");
  messageContainer.className = "mb-3";

  const innerMessageElement = document.createElement("div");
  innerMessageElement.className = "p-3 bg-light rounded";

  const messageHeaderElement = document.createElement("div");
  messageHeaderElement.className = "d-flex justify-content-between";

  const usernameElement = document.createElement("span");
  usernameElement.className = "text-primary fw-bold";
  usernameElement.innerHTML = message.username;

  const timeElement = document.createElement("span");
  timeElement.className = "text-muted";
  timeElement.innerHTML = "at " + message.time;

  messageHeaderElement.appendChild(usernameElement);
  messageHeaderElement.appendChild(timeElement);

  const messageTextElement = document.createElement("p");
  messageTextElement.className = "mt-2";
  messageTextElement.innerHTML = message.message;

  innerMessageElement.appendChild(messageHeaderElement);
  innerMessageElement.appendChild(messageTextElement);

  messageContainer.appendChild(innerMessageElement);
  document.getElementById("messageCard").appendChild(messageContainer);

  const messageCard = document.getElementById("messageCard");
  messageCard.scrollTop = messageCard.scrollHeight;
}

socket.addEventListener("close", (event) => {
  console.log("WebSocket closed.");
});

socket.addEventListener("error", (event) => {
  console.error("WebSocket error:", event);
});

function changeUsername() {
  // TODO: Implement change username and forward new username to backend
  const newUserName = document.getElementById("username").value;
  if (newUserName === "") return;
  const message = { type: "user", username: newUserName };
  socket.send(JSON.stringify(message));
}

function sendMessage() {
  // TODO get message from input and send message as object to backend
  const messageText = document.getElementById("message").value;
  if (messageText === "") return;
  const message = {
    type: "message",
    username: document.getElementById("username").value,
    message: messageText,
    time: new Date().toLocaleTimeString(),
  };
  socket.send(JSON.stringify(message));
  document.getElementById("message").value = "";
}
