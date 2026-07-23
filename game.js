/* Replace # with the real Auntie Anne's gift-card URL before sharing. */
const GIFT_LINK = '#';
const MUSIC_FILE = '/cath/assets/Cath.m4a';
const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const backgroundMusic = document.querySelector('#backgroundMusic');
ctx.imageSmoothingEnabled = false;
const W = 960, H = 540;

const ui = Object.fromEntries(['loadingScreen','loadingStatus','retryLoad','titleScreen','storyScreen','storyImage','storyDialogue','storySpeaker','storyBeatDots','storyPortraitCanvas','levelScreen','tutorialScreen','victoryScreen','victoryImage','endingScreen','hud','controls','dialogue','toast','bossHud','actLabel','levelLabel','hearts','cream','rescued','goalPill','bossName','bossBar','storyKicker','storyTitle','storyText','storyQuote','pageNumber','levelKicker','levelTitle','levelDescription','levelMission','portraitCanvas','brandPortrait','titleLineup','hudPretzel','giftPretzel'].map(id=>[id,document.querySelector('#'+id)]));
document.querySelector('#giftLink').href = GIFT_LINK;
const ASSET_ROOT='/cath/assets/pixel/';
const images={};
const ASSET_FILES={sprites:'sprites-prathek-v1.png',tiles:'tiles.png',gates:'gates-prathek-v1.png',commons:'background-commons-v3.png',factory:'background-sprinkleworks-v3.png',castle:'background-gauntlet-v3.png',story1:'story-1-happy.png',story2:'story-2-prathek-v1.png',story3:'story-3-prathek-v1.png',story4:'story-4-v2.png',story5:'story-5-prathek-v1.png',victory:'story-6-prathek-v1.png',castLineup:'cast-lineup-prathek-v1.png',catPortrait:'portrait-cat-v1.png',prathekPortrait:'portrait-prathek-v1.png',pretzelPortrait:'portrait-pretzel-v1.png'};

const STORY = [
  {image:'story1',kicker:'Twistwick • one peaceful morning',title:'A perfectly twisted birthday',text:'Twistwick’s Pretzel People prepare a surprise celebration for their favorite bagel hero. Nothing is on fire yet.',pan:[-5,1],beats:[
    ['Mayor Twistopher','Citizens! Today’s celebration must be perfect.'],
    ['Little Loop','The birthday banner is upside down.'],
    ['Mayor Twistopher','Then it is perfectly upside down.'],
    ['Pretzel Citizen','Is that trumpet fanfare part of the entertainment?'],
    ['Mayor Twistopher','No. Ours is much less aggressive.',true]
  ]},
  {image:'story2',kicker:'Unfortunately • it becomes dangerous',title:'An emperor without an invitation',text:'Emperor Prathek Donutwell crashes his frosting-powered chariot into the fountain, arriving with exactly the amount of ceremony nobody requested.',pan:[0,0],beats:[
    ['Mayor Twistopher','Prathek, this celebration is for Catherine.'],
    ['Emperor Prathek Donutwell','Yes, I noticed the shocking lack of statues of me.'],
    ['Mayor Twistopher','It’s her birthday.'],
    ['Emperor Prathek Donutwell','Then she may consider my arrival her present.',true]
  ]},
  {image:'story3',kicker:'The Great Sprinkle Raid',title:'Prathek cancels the party',text:'Emperor Prathek confiscates the Salt Crystals and birthday candles, then cages the Pretzel People for good measure.',pan:[0,0],beats:[
    ['Emperor Prathek Donutwell','Take the Salt Crystals! Capture the Pretzel People! Confiscate the birthday candles!'],
    ['Sir Sprinkles','All of them, Your Imperial Glaze?'],
    ['Emperor Prathek Donutwell','Especially the little number-shaped ones.'],
    ['Mayor Twistopher','That feels oddly specific.'],
    ['Emperor Prathek Donutwell','Of course. No candles, no wish. I have thought this through.',true]
  ]},
  {image:'story4',kicker:'Meanwhile • at Cat’s cottage',title:'The extremely dramatic knock',text:'Three escapees find Cat Crumbwell, the curly-haired birthday girl herself, enjoying one final quiet minute.',pan:[0,0],beats:[
    ['Cat Crumbwell','If this is about the noise complaint, my toaster has legal representation.'],
    ['Auntie Saltina','Cat, we need you, dummy. Emperor Prathek captured the town!'],
    ['Cat Crumbwell','Strong opening. What happened?'],
    ['Little Loop','We tried messaging first, but you’re a little spotty at replying.'],
    ['Cat Crumbwell','I reply eventually.'],
    ['Little Loop','You sent “noted” two days later.'],
    ['Cat Crumbwell','See? Consistent.'],
    ['Little Loop','He also destroyed your birthday decorations.'],
    ['Cat Crumbwell','That sounds personal.',true]
  ]},
  {image:'story5',kicker:'One heroic sigh later',title:'The hero sets out',text:'Catherine equips her helmet, cape, shield, and Cream Cheese Sling, then faces Emperor Prathek’s distant fortress.',pan:[0,0],beats:[
    ['Auntie Saltina','Twistwick needs a hero.'],
    ['Cat Crumbwell','Twistwick needs better security.'],
    ['Little Loop','For the record, we did ask nicely in the group chat.'],
    ['Cat Crumbwell','I was going to reply.'],
    ['Little Loop','Eventually.'],
    ['Cat Crumbwell','Fine. I’ll save the town, the pretzels, and my birthday.',true],
    ['Emperor Prathek Donutwell','I OBJECT TO THAT ORDER!',true]
  ]}
];

