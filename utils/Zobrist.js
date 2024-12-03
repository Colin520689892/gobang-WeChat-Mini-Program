// utils.js

const { 
	BOARD_WIDTH, 
	INDEX, 
	UNKNOWN_SCORE, 
	MAX_SCORE, 
	MIN_SCORE, 
	Position 
} = require('./root'); // 导入root.js中的内容

// ALPHA的边界,BETA的边界,EXACT确切的值,EMPTY空条目
const Flag = {
	ALPHA: 0,
	BETA: 1,
	EXACT: 2,
	EMPTY: 3,
};

class HashItem {
	constructor() {
			this.ZVal = 0; // ZobristValue的值
			this.depth = 0; // 递归深度
			this.score = 0; // 局面评分
			this.flag = null; // 条目类型
	}
}

class Zobrist {
	constructor() {
			this.BoardZVal = Array(2).fill(null).map(() => 
					Array.from({ length: BOARD_WIDTH }, () => 
							Array(BOARD_WIDTH).fill(0)
					)
			);
			this.CurrentZVal = 0;
			this.hashItems = Array(INDEX + 1).fill().map(() => new HashItem());
	}

	add(depth, score, flag) { // 新增条目
			const pos = this.CurrentZVal & INDEX;
			const tempItem = this.hashItems[pos];
			// 如果已有深度,且深度更大,就不添加
			if (tempItem.flag !== Flag.EMPTY && tempItem.depth > depth) return;
			tempItem.ZVal = this.CurrentZVal;
			tempItem.score = score;
			tempItem.flag = flag;
			tempItem.depth = depth;
	}

	get(depth, alpha, beta) { // 获取条目
			const pos = this.CurrentZVal & INDEX;
			const tempItem = this.hashItems[pos];
			// 如果找到的哈希条目为空,表示不存在
			const res = tempItem.flag;
			if (res === Flag.EMPTY) return UNKNOWN_SCORE;
			if (tempItem.ZVal === this.CurrentZVal && tempItem.depth >= depth) {
					if (res === Flag.EXACT) return tempItem.score;
					if (res === Flag.ALPHA && tempItem.score <= alpha) return alpha; // 没有达到最佳着法,那么我便返回一个最佳着法
					if (res === Flag.BETA && tempItem.score >= beta) return beta; // 我高于了边界,那么我返回边界
			}
			return UNKNOWN_SCORE;
	}

	init() { // 初始化一些函数
			// const rng = () => {
			// 		const buffer = new Uint32Array(2);
			// 		window.crypto.getRandomValues(buffer);
			// 		return (buffer[0] * 2 ** 32) + buffer[1]; // 组合两个 32 位数以获得 64 位随机数
			// };
			function rng() {
				return Math.floor(Math.random() * 0xFFFFFFFF);
			}
			for (let i = 0; i < 2; i++) {
					for (let j = 0; j < BOARD_WIDTH; j++) {
							for (let k = 0; k < BOARD_WIDTH; k++) {
									this.BoardZVal[i][j][k] = rng();
							}
					}
			}
			this.CurrentZVal = rng();
	}
}

module.exports = {
	Zobrist,
	Flag,
};
