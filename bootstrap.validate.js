/*
 * Last update : 2014/07/16
 * Author email : admin@f2e.be
 */
define(function(){
	
     return function($){
		(function ($) {
			 var errors = [];
			 
			 $.fn.validation = function(opt){
			 	
			    var opt = $.extend(defaults, opt),
			    	$self = $(this);
			   
			    validate($self,opt);//blur触发时验证
			    
			    $self.submit(function(e){
			        e.preventDefault();
			         
			        validate($self,opt,1); //提交表单时需要批量时验证
			        if(errors.length === 0){
			            opt.success();
			        }else{
			            //$('#u-code').prevAll('img').attr('src',opt.api.vcode+'?'+Math.random());
			            opt.failed();
			            opt.refeshCode();//验证失败刷新验证码
			        }
					errors = []
			    });
			    
			};
			    var validate = function($form,opt,isSubmit){
			        var $inputs = $form.find('input[rule]');
			        if(isSubmit) {//如果是直接提交则全部验证
			            $inputs.each(function(i){
			                verify($(this),opt,isSubmit);    
			            });
			        }else{//单个验证
			        	
			            $inputs.on('blur',function(){
			                return verify($(this),opt);
			            });
			        }
			    };
			    
			    //ele为一个jQuery对象
			    var verify = function(ele,opt,isSubmit){
			    	//是否跳过该ele验证
			        if(ele.attr('ignore') === '') return;
			        //可能验证规则为多个，多个规则用“,”分割 ，感叹号说明需要取相反的验证结果
			        var eleRule = ele.attr('rule')?ele.attr('rule').split(','):[],
			        	msg = ele.attr('msg'),
			        	equalID = ele.attr('equalto'),//equalto最好写id，都懂的
			        	equalmsg = ele.attr('equalmsg'),
			        	value = ele.val(),
			        	isReverse = 0,
			        	ruleName = '',
			        	access = 0;
			        
			        $.each(eleRule,function(i){//有多个规则则多次验证，比如手机邮箱都可以
			           
		                if(eleRule[i].slice(0,1) === '!') {
		                    isReverse = 1;
		                    ruleName = eleRule[i].slice(1);
		                }else{
		                    ruleName = eleRule[i];
		                }
						var singleRule = opt.validRules[eleRule];
		                    access = singleRule.validate(value);
		                    if(isReverse && value !=='' ){//不能写!required，不为空取反意思是能为空有病吧
		                        access = !access;
		                    }
		                    msg = msg ? msg : singleRule.defaultMsg;//有自定义消息则显示自定义消息
		                    
							
		                   
		                    
		                    if(access){	//验证和指定元素值否相同
		                        if(equalID){
		                            if($(equalID).val() != value){
		                                access = 0;
		                                msg =  equalmsg; 
		                          }
		                        }
		                    }  
		                    
							if(access) return false;//多个规则一项通过即可退出循环	
			        });
			        
				    if(access){
			          opt.handle(1,ele,msg);
			        }else{
			           opt.handle(0,ele,msg);
			           if(isSubmit) errors.push(0); //批量验证时才有作用
			        }
			        			        
				
			    };
			    
	
			
			   var defaults = {
			        validRules:{
			            required: {
				            validate: function(value) {
				                return !$.trim(value) === '';
				            },
				            defaultMsg: '字段不能为空'
			            }, 
			            number : {
				            validate: function(value) {
				                return /^[0-9]\d*$/.test(value);
				            },
				            defaultMsg: '请输入数字'
			            }, 
			            email : {
				            validate: function(value) {
				                return /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value);
				            },
				            defaultMsg: '请输入正确邮箱地址'
			        	},
			            echar : {
				            validate: function(value) {
				                return /^[a-z\_\-A-Z]*$/.test(value);
				            },
				            defaultMsg: '请输入英文字符'
				        }, 
			            chinese : {
				            validate: function(value) {
				                return /^[\u4E00-\u9FA5]{2,}$/.test(value);
				            },
				            defaultMsg: '请输入至少2个中文字符'
				        },
				        mobile : {
				            validate: function(value) {
				                return /^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|18[0-9]{9}$|17[0-9]{9}$/.test(value);
				            },
				            defaultMsg: '请输入正确手机号码！'  
				        },
			           	password : {
				            validate: function(value) {
				                return /^[\u4E00-\u9FA5\uf900-\ufa2d\w\.\s]{6,15}$/.test(value);
				            },
				            defaultMsg: '密码格式必须为6到15位字符串'      
				        },
			            vcode : {
				            validate: function(value) {
				                return /^\d{4}$/.test(value);
				            },
				            defaultMsg: '验证码必须为4位数字'     
			        	}
			   		},
			        success : function(){},
			        failed : function(){},
			        refeshCode : function(){},
			        handle : function(ele,flag){},
			        api : {}
			    };
		})($);
     }
 
})
