import { Server } from "socket.io";
import http from "http";
import express from "express";
import url from "url";
import path from "path";
import "dotenv/config";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT;

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(__filename, import.meta.url);
console.log(__dirname);

app.use(express.static(path.join(__dirname, "./public")));

let rooms = {};
rooms["globalChat"] = {
  creator: "anonymous",
  members: [],
};
rooms["chess"] = {
  creator: "anonymous",
  members: [],
};
rooms["javascript"] = {
  creator: "anonymous",
  members: [],
};

function leaveRoom(socket) {
  if (!socket.username) return;
  socket
    .to(socket.currentRoom)
    .emit(
      "updateChat",
      "INFO",
      `${socket.username} have left the ${socket.currentRoom}`
    );
  const index = rooms[socket.currentRoom].members.findIndex(
    (name) => name == socket.username
  );
  rooms[socket.currentRoom].members.splice(index, 1);
  socket.broadcast.emit("availableRooms", rooms);
}

function joinRoom(socket, roomName) {
  socket.leave(socket.currentRoom);
  socket.currentRoom = roomName;
  rooms[socket.currentRoom].members.push(socket.username);
  socket.join(socket.currentRoom);
  socket.emit(
    "updateChat",
    "INFO",
    "You have joined the " + socket.currentRoom
  );
  socket
    .to(socket.currentRoom)
    .emit(
      "updateChat",
      "INFO",
      `${socket.username} have joined the ${socket.currentRoom}`
    );

  io.emit("availableRooms", rooms);
}

// [
//   {
//     roomName: "globalChat",
//     roomCreator: "anonymous",
//   },
//   {
//     roomName: "chess",
//     roomCreator: "anonymous",
//   },
//   {
//     roomName: "javascript",
//     roomCreator: "anonymous",
//   },
// ];

io.on("connection", (socket) => {
  socket.emit("availableRooms", rooms);

  socket.on("createUser", (username) => {
    if (socket.username) return;
    if (!username) return;
    socket.username = username;
    joinRoom(socket, "globalChat");
  });

  socket.on("sendMessage", (message) => {
    io.sockets
      .to(socket.currentRoom)
      .emit("updateChat", socket.username, message);
  });

  socket.on("addRoom", (newRoomName) => {
    if (!newRoomName | rooms.hasOwnProperty(newRoomName)) return;
    rooms[newRoomName] = {
      creator: socket.username,
      members: [],
    };
    io.emit("availableRooms", rooms);
  });

  socket.on("changeRoom", (roomName) => {
    // if (socket.currentRoom == roomName) return;
    console.log("changing room");
    leaveRoom(socket);
    joinRoom(socket, roomName);
  });

  socket.on("disconnect", () => {
    console.log("disconnected from server", socket.username);
    leaveRoom(socket);
  });
});

server.listen(PORT, () => {
  console.log("server listening on", PORT);
});
