const WebSocket = require('ws');
/**
 * 웹 소켓은 이벤트 기반으로 작동한다. 
 * 실시간으로 데이터 전달 받으므로 항상 대기하고 있어야 한다.
 */

module.exports = (server) => {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws, req) => { // 웹 소켓 연결시
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        console.log('새로운 클라이언트 접속', ip);
        ws.on('message', (message) => { // 클라이언트로부터 메시지 수신시 발생하는 이벤트 (message event)
            console.log(message);
        });
        ws.on('error', (error) => { // 에러 발생시 발생하는 이벤트 (error event)
            console.error(error);
        });
        ws.on('close', () => { // 연결 종료시
            console.log('클라이언트 접속 해제', ip);
            clearInterval(ws.interval); // 이것 없으면 메모리 누수 발생함. 
        });

        const interval = setInterval(() => { // 3초마다 클라이언트로 메세지 전송
            if (ws.readyState === ws.OPEN) { // 연결상태면 메세지 전송
                ws.send('서버에서 클라이언트로 메시지를 보냅니다.'); // 하나의 클라이언트에 메세지를 보낸다.
            }
        }, 3000);
        ws.interval = interval;
    });
}