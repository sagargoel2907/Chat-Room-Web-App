export let rooms = {};
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

export function leaveRoom(socket) {
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

export function joinRoom(socket, roomName) {
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