const LEVELS = [
  {act:'ACT I',name:'Crumbly Commons',desc:'A journey through toast country, where several overconfident donut patrols guard the road.',mission:'Rescue Mayor Twistopher • Reach the bakery gate',width:2200,start:{x:90,y:360},exit:2080,theme:'meadow',
    platforms:[[0,460,2200,90]],
    hazards:[], cages:[[1250,385,'Mayor Twistopher']], checkpoints:[1100], enemies:[[650,400,'scout'],[1050,400,'archer'],[1720,400,'roller']], switches:[], boss:null},
  {act:'ACT II',name:'Sprinkleworks',desc:'The Donut Legion’s noisy factory, powered by brass gears, hot frosting, and questionable decisions.',mission:'Rescue two pretzels • Defeat Sir Sprinkles',width:2500,start:{x:80,y:360},exit:2390,theme:'factory',
    platforms:[[0,460,2500,90]],
    hazards:[], cages:[[1000,385,'Knottingham'],[1650,385,'Auntie Saltina']],checkpoints:[1260],enemies:[[700,400,'scout'],[1280,400,'archer'],[1840,400,'roller']],switches:[],boss:{x:2160,y:378,kind:'sprinkles',hp:4}},
  {act:'ACT III',name:'The Glazed Gauntlet',desc:'Emperor Prathek’s theatrical fortress, ending in a royal showdown with one extremely dramatic donut.',mission:'Rescue the final two pretzels • Defeat Emperor Prathek',width:2850,start:{x:70,y:360},exit:2740,theme:'castle',
    platforms:[[0,460,2850,90]],
    hazards:[],cages:[[1100,385,'Baker Braidley'],[1780,385,'Little Loop']],checkpoints:[1380,1980],enemies:[[720,400,'scout'],[1400,400,'archer'],[1940,400,'roller']],switches:[],boss:{x:2380,y:350,kind:'prathek',hp:6}}
];

let scene='loading', storyIndex=0, storyBeat=0, levelIndex=0, level=null, last=0, camera=0, totalRescued=0, muted=false, audio=null, toastTimer=0, dialogueQueue=[], dialogueDone=null, tutorialShown=false;
let platforms=[], hazards=[], cages=[], enemies=[], projectiles=[], particles=[], switches=[], checkpoint={x:90,y:360};
const input={left:false,right:false,jump:false,shoot:false,jumpPress:false,shootPress:false};
const hero={x:90,y:350,w:44,h:62,vx:0,vy:0,dir:1,onGround:false,coyote:0,jumpBuffer:0,hearts:3,cream:8,creamClock:0,shootCd:0,invuln:0,animation:'idle',frame:0,frameClock:0};

