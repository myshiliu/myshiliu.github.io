//子路由
var express = require('express'); //引入express框架
var Category = require('../models/Category');
var Content = require('../models/Content');
var router = express.Router(); // 创建路由router对象
var responseData;// 统一返回数据
var hrefData = [];
//加载通用数据
var data = {
    length:0,
    contents:[],
    category:[],
    categoryId:'',
    currentPage:1,           //当前页  默认显示第一页  currentPage 不能小于最小页数  1  , 不能超过最大页数 allPage
    pageSize:2,             //每页显示的条数   默认每页显示10条数据
    allPage:0,               //总页数  allPage 向上取整，获取最大页数
    skipNum:0                //所忽略的条数     默认忽略0条数据
};
router.use(function (req,res,next) {
    data.categoryId = '';
    Category.find().sort({_id:-1}).then(function (category) {
        data.category = category;
    });
    responseData = {
        code : 1 ,
        message : '',
        hrefs : hrefData
    };
    next();
});

//进入普通用户首页接口
router.get('/',function (req ,res ,next) {
    data.categoryId = req.query.categoryId;
    var where = {};
    if (data.categoryId){
        where.category = data.categoryId;
    }
    /**
     * 1 : 升序
     * -1 : 降序
     */
    Category.find().sort({_id:-1}).then(function (result) {
        //分配模板：render（）方法中的第二个参数，表示把该对象分配给index模板的使用
        data.category = result;
        // data.categoryId = req.query.categoryId != null ? req.query.categoryId : result[0]._id;
        return Content.where(where).count();
    }).then(function (counts) {
        if (req.query.page) data.currentPage = Number(req.query.page);
        data.allPage = Math.ceil(counts / data.pageSize);
        data.currentPage = Math.min(data.currentPage,data.allPage);
        data.currentPage = Math.max(data.currentPage,1);
        data.skipNum = (data.currentPage - 1) * data.pageSize;
        data.length = counts;
        return Content.where(where).find().sort({updateDate:-1}).limit(data.pageSize).skip(data.skipNum).populate(['category','users']);
    }).then(function (contents) {
        if (contents){
            data.contents = contents;
            res.render('main/index',{
                data: data,
                userInfo:req.userInfo,
                currentPage: data.currentPage,
                allPage : data.allPage,
                categoryId : data.categoryId,
                url : '/'
            });
        }
    });
});
//查看全文接口
router.get('/view',function (req,res,next) {
    Content.findOne({
        _id : req.query.contentId
    }).populate(['category','users']).then(function (contents) {
        data.contents = contents;
        data.categoryId = req.query.categoryId || '';
        contents.views++;
        contents.save();
        res.render('main/view',{
            data: data,
            userInfo:req.userInfo
        });
    });
});
//利用module把路由回传出去
module.exports = router;