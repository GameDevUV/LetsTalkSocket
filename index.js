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

// socket code

let io = Socketio(httpserver, {
    cors: {
        origin: "*",
    }
});

io.on('connection', (socket) => {
    console.log("app is conecte to live socket", socket.id);

    let userName;
    socket.on('sendDetails', (payload) => {
        userName = payload.userName;
    })

    socket.emit('online', { status: "ONLINE" })

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

        axios.post(`http://localhost:5000/chat/sendmessage`, {
            senderId: payload.userName,
            content: payload.message,
            chatId: payload.chatId,
            toUserName: payload.toUserName
        }).then((resp) => {

            io.to(chatId).emit("newMessage", {
                message: message,
                chatId: chatId,
                senderId: userName
            } , (response)=>{
                console.log("message sent to room: ", chatId)
            });

        }).catch((e) => {
            // console.log("error in send ", e);
        })
    })

    socket.on('haveMessage' , (payload)=>{
        // const user = getUser(socket.id)
        // console.log(user.room);
        console.log("new message got : " , "from Chat Id: ", payload.chatId);
        // io.emit("getMessage" , {message : payload.msg});
        // io.in(chatId).emit("getMessage" , {message : payload.msg});
        io.to(payload.chatId).emit("getMessage" , {message : payload.msg} , (response)=>{
            console.log("message sent");
        });
    })



    socket.on('disconnect', () => {
        axios.put('http://localhost:5000/user/status', {
            // change user name dynamically by using emits
            userName: 'vsgamer9595',
            status: 'OFFLINE'
        }).then((resp) => {
            // console.log("send : ", resp);
            console.log("user left")
        }).catch((e) => {
            console.log("error in send", e.response ? e.response.data : e.message);
        })
    })
})



// listning app
httpserver.listen(4000, () => {
    // console.log("app is listining at : 4000")
})

// emit for send data
// on for perform some task after the emit function
// both can be on server side or client side
