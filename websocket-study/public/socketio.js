const socket = io.connect('http://localhost:8005', {
    path: '/socket.io',
    // transports: ['websocket'], // socketIO는 먼저 폴링방식으로 서버와 연결. (HTTP 프로토콜 사용)
});
socket.on('news', function(data){
    console.log(data);
    socket.emit('reply', 'Hello Node Js!');
});