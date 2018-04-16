// api.js
 let network = (function() {
 	// 微信网络请求api 均封装在这里
    return {
    	showLoading: function(msg) {
	      wx.showLoading({
	        title: msg,
	      })
		},
		showToast: function(msg) {
	      wx.showToast({
	        title: msg,
	        icon: 'none',
	        duration: 2000
	      })
		},
    	wx_request: function(opt) {
    		let self = this
    		self.showLoading('加载中...')
    		if(typeof opt.url == undefined) {
               throw 'request url is must'
    		}
    		return new Promise((resolve, reject) => {
               wx.request({
			        url: opt.url,
			        method: opt.method || 'GET',
			        data: opt.data || '',
			        dataType: opt.dataType || 'json',
			        responseType: opt.responseType || 'text',
			        header: (typeof opt.header == undefined ? opt.header : {}), // object
			        success: function(resp) {
			          // console.log('resp', resp)
			          wx.hideLoading()
			          if(resp.statusCode == '403') {
			            self.showToast('请求权限受限！')
			            return
			          }
			          if(resp.statusCode == '500') {
			            self.showToast('服务器错误！')
			            return
			          }
			          if(resp.statusCode == '408') {
			            self.showToast('请求超时！')
			            return
			          }
			          try {

			          }catch(err){
			             self.showToast('无法捕捉的错误信息！')
			             throw err
			          }
			          // self.showToast(JSON.parse(resp.data).detail)
			          resolve(resp)
			        },
			        fail: function(err) {
			          wx.hideLoading()
			          self.showToast(err.errMsg)
			          reject(err)
			        }
		       })
    		})
    	},
    	wx_uploadFile: function() {
    		//
    	}
    }
})()

export default network