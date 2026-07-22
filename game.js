/* Set this to Catherine's Auntie Anne's gift-card URL before sharing. */
const GIFT_LINK = '#';
const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const scoreEl = document.querySelector('#score');
const intro = document.querySelector('#introPanel');
const win = document.querySelector('#winPanel');
const toast = document.querySelector('#toast');
document.querySelector('#giftLink').href = GIFT_LINK;

const W=960,H=540, ground=440;
let active=false, last=0, score=0, camera=0, toastTimer=0, confetti=[];
const keys={left:false,right:false};
const player={x:90,y:365,w:58,h:66,vx:0,dir:1,cool:0,flash:0};
let shots=[], pretzels=[], enemies=[];

function reset(){score=0;camera=0;shots=[];confetti=[];player.x=90;player.y=365;player.vx=0;player.dir=1;player.cool=0;player.flash=0;
  pretzels=[{x:250,y:386},{x:500,y:333},{x:735,y:386},{x:1010,y:328},{x:1275,y:385}].map((p,i)=>({...p,id:i,saved:false,bob:i}));
  enemies=[{x:405,y:387,hp:1,color:'#f58ba8',kind:'grunt',w:56},{x:650,y:386,hp:1,color:'#a879c4',kind:'grunt',w:56},{x:900,y:383,hp:1,color:'#f0a149',kind:'grunt',w:56},{x:1175,y:370,hp:3,color:'#9153a2',kind:'boss',w:84}]; scoreEl.textContent='0 / 5';}
