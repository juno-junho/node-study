const Room = require('../schemas/room');
const Chat = require('../schemas/chat');

exports.renderMain = async (req, res, next) => {
    try {
        const rooms = await Room.find({});
        res.render('main', { rooms, title: 'GIF 채팅방' });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.renderRoom = (req, res) => {
    res.render('room', { title: 'GIF 채팅방 생성' });
};

exports.createRoom = async (req, res, next) => { // 채팅방 만드는 컨트롤러 
    try {
        const room = await Room.create({
            title: req.body.title,
            max: req.body.max,
            owner: req.session.color,
            password: req.body.password,
        });
        const io = req.app.get('io'); // app.set('io', io)로 저장한 io 객체를 가져옴
        io.of('/room').emit('newRoom', room); // /room 네임스페이스에 연결된 모든 클라이언트에게 newRoom 이벤트 발생
        if (req.body.password) { // 비밀번호 존재하는 방
            res.redirect(`/room/${newRoom._id}?password=${req.body.password}`);
        } else{ // 비밀번호가 존재하지 않는 방
            res.redirect(`/room/${newRoom._id}`);
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.enterRoom = async (req, res, next) => { // 채팅방 접속해 채팅방 화면 렌더링하는 컨트롤러
    try {
        const room = await Room.findOne({ _id: req.params.id });
        const io = req.app.get('io');
        if (!room) { // 방이 없으면
            return res.redirect('/?error=존재하지 않는 방입니다.');
        }
        if (room.password && room.password !== req.query.password) { // 비밀번호가 틀리면
            return res.redirect('/?error=비밀번호가 틀렸습니다.');
        }
        
        const { rooms } = io.of('/chat').adapter; // 여기에 방 목록들이 있음.
        if (room.max <= rooms.get(req.params.id)?.size) { // rooms.get(방아이디) -> 해당 방의 소켓 목록이 나옴 => 소켓 개수가 참가 인원의 수
            return res.redirect('/?error=허용 인원을 초과했습니다.');
        }
        return res.render('chat', {
            room,
            title: room.title,
            chats: [],
            user: req.session.color,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.removeRoom = async (req, res, next) => { // 채팅방 삭제하는 컨트롤러
    try {
        await Room.deleteOne({ _id: req.params.id });
        await Chat.deleteMany({ room: req.params.id });
        res.send('ok');
    } catch (error) {
        console.error(error);
        next(error);
    }
};