function hideOverlays(){['titleScreen','storyScreen','levelScreen','tutorialScreen','victoryScreen','endingScreen'].forEach(k=>ui[k].classList.add('hidden'));}
function show(el){el?.classList.remove('hidden')} function hide(el){el?.classList.add('hidden')}
if(MUSIC_FILE){backgroundMusic.src=MUSIC_FILE;backgroundMusic.volume=.28}
function unlockAudio(){
  try{
    audio ||= new (window.AudioContext||window.webkitAudioContext)();
    if(audio.state==='suspended')audio.resume();
    if(MUSIC_FILE&&!muted&&backgroundMusic.paused)backgroundMusic.play().catch(()=>{});
  }catch{}
}
function tone(freq=440,d=.08,type='sine'){if(muted)return;try{audio ||= new (window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.055,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+d)}catch{}}
function say(text,time=1800){ui.toast.textContent=text;ui.toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>ui.toast.classList.remove('show'),time)}
function updateHud(){[...ui.hearts.children].forEach((pip,i)=>pip.classList.toggle('empty',i>=hero.hearts));ui.cream.textContent=Math.floor(hero.cream);ui.rescued.textContent=totalRescued+'/5';if(!level)return;const boss=enemies.find(e=>!e.dead&&(e.kind==='sprinkles'||e.kind==='prathek'));ui.goalPill.textContent=!cages.every(c=>c.saved)?'FIND THE PRETZELS →':boss?'DEFEAT THE BOSS →':'REACH THE GATE →'}
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
function beginLevel(){if(levelIndex===0&&!tutorialShown){tutorialShown=true;scene='tutorial';hideOverlays();hide(ui.hud);hide(ui.controls);show(ui.tutorialScreen);drawBackdrop();return}loadLevel(levelIndex)}
function startTutorialLevel(){if(scene!=='tutorial')return;loadLevel(0)}
function loadLevel(i){levelIndex=i;level=LEVELS[i];scene='play';hideOverlays();show(ui.hud);show(ui.controls);hide(ui.bossHud);platforms=level.platforms.map(a=>({x:a[0],y:a[1],w:a[2],h:a[3],active:true}));hazards=level.hazards.map(a=>({x:a[0],y:a[1],w:a[2],h:a[3]}));cages=level.cages.map((a,n)=>({x:a[0],y:a[1],w:58,h:72,name:a[2],hp:1,saved:false,id:n,followX:a[0]+29,followY:a[1]+42,followDir:1,followFrame:0,followClock:n*.08,rescueClock:0,celebrateClock:0}));switches=[];enemies=level.enemies.map((a,n)=>makeEnemy(a[0],a[1],a[2],n));if(level.boss)enemies.push(makeBoss(level.boss));projectiles=[];particles=[];checkpoint={...level.start};Object.assign(hero,{x:level.start.x,y:level.start.y,vx:0,vy:0,hearts:3,cream:8,invuln:0});camera=0;updateHud();queueDialogue(levelDialogue(i));}
function levelDialogue(i){return i===0?[["Cat Crumbwell",null,"Toast hills, armed donuts. Nice quiet morning."],["Auntie Saltina",null,"Find the cages! One schmear hit will break each lock."],["Cat Crumbwell",null,"Walk and shoot. Finally, instructions I respect."]]:i===1?[["Cat Crumbwell",null,"A factory powered by sprinkles. Somehow not the strangest Tuesday I’ve had."],["Auntie Saltina",null,"Sir Sprinkles guards the far gate. He rehearses his entrances."],["Cat Crumbwell",null,"I’ll try to look surprised."]]:[["Little Loop",null,"That is definitely Prathek’s fortress."],["Cat Crumbwell",null,"The upside-down birthday banner gave it away."],["Little Loop",null,"Some villains leave clues. He leaves decorating mistakes."],["Cat Crumbwell",null,"Let’s go correct both."]]}
function makeEnemy(x,y,kind,n){return{x,y,w:kind==='roller'?54:50,h:kind==='roller'?54:58,kind,hp:kind==='roller'?2:1,maxHp:kind==='roller'?2:1,baseX:x,dir:n%2?1:-1,speed:kind==='roller'?48:30,cool:1.4+n*.2,dead:false,flash:0,animation:'walk',frame:0,frameClock:n*.07}}
function makeBoss(b){return{x:b.x,y:b.y,w:b.kind==='prathek'?105:76,h:b.kind==='prathek'?105:82,kind:b.kind,hp:b.hp,maxHp:b.hp,baseX:b.x,dir:-1,speed:b.kind==='prathek'?75:48,cool:1.4,dead:false,flash:0,phase:1,state:'idle',stateClock:0,animation:'walk',frame:0,frameClock:0,introShown:false}}
function queueDialogue(lines,done=null){dialogueQueue=[...lines];dialogueDone=done;scene='dialogue';show(ui.dialogue);advanceDialogue()}
function advanceDialogue(){if(!dialogueQueue.length){hide(ui.dialogue);scene='play';const done=dialogueDone;dialogueDone=null;if(done)done();return}const [name,,text]=dialogueQueue.shift();document.querySelector('#speaker').textContent=name;drawPortrait(name);document.querySelector('#dialogueText').textContent=text;tone(360,.04,'triangle')}