function start(){reset();active=true;intro.classList.add('hidden');win.classList.add('hidden');say('Rescue all 5 pretzels!');}
function say(text){toast.textContent=text;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),1800);}
function shoot(){if(!active||player.cool>0)return;player.cool=.34;shots.push({x:player.x+player.w/2+player.dir*20,y:player.y+28,vx:player.dir*510,life:1});}
function rectHit(a,b){return a.x<a.x+a.w && a.x+a.w>b.x && a.x<b.x+b.w && a.y+a.h>b.y && a.y<b.y+b.h;}
function update(dt){if(!active)return;player.cool=Math.max(0,player.cool-dt);player.flash=Math.max(0,player.flash-dt);let move=(keys.right?1:0)-(keys.left?1:0);player.vx+=move*1600*dt;player.vx*=Math.pow(.001,dt);if(move)player.dir=move;player.x=Math.max(35,Math.min(1365,player.x+player.vx*dt));player.y=ground-player.h+Math.sin(performance.now()/180)*2;
  camera=Math.max(0,Math.min(520,player.x-300));
  shots.forEach(s=>{s.x+=s.vx*dt;s.life-=dt;});shots=shots.filter(s=>s.life>0&&s.x>-20&&s.x<1450);
  pretzels.forEach(p=>{if(!p.saved&&Math.abs((p.x)-(player.x+29))<52){p.saved=true;score++;scoreEl.textContent=`${score} / 5`;say(score===5?'All pretzels rescued — find the captain!':`Pretzel rescued! ${score} of 5`);}});
  enemies.forEach(e=>{e.x+=Math.sin((performance.now()/700)+e.x)*.45;if(Math.abs(e.x-player.x)<45&&player.flash<=0){player.flash=.7;player.vx+=(player.x<e.x?-1:1)*500;}});
  for(const s of shots)for(const e of enemies)if(e.hp>0&&Math.abs(s.x-(e.x+e.w/2))<e.w/2+12&&Math.abs(s.y-(e.y+27))<45){e.hp--;s.life=0;say(e.hp===0?(e.kind==='boss'?'The captain crumbles!':'Donut defeated!'):'Captain Donut is wobbling!');}
  enemies=enemies.filter(e=>e.hp>0);if(score===5&&!enemies.some(e=>e.kind==='boss'))victory();
}
function victory(){active=false;for(let i=0;i<110;i++)confetti.push({x:Math.random()*W,y:-Math.random()*H,vx:(Math.random()-.5)*160,vy:80+Math.random()*170,c:['#fa7191','#f6bd4f','#6e9ed4','#8f70bd'][i%4],r:3+Math.random()*5});win.classList.remove('hidden');}
function round(x,y,r,color,stroke='#4b3557',lw=3){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.lineWidth=lw;ctx.strokeStyle=stroke;ctx.stroke();}
function cloud(x,y,s){ctx.fillStyle='#fff8e6b8';ctx.beginPath();ctx.arc(x,y,22*s,0,7);ctx.arc(x+29*s,y-10*s,30*s,0,7);ctx.arc(x+65*s,y,20*s,0,7);ctx.fill();}
function bagel(x,y,flip=1){ctx.save();ctx.translate(x,y);ctx.scale(flip,1);round(29,34,31,'#e89d4d','#6a3f42',4);round(29,34,11,'#fff0c0','#6a3f42',3);ctx.fillStyle='#f9cd67';ctx.beginPath();ctx.arc(19,22,8,0,7);ctx.arc(40,20,7,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#eef4ed';ctx.fillRect(5,9,11,15);ctx.strokeRect(5,9,11,15);ctx.fillStyle='#d85670';ctx.beginPath();ctx.moveTo(7,8);ctx.lineTo(12,-10);ctx.lineTo(18,8);ctx.fill();ctx.stroke();ctx.fillStyle='#382949';ctx.beginPath();ctx.arc(20,34,3,0,7);ctx.arc(39,34,3,0,7);ctx.fill();ctx.beginPath();ctx.arc(30,43,8,.15,2.9);ctx.stroke();ctx.restore();}
function pretzel(p){let bob=Math.sin(performance.now()/240+p.bob)*4;ctx.save();ctx.translate(p.x-camera,p.y+bob);ctx.strokeStyle='#733e38';ctx.lineWidth=12;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-13,12);ctx.bezierCurveTo(-30,-8,-12,-25,0,-7);ctx.bezierCurveTo(12,-25,30,-8,13,12);ctx.bezierCurveTo(5,22,-5,22,-13,12);ctx.stroke();ctx.fillStyle='#fff6df';ctx.beginPath();ctx.arc(-6,2,2.5,0,7);ctx.arc(6,2,2.5,0,7);ctx.fill();ctx.restore();}
function donut(e){let x=e.x-camera,y=e.y;ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(performance.now()/400+e.x)*.05);round(e.w/2,31,e.w/2,e.color,'#50334e',4);round(e.w/2,31,e.kind==='boss'?15:11,'#f6d48a','#50334e',3);ctx.fillStyle='#3a2746';ctx.beginPath();ctx.arc(e.w/2-10,29,3,0,7);ctx.arc(e.w/2+10,29,3,0,7);ctx.fill();ctx.strokeStyle='#3a2746';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.w/2,40,8,.2,2.9);ctx.stroke();ctx.fillStyle=e.kind==='boss'?'#f2c64c':'#7a5e9d';ctx.fillRect(e.w/2-16,-2,32,10);ctx.strokeRect(e.w/2-16,-2,32,10);if(e.kind==='boss'){ctx.fillStyle='#f2c64c';ctx.beginPath();ctx.moveTo(e.w/2-17,-2);ctx.lineTo(e.w/2-10,-15);ctx.lineTo(e.w/2,-3);ctx.lineTo(e.w/2+10,-15);ctx.lineTo(e.w/2+17,-2);ctx.fill();ctx.stroke();}ctx.restore();}
function draw(){ctx.clearRect(0,0,W,H);let g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#84d4df');g.addColorStop(1,'#fee3a0');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);cloud(100-camera*.16,90,1);cloud(490-camera*.12,150,.7);cloud(820-camera*.18,75,.9);
  ctx.fillStyle='#b991c4';for(let i=-1;i<5;i++){let x=i*290-camera*.25;ctx.beginPath();ctx.arc(x+100,375,150,Math.PI,0);ctx.fill();}ctx.fillStyle='#7fc6a1';ctx.fillRect(0,425,W,115);ctx.fillStyle='#4d925f';ctx.fillRect(0,454,W,86);
  for(let i=0;i<8;i++){let x=i*180-camera*.55;ctx.fillStyle='#d88d68';ctx.fillRect(x+40,375,40,55);ctx.fillStyle='#f8ca69';ctx.fillRect(x+27,350,67,30);ctx.fillStyle='#fff2c7';ctx.fillRect(x+36,360,48,10);}
  ctx.fillStyle='#e8b16a';ctx.fillRect(0,435,W,7);pretzels.filter(p=>!p.saved).forEach(pretzel);enemies.forEach(donut);
  shots.forEach(s=>{round(s.x-camera,s.y,9,'#fff9de','#e6cf9d',2);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x-camera-2,s.y-3,2,0,7);ctx.fill();});bagel(player.x-camera,player.y,player.dir);
  confetti.forEach(c=>{c.x+=c.vx/60;c.y+=c.vy/60;c.vy+=4;ctx.fillStyle=c.c;ctx.fillRect(c.x,c.y,c.r,c.r*1.8);});
  if(active&&score===5&&enemies.some(e=>e.kind==='boss')){ctx.fillStyle='#fff8e8dd';ctx.fillRect(650,20,250,38);ctx.fillStyle='#5d3465';ctx.font='700 16px Fredoka';ctx.textAlign='center';ctx.fillText('CAPTAIN DONUT  '+ '●'.repeat(enemies.find(e=>e.kind==='boss').hp),775,45);}
}
function frame(t){let dt=Math.min(.05,(t-last)/1000||0);last=t;update(dt);draw();requestAnimationFrame(frame);}requestAnimationFrame(frame);reset();draw();
document.querySelector('#startButton').addEventListener('click',start);document.querySelector('#againButton').addEventListener('click',start);
document.querySelectorAll('[data-key]').forEach(b=>{let k=b.dataset.key;const down=e=>{e.preventDefault();if(k==='throw')shoot();else keys[k]=true;};const up=e=>{e.preventDefault();if(k!=='throw')keys[k]=false;};b.addEventListener('pointerdown',down);b.addEventListener('pointerup',up);b.addEventListener('pointerleave',up);b.addEventListener('pointercancel',up);});
addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='a')keys.left=true;if(e.key==='ArrowRight'||e.key==='d')keys.right=true;if(e.key===' '||e.key==='Enter'){e.preventDefault();shoot();}});addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key==='a')keys.left=false;if(e.key==='ArrowRight'||e.key==='d')keys.right=false;});
