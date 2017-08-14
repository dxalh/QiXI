var Qixi = function() {
 var confi = {
 	keepZoomRatio:false,
 	layer:{
			"width":"100%",
			"height":"100%",
			"top":0,
			"left":0
		},
	//音乐配置
    audio:{
			enable:true,
			playURl:"music/happy.wav",
			cycleURl:"music/circulation.wav"
		},
    //设置时间
	setTime:{
				walkToThird:6000,  //第一次走路
				walkToMiddle:6500,  //第二次走路
				walkToEnd:6500,     //第三次走路
				walkTobridge:2000,  //上桥走路
				bridgeWalk:2000,    //桥上走路
				walkToShop:1500,   //进商店
				walkOutShop:1500,  //出商店
				openDoorTime:800, //开门
				shutDoorTime:500, //关门
				waitRotate:850,  //等待旋转
				waitFlower:800   //取花
				},
	//花瓣图片 
    snowflakeURl:[
			'images/snowflake/snowflake1.png',
            'images/snowflake/snowflake2.png',
            'images/snowflake/snowflake3.png',
            'images/snowflake/snowflake4.png',
            'images/snowflake/snowflake5.png',
            'images/snowflake/snowflake6.png'
			]
		};

	var debug=0;
	if(debug){
		$.each(confi.setTime,function(key,val){
			confi.setTime[key]=500
		})
	
	}
	if(confi.keepZoomRatio){
		var proportionY=900/1440;
		var screenHeight=$(document).height();
		var zooomHeight=screenHeight*proportionY;
		var zooomTop=(screenHeight-zooomHeight)/2;
		confi.layer.height=zooomHeight;
		confi.layer.top=zooomTop;
		}

	var instanceX;
    var container = $("#content");
    container.css(confi.layer);
    var visualWidth = container.width();
    var visualHeight = container.height();

    //获取数据
    var getValue = function(className) {
       	var $elem = $('' + className + '')
       	//走路的路线坐标
       	return {
       		height:$elem.height(),
       		top:$elem.position().top
       	};
    };

    // 路的Y轴
    var pathY = function() {
         var data = getValue('.a_background_middle');
         return data.top + data.height / 2;
    }();

    //桥的y轴
    var bridgeY = function() {
       	 var data = getValue('.c_background_middle');
       	 return data.top;
    }();

    //动画结束事件
    var animationEnd =(function() {
	   var explorer = navigator.userAgent;
	    if(~explorer.indexOf('Webkit')) {
		 return 'webkitAnimationEnd';
	    }
	return 'animationend';
    })();

    //背景音乐触发
    if(confi.audio.enable) {
    	var audio1 = Html5Audio(confi.audio.playURl);
        audio1.end(function(){
          Html5Audio(confi.audio.cycleURl,true)
        })
    }

    var swipe = Swipe(container);
       
    //页面滚动到指定的位置

    function scrollTo(time,proportionX) {
       	var distX = visualWidth * proportionX;
       	swipe.scrollTo(distX,time)
    }

    //小女孩
    var girl = {
       	elem:$('.girl'),
       	getHeight:function(){
       		return this.elem.height()
       	},
       	//转身动作
        rotate:function() {
         	this.elem.addClass('girl-rotate');
        },
       	setOffset:function() {
       		this.elem.css({
       		left:visualWidth/2,
       		top:bridgeY-this.getHeight()
       		})
       	},
       	getOffset:function() {
         	return this.elem.offset();
        },
        getWidth:function(){
         	return this.elem.width();
        }
    };


    //右面飞鸟
    var bird = {
        elem:$(".bird"),
        fly:function(){
        	this.elem.addClass('birdFly')
        	this.elem.transition({
        	right:visualWidth
        		},15000,'linear')
        	}
        };

    //logo动画
     
    var logo = {
        elem:$('.logo'),
        run:function(){
        this.elem.addClass('logolightSpeedIn').on(animationEnd,function(){
         		$(this).addClass('logoshake').off()
         		})
         	}
         };
    //小男孩走路
    var boy = BoyWalk();
    	boy.walkTo(confi.setTime.walkToThird,0.6)
        	.then(function(){
        		scrollTo(confi.setTime.walkToMiddle,1);
        		return boy.walkTo(confi.setTime.walkToMiddle,0.5)
        	})
        	.then(function(){
        		//飞鸟
        		bird.fly()
        	})
        	.then(function(){
        		//进商店
        		boy.stopWalk();
        		return BoyToShop(boy)
        	})
        	.then(function(){
				girl.setOffset();
				scrollTo(confi.setTime.walkToEnd,2);
				//第一次走路到桥底边left,top
				return boy.walkTo(confi.setTime.walkToEnd,0.15)
			})
			.then(function(){
				//第二次走路到桥上left,top
				return boy.walkTo(confi.setTime.walkTobridge,0.25,(bridgeY-girl.getHeight())/visualHeight)
			})
			.then(function(){
				//实际走路的比例
				var proportionX=(girl.getOffset().left-boy.getWidth()-instanceX+girl.getWidth()/5)/visualWidth;
				//第三次桥上直走到小女孩面前
				return boy.walkTo(confi.setTime.bridgeWalk,proportionX)
			})
			.then(function(){
				//图片还原原地停止状态
				boy.resetOriginal();
				//增加转身动作
				setTimeout(function(){
				  girl.rotate();
				   boy.rotate(function(){
				   	//开始logo动画
				    logo.run();
				    snowflake()
				   })
			},confi.setTime.waitRotate)
		    });
/*
*小男孩走路
*@param{[type]} container [description]
*/
  function BoyWalk() {
     var $boy = $("#boy");
     var boyWidth = $boy.width();
     var boyHeight = $boy.height();
     // 修正小男孩的正确位置
     $boy.css({
         top: pathY - boyHeight + 25
     });

///////////////////////////////////////////////////////
//===================动画处理============================ //
////////////////////////////////////////////////////////
   //暂停走路
   function pauseWalk() {
   	$boy.addClass('pauseWalk')
   }
   //恢复走路
   function restoreWalk() {
   	$boy.removeClass('pauseWalk')
   }
   
   //css3的动作变化
   function slowWalk() {
   	$boy.addClass('slowWalk')
   }


   //用transition做运动
   function startRun(options,runTime) {
   	var dfdPlay = $.Deferred();
   	//恢复走路
   	restoreWalk();
   	//运动的属性
   	$boy.transition(
   		options,
   		runTime,
   		'linear',
   		function() {
   			dfdPlay.resolve()//动画完成
   		});
   	return dfdPlay
   }
   //开始走路
   function walkRun(time, distX, distY) {
   	time = time || 3000;
   	//脚动作
	slowWalk();
	//开始走路
	var d1 = startRun({
		'left':distX + 'px',
		'top':distY ? distY :undefined
	},time);
	return d1;
    }

     //走进商店
   function walkToShop(doorObj,runTime) {
	   var defer = $.Deferred();
	   var doorObj = $('.door')
	   //门的坐标
	   var offsetDoor = doorObj.offset();
	   var doorOffsetLeft = offsetDoor.left;
	   // var doorOffsetTop = offsetDoor.top;
	   //小孩当前的坐标
	   var offsetBoy = $boy.offset();
	   var boyOffsetLeft = offsetBoy.left;
	   // var boyOffsetTop = offsetBoy.top;
	   //中间位置
	   var boyMiddle = $boy.width()/2;
	   var doorMiddle =doorObj.width()/2;
	   // var doorTopMiddle = doorObj.height()/2;
	   //当前需要移动的坐标
	   instanceX = (doorOffsetLeft + doorMiddle) - (boyOffsetLeft + boyMiddle);

       //Y的坐标
      //top = 人物底部的top -门中间的top值
      // instanceY = (boyOffsetTop + boyHeight) - (doorOffsetTop +doorTopMiddle);

	   //开始走路
	   var walkPlay = startRun({
		   transform:'translateX(' + instanceX + 'px),scale(0.5,0.5)',
		   opacity:0.1
	   },2000);
	   //走路完毕
	   walkPlay.done(function(){
		   $boy.css({
			   opacity:0
		   })
		   defer.resolve();
	   })
	   return defer;
	
     }

     //走出店
     function walkOutShop(runTime) {
	   var defer = $.Deferred();
	   restoreWalk();
   	   //开始走路
   	    var walkPlay = startRun({
   		   transform:'translate(' +instanceX+'px,0px),scale(1,1)',
   		   opacity:1
    	   },runTime);
    	   //走路完毕
    	   walkPlay.done(function(){
   		   defer.resolve();
   	    });
   	   return defer;
      }

      //计算移动距离 
      function calculateDist(direction,proportion) {
	      return (direction == 'x' ? visualWidth :visualHeight)*proportion;
      } 
      return {
      		//开始走路
	     walkTo:function(time,proportionX,proportionY) {
		     var distX = calculateDist('x' , proportionX);
		     var distY = calculateDist('y' , proportionY);
		     return walkRun(time,distX,distY)
	     },
	     //停止走路
	     stopWalk:function () {
		     pauseWalk();
	     },
	     //走进商店
	     toShop:function() {
		     return walkToShop.apply(null,arguments);
	     },
	     //走出商店
	     outShop:function() {
		     return walkOutShop.apply(null,arguments);
	     },
	     
	     //复位初始状态
	     resetOriginal:function() {
		     this.stopWalk();
		     //恢复图片
		     $boy.removeClass('slowWalk slowFlolerWalk').addClass('boyOriginal');
	     },
	     //转身动作
	    rotate:function(callback) {
		    restoreWalk();
		    $boy.addClass('boy-rotate');
		    //监听转身完毕
		    if(callback) {
			    $boy.on(animationEnd,function(){
				    callback();
				    $(this).off();
			    })
		    }
	    },
	    //获取男孩的宽度
	    getWidth:function() {
		    return $boy.width();
	    },

	    getDistance:function(){
            return $boy.offset().left
        },
	    //取花
	    talkFlower:function(){
          $boy.addClass("slowFlolerWalk")}
        }

     }

    var BoyToShop = function (boyObj) {
        var defer = $.Deferred();
        var $door = $('.door');
        var doorLeft = $('.door-left');
       	var doorRight = $('.door-right');
       	//开关门动作
        function doorAction (left,right,time) {
        	var defer = $.Deferred();
       	    var count =2;
       	    //等待开门完成
       	    var complete = function() {
       		    if(count == 1) {
       			    defer.resolve();
       			    return;
       		    }
       		    count--;
       	    };
       	doorLeft.transition({
        	'left':left
        }, time, complete);
        doorRight.transition({
        	'left':right
        }, time, complete);

        return defer;
       	}
       	//开门
       	function openDoor(time) {
       		return doorAction('-50%','100%',2000);
       	}
       	//关门
       	function shutDoor(time) {
       		return doorAction('0%','50%',2000);
       	}
       	//取花
        function talkFlower(){
	        //增加延时等待效果
	        var defer = $.Deferred();
	        boyObj.talkFlower(); //取花
	        setTimeout(function(){
		        defer.resolve();
	        },confi.setTime.waitFlower);
	        return defer;
        }

        //灯动画
       	var lamp = {
       		elem:$('.b_background'),
       		bright:function() {
       			this.elem.addClass('lamp-bright')
       		},
       		dark:function() {
       			this.elem.removeClass('lamp-bright')
       		}
       	};
           
        var waitOpen = openDoor(confi.setTime.openDoorTime);
        //开门 开灯 进商店
        waitOpen.then(function(){
        	lamp.bright();
        	return  boyObj.toShop($door,confi.setTime.walkToShop)
        })
        //取花
        .then(function(){
        	return talkFlower()
        })
        //出商店
        .then(function(){
            return boyObj.outShop(confi.setTime.walkOutShop)
        })
        //关门 关灯
        .then(function(){
            shutDoor(confi.setTime.shutDoorTime);
            lamp.dark();
            defer.resolve()
        });
        return defer;
    };

    //飘雪花
        /////////////////
        function snowflake() {
          //雪花容器
          var $flakeContainer = $('#snowflake');

          //随机6张图
          function getImagesName() {
            return confi.snowflakeURl[[Math.floor(Math.random()*6)]];
          }
          //创建一个雪花元素
          function createSnowBox() {
            var url = getImagesName();
            return $('<div class="snowbox" />').css({
              'width':41,
              'height':41,
              'position':'absolute',
              'backgroundImage' : 'url(' + url +')',
              'backgroundSize':'cover',
              'zIndex':100000,
              'top' : '-41px'
              

            }).addClass('snowRoll');
          }
         // 开始飘花
          setInterval(function(){
            //运动的轨迹
            var startPositionLeft = Math.random()*visualWidth - 100,
            startOpacity = 1,
            endPositionTop = visualHeight-40,
            endPositionLeft = startPositionLeft -100 +Math.random()*5000,
            duration = visualHeight*100 + Math.random()*50;

            //随机透明度，不小于0.5
            var randomStart = Math.random();
            randomStart = randomStart < 0.5 ? startOpacity :randomStart;

            //创建一个雪花
            var $flake = createSnowBox();

            //设计起点位置
            $flake.css({
              left:startPositionLeft,
              opacity : randomStart
            });

            //加入到容器
            $flakeContainer.append($flake);

            //开始执行动画
            $flake.transition({
              top:endPositionTop,
              left: endPositionLeft,
              opacity:1
            },duration,'ease-out',function(){
              $(this).remove() //结束后删除
            });
          },200);

        }

         //背景音乐
        ///////////////
        function Html5Audio(url,isloop) {
          var audio = new Audio(url);
          audio.autoPlay =true;
          audio.loop = isloop || false;
          audio.play();
          return {
            end: function(callback) {
              audio.addEventListener('ended', function(){
                callback();
              },false);
            }
          };
        }
  	
 

 
};

