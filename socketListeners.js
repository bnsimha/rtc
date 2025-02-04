
//on connection get all available offers and call that function
socket.on('availableOffers', offers=>{
    console.log(offers),
    createOfferEls(offers)
})

socket.on('newOfferAwaiting', offers=>{
    createOfferEls(offers)
})


socket.on('answerResponse',offerObj=>{
    console.log(offerObj)
    addAnswer(offerObj)
})

socket.on('recievedIceCandidateFromServer', iceCandidate=>{
    addNewIceCandidate(iceCandidate)
    console.log(iceCandidate)
})

function createOfferEls(offers){
    const answerEl = document.querySelector('#answer')
    offers.forEach(o=>{
        console.log(o)
        const newOfferEl = document.createElement('div')
        newOfferEl.innerHTML = `<button class="btn btn-success col-1">Answer ${o.offererUserName}</button>`
        newOfferEl.addEventListener('click',()=>answerOffer(o))
        answerEl.appendChild(newOfferEl)
    })
}