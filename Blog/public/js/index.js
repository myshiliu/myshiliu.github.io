$(function () {
    var loginBox = $('#loginBox');
    var registerBox = $('#registerBox');
    var loginInfoBox = $('#loginInfo');
    var userInfo; //登录成功的用户信息
    // 去注册
    loginBox.find('a.colMint').on( 'click',function () {
        loginBox.hide();
        registerBox.show();
    });
    // 去登录
    registerBox.find('a.colMint').on('click',function () {
        loginBox.show();
        registerBox.hide();
    });
    // 注册 id : register
    registerBox.find('#register').on('click',function () {
        var username = registerBox.find('[name = "username"]').val();
        var password = registerBox.find('[name = "password"]').val();
        var repassword = registerBox.find('[name = "repassword"]').val();
        $.ajax({
            url:'api/user/register',
            type:'post',
            data:{
                username: username,
                password: password,
                repassword: repassword
            },
            dataType:'json',
            success:function (results) {
                setTimeout(function () {
                    if (results && results.code == 1){
                        //注册成功
                        loginBox.show();
                        registerBox.hide();
                        loginInfoBox.hide();
                    }else{
                        //注册失败
                        registerBox.show();
                        loginBox.hide();
                        loginInfoBox.hide();
                    }
                },1000);
            }
        });
    });
    // 登录 id ：login
    loginBox.find('#login').on('click',function () {
        var username = loginBox.find('[name = "username"]').val();
        var password = loginBox.find('[name = "password"]').val();
        $.ajax({
            url: '/api/user/login',
            type:'post',
            data:{
                username: username,
                password: password
            },
            dataType:'json',
            success:function (results) {
                loginBox.find('.colWarning').html(results.message);
                setTimeout(function () {
                    if (results && results.code == 1){
                        //登录成功
                        /*    userInfo = results.userInfo;
                            $('#loginInfo').find('[name = "username"]').html(userInfo.username);
                            $('#loginInfo').find('#hintMessage').html('您好 欢迎来到我的博客！！！');
                            loginInfoBox.show();
                            registerBox.hide();
                            loginBox.hide();*/
                        //登录成功时userInfo已保存在cookies中，则，在这里重载加载页面即可
                        window.location.reload();
                    }else {
                        //登录失败
                        /* loginBox.show();
                         loginInfoBox.hide();
                         registerBox.hide();*/
                    }
                },1000);
            }
        });
    });
    // 退出登录 id : logout
    loginInfoBox.find('#logout').on('click',function () {
        $.ajax({
            url: '/api/user/logout',
            success:function (result) {
                if (result && result.code == 1){
                    setTimeout(function () {
                        window.location.reload();
                    },1000);
                }
            }
        });
    });
});