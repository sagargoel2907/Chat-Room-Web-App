const socket = io();

let myUsername = "";
let myCurrentRoom = "";

const chatMessages = document.getElementById("chat-messages");
const mesageInput = document.getElementById("message-input");
const roomInput = document.getElementById("room-input");
const sendMessageBtn = document.getElementById("send-message-btn");
const addRoomBtn = document.getElementById("add-room-btn");
const roomsList = document.getElementById("rooms-list");
const usersList = document.getElementById("users-list");
const joinedRoom = document.querySelectorAll(".joined-room");

sendMessageBtn.addEventListener("click", () => {
  socket.emit("sendMessage", mesageInput.value);
  mesageInput.value = "";
});
addRoomBtn.addEventListener("click", () => {
  socket.emit("addRoom", roomInput.value);
  roomInput.value = "";
});

socket.on("connect", () => {
  console.log(socket.id);
  while (!myUsername) {
    myUsername = prompt("Enter username");
  }
  myCurrentRoom = "globalChat";
  joinedRoom.forEach((element) => (element.innerHTML = myCurrentRoom));
  console.log(myUsername);
  socket.emit("createUser", myUsername);
});

socket.on("updateChat", (username, message) => {
  if (username == "INFO") {
    chatMessages.innerHTML += `<div class="announcement"><span>${message}</span></div>`;
  } else {
    chatMessages.innerHTML += `
    <article class="message ${username == myUsername ? "my-message" : ""}">
        <div class="message-bubble">
            <p class="sender-name">${username}</p><p class="message-text">${message}</p>
        </div>
    </article>`;
  }
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on("availableRooms", (rooms) => {
  addRoomDataToUI(rooms);
  addCurrentRoomMembersToUI(rooms);
});

socket.on("disconnect", () => {
  console.log("disconnected", socket.id);
});

function addRoomDataToUI(rooms) {
  roomsList.innerHTML = "";
  Object.keys(rooms).forEach((roomName) => {
    roomData = rooms[roomName];
    const room = document.createElement("div");
    room.className = `room ${roomName == myCurrentRoom ? "my-room" : ""}`;
    room.innerHTML = `
    <span class="room-name">${roomName}</span>
    <div class="room-creator">
      <span>${roomData.creator}</span>
      <span>${roomData.members.length}</span>
    </div>`;

    room.addEventListener("click", () => changeRoom(roomName));
    roomsList.appendChild(room);
  });
}

function addCurrentRoomMembersToUI(rooms) {
  usersList.innerHTML = "";
  const members = rooms[myCurrentRoom].members;
  members.forEach((memberName) => {
    usersList.innerHTML += `<p class="username ${
      memberName == myUsername ? "me" : ""
    }">${memberName}</p>`;
  });
}

function changeRoom(roomName) {
  if (myCurrentRoom == roomName) return;
  myCurrentRoom = roomName;
  console.log("changing room");
  chatMessages.innerHTML = "";
  socket.emit("changeRoom", roomName);
  joinedRoom.forEach((element) => (element.innerHTML = myCurrentRoom));
}
