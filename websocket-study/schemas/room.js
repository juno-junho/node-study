const mongoose = require('mongoose');

const {Schema} = mongoose;

const roomSchema = new Schema({
    title: { // 방 제목
        type: String,
        required: true,
    },
    max: { // 최대 수용 인원 (최소 2명, 최대 10명)
        type: Number,
        required: true,
        default: 10,
        min: 2,
    },
    owner: { // 방장
        type: String,
        required: true,
    },
    password: String, // 비밀번호 (선택)
    createdAt: { // 생성시간
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Room', roomSchema); // (스키마 이름, 스키마 객체) 이 모델을 다른 파일에서 사용 가능