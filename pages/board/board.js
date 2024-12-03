// const boardSize = 15;

// Page({
//   data: {
//     board: [], // 用于存储棋盘点信息
//     dots: [],
//     rowLines: [],
//     colLines: [],
//     isGameOver: true,
//     currentPlayer: 'black',
//     status: false//ai是否正在计算
//   },

//   onLoad() {
//     this.createBoard();
//   },

//   createBoard() {
//     const dots = [];
//     const rowLines = [];
//     const colLines = [];
//     const board = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));

//     // 创建棋盘点
//     for (let i = 0; i < boardSize; i++) {
//       for (let j = 0; j < boardSize; j++) {
//         dots.push({
//           top: i * 42 + 24+ 'rpx',
//           left: j * 42 + 24+ 'rpx',
//           className:""
//         });
//         board[i][j] = null;
//       }
//     }

//     // 创建横线
//     for (let i = 0; i < boardSize; i++) {
//       rowLines.push({
//         top: i * 42 + 40 + 'rpx'
//       });
//     }

//     // 创建竖线
//     for (let i = 0; i < boardSize; i++) {
//       colLines.push({
//         left: i * 42 + 40 + 'rpx'
//       });
//     }

//     // 更新数据
//     this.setData({
//       board,
//       dots,
//       rowLines,
//       colLines
//     });
//   },
//   xiaqi(e) {
//     //点击某个位置,哪些情况直接返回:1.还未开始2.该点被下过了3.ai正在计算中
//     //1.使用isGameOver来处理
//     const { index } = e.currentTarget.dataset; // 通过点击事件获取点的索引
//     const { board, dots, currentPlayer ,status} = this.data;

//     // 计算对应的棋盘坐标
//     const row = Math.floor(index / boardSize);
//     const col = index % boardSize;
//     if(isGameOver===true){
//       alert('棋局还未开始');
//     }
//     if(status===true){
//       alert('ai正在计算中');
//     }
//     // 判断该位置是否已经落子
//     if (!board[row][col]) {
//       // 更新棋盘状态
//       board[row][col] = currentPlayer;
//       //ai下棋
//       // 更新点的样式
//       dots[index].className = currentPlayer === 'black' ? "black" : "white";