function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function gateIsOpen(){return cages.every(c=>c.saved)&&!enemies.some(e=>!e.dead&&(e.kind==='sprinkles'||e.kind==='prathek'))}
function animate(entity,state,count,speed,dt){if(entity.animation!==state){entity.animation=state;entity.frame=0;entity.frameClock=0}entity.frameClock+=dt;if(entity.frameClock>=speed){entity.frameClock-=speed;entity.frame=(entity.frame+1)%count}}
function solidCollision(prevY){hero.onGround=false;for(const p of platforms){if(!p.active)continue;if(hero.x+hero.w>p.x&&hero.x<p.x+p.w&&hero.y+hero.h>=p.y&&prevY+hero.h<=p.y+8&&hero.vy>=0){hero.y=p.y-hero.h;hero.vy=0;hero.onGround=true}}}
function updateHero(dt){hero.shootCd=Math.max(0,hero.shootCd-dt);hero.invuln=Math.max(0,hero.invuln-dt);hero.creamClock+=dt;if(hero.cream<8&&hero.creamClock>1.35){hero.cream=Math.min(8,hero.cream+1);hero.creamClock=0;updateHud()}
  if(input.jumpPress)hero.jumpBuffer=.13;else hero.jumpBuffer=Math.max(0,hero.jumpBuffer-dt);hero.coyote=hero.onGround?.11:Math.max(0,hero.coyote-dt);
  const move=(input.right?1:0)-(input.left?1:0);if(move)hero.dir=move;
  hero.vx+=move*1500*dt;hero.vx*=Math.pow(move?.07:.0004,dt);hero.vx=Math.max(-285,Math.min(285,hero.vx));hero.vy+=1200*dt;hero.vy=Math.min(hero.vy,700);
  if(hero.jumpBuffer>0&&hero.coyote>0){hero.vy=-500;hero.jumpBuffer=0;hero.coyote=0;burst(hero.x+22,hero.y+62,'#fff0c9',7);tone(460,.08,'square')}
  if(!input.jump&&hero.vy< -190)hero.vy=-190;const prevY=hero.y;hero.x+=hero.vx*dt;hero.y+=hero.vy*dt;hero.x=Math.max(0,Math.min(level.width-hero.w,hero.x));solidCollision(prevY);
  if(input.shootPress)shoot();for(const h of hazards)if(overlap(hero,h))hurtHero();if(hero.y>H+170)respawn();for(const e of enemies)if(!e.dead&&overlap(hero,e))hurtHero(e.x);
  for(const cp of level.checkpoints)if(hero.x>cp&&checkpoint.x<cp){checkpoint={x:cp,y:340};say('Checkpoint: heroic resolve restored!');tone(720,.1)}
  const state=hero.invuln>0?'hurt':hero.shootCd>.12?'shoot':!hero.onGround?'jump':Math.abs(hero.vx)>24?'run':'idle';
  animate(hero,state,{idle:4,run:6,jump:2,shoot:4,hurt:2}[state],state==='run'?.075:.12,dt);
  if(hero.x>level.exit&&cages.every(c=>c.saved)&&!enemies.some(e=>!e.dead&&(e.kind==='sprinkles'||e.kind==='prathek')))finishLevel();else if(hero.x>level.exit-80&&!cages.every(c=>c.saved))say('The gate needs every Salt Crystal!')
}
function updateFollowers(dt){
  const followers=cages.filter(c=>c.saved),boss=enemies.find(e=>!e.dead&&(e.kind==='sprinkles'||e.kind==='prathek'));
  const danger=hero.invuln>0||Boolean(boss&&Math.abs(hero.x-boss.x)<560),atGate=gateIsOpen()&&Math.abs(hero.x-level.exit)<240;
  followers.forEach((c,i)=>{
    c.rescueClock=Math.max(0,c.rescueClock-dt);c.celebrateClock=Math.max(0,c.celebrateClock-dt);
    const targetX=atGate?level.exit-55-i*42:hero.x+hero.w/2-hero.dir*(62+i*45);
    const targetY=432+(i%2)*3;let dx=targetX-c.followX,dy=targetY-c.followY;
    if(Math.abs(dx)>520){c.followX=hero.x-hero.dir*(70+i*42);c.followY=targetY;dx=targetX-c.followX;dy=0}
    const ease=1-Math.exp(-dt*(danger?5:7));
    c.followX+=dx*ease;c.followY+=dy*ease;
    if(Math.abs(dx)>2)c.followDir=dx<0?-1:1;
    c.followClock+=dt;
    if(c.followClock>.12){c.followClock-=.12;c.followFrame=(c.followFrame+1)%4}
    c.emotion=danger?'worried':atGate||c.rescueClock>0||c.celebrateClock>0?'cheer':'follow';
  });
}
function shoot(){if(hero.shootCd>0||hero.cream<1)return say('Out of schmear — give it a second!');hero.shootCd=.28;hero.cream--;hero.creamClock=0;projectiles.push({x:hero.x+22+hero.dir*25,y:hero.y+25,w:18,h:14,vx:hero.dir*570,vy:-15,owner:'hero',life:1.6,kind:'cream'});updateHud();tone(290,.06,'triangle')}
function hurtHero(from=hero.x){if(hero.invuln>0)return;hero.hearts--;hero.invuln=1.35;hero.vx=hero.x<from?-260:260;hero.vy=-260;shake();tone(110,.16,'sawtooth');updateHud();if(hero.hearts<=0)setTimeout(respawn,350)}
function respawn(){hero.hearts=3;hero.x=checkpoint.x;hero.y=checkpoint.y;hero.vx=hero.vy=0;hero.invuln=1.2;updateHud();say('Cat returns with renewed determination.')}
function shake(){const card=document.querySelector('.game-card');card.classList.remove('shake');void card.offsetWidth;card.classList.add('shake')}
function burst(x,y,color,count=8){for(let i=0;i<count;i++)particles.push({x,y,vx:(Math.random()-.5)*230,vy:-60-Math.random()*180,life:.5+Math.random()*.4,color,r:3+Math.random()*4})}

function updateEnemies(dt){for(const e of enemies){if(e.dead)continue;e.flash=Math.max(0,e.flash-dt);e.cool-=dt;e.stateClock=(e.stateClock||0)-dt;
    animate(e,'walk',4,.14,dt);
    if(e.kind==='prathek'){updatePrathek(e,dt);continue}
    e.x+=e.dir*e.speed*dt;if(Math.abs(e.x-e.baseX)>(e.kind==='sprinkles'?180:e.kind==='archer'?55:85))e.dir*=-1;
  }enemies=enemies.filter(e=>!e.dead)}
