/*
 *  应用程序的启动（入口）文件
 */
// 加载express模块
var express = require('express');
// 加载模板  处理模板
var swig = require( 'swig');
// 加载mongoose模块
var mongoose = require('mongoose');
// 加载bodyParser模块  用于处理post提交过来的数据
var bodyParser = require('body-parser');
// 加载cookies模块，用于保存用户登录状态
var cookies = require('cookies');
// 引入User模块
var User = require('./models/User.js');
// 创建app应用  => NodeJS中的Http.createServer();
var app = express();

//连接数据库
mongoose.Promise = global.Promise; //允许对外访问
mongoose.connect('mongodb://localhost:27018/blog', {
    useMongoClient: true
    /* other options */
}).then(function (dbData) {
    if (dbData){
        // 监听http请求
        app.listen(8081);
        console.log('数据库连接成功');
    }else {
        console.log('数据库连接失败');
    }
});

// 配置应用模板 三步
// 一：定义当前应用所使用的模板引擎 （第一个参数：模板引擎的名称，同时也是模板文件的后缀，第二个参数表示用于解析处理模板内容的方法）
app.engine('html',swig.renderFile);
// 二：设置模板文件存放的目录 (第一个参数：必须是views ， 第二个参数：目录)
app.set('views','./views');
// 三：注册所使用的模板引擎（第一个参数：必须是view engine，第二个参数：和app.engine这个方法中定义的模板引擎的名称，即，第一个参数，他们是一致的）
app.set('view engine','html');
// 在开发过程中，需要取消模 板缓存，方便调试，
swig.setDefaults({cache : false});

// bodyParser设置。设置完后，则会路由post请求结果中：request中自动添加body，request.body的值为页面post请求提交过来的数据
app.use( bodyParser.urlencoded({extended: true}) );
// 设置cookies  只要访问浏览器，就是加载该方法
app.use(function (req , res ,next) {
    req.cookies = new cookies(req,res); //把cookies添加到req中， req.cookies对象可用get,set来获取或者设置cookies
    req.userInfo = {};
    //获取保存在cookies中的userInfo信息   并把该登录用户信息保存在req.userInfo中  以便每次刷新都可以使用
    if (req.cookies.get('userInfo')){
        try {//把字符串 cookies中的userInfo信息转化为对象
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));
            //实时获取当前登录用户的状态  是否为管理员
            User.findById(req.userInfo.userId).then(function (result) {
                if (result){
                    req.userInfo.isAdmin = Boolean(result.isAdmin);
                }
                next();
            });
        }catch (ex){
            console.log('保存登录信息到cookies中异常：');
            console.log(ex);
            next();
        }
    }else{
        next();
    }
});

// 路由绑定
// app.get('/',function (request,response,next) {
    // 发送内容到客户端 response.send('欢迎光临，我的博客！');

    // 读取views目录下的指定的文件，解析并返回给客户端
    // 第一个参数：表示模板的文件，相当于views目录  views、index.html()
    // 第二个参数：传递给模板使用的数据
    // response.render('index');
// });
// 根据不同的功能划分模块
app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));
app.use('/index',require('./routers/main'));

// 设置 main.css的路由
// app.get('/main.css',function (req , res , next) {
//     res.setHeader('content-type','text/css');
//     res.send('body { background : red ;}');
// });

// 当用户访问的url地址中以‘/public’开始时，那么直接返回对应的 __dirname+'/public'下的文件
app.use('/public',express.static(__dirname+'/public'));
