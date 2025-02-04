const fs = require('fs')
const https = require('https')
const express = require('express');
const app = express();
const socketio = require('socket.io');
app.use(express.static(__dirname))

//key and cert to run https
//mkcert
//$ mkcert create-ca
//$ mkcert create-cert
const key = fs.readFileSync('cert.key')
const cert = fs.readFileSync('cert.crt')

const expressServer = https.createServer({key, cert}, app)
const io = socketio(expressServer,{
    cors: {
        origin: "*", 
        methods: ["GET", "POST"],
        credentials: true
    }
});
// expressServer.listen(8181);
expressServer.listen(8181, '0.0.0.0', () => {
    //console.log('Server running on https://0.0.0.0:8181');
});


const offers = [
            // offererUserName : userName,
            // offer : newOffer,
            // offerIceCandidates : [],
            // answererUserName : null,
            // answer : null,
            // answerIceCandidates : []
]

const connectedSockets = [
    //username, socketID
]


io.on('connection',(socket)=>{
    //console.log('someone has connected')
    const userName = socket.handshake.auth.userName;
    const password = socket.handshake.auth.password;

    connectedSockets.push({
        socketID : socket.id,
        userName
    })

    //a new client has joined. emit all offers 
    if(offers.length){
        socket.emit('availableOffers', offers);
    }



    socket.on('newOffer', newOffer=>{
        offers.push({
            offererUserName : userName,
            offer : newOffer,
            offerIceCandidates : [],
            answererUserName : null,
            answer : null,
            answerIceCandidates : []
        })
        //console.log(newOffer.sdp.slice(50))
        //send to all clients except initer
        socket.broadcast.emit('newOfferAwaiting',offers.slice(-1))
    })


    socket.on('newAnswer', (offerObj, ackFunction)=>{
        console.log(offerObj)
        //sending answer to init(client1) needs you to have socketid of init
        const socketToAnswer = connectedSockets.find(s=>s.userName === offerObj.offererUserName)
        if(!socketToAnswer){
            console.log('no matching socket')
            return;
        }
        //we found the socket, so we emit
        const socketIdToAnswer = socketToAnswer.socketID;
        //find the offer to update
        const offerToUpdate = offers.find(o=>o.offererUserName === offerObj.offererUserName)
        if(!offerToUpdate){
            console.log('No offerToUpdate')
            return;
        }
        ackFunction(offerToUpdate.offerIceCandidates);
        offerToUpdate.answer = offerObj.answer
        offerToUpdate.answererUserName = userName
        //
        socket.to(socketIdToAnswer).emit('answerResponse', offerToUpdate)

    })

    socket.on('sendICEToSignalingServer', iceCandidateObj=>{
        const { didIOffer, iceUserName, iceCandidate} = iceCandidateObj;
        //console.log(iceCandidateObj)
        if(didIOffer){
            const offerInOffers = offers.find(o=>o.offererUserName === iceUserName)
            if(offerInOffers){
                offerInOffers.offerIceCandidates.push(iceCandidate)
                if(offerInOffers.answererUserName){
                    const socketToSendTo = connectedSockets.find(s=>s.userName === offerInOffers.answererUserName)
                    if(socketToSendTo){
                        socket.to(socketToSendTo.socketID).emit('recievedIceCandidateFromServer', iceCandidate)
                    }
                    else{
                        console.log('random')
                    }
                }
            }
        }
                else{
                    //from answerer,send to offerer
                    const offerInOffers = offers.find(o=>o.answererUserName === iceUserName)
                    const socketToSendTo = connectedSockets.find(s=>s.userName === offerInOffers.offererUserName)
                    if(socketToSendTo){
                        socket.to(socketToSendTo.socketID).emit('recievedIceCandidateFromServer', iceCandidate)
                    }
                    else{
                        console.log('random')
                    }
                }
    })
})
