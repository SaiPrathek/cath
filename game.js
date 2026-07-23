/* Replace # with the real Auntie Anne's gift-card URL before sharing. */
const GIFT_LINK = '#';
const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const W = 960, H = 540;

const ui = Object.fromEntries(['loadingScreen','loadingStatus','retryLoad','titleScreen','storyScreen','storyImage','storyDialogue','storySpeaker','storyBeatDots','storyPortraitCanvas','levelScreen','endingScreen','hud','controls','dialogue','toast','bossHud','actLabel','levelLabel','hearts','cream','rescued','goalPill','bossName','bossBar','storyKicker','storyTitle','storyText','storyQuote','pageNumber','levelKicker','levelTitle','levelDescription','levelMission','portraitCanvas'].map(id=>[id,document.querySelector('#'+id)]));
document.querySelector('#giftLink').href = GIFT_LINK;
const ASSET_ROOT='/cath/assets/pixel/';
const images={};
const ASSET_FILES={sprites:'sprites.png',tiles:'tiles.png',commons:'background-commons-v3.png',factory:'background-sprinkleworks-v3.png',castle:'background-gauntlet-v3.png',story1:'story-1.png',story2:'story-2.png',story3:'story-3.png',story4:'story-4.png',story5:'story-5.png'};

const STORY = [
  {image:'story1',kicker:'Twistwick • one peaceful morning',title:'A perfectly twisted birthday',text:'The Pretzel People prepare a celebration for Catherine. Nothing is on fire yet.',pan:[-5,1],beats:[
    ['Mayor Twistopher','Citizens! Today’s celebration must be perfect.'],
    ['Little Loop','The birthday banner is upside down.'],
    ['Mayor Twistopher','Then it is perfectly upside down.'],
    ['Pretzel Citizen','Is that enormous shadow part of the entertainment?'],
    ['Mayor Twistopher','I’m going to say yes until it becomes dangerous.',true]
  ]},
  {image:'story2',kicker:'Unfortunately • it becomes dangerous',title:'A king without an invitation',text:'A frosting-powered chariot lands in the square. Its driver has misunderstood the assignment.',pan:[4,-1],beats:[
    ['King Glazebald','At last! A festival worthy of King Glazebald the Magnificent!'],
    ['Mayor Twistopher','Actually, it’s for Catherine.'],
    ['King Glazebald','Who?'],
    ['Mayor Twistopher','Catherine.'],
    ['King Glazebald','I heard you. I was giving you an opportunity to correct yourself.',true]
  ]},
  {image:'story3',kicker:'The Great Sprinkle Raid',title:'Glazebald cancels the party',text:'If Twistwick will not celebrate him, Glazebald decides nobody gets a celebration.',pan:[-3,2],beats:[
    ['King Glazebald','Take the Salt Crystals! Capture the townspeople! And fix that banner!'],
    ['Mayor Twistopher','Would mustard settle this peacefully?'],
    ['King Glazebald','I am offended by the question and the condiment.'],
    ['Sir Sprinkles','Shall we arrest the mustard too, Your Glaziness?'],
    ['King Glazebald','Especially the mustard.',true]
  ]},
  {image:'story4',kicker:'Meanwhile • Cat’s breakfast',title:'The extremely dramatic knock',text:'Three escapees find Catherine “Cat” Crumbwell and one rapidly cooling cup of coffee.',pan:[3,0],beats:[
    ['Cat Crumbwell','If this is about the noise complaint, my toaster has legal representation.'],
    ['Auntie Saltina','Glazebald captured everyone!'],
    ['Cat Crumbwell','That sounds serious.'],
    ['Little Loop','He also destroyed Catherine’s birthday decorations.'],
    ['Cat Crumbwell','That sounds personal.',true]
  ]},
  {image:'story5',kicker:'One heroic sigh later',title:'The Cream Cheese Sling',text:'Auntie Saltina reveals Twistwick’s ancient weapon. Cat reluctantly begins looking heroic.',pan:[-2,-2],beats:[
    ['Auntie Saltina','Twistwick needs a hero.'],
    ['Cat Crumbwell','Twistwick needs better security.'],
    ['Little Loop','Our report says Glazebald is loud, dramatic, and extremely spotty.'],
    ['Cat Crumbwell','Spotty?'],
    ['Little Loop','Sprinkles. Probably. It also says you may call him a dummy.'],
    ['Cat Crumbwell','That is not intelligence. That is a prediction.'],
    ['Cat Crumbwell','Fine. I’ll save the birthday and deal with the spotty dummy.',true],
    ['King Glazebald','I HEARD THAT!',true]
  ]}
];