function updatePrathek(e,dt){if(e.phase===1){e.x=e.baseX+Math.sin(performance.now()/800)*75;if(e.cool<=0){prathekShot(e);e.cool=1.75}}else{e.state='roll';e.x+=e.dir*125*dt;if(e.x<e.baseX-230||e.x>e.baseX+230)e.dir*=-1}}
function prathekShot(e){const dx=hero.x-e.x,dy=hero.y-e.y,d=Math.hypot(dx,dy)||1;projectiles.push({x:e.x+e.w/2,y:e.y+25,w:24,h:24,vx:dx/d*205,vy:dy/d*205,owner:'enemy',life:4,kind:'orb'});tone(140,.07,'square')}
function updateProjectiles(dt){for(const p of projectiles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.kind==='cream')p.vy+=80*dt;
    if(p.owner==='enemy'&&overlap(p,hero)){p.life=0;hurtHero(p.x)}
    for(const c of cages)if(!c.saved&&overlap(p,c)&&p.owner==='hero'){p.life=0;c.hp--;burst(p.x,p.y,'#f3c84f',8);if(c.hp<=0)rescue(c)}
    for(const e of enemies)if(!e.dead&&overlap(p,e)&&p.owner==='hero'){p.life=0;hitEnemy(e,p)}
  }projectiles=projectiles.filter(p=>p.life>0&&p.x>-100&&p.x<level.width+100&&p.y<700)}
function hitEnemy(e,p){if(e.kind==='prathek'){e.hp--;e.flash=.18;burst(p.x,p.y,'#f0a2c0',14);shake();tone(170,.08,'square');if(e.phase===1&&e.hp===3){e.phase=2;e.state='roll';queueDialogue([["Emperor Prathek Donutwell",null,"Impossible! Initiate rolling majestically!"],["Cat Crumbwell",null,"That’s just rolling."],["Emperor Prathek Donutwell",null,"Majestically!"]]);return}if(e.hp<=0)defeatBoss(e);updateHud();return}
  e.hp--;e.flash=.15;burst(p.x,p.y,'#fff0c8',8);if(e.hp<=0){e.dead=true;updateHud();tone(160,.12,'sawtooth');if(e.kind==='sprinkles'){cages.filter(c=>c.saved).forEach(c=>{c.celebrateClock=3;c.emotion='cheer'});queueDialogue([["Sir Sprinkles",null,"I have been… lightly spread."],["Cat Crumbwell",null,"You fought bravely."],["Sir Sprinkles",null,"Truly?"],["Cat Crumbwell",null,"No. But you looked like you needed that."]]);}}}
function defeatBoss(e){e.dead=true;hide(ui.bossHud);cages.filter(c=>c.saved).forEach(c=>{c.celebrateClock=3;c.emotion='cheer'});updateHud();for(let i=0;i<70;i++)burst(e.x+e.w/2,e.y+e.h/2,['#f4bb4f','#e75f7b','#8b72bd'][i%3],1);queueDialogue([["Emperor Prathek Donutwell",null,"Enjoy your victory, Catherine. I shall return!"],["Cat Crumbwell",null,"Take your time. Sudden movements are dangerous at your age."],["Emperor Prathek Donutwell",null,"I am not old!"],["Cat Crumbwell",null,"Your knees made the boss music when you stood up."],["Little Loop",null,"Should we fetch the royal heating pad?"]]);tone(90,.4,'sawtooth')}
function rescueDialogue(name){return name==='Mayor Twistopher'?[["Mayor Twistopher",null,"Cat! You came!"],["Cat Crumbwell",null,"Apparently I’m very predictable."],["Mayor Twistopher",null,"Emperor Prathek took the others to the Sprinkleworks."]]:name==='Knottingham'?[["Knottingham",null,"Freedom! I was running out of cage-related conversation."],["Cat Crumbwell",null,"Go rehearse something less specific."]]:name==='Auntie Saltina'?[["Auntie Saltina",null,"The Cream Cheese Sling suits you."],["Cat Crumbwell",null,"It clashes with the helmet, but I’ll survive."]]:name==='Baker Braidley'?[["Baker Braidley",null,"The throne room is ahead. Also, he still hasn’t fixed the banner."],["Cat Crumbwell",null,"Some crimes cannot be forgiven."]]:[["Little Loop",null,"You actually came."],["Cat Crumbwell",null,"You seem surprised."],["Little Loop",null,"Your reply record made this a fifty-fifty."],["Cat Crumbwell",null,"And yet here I am."]]}
function rescue(c){c.saved=true;c.rescueClock=2;c.emotion='cheer';c.followX=c.x+29;c.followY=c.y+42;totalRescued++;burst(c.x+29,c.y+35,'#f6cf55',22);tone(820,.15,'triangle');setTimeout(()=>tone(1040,.18,'triangle'),100);say(c.name+' rescued!');updateHud();queueDialogue(rescueDialogue(c.name))}
function finishLevel(){if(scene!=='play')return;if(levelIndex<LEVELS.length-1){scene='transition';document.querySelector('.game-card').classList.add('flash');setTimeout(()=>{document.querySelector('.game-card').classList.remove('flash');showLevelIntro(levelIndex+1)},400)}else showVictory()}
function showVictory(){scene='victory';hide(ui.dialogue);hide(ui.hud);hide(ui.controls);hide(ui.bossHud);hideOverlays();ui.actLabel.textContent='FINAL CHAPTER';ui.levelLabel.textContent='Twistwick Saved';ui.victoryImage.src=images.victory.src;show(ui.victoryScreen);confetti(100);tone(523,.15);setTimeout(()=>tone(659,.15),160);setTimeout(()=>tone(784,.3),320)}
function showEnding(){scene='ending';hide(ui.dialogue);hide(ui.hud);hide(ui.controls);hide(ui.bossHud);show(ui.endingScreen);confetti(160);tone(523,.15);setTimeout(()=>tone(659,.15),160);setTimeout(()=>tone(784,.3),320)}
function confetti(n){for(let i=0;i<n;i++)particles.push({x:Math.random()*W,y:-Math.random()*H,vx:(Math.random()-.5)*150,vy:70+Math.random()*160,life:6,color:['#ef6380','#f3bc4d','#75b89a','#9575bd'][i%4],r:3+Math.random()*5,screen:true})}

