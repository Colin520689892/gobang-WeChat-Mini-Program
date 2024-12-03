// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    this.showWelcomeModal();
  },
  showWelcomeModal() {
    wx.showModal({
      title: '欢迎使用五子棋小程序',
      content: '这里是一份简要的说明书,用来帮助你了解游戏的基本功能。1.选择难度，可以选择1~9层的搜索，搜索层数越大，运行越慢，7层难度是比较推荐的。2.选择先手还是后手。3.开始按钮，你可以点击开始按钮用来开始一局游戏也可以用来重新开始游戏。4.悔棋按钮，当下棋超过两步时可以悔棋，回到自己的上一个回合。5.小程序还存在很多的bug,以及不美观的缺点,未来会慢慢修复。',
      showCancel: false,  // 不显示取消按钮
      confirmText: '确定',  // 确认按钮文字
      success(res) {
        if (res.confirm) {
          console.log('用户点击了确定');
        }
      },
      fail(err) {
        console.log('弹框展示失败', err);
      },
    });
  },
  globalData: {
    userInfo: null
  }
})