const LEVELS = [
  {act:'ACT I',name:'Crumbly Commons',desc:'A gentle first route through toast hills, tiny jam gaps, and a few overconfident pastries.',mission:'Rescue Mayor Twistopher • Reach the bakery gate',width:2200,start:{x:90,y:360},exit:2080,theme:'meadow',
    platforms:[[0,460,720,90],[780,460,720,90],[1560,460,640,90],[360,370,180,22],[900,365,190,22],[1320,350,190,22],[1740,370,190,22]],
    hazards:[[720,455,60,85],[1500,455,60,85]], cages:[[1250,385,'Mayor Twistopher']], checkpoints:[1100], enemies:[[650,400,'scout'],[1050,305,'archer'],[1720,400,'roller']], switches:[], boss:null},
  {act:'ACT II',name:'Sprinkleworks',desc:'The factory is still dramatic, but its safety department has installed wider walkways.',mission:'Rescue two pretzels • Defeat Sir Sprinkles',width:2500,start:{x:80,y:360},exit:2390,theme:'factory',
    platforms:[[0,460,780,90],[850,460,690,90],[1610,460,890,90],[300,370,190,22],[930,355,190,22],[1320,365,190,22],[1750,350,190,22],[2040,375,200,22]],
    hazards:[[780,455,70,85],[1540,455,70,85]], cages:[[1000,385,'Knottingham'],[1650,385,'Auntie Saltina']],checkpoints:[1260],enemies:[[700,400,'scout'],[1280,305,'archer'],[1840,400,'roller']],switches:[],boss:{x:2160,y:378,kind:'sprinkles',hp:4}},
  {act:'ACT III',name:'The Glazed Gauntlet',desc:'A forgiving climb to the throne room, followed by one very theatrical donut.',mission:'Rescue the final two pretzels • Defeat King Glazebald',width:2850,start:{x:70,y:360},exit:2740,theme:'castle',
    platforms:[[0,460,820,90],[890,460,730,90],[1690,460,1160,90],[340,370,190,22],[990,350,190,22],[1350,365,190,22],[1810,345,200,22],[2120,375,200,22]],
    hazards:[[820,455,70,85],[1620,455,70,85]],cages:[[1100,385,'Baker Braidley'],[1780,385,'Little Loop']],checkpoints:[1380,1980],enemies:[[720,400,'scout'],[1400,305,'archer'],[1940,400,'roller']],switches:[],boss:{x:2380,y:350,kind:'king',hp:6}}
];

let scene='loading', storyIndex=0, storyBeat=0, levelIndex=0, level=null, last=0, camera=0, totalRescued=0, muted=false, audio=null, toastTimer=0, dialogueQueue=[], dialogueDone=null;
let platforms=[], hazards=[], cages=[], enemies=[], projectiles=[], particles=[], switches=[], checkpoint={x:90,y:360};
const input={left:false,right:false,jump:false,shoot:false,jumpPress:false,shootPress:false};
const hero={x:90,y:350,w:44,h:62,vx:0,vy:0,dir:1,onGround:false,coyote:0,jumpBuffer:0,hearts:3,cream:8,creamClock:0,shootCd:0,invuln:0,animation:'idle',frame:0,frameClock:0};

