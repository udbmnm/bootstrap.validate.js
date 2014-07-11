/*
 * last update : 2014/07/11
 * author Email : admin@f2e.be
 * 
 */
"use strict";
(function ($) {
 var access = 0;
 
 $.fn.validation = function(opt){
 	
    var opt = $.extend({},defaults, opt),
    	$self = $(this);
    	
    validate($self,opt);//blur触发时验证
    
    $self.submit(function(e){
        e.preventDefault();
        validate($self,opt,1); //提交表单时需要批量时验证
        
        if(access){
            opt.success();
        }else{
            //$('#u-code').prevAll('img').attr('src',opt.api.vcode+'?'+Math.random());
            opt.failed();
        }

    });
    
};
    var validate = function(eles,opt,isSubmit){
        var rules = eles.validRules,
        	$this = $(this),
        	$inputs = eles.find('input').filter(function(){
	            return $this.attr('rule');
	        });
        
        if(isSubmit) {//如果是直接提交则全部验证
            $inputs.each(function(){
                verify($this,rules,opt);    
            });
        }else{//单个验证
            $inputs.on('blur',function(){
                verify($this,rules,opt);
            });
        }
    };
    
    //ele为一个jQuery对象
    var verify = function(ele,rules,opt){
    	//是否跳过该ele验证
        if(ele.attr('ignore') === '') return;
        //可能验证规则为多个，多个规则用“,”分割 ，感叹号说明需要取相反的验证结果
        var eleRule = ele.attr('rule')?ele.attr('rule').split(','):[],
        	msg = ele.attr('msg'),
        	equalto = ele.attr('equalto'),//equalto最好写id，都懂的
        	equalmsg = ele.attr('equalmsg'),
        	value = ele.val(),
        	isReverse = 0,
        	ruleName = '';
        
        $.each(eleRule,function(i){
            $.each(rules,function(j,singleRule){
                if(eleRule[i].slice(0,1) === '!') {
                    isReverse = 1;
                    ruleName = eleRule[i].slice(1);
                }else{
                    ruleName = eleRule[i];
                }

                if(ruleName === singleRule.name){
                    access = singleRule.validate(value);
                    if(isReverse && value !=='' ){//不能写!required，不为空取反意思是能为空有病吧
                        access = !access;
                    }
                    msg = msg ? msg : singleRule.defaultMsg;//有自定义消息则显示自定义消息
                    
                    if(access){	//验证和指定元素值否相同
                        if(equalto){
                            if($(equalto).val() != value){
                                access = 0;
                                msg =  equalmsg; 
                          }
                        }
                    }
                }

            });
            
        });
		
		//验证后操作
        if(!access){
           opt.handle(ele,0);
        }else{
           opt.handle(ele,1);
        }

    };


   var defaults = {
        validRules:[{
            name: 'required',
            validate: function(value) {
                return !$.trim(value) === '';
            },
            defaultMsg: '字段不能为空'
        }, {
            name: 'number',
            validate: function(value) {
                return /^[0-9]\d*$/.test(value);
            },
            defaultMsg: '请输入数字'
        }, {
            name: 'email',
            validate: function(value) {
                return /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value);
            },
            defaultMsg: '请输入正确邮箱地址'
        }, {
            name: 'char',
            validate: function(value) {
                return /^[a-z\_\-A-Z]*$/.test(value);
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
                return /^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|18[0-9]{9}$|17[0-9]{9}$/.test(value);
            },
            defaultMsg: '请输入正确手机号码！'  
        },{
            name: 'password',
            validate: function(value) {
                return /^[\u4E00-\u9FA5\uf900-\ufa2d\w\.\s]{5,15}$/.test(value);
            },
            defaultMsg: '密码格式必须为5到15位字符串'      
        },{
            name: 'vcode',
            validate: function(value) {
                return /^\d{4}$/.test(value);
            },
            defaultMsg: '验证码必须为4位数字'     
        }],
        success : function(){},
        failed : function(){},
        refeshCode : function(){},
        handle : function(){},
        api : {},
        addrules : function  (rule) {
            this.validRules.push(rule);//添加一个自定义规则
        }
    };
})(jQuery);