function bossIntroduction(boss){boss.introShown=true;return boss.kind==='prathek'?[["Emperor Prathek Donutwell",null,"Welcome, Catherine. You have arrived just in time to witness my victory."],["Cat Crumbwell",null,"You’re standing in my birthday decorations."],["Emperor Prathek Donutwell",null,"They improve the throne room."],["Cat Crumbwell",null,"You put the banner upside down."],["Emperor Prathek Donutwell",null,"It is displayed imperially."]]:[["Sir Sprinkles",null,"Halt! By royal order, you are officially surrounded!"],["Cat Crumbwell",null,"There’s nobody behind me."],["Sir Sprinkles",null,"Unofficially surrounded."]]}
function update(dt){if(scene==='play'){updateHero(dt);updateEnemies(dt);updateFollowers(dt);updateProjectiles(dt);if(scene==='play'){const boss=enemies.find(e=>e.kind==='prathek'||e.kind==='sprinkles');if(boss&&Math.abs(hero.x-boss.x)<620){show(ui.bossHud);ui.bossName.textContent=boss.kind==='prathek'?'EMPEROR PRATHEK':'SIR SPRINKLES';ui.bossBar.style.width=Math.max(0,boss.hp/boss.maxHp*100)+'%';if(!boss.introShown)queueDialogue(bossIntroduction(boss))}else hide(ui.bossHud);camera+=(Math.max(0,Math.min(level.width-W,hero.x-W*.38))-camera)*Math.min(1,dt*5)}}for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.screen?80:380)*dt;p.life-=dt}particles=particles.filter(p=>p.life>0);input.jumpPress=input.shootPress=false}

function snap(v){return Math.round(v)}
function drawSprite(key,x,y,w,h,flip=false,alpha=1,target=ctx){const box=SPRITE_FRAMES[key];if(!box||!images.sprites)return;target.save();target.imageSmoothingEnabled=false;target.globalAlpha=alpha;if(flip){target.translate(snap(x+w),snap(y));target.scale(-1,1);target.drawImage(images.sprites,...box,0,0,snap(w),snap(h))}else target.drawImage(images.sprites,...box,snap(x),snap(y),snap(w),snap(h));target.restore()}
function drawPortrait(name,canvas=ui.portraitCanvas){const detailed=name.includes('Prathek')?images.prathekPortrait:name.includes('Cat')?images.catPortrait:images.pretzelPortrait;if(detailed)return drawUiImage(canvas,detailed,.94);const p=canvas.getContext('2d');p.clearRect(0,0,48,48);p.imageSmoothingEnabled=false;const key=name.includes('Sprinkles')?'sprinkles.walk.0':'pretzel.happy.0',box=SPRITE_FRAMES[key],size=key.startsWith('pretzel')?38:44;p.drawImage(images.sprites,...box,(48-size)/2,(48-size)/2,size,size)}
function drawUiImage(canvas,image,scale=.9){if(!canvas||!image)return;const p=canvas.getContext('2d'),w=canvas.width,h=canvas.height,s=Math.min(w/image.width,h/image.height)*scale,dw=Math.floor(image.width*s),dh=Math.floor(image.height*s);p.clearRect(0,0,w,h);p.imageSmoothingEnabled=false;p.drawImage(image,Math.floor((w-dw)/2),Math.floor((h-dh)/2),dw,dh)}
function drawChromeSprites(){ui.titleLineup.src=images.castLineup.src;drawUiImage(ui.brandPortrait,images.catPortrait,1.06);drawUiImage(ui.hudPretzel,images.pretzelPortrait,1);drawUiImage(ui.giftPretzel,images.pretzelPortrait,.92)}
function drawBackdrop(){if(images.story5){ctx.drawImage(images.story5,0,0,W,H);ctx.fillStyle='#251a3277';ctx.fillRect(0,0,W,H)}else{ctx.fillStyle='#251a32';ctx.fillRect(0,0,W,H);for(let y=0;y<H;y+=24)for(let x=(y/24%2)*12;x<W;x+=24){ctx.fillStyle='#382646';ctx.fillRect(x,y,12,12)}}}
function drawWorld(){const theme=level?.theme||'meadow',plate=theme==='factory'?images.factory:theme==='castle'?images.castle:images.commons,pan=Math.min(150,Math.max(0,camera*.105));ctx.drawImage(plate,-pan,0,W+150,H);ctx.fillStyle=theme==='castle'?'#21152b18':theme==='factory'?'#521f4012':'#fff0c208';ctx.fillRect(0,0,W,H);
  for(const p of platforms)drawPlatform(p,theme);for(const h of hazards)drawHazard(h);for(const c of cages)drawCage(c);drawExit();for(const c of cages)if(c.saved)drawFollower(c);for(const e of enemies)drawEnemy(e);for(const p of projectiles)drawProjectile(p);if(hero.invuln<=0||Math.floor(performance.now()/80)%2)drawHero();for(const p of particles)drawParticle(p)}
