// utils.js

const BOARD_WIDTH = 15; // 棋盘大小
const INDEX = 0xffff; // hashitems的大小65535
const UNKNOWN_SCORE = 10000001;
const MAX_SCORE = 10000000;
const MIN_SCORE = -10000000;

// 这个是8个方向
// 这个是节点结构体
class Position {
    constructor(x, y, score = 0) {
        this.x = x;
        this.y = y;
        this.score = score;
    }

    // 自定义排序
    static compare(pos1, pos2) {
        if (pos1.score !== pos2.score) return pos1.score > pos2.score ? -1 : 1;
        if (pos1.x !== pos2.x) return pos1.x < pos2.x ? -1 : 1;
        return pos1.y < pos2.y ? -1 : 1;
    }
}

module.exports = {
    BOARD_WIDTH,
    INDEX,
    UNKNOWN_SCORE,
    MAX_SCORE,
    MIN_SCORE,
    Position
};
