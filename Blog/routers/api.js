var express = require('express');  // 引入express对象
var Content = require('../models/Content');
var router = express.Router();     // 创建路由router对象
var responseData;                  // 统一返回格式
//通过 User 模块来实现操作数据库,利用 User 模块的构造函数创建一个user对象，我们不用通过数据库来操作数据库，而是通过模块，像操作对象一样来操作数据库
var User = require('../models/User');            // 判断用户名是否注册过，引入models中的User模块

// 设置统一返回格式
router.use(function (req , res , next) {
    responseData = {
        code:1,
        message:''
    };
    next();
});
// register接口
router.post('/user/register',function (req , res , next) {
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;
    if (username == ""){
        responseData.code = -1;
        responseData.message = '用户名不能为空';
        res.json(responseData);//通过res.json() 方法返回客户端
        return;
    }
    if (password == ""){
        responseData.code = -1;
        responseData.message = '密码不能为空';
        res.json(responseData);
        return;
    }
    if(password != repassword){
        responseData.code = -1;
        responseData.message = '两次输入密码不一致';
        res.json(responseData);
        return;
    }
    //判断用户名是否已经注册 user.findOne（）返回mpromise对象
    User.findOne({
        username: username
    }).then(function (userInfo) {
        if(userInfo){//表示数据库中有该条数据
            responseData.code = -1;
            responseData.message = '该用户名已经被注册了';
            res.json(responseData);
            return;
        }else {//userInfo为null 表示数据库中没有这条数据 则保存该条记录到数据库中
            ////通过引入的User模块，利用User模块的构造函数创建一个user对象，来调用类方法
            var user = new User({
                username: username,
                password: password
            });
            return user.save();
        }
    }).then(function (newUserInfo) {
        if (newUserInfo){//newUserInfo不等于null 表示数据库中有该登录用户信息，则登录成功
            responseData.code = 1 ;
            responseData.message = '注册成功';
        }else {
            responseData.code = -1 ;
            responseData.message = '注册失败';
        }
        res.json(responseData);
        return;
    });
});
// login接口
router.post('/user/login',function (req,res,next) {
    var username = req.body.username;
    var password = req.body.password;
    if (username == '' || password == ''){
        responseData.code = -1;
        responseData.message = '用户名和密码不能为空';
        res.json(responseData);
        return;
    }
    User.findOne({
        username : username,
        password : password
    }).then(function (result) {
        if (result){//result不等于null 表示数据库中有该登录用户信息，则登录成功
            responseData.code = 1;
            responseData.message = '登录成功';
            responseData.userInfo = {
                userId:result._id,
                username:result.username
            };
            req.cookies.set('userInfo',JSON.stringify({
                userId:result._id,
                username:result.username
            }));
        }else{//登录失败
            responseData.code = -1;
            responseData.message = '用户名或密码错误，登录失败';
        }
        res.json(responseData);
        return;
    });
});
// logout接口
router.get('/user/logout',function (req,res,next) {
    if (req.userInfo) {
        responseData.code = 1;
        responseData.message = '退出成功';
        req.cookies.set('userInfo',null);
        res.json(responseData);
    }
});
// 获取文章的所有评论
router.get('/comment',function (req,res,next) {
    var content_id = req.query.content_id || '';
    Content.findOne({
        _id : content_id
    }).then(function (content) {
        responseData.code = 1;
        responseData.message = '加载成功';
        responseData.data = content;
        res.json(responseData);
    });
});
// 提交评论接口
router.post('/comment',function (req,res,next) {
    var contents = req.body.contents || '';
    var content_id = req.body.content_id || '';
    var userInfo = req.userInfo;
    var commentData = {
        contents:contents,
        author:userInfo.username,
        commentData: new Date()
    };
    hrefData = [];
    if (contents == ''){
        responseData.code = -1;
        responseData.message = '评论失败';
        responseData.data = newContent;
        res.json(responseData);
        return;
    }
    Content.findOne({
        _id : content_id
    }).then(function (content) {
        content.comments.push(commentData);
        return content.save();
    }).then(function (newContent) {
        if (newContent){
            responseData.code = 1;
            responseData.message = '评论成功';
            responseData.data = newContent;
            res.json(responseData);
        }
    });
});
//利用module返回数据
module.exports = router;