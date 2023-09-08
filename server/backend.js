const WebSocket = require("ws");
const redis = require("redis");
const { json } = require("express");
let redisClient;

let clients = [];
let messageHistory = [];

// Intiiate the websocket server
const initializeWebsocketServer = async (server) => {
  redisClient = redis.createClient({
    socket: {
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || "6379",
    },
  });
  await redisClient.connect();

  const websocketServer = new WebSocket.Server({ server });
  websocketServer.on("connection", onConnection);
  websocketServer.on("error", console.error);
};

// If a new connection is established, the onConnection function is called
const onConnection = async (ws) => {
  console.log("New websocket connection");
  ws.on("close", () => onClose(ws));
  ws.on("message", (message) => onClientMessage(ws, message));
  // TODO: Send all connected users and current message history to the new client
  const history = await getMessageHistory();
  if (history) {
    const parsedHistory = JSON.parse(history);
    for (const message of parsedHistory) {
      ws.send(JSON.stringify(message));
    }
  }

  clients.push({
    connection: ws,
    username: "Anonym",
  });

  const usersList = JSON.stringify({
    type: "users",
    users: clients.map((c) => c.username),
  });
  for (const client of clients) {
    client.connection.send(usersList);
  }
};

// If a new message is received, the onClientMessage function is called
const onClientMessage = async (ws, message) => {
  const messageObject = JSON.parse(message);
  console.log("Received message from client: " + messageObject.type);
  switch (messageObject.type) {
    case "user":
      // TODO: Publish all connected users to all connected clients
      const client = clients.find((c) => c.connection === ws);
      if (client) {
        client.username = messageObject.username;
      }
      const usersList = JSON.stringify({
        type: "users",
        users: clients.map((c) => c.username),
      });
      for (const client of clients) {
        client.connection.send(usersList);
      }
      break;
    case "message":
      // TODO: Publish new message to all connected clients and save in redis
      messageHistory.push(messageObject);
      await setMessageHistory(JSON.stringify(messageHistory));
      for (const client of clients) {
        client.connection.send(JSON.stringify(messageObject));
      }
      break;
    case "newUser":
      const welcomeMessage = {
        type: "message",
        username: "System",
        message: "New User has joined the chat!",
        time: new Date().toLocaleTimeString(),
      };
      for (const client of clients) {
        client.connection.send(JSON.stringify(welcomeMessage));
      }

      break;
    default:
      console.error("Unknown message type: " + messageObject.type);
  }
};

// If a connection is closed, the onClose function is called
const onClose = async (ws) => {
  console.log("Websocket connection closed");
  // TODO: Remove related user from connected users and propagate new list
  const history = await getMessageHistory();
  if (history) {
    const parsedHistory = JSON.parse(history);
    for (const message of parsedHistory) {
      ws.send(JSON.stringify(message));
    }
  }

  const index = clients.findIndex((client) => client.connection === ws);
  if (index !== -1) {
    clients.splice(index, 1);
  }
  const usersList = JSON.stringify({
    type: "users",
    users: clients.map((client) => client.username),
  });
  for (const client of clients) {
    client.connection.send(usersList);
  }
};

const getMessageHistory = async () => {
  return await redisClient.get("messageHistory");
};

const setMessageHistory = async (messageHistory) => {
  await redisClient.set("messageHistory", messageHistory);
};

module.exports = { initializeWebsocketServer };