function hideOverlays(){['titleScreen','storyScreen','levelScreen','endingScreen'].forEach(k=>ui[k].classList.add('hidden'));}
function show(el){el?.classList.remove('hidden')} function hide(el){el?.classList.add('hidden')}
function tone(freq=440,d=.08,type='sine'){if(muted)return;try{audio ||= new (window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.055,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+d)}catch{}}
function say(text,time=1800){ui.toast.textContent=text;ui.toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>ui.toast.classList.remove('show'),time)}
function updateHud(){ui.hearts.textContent='♥ '.repeat(hero.hearts).trim()+' ♡ '.repeat(3-hero.hearts).trim();ui.cream.textContent=Math.floor(hero.cream);ui.rescued.textContent=totalRescued+'/5';if(!level)return;const boss=enemies.find(e=>!e.dead&&(e.kind==='sprinkles'||e.kind==='king'));ui.goalPill.textContent=!cages.every(c=>c.saved)?'FIND THE PRETZELS →':boss?'DEFEAT THE BOSS →':'REACH THE GATE →'}
function storyStart(){scene='story';storyIndex=0;storyBeat=0;hideOverlays();show(ui.storyScreen);renderStory(true)}
function renderStory(newScene=false){
  const s=STORY[storyIndex],beat=s.beats[storyBeat],card=ui.storyScreen;
  if(newScene){ui.storyImage.src=images[s.image].src;ui.storyImage.alt=s.title+' pixel-art scene';ui.storyKicker.textContent=s.kicker;ui.storyTitle.textContent=s.title;ui.storyText.textContent=s.text;card.style.setProperty('--scene-pan-x',s.pan[0]+'px');card.style.setProperty('--scene-pan-y',s.pan[1]+'px');card.classList.remove('scene-enter');void card.offsetWidth;card.classList.add('scene-enter')}
  ui.storySpeaker.textContent=beat[0];ui.storyQuote.textContent=beat[1];drawPortrait(beat[0],ui.storyPortraitCanvas);
  ui.pageNumber.textContent=`SCENE ${storyIndex+1} / ${STORY.length}`;
  ui.storyBeatDots.innerHTML=s.beats.map((_,i)=>`<i class="${i<=storyBeat?'done':''}"></i>`).join('');
  ui.storyDialogue.classList.remove('speaking');void ui.storyDialogue.offsetWidth;ui.storyDialogue.classList.add('speaking');
  card.classList.toggle('story-react',Boolean(beat[2]));
  const lastBeat=storyBeat===s.beats.length-1,lastScene=storyIndex===STORY.length-1;
  document.querySelector('#nextStory').innerHTML=lastBeat?(lastScene?'Begin the quest <b>→</b>':'Turn the page <b>→</b>'):'Continue <b>→</b>';
  drawBackdrop()
}
function nextStory(){
  tone(620,.08);
  const s=STORY[storyIndex];
  if(storyBeat<s.beats.length-1){storyBeat++;return renderStory()}
  storyIndex++;storyBeat=0;
  if(storyIndex>=STORY.length)return showLevelIntro(0);
  renderStory(true)
}
function showLevelIntro(i){levelIndex=i;scene='levelIntro';hideOverlays();hide(ui.hud);hide(ui.controls);const l=LEVELS[i];ui.levelKicker.textContent=l.act;ui.levelTitle.textContent=l.name;ui.levelDescription.textContent=l.desc;ui.levelMission.textContent=l.mission;ui.actLabel.textContent=l.act;ui.levelLabel.textContent=l.name;show(ui.levelScreen);drawBackdrop()}
function loadLevel(i){levelIndex=i;level=LEVELS[i];scene='play';hideOverlays();show(ui.hud);show(ui.controls);hide(ui.bossHud);platforms=level.platforms.map(a=>({x:a[0],y:a[1],w:a[2],h:a[3],active:true}));hazards=level.hazards.map(a=>({x:a[0],y:a[1],w:a[2],h:a[3]}));cages=level.cages.map((a,n)=>({x:a[0],y:a[1],w:58,h:72,name:a[2],hp:1,saved:false,id:n}));switches=[];enemies=level.enemies.map((a,n)=>makeEnemy(a[0],a[1],a[2],n));if(level.boss)enemies.push(makeBoss(level.boss));projectiles=[];particles=[];checkpoint={...level.start};Object.assign(hero,{x:level.start.x,y:level.start.y,vx:0,vy:0,hearts:3,cream:8,invuln:0});camera=0;updateHud();queueDialogue(levelDialogue(i));}
function levelDialogue(i){return i===0?[["Cat Crumbwell","◎","Toast hills, jam pits, armed donuts. Nice quiet morning."],["Auntie Saltina","🥨","Find the cages! One schmear hit will break each lock."],["Cat Crumbwell","◎","Move, jump, shoot. Finally, instructions I respect."]]:i===1?[["Cat Crumbwell","◎","A factory powered by sprinkles. Somehow not the strangest Tuesday I’ve had."],["Auntie Saltina","🥨","Sir Sprinkles guards the far gate. He rehearses his entrances."],["Cat Crumbwell","◎","I’ll try to look surprised."]]:[["King Glazebald","🍩","Welcome to my impenetrable Glazed Gauntlet!"],["Cat Crumbwell","◎","I entered through an unlocked door."],["King Glazebald","🍩","A deliberately unlocked door! For dramatic tension!"]]}
function makeEnemy(x,y,kind,n){return{x,y,w:kind==='roller'?54:50,h:kind==='roller'?54:58,kind,hp:kind==='roller'?2:1,maxHp:kind==='roller'?2:1,baseX:x,dir:n%2?1:-1,speed:kind==='roller'?62:34,cool:1.4+n*.2,dead:false,flash:0,animation:'walk',frame:0,frameClock:n*.07}}
function makeBoss(b){return{x:b.x,y:b.y,w:b.kind==='king'?105:76,h:b.kind==='king'?105:82,kind:b.kind,hp:b.hp,maxHp:b.hp,baseX:b.x,dir:-1,speed:b.kind==='king'?85:60,cool:1.4,dead:false,flash:0,phase:1,state:'idle',stateClock:0,animation:'walk',frame:0,frameClock:0,introShown:false}}
function queueDialogue(lines,done=null){dialogueQueue=[...lines];dialogueDone=done;scene='dialogue';show(ui.dialogue);advanceDialogue()}
function advanceDialogue(){if(!dialogueQueue.length){hide(ui.dialogue);scene='play';const done=dialogueDone;dialogueDone=null;if(done)done();return}const [name,,text]=dialogueQueue.shift();document.querySelector('#speaker').textContent=name;drawPortrait(name);document.querySelector('#dialogueText').textContent=text;tone(360,.04,'triangle')}

