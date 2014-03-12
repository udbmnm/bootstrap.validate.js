"use strict";
(function ($) {
 $.fn.Zsvalidation = function(opt){
    var opt = $.extend({},defaults, opt),$self = $(this);
    validate($self,opt);//绑定验证事件
    refeshVcode(opt);//刷新验证码
    $self.submit(function(e){
        e.preventDefault();
        validate($self,opt,true); //提交批量时验证
        var access = $(document).data('access');
        if(access){
            opt.success(opt);
        }else{
            $('#u-code').prevAll('img').attr('src',opt.api.vcode+'?'+Math.random());
            opt.failed();
        }

    });
};
    var validate = function(obj,opt,sub){
        var rules = opt.validRules;
        var inputs = obj.find('input').filter(function(){
            return $(this).attr('rule');
        });
        if(sub) {
            inputs.each(function(){
                return verify($(this),rules);    
            });
        }else{
            inputs.on('blur',null,function(){
                return verify($(this),rules);
            });
        }
    };
    //验证方法和dom操作 equalto
    var verify = function(ele,rules){
            //ele为一个jQuery对象
        if(ele.attr('ignore') === '') return;
        var r = ele.attr('rule')?ele.attr('rule').split(','):[],
        value = ele.val(), 
        access = false,
        msg = ele.attr('msg'),
        equalto = ele.attr('equalto'),
        equalmsg = ele.attr('equalmsg'),
        bool = true,
        val = '';
        //可能验证规则为多个，多个规则用“,”分割//感叹号说明需要相反的验证结果
        $.each(r,function(i){
            $.each(rules,function(j,v){
                if(r[i].slice(0,1) === '!') {
                    bool = false;
                    val = r[i].slice(1);
                }else{
                    val = r[i];
                }

                if(val === v.name){
                    access = v.validate.call(this,value);
                    if(!bool && value !='' ){//验证不能空，为空时可能规则是required
                        access = !access;
                    }
                    msg = msg ? msg : v.defaultMsg;//有自定义消息则显示自定义消息
                    if(access){
                        if(equalto){//验证和指定元素值否相同
                            if($(equalto).val() != value){
                                access = false;
                                msg =  equalmsg; 
                          }
                        }
                    }
                }

            });
            
            if(access) {
                $(document).data('access',true);//检测是否有一项通过 
                return false;//必须return false
            } else{
                 $(document).data('access',false);
            }
            
        });

        if(!access){
            ele.nextAll('.help-block').text(msg);
            ele.parent().parent().addClass('error');
            return false;//没通过验证返回false
        }else{
            ele.nextAll('.help-block').text('');
            ele.parent().parent().removeClass('error');
            return true;
        }

    };

    //验证失败时执行
    var failed = function  () {
        notice(false,'请正确填写注册信息！');
    };

    //刷新验证码
    var refeshVcode = function  (opt) {
        $('#u-code').click(function  () {
            $(this).prevAll('img').attr('src',opt.api.vcode+'?'+Math.random());  
        });
    };

    var isExist = function  (self,api,obj,msg) {
        var access = false;
        $.ajax({
            type : 'post',
            url : api,
            async:false,
            data : obj,
            success : function (d) {
                if(!d.Result){
                     access = true;
                }else{
                    self.defaultMsg = msg || d.Message;
                    access = false;
                }
            }
        });
        return access;
    };

   var defaults = {
        validRules:[{
            name: 'required',
            validate: function(value) {
                return !($.trim(value) === '');
            },
            defaultMsg: '不能为空'
        }, {
            name: 'number',
            validate: function(value) {
                return (/^[0-9]\d*$/.test(value));
            },
            defaultMsg: '请输入数字'
        }, {
            name: 'email',
            validate: function(value) {
                return (/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value));
            },
            defaultMsg: '请输入正确邮箱地址'
        }, {
            name: 'char',
            validate: function(value) {
                return (/^[a-z\_\-A-Z]*$/.test(value));
            },
            defaultMsg: '请输入英文字符'
        }, {
            name: 'chinese',
            validate: function(value) {
                return /^[\u4E00-\u9FA5]{2,}$/.test(value);
            },
            defaultMsg: '请输入至少2个中文字符'
        },{
            name: 'mobile',
            validate: function(value) {
                return (/^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|18[0-9]{9}$/.test(value));
            },
            defaultMsg: '请输入正确手机号码！'  
        },{
            name: 'password',
            validate: function(value) {
                return (/^[\u4E00-\u9FA5\uf900-\ufa2d\w\.\s]{5,15}$/.test(value));
            },
            defaultMsg: '密码格式必须为5到15位字符串'      
        },{
            name: 'vcode',
            validate: function(value) {
                return (/^\d{4}$/.test(value));
            },
            defaultMsg: '验证码必须为4位数字'     
        },{
             name: 'mcode',
            validate: function(value) {
                return (/^\d{6}$/.test(value));
            },
            defaultMsg: '验证码必须为6位数字'
        },{
            name: 'validateEmail',
            validate: function(value) {
                var self = this , access;
                self.defaultMsg = '邮箱格式错误';
                if(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value)){
                   return isExist(self,'/ApiClient/IsExistEmail',{Email:value},'邮箱已经存在!');   
                }
                return false;
            },
            defaultMsg: '邮箱格式错误'     
         },{
            name: 'validateMobile',
            validate: function(value) {
                var self = this,access;
                self.defaultMsg = '请输入正确手机号码！';
                 if(/^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|18[0-9]{9}$/.test(value)){
                   return isExist(self,'/ApiClient/IsExistMobilePhone',{MobilePhone:value},'手机已经存在!');   
                }
                    return false;
            },
            defaultMsg: '请输入正确手机号码！'     
         }, {
             name: 'validateEmailOrMobile',
             validate: function (value) {
                 var self = this, access;
                 self.defaultMsg = '请输入正确手机号码/邮箱！';
                 if (/^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|18[0-9]{9}$/.test(value) || /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value)) {
                     return isExist(self, '/ApiClient/IsExistEmailOrMobilePhone', { Str: value });
                 }
                 return false;
             },
             defaultMsg: '请输入正确手机号码！'
         }],
        success : function(){},
        failed : failed,
        api : {
            vcode : '/ApiClient/GetImageCode',//验证码
            register : '/ApiClient/Register',//注册
            login : '/ApiClient/Login',//登录
            modifypass : '/ApiMember/ModifyPassword',//用户中心修改密码
            findpassword : '/ApiClient/FindPassword'//
        },
        addrules : function  (obj) {
            this.validRules.push(obj);//添加一个自定义规则
        }
    };
})(jQuery);