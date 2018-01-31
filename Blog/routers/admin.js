/*
 *  处理admin子路由
 */
var express = require('express');  // 引入express框架
var router = express.Router();     // 创建路由router对象
var user = require('../models/User');        // 引入User模块
var Category = require('../models/Category');
var Content = require('../models/Content');
var responseData;// 统一返回数据
var hrefData = [];
router.use(function (req, res, next) {
    if (!req.userInfo.isAdmin) {
        res.send('对不起，只有管理员才能进入后台管理');
        return;
    }
    responseData = {
      code : 1 ,
      message : '',
      hrefs : hrefData
    };
    next();
});
// 进入后台管理 首页的接口
router.get('/', function (req, res, next) {
    res.render('admin/index', {
        userInfo: req.userInfo
    });
});
// 进入后台管理中用户管理接口
router.get('/user', function (req, res, next) {
    // 从数据库中把所有用户的用户数据读取出来，分配给模板，再由模板展示数据库
    // 分页：limit(Number)方法，限制获取的数据条数
    // 忽略：skip(Number)方法，忽略数据的条数，则忽略数据的条数 == （当前页-1）* pageSize
    // 总数：count()方法，获取数据库中总的数量
    var currentPage = 1; //当前页  默认显示第一页
    var pageSize = 5;     //每页显示的条数   默认每页显示两条数据
    var skipNum = 0;      //所忽略的条数     默认忽略0条数据
    var allPage = 0;      //总页数
    if (req.query.page) currentPage = Number(req.query.page);
    user.count().then(function (counts) {//返回数据库中的总条数
        //allPage 向上取整，获取最大页数
        allPage = Math.ceil(counts / pageSize);
        //currentPage 不能超过最大页数 allPage
        currentPage = Math.min(currentPage,allPage);
        //currentPage 不能小于最小页数  1
        currentPage = Math.max(currentPage,1);
        skipNum = (currentPage - 1) * pageSize;
        user.find().limit(pageSize).skip(skipNum).then(function (users) {
            res.render('admin/user_index', {
                userInfo: req.userInfo,
                users: users,
                currentPage: currentPage,
                allPage: allPage,
                url: '/admin/user'
            });
        });
    });
});
// 进入分类管理首页接口
router.get('/category',function (req,res,next) {
    // 从数据库中把所有用户的用户数据读取出来，分配给模板，再由模板展示数据库
    // 分页：limit(Number)方法，限制获取的数据条数
    // 忽略：skip(Number)方法，忽略数据的条数，则忽略数据的条数 == （当前页-1）* pageSize
    // 总数：count()方法，获取数据库中总的数量
    var currentPage = 1; //当前页  默认显示第一页
    var pageSize = 5;     //每页显示的条数   默认每页显示两条数据
    var skipNum = 0;      //所忽略的条数     默认忽略0条数据
    var allPage = 0;      //总页数
    if (req.query.page) currentPage = Number(req.query.page);
    Category.count().then(function (counts) {//返回数据库中的总条数
        //allPage 向上取整，获取最大页数
        allPage = Math.ceil(counts / pageSize);
        //currentPage 不能超过最大页数 allPage
        currentPage = Math.min(currentPage,allPage);
        //currentPage 不能小于最小页数  1
        currentPage = Math.max(currentPage,1);
        skipNum = (currentPage - 1) * pageSize;
        /**
         * 1 : 升序
         * -1 : 降序
         */
        Category.find().sort({_id:-1}).limit(pageSize).skip(skipNum).then(function (categories) {
            res.render('admin/category_index', {
                userInfo: req.userInfo,
                categories: categories,
                currentPage: currentPage,
                allPage: allPage,
                url: '/admin/category'
            });
        });
    });
});
// 进入添加分类接口: get请求
router.get('/category_add',function (req,res,next) {
    res.render('admin/category_add');
});
// 提交分类接口: post请求
router.post('/category_add',function (req,res,next) {
    var categoryName = req.body.categoryName;
    hrefData = [];
    if (!categoryName){
        responseData.message = '分类名称不能为空';
        responseData.code = -1;
        hrefData.push({
            url:  '/admin/category',
            title:'管理首页'
        });
        hrefData.push({
            url: 'javascript:window.history.back();',
            title:'返回上一级'
        });
        responseData.hrefs = hrefData;
        res.render('admin/hint',{
            responseData:responseData
        });
        return;
    }
    Category.findOne({
        categoryName:categoryName
    }).then(function (result) {
        if (result){//result等于null，说明数据库中已经存有该数据
            responseData.message = '已存在该分类名称';
            responseData.code = -1;
            hrefData.push({
                url:  '/admin/category',
                title:'管理首页'
            });
            hrefData.push({
                url: '/admin/category_add',
                title:'重新添加'
            });
            responseData.hrefs = hrefData;
            res.render('admin/hint',{
                responseData:responseData
            });
            return;
        }else{//result不等于null，说明数据库中没有该数据，需存入数据库中
            var category = new Category({
                categoryName:categoryName
            });
            return category.save();
        }
    }).then(function (result) {
        if (result){//添加数据成功
            responseData.message = '添加分类名称成功';
            responseData.code = 1;
            hrefData.push({
                url:  '/admin/category',
                title:'管理首页'
            });
            hrefData.push({
                url: '/admin/category_add',
                title:'继续添加'
            });
            responseData.hrefs = hrefData;
            res.render('admin/hint',{
                responseData:responseData
            });
            return;
        }
    });
});
// 进入编辑分类页面接口
router.get('/category_edit',function (req,res,next) {
    res.render('admin/category_edit',{
        categoryId : req.query.category_id
    });
});
router.post('/category_edit',function (req,res,next) {
    hrefData = [];
    var category_id = req.query.category_id;
    var reCategoryName = req.body.categoryName;
    Category.findById({
        _id : category_id
    }).then(function (result) {
        if (result){// 存在该条数据
            if (reCategoryName == result.categoryName){
                responseData.message = '修改分类名称成功';
                responseData.code = 1;
                hrefData.push({
                    url:  '/admin/category',
                    title:'管理首页'
                });
                hrefData.push({
                    url: 'javascript:window.history.back();',
                    title:'返回上一级'
                });
                responseData.hrefs = hrefData;
                res.render('admin/hint',{
                    responseData:responseData
                });
            }else {
                if (reCategoryName == ""){
                    responseData.message = '分类名称不能为空';
                    responseData.code = -1;
                    hrefData.push({
                        url:  '/admin/category',
                        title:'管理首页'
                    });
                    hrefData.push({
                        url: 'javascript:window.history.back();',
                        title:'返回上一级'
                    });
                    responseData.hrefs = hrefData;
                    res.render('admin/hint',{
                        responseData : responseData
                    });
                }else {
                    Category.findByIdAndUpdate({
                        _id : category_id
                    },{
                        categoryName : reCategoryName
                    },function (result) {
                        responseData.message = '修改分类名称成功';
                        responseData.code = 1;
                        hrefData.push({
                            url:  '/admin/category',
                            title:'管理首页'
                        });
                        hrefData.push({
                            url: 'javascript:window.history.back();',
                            title:'继续修改'
                        });
                        responseData.hrefs = hrefData;
                        res.render('admin/hint',{
                            responseData : responseData
                        });
                    });
                }
            }
        }else {// 不存在该条数据
            responseData.message = '不存在该条数据，修改分类名称失败';
            responseData.code = -1;
            hrefData.push({
                url:  '/admin/category',
                title:'管理首页'
            });
            responseData.hrefs = hrefData;
            res.render('admin/hint',{
                responseData : responseData
            });
        }
    });
});
// 删除分类
router.get('/category_delete',function (req,res,next) {
    var category_id = req.query.category_id;
    hrefData = [];
    Category.remove({
        _id :　category_id
    }).then(function (result) {
        if (result){
            responseData.message = '删除成功';
            responseData.code = 1;
            hrefData.push({
                url:  '/admin/category',
                title:'管理首页'
            });
            responseData.hrefs = hrefData;
            res.render('admin/hint',{
                responseData : responseData
            });
        }
    });
});
// 进入内容管理首页接口
router.get('/content',function (req,res,next) {
    // 从数据库中把所有用户的用户数据读取出来，分配给模板，再由模板展示数据库
    // 分页：limit(Number)方法，限制获取的数据条数
    // 忽略：skip(Number)方法，忽略数据的条数，则忽略数据的条数 == （当前页-1）* pageSize
    // 总数：count()方法，获取数据库中总的数量
    var currentPage = 1; //当前页  默认显示第一页
    var pageSize = 5;     //每页显示的条数   默认每页显示两条数据
    var skipNum = 0;      //所忽略的条数     默认忽略0条数据
    var allPage = 0;      //总页数
    if (req.query.page) currentPage = Number(req.query.page);
    Content.count().then(function (counts) {//返回数据库中的总条数
        //allPage 向上取整，获取最大页数
        allPage = Math.ceil(counts / pageSize);
        //currentPage 不能超过最大页数 allPage
        currentPage = Math.min(currentPage,allPage);
        //currentPage 不能小于最小页数  1
        currentPage = Math.max(currentPage,1);
        skipNum = (currentPage - 1) * pageSize;
        /**
         * 1 : 升序
         * -1 : 降序
         * populate('category')中的category，表示中的contents模型中的关联字段：category
         */
        Content.find().sort({_id:-1}).limit(pageSize).skip(skipNum).populate(['category','users']).then(function (contents) {
            res.render('admin/content_index', {
                userInfo: req.userInfo,
                contents: contents,
                currentPage: currentPage,
                allPage: allPage,
                url: '/admin/content'
            });
        });
    });
});
// 进入添加内容页面接口
router.get('/content_add',function (req,res,next) {
    Category.find().sort({_id:-1}).then(function (categories) {
        res.render('admin/content_add',{
            categories: categories
        });
    });
});
// 添加页面接口
router.post('/content_add',function (req,res,next) {
    var category = req.body.category;
    var title = req.body.title;
    var description = req.body.description;
    var content = req.body.content;
    hrefData = [];
    if (category == '' || title == '' || description == '' || content == ''){
        var message = '';
        if (content == '') message = '内容不能为空';
        if (description == '') message = '简介不能为空';
        if (title == '') message =  '标题不能为空';
        if (category == '') message = '分类名称不能为空';
        responseData.code = -1;
        responseData.message = message;
        hrefData.push({
            url:  '/admin/content',
            title:'内容首页'
        });
        hrefData.push({
            url: 'javascript:window.history.back();',
            title:'返回上一级'
        });
        responseData.hrefs = hrefData;
        res.render('admin/hint',{
            responseData:responseData
        });
        return;
    }
    var content = new Content({
        category:category,
        title:title,
        description:description,
        content:content,
        users: req.userInfo.userId
    });
    content.save().then(function (result) {
        if (result){
            responseData.code = 1;
            responseData.message = '添加内容成功';
            hrefData.push({
                url:  '/admin/content',
                title:'内容首页'
            });
            hrefData.push({
                url: '/admin/content_add',
                title:'继续添加'
            });
            responseData.hrefs = hrefData;
            res.render('admin/hint',{
                responseData:responseData
            });
            return;
        }
    });
});
// 进入修改页面接口
router.get('/content_edit',function (req,res,next) {
    var content_id = req.query.content_id || '';
    hrefData = [];
    Content.findOne({
        _id : content_id
    }).then(function (contents) {
        if (contents){//该条数据存在
            Category.find().sort({_id:-1}).then(function (categories) {
                res.render('admin/content_edit',{
                    category_id : contents.category,
                    categories : categories,
                    contents :　contents
                });
            });
        }else{
            // 该条数据不存在
            responseData.code = -1;
            responseData.message = '指定内容不存在';
            hrefData.push({
                url:  '/admin/content',
                title:'内容首页'
            });
            hrefData.push({
                url: 'javascript:window.history.back();',
                title:'返回上一级'
            });
            responseData.hrefs = hrefData;
            res.render('admin/hint',{
                responseData:responseData
            });
        }
    });

});
// 修改页面接口
router.post('/content_edit',function (req,res,next) {
    var body = req.body;
    var content_id = req.query.contentId;
    var category = body.category;
    var title = body.title;
    var description = body.description;
    var content = body.content;
    hrefData = [];
    if (category == '' || title == '' || description == '' || content == ''){
        var message = '';
        if (content == '') message = '内容不能为空';
        if (description == '') message = '简介不能为空';
        if (title == '') message =  '标题不能为空';
        if (category == '') message = '分类名称不能为空';
        responseData.code = -1;
        responseData.message = message;
        hrefData.push({
            url:  '/admin/content',
            title:'内容首页'
        });
        hrefData.push({
            url: 'javascript:window.history.back();',
            title:'返回上一级'
        });
        responseData.hrefs = hrefData;
        res.render('admin/hint',{
            responseData:responseData
        });
        return;
    }
    console.log(new Date());
    Content.findByIdAndUpdate({
        _id :content_id
    },{
        category:category,
        title:title,
        description:description,
        content:content,
        users: req.userInfo.userId,
        updateDate: new Date()
    }).then(function (result) {
        if (result){
            responseData.code = 1;
            responseData.message = '内容修改成功';
            hrefData.push({
                url:  '/admin/content',
                title:'内容首页'
            });
            hrefData.push({
                url: 'javascript:window.history.back();',
                title:'继续修改'
            });
            responseData.hrefs = hrefData;
            res.render('admin/hint',{
                responseData:responseData
            });
            return;
        }
    });
});
// 删除内容列表
router.get('/content_delete',function (req,res,next) {
    var content_id = req.query.content_id;
    hrefData = [];
    Content.remove({
        _id :　content_id
    }).then(function (result) {
        if (result){
            responseData.message = '删除成功';
            responseData.code = 1;
            hrefData.push({
                url:  '/admin/content',
                title:'内容首页'
            });
            responseData.hrefs = hrefData;
            res.render('admin/hint',{
                responseData : responseData
            });
        }
    });
});
// 利用module对象返回数据
module.exports = router;