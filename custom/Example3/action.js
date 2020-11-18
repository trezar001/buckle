var xmlns="http://www.w3.org/2000/svg", select = function(s) {
      return document.querySelector(s);
    }, selectAll = function(s) {
      return document.querySelectorAll(s);
    }, container = select('.container'), ship = select('.ship'), shipRotation = select('.shipRotation'), beam = select('.beam'), spotlight = select('.spotlight'), spotlightHover = select('.spotlightHover'), speedLineGroup = selectAll('.speedLineGroup line'), cow = select('.cow'), glowAlpha = select('#glowAlpha')

//center the container cos it's pretty an' that
TweenMax.set(container, {
  position:'absolute',
  top:'50%',
  left:'50%',
  xPercent:-50,
  yPercent:-50
})

TweenMax.set(speedLineGroup, {
  drawSVG:'0% 0%'
})

TweenMax.set([ship, shipRotation, beam, spotlight, spotlightHover], {
  transformOrigin:'50% 50%'
})

var hoverTween = TweenMax.to(ship, 0.8, {
  y:'+=13',
  yoyo:true,
  repeat:-1,
  ease:Sine.easeInOut
})
var rotationTween = TweenMax.fromTo(shipRotation, 1.3, {
  rotation:-4
}, {
  rotation:4,
  yoyo:true,
  repeat:-1,
  ease:Sine.easeInOut
})

var lightTween = TweenMax.staggerTo('.light', 0.76, {
  fill:'#E5023B',
  repeat:-1,
  yoyo:true,
  ease:Linear.easeNone
},0.16)

var spotlightHoverTween = TweenMax.from(spotlightHover, 0.8, {
  scaleX:0.9,
  yoyo:true,
  repeat:-1,
  ease:Sine.easeInOut
})

var speedLineTimeline = new TimelineMax({repeat:21});
speedLineTimeline.timeScale(9);

var tl = new TimelineMax({repeat:-1});
tl.from(ship, 4, {
  x:400,
  rotation:-53,
 //ease:Back.easeOut.config(2)
  ease:Elastic.easeOut.config(1.7, .8)
})
.fromTo(cow, 1, {
  x:-800},{
  x:0,
  ease:Expo.easeOut
})

.from(beam, 1.2, {
  scaleX:0,
  ease:Expo.easeOut,
  delay:1
},'-=3')

.from(spotlight, 1.2, {
  attr:{
    rx:0,
    ry:0
  },
  ease:Expo.easeOut,
  delay:1
},'-=3')
.to(glowAlpha, 1,{
  attr:{
    'flood-opacity':1
  }
})

.to(cow,2, {
  y:'-=160',
  x:0,
  fill:'#B8A310',
  rotation:-65,
  ease:Power2.easeIn
},'-=1')
.set(cow,{
  //x:-400,
  alpha:0
})
.to(beam, 1.2, {
  scaleX:0,
  ease:Expo.easeIn,
  delay:0
})
.to(spotlight, 1.2, {
  attr:{
    rx:0,
    ry:0
  },
  ease:Expo.easeIn
},'-=1.2')

.to(ship, 2, {
  //x:400,
  rotation:-54,
 ease:Power2.easeInOut
  
})

.to(ship, 2, {
  x:-1800,
 ease:Back.easeIn.config(0.8)
  
},'-=2')
.add(speedLineTimeline, 0)

function createSpeedLines(){
  
  for(var i = 0; i < speedLineGroup.length; i++){
    var tl = new TimelineMax();
    
    tl.to(speedLineGroup[i], 0.2, {
      drawSVG:'20% 0%',
      ease:Linear.easeNone
    })
    .to(speedLineGroup[i], 1, {
      drawSVG:'100% 80%',
      ease:Linear.easeNone
    })
    .to(speedLineGroup[i], 0.2, {
      drawSVG:'100% 100%',
      ease:Linear.easeNone
    })    
    
    speedLineTimeline.add(tl, ((i+1)/1.83))
  }
}

createSpeedLines()