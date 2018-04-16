//获取应用实例
const app = getApp()

Page({
  data: {

  },
  onLoad: function () {
    // 页面渲染后 执行
  },
  onShareAppMessage: function() {
    return {
      title: '首营资料电子交换平台',
      path: '/pages/home/index',
      success: function() {
         // 转发成功
      },
      fail: function() {
        // 转发失败
      }
    }
  },
  scanCode: function() {
    wx.scanCode({
      success: function(res) {
         console.log('res', res)
         wx.navigateTo({
          url: '/' + res.path
         })
      }
    })
  }
})