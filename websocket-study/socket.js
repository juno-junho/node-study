const WebSocket = require('ws');
const SocketIO = require('socket.io');

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
            console.log(message.toString('utf8'));
        });
        ws.on('error', (error) => { // 에러 발생시 발생하는 이벤트 (error event)
            console.error(error.toString('utf8'));
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
};

module.exports = (server) => {
    const io = SocketIO(server, { path: '/socket.io' }); // 서버와 연결 및 옵션 객체를 두번째 인수로 넣어 서버에 관한 여러 설정 가능
    // 여기서는 클라이언트가 접속할 경로인 path 옵션만 사용. 클라이언트에서도 이 경로와 일치하는 path를 넣어야한다.

    io.on('connection', (socket) => { // connection 이벤트 -> 클라이언트 접속했을때 발생, socket 객체를 콜백으로 제공
        const req = socket.request; // 요청 객체에 접근 가능
        const res = socket.request.res; // 응답 객체에 접근 가능
        const socketId = socket.id; // 소켓 고유 아이디 확인 가능 -> 주인이 누군지 알 수 있음

        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log('새로운 클라이언트 접속!', ip, socket.id, req.ip);

        socket.on('disconnect', () => {
            console.log('클라이언트 접속 해제', ip, socket.id);
            clearInterval(socket.interval);
        });

        socket.on('error', (error) => {
            console.error(error);
        });

        socket.on('reply', (data) => { // 클라이언트로부터 메시지 수신시 발생하는 이벤트
            console.log(data);
        });

        const interval = setInterval(() => {
            socket.emit('news', 'Hello Socket.IO'); // (이벤트 이름, 데이터)
        }, 3000);
        socket.interval = interval;
    });
}

module.exprots = (server,app, sessionMiddleware) =>{
    const io = SocketIO(server, {path: '/socket.io'});
    app.set('io', io); // req.app.get('io')로 접근 가능
    const room = io.of('/room'); // of: socket.io에 네임스페이스 부여하는 메서드 (default: / 네임스페이스 접속), 같은 네임스페이스끼리만 데이터 전달
    const chat = io.of('/chat');

    const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next); // 미들웨어를 소켓에서 쓸 수 있게 변환
    chat.use(wrap(sessionMiddleware)); // chat 네임스페이스에 미들웨어 적용

    room.on('connection', (socket) => { // /room 네임스페이스에 이벤트 리스너 붙임
        console.log('room 네임스페이스에 접속');
        socket.on('disconnect', () => {
            console.log('room 네임스페이스 접속 해제');
        });
    });

    chat.on('connection', (socket) => { // /chat 네임스페이스에 이벤트 리스너 붙임
        console.log('chat 네임스페이스 접속');

        socket.on('join', (data) => { // data: 브라우저에서 보낸 방 아이디
            socket.join(data); // 네임스페이스 아래 존재하는 방에 접속 // 이 이벤트는 connection, disconnect 이벤트와 달리 직접 만든 이벤트
            socket.to(data).emit('join', { // to(방아이디): 특정 방에 데이터를 보낼 수 있음
                user: 'system',
                chat: `${socket.request.session.color}님이 입장하셨습니다.`,
            });
        });

        socket.on('disconnect', async () => {
            console.log('chat 네임스페이스 접속 해제');
            const {referer} = socket.request.headers; // 브라우저 주소가 있음
            const roomId = new URL(referer).pathname.split('/').at(-1); // 방 아이디 추출
            const currentRoom = socket.adapter.rooms.get(roomId); 
            const userCount = currentRoom?.size || 0;
            if (userCount === 0) { // 유저가 0명이면 방 삭제
                await removeRoom(roomId);
                room.emit('remoteRoom', roomId);
                console.log('방 제거 요청 성공');
            } else {
                socket.to(roomId).emit('exit', {
                    user: 'system',
                    chat: `${socket.request.session.color}님이 퇴장하셨습니다.`,
                });
            }
        });
    });
};