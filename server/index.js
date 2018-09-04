let key
const socket = new WebSocket('ws://localhost:3004')
socket.onopen = () => console.log('Socket is open')
socket.onclose = () => console.log('Socket closed')

if (window.location.search === '') {
  handleClient1(socket)
} else {
  key = window.location.search.split('=')[1]
  handleClient2(socket)
}

const disconnectButton = document.getElementById('disconnectButton');
const sendButton = document.getElementById('sendButton');
const messageInputBox = document.getElementById('message');
const receiveBox = document.getElementById('receivebox');

let localConnection, remoteConnection, sendChannel, receiveChannel

disconnectButton.addEventListener('click', disconnectPeers, false);
sendButton.addEventListener('click', sendMessage, false);

      messageInputBox.disabled = false;
      sendButton.disabled = false;
      disconnectButton.disabled = false;
function handleClient1(socket) {
  document.querySelector('#connectButton').addEventListener('click', e => {
    socket.onmessage = ({ data }) => {
      const msg = JSON.parse(data)

      switch(msg.Type) {
        case 'key':
          console.log(msg.Key)
          return
        case 'answer':
          localConnection.setRemoteDescription(JSON.parse(msg.Data))
          return
        case 'ice':
          localConnection.addIceCandidate(JSON.parse(msg.Data))
          return
      }
    }
    localConnection = new RTCPeerConnection({iceServers: [
      {urls: ["stun:stun.services.mozilla.com:3478"] },
    ]});
    sendChannel = localConnection.createDataChannel("sendChannel");
    sendChannel.onopen = handleSendChannelStatusChange;
    sendChannel.onclose = handleSendChannelStatusChange;
    sendChannel.onmessage = handleReceiveMessage;

    localConnection.onicecandidate = e => {
      if (!e.candidate) {
        return
      }
      socket.send(JSON.stringify({
        Type: 'ice',
        Data: JSON.stringify(e.candidate),
        Key: key
      }))
    }

    localConnection.createOffer()
      .then(offer => localConnection.setLocalDescription(offer))
      .then(() => socket.send(JSON.stringify({
        Type: 'setOffer',
        Data: JSON.stringify(localConnection.localDescription)
      })))

  })
}

function handleClient2(socket) {
  document.querySelector('#connectButton').addEventListener('click', e => {
    socket.send(JSON.stringify({
      Type: 'getOffer',
      Key: key
    }))

    socket.onmessage = ({ data }) => {
      const msg = JSON.parse(data)

      if (msg.Type === 'offer') {
        remoteConnection.setRemoteDescription(JSON.parse(msg.Data))
        remoteConnection.createAnswer()
          .then(answer => remoteConnection.setLocalDescription(answer))
          .then(() => {
            socket.send(JSON.stringify({
              Type: 'setAnswer',
              Data: JSON.stringify(remoteConnection.localDescription),
              Key: key
            }))
          })
      } else {
        remoteConnection.addIceCandidate(JSON.parse(msg.Data))
      }
    }

    remoteConnection = new RTCPeerConnection({iceServers: [
      {url: "stun:stun.services.mozilla.com:3478"},
    ]});
    remoteConnection.ondatachannel = receiveChannelCallback;

    remoteConnection.onicecandidate = e => {
      if (!e.candidate) {
        return
      }
      socket.send(JSON.stringify({
        Type: 'ice',
        Data: JSON.stringify(e.candidate),
        Key: key
      }))
    }
  })
}

function handleCreateDescriptionError(error) {
  console.log("Unable to create an offer: " + error.toString());
}

function handleLocalAddCandidateSuccess() {
  connectButton.disabled = true;
}

function handleRemoteAddCandidateSuccess() {
  disconnectButton.disabled = false;
}

function handleAddCandidateError() {
  console.log("Oh noes! addICECandidate failed!");
}

function sendMessage() {
  var message = messageInputBox.value;
  sendChannel && sendChannel.send(message);
  receiveChannel && receiveChannel.send(message);

  messageInputBox.value = "";
  messageInputBox.focus();
}

function handleSendChannelStatusChange(event) {
  if (sendChannel) {
    var state = sendChannel.readyState;

    if (state === "open") {
      messageInputBox.disabled = false;
      messageInputBox.focus();
      sendButton.disabled = false;
      disconnectButton.disabled = false;
      connectButton.disabled = true;
    } else {
      messageInputBox.disabled = true;
      sendButton.disabled = true;
      connectButton.disabled = false;
      disconnectButton.disabled = true;
    }
  }
}

function receiveChannelCallback(event) {
  receiveChannel = event.channel;
  receiveChannel.onmessage = handleReceiveMessage;
  receiveChannel.onopen = handleReceiveChannelStatusChange;
  receiveChannel.onclose = handleReceiveChannelStatusChange;
}

function handleReceiveMessage(event) {
  var el = document.createElement("p");
  var txtNode = document.createTextNode(event.data);

  el.appendChild(txtNode);
  receiveBox.appendChild(el);
}

function handleReceiveChannelStatusChange(event) {
  if (receiveChannel) {
    console.log("Receive channel's status has changed to " +
      receiveChannel.readyState);
  }
}

function disconnectPeers() {
  sendChannel.close();
  receiveChannel.close();
  localConnection.close();
  remoteConnection.close();

  sendChannel = null;
  receiveChannel = null;
  localConnection = null;
  remoteConnection = null;

  connectButton.disabled = false;
  disconnectButton.disabled = true;
  sendButton.disabled = true;
  messageInputBox.value = "";
  messageInputBox.disabled = true;
}

