const WebSocket = require('ws');

module.exports = (server) => {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws, req) => { // 웹 소켓 연결시
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        console.log('새로운 클라이언트 접속', ip);
        ws.on('message', (message) => { // 클라이언트로부터 메시지 수신시
            console.log(message);
        });
        ws.on('error', (error) => { // 에러 발생시
            console.error(error);
        });
        ws.on('close', () => { // 연결 종료시
            console.log('클라이언트 접속 해제', ip);
            clearInterval(ws.interval);
        });

        const interval = setInterval(() => { // 3초마다 클라이언트로 메세지 전송
            if (ws.readyState === ws.OPEN) { // 연결상태면 메세지 전송
                ws.send('서버에서 클라이언트로 메시지를 보냅니다.');
            }
        }, 3000);
        ws.interval = interval;
    });
}