function drawPlatform(p,theme){let x=snap(p.x-camera);if(x>W+50||x+p.w<-50)return;const sx=theme==='factory'?16:theme==='castle'?32:0;for(let tx=0;tx<p.w;tx+=48)for(let ty=0;ty<p.h;ty+=48)ctx.drawImage(images.tiles,sx,0,16,16,x+tx,p.y+ty,Math.min(48,p.w-tx),Math.min(48,p.h-ty))}
function drawHazard(h){let x=snap(h.x-camera);for(let tx=0;tx<h.w;tx+=48)ctx.drawImage(images.tiles,48,0,16,16,x+tx,h.y,Math.min(48,h.w-tx),h.h)}
function drawExit(){const x=snap(level.exit-camera),open=gateIsOpen(),themeIndex={meadow:0,factory:1,castle:2}[level.theme]||0,sx=themeIndex*192+(open?96:0);ctx.drawImage(images.gates,sx,0,96,128,x-12,332,96,128);ctx.fillStyle='#251a32';ctx.font='700 14px "Silkscreen"';ctx.textAlign='center';ctx.fillText(open?'EXIT >':'LOCKED',x+36,325)}
function drawCage(c){const x=snap(c.x-camera);if(c.saved){ctx.fillStyle='#251a32';ctx.fillRect(x,c.y+64,c.w,8);ctx.fillStyle='#d7a546';ctx.fillRect(x+2,c.y+66,c.w-4,3);for(let i=0;i<3;i++){ctx.save();ctx.translate(x+8+i*18,c.y+62);ctx.rotate((i-1)*.28);ctx.fillStyle='#b8bbc0';ctx.fillRect(0,-24,4,27);ctx.fillStyle='#251a32';ctx.fillRect(-2,-26,8,4);ctx.restore()}return}ctx.fillStyle='#251a32';ctx.fillRect(x,c.y,c.w,8);ctx.fillRect(x,c.y+64,c.w,8);ctx.fillStyle='#d7a546';ctx.fillRect(x+2,c.y+3,c.w-4,3);ctx.fillRect(x+2,c.y+66,c.w-4,3);for(let i=5;i<c.w;i+=13){ctx.fillStyle='#251a32';ctx.fillRect(x+i,c.y,7,72);ctx.fillStyle='#b8bbc0';ctx.fillRect(x+i+2,c.y+4,3,62)}drawPretzel(x+29,c.y+42,false,c.id)}
function drawPretzel(x,y,happy,id=0){const f=Math.floor(performance.now()/180+id)%4;drawSprite(`pretzel.${happy?'happy':'worried'}.${f}`,x-24,y-24,48,48)}
function followerKey(name){return name==='Mayor Twistopher'?'mayor':name==='Knottingham'?'knottingham':name==='Auntie Saltina'?'saltina':name==='Baker Braidley'?'braidley':'little'}
function drawFollower(c){const x=c.followX-camera,y=c.followY,key=`pretzel.${followerKey(c.name)}.${c.emotion||'follow'}.${c.followFrame}`;if(x<-70||x>W+70)return;spriteShadow(x,y+21,32);drawSprite(key,x-24,y-24,48,48,c.followDir<0)}
function spriteShadow(x,y,w){ctx.fillStyle='#21152b88';ctx.fillRect(snap(x-w/2),snap(y),snap(w),5);ctx.fillStyle='#100b1866';ctx.fillRect(snap(x-w*.3),snap(y+5),snap(w*.6),3)}
function drawHero(){const x=hero.x-camera;spriteShadow(x+hero.w/2,hero.y+hero.h-1,42);drawSprite(`cat.${hero.animation}.${hero.frame}`,x-10,hero.y-2,64,64,hero.dir<0)}
function drawEnemy(e){let x=e.x-camera;if(x>W+140||x<-140)return;const key=`${e.kind}.walk.${e.frame%4}`,boss=e.kind==='prathek',size=boss?96:64;spriteShadow(x+e.w/2,e.y+e.h-1,boss?68:42);drawSprite(key,x+(e.w-size)/2,e.y+(e.h-size),size,size,e.dir<0,e.flash?0.45:1)}
function drawProjectile(p){let x=snap(p.x-camera),y=snap(p.y);ctx.fillStyle='#251a32';ctx.fillRect(x-10,y-7,p.kind==='orb'?22:18,p.kind==='orb'?22:16);ctx.fillStyle=p.kind==='cream'?'#fff0c2':p.kind==='orb'?'#ef7598':'#f0c04c';ctx.fillRect(x-6,y-4,p.kind==='orb'?14:12,p.kind==='orb'?14:10);ctx.fillStyle='#fff8dc';ctx.fillRect(x-3,y-3,4,4)}
function drawParticle(p){ctx.fillStyle=p.color;ctx.fillRect(snap(p.screen?p.x:p.x-camera),snap(p.y),Math.max(3,snap(p.r)),Math.max(3,snap(p.r*(p.screen?1.8:1))))}
function draw(){ctx.imageSmoothingEnabled=false;if(scene==='loading'||scene==='title'||scene==='story'||scene==='levelIntro'||scene==='tutorial'||scene==='victory')drawBackdrop();else drawWorld()}
function frame(t){const dt=Math.min(.034,(t-last)/1000||0);last=t;update(dt);draw();requestAnimationFrame(frame)}

