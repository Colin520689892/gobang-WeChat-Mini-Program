// ChessEngine.js
const AhoCorasick = require('./ACSearch');
const { 
	BOARD_WIDTH, 
	INDEX, 
	UNKNOWN_SCORE, 
	MAX_SCORE, 
	MIN_SCORE, 
	Position 
} = require('./root'); // 导入root.js中的内容

import { PossiblePositionManager, HistoryItem } from './PossiblePositionManager'; // 根据文件路径导入
import { Zobrist, Flag } from './Zobrist'; // 根据文件路径导入

export const Role = {
	HUMAN: 1,
	COMPUTER: 2,
	Role_EMPTY: 0
};

let DEPTH = 7; // 递归深度

export class Pattern {
	constructor(pattern, score) {
			this.pattern = pattern;
			this.score = score;
	}
}

export let patterns = [
	new Pattern("11111", 50000),
	new Pattern("011110", 4320),
	new Pattern("011100", 720),
	new Pattern("001110", 720),
	new Pattern("011010", 720),
	new Pattern("010110", 720),
	new Pattern("11110", 720),
	new Pattern("01111", 720),
	new Pattern("11011", 720),
	new Pattern("10111", 720),
	new Pattern("11101", 720),
	new Pattern("001100", 120),
	new Pattern("001010", 120),
	new Pattern("010100", 120),
	new Pattern("000100", 20),
	new Pattern("001000", 20)
];

