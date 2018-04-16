//index.js
import config from '../../config.js'
import network from '../../api.js'
//获取应用实例
const app = getApp()
const host = config.host

Page({
  data: {
    uid:'92f53ad6-ddbc-4cd0-a7db-d8083b6715f1', //product
    // uid: '4104410f-295b-489d-8aa6-57aeb6390c30', // instrument
    // uid: '623eb9cf67644b5b8e7fa9baa3d46083', // company
    materialList: [],
    enterpriseMsg: {},
    scene: []
  },
  onLoad: function (options) {
   let scene = decodeURIComponent(options.scene)
   scene = scene.split('/')
   // scene 格式
   // 'id/company 或 id/product'
   if(!scene[0]) scene[0] = '86'
   if(!scene[1]) scene[1] = 'product'
   // 异步
   this.setData({
      scene: scene
   })
   this.getRecordSceneId(scene[1], scene[0])
  },
   onShareAppMessage: function() {
    let title = this.data.materialList[0].name
    let scene = this.data.scene
    return {
      title: title,
      path: '/pages/index/index?' + scene[0] + '/' + scene[1],
      success: function() {
         // 转发成功
         console.log('转发成功')
      },
      fail: function() {
        // 转发失败
        console.log('转发失败')
      }
    }
  },
  getRecordSceneId: function(exchange, id) {
    let self = this
    let data = self.data
    let opt = {url: host + '/record/api/wechat/scene/' + id + '/'}
    network.wx_request(opt).then((resp) => {
      console.log('resp', resp)
      if(resp.data.exchange_id) {
        self.initReqest(exchange, resp.data.exchange_id)
        self.inforMsgInitReqest(exchange, resp.data.exchange_id)
      }else {
        self.initReqest(exchange, data.uid)
        self.inforMsgInitReqest(exchange, data.uid)
      }
    }).catch((err) => {
      console.log('err', err)
    })
  },
  mockMaterialList: function(exchange, resp) {
    let data = this.data
    if(exchange == 'company') {
       data.materialList.push({
        name: resp.entity,
        id: resp.id,
        open: false,
        type: 'company',
        subList: []
       })
    }
    if(exchange == 'product') {
     if(resp.product_exchange) {
       data.materialList.push({
        name: '[品种资料]' + resp.product_exchange.entity,
        id: resp.product_exchange.id,
        open: false,
        type: 'product',
        subList: []
       })
     }
    } 
    if(exchange == 'instrument') {
      if(resp.medical_exchange) {
       data.materialList.push({
        name: '[品种资料]' + resp.medical_exchange.entity,
        id: resp.medical_exchange.uuid,
        open: false,
        type: 'instrument',
        subList: []
       })
      }
    }
    if(exchange == 'product' || exchange == 'instrument') {
        if(resp.related_enterprise_exchange) {
        data.materialList.push({
          name: '[企业资料]' + resp.related_enterprise_exchange.entity.replace('企业资料', ''),
          id: resp.related_enterprise_exchange.id,
          open: false,
          type: 'company',
          subList: []
        })
       }
       if(resp.related_manufacture_exchange) {
         data.materialList.push({
          name: '[企业资料]' + resp.related_manufacture_exchange.entity.replace('企业资料', ''),
          id: resp.related_manufacture_exchange.id,
          open: false,
          type: 'company',
          subList: []
        })
       }
       if(resp.related_commission_exchange) {
         data.materialList.push({
          name: '[企业资料]' + resp.related_commission_exchange.entity.replace('企业资料', ''),
          id: resp.related_commission_exchange.id,
          open: false,
          type: 'company',
          subList: []
        })
       }
    }
    this.setData({
      materialList: data.materialList
    })
  },
  unsignedGetApi: function(type ,index, id) {
    let self = this
    let data = self.data
    let opt = {}
    if(type == 'product') {
       opt.url = host + '/materialv2/api/product_exchanges/' + id + '/files?audit=true'
    }
    if(type == 'instrument') {
       opt.url = host + '/materialv2/api/medical_exchanges/' + id + '/files?audit=true'
    }
    if(type == 'company') {
       opt.url = host + '/materialv2/api/enterprise_exchanges/' + id + '/files?audit=true'
    }
    network.wx_request(opt).then((resp) => {
       self.unsignedModelB(resp.data, index, id)
    }).catch((err) => {
       console.log('err', err)
    })
  },
  unsignedModelB: function(resp, index, id) {
     let self = this
     let data = self.data
     // 需要index 索引
     for(let i = 0 ; i < resp.unsigned.length; i ++) {
        let item = resp.unsigned[i]
        if(!data.materialList[index].subList[i]) {
           let obj = {
              name: item.name,
              id: index + '-' + i, // mock id 作为index
              open: false,
              files: item.files,
           }
           data.materialList[index].subList.push(obj)
        }
      }
     let list = data.materialList;
     for (let i = 0, len = list.length; i < len; ++i) {
        // 控制 一级文件 css 特效
        if (list[i].id == id) {
          list[i].open = !list[i].open
        }else {
          list[i].open = false
        }

        // 控制 二级文件展示
        for(let j = 0; j < list[i].subList.length; ++j) {
           if(list[i].id == id) {
             list[i].subList[j].open = !list[i].subList[j].open
           }else {
             list[i].subList[j].open = false
           }

           for(let m = 0; m < list[i].subList[j].files.length; ++m) {
             list[i].subList[j].files[m].open = false
           }
        }
      }
      self.setData({
       materialList: data.materialList
      })
  },
  initReqest: function(exchange, uid) {
     let self = this
     let data = self.data
     let opt = {}
     if(exchange == 'company') opt.url = host + '/agreement/api/enterprise_exchanges/' + uid
     if(exchange == 'product') opt.url = host + '/agreement/api/product_exchanges/' + uid
     if(exchange == 'instrument') opt.url = host + '/agreement/api/medical_exchanges/' + uid
     network.wx_request(opt).then((resp) => {
        self.mockMaterialList(exchange, resp.data)
     }).catch((err) => {
        console.log('err', err)
     })
  },
  inforMsgInitReqest: function(exchange, uid) {
    let self = this
    let opt = {}
    let data = self.data
    let type
    if(exchange == 'company') type = 'enterprise'
    if(exchange == 'product') type = 'product'
    if(exchange == 'instrument') type = 'medical'
    opt.url = host + '/agreement/api/exchange/uncertified/' + uid + '/detail/?exchange_type=' + type
    network.wx_request(opt).then((resp) => {
        self.setData({
          enterpriseMsg: resp.data
        });
    }).catch((err) => {
        console.log('err', err)
    })
  },
  kindToggle: function (e) {
    let self = this
    let id = e.currentTarget.id 
    let type = e.currentTarget.dataset.type
    let index = e.currentTarget.dataset.index
    self.unsignedGetApi(type, index, id)
  },
  kindToggleSm: function(e) {
    let id = e.currentTarget.id, list = this.data.materialList
    for( let i = 0, len = list.length; i < len; i++) {
      for(let j = 0; j < list[i].subList.length; j++) {
        for(let m = 0; m < list[i].subList[j].files.length; m++) {
           if(list[i].subList[j].id == id) {
             list[i].subList[j].files[m].open = !list[i].subList[j].files[m].open
           }else {
             list[i].subList[j].files[m].open = false
           }
        }
      }
    }
    this.setData({
      materialList: list
    });
  },
  downloadFile: function(e) {
      network.showLoading('加载中...')
      let self = this
      let imgUrl = ''
      let id = e.currentTarget.id, list = self.data.materialList
      for( let i = 0, len = list.length; i < len; i++) {
        for(let j = 0; j < list[i].subList.length; j++) {
          for(let m = 0; m < list[i].subList[j].files.length; m++) {
             if(list[i].subList[j].files[m].id == id) {
               imgUrl = list[i].subList[j].files[m].pdf
             }
          }
        }
     }
     wx.downloadFile({
        url: imgUrl,
        success: function (res) {
          console.log('文档下载成功')
          wx.hideLoading()
          var filePath = res.tempFilePath
          wx.openDocument({
            filePath: filePath,
            success: function (res) {
              console.log('文档打开成功')
              wx.hideLoading()
            },
            fail: function() {
              console.log('文档打开失败')
              network.showToast('文件打开失败！')
            }
          })
        },
        fail: function() {
          console.log('下载文档失败')
          network.showToast('文件下载失败！')
        }
    })
  },
})