$(function() {
 	Qixi()
 });

function Swipe(container,options) {
  	//获取第一个子节点
		var element = container.find(":first");
		var swipe = {};
		//li页面数量
		var slides =element.find(">");
		//获取容器尺寸
		var width = container.width();
		var height = container.height();
		//设置li页面总宽度
		element.css ({
			width : (slides.length*width) + 'px',
			height: height+'px' 
		});
		//设置每一个页面li的宽度
		$.each(slides,function(index) {
			var slide = slides.eq(index);//获取每一个li元素
            //?
              slide.css({
               width :width +'px',
               height :height + 'px'
            });
		});


var isComplete = false;
var timer;
var callbacks = {};
container[0].addEventListener("transitionEnd",function(){
	isComplete = true},false);
function monitorOffset(element) {
	timer = setTimeout(function() {
		if(isComplete) {
			clearInterval(timer);
			return
		}
		callbacks.move(element.offset().left);
		monitorOffset(element)
	},500)
}

swipe.watch = function (eventName,callback) {
	callbacks[eventName] = callback
}; 
//监控完成与移动
  swipe.scrollTo = function(x, speed) {
    element.css({
				'transition-timing-function' :'linear',
				'transition-duration' : speed + 'ms',
				'transform' : 'translate3d(-' + x +'px,0px,0px)' //设置页面x轴移动
			});
    return this;
   };

   return swipe;

};
