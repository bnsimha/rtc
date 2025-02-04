const userName = 'Simha'+Math.floor(Math.random() *1000);
const password = 'x';
document.querySelector('#user-name').innerHTML = userName;

const socket = io.connect('https://localhost:8181/',{
    auth :{
        userName,password
    }
})
const localVideoEl = document.querySelector('#local-video');
const remoteVideoEl = document.querySelector('#remote-video');

let localStream;
let remoteStream;
let peerConnection;
let didIOffer = false;


let peerConfiguration = {
    iceServers:[
        {
            urls:[
              'stun:stun.l.google.com:19302',
              'stun:stun1.l.google.com:19302'
            ]
        }
    ]
}


//when a client inits a call
const call = async e=>{
    //await fetchUserMedia();

    await createPeerConnection();

    //create offer
    try{
        //console.log('creating offer...')
        const offer = await peerConnection.createOffer();
        didIOffer = true;
        //console.log(offer)
        peerConnection.setLocalDescription(offer);
        socket.emit('newOffer', offer)
    }catch(err){
        console.log(err)
    }
}


const answerOffer = async(offerObj)=>{
    //await fetchUserMedia();
    await createPeerConnection(offerObj);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer)
    // console.log(offerObj)
    // console.log(answer);
    //console.log(peerConnection.signalingState)//have-local-pranswer??
    offerObj.answer = answer
    //emit answer to signaling server
    const offerIceCandidates = await socket.emitWithAck('newAnswer', offerObj)
    offerIceCandidates.forEach(c=>{
        peerConnection.addIceCandidate(c)
        //console.log('===agta ide')
    })
    //console.log(offerIceCandidates)

}

const addAnswer = async(offerObj)=>{
    await peerConnection.setRemoteDescription(offerObj.answer)

}

// const fetchUserMedia = ()=>{
//     return new Promise(async(resolve, reject)=>{
//         try{
//         const stream = await navigator.mediaDevices.getUserMedia({
//             video : true,
//         });
//         localVideoEl.srcObject = stream;
//         localStream =  stream;
//         resolve();
//     }
//     catch(err){
//         //console.log(err)
//         reject();
//     }
//     })
// }
        
const createPeerConnection = (offerObj)=>{
    return new Promise(async(resolve, reject)=>{
        peerConnection = new RTCPeerConnection(peerConfiguration)
        dataChannel = peerConnection.createDataChannel()
        // remoteStream = new MediaStream()
        // remoteVideoEl.srcObject = remoteStream

        // localStream.getTracks().forEach(track=>{
        //     //add tracks
        //     peerConnection.addTrack(track,localStream)
        // })

        peerConnection.addEventListener("signalingstatechange", (event)=>{
            console.log(event)
        });

        peerConnection.addEventListener('icecandidate',e=>{
        // console.log("......ICE found")
        // console.log(e)
        if(e.candidate){
            socket.emit('sendICEToSignalingServer',{
                iceCandidate : e.candidate,
                iceUserName : userName,
                didIOffer,
            })
        }
    })


    // peerConnection.addEventListener('track', e=>{
    //     // console.log(e)
    //     // console.log("got tracks from other peer")
    //     e.streams[0].getTracks().forEach(track=>{
    //         remoteStream.addTrack(track, remoteStream)
    //         console.log('exciting')
    //     })
    // }) not needed as no continuos remote stream


    if(offerObj){
        //console.log(peerConnection.signalingState)// should be stable
        await peerConnection.setRemoteDescription(offerObj.offer)
        //console.log(peerConnection.signalingState)//should be have-remote-offer
    }
    resolve();
    })
}

const addNewIceCandidate = iceCandidate=>{
    peerConnection.addIceCandidate(iceCandidate)
}

document.querySelector('#call').addEventListener('click',call)