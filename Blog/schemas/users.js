/**
 * 首先定义数据库的结构
 * 数据库的模块结构都写在schemas文件夹下
 **/
var mongoose = require('mongoose');  //引入mongoose模块
//定义用户的表结构
// 在mongoose里边，一个Schema对应一个表格
// module.exports 对外进行提供
module.exports = new mongoose.Schema({
    //用户名
    username: String,
    //密码
    password: String,
    //是否是管理员   是否为管理员的字段不建议记录在cookies中，因为我们需要实时判断该用户是否是管理员  建议放到入口文件中进行处理
    isAdmin:{
        type:Boolean,
        default:false
    }
});