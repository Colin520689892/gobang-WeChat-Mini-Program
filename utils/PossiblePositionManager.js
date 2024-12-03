// 
// utils.js

const { 
	BOARD_WIDTH, 
	INDEX, 
	UNKNOWN_SCORE, 
	MAX_SCORE, 
	MIN_SCORE, 
	Position 
} = require('./root'); // 导入root.js中的内容

const ChessEngine = require('./ChessEngine'); // 导入ChessEngine.js中的内容

class HistoryItem {
	constructor() {
		this.addedPositions = new Set(); // 使用Set来存储位置
		this.removedPosition = "-1,-1"; // 默认值为无效位置
	}
}

class PossiblePositionManager {
	constructor() {
		this.currentPPos = new Set(); // 当前可能落子的点，使用字符串化的坐标存储
		this.history = []; // 历史记录
		this.val = 10;
	}

	// 判断是否在棋盘中
	isInBoard(x, y) {
		return x >= 0 && x < 15 && y >= 0 && y < 15;
	}

	add(board, p) {
		const addedPositions = new Set();
		const directions = [
			[1, 1], [1, -1], [-1, 1], [-1, -1],
			[1, 0], [0, 1], [-1, 0], [0, -1]
		];

		for (const [dx, dy] of directions) {
			let px = p.x + dx;
			let py = p.y + dy;
			if (!this.isInBoard(px, py)) continue;
			if (board[px][py] === ChessEngine.Role.Role_EMPTY) {
				let posKey = `${px},${py}`;
				if (!this.currentPPos.has(posKey)) {
					this.currentPPos.add(posKey); // 使用字符串化坐标来添加位置
					addedPositions.add(posKey);
				}
			}
		}

		const hi = new HistoryItem();
		hi.addedPositions = addedPositions;

		let currentKey = `${p.x},${p.y}`;
		if (this.currentPPos.has(currentKey)) {
			this.currentPPos.delete(currentKey);
			hi.removedPosition = currentKey;
		} else {
			hi.removedPosition = "-1,-1";
		}

		this.history.push(hi);
	}

	Rollback() {
		if (this.history.length === 0) return; // 没有可以回滚的记录
		const hi = this.history.pop(); // 拿出最后一个历史记录

		for (let posKey of hi.addedPositions) {
			this.currentPPos.delete(posKey);
		}
		if (hi.removedPosition !== "-1,-1") {
			this.currentPPos.add(hi.removedPosition);
		}
	}

	get() {
		const positionSet = new Set();
		for (let posKey of this.currentPPos) {
			const [x, y] = posKey.split(',').map(Number);
			positionSet.add(new Position(x, y));
		}
		return positionSet; // 返回当前可能落子的点，作为 Position 对象集合
	}

	clear() {
		this.currentPPos.clear(); // 清空当前可能的位置
		this.history = []; // 清空历史记录
	}
}

module.exports = {
	PossiblePositionManager,
	HistoryItem,
};
