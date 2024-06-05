const socket = io();

const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

const peerConnectionConfig = {
    'iceServers': [
        {'urls': 'stun:stun.l.google.com:19302'}
    ]
};

let localStream;
let remoteStream;
let peerConnection;

// Get local media stream
navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .then(stream => {
        localStream = stream;
        localVideo.srcObject = stream;

        // Emit an event to join a room
        socket.emit('join', 'room1');
    })
    .catch(error => console.error('Error accessing media devices.', error));

// Handle signaling
socket.on('offer', handleOffer);
socket.on('answer', handleAnswer);
socket.on('candidate', handleCandidate);

socket.on('ready', () => {
    peerConnection = new RTCPeerConnection(peerConnectionConfig);

    // Add local stream to peer connection
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.ontrack = event => {
        remoteStream = event.streams[0];
        remoteVideo.srcObject = remoteStream;
    };

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.emit('candidate', event.candidate);
        }
    };

    // Create an offer
    peerConnection.createOffer()
        .then(offer => {
            peerConnection.setLocalDescription(offer);
            socket.emit('offer', offer);
        })
        .catch(error => console.error('Error creating offer.', error));
});

function handleOffer(offer) {
    peerConnection = new RTCPeerConnection(peerConnectionConfig);

    peerConnection.ontrack = event => {
        remoteStream = event.streams[0];
        remoteVideo.srcObject = remoteStream;
    };

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.emit('candidate', event.candidate);
        }
    };

    peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        .then(() => peerConnection.addStream(localStream))
        .then(() => peerConnection.createAnswer())
        .then(answer => {
            peerConnection.setLocalDescription(answer);
            socket.emit('answer', answer);
        })
        .catch(error => console.error('Error handling offer.', error));
}

function handleAnswer(answer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
}

function handleCandidate(candidate) {
    const iceCandidate = new RTCIceCandidate(candidate);
    peerConnection.addIceCandidate(iceCandidate)
        .catch(error => console.error('Error adding received ice candidate.', error));
}