function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function animate(entity,state,count,speed,dt){if(entity.animation!==state){entity.animation=state;entity.frame=0;entity.frameClock=0}entity.frameClock+=dt;if(entity.frameClock>=speed){entity.frameClock-=speed;entity.frame=(entity.frame+1)%count}}
function solidCollision(prevY){hero.onGround=false;for(const p of platforms){if(!p.active)continue;if(hero.x+hero.w>p.x&&hero.x<p.x+p.w&&hero.y+hero.h>=p.y&&prevY+hero.h<=p.y+8&&hero.vy>=0){hero.y=p.y-hero.h;hero.vy=0;hero.onGround=true}}}
function updateHero(dt){hero.shootCd=Math.max(0,hero.shootCd-dt);hero.invuln=Math.max(0,hero.invuln-dt);hero.creamClock+=dt;if(hero.cream<8&&hero.creamClock>1.35){hero.cream=Math.min(8,hero.cream+1);hero.creamClock=0;updateHud()}
  if(input.jumpPress)hero.jumpBuffer=.13;else hero.jumpBuffer=Math.max(0,hero.jumpBuffer-dt);hero.coyote=hero.onGround?.11:Math.max(0,hero.coyote-dt);
  const move=(input.right?1:0)-(input.left?1:0);if(move)hero.dir=move;
  hero.vx+=move*1500*dt;hero.vx*=Math.pow(move?.07:.0004,dt);hero.vx=Math.max(-285,Math.min(285,hero.vx));hero.vy+=1200*dt;hero.vy=Math.min(hero.vy,700);
  if(hero.jumpBuffer>0&&hero.coyote>0){hero.vy=-500;hero.jumpBuffer=0;hero.coyote=0;burst(hero.x+22,hero.y+62,'#fff0c9',7);tone(460,.08,'square')}
  if(!input.jump&&hero.vy< -190)hero.vy=-190;const prevY=hero.y;hero.x+=hero.vx*dt;hero.y+=hero.vy*dt;hero.x=Math.max(0,Math.min(level.width-hero.w,hero.x));solidCollision(prevY);
  if(input.shootPress)shoot();for(const h of hazards)if(overlap(hero,h))hurtHero();if(hero.y>H+170)respawn();for(const e of enemies)if(!e.dead&&overlap(hero,e))hurtHero(e.x);for(const c of cages)if(c.saved&&Math.abs(hero.x-c.x)<55)c.collected=true;
  for(const cp of level.checkpoints)if(hero.x>cp&&checkpoint.x<cp){checkpoint={x:cp,y:340};say('Checkpoint: fresh coffee acquired ☕');tone(720,.1)}
  const state=hero.invuln>0?'hurt':hero.shootCd>.12?'shoot':!hero.onGround?'jump':Math.abs(hero.vx)>24?'run':'idle';
  animate(hero,state,{idle:4,run:6,jump:2,shoot:4,hurt:2}[state],state==='run'?.075:.12,dt);
  if(hero.x>level.exit&&cages.every(c=>c.saved)&&!enemies.some(e=>!e.dead&&(e.kind==='sprinkles'||e.kind==='king')))finishLevel();else if(hero.x>level.exit-80&&!cages.every(c=>c.saved))say('The gate needs every Salt Crystal!')
}
function shoot(){if(hero.shootCd>0||hero.cream<1)return say('Out of schmear — give it a second!');hero.shootCd=.28;hero.cream--;hero.creamClock=0;projectiles.push({x:hero.x+22+hero.dir*25,y:hero.y+25,w:18,h:14,vx:hero.dir*570,vy:-15,owner:'hero',life:1.6,kind:'cream'});updateHud();tone(290,.06,'triangle')}
function hurtHero(from=hero.x){if(hero.invuln>0)return;hero.hearts--;hero.invuln=1.35;hero.vx=hero.x<from?-260:260;hero.vy=-260;shake();tone(110,.16,'sawtooth');updateHud();if(hero.hearts<=0)setTimeout(respawn,350)}
function respawn(){hero.hearts=3;hero.x=checkpoint.x;hero.y=checkpoint.y;hero.vx=hero.vy=0;hero.invuln=1.2;updateHud();say('Cat returns with renewed determination.')}
function shake(){const card=document.querySelector('.game-card');card.classList.remove('shake');void card.offsetWidth;card.classList.add('shake')}
function burst(x,y,color,count=8){for(let i=0;i<count;i++)particles.push({x,y,vx:(Math.random()-.5)*230,vy:-60-Math.random()*180,life:.5+Math.random()*.4,color,r:3+Math.random()*4})}

