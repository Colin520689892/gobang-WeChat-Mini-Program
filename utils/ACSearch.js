// ACSearch.js

let N = 50; // 最大节点数
let ALPHABET = 3; // 字母表大小
let convert = '0'.charCodeAt(0); // 字符转换

class AhoCorasick {
		constructor(numPatterns) {
				this.trie = Array.from({ length: N }, () => Array(ALPHABET).fill(0));
				this.fail = Array(N).fill(0);
				this.tot = 1;
				this.nodes = [];
				this.f =[];
				this.Q = numPatterns; // 存储模式数量
				for (let i = 0; i < ALPHABET; i++) {
						this.trie[0][i] = 1;
				}
		}

		add(pattern) {
				let p = 1;
				for (let char of pattern) {
						let index = char.charCodeAt(0) - convert;
						if (this.trie[p][index] === 0) {
								this.trie[p][index] = ++this.tot;
						}
						p = this.trie[p][index];
				}
				return p; // 返回模式的终止节点
		}

		work() {
				let queue = [];
				queue.push(1);

				while (queue.length > 0) {
						let x = queue.shift();
						this.nodes.push(x);
						for (let i = 0; i < ALPHABET; i++) {
								let child = this.trie[x][i];
								if (child === 0) {
										this.trie[x][i] = this.trie[this.fail[x]][i];
								} else {
										this.fail[child] = this.trie[this.fail[x]][i];
										queue.push(child);
								}
						}
				}
		}

		search(text) {
			this.f = new Array(this.tot + 1).fill(0);

				let p = 1;
				for (let char of text) {
						p = this.trie[p][char.charCodeAt(0) - convert];
						this.f[p]++;
				}

				for (let i = this.nodes.length - 1; i >= 0; i--) {
						let x = this.nodes[i];
						this.f[this.fail[x]] += this.f[x]; // 更新每个节点的出现次数
				}
				return this.f;
		}
}

module.exports = AhoCorasick; 