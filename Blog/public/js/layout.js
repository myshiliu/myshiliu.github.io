$(function(){
    $('#logout').on('click',function () {
        $.ajax({
            url:'/api/user/logout',
            success:function (result) {
                if (result && result.code == 1){
                    window.location = '/';
                }
            }
        })
    });
});