function updateEnemies(dt){for(const e of enemies){if(e.dead)continue;e.flash=Math.max(0,e.flash-dt);e.cool-=dt;e.stateClock=(e.stateClock||0)-dt;
    animate(e,'walk',4,.14,dt);
    if(e.kind==='king'){updateKing(e,dt);continue}if(e.kind==='sprinkles'){e.x+=e.dir*e.speed*dt;if(Math.abs(e.x-e.baseX)>180)e.dir*=-1;if(e.cool<=0){enemyShot(e,'sprinkle');e.cool=1.25}continue}
    e.x+=e.dir*e.speed*dt;if(Math.abs(e.x-e.baseX)>(e.kind==='archer'?35:85))e.dir*=-1;if(e.kind==='archer'&&e.cool<=0&&Math.abs(hero.x-e.x)<560){enemyShot(e,'sugar');e.cool=1.7}
  }enemies=enemies.filter(e=>!e.dead)}
function updateKing(e,dt){if(e.phase===1){e.x=e.baseX+Math.sin(performance.now()/800)*75;if(e.cool<=0){enemyShot(e,'orb');e.cool=1.55}}else{e.state='roll';e.x+=e.dir*145*dt;if(e.x<e.baseX-230||e.x>e.baseX+230)e.dir*=-1}}
function enemyShot(e,kind){const dx=hero.x-e.x,dy=hero.y-e.y,d=Math.hypot(dx,dy)||1;projectiles.push({x:e.x+e.w/2,y:e.y+25,w:kind==='orb'?24:15,h:kind==='orb'?24:15,vx:dx/d*(kind==='orb'?220:190),vy:dy/d*(kind==='orb'?220:190),owner:'enemy',life:4,kind});tone(kind==='orb'?140:210,.07,'square')}
function updateProjectiles(dt){for(const p of projectiles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.kind==='cream')p.vy+=80*dt;
    if(p.owner==='enemy'&&overlap(p,hero)){p.life=0;hurtHero(p.x)}
    for(const c of cages)if(!c.saved&&overlap(p,c)&&p.owner==='hero'){p.life=0;c.hp--;burst(p.x,p.y,'#f3c84f',8);if(c.hp<=0)rescue(c)}
    for(const e of enemies)if(!e.dead&&overlap(p,e)&&p.owner==='hero'){p.life=0;hitEnemy(e,p)}
  }projectiles=projectiles.filter(p=>p.life>0&&p.x>-100&&p.x<level.width+100&&p.y<700)}
function hitEnemy(e,p){if(e.kind==='king'){e.hp--;e.flash=.18;burst(p.x,p.y,'#f0a2c0',14);shake();tone(170,.08,'square');if(e.phase===1&&e.hp===3){e.phase=2;e.state='roll';queueDialogue([["King Glazebald","🍩","Impossible! Initiate rolling majestically!"],["Cat Crumbwell","◎","That’s just rolling."],["King Glazebald","🍩","Majestically!"]]);return}if(e.hp<=0)defeatBoss(e);updateHud();return}
  e.hp--;e.flash=.15;burst(p.x,p.y,'#fff0c8',8);if(e.hp<=0){e.dead=true;updateHud();tone(160,.12,'sawtooth');if(e.kind==='sprinkles')queueDialogue([["Sir Sprinkles","🍩","I have been… lightly spread."],["Cat Crumbwell","◎","You fought bravely."],["Sir Sprinkles","🍩","Truly?"],["Cat Crumbwell","◎","No. But you looked like you needed that."]]);}}
