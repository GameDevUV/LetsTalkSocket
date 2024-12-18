require('dotenv').config();
// creating app instance of express
const app = require('express')();
// creating http server
const httpserver = require('http').createServer(app);
// importing socket
const Socketio = require('socket.io');
const cors = require('cors')
const axios = require('axios');
const { response } = require('express');
app.use(cors());

// getting app
app.get('/', (req, resp) => {
})

const users = [];

let API = process.env.SERVER_API;

// socket code

let io = Socketio(httpserver, {
    cors: {
        origin: "*",
    }
});

let onlineUsers = [];
// set status for user is online or offline
const setOnline = (userName, status) => {
    axios.put(`${API}user/status`, {
        userName,
        status
    }).then((resp) => {
    }).catch((e) => {
    })
}

io.on('connection', (socket) => {
    
    let userName ;
    socket.on('setOnline', (payload) => {
        userName = payload.userName
        setOnline(payload.userName , "ONLINE")
        io.emit('refresh' , {refresh: true})
    })

    console.log("app is conecte to live socket", socket.id);

    socket.on('sendDetails', (payload) => {
        userName = payload.userName;
    })
    socket.on("joinRoom", ({ chatId }, callback) => {
        console.log(`Socket ${socket.id} joining room: ${chatId}`);
        // Join the room
        socket.join(chatId);
        // Send acknowledgment to the client
        if (callback) {
            callback({ status: "ok", message: `Joined room ${chatId}` });
        }
    });

    socket.on('sendMessage', (payload) => {
        let { userName, message, chatId, toUserName } = payload

        axios.post(`${API}chat/sendmessage`, {
            senderId: payload.userName,
            content: payload.message,
            chatId: payload.chatId,
            toUserName: payload.toUserName
        }).then((resp) => {

            io.emit("newMessage", {
                content: message,
                chatId: chatId,
                senderId: userName
            }, (response) => {
                console.log("message sent to room: ", chatId)
            });

        }).catch((e) => {
            // console.log("error in send ", e);
        })
    })

    socket.on('haveMessage', (payload) => {
        console.log("new message got : ", "from Chat Id: ", payload.chatId);
        io.emit("getMessage", { message: payload.msg }, (response) => {
            console.log("message sent");
        });
    })

    socket.on('disconnect', () => {
        setOnline(userName , "OFFLINE")
        io.emit('refresh' , {refresh: true})
    })
})

let port = process.env.PORT || 4000

// listning app
httpserver.listen(port, () => {
    // console.log("app is listining at : 4000")
})
