/**
 * 首先定义数据库的结构
 * 数据库的模块结构都写在schemas文件夹下
 **/
var mongoose = require('mongoose');  //引入mongoose模块
//定义用户的表结构
// 在mongoose里边，一个Schema对应一个表格
// module.exports 对外进行提供
module.exports = new mongoose.Schema({
    //关联字段  建议存储一个引用 -- 内容分类id
    category:{
        // 类型
        type:mongoose.Schema.Types.ObjectId,
        // 引入  另外一个需要关联的模型
        ref: 'Category'
    },
    //关联字段 添加作者  -- 用户id
    users:{
        // 类型
        type:mongoose.Schema.Types.ObjectId,
        // 引入需要关联的User模型
        ref:'User'
    },
    //创建时间
    createDate:{
        type:Date,
        default:new Date()
    },
    //修改时间
    updateDate:{
        type:Date,
        default:new Date()
    },
    //阅读数--点击量
    views:{
      type:Number,
      default:0
    },
    //内容标题
    title: String,
    //内容简介
    description:{
        type:String,
        default:''
    },
    //内容
    content:{
        type:String,
        default:''
    },
    //评论
    comments:{
        //类型
        type:Array,
        default:[]
    }
});