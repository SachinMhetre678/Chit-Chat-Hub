const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");   //open bidireectional communication between server and client
const formatMessage = require("./utiles/messages")
const {userJoin, getCurrentUser,userLeave,getRoomUsers} = require("./utiles/user");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = 3000;


//Set static folder
app.use(express.static(path.join(__dirname,"public")));

const botName = "Admin";

//Run when a client connect
io.on("connection", socket => {

    socket.on("joinRoom",({username,room}) => {
        const user = userJoin(socket.id,username,room);


        socket.join(user.room)
        //Welcome user
        //Broadcast to all clients the number of connected users
        socket.emit("message",formatMessage(botName,"Welcome to ChatCord!"))  //client to single client

        //Broadcast when a user connects
        socket.broadcast.to(user.room).emit("message",formatMessage(botName,`${user.username} has joined the chat`));  // all of the client expect the client that connecting
        /*diff between socket.emit and socket.broademit is socket.broademit will
        emit everybody expect user that connecting we dont need to notify user that user connecting */

        //  io.emit(); //all the client in general 3 ways  

        //Send user and room info
        io.to(user.room).emit("roomUsers",{
            room:user.room,
            users:getRoomUsers(user.room)
        });
    });

    //Listen for chatMessage
    socket.on("chatMessage",(msg)=>{

        const user = getCurrentUser(socket.id);
        io.to(user.room).emit("message",formatMessage(user.username,msg));
    })

    socket.on("disconnect", () => {
        const user = userLeave(socket.id);
    
        if (user) {
            io.to(user.room).emit("message", formatMessage(botName, `${user.username} left the chat!`));
    
            // Send user and room info only if user is found
            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room),
            });
        }
    });
})

server.listen(port,()=>{
    console.log(`Server running on ${port}`);
});