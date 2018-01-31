var pageSize = 3;    //每页显示3条数据
var currentPage = 1; //当前页  默认显示第一页
var pageNum;         //总页数
var comments = [];   //评论数组

// 每次刷新界面时加载
$.ajax({
    type: 'get',
    url: '/api/comment',
    data: {
        content_id: $('#content_id').text()
    },
    dataType:'json',
    success: function (result) {
        comments = result.data.comments.reverse();
        console.log('刷新界面');
        console.log(comments);
        renderComment();
    }
});
// 点击提交评论按钮时加载
$('#btn_submit').on('click', function () {
    var comment = $('#comment').val();
    var content_id = $('#content_id').text();
    $.ajax({
        type: 'post',
        url: '/api/comment',
        data: {
            contents: comment,
            content_id: content_id
        },
        dataType:'json',
        success: function (result) {
            $('#comment').val('');
            comments = result.data.comments.reverse();
            currentPage = 1;
            renderComment();//reverse()  反转   可把数组进行反转过来
        }
    });
});
//  使用事件委托方式进行处理
$('.pager').delegate('a','click',function () {
    if ($(this).parent().hasClass('previous')){//上一页
        currentPage--;
        console.log('点击上一页');
    }
    if ($(this).parent().hasClass('next')){//下一页
        currentPage++;
        console.log('点击下一页')
    }
    renderComment();
});

function renderComment() {
    var start = Math.max(0,(currentPage - 1) * pageSize) ;//每页显示的第一条
    var end = Math.min(currentPage * pageSize,comments.length);  //每页显示的最后一条
    pageNum = Math.max(Math.ceil(comments.length/pageSize),1);
    var lis = $('.pager li');
    lis.eq(1).html(currentPage+' / '+pageNum);
    if ( currentPage <= 1){
        currentPage = 1;
        lis.eq(0).html('<span>没有上一页</span>');
    }else{
        lis.eq(0).html('<a href="javascript:;">上一页</a>');
    }
    if (currentPage >= pageNum){
        currentPage = pageNum;
        lis.eq(2).html('<span>没有下一页</span>');
    }else {
        lis.eq(2).html('<a href="javascript:;">下一页</a>');
    }
    $('.messageCount').html(comments.length);
    $('.commentNum').html(comments.length);
    if(comments.length==0){
        $('.messageList').html('<div class="alert" role="alert" style="text-align: center">还没有评论</div>');
        $('.pager').hide();
    }else{
        var html = '';
        $('.pager').show();
        for (var i = start ; i < end; i++){
            html+='<div class="panel-body">'
                +'    <div class="row">'
                +'         <div class="col-xs-6">'+comments[i].author+'</div>'
                +'         <div class="col-xs-6" style="text-align: right">'+formatDate(comments[i].commentData)+'</div>'
                +'    </div>'
                +'    <div class="row">'
                +'         <div class="col-xs-12">'+comments[i].contents+'</div>'
                +'    </div>'
                +'</div>'
        }
        console.log(html);
        $('.messageList').html(html);
    }
}

function formatDate(time) {
    var date = new Date(time);
    return date.getFullYear()+' - '+(date.getMonth()+1)+' - '+date.getDate()+'    '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
}