function defeatBoss(e){e.dead=true;hide(ui.bossHud);updateHud();for(let i=0;i<70;i++)burst(e.x+e.w/2,e.y+e.h/2,['#f4bb4f','#e75f7b','#8b72bd'][i%3],1);queueDialogue([["King Glazebald","🍩","Impossible! You discovered my one weakness!"],["Cat Crumbwell","◎","Cream cheese?"],["King Glazebald","🍩","No."],["Cat Crumbwell","◎","The enormous hole?"],["King Glazebald","🍩","…I preferred the first answer."]]);tone(90,.4,'sawtooth')}
function rescueDialogue(name){return name==='Mayor Twistopher'?[["Mayor Twistopher","🥨","Cat! You came!"],["Cat Crumbwell","◎","Apparently I’m very predictable."],["Mayor Twistopher","🥨","Glazebald took the others to the Sprinkleworks."]]:name==='Knottingham'?[["Knottingham","🥨","Freedom! I was running out of cage-related conversation."],["Cat Crumbwell","◎","Go rehearse something less specific."]]:name==='Auntie Saltina'?[["Auntie Saltina","🥨","The Cream Cheese Sling suits you."],["Cat Crumbwell","◎","It clashes with the helmet, but I’ll survive."]]:name==='Baker Braidley'?[["Baker Braidley","🥨","The throne room is ahead. Also, he still hasn’t fixed the banner."],["Cat Crumbwell","◎","Some crimes cannot be forgiven."]]:[["Little Loop","🥨","Glazebald talks a lot. Ordinary cream cheese works perfectly."],["Cat Crumbwell","◎","Excellent. I brought eight scoops and very little patience."]]}
function rescue(c){c.saved=true;totalRescued++;burst(c.x+29,c.y+35,'#f6cf55',22);tone(820,.15,'triangle');setTimeout(()=>tone(1040,.18,'triangle'),100);say(c.name+' rescued!');updateHud();queueDialogue(rescueDialogue(c.name))}
function finishLevel(){if(scene!=='play')return;if(levelIndex<LEVELS.length-1){scene='transition';document.querySelector('.game-card').classList.add('flash');setTimeout(()=>{document.querySelector('.game-card').classList.remove('flash');showLevelIntro(levelIndex+1)},400)}else{scene='endingStory';hide(ui.hud);hide(ui.controls);queueDialogue([["Mayor Twistopher","🥨","Cat Crumbwell, you rescued our people and saved Catherine’s birthday!"],["Little Loop","🥨","And defeated a spotty dummy."],["King Glazebald","🍩","Stop calling me that!"],["Auntie Saltina","🥨","Please accept Twistwick’s highest honor: an Auntie Anne’s gift card."],["Cat Crumbwell","◎","You’re rewarding me for saving pretzels… with money to eat pretzels?"],["Mayor Twistopher","🥨","We did not think this through."],["Little Loop","🥨","Should we take it back?"],["Cat Crumbwell","◎","Absolutely not."]],showEnding)}}
function showEnding(){scene='ending';hide(ui.dialogue);hide(ui.hud);hide(ui.controls);hide(ui.bossHud);show(ui.endingScreen);confetti(160);tone(523,.15);setTimeout(()=>tone(659,.15),160);setTimeout(()=>tone(784,.3),320)}
function confetti(n){for(let i=0;i<n;i++)particles.push({x:Math.random()*W,y:-Math.random()*H,vx:(Math.random()-.5)*150,vy:70+Math.random()*160,life:6,color:['#ef6380','#f3bc4d','#75b89a','#9575bd'][i%4],r:3+Math.random()*5,screen:true})}

function bossIntroduction(boss){boss.introShown=true;return boss.kind==='king'?[["King Glazebald","🍩","So. You’re the insolent bagel who called me a spotty dummy."],["Cat Crumbwell","◎","In my defense, you are spotty."],["King Glazebald","🍩","And the other part?"],["Cat Crumbwell","◎","The evidence is developing."]]:[["Sir Sprinkles","🍩","Halt! By royal order, you are officially surrounded!"],["Cat Crumbwell","◎","There’s nobody behind me."],["Sir Sprinkles","🍩","Unofficially surrounded."]]}
function update(dt){if(scene==='play'){updateHero(dt);updateEnemies(dt);updateProjectiles(dt);if(scene==='play'){const boss=enemies.find(e=>e.kind==='king'||e.kind==='sprinkles');if(boss&&Math.abs(hero.x-boss.x)<620){show(ui.bossHud);ui.bossName.textContent=boss.kind==='king'?'KING GLAZEBALD':'SIR SPRINKLES';ui.bossBar.style.width=Math.max(0,boss.hp/boss.maxHp*100)+'%';if(!boss.introShown)queueDialogue(bossIntroduction(boss))}else hide(ui.bossHud);camera+=(Math.max(0,Math.min(level.width-W,hero.x-W*.38))-camera)*Math.min(1,dt*5)}}for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.screen?80:380)*dt;p.life-=dt}particles=particles.filter(p=>p.life>0);input.jumpPress=input.shootPress=false}