class ChessEngine {
	constructor() {
		// 初始化变量
		this.Q = patterns.length;
		this.ac = new AhoCorasick(this.Q);
		this.end = new Array(this.Q).fill(0);
		this.z = new Zobrist();
		this.ppm = new PossiblePositionManager();
		this.board=[];
		this.winner = -1; // 初始化 winner
		this.moves = []; // 初始化 moves
		this.searchResult = new Position(0,0); // 初始化 searchResult
		this.scores=[]; 
		this.allScore = [0, 0]; // 初始化 allScore
	}
	which(who, role) {
		return (who === role ? '1' : (who === 0 ? '0' : '2'));
	}
	evaluatePoint(board, p) {
		let lines = Array(4).fill('').map(() => '');
		let lines1 = Array(4).fill('').map(() => '');
	
		for (let i = Math.max(0, p.x - 5); i < Math.min(BOARD_WIDTH, p.x + 6); i++) {
				lines[0] += (i === p.x ? '1' : this.which(board[i][p.y], Role.HUMAN));
				lines1[0] += (i === p.x ? '1' : this.which(board[i][p.y], Role.COMPUTER));
		}
		for (let i = Math.max(0, p.y - 5); i < Math.min(BOARD_WIDTH, p.y + 6); i++) {
				lines[1] += (i === p.y ? '1' : this.which(board[p.x][i], Role.HUMAN));
				lines1[1] += (i === p.y ? '1' : this.which(board[p.x][i], Role.COMPUTER));
		}
		for (let i = p.x - Math.min(Math.min(p.x, p.y), 5), j = p.y - Math.min(Math.min(p.x, p.y), 5); 
				 i < Math.min(BOARD_WIDTH, p.x + 6) && j < Math.min(BOARD_WIDTH, p.y + 6); 
				 i++, j++) {
				lines[2] += (i === p.x ? '1' : this.which(board[i][j], Role.HUMAN));
				lines1[2] += (i === p.x ? '1' : this.which(board[i][j], Role.COMPUTER));
		}
		for (let i = p.x + Math.min(Math.min(p.y, BOARD_WIDTH - 1 - p.x), 5), 
				 j = p.y - Math.min(Math.min(p.y, BOARD_WIDTH - 1 - p.x), 5); 
				 i >= Math.max(0, p.x - 5) && j < Math.min(BOARD_WIDTH, p.y + 6); 
				 i--, j++) {
				lines[3] += (i === p.x ? '1' : this.which(board[i][j], Role.HUMAN));
				lines1[3] += (i === p.x ? '1' : this.which(board[i][j], Role.COMPUTER));
		}
	
		let re1 = 0, re2 = 0;
		for (let i = 0; i < 4; i++) {
				let f = this.ac.search(lines[i]); // 人类
				for (let j = 0; j < this.Q; j++) re1 += patterns[j].score * f[this.end[j]];
				let f1 = this.ac.search(lines1[i]); // 电脑
				for (let j = 0; j < this.Q; j++) re2 += patterns[j].score * f1[this.end[j]];
		}
		return re1 + re2;
	}
	getScore(role) {
		return (role === Role.HUMAN ? this.allScore[0] : this.allScore[1]);
	}
	updateScore(board, p) {
		let lines = Array(4).fill('').map(() => []);
		let lines1 = Array(4).fill('').map(() => []);
		
		for (let i = 0; i < BOARD_WIDTH; i++) {
				lines[0].push(this.which(board[i][p.y], Role.HUMAN));
				lines1[0].push(this.which(board[i][p.y], Role.COMPUTER));
		}
		for (let i = 0; i < BOARD_WIDTH; i++) {
				lines[1].push(this.which(board[p.x][i], Role.HUMAN));
				lines1[1].push(this.which(board[p.x][i], Role.COMPUTER));
		}
		for (let i = p.x - Math.min(p.x, p.y), j = p.y - Math.min(p.x, p.y); i < BOARD_WIDTH && j < BOARD_WIDTH; i++, j++) {
				lines[2].push(this.which(board[i][j], Role.HUMAN));
				lines1[2].push(this.which(board[i][j], Role.COMPUTER));
		}
		for (let i = p.x + Math.min(p.y, BOARD_WIDTH - 1 - p.x), j = p.y - Math.min(p.y, BOARD_WIDTH - 1 - p.x); i >= 0 && j < BOARD_WIDTH; i--, j++) {
				lines[3].push(this.which(board[i][j], Role.HUMAN));
				lines1[3].push(this.which(board[i][j], Role.COMPUTER));
		}
	
		let lineScore = Array(4).fill(0);
		let line1Score = Array(4).fill(0);
		for (let i = 0; i < 4; i++) {
				let f = this.ac.search(lines[i]);
				for (let j = 0; j < this.Q; j++) {
						lineScore[i] += patterns[j].score * f[this.end[j]];
				}
				f = this.ac.search(lines1[i]);
				for (let j = 0; j < this.Q; j++) {
						line1Score[i] += patterns[j].score * f[this.end[j]];
				}
		}
	
		let a = p.y;
		let b = BOARD_WIDTH + p.x;
		let c = 2 * BOARD_WIDTH + (p.y - p.x + 10);
		let d = 2 * BOARD_WIDTH + 21 + (p.x + p.y - 4);
	
		for (let i = 0; i < 2; i++) {
				this.allScore[i] -= this.scores[i][a];
				this.allScore[i] -= this.scores[i][b];
		}
	
		this.scores[0][a] = lineScore[0];
		this.scores[1][a] = line1Score[0];
		this.scores[0][b] = lineScore[1];
		this.scores[1][b] = line1Score[1];
	
		for (let i = 0; i < 2; i++) {
				this.allScore[i] += this.scores[i][a];
				this.allScore[i] += this.scores[i][b];
		}
	
		if (p.y - p.x >= -10 && p.y - p.x <= 10) {
				for (let i = 0; i < 2; i++) this.allScore[i] -= this.scores[i][c];
				this.scores[0][c] = lineScore[2];
				this.scores[1][c] = line1Score[2];
				for (let i = 0; i < 2; i++) this.allScore[i] += this.scores[i][c];
		}
	
		if (p.x + p.y >= 4 && p.x + p.y <= 24) {
				for (let i = 0; i < 2; i++) this.allScore[i] -= this.scores[i][d];
				this.scores[0][d] = lineScore[3];
				this.scores[1][d] = line1Score[3];
				for (let i = 0; i < 2; i++) this.allScore[i] += this.scores[i][d];
		}
	}
	abSearch(board, depth, alpha, beta, currentSearchRole) {
		// if(depth===DEPTH){
		// 	for(let)
		// }
		let flag = Flag.ALPHA; // 这里可以用一个枚举类型
		let score = this.z.get(depth, alpha, beta);
		if (score !== UNKNOWN_SCORE && depth !== DEPTH) return score;
		
		let score1 = this.getScore(currentSearchRole);
		let score2 = this.getScore(currentSearchRole === Role.HUMAN ? Role.COMPUTER : Role.HUMAN);
	
		if (score1 >= 50000) return MAX_SCORE - 1000 - (DEPTH - depth);
		if (score2 >= 50000) return MIN_SCORE + 1000 + (DEPTH - depth);
		
		if (depth === 0) {
				this.z.add(depth, score1 - score2, Flag.EXACT);
				return score1 - score2;
		}
	
		let count = 0;
		// let possiblePosition = new Set();
		// const tmpPossiblePosition = ppm.get();
	
		// for (let pos of tmpPossiblePosition) {
		// 		possiblePosition.add(new Position(pos.x, pos.y, evaluatePoint(board, pos)));
		// }
		let sortedPositions = new Set();
		const tmpPossiblePosition = this.ppm.get();
		
		for (let pos of tmpPossiblePosition) {
				sortedPositions.add(new Position(pos.x, pos.y, this.evaluatePoint(board, pos)));
		}
		
		let possiblePosition = Array.from(sortedPositions);
		possiblePosition.sort((pos1, pos2) => Position.compare(pos1, pos2));
		while (possiblePosition.length > 0) {
				let p = possiblePosition[0];
				possiblePosition.shift();
				// if(depth===DEPTH){
				// 	for(let v of possiblePosition){
				// 		console.log('p',v);
				// 	}
				// }
				board[p.x][p.y] = currentSearchRole;//1
				this.z.CurrentZVal ^= this.z.BoardZVal[currentSearchRole - 1][p.x][p.y];//2
				this.updateScore(board, p);//3
				
				p.score = 0;
				// if(depth===DEPTH){
				// 	console.log(p);
				// }
				let ss=p.score;
				p.score=0;
				// if(depth===DEPTH){
				// 	console.log('ppp',p);
				// }
				this.ppm.add(board, p);//4
				p.score=ss;
				// if(depth===DEPTH){
				// 	for(let v of this.ppm.currentPPos){
				// 		console.log('a',v);
				// 	}
				// }
				let val = -this.abSearch(board, depth - 1, -beta, -alpha, currentSearchRole === Role.HUMAN ? Role.COMPUTER : Role.HUMAN);
				if (depth === DEPTH) console.log(`score(${p.x},${p.y}): ${val}`);
	
				this.ppm.Rollback();//4
				board[p.x][p.y] = 0;//1
				this.z.CurrentZVal ^= this.z.BoardZVal[currentSearchRole - 1][p.x][p.y];//2
				this.updateScore(board, p);//3
	
				if (val >= beta) {
						this.z.add(depth, beta, Flag.BETA);
						return beta;
				}
				if (val > alpha) {
						flag = Flag.EXACT;
						alpha = val;
						if (depth === DEPTH) this.searchResult = p;
				}
	
				count++;
				if (count >= 9) break;
		}
		this.z.add(depth, alpha, flag);
		return alpha;
	}
	getGoodMove(board) {
		let score = this.abSearch(board, DEPTH, MIN_SCORE, MAX_SCORE, Role.COMPUTER);
		if (score >= MAX_SCORE - 1000 - 1) this.winner = Role.COMPUTER;
		else if (score <= MIN_SCORE + 1000 + 1) this.winner = Role.HUMAN;
		return this.searchResult;
	}
	init() {
		this.winner = -1;
		for (let i = 0; i < this.Q; i++) {
				this.end[i] = this.ac.add(patterns[i].pattern);
		}
		this.ac.work();
		this.z.init();
		this.ppm.clear();
	}
	beforeStart() {
			this.board = Array.from({ length: BOARD_WIDTH }, () => Array(BOARD_WIDTH).fill(Role.Role_EMPTY)); // 初始化棋盘
			this.scores = Array.from({ length: 2 }, () => new Array(72).fill(0)); 
			this.init(); // 假设有初始化函数
	}

