const webSocket = new WebSocket("ws://localhost:8005"); 
// 클라이언트 역시 이벤트 기반으로 동작한다. 
webSocket.onopen = function () { // 서버와 연결 맺어진 경우 onopen 이벤트 발생
  console.log('서버와 웹소켓 연결 성공!');
};
webSocket.onmessage = function (event) { // 서버로부터 메세지 오는 경우 onmessage 이벤트 발생
  console.log(event.data);
  webSocket.send('클라이언트에서 서버로 답장을 보냅니다'); // 서버로 메세지 보내기
};