//       // 切换玩家
//       this.setData({
//         board,
//         dots,
//         currentPlayer: currentPlayer === 'black' ? 'white' : 'black'
//       });
//     }
//   }
// });
const boardSize = 15;
const ChessEngine = require('../../utils/ChessEngine');
const { Position, BOARD_WIDTH } = require('../../utils/root');
Page({
  data: {
    userAvatarUrl: '', // 用户头像URL
    nickname: '', // 用户称昵
    difficultyRange: [1,2,3,4, 5, 6, 7, 8, 9],
    difficulty: 4,
    playerOrder: ['电脑先手', '玩家先手'],
    playerTurn: 0,
    history: [],
    board: [], // 用于存储棋盘点信息
    dots: [],
    rowLines: [],
    colLines: [],
    isGameOver: true, // 初始状态设置为 true
    currentPlayer: 'black',
    status: false, // AI是否正在计算
    chessEngine:undefined,
    aaa:'hide',
    lastpos:null,
  },
  onShareAppMessage(){
    return{
      title:"五子棋小程序",
      path:'/pages/board/board',
    }
  },
  onShareTimeline(){
    return{
      title:"五子棋小程序",
      path:'/pages/board/board',
    }
  },
  onLoad() {
    this.init();
    this.setData({isGameOver: true});
    wx.showShareMenu({
      withShareTicket:true,
      menus:['shareAppMessage','shareTimeline']
    })
  },
  init(){
    this.createBoard();
    this.history=[];
    this.lasthistory=[];
    this.lastpos=null;
    this.chessEngine = new ChessEngine(); // 实例化ChessEngine
    this.chessEngine.beforeStart(); // 初始化棋盘
    this.setData({history:[]});
  },
  createBoard() {
    const dots = [];
    const rowLines = [];
    const colLines = [];
    const board = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));

    // 创建棋盘点
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        dots.push({
          top: i * 42 + 24 + 'rpx',
          left: j * 42 + 24 + 'rpx',
          className: "blank"
        });
      }
    }

    // 创建横线和竖线
    for (let i = 0; i < boardSize; i++) {
      rowLines.push({ top: i * 42 + 40 + 'rpx' });
      colLines.push({ left: i * 42 + 40 + 'rpx' });
    }

    // 更新数据
    this.setData({ board, dots, rowLines, colLines });
  },
  xiaqi(e) {
    let { index } = e.currentTarget.dataset; // 获取点的索引
    let { board, dots, currentPlayer, status, isGameOver ,history,lasthistory} = this.data;

    // 计算用户点击的棋盘坐标
    let row = Math.floor(index / boardSize);
    let col = index % boardSize;
    // 检查游戏是否已结束
    if (isGameOver) {
      wx.showToast({ title: '棋局已结束', icon: 'none' });
      return;
    }
    
    if (status) {
      wx.showToast({ title: 'AI正在计算中', icon: 'none' });
      return;
    }

    // 判断该位置是否已经落子
    console.log(board);
    if (board[row][col]===null) {
      let pp=new Position(row,col);
      history.push(pp);//将人类下棋放入历史
      // 更新用户的棋盘状态
      board[row][col] = currentPlayer;
      this.updateDots(dots, index, currentPlayer);
      // AI下棋逻辑
      console.log(row,col);
      this.setData({ status: true}); // 标记AI正在计算
      this.setData({aaa:'display'})
      this.chessEngine.nextStep(row, col);
      // 获取AI落子的位置
      let p = this.chessEngine.getLastPosition();
      console.log(p);
      let aiRow = p.x;
      let aiCol = p.y;
      let aiIndex = aiRow * boardSize + aiCol; // 计算AI落子在一维数组中的索引
      pp=new Position(aiRow,aiCol);
      history.push(pp);//将ai下棋放入历史
      // 更新AI的棋盘状态
      board[aiRow][aiCol] = currentPlayer === 'black' ? 'white' : 'black';
      this.updateDots(dots, aiIndex, board[aiRow][aiCol]);
      this.setData({ status: false });
      // 检查游戏状态
      let winner = this.chessEngine.isSomeOneWin();
      this.setData({aaa:'hide'});
      if (winner !== -1) {
        this.setData({ isGameOver: true, status: false }); // 游戏结束
        wx.showToast({ title: winner === 0 ? '人类获胜' : '电脑获胜', icon: 'success' });
      } else {
        // 切换玩家，并更新状态
        this.setData({
          // currentPlayer: currentPlayer === 'black' ? 'white' : 'black',
          status: false
        });

      }
    }
  },
  takeback(){
    let { lastPos,board, dots, currentPlayer, status, isGameOver ,history} = this.data;
    console.log(history.length);
    if(history.length<2)return;
    let p=history.pop();
    board[p.x][p.y]=null;
    this.resetsDots(dots,p.x*boardSize+p.y,-1);
    p=history.pop();

    board[p.x][p.y]=null;
    this.resetsDots(dots,p.x*boardSize+p.y,-1);
    this.setData({
      board,
      dots,  // 重新设置 dots 触发更新
      history,
      isGameOver: false
    });
    this.chessEngine.takeBack();
  },
  reset(){
    this.setData({isGameOver:true});
    console.log('触发了');
    let {  board,difficulty,playerTurn,dots, currentPlayer, status, isGameOver,history } = this.data;
    //棋局开始后先初始化
    this.lastpos=null;
    for (let i = 0; i < history.length; i++) {
      this.resetsDots(dots,history[i].x*boardSize+history[i].y,-1);
    }
    this.init();
    //然后拿到选项
    //首先处理难度
    board=Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
    console.log(difficulty);
    this.chessEngine.setLevel(difficulty);
    //然后处理玩家先手还是后手
    if(playerTurn===0){
      let pp=new Position(7,7);
      let index1=pp.x*boardSize+pp.y;
      this.updateDots(dots,index1,currentPlayer);
      board[7][7]=currentPlayer
      this.setData({
        currentPlayer: currentPlayer === 'black' ? 'white' : 'black'
      });
      history.push(pp);
      this.chessEngine.dian();
    }
    this.setData({isGameOver: false,board});
  },
  onDifficultyChange(e) {
    const selectedDifficulty = this.data.difficultyRange[e.detail.value];
    this.setData({
      difficulty: selectedDifficulty,
    });
  },

  // 先手/后手选择改变
  onPlayerOrderChange(e) {
    console.log(e.detail.value)
    this.setData({
      playerTurn: e.detail.value,
    });

  },
  resetsDots(dots, index, currentPlayer){
    if(currentPlayer==-1){
      dots[index].className="blank";
      return;
    }
    // 更新点的样式
    dots[index].className = currentPlayer === 'black' ? "black" : "white";
    this.setData({ dots });
  },
  updateDots(dots, index, currentPlayer) {
    let { board} = this.data;
    if(currentPlayer==-1){
      dots[index].className="blank";
      return;
    }
    // 更新点的样式
    let row = Math.floor(this.lastpos / boardSize);
    let col = this.lastpos % boardSize;
    if(this.lastpos!=null&&board[row][col]!=null){
      dots[this.lastpos].className=currentPlayer === 'black' ? "white" : "black";
    }
    dots[index].className = currentPlayer === 'black' ? "sblack" : "swhite";
    this.lastpos=index;
    this.setData({ dots });
  }
});