	isSomeOneWin() {
			if (this.winner === Role.HUMAN) return 0;
			if (this.winner === Role.COMPUTER) return 1;
			return -1;
	}

	dian() {
			this.moves.push({ x: 7, y: 7 });
			this.board[7][7] = Role.COMPUTER;
			this.z.CurrentZVal ^= this.z.BoardZVal[Role.COMPUTER - 1][7][7];
			this.ppm.add(this.board, { x: 7, y: 7 });
			this.updateScore(this.board, { x: 7, y: 7 }); // 调用外部函数
	}

	takeBack() {
			if (this.moves.length < 2) {
					console.log("can not take back");
					return this.board.flat().map(val => String.fromCharCode(val + 48)).join('');
			}

			// 悔棋逻辑
			let previousPosition = this.moves.pop();
			this.z.CurrentZVal ^= this.z.BoardZVal[Role.COMPUTER - 1][previousPosition.x][previousPosition.y];
			this.board[previousPosition.x][previousPosition.y] = Role.Role_EMPTY;
			this.updateScore(this.board, previousPosition);
			this.ppm.Rollback();

			previousPosition = this.moves.pop();
			this.z.CurrentZVal ^= this.z.BoardZVal[Role.HUMAN - 1][previousPosition.x][previousPosition.y];
			this.board[previousPosition.x][previousPosition.y] = Role.Role_EMPTY;
			this.updateScore(this.board, previousPosition);
			this.ppm.Rollback();

			this.winner = -1;
			return this.board.flat().map(val => String.fromCharCode(val + 48)).join('');
	}
	getLastPosition() {
			return this.searchResult;
	}
	setLevel(level) {
			DEPTH = level;
	}
	nextStep(x, y) {
			this.moves.push({ x, y });
			this.board[x][y] = Role.HUMAN;
			this.z.CurrentZVal ^= this.z.BoardZVal[Role.HUMAN - 1][x][y];
			this.updateScore(this.board, { x, y }); // 调用外部函数
			this.ppm.add(this.board, { x, y });
			let result = this.getGoodMove(this.board); // 假设 getGoodMove 函数已定义
			
			this.board[result.x][result.y] = Role.COMPUTER;
			this.z.CurrentZVal ^= this.z.BoardZVal[Role.COMPUTER - 1][result.x][result.y];
			this.updateScore(this.board, result); // 调用外部函数
			let ss=result.score;
			result.score=0;
			this.ppm.add(this.board, result);
			result.score=ss;
			// for(let i=0;i<15;i++){
			// 	console.log(this.board[i]);
			// }
			if (this.winner === -1) this.moves.push({ x: result.x, y: result.y });
			return this.board.flat().map(val => String.fromCharCode(val + 48)).join('');
	}
	// 其他函数 (如 print、evaluatePoint、getScore 等) 可以在此处定义
}

module.exports = ChessEngine; // 确保这样导出