function pressKey(k,down){if(down&&!input[k])input[k+'Press']=true;input[k]=down}
document.querySelector('#startButton').addEventListener('click',()=>{unlockAudio();tone(520,.08);storyStart()});document.querySelector('#continueButton').addEventListener('click',()=>{unlockAudio();showLevelIntro(0)});document.querySelector('#skipStory').addEventListener('click',()=>{unlockAudio();showLevelIntro(0)});document.querySelector('#nextStory').addEventListener('click',nextStory);document.querySelector('#dialogueNext').addEventListener('click',advanceDialogue);document.querySelector('#playAgain').addEventListener('click',()=>location.reload());document.querySelector('#muteButton').addEventListener('click',e=>{unlockAudio();muted=!muted;backgroundMusic.muted=muted;e.currentTarget.classList.toggle('muted',muted);e.currentTarget.setAttribute('aria-pressed',String(muted));e.currentTarget.setAttribute('aria-label',muted?'Unmute sound':'Mute sound');if(!muted&&MUSIC_FILE)backgroundMusic.play().catch(()=>{});say(muted?'Sound muted':'Sound on')});
document.querySelector('#levelButton').addEventListener('click',beginLevel);
document.querySelector('#tutorialButton').addEventListener('click',startTutorialLevel);
document.querySelector('#victoryButton').addEventListener('click',()=>{hide(ui.victoryScreen);showEnding()});
ui.retryLoad.addEventListener('click',loadAssets);
const keyMap={ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',' ':'jump',ArrowUp:'jump',w:'jump',W:'jump',j:'shoot',J:'shoot'};addEventListener('keydown',e=>{if(scene==='tutorial'&&(e.key==='Enter'||e.key===' ')){e.preventDefault();startTutorialLevel();return}if(scene==='victory'&&(e.key==='Enter'||e.key===' ')){e.preventDefault();hide(ui.victoryScreen);showEnding();return}if(scene==='dialogue'){if(e.key==='Enter'){e.preventDefault();advanceDialogue()}else if(keyMap[e.key])e.preventDefault();return}if(scene==='story'&&(e.key==='Enter'||e.key===' ')){e.preventDefault();nextStory();return}const k=keyMap[e.key];if(k&&scene==='play'){e.preventDefault();pressKey(k,true)}});addEventListener('keyup',e=>{const k=keyMap[e.key];if(k){e.preventDefault();pressKey(k,false)}});addEventListener('blur',()=>Object.keys(input).forEach(k=>input[k]=false));

function fetchImage(file){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error(file));image.src=ASSET_ROOT+file})}
async function loadAssets(){
  scene='loading';show(ui.loadingScreen);hide(ui.titleScreen);hide(ui.retryLoad);ui.loadingStatus.textContent='WARMING THE OVENS...';
  try{
    const entries=Object.entries(ASSET_FILES);let loaded=0;
    await Promise.all(entries.map(async([key,file])=>{images[key]=await fetchImage(file);loaded++;ui.loadingStatus.textContent=`BAKING PIXELS ${loaded} / ${entries.length}`;}));
    hide(ui.loadingScreen);drawChromeSprites();show(ui.titleScreen);scene='title';drawBackdrop();
  }catch(error){
    console.error('Required pixel-art asset failed to load:',error.message);ui.loadingStatus.textContent='A SPRITE FELL OFF THE TRAY. CHECK YOUR CONNECTION AND RETRY.';show(ui.retryLoad);
  }
}

updateHud();drawBackdrop();requestAnimationFrame(frame);loadAssets();