function snap(v){return Math.round(v)}
function drawSprite(key,x,y,w,h,flip=false,alpha=1,target=ctx){const box=SPRITE_FRAMES[key];if(!box||!images.sprites)return;target.save();target.imageSmoothingEnabled=false;target.globalAlpha=alpha;if(flip){target.translate(snap(x+w),snap(y));target.scale(-1,1);target.drawImage(images.sprites,...box,0,0,snap(w),snap(h))}else target.drawImage(images.sprites,...box,snap(x),snap(y),snap(w),snap(h));target.restore()}
function drawPortrait(name,canvas=ui.portraitCanvas){const p=canvas.getContext('2d');p.clearRect(0,0,48,48);p.imageSmoothingEnabled=false;const key=name.includes('Glazebald')?'king.walk.0':name.includes('Sprinkles')?'sprinkles.walk.0':name.includes('Cat')?'cat.idle.0':'pretzel.happy.0';const box=SPRITE_FRAMES[key];const size=key.startsWith('king')?48:key.startsWith('pretzel')?38:44;p.drawImage(images.sprites,...box,(48-size)/2,(48-size)/2,size,size)}
function drawBackdrop(){if(images.story5){ctx.drawImage(images.story5,0,0,W,H);ctx.fillStyle='#251a3277';ctx.fillRect(0,0,W,H)}else{ctx.fillStyle='#251a32';ctx.fillRect(0,0,W,H);for(let y=0;y<H;y+=24)for(let x=(y/24%2)*12;x<W;x+=24){ctx.fillStyle='#382646';ctx.fillRect(x,y,12,12)}}}
function drawWorld(){const theme=level?.theme||'meadow',plate=theme==='factory'?images.factory:theme==='castle'?images.castle:images.commons,pan=Math.min(150,Math.max(0,camera*.105));ctx.drawImage(plate,-pan,0,W+150,H);ctx.fillStyle=theme==='castle'?'#21152b18':theme==='factory'?'#521f4012':'#fff0c208';ctx.fillRect(0,0,W,H);
  for(const p of platforms)drawPlatform(p,theme);for(const h of hazards)drawHazard(h);for(const c of cages)drawCage(c);drawExit();for(const e of enemies)drawEnemy(e);for(const p of projectiles)drawProjectile(p);if(hero.invuln<=0||Math.floor(performance.now()/80)%2)drawHero();for(const p of particles)drawParticle(p)}
function drawPlatform(p,theme){let x=snap(p.x-camera);if(x>W+50||x+p.w<-50)return;const sx=theme==='factory'?16:theme==='castle'?32:0;for(let tx=0;tx<p.w;tx+=48)for(let ty=0;ty<p.h;ty+=48)ctx.drawImage(images.tiles,sx,0,16,16,x+tx,p.y+ty,Math.min(48,p.w-tx),Math.min(48,p.h-ty))}
function drawHazard(h){let x=snap(h.x-camera);for(let tx=0;tx<h.w;tx+=48)ctx.drawImage(images.tiles,48,0,16,16,x+tx,h.y,Math.min(48,h.w-tx),h.h)}
function drawExit(){let x=snap(level.exit-camera),open=cages.every(c=>c.saved)&&!enemies.some(e=>!e.dead&&(e.kind==='sprinkles'||e.kind==='king'));ctx.fillStyle='#251a32';ctx.fillRect(x-6,344,84,116);ctx.fillStyle=open?'#e8a33c':'#604866';ctx.fillRect(x,350,72,110);ctx.fillStyle='#fff0c2';ctx.fillRect(x+48,404,7,7);ctx.fillStyle='#251a32';ctx.font='700 14px "Silkscreen"';ctx.textAlign='center';ctx.fillText(open?'EXIT >':'LOCKED',x+36,335)}
function drawCage(c){let x=snap(c.x-camera);if(c.saved){drawPretzel(x+29,c.y+42,true,c.id);return}ctx.fillStyle='#251a32';ctx.fillRect(x,c.y,c.w,8);ctx.fillRect(x,c.y+64,c.w,8);ctx.fillStyle='#d7a546';ctx.fillRect(x+2,c.y+3,c.w-4,3);ctx.fillRect(x+2,c.y+66,c.w-4,3);for(let i=5;i<c.w;i+=13){ctx.fillStyle='#251a32';ctx.fillRect(x+i,c.y,7,72);ctx.fillStyle='#b8bbc0';ctx.fillRect(x+i+2,c.y+4,3,62)}drawPretzel(x+29,c.y+42,false,c.id)}
function drawPretzel(x,y,happy,id=0){const f=Math.floor(performance.now()/180+id)%4;drawSprite(`pretzel.${happy?'happy':'worried'}.${f}`,x-24,y-24,48,48)}
function spriteShadow(x,y,w){ctx.fillStyle='#21152b88';ctx.fillRect(snap(x-w/2),snap(y),snap(w),5);ctx.fillStyle='#100b1866';ctx.fillRect(snap(x-w*.3),snap(y+5),snap(w*.6),3)}
function drawHero(){const x=hero.x-camera;spriteShadow(x+hero.w/2,hero.y+hero.h-1,42);drawSprite(`cat.${hero.animation}.${hero.frame}`,x-10,hero.y-2,64,64,hero.dir<0)}
function drawEnemy(e){let x=e.x-camera;if(x>W+140||x<-140)return;const key=`${e.kind}.walk.${e.frame%4}`,boss=e.kind==='king',size=boss?96:64;spriteShadow(x+e.w/2,e.y+e.h-1,boss?68:42);drawSprite(key,x+(e.w-size)/2,e.y+(e.h-size),size,size,e.dir<0,e.flash?0.45:1)}
function drawProjectile(p){let x=snap(p.x-camera),y=snap(p.y);ctx.fillStyle='#251a32';ctx.fillRect(x-10,y-7,p.kind==='orb'?22:18,p.kind==='orb'?22:16);ctx.fillStyle=p.kind==='cream'?'#fff0c2':p.kind==='orb'?'#ef7598':'#f0c04c';ctx.fillRect(x-6,y-4,p.kind==='orb'?14:12,p.kind==='orb'?14:10);ctx.fillStyle='#fff8dc';ctx.fillRect(x-3,y-3,4,4)}
function drawParticle(p){ctx.fillStyle=p.color;ctx.fillRect(snap(p.screen?p.x:p.x-camera),snap(p.y),Math.max(3,snap(p.r)),Math.max(3,snap(p.r*(p.screen?1.8:1))))}
function draw(){ctx.imageSmoothingEnabled=false;if(scene==='loading'||scene==='title'||scene==='story'||scene==='levelIntro')drawBackdrop();else drawWorld()}
function frame(t){const dt=Math.min(.034,(t-last)/1000||0);last=t;update(dt);draw();requestAnimationFrame(frame)}

