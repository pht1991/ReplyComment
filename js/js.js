(function ($) {
    $.fn.cmComment = function (options, param) {
        var otherArgs = Array.prototype.slice.call(arguments, 1);
        if (typeof options == 'string') {
            var fn = this[0][options];
            if ($.isFunction(fn)) {
                return fn.apply(this, otherArgs);
            } else {
                throw ("cmComment - No such method: " + options);
            }
        }

        return this.each(function () {
            var para = {};    // 保留参数
            var self = this;  // 保存组件对象
            var fCode = 0;
            var replyTo = '';

            var defaults = {
                "agoComment": [],  // 以往评论内容
                "callback": function (comment) {
                    console.info("返回评论数据");
                    console.info(comment);
                }
            };

            para = $.extend(defaults, options);

            this.init = function () {
                this.createAgoCommentHtml();  // 创建以往评论的html
            };

            /**
             * 功能：创建以往评论的html
             * 参数: 无
             * 返回: 无
             */
            this.createAgoCommentHtml = function () {
                $.each(para.agoComment, function (index, v) {
                    var item = '';
                    var itemReply = '';
                    item += '<li id="user' + v.id + '" class="mes">';
                    item += '   <img class="header" src="' + v.head + '" alt="头像">';
                    item += '   <div class="info">';
                    item += '       <p class="name">' + v.userName + '<span class="identity">' + v.identity + '</span></p>';
                    item += '       <span>' + v.content + '</span>';
                    item += '       <span class="time">' + v.time + '</span>';
                    item += '       <button class="reply" selfID = "' + v.id + '">评论</button>';
                    item += '   </div>';
                    item += '   <div class="userReply"></div>';
                    item += '</li>';

                    itemReply += '<div id="user' + v.id + '">';
                    itemReply += '  <img src="'+v.head+'"/>';
                    itemReply += '   <span class="name">' + v.from + '<span class="identity">' + v.identity + '</span></span> <span>回复</span> <span class="to">' + v.to + '<span class="identity">'+v.toIdentity+'</span>: </span>';
                    itemReply += '   <span>' + v.content + '</span><span class="time">' + ' ' + v.time + '</span>';
                    itemReply += '   <button class="reply" selfID = "' + v.id + '">评论</button>';
                    itemReply += '</div>';

                    // 判断此条评论是不是子级评论
                    if (v.sortID == 0) {  // 不是
                        $("#commentItems").append(item);
                    } else {  // 否
                        $("#user" + v.sortID).find('.userReply').append(itemReply);
                    }
                    //添加折叠按钮
                    if ($("#user" + v.sortID).find('.userReply').children().length != 0 && !$("#user" + v.sortID).find(".info").find(".more")[0]){
                        $("#user" + v.sortID).find(".info").append('<button class="more">收起评论</button>')
                    }
                });
                this.createFormCommentHtml();  // 创建发表评论的html
            };

            /**
             * 功能：创建评论form的html
             * 参数: 无
             * 返回: 无
             */
            this.createFormCommentHtml = function () {
                // 先添加父容器
                $(self).append('<div id="commentFrom"></div>');

                // 组织发表评论的form html代码
                var boxHtml = '';
                boxHtml += '<form id="replyBoxAri">';
                boxHtml += '    <div id="head"><img src="img/none.png" alt=""></div>';
                boxHtml += '	<div id="up">';
                boxHtml += '        <div class="sanjiao"></div>';
                boxHtml += '		<textarea id="commentContent" placeholder="请输入您的答案"></textarea>';
                boxHtml += '		<div id="submitComment">发表答案</div>';
                boxHtml += '	</div>';
                boxHtml += '</form>';

                $("#commentFrom").append(boxHtml);

                // 初始化html之后绑定点击事件
                this.addEvent();
            };

            /**
             * 功能：绑定事件
             * 参数: 无
             * 返回: 无
             */
            this.addEvent = function () {
                // 绑定item上的回复事件
                this.replyClickEvent();

                // 绑定item上的取消回复事件
                this.cancelReplyClickEvent();

                // 绑定回复框的事件
                this.addFormEvent();
            };

            /**
             * 功能: 绑定item上的回复事件
             * 参数: 无
             * 返回: 无
             */
            this.replyClickEvent = function () {
                // 绑定回复按钮点击事件
                $(self).on("click", ".reply", function () {

                    // 设置当前回复的评论的id
                    fCode = $(this).attr("selfid");

                    //获取回复对象
                    if ($(self).find("#user" + fCode).find(">.name")[0]) {
                        replyTo = $(self).find("#user" + fCode).find(">.name").html();
                    } else {
                        replyTo = $(self).find("#user" + fCode).find(".info").find(".name").html();
                    }

                    //展开回复列表
                    $(self).find("#user" + fCode).find(".userReply").css('display','block');
                    $(self).find("#user" + fCode).find(".more").text('收起评论');

                    // 1.移除之前的取消回复按钮
                    $(self).parent().find(".cancel").remove();

                    // 2.移除所有回复框
                    self.removeAllCommentFrom();

                    // 3.添加取消回复按钮
                    $(this).parent().append('<button class="cancel">取消评论</button>');

                    // 4.添加回复下的回复框
                    self.addReplyCommentFrom($(this).attr("selfID"));


                    // 绑定提交事件
                    $("#publicComment").on("click", function () {
                        var result = {
                            "content": $("#commentContent").val()
                        };
                        para.callback(result);

                        //添加更多按钮
                        if ($(self).find("#user" + fCode).find(".userReply")[0]) {
                            if (!$(self).find("#user" + fCode).find(".info").find(".more")[0]){
                                $(self).find("#user" + fCode).find(".info").append('<button class="more">收起评论</button>')
                            }
                        }
                    });
                });
            };

            /**
             * 功能: 绑定item上的取消回复事件
             * 参数: 无
             * 返回: 无
             */
            this.cancelReplyClickEvent = function () {
                $(self).on("click", '.cancel', function () {
                    // 1.移除之前的取消回复按钮
                    $(self).parent().find(".cancel").remove();

                    // 2.移除所有回复框
                    self.removeAllCommentFrom();

                    // 3.添加根下的回复框
                    self.addRootCommentFrom();
                });
            };

            /**
             * 功能: 绑定回复框的事件
             * 参数: 无
             * 返回: 无
             */

            this.addFormEvent = function () {
                // 绑定提交事件
                $(self).on("click", "#submitComment", function () {
                    fCode = 0;
                    var result = {
                        "content": $("#commentContent").val()
                    };
                    para.callback(result);
                });
            };

            // 移除所有回复框
            this.removeAllCommentFrom = function () {
                // 移除评论下的回复框
                if ($(self).find("#replyBox")[0]) {
                    // 删除评论回复框
                    $(self).find("#replyBox").remove();
                }

                // 删除文章回复框
                if ($(self).find("#replyBoxAri")[0]) {
                    $(self).find("#replyBoxAri").remove();
                }
            };

            // 添加回复下的回复框
            this.addReplyCommentFrom = function (id) {
                var boxHtml = '';
                boxHtml += '<form id="replyBox">';
                boxHtml += '	<div id="replyContent">';
                boxHtml += '		<textarea id="commentContent" placeholder="请输入您的回复"></textarea>';
                boxHtml += '		<div id="publicComment">评论</div>';
                boxHtml += '	</div>';
                boxHtml += '</form>';

                if ($(self).find("#user" + id).find(".userReply")[0]) {
                    $(self).find("#user" + id).find(".userReply").append(boxHtml);
                } else {
                    $(self).find("#user" + id).parent().append(boxHtml);
                }
            };

            // 添加根下的回复框
            this.addRootCommentFrom = function () {
                var boxHtml = '';
                boxHtml += '<form id="replyBoxAri">';
                boxHtml += '    <div id="head"><img src="img/none.png" alt=""></div>';
                boxHtml += '	<div id="up">';
                boxHtml += '        <div class="sanjiao"></div>';
                boxHtml += '		<textarea id="commentContent" placeholder="请输入您的答案"></textarea>';
                boxHtml += '		<div id="submitComment">发表答案</div>';
                boxHtml += '	</div>';
                boxHtml += '</form>';

                $(self).find("#commentFrom").append(boxHtml);
            };

            // 设置评论成功之后的内容
            this.setCommentAfter = function (param) {
                // 1.移除之前的取消回复按钮
                $(self).find(".cancel").remove();
                // 2.添加新评论的内容
                self.addNewComment(param);
                // 3.让评论框处于对文章评论的状态
                self.removeAllCommentFrom();
                // 4.添加根下的回复框
                self.addRootCommentFrom();
            };

            // 添加新评论的内容
            this.addNewComment = function (param) {

                var item = '';
                var itemReply = '';
                item += '<li id="user' + param.id + '" class="mes">';
                item += '   <img class="header" src="' + param.head + '" alt="头像">';
                item += '   <div class="info">';
                item += '       <p class="name">' + param.userName + '<span class="identity">' + param.identity + '</span></p>';
                item += '       <span>' + param.content + '</span>';
                item += '       <span class="time">' + this.getDate() + '</span>';
                item += '       <button class="reply" selfID = "' + param.id + '">评论</button>';
                item += '   </div>';
                item += '   <div class="userReply"></div>';
                item += '</li>';

                itemReply += '<div id="user' + param.id + '">';
                itemReply += '   <img src="'+param.head+'"/>';
                itemReply += '   <span class="name">' + param.userName + '<span class="identity">' + param.identity + '</span></span> <span>回复</span> <span class="to">' + replyTo + ': </span>';
                itemReply += '   <span>' + param.content + '</span><span class="time">' + ' ' + this.getDate() + '</span>';
                itemReply += '   <button class="reply" selfID = "' + param.id + '">评论</button>';
                itemReply += '</div>';

                // 判断此条评论是不是子级评论
                if (parseInt(fCode) == 0) {  // 不是
                    $("#commentItems").append(item);
                } else {  // 否
                    if ($("#user" + fCode).find(".userReply")[0]) {
                        $("#user" + fCode).find(".userReply").append(itemReply);
                    } else {
                        $("#user" + fCode).parent().append(itemReply);
                    }
                }
            };

            /**
             * 功能：获取回复时间
             * 参数: 无
             * 返回: 时间
             */
            this.getDate = function () {
                // 时间
                var date = new Date();
                var years = date.getFullYear();
                var months = date.getMonth() + 1;
                var days = date.getDate();
                var hours = date.getHours();
                var mins = date.getMinutes();
                date = years + "-" + months + "-" + days + " " + hours + ":" + mins;
                return date;
            };

            // 初始化上传控制层插件
            this.init();
        })
    }
})(jQuery);