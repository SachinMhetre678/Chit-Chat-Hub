const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");


//get username and room from url
const{username,room} = Qs.parse(location.search,{
    ignoreQueryPrefix: true  // to just ignore ? and all unnessary tag from url
});


const socket = io();   //we have accept to script tag

//join chat room
socket.emit("joinRoom",{ username,room})

//Get room and users
socket.on("roomUsers",({room , users})=>{
    outputRoomName(room);
    outputUsers(users);
})

//Message from server
socket.on("message",message =>{
    console.log(message);
    outputMessage(message);

    //Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//message Submit
chatForm.addEventListener("submit",(e)=>{
    e.preventDefault();

    //get message text
    const msg = e.target.elements.msg.value;

    //emit a message to server
    socket.emit("chatMessage",msg);

    //Clear input
    e.target.elements.msg.value="";
    e.target.elements.msg.focus();  
})

//Output message for DOM
function outputMessage(message){
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector(".chat-messages").appendChild(div);
}

//Add room name to DOM
function outputRoomName(room){
    roomName.innerText = room;
}

//Add users to DOM
function outputUsers(users){
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join("")}
    `;
}