function pressKey(k,down){if(down&&!input[k])input[k+'Press']=true;input[k]=down}
document.querySelector('#startButton').addEventListener('click',()=>{tone(520,.08);storyStart()});document.querySelector('#continueButton').addEventListener('click',()=>showLevelIntro(0));document.querySelector('#skipStory').addEventListener('click',()=>showLevelIntro(0));document.querySelector('#nextStory').addEventListener('click',nextStory);document.querySelector('#levelButton').addEventListener('click',()=>loadLevel(levelIndex));document.querySelector('#dialogueNext').addEventListener('click',advanceDialogue);document.querySelector('#playAgain').addEventListener('click',()=>location.reload());document.querySelector('#muteButton').addEventListener('click',e=>{muted=!muted;e.currentTarget.textContent=muted?'×':'♪';say(muted?'Sound muted':'Sound on')});
ui.retryLoad.addEventListener('click',loadAssets);
const keyMap={ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',' ':'jump',ArrowUp:'jump',w:'jump',W:'jump',j:'shoot',J:'shoot'};addEventListener('keydown',e=>{const k=keyMap[e.key];if(k){e.preventDefault();pressKey(k,true)}if(scene==='dialogue'&&(e.key==='Enter'||e.key===' '))advanceDialogue();else if(scene==='story'&&(e.key==='Enter'||e.key===' '))nextStory()});addEventListener('keyup',e=>{const k=keyMap[e.key];if(k){e.preventDefault();pressKey(k,false)}});addEventListener('blur',()=>Object.keys(input).forEach(k=>input[k]=false));

function fetchImage(file){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error(file));image.src=ASSET_ROOT+file})}
async function loadAssets(){
  scene='loading';show(ui.loadingScreen);hide(ui.titleScreen);hide(ui.retryLoad);ui.loadingStatus.textContent='WARMING THE OVENS...';
  try{
    const entries=Object.entries(ASSET_FILES);let loaded=0;
    await Promise.all(entries.map(async([key,file])=>{images[key]=await fetchImage(file);loaded++;ui.loadingStatus.textContent=`BAKING PIXELS ${loaded} / ${entries.length}`;}));
    hide(ui.loadingScreen);show(ui.titleScreen);scene='title';drawBackdrop();
  }catch(error){
    console.error('Required pixel-art asset failed to load:',error.message);ui.loadingStatus.textContent='A SPRITE FELL OFF THE TRAY. CHECK YOUR CONNECTION AND RETRY.';show(ui.retryLoad);
  }
}

updateHud();drawBackdrop();requestAnimationFrame(frame);loadAssets();
