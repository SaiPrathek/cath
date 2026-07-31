/* Cath's Great Pretzel Rescue — no-build canvas platformer. */
const GIFT_LINK = 'https://bit.ly/cath-egft-link';
const SAVE_KEY = 'cath-save-v2';
const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const backgroundMusic = document.querySelector('#backgroundMusic');
const W = 960;
const H = 540;
const GROUND_Y = 460;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarsePointer = matchMedia('(pointer: coarse)');
const portraitPhone = matchMedia('(orientation: portrait) and (max-width: 700px)');
const compactLandscape = matchMedia('(max-height: 600px) and (orientation: landscape)');
ctx.imageSmoothingEnabled = false;

const ui = Object.fromEntries([
  'loadingScreen', 'loadingStatus', 'retryLoad', 'titleScreen', 'storyScreen',
  'storyImage', 'storyDialogue', 'storySpeaker', 'storyBeatDots',
  'storyPortraitCanvas', 'levelScreen', 'tutorialScreen', 'victoryScreen',
  'victoryImage', 'endingScreen', 'pauseScreen', 'hud', 'controls', 'controlsRight', 'dialogue',
  'dialogueReview', 'toast', 'bossHud', 'actLabel', 'levelLabel', 'hearts',
  'cream', 'rescued', 'globalRescued', 'goalPill', 'bossName', 'bossBar',
  'bossHint', 'storyKicker', 'storyTitle', 'storyText', 'storyQuote',
  'pageNumber', 'levelKicker', 'levelTitle', 'levelDescription', 'levelMission',
  'portraitCanvas', 'brandPortrait', 'titleLineup', 'hudPretzel', 'giftPretzel',
  'bark', 'barkPortraitCanvas', 'barkSpeaker', 'barkText', 'orientationGate',
  'orientationPortrait', 'pauseButton',
].map((id) => [id, document.querySelector(`#${id}`)]));

const ASSET_ROOT = new URL('assets/pixel/', document.baseURI).href;
const MUSIC_FILE = new URL('assets/Cath.m4a', document.baseURI).href;
const images = {};
const ASSET_FILES = {
  sprites: 'sprites-prathek-v1.png',
  tiles: 'tiles.png',
  props: 'gameplay-props-v1.png',
  gates: 'gates-prathek-v1.png',
  commons: 'background-commons-v3.png',
  factory: 'background-sprinkleworks-v3.png',
  castle: 'background-gauntlet-v3.png',
  story1: 'story-1-happy.png',
  story2: 'story-2.png',
  story3: 'story-3-prathek-v1.png',
  story4: 'story-4-v2.png',
  story5: 'story-5-prathek-v1.png',
  victory: 'story-6-prathek-v1.png',
  castLineup: 'cast-lineup-prathek-v1.png',
  catPortrait: 'portrait-cat-v1.png',
  prathekPortrait: 'portrait-prathek-v1.png',
  pretzelPortrait: 'portrait-pretzel-v1.png',
};
const PROP_FRAMES = {
  conveyor: [0, 0, 48, 16],
  ventOff: [48, 0, 32, 48],
  ventWarn: [80, 0, 32, 48],
  ventOn: [112, 0, 32, 48],
  switchOff: [144, 0, 32, 48],
  switchOn: [176, 0, 32, 48],
  portcullis: [208, 0, 48, 128],
  warning: [0, 48, 32, 32],
  candle2: [32, 48, 32, 48],
  candlePlus: [64, 48, 32, 48],
  candle4: [96, 48, 32, 48],
};

const STORY = [
  {
    image: 'story1',
    kicker: 'Twistwick • one peaceful morning',
    title: 'A perfectly twisted birthday',
    text: 'Twistwick prepares a surprise celebration for its favorite bagel hero. Nothing is on fire yet.',
    pan: [-5, 1],
    beats: [
      ['Little Loop', 'The red carpet is three feet too short.'],
      ['Mayor Twistopher', 'Catherine is a hero. She can jump the rest.', true],
    ],
  },
  {
    image: 'story2',
    kicker: 'Unfortunately • it becomes dangerous',
    title: 'An emperor without an invitation',
    text: 'Emperor Prathek Donutwell crashes into the fountain with exactly the amount of ceremony nobody requested.',
    pan: [0, 0],
    beats: [
      ['Mayor Twistopher', 'Prathek, this celebration is for Catherine.'],
      ['Emperor Prathek Donutwell', 'Then she may consider my arrival her present.', true],
    ],
  },
  {
    image: 'story3',
    kicker: 'The Great Sprinkle Raid',
    title: 'Prathek cancels the party',
    text: 'Prathek steals the Salt Crystals, cages the Pretzel People, and confiscates the birthday candles.',
    pan: [0, 0],
    beats: [
      ['Emperor Prathek Donutwell', 'Take the number-shaped candles! Without them, Catherine cannot do mathematics!'],
      ['Mayor Twistopher', 'She teaches math and science. Taking only the math ones will not stop her.'],
      ['Emperor Prathek Donutwell', 'Then take the science-shaped ones as well!', true],
    ],
  },
  {
    image: 'story4',
    kicker: 'Meanwhile • at Cath’s cottage',
    title: 'The extremely dramatic knock',
    text: 'Three escapees find Cath Crumbwell enjoying one final quiet minute of her birthday.',
    pan: [0, 0],
    beats: [
      ['Auntie Saltina', 'Cath, we need you, dummy. Prathek captured the town!'],
      ['Cath Crumbwell', 'Good morning to you too. Tell me everything.'],
      ['Little Loop', 'We messaged first, but you are a little spotty at replying.'],
      ['Cath Crumbwell', 'I reply eventually.', true],
    ],
  },
  {
    image: 'story5',
    kicker: 'One heroic sigh later',
    title: 'The hero sets out',
    text: 'Catherine equips her helmet, cape, shield, and Egg Sling—and reluctantly begins looking heroic.',
    pan: [0, 0],
    beats: [
      ['Auntie Saltina', 'Should we warn him?'],
      ['Cath Crumbwell', 'Yes. He will need the head start.', true],
    ],
  },
];

const LEVELS = [
  {
    id: 'commons',
    act: 'ACT I',
    name: 'Crumbly Commons',
    desc: 'A journey through toast country, where several overconfident donut patrols guard the road.',
    mission: 'Rescue Mayor Twistopher • Reach the bakery gate',
    width: 3600,
    start: {x: 90, y: 360},
    exit: 3480,
    theme: 'meadow',
    grounds: [{x: 0, y: 460, w: 3600, h: 90}],
    platforms: [
      {x: 1250, y: 428, w: 400, h: 32},
      {x: 2000, y: 428, w: 450, h: 32},
      {x: 3000, y: 428, w: 300, h: 32},
    ],
    hazards: [],
    cages: [{x: 2150, y: 353, name: 'Mayor Twistopher'}],
    checkpoints: [{x: 1900, y: 360}],
    enemies: [
      {x: 750, y: 400, kind: 'scout', patrol: 85},
      {x: 1450, y: 368, kind: 'archer', patrol: 55},
      {x: 2850, y: 400, kind: 'roller', patrol: 85},
    ],
    switches: [],
    barriers: [],
    boss: null,
    decor: [{x: 520, type: 'wheat'}, {x: 1680, type: 'banner'}, {x: 2920, type: 'wheat'}],
  },
  {
    id: 'factory',
    act: 'ACT II',
    name: 'Sprinkleworks',
    desc: 'The Donut Legion’s noisy factory, powered by brass gears, hot frosting, and questionable decisions.',
    mission: 'Rescue two pretzels • Defeat Sir Sprinkles',
    width: 5320,
    start: {x: 80, y: 360},
    exit: 5200,
    theme: 'factory',
    grounds: [{x: 0, y: 460, w: 5320, h: 90}],
    platforms: [
      {x: 1350, y: 428, w: 450, h: 32},
      {x: 2200, y: 428, w: 400, h: 32},
      {x: 3000, y: 428, w: 500, h: 32},
      {x: 3700, y: 428, w: 400, h: 32},
    ],
    hazards: [],
    cages: [
      {x: 1600, y: 353, name: 'Knottingham'},
      {x: 3200, y: 353, name: 'Auntie Saltina'},
    ],
    checkpoints: [{x: 2750, y: 360}],
    enemies: [
      {x: 800, y: 400, kind: 'scout', patrol: 85},
      {x: 2400, y: 368, kind: 'archer', patrol: 55},
      {x: 3900, y: 368, kind: 'roller', patrol: 85},
    ],
    switches: [],
    barriers: [],
    boss: {
      kind: 'sprinkles', x: 4850, y: 378, hp: 4,
      arena: {start: 4500, end: 5260},
    },
    decor: [{x: 720, type: 'pipe'}, {x: 2120, type: 'gear'}, {x: 3820, type: 'pipe'}],
  },
  {
    id: 'gauntlet',
    act: 'ACT III',
    name: 'The Glazed Gauntlet',
    desc: 'Emperor Prathek’s theatrical fortress, ending in a royal showdown with one extremely dramatic donut.',
    mission: 'Rescue the final two pretzels • Defeat Emperor Prathek',
    width: 5920,
    start: {x: 70, y: 360},
    exit: 5800,
    theme: 'castle',
    grounds: [{x: 0, y: 460, w: 5920, h: 90}],
    platforms: [
      {x: 1450, y: 428, w: 500, h: 32},
      {x: 2350, y: 428, w: 400, h: 32},
      {x: 3150, y: 428, w: 500, h: 32},
      {x: 4050, y: 428, w: 400, h: 32},
    ],
    hazards: [],
    cages: [
      {x: 1700, y: 353, name: 'Baker Braidley'},
      {x: 3400, y: 353, name: 'Little Loop'},
    ],
    checkpoints: [{x: 2150, y: 360}, {x: 3900, y: 360}],
    enemies: [
      {x: 850, y: 400, kind: 'scout', patrol: 85},
      {x: 2550, y: 368, kind: 'archer', patrol: 55},
      {x: 4250, y: 368, kind: 'roller', patrol: 85},
    ],
    switches: [],
    barriers: [],
    boss: {
      kind: 'prathek', x: 5350, y: 350, hp: 6,
      arena: {start: 5000, end: 5860},
    },
    decor: [{x: 820, type: 'chain'}, {x: 2520, type: 'banner'}, {x: 4320, type: 'chain'}],
  },
];

const BARKS = {
  level: [
    [
      ['Cath Crumbwell', 'Toast hills, armed donuts. Nice quiet morning.'],
      ['Auntie Saltina', 'Break the cage lock with one egg. The gate tracks rescues.'],
    ],
    [
      ['Cath Crumbwell', 'A factory powered by sprinkles. Somehow not the strangest Wednesday I have had.'],
      ['Auntie Saltina', 'Sir Sprinkles guards the far gate. He rehearses his entrances.'],
    ],
    [
      ['Little Loop', 'That is definitely Prathek’s fortress.'],
      ['Cath Crumbwell', 'The giant crown on the roof gave it away.'],
    ],
  ],
  rescue: {
    'Mayor Twistopher': [
      ['Mayor Twistopher', 'Cath! The others were taken to the Sprinkleworks!'],
      ['Cath Crumbwell', 'Point dramatically. I will infer the rest.'],
    ],
    Knottingham: [
      ['Knottingham', 'My escape plan worked perfectly.'],
      ['Cath Crumbwell', 'Your escape plan was me.'],
    ],
    'Auntie Saltina': [
      ['Auntie Saltina', 'The Egg Sling suits you. Try not to get smug.'],
      ['Cath Crumbwell', 'No promises.'],
    ],
    'Baker Braidley': [
      ['Baker Braidley', 'He is doing arithmetic with the stolen candles.'],
      ['Cath Crumbwell', 'Then I will correct him personally.'],
    ],
    'Little Loop': [
      ['Little Loop', 'You found me! I maintained morale at maximum volume.'],
      ['Cath Crumbwell', 'Yours, specifically.'],
    ],
  },
};

const input = {
  left: false, right: false, jump: false, shoot: false,
  jumpPress: false, shootPress: false,
};
const hero = {
  x: 80, y: 398, w: 44, h: 62, vx: 0, vy: 0, dir: 1,
  onGround: false, groundPlatform: null, coyote: 0, jumpBuffer: 0,
  hearts: 3, cream: 8, creamClock: 0, shootCd: 0, invuln: 0,
  animation: 'idle', frame: 0, frameClock: 0, landClock: 0,
  recoil: 0, respawnTimer: 0,
};

let saveData = loadSave();
let scene = 'loading';
let sceneBeforeDialogue = 'play';
let storyIndex = 0;
let storyBeat = 0;
let levelIndex = 0;
let level = null;
let levelConfig = null;
let camera = 0;
let worldTime = 0;
let last = 0;
let muted = saveData.muted;
let audio = null;
let tutorialShown = false;
let toastTimer = 0;
let freezeTime = 0;
let barkQueue = [];
let activeBark = null;
let barkClock = 0;
let dialogueLines = [];
let dialogueIndex = -1;
let dialogueDone = null;
let rescuedNames = new Set();
let checkpoint = null;
let platforms = [];
let hazards = [];
let cages = [];
let enemies = [];
let projectiles = [];
let particles = [];
let switches = [];
let barriers = [];
let pointerActions = new Map();
let wrongSwitchClock = 0;

function loadSave() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    return {
      highestUnlockedAct: Math.max(0, Math.min(2, Number(parsed.highestUnlockedAct) || 0)),
      storySeen: Boolean(parsed.storySeen),
      muted: Boolean(parsed.muted),
      completed: Boolean(parsed.completed),
    };
  } catch {
    return {highestUnlockedAct: 0, storySeen: false, muted: false, completed: false};
  }
}

function persistSave() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(saveData)); } catch {}
}

function hide(element) { element?.classList.add('hidden'); }
function show(element) { element?.classList.remove('hidden'); }
function hideOverlays() {
  [ui.titleScreen, ui.storyScreen, ui.levelScreen, ui.tutorialScreen, ui.victoryScreen, ui.endingScreen, ui.pauseScreen].forEach(hide);
}

function syncChrome() {
  const playing = scene === 'play';
  document.querySelector('.game-card')?.classList.toggle('is-playing', playing);
  const useTouch = playing && (coarsePointer.matches || compactLandscape.matches) && !portraitPhone.matches;
  ui.controls?.classList.toggle('hidden', !useTouch);
  ui.controlsRight?.classList.toggle('hidden', !useTouch);
  ui.pauseButton?.setAttribute('aria-hidden', String(!playing));
}

function setScene(next) {
  scene = next;
  syncChrome();
}

function unlockAudio() {
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
    if (!muted && backgroundMusic.paused) backgroundMusic.play().catch(() => {});
  } catch {}
}

function tone(freq = 440, duration = .08, type = 'square', volume = .045, delay = 0) {
  if (muted) return;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const start = audio.currentTime + delay;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(.001, start + duration);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
  } catch {}
}

function sfx(name) {
  if (name === 'jump') tone(460, .08, 'square');
  if (name === 'egg') tone(290, .06, 'triangle');
  if (name === 'hit') { tone(170, .07, 'square'); tone(110, .1, 'sawtooth', .025, .035); }
  if (name === 'hurt') tone(105, .16, 'sawtooth');
  if (name === 'rescue') { tone(820, .14, 'triangle'); tone(1040, .18, 'triangle', .045, .12); }
  if (name === 'checkpoint') { tone(620, .08, 'triangle'); tone(820, .11, 'triangle', .04, .08); }
  if (name === 'switch') { tone(520, .07, 'square'); tone(720, .1, 'triangle', .04, .07); }
  if (name === 'gate') { tone(260, .11, 'square'); tone(390, .15, 'triangle', .04, .12); }
  if (name === 'boss') { tone(105, .22, 'sawtooth'); tone(78, .32, 'square', .025, .16); }
  if (name === 'victory') { tone(523, .14); tone(659, .14, 'square', .045, .15); tone(784, .3, 'triangle', .04, .3); }
}

function duckMusic(ducked) {
  backgroundMusic.volume = ducked ? .1 : .28;
}

function say(text, time = 1700) {
  ui.toast.textContent = text;
  ui.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ui.toast.classList.remove('show'), time);
}

function queueBarks(lines) {
  for (const [speaker, text] of lines) barkQueue.push({speaker, text, duration: 2.45});
}

function updateBark(dt) {
  if (!activeBark && barkQueue.length && scene === 'play') {
    activeBark = barkQueue.shift();
    barkClock = activeBark.duration;
    ui.barkSpeaker.textContent = activeBark.speaker;
    ui.barkText.textContent = activeBark.text;
    drawPortrait(activeBark.speaker, ui.barkPortraitCanvas);
    show(ui.bark);
  }
  if (!activeBark) return;
  barkClock -= dt;
  if (barkClock <= 0 || scene !== 'play') {
    activeBark = null;
    hide(ui.bark);
  }
}

function clearActions() {
  for (const key of Object.keys(input)) input[key] = false;
  pointerActions.clear();
  document.querySelectorAll('.touch-button.pressed').forEach((button) => button.classList.remove('pressed'));
}

function updateTitleButtons() {
  const button = document.querySelector('#continueButton');
  if (saveData.completed) button.textContent = 'Replay the final act';
  else if (saveData.highestUnlockedAct > 0) button.textContent = `Continue at ${LEVELS[saveData.highestUnlockedAct].act}`;
  else button.textContent = saveData.storySeen ? 'Skip story & play' : 'Skip story & play';
  ui.muteButton = document.querySelector('#muteButton');
  ui.muteButton.classList.toggle('muted', muted);
  ui.muteButton.setAttribute('aria-pressed', String(muted));
  ui.muteButton.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound');
}

function showTitle() {
  setScene('title');
  hideOverlays();
  hide(ui.hud);
  hide(ui.dialogue);
  hide(ui.dialogueReview);
  hide(ui.bossHud);
  hide(ui.bark);
  clearActions();
  ui.actLabel.textContent = 'THE STORY BEGINS';
  ui.levelLabel.textContent = 'Twistwick';
  updateTitleButtons();
  show(ui.titleScreen);
}

function storyStart() {
  setScene('story');
  storyIndex = 0;
  storyBeat = 0;
  hideOverlays();
  show(ui.storyScreen);
  renderStory(true);
}

function renderStory(newScene = false) {
  const story = STORY[storyIndex];
  const beat = story.beats[storyBeat];
  if (newScene) {
    ui.storyImage.src = images[story.image].src;
    ui.storyImage.alt = `${story.title} pixel-art scene`;
    ui.storyKicker.textContent = story.kicker;
    ui.storyTitle.textContent = story.title;
    ui.storyText.textContent = story.text;
    ui.storyScreen.style.setProperty('--scene-pan-x', `${story.pan[0]}px`);
    ui.storyScreen.style.setProperty('--scene-pan-y', `${story.pan[1]}px`);
    ui.storyScreen.classList.remove('scene-enter');
    void ui.storyScreen.offsetWidth;
    ui.storyScreen.classList.add('scene-enter');
  }
  ui.storySpeaker.textContent = beat[0];
  ui.storyQuote.textContent = beat[1];
  drawPortrait(beat[0], ui.storyPortraitCanvas);
  ui.pageNumber.textContent = `SCENE ${storyIndex + 1} / ${STORY.length}`;
  ui.storyBeatDots.innerHTML = story.beats.map((_, index) => `<i class="${index <= storyBeat ? 'done' : ''}"></i>`).join('');
  ui.storyDialogue.classList.remove('speaking');
  void ui.storyDialogue.offsetWidth;
  ui.storyDialogue.classList.add('speaking');
  ui.storyScreen.classList.toggle('story-react', Boolean(beat[2]));
  const lastBeat = storyBeat === story.beats.length - 1;
  const lastScene = storyIndex === STORY.length - 1;
  document.querySelector('#nextStory').innerHTML = lastBeat
    ? (lastScene ? 'Begin the quest <b>→</b>' : 'Turn the page <b>→</b>')
    : 'Continue <b>→</b>';
}

function nextStory() {
  tone(620, .06, 'triangle');
  const story = STORY[storyIndex];
  if (storyBeat < story.beats.length - 1) {
    storyBeat += 1;
    renderStory();
    return;
  }
  if (storyIndex === STORY.length - 1) {
    saveData.storySeen = true;
    persistSave();
    showLevelIntro(0);
    return;
  }
  storyIndex += 1;
  storyBeat = 0;
  renderStory(true);
}

function previousStory() {
  if (storyBeat > 0) storyBeat -= 1;
  else if (storyIndex > 0) {
    storyIndex -= 1;
    storyBeat = STORY[storyIndex].beats.length - 1;
  } else {
    showTitle();
    return;
  }
  renderStory(true);
}

function returnToStory() {
  setScene('story');
  hideOverlays();
  hide(ui.hud);
  hide(ui.dialogue);
  hide(ui.dialogueReview);
  ui.actLabel.textContent = 'THE STORY BEGINS';
  ui.levelLabel.textContent = 'Twistwick';
  show(ui.storyScreen);
  renderStory(true);
}

function showLevelIntro(index) {
  levelIndex = index;
  const config = LEVELS[index];
  setScene('levelIntro');
  hideOverlays();
  hide(ui.hud);
  hide(ui.bossHud);
  hide(ui.dialogue);
  hide(ui.dialogueReview);
  hide(ui.bark);
  ui.levelKicker.textContent = config.act;
  ui.levelTitle.textContent = config.name;
  ui.levelDescription.textContent = config.desc;
  ui.levelMission.textContent = config.mission;
  ui.actLabel.textContent = config.act;
  ui.levelLabel.textContent = config.name;
  document.querySelector('#levelBack').classList.toggle('hidden', index !== 0);
  show(ui.levelScreen);
}

function beginLevel() {
  unlockAudio();
  if (levelIndex === 0 && !tutorialShown) {
    tutorialShown = true;
    setScene('tutorial');
    hideOverlays();
    show(ui.tutorialScreen);
    return;
  }
  loadLevel(levelIndex);
}

function startTutorialLevel() {
  if (scene === 'tutorial') loadLevel(0);
}

function priorRescueNames(index) {
  return LEVELS.slice(0, index).flatMap((config) => config.cages.map((cage) => cage.name));
}

function makeCage(config, id) {
  const saved = rescuedNames.has(config.name);
  return {
    ...config, id, w: 58, h: 72, hp: saved ? 0 : 1, saved,
    followX: config.x + 29, followY: config.y + 42,
    followDir: 1, followFrame: 0, followClock: id * .08,
    rescueClock: 0, celebrateClock: 0, emotion: saved ? 'follow' : 'worried',
  };
}

function makeEnemy(config, id) {
  const sizes = {
    scout: {w: 50, h: 58, hp: 1, speed: 30},
    archer: {w: 50, h: 58, hp: 1, speed: 30},
    roller: {w: 54, h: 54, hp: 2, speed: 48},
  };
  const size = sizes[config.kind];
  return {
    ...config, id, ...size, maxHp: size.hp, baseX: config.x,
    dir: id % 2 ? 1 : -1, dead: false, flash: 0,
    state: 'patrol', timer: 0, cooldown: 1 + id * .16,
    animation: 'walk', frame: 0, frameClock: id * .06,
  };
}

function makeBoss(config) {
  const prathek = config.kind === 'prathek';
  return {
    ...config, w: prathek ? 105 : 76, h: prathek ? 105 : 82,
    maxHp: config.hp, baseX: config.x, baseY: config.y,
    dir: -1, dead: false, flash: 0, phase: 1,
    speed: prathek ? 75 : 48, patrol: config.patrol || 180,
    state: 'idle', timer: 0, attackCount: 0,
    active: false, introShown: false, targetX: config.x,
    animation: 'walk', frame: 0, frameClock: 0,
  };
}

function loadLevel(index) {
  levelIndex = index;
  levelConfig = LEVELS[index];
  level = levelConfig;
  rescuedNames = new Set([...rescuedNames, ...priorRescueNames(index)]);
  platforms = [...levelConfig.grounds, ...levelConfig.platforms].map((platform) => ({...platform, active: true}));
  hazards = levelConfig.hazards.map((hazard) => ({...hazard, x: hazard.x, baseX: hazard.x, active: false}));
  switches = levelConfig.switches.map((item) => ({...item, active: false}));
  barriers = levelConfig.barriers.map((barrier) => ({...barrier}));
  cages = levelConfig.cages.map(makeCage);
  enemies = levelConfig.enemies.map(makeEnemy);
  if (levelConfig.boss) enemies.push(makeBoss(levelConfig.boss));
  projectiles = [];
  particles = [];
  barkQueue = [];
  activeBark = null;
  hide(ui.bark);
  checkpoint = {
    x: levelConfig.start.x, y: levelConfig.start.y, index: -1,
    savedNames: new Set(rescuedNames), switchIds: [],
  };
  Object.assign(hero, {
    x: levelConfig.start.x, y: levelConfig.start.y, vx: 0, vy: 0,
    hearts: 3, cream: 8, creamClock: 0, shootCd: 0, invuln: 0,
    respawnTimer: 0, recoil: 0,
  });
  camera = 0;
  worldTime = 0;
  wrongSwitchClock = 0;
  hideOverlays();
  hide(ui.dialogue);
  hide(ui.dialogueReview);
  hide(ui.bossHud);
  show(ui.hud);
  setScene('play');
  updateHud();
  queueBarks(BARKS.level[index]);
}

function restartCurrentAct() {
  if (!levelConfig) return;
  for (const cage of levelConfig.cages) rescuedNames.delete(cage.name);
  hide(ui.pauseScreen);
  loadLevel(levelIndex);
}

function queueDialogue(lines, done = null, returnScene = 'play') {
  sceneBeforeDialogue = returnScene;
  dialogueLines = [...lines];
  dialogueIndex = 0;
  dialogueDone = done;
  setScene('dialogue');
  duckMusic(true);
  hide(ui.dialogueReview);
  hide(ui.bark);
  activeBark = null;
  show(ui.dialogue);
  renderDialogueLine();
}

function renderDialogueLine() {
  const [name, text] = dialogueLines[dialogueIndex];
  document.querySelector('#speaker').textContent = name;
  document.querySelector('#dialogueText').textContent = text;
  drawPortrait(name);
  document.querySelector('#dialogueBack').disabled = dialogueIndex <= 0;
  document.querySelector('#dialogueNext').setAttribute(
    'aria-label',
    dialogueIndex === dialogueLines.length - 1 ? 'Close dialogue' : 'Continue dialogue',
  );
  tone(360, .04, 'triangle', .025);
}

function advanceDialogue() {
  if (dialogueIndex < dialogueLines.length - 1) {
    dialogueIndex += 1;
    renderDialogueLine();
    return;
  }
  hide(ui.dialogue);
  duckMusic(false);
  const done = dialogueDone;
  dialogueDone = null;
  setScene(sceneBeforeDialogue);
  if (done) done();
  else if (scene === 'play') show(ui.dialogueReview);
}

function previousDialogue() {
  if (dialogueIndex > 0) {
    dialogueIndex -= 1;
    renderDialogueLine();
  }
}

function reviewDialogue() {
  if (!dialogueLines.length || scene !== 'play') return;
  queueDialogue(dialogueLines, null, 'play');
  dialogueIndex = dialogueLines.length - 1;
  renderDialogueLine();
}

function pauseGame() {
  if (scene !== 'play') return;
  clearActions();
  setScene('paused');
  duckMusic(true);
  show(ui.pauseScreen);
}

function resumeGame() {
  if (scene !== 'paused') return;
  hide(ui.pauseScreen);
  duckMusic(false);
  setScene('play');
}

function togglePause() {
  if (scene === 'play') pauseGame();
  else if (scene === 'paused') resumeGame();
}

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function animate(entity, state, count, speed, dt) {
  if (entity.animation !== state) {
    entity.animation = state;
    entity.frame = 0;
    entity.frameClock = 0;
  }
  entity.frameClock += dt;
  if (entity.frameClock >= speed) {
    entity.frameClock -= speed;
    entity.frame = (entity.frame + 1) % count;
  }
}

function activeSwitchCount() {
  return switches.filter((item) => item.active).length;
}

function barrierOpen(barrier) {
  return barrier.requires.every((id) => switches.find((item) => item.id === id)?.active);
}

function livingBoss() {
  return enemies.find((enemy) => !enemy.dead && (enemy.kind === 'sprinkles' || enemy.kind === 'prathek'));
}

function gateIsOpen() {
  return cages.every((cage) => cage.saved) && !livingBoss() && barriers.every(barrierOpen);
}

function updateHud() {
  [...ui.hearts.children].forEach((pip, index) => pip.classList.toggle('empty', index >= hero.hearts));
  ui.cream.textContent = Math.floor(hero.cream);
  ui.rescued.textContent = `${rescuedNames.size}/5`;
  if (ui.globalRescued) ui.globalRescued.textContent = '';
  if (!levelConfig) return;
  const unsaved = cages.find((cage) => !cage.saved);
  const boss = livingBoss();
  if (unsaved) ui.goalPill.textContent = 'FIND THE PRETZELS →';
  else if (boss) ui.goalPill.textContent = `DEFEAT ${boss.kind === 'prathek' ? 'PRATHEK' : 'SIR SPRINKLES'} →`;
  else ui.goalPill.textContent = 'REACH THE GATE →';
  if (boss && boss.active) {
    show(ui.bossHud);
    ui.bossName.textContent = boss.kind === 'prathek' ? 'EMPEROR PRATHEK' : 'SIR SPRINKLES';
    ui.bossBar.style.width = `${Math.max(0, boss.hp / boss.maxHp * 100)}%`;
    ui.bossHint.textContent = boss.kind === 'prathek' && boss.phase === 2
      ? 'WATCH THE ROYAL ROLL'
      : boss.kind === 'sprinkles' ? 'BREAK THE GUARD' : 'DODGE THE FROSTING ORB';
  } else hide(ui.bossHud);
}

function burst(x, y, color, count = 8, screen = false) {
  for (let index = 0; index < count; index += 1) {
    particles.push({
      x, y, vx: (Math.random() - .5) * 230, vy: -60 - Math.random() * 180,
      life: .5 + Math.random() * .4, color, r: 3 + Math.random() * 4, screen,
    });
  }
}

function shake() {
  if (reducedMotion) return;
  const card = document.querySelector('.game-card');
  card.classList.remove('shake');
  void card.offsetWidth;
  card.classList.add('shake');
}

function landBurst() {
  if (!reducedMotion) burst(hero.x + hero.w / 2, hero.y + hero.h, '#fff0c2', 6);
}

function solidCollision(previousY, dt) {
  const wasGrounded = hero.onGround;
  const currentBottom = hero.y + hero.h;
  let landing = null;
  hero.onGround = false;
  hero.groundPlatform = null;
  for (const platform of platforms) {
    if (!platform.active || hero.x + hero.w <= platform.x || hero.x >= platform.x + platform.w || hero.vy < 0) continue;
    const landed = currentBottom >= platform.y && previousY + hero.h <= platform.y + 9;
    const stepped = wasGrounded && currentBottom > platform.y && currentBottom - platform.y <= 34;
    if (landed || stepped) {
      if (!landing || platform.y < landing.y) landing = platform;
    }
  }
  if (landing) {
    const trulyLanded = !wasGrounded && hero.vy > 100;
    hero.y = landing.y - hero.h;
    hero.vy = 0;
    hero.onGround = true;
    hero.groundPlatform = landing;
    if (landing.type === 'conveyor') hero.x += landing.dir * landing.speed * dt;
    if (trulyLanded) {
      hero.landClock = .12;
      landBurst();
    }
  }
}

function constrainBarriers(previousX) {
  for (const barrier of barriers) {
    if (barrierOpen(barrier)) continue;
    if (previousX + hero.w <= barrier.x && hero.x + hero.w > barrier.x) {
      hero.x = barrier.x - hero.w;
      hero.vx = 0;
    } else if (previousX >= barrier.x + barrier.w && hero.x < barrier.x + barrier.w) {
      hero.x = barrier.x + barrier.w;
      hero.vx = 0;
    }
  }
}

function updateHero(dt) {
  if (hero.respawnTimer > 0) {
    hero.respawnTimer -= dt;
    if (hero.respawnTimer <= 0) restoreCheckpoint(true);
    return;
  }
  hero.shootCd = Math.max(0, hero.shootCd - dt);
  hero.invuln = Math.max(0, hero.invuln - dt);
  hero.landClock = Math.max(0, hero.landClock - dt);
  hero.recoil = Math.max(0, hero.recoil - dt);
  hero.creamClock += dt;
  if (hero.cream < 8 && hero.creamClock > 1.2) {
    hero.cream = Math.min(8, hero.cream + 1);
    hero.creamClock = 0;
    updateHud();
  }
  if (input.jumpPress) hero.jumpBuffer = .13;
  else hero.jumpBuffer = Math.max(0, hero.jumpBuffer - dt);
  hero.coyote = hero.onGround ? .11 : Math.max(0, hero.coyote - dt);
  const move = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  if (move) hero.dir = move;
  hero.vx += move * 1500 * dt;
  hero.vx *= Math.pow(move ? .07 : .0004, dt);
  hero.vx = Math.max(-285, Math.min(285, hero.vx));
  hero.vy = Math.min(700, hero.vy + 1200 * dt);
  if (hero.jumpBuffer > 0 && hero.coyote > 0) {
    hero.vy = -500;
    hero.jumpBuffer = 0;
    hero.coyote = 0;
    burst(hero.x + 22, hero.y + 62, '#fff0c9', 7);
    sfx('jump');
  }
  if (!input.jump && hero.vy < -190) hero.vy = -190;
  const previousX = hero.x;
  const previousY = hero.y;
  hero.x += hero.vx * dt;
  hero.y += hero.vy * dt;
  hero.x = Math.max(0, Math.min(levelConfig.width - hero.w, hero.x));
  solidCollision(previousY, dt);
  constrainBarriers(previousX);
  if (input.shootPress) shoot();
  for (const hazard of hazards) {
    if (hazard.type !== 'pit' && hazard.active && overlap(hero, hazard)) hurtHero(hazard.x + hazard.w / 2);
  }
  if (hero.y > H + 90) handleFall();
  for (const enemy of enemies) {
    if (!enemy.dead && enemy.active !== false && overlap(hero, enemy)) hurtHero(enemy.x + enemy.w / 2);
  }
  for (let index = 0; index < levelConfig.checkpoints.length; index += 1) {
    const config = levelConfig.checkpoints[index];
    if (hero.x > config.x && checkpoint.index < index) activateCheckpoint(config, index);
  }
  const state = hero.invuln > 0 ? 'hurt'
    : hero.shootCd > .12 ? 'shoot'
      : !hero.onGround ? 'jump'
        : Math.abs(hero.vx) > 24 ? 'run' : 'idle';
  animate(hero, state, {idle: 4, run: 6, jump: 2, shoot: 4, hurt: 2}[state], state === 'run' ? .075 : .12, dt);
  if (hero.x > levelConfig.exit && gateIsOpen()) finishLevel();
  else if (hero.x > levelConfig.exit - 80 && !gateIsOpen()) say('The gate is still tracking unfinished heroics.');
}

function activateCheckpoint(config, index) {
  checkpoint = {
    x: config.x, y: config.y, index,
    savedNames: new Set(rescuedNames),
    switchIds: switches.filter((item) => item.active).map((item) => item.id),
  };
  say('Checkpoint: heroic resolve restored!');
  sfx('checkpoint');
}

function handleFall() {
  hero.hearts -= 1;
  sfx('hurt');
  updateHud();
  if (hero.hearts <= 0) {
    hero.respawnTimer = .25;
    say('The crumbs regroup at the checkpoint.');
  } else {
    hero.x = checkpoint.x;
    hero.y = checkpoint.y;
    hero.vx = 0;
    hero.vy = 0;
    hero.invuln = 1.25;
    camera = Math.max(0, checkpoint.x - W * .3);
    say('Jam is not a shortcut.');
  }
}

function rebuildCurrentEncounter() {
  rescuedNames = new Set(checkpoint.savedNames);
  switches = levelConfig.switches.map((item) => ({...item, active: checkpoint.switchIds.includes(item.id)}));
  cages = levelConfig.cages.map(makeCage);
  enemies = levelConfig.enemies
    .map(makeEnemy)
    .filter((enemy) => enemy.x > checkpoint.x - 140);
  if (levelConfig.boss) enemies.push(makeBoss(levelConfig.boss));
  projectiles = [];
}

function restoreCheckpoint(resetEncounter) {
  if (resetEncounter) projectiles = [];
  Object.assign(hero, {
    x: checkpoint.x, y: checkpoint.y, vx: 0, vy: 0,
    hearts: 3, invuln: 1.25, respawnTimer: 0,
  });
  camera = Math.max(0, checkpoint.x - W * .3);
  hide(ui.bossHud);
  updateHud();
}

function shoot() {
  if (hero.shootCd > 0) return;
  if (hero.cream < 1) {
    say('Out of eggs — the sling is reloading!');
    return;
  }
  hero.shootCd = .28;
  hero.recoil = .12;
  hero.cream -= 1;
  hero.creamClock = 0;
  projectiles.push({
    x: hero.x + 22 + hero.dir * 25, y: hero.y + 25,
    w: 18, h: 14, vx: hero.dir * 570, vy: -15,
    owner: 'hero', life: 1.6, kind: 'egg', gravity: 80,
  });
  updateHud();
  sfx('egg');
}

function hurtHero(from = hero.x) {
  if (hero.invuln > 0 || hero.respawnTimer > 0) return;
  hero.hearts -= 1;
  hero.invuln = 1.25;
  hero.vx = hero.x < from ? -260 : 260;
  hero.vy = -260;
  shake();
  sfx('hurt');
  updateHud();
  if (hero.hearts <= 0) {
    hero.respawnTimer = .35;
    clearActions();
  }
}

function updateHazards(dt) {
  for (const hazard of hazards) {
    if (hazard.type === 'vent') {
      const clock = (worldTime + hazard.phase) % hazard.cycle;
      hazard.warning = clock < .65;
      hazard.active = clock >= .65 && clock < 1.45;
    } else if (hazard.type === 'boulder') {
      const travel = ((worldTime * hazard.speed + hazard.phase * 100) % (hazard.range * 2));
      hazard.x = hazard.baseX + (travel <= hazard.range ? travel : hazard.range * 2 - travel);
      hazard.active = true;
      hazard.rotation = (hazard.rotation || 0) + dt * 5;
    }
  }
}

function updateEnemies(dt) {
  for (const enemy of enemies) {
    if (enemy.dead) continue;
    enemy.flash = Math.max(0, enemy.flash - dt);
    animate(enemy, 'walk', 4, enemy.state === 'roll' ? .07 : .14, dt);
    if (enemy.kind === 'sprinkles') {
      updateSirSprinkles(enemy, dt);
    } else if (enemy.kind === 'prathek') {
      updatePrathek(enemy, dt);
    } else {
      patrol(enemy, dt);
    }
  }
}

function patrol(enemy, dt) {
  enemy.x += enemy.dir * enemy.speed * dt;
  if (Math.abs(enemy.x - enemy.baseX) > enemy.patrol) {
    enemy.x = enemy.baseX + Math.sign(enemy.x - enemy.baseX) * enemy.patrol;
    enemy.dir *= -1;
  }
}

function updateRegularEnemy(enemy, dt) {
  enemy.cooldown -= dt;
  enemy.timer -= dt;
  const distance = Math.abs(hero.x - enemy.x);
  if (enemy.kind === 'scout') {
    if (enemy.state === 'patrol') {
      patrol(enemy, dt);
      if (distance < 220 && enemy.cooldown <= 0) {
        enemy.state = 'warn';
        enemy.timer = .55;
        enemy.dir = hero.x < enemy.x ? -1 : 1;
      }
    } else if (enemy.state === 'warn' && enemy.timer <= 0) {
      enemy.state = 'lunge';
      enemy.timer = .42;
    } else if (enemy.state === 'lunge') {
      enemy.x += enemy.dir * 235 * dt;
      if (enemy.timer <= 0) {
        enemy.state = 'recover';
        enemy.timer = .65;
      }
    } else if (enemy.state === 'recover' && enemy.timer <= 0) {
      enemy.state = 'patrol';
      enemy.cooldown = 1.5;
    }
  } else if (enemy.kind === 'archer') {
    if (enemy.state === 'patrol') {
      patrol(enemy, dt);
      if (distance < 610 && enemy.cooldown <= 0) {
        enemy.state = 'warn';
        enemy.timer = .55;
        enemy.dir = hero.x < enemy.x ? -1 : 1;
      }
    } else if (enemy.state === 'warn' && enemy.timer <= 0) {
      spawnAimedProjectile(enemy, 'sprinkle', 230);
      enemy.state = 'recover';
      enemy.timer = .7;
    } else if (enemy.state === 'recover' && enemy.timer <= 0) {
      enemy.state = 'patrol';
      enemy.cooldown = 1.65;
    }
  } else if (enemy.kind === 'roller') {
    if (enemy.state === 'patrol') {
      patrol(enemy, dt);
      if (distance < 350 && enemy.cooldown <= 0) {
        enemy.state = 'warn';
        enemy.timer = .65;
        enemy.dir = hero.x < enemy.x ? -1 : 1;
      }
    } else if (enemy.state === 'warn' && enemy.timer <= 0) {
      enemy.state = 'charge';
      enemy.timer = .8;
    } else if (enemy.state === 'charge') {
      enemy.x += enemy.dir * 250 * dt;
      if (enemy.timer <= 0 || Math.abs(enemy.x - enemy.baseX) > enemy.patrol + 120) {
        enemy.state = 'recover';
        enemy.timer = 1.05;
      }
    } else if (enemy.state === 'recover' && enemy.timer <= 0) {
      enemy.baseX = enemy.x;
      enemy.state = 'patrol';
      enemy.cooldown = 1.45;
    }
  }
}

function maybeIntroduceBoss(boss) {
  if (boss.introShown || hero.x < boss.arena.start + 20 || Math.abs(hero.x - boss.x) > 460) return;
  boss.introShown = true;
  sfx('boss');
  const lines = boss.kind === 'sprinkles'
    ? [
      ['Sir Sprinkles', 'Halt! My entrance has been rehearsed for weeks.'],
      ['Cath Crumbwell', 'You landed on your own cape.'],
      ['Sir Sprinkles', 'That was the advanced version.'],
    ]
    : [
      ['Emperor Prathek Donutwell', 'Welcome, Catherine. Behold my mathematically superior fortress!'],
      ['Cath Crumbwell', 'Your candles say two plus two equals five.'],
      ['Emperor Prathek Donutwell', 'It is imperial mathematics.'],
    ];
  queueDialogue(lines, () => {
    boss.active = true;
    boss.state = 'idle';
    boss.timer = .8;
    updateHud();
  }, 'play');
}

function bossIdleChoice(boss) {
  boss.attackCount += 1;
  if (boss.kind === 'sprinkles') {
    boss.state = boss.attackCount % 2 === 1 ? 'fanWarn' : 'leapWarn';
    boss.timer = boss.phase === 2 ? .52 : .68;
    if (boss.state === 'leapWarn') boss.targetX = Math.max(boss.arena.start + 60, Math.min(boss.arena.end - boss.w - 50, hero.x));
  } else if (boss.phase === 1) {
    boss.state = 'orbWarn';
    boss.timer = .65;
  } else {
    boss.state = 'rollWarn';
    boss.timer = .78;
    boss.dir = hero.x < boss.x ? -1 : 1;
  }
}

function updateSirSprinkles(boss, dt) {
  maybeIntroduceBoss(boss);
  if (!boss.active || boss.dead) return;
  boss.state = 'idle';
  patrol(boss, dt);
}

function updatePrathek(boss, dt) {
  maybeIntroduceBoss(boss);
  if (!boss.active || boss.dead) return;
  if (boss.phase === 1) {
    boss.state = 'idle';
    boss.x = boss.baseX + Math.sin(performance.now() / 800) * 75;
    boss.timer -= dt;
    if (boss.timer <= 0) {
      spawnAimedProjectile(boss, 'orb', 205);
      boss.timer = 1.75;
    }
  } else {
    boss.state = 'roll';
    boss.x += boss.dir * 125 * dt;
    if (boss.x < boss.baseX - 230 || boss.x > boss.baseX + 230) boss.dir *= -1;
  }
}

function spawnAimedProjectile(source, kind, speed, angleOffset = 0) {
  const sx = source.x + source.w / 2;
  const sy = source.y + source.h * .42;
  const dx = hero.x + hero.w / 2 - sx;
  const dy = hero.y + hero.h / 2 - sy;
  const angle = Math.atan2(dy, dx) + angleOffset;
  const size = kind === 'orb' ? 24 : 16;
  projectiles.push({
    x: sx, y: sy, w: size, h: size,
    vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
    owner: 'enemy', life: 4, kind, gravity: 0,
  });
}

function spawnFan(source) {
  for (const offset of [-.24, 0, .24]) spawnAimedProjectile(source, 'sprinkle', source.phase === 2 ? 255 : 225, offset);
  tone(150, .08, 'square');
}

function updateProjectiles(dt) {
  for (const projectile of projectiles) {
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    projectile.vy += (projectile.gravity || 0) * dt;
    projectile.life -= dt;
    if (projectile.owner === 'enemy' && overlap(projectile, hero)) {
      projectile.life = 0;
      hurtHero(projectile.x);
      continue;
    }
    if (projectile.owner !== 'hero') continue;
    for (const cage of cages) {
      if (!cage.saved && overlap(projectile, cage)) {
        projectile.life = 0;
        cage.hp -= 1;
        burst(projectile.x, projectile.y, '#f3c84f', 8);
        if (cage.hp <= 0) rescue(cage);
      }
    }
    if (projectile.life <= 0) continue;
    for (const item of switches) {
      if (!item.active && overlap(projectile, item)) {
        projectile.life = 0;
        activateSwitch(item);
      }
    }
    if (projectile.life <= 0) continue;
    for (const enemy of enemies) {
      if (!enemy.dead && overlap(projectile, enemy)) {
        projectile.life = 0;
        hitEnemy(enemy, projectile);
        break;
      }
    }
  }
  projectiles = projectiles.filter((projectile) => (
    projectile.life > 0
    && projectile.x > -120
    && projectile.x < levelConfig.width + 120
    && projectile.y > -100
    && projectile.y < 700
  ));
}

function activateSwitch(item) {
  const expected = switches.find((candidate) => !candidate.active);
  if (expected?.id !== item.id) {
    if (wrongSwitchClock <= 0) {
      say('The candles insist on being read from left to right.');
      wrongSwitchClock = 1.8;
    }
    burst(item.x + 16, item.y + 12, '#d94f78', 8);
    return;
  }
  item.active = true;
  sfx('switch');
  burst(item.x + 16, item.y + 10, '#ffd46b', 18);
  say(`Candle ${item.label} lit — ${activeSwitchCount()}/4`);
  if (switches.every((candidate) => candidate.active)) {
    say('2 + 2 = 4. The fortress reluctantly accepts this.');
    sfx('gate');
  }
  updateHud();
}

function hitEnemy(enemy, projectile) {
  if (enemy.kind === 'sprinkles' || enemy.kind === 'prathek') {
    hitBoss(enemy, projectile);
    return;
  }
  enemy.hp -= 1;
  enemy.flash = .18;
  freezeTime = reducedMotion ? 0 : .045;
  burst(projectile.x, projectile.y, '#fff0c8', 9);
  sfx('hit');
  if (enemy.hp <= 0) {
    enemy.dead = true;
    burst(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#e8a33c', 15);
  }
}

function hitBoss(boss, projectile) {
  if (!boss.active || boss.dead) return;
  boss.hp -= 1;
  boss.flash = .2;
  freezeTime = reducedMotion ? 0 : .065;
  burst(projectile.x, projectile.y, '#f0a2c0', 16);
  shake();
  sfx('hit');
  if (boss.kind === 'prathek' && boss.phase === 1 && boss.hp === 3) {
    boss.phase = 2;
    boss.active = false;
    queueDialogue([
      ['Emperor Prathek Donutwell', 'Enough! Behold the unstoppable force of angular momentum!'],
      ['Cath Crumbwell', 'You stopped moving to announce it.'],
      ['Emperor Prathek Donutwell', 'Dramatic pauses do not count!'],
    ], () => {
      boss.active = true;
      boss.state = 'idle';
      boss.timer = .5;
    }, 'play');
  }
  if (boss.hp <= 0) defeatBoss(boss);
  updateHud();
}

function defeatBoss(boss) {
  boss.dead = true;
  boss.active = false;
  hide(ui.bossHud);
  cages.filter((cage) => cage.saved).forEach((cage) => {
    cage.celebrateClock = 3;
    cage.emotion = 'cheer';
  });
  for (let index = 0; index < 60; index += 1) {
    burst(boss.x + boss.w / 2, boss.y + boss.h / 2, ['#f4bb4f', '#e75f7b', '#8b72bd'][index % 3], 1);
  }
  const lines = boss.kind === 'sprinkles'
    ? [
      ['Sir Sprinkles', 'I have been… thoroughly egged.'],
      ['Cath Crumbwell', 'You fought bravely.'],
      ['Sir Sprinkles', 'Truly?'],
      ['Cath Crumbwell', 'No. But your landing was rehearsed.'],
    ]
    : [
      ['Emperor Prathek Donutwell', 'Enjoy your victory. I shall return!'],
      ['Cath Crumbwell', 'Take your time.'],
      ['Emperor Prathek Donutwell', 'I am not old!'],
      ['Cath Crumbwell', 'Your knees made the boss music when you stood up.'],
      ['Little Loop', 'There was no orchestra.'],
    ];
  queueDialogue(lines, () => {
    cages.filter((cage) => cage.saved).forEach((cage) => { cage.celebrateClock = 2; });
    updateHud();
    sfx('gate');
  }, 'play');
}

function rescue(cage) {
  cage.saved = true;
  cage.hp = 0;
  cage.rescueClock = 2;
  cage.emotion = 'cheer';
  cage.followX = cage.x + 29;
  cage.followY = cage.y + 42;
  rescuedNames.add(cage.name);
  burst(cage.x + 29, cage.y + 35, '#f6cf55', 24);
  sfx('rescue');
  say(`${cage.name} rescued!`);
  queueBarks(BARKS.rescue[cage.name]);
  updateHud();
}

function updateFollowers(dt) {
  const followers = cages.filter((cage) => cage.saved);
  const boss = livingBoss();
  const danger = hero.invuln > 0 || Boolean(boss?.active);
  const atGate = gateIsOpen() && Math.abs(hero.x - levelConfig.exit) < 240;
  followers.forEach((cage, index) => {
    cage.rescueClock = Math.max(0, cage.rescueClock - dt);
    cage.celebrateClock = Math.max(0, cage.celebrateClock - dt);
    const targetX = atGate
      ? levelConfig.exit - 55 - index * 42
      : hero.x + hero.w / 2 - hero.dir * (62 + index * 45);
    const targetY = 432 + (index % 2) * 3;
    let dx = targetX - cage.followX;
    let dy = targetY - cage.followY;
    if (Math.abs(dx) > 520) {
      cage.followX = hero.x - hero.dir * (70 + index * 42);
      cage.followY = targetY;
      dx = targetX - cage.followX;
      dy = 0;
    }
    const ease = 1 - Math.exp(-dt * (danger ? 5 : 7));
    cage.followX += dx * ease;
    cage.followY += dy * ease;
    if (Math.abs(dx) > 2) cage.followDir = dx < 0 ? -1 : 1;
    cage.followClock += dt;
    if (cage.followClock > .12) {
      cage.followClock -= .12;
      cage.followFrame = (cage.followFrame + 1) % 4;
    }
    cage.emotion = danger ? 'worried'
      : atGate || cage.rescueClock > 0 || cage.celebrateClock > 0 ? 'cheer' : 'follow';
  });
}

function finishLevel() {
  if (scene !== 'play') return;
  saveData.highestUnlockedAct = Math.max(saveData.highestUnlockedAct, Math.min(2, levelIndex + 1));
  persistSave();
  if (levelIndex < LEVELS.length - 1) {
    setScene('transition');
    document.querySelector('.game-card').classList.add('flash');
    setTimeout(() => {
      document.querySelector('.game-card').classList.remove('flash');
      showLevelIntro(levelIndex + 1);
    }, 400);
  } else showVictory();
}

function showVictory() {
  saveData.completed = true;
  saveData.highestUnlockedAct = 2;
  persistSave();
  setScene('victory');
  hide(ui.dialogue);
  hide(ui.dialogueReview);
  hide(ui.hud);
  hide(ui.bossHud);
  hide(ui.bark);
  hideOverlays();
  ui.actLabel.textContent = 'FINAL CHAPTER';
  ui.levelLabel.textContent = 'Twistwick Saved';
  ui.victoryImage.src = images.victory.src;
  show(ui.victoryScreen);
  confetti(110);
  sfx('victory');
}

function showRewardDialogue() {
  hide(ui.victoryScreen);
  queueDialogue([
    ['Mayor Twistopher', 'Cath Crumbwell, you saved the town and your birthday celebration!'],
    ['Little Loop', 'And you replied before the crisis was over.'],
    ['Cath Crumbwell', 'The town was worth showing up for.'],
    ['Auntie Saltina', 'Please accept Twistwick’s highest honor: an Auntie Anne’s gift card.'],
    ['Cath Crumbwell', 'You are rewarding me for saving pretzels… with money to eat pretzels?'],
    ['Mayor Twistopher', 'We did not think this through.'],
    ['Cath Crumbwell', 'I am keeping it.'],
  ], showEnding, 'endingStory');
}

function showEnding() {
  setScene('ending');
  hide(ui.dialogue);
  hide(ui.dialogueReview);
  hide(ui.hud);
  hide(ui.bossHud);
  show(ui.endingScreen);
  confetti(170);
  sfx('victory');
}

function confetti(count) {
  for (let index = 0; index < count; index += 1) {
    particles.push({
      x: Math.random() * W, y: -Math.random() * H,
      vx: (Math.random() - .5) * 150, vy: 70 + Math.random() * 160,
      life: 6, color: ['#ef6380', '#f3bc4d', '#75b89a', '#9575bd'][index % 4],
      r: 3 + Math.random() * 5, screen: true,
    });
  }
}

function update(dt) {
  wrongSwitchClock = Math.max(0, wrongSwitchClock - dt);
  if (scene === 'play') {
    if (freezeTime > 0) freezeTime -= dt;
    else {
      worldTime += dt;
      updateHazards(dt);
      updateHero(dt);
      updateEnemies(dt);
      updateFollowers(dt);
      updateProjectiles(dt);
      updateBark(dt);
      const targetCamera = Math.max(0, Math.min(levelConfig.width - W, hero.x - W * .38));
      camera += (targetCamera - camera) * Math.min(1, dt * 5);
      updateHud();
    }
  } else if (activeBark) {
    activeBark = null;
    hide(ui.bark);
  }
  for (const particle of particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += (particle.screen ? 80 : 380) * dt;
    particle.life -= dt;
  }
  particles = particles.filter((particle) => particle.life > 0);
  input.jumpPress = false;
  input.shootPress = false;
}

function snap(value) { return Math.round(value); }

function drawSprite(key, x, y, w, h, flip = false, alpha = 1, target = ctx) {
  const box = SPRITE_FRAMES[key];
  if (!box || !images.sprites) return;
  target.save();
  target.imageSmoothingEnabled = false;
  target.globalAlpha = alpha;
  if (flip) {
    target.translate(snap(x + w), snap(y));
    target.scale(-1, 1);
    target.drawImage(images.sprites, ...box, 0, 0, snap(w), snap(h));
  } else target.drawImage(images.sprites, ...box, snap(x), snap(y), snap(w), snap(h));
  target.restore();
}

function drawProp(key, x, y, w = null, h = null, target = ctx) {
  const box = PROP_FRAMES[key];
  if (!box || !images.props) return;
  target.drawImage(images.props, ...box, snap(x), snap(y), w || box[2], h || box[3]);
}

function drawPortrait(name, targetCanvas = ui.portraitCanvas) {
  const detailed = name.includes('Prathek') ? images.prathekPortrait
    : name.includes('Cath') ? images.catPortrait : images.pretzelPortrait;
  if (detailed) {
    drawUiImage(targetCanvas, detailed, .94);
    return;
  }
  const context = targetCanvas.getContext('2d');
  const cw = targetCanvas.width;
  const ch = targetCanvas.height;
  context.clearRect(0, 0, cw, ch);
  context.imageSmoothingEnabled = false;
  const key = name.includes('Sprinkles') ? 'sprinkles.walk.0' : 'pretzel.happy.0';
  const box = SPRITE_FRAMES[key];
  const size = key.startsWith('pretzel') ? Math.min(cw, ch) * .78 : Math.min(cw, ch) * .9;
  context.drawImage(images.sprites, ...box, (cw - size) / 2, (ch - size) / 2, size, size);
}

function drawUiImage(targetCanvas, image, scale = .9) {
  if (!targetCanvas || !image) return;
  const context = targetCanvas.getContext('2d');
  const width = targetCanvas.width;
  const height = targetCanvas.height;
  const scaleFactor = Math.min(width / image.width, height / image.height) * scale;
  const drawWidth = Math.floor(image.width * scaleFactor);
  const drawHeight = Math.floor(image.height * scaleFactor);
  context.clearRect(0, 0, width, height);
  context.imageSmoothingEnabled = false;
  context.drawImage(image, Math.floor((width - drawWidth) / 2), Math.floor((height - drawHeight) / 2), drawWidth, drawHeight);
}

function drawChromeSprites() {
  ui.titleLineup.src = images.castLineup.src;
  drawUiImage(ui.brandPortrait, images.catPortrait, 1.06);
  drawUiImage(ui.hudPretzel, images.pretzelPortrait, 1);
  drawUiImage(ui.giftPretzel, images.pretzelPortrait, .92);
  drawUiImage(ui.orientationPortrait, images.catPortrait, 1);
}

function drawBackdrop() {
  if (images.story5) {
    ctx.drawImage(images.story5, 0, 0, W, H);
    ctx.fillStyle = '#251a3277';
    ctx.fillRect(0, 0, W, H);
  } else {
    ctx.fillStyle = '#251a32';
    ctx.fillRect(0, 0, W, H);
  }
}

function drawMidground() {
  for (const decor of levelConfig.decor) {
    const x = snap(decor.x - camera * .42);
    if (x < -120 || x > W + 120) continue;
    ctx.save();
    ctx.globalAlpha = .56;
    if (decor.type === 'wheat') {
      ctx.fillStyle = '#7a543a';
      for (let i = 0; i < 5; i += 1) {
        ctx.fillRect(x + i * 8, 350 - i % 2 * 12, 4, 110);
        ctx.fillStyle = '#d9a54e';
        ctx.fillRect(x - 3 + i * 8, 352 - i % 2 * 12, 10, 20);
      }
    } else if (decor.type === 'banner') {
      ctx.fillStyle = '#4b3158';
      ctx.fillRect(x, 300, 6, 160);
      ctx.fillStyle = '#b94d78';
      ctx.fillRect(x + 6, 310, 68, 70);
      ctx.fillStyle = '#e8a33c';
      ctx.fillRect(x + 18, 325, 44, 8);
    } else if (decor.type === 'pipe') {
      ctx.fillStyle = '#9a653d';
      ctx.fillRect(x, 270, 24, 190);
      ctx.fillStyle = '#d5a148';
      ctx.fillRect(x - 8, 290, 40, 15);
      ctx.fillRect(x - 8, 410, 40, 15);
    } else if (decor.type === 'gear') {
      ctx.strokeStyle = '#b98245';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.arc(x + 36, 380, 34, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#55354f';
      ctx.fillRect(x + 29, 345, 14, 70);
      ctx.fillRect(x + 1, 373, 70, 14);
    } else if (decor.type === 'chain') {
      ctx.strokeStyle = '#7a657e';
      ctx.lineWidth = 5;
      for (let y = 250; y < 460; y += 24) {
        ctx.strokeRect(x, y, 14, 20);
      }
    }
    ctx.restore();
  }
}

function drawWorld() {
  const plate = levelConfig.theme === 'factory' ? images.factory
    : levelConfig.theme === 'castle' ? images.castle : images.commons;
  const pan = Math.min(150, Math.max(0, camera * .085));
  ctx.drawImage(plate, -pan, 0, W + 150, H);
  ctx.fillStyle = levelConfig.theme === 'castle' ? '#21152b3d'
    : levelConfig.theme === 'factory' ? '#521f4033' : '#fff0c218';
  ctx.fillRect(0, 0, W, H);
  drawMidground();
  for (const hazard of hazards) if (hazard.type === 'pit') drawHazard(hazard);
  for (const platform of platforms) drawPlatform(platform);
  for (const hazard of hazards) if (hazard.type !== 'pit') drawHazard(hazard);
  for (const item of switches) drawSwitch(item);
  for (const barrier of barriers) drawBarrier(barrier);
  for (const cage of cages) drawCage(cage);
  drawExit();
  for (const cage of cages) if (cage.saved) drawFollower(cage);
  for (const enemy of enemies) drawEnemy(enemy);
  for (const projectile of projectiles) drawProjectile(projectile);
  if (hero.invuln <= 0 || Math.floor(performance.now() / 80) % 2) drawHero();
  for (const particle of particles) if (!particle.screen) drawParticle(particle);
}

function drawPlatform(platform) {
  const x = snap(platform.x - camera);
  if (x > W + 60 || x + platform.w < -60) return;
  const tileX = levelConfig.theme === 'factory' ? 16 : levelConfig.theme === 'castle' ? 32 : 0;
  const start = Math.max(0, Math.floor((camera - platform.x) / 48) * 48);
  const end = Math.min(platform.w, start + W + 120);
  for (let tx = start; tx < end; tx += 48) {
    for (let ty = 0; ty < platform.h; ty += 48) {
      ctx.drawImage(images.tiles, tileX, 0, 16, 16, x + tx, platform.y + ty, Math.min(48, platform.w - tx), Math.min(48, platform.h - ty));
    }
    if (platform.type === 'conveyor') {
      drawProp('conveyor', x + tx, platform.y - 6, Math.min(48, platform.w - tx), 16);
      ctx.fillStyle = '#fff0c2';
      const arrowX = x + tx + ((worldTime * platform.speed * platform.dir) % 32 + 32) % 32;
      ctx.fillRect(arrowX, platform.y - 1, 10, 3);
    }
  }
}

function drawHazard(hazard) {
  const x = snap(hazard.x - camera);
  if (x > W + 80 || x + hazard.w < -80) return;
  if (hazard.type === 'pit') {
    const color = levelConfig.theme === 'castle' ? '#d94f78' : levelConfig.theme === 'factory' ? '#a83e68' : '#9f314d';
    ctx.fillStyle = '#251a32';
    ctx.fillRect(x, hazard.y, hazard.w, H - hazard.y);
    ctx.fillStyle = color;
    ctx.fillRect(x, hazard.y + 16, hazard.w, H - hazard.y);
    ctx.fillStyle = '#f07c9b';
    for (let i = 0; i < hazard.w; i += 24) ctx.fillRect(x + i, hazard.y + 10 + (i % 48 ? 4 : 0), 18, 7);
  } else if (hazard.type === 'vent') {
    const frame = hazard.active ? 'ventOn' : hazard.warning ? 'ventWarn' : 'ventOff';
    drawProp(frame, x, hazard.y, hazard.w, hazard.h);
    if (hazard.active) {
      ctx.fillStyle = '#fff0c288';
      for (let i = 0; i < 3; i += 1) ctx.fillRect(x + 8 + i * 10, hazard.y - 24 - (i % 2) * 12, 5, 30);
    }
  } else if (hazard.type === 'boulder') {
    ctx.save();
    ctx.translate(x + hazard.w / 2, hazard.y + hazard.h / 2);
    ctx.rotate(hazard.rotation || 0);
    ctx.fillStyle = '#251a32';
    ctx.fillRect(-19, -19, 38, 38);
    ctx.fillStyle = '#8d4a61';
    ctx.fillRect(-15, -15, 30, 30);
    ctx.fillStyle = '#e8a33c';
    ctx.fillRect(-4, -15, 8, 30);
    ctx.fillRect(-15, -4, 30, 8);
    ctx.restore();
  }
}

function drawSwitch(item) {
  const x = snap(item.x - camera);
  if (x < -60 || x > W + 60) return;
  const frame = item.label === '+' ? 'candlePlus' : item.label === '4' ? 'candle4' : 'candle2';
  drawProp(frame, x, item.y, item.w, item.h);
  if (item.active) {
    ctx.fillStyle = '#ffd46b88';
    ctx.fillRect(x - 5, item.y - 8, item.w + 10, item.h + 12);
    drawProp('switchOn', x, item.y, item.w, item.h);
  } else drawProp('switchOff', x, item.y, item.w, item.h);
}

function drawBarrier(barrier) {
  if (barrierOpen(barrier)) return;
  const x = snap(barrier.x - camera);
  if (x < -80 || x > W + 80) return;
  drawProp('portcullis', x, barrier.y, barrier.w, barrier.h);
}

function drawExit() {
  const x = snap(levelConfig.exit - camera);
  const open = gateIsOpen();
  const themeIndex = {meadow: 0, factory: 1, castle: 2}[levelConfig.theme] || 0;
  const sourceX = themeIndex * 192 + (open ? 96 : 0);
  ctx.drawImage(images.gates, sourceX, 0, 96, 128, x - 12, 332, 96, 128);
  ctx.fillStyle = '#251a32';
  ctx.font = '700 14px "Silkscreen"';
  ctx.textAlign = 'center';
  ctx.fillText(open ? 'EXIT >' : 'LOCKED', x + 36, 325);
}

function drawCage(cage) {
  const x = snap(cage.x - camera);
  if (x < -80 || x > W + 80) return;
  if (cage.saved) {
    ctx.fillStyle = '#251a32';
    ctx.fillRect(x, cage.y + 64, cage.w, 8);
    ctx.fillStyle = '#d7a546';
    ctx.fillRect(x + 2, cage.y + 66, cage.w - 4, 3);
    for (let index = 0; index < 3; index += 1) {
      ctx.save();
      ctx.translate(x + 8 + index * 18, cage.y + 62);
      ctx.rotate((index - 1) * .28);
      ctx.fillStyle = '#b8bbc0';
      ctx.fillRect(0, -24, 4, 27);
      ctx.restore();
    }
    return;
  }
  ctx.fillStyle = '#251a32';
  ctx.fillRect(x, cage.y, cage.w, 8);
  ctx.fillRect(x, cage.y + 64, cage.w, 8);
  ctx.fillStyle = '#d7a546';
  ctx.fillRect(x + 2, cage.y + 3, cage.w - 4, 3);
  ctx.fillRect(x + 2, cage.y + 66, cage.w - 4, 3);
  for (let index = 5; index < cage.w; index += 13) {
    ctx.fillStyle = '#251a32';
    ctx.fillRect(x + index, cage.y, 7, 72);
    ctx.fillStyle = '#b8bbc0';
    ctx.fillRect(x + index + 2, cage.y + 4, 3, 62);
  }
  drawPretzel(x + 29, cage.y + 42, false, cage.id);
  ctx.fillStyle = '#ffd46b';
  ctx.fillRect(x + cage.w - 12, cage.y + 28, 12, 15);
  ctx.fillStyle = '#251a32';
  ctx.fillRect(x + cage.w - 9, cage.y + 33, 6, 7);
}

function drawPretzel(x, y, happy, id = 0) {
  const frame = Math.floor(performance.now() / 180 + id) % 4;
  drawSprite(`pretzel.${happy ? 'happy' : 'worried'}.${frame}`, x - 24, y - 24, 48, 48);
}

function followerKey(name) {
  return name === 'Mayor Twistopher' ? 'mayor'
    : name === 'Knottingham' ? 'knottingham'
      : name === 'Auntie Saltina' ? 'saltina'
        : name === 'Baker Braidley' ? 'braidley' : 'little';
}

function spriteShadow(x, y, width) {
  ctx.fillStyle = '#21152b88';
  ctx.fillRect(snap(x - width / 2), snap(y), snap(width), 5);
  ctx.fillStyle = '#100b1866';
  ctx.fillRect(snap(x - width * .3), snap(y + 5), snap(width * .6), 3);
}

function drawFollower(cage) {
  const x = cage.followX - camera;
  if (x < -70 || x > W + 70) return;
  const key = `pretzel.${followerKey(cage.name)}.${cage.emotion}.${cage.followFrame}`;
  spriteShadow(x, cage.followY + 21, 32);
  drawSprite(key, x - 24, cage.followY - 24, 48, 48, cage.followDir < 0);
}

function drawHero() {
  const x = hero.x - camera - hero.dir * (hero.recoil > 0 ? 5 : 0);
  const squat = hero.landClock > 0 ? 4 : 0;
  spriteShadow(x + hero.w / 2, hero.y + hero.h - 1, 42);
  drawSprite(`cat.${hero.animation}.${hero.frame}`, x - 10, hero.y - 2 + squat, 64, 64 - squat, hero.dir < 0);
}

function drawEnemy(enemy) {
  if (enemy.dead) return;
  const x = enemy.x - camera;
  if (x > W + 140 || x < -140) return;
  const boss = enemy.kind === 'prathek';
  const size = boss ? 96 : enemy.kind === 'sprinkles' ? 78 : 64;
  spriteShadow(x + enemy.w / 2, enemy.y + enemy.h - 1, boss ? 68 : 42);
  drawSprite(`${enemy.kind}.walk.${enemy.frame % 4}`, x + (enemy.w - size) / 2, enemy.y + enemy.h - size, size, size, enemy.dir < 0, enemy.flash ? .42 : 1);
  if (enemy.state?.includes('Warn') || enemy.state === 'warn' || enemy.state === 'rollWarn') {
    drawProp('warning', x + enemy.w / 2 - 16, enemy.y - 34, 32, 32);
  }
  if (enemy.state === 'leapWarn') {
    const markerX = enemy.targetX - camera;
    ctx.strokeStyle = '#ffd46b';
    ctx.lineWidth = 5;
    ctx.strokeRect(markerX - 12, GROUND_Y - 12, enemy.w + 24, 10);
  }
  if (enemy.state === 'stun') {
    ctx.fillStyle = '#ffd46b';
    for (let index = 0; index < 3; index += 1) {
      const angle = worldTime * 5 + index * Math.PI * 2 / 3;
      ctx.fillRect(x + enemy.w / 2 + Math.cos(angle) * 35 - 4, enemy.y - 12 + Math.sin(angle) * 8, 8, 8);
    }
  }
}

function drawProjectile(projectile) {
  const x = snap(projectile.x - camera);
  const y = snap(projectile.y);
  ctx.fillStyle = '#251a32';
  ctx.fillRect(x - 4, y - 4, projectile.w + 8, projectile.h + 8);
  ctx.fillStyle = projectile.kind === 'egg' ? '#fff0c2'
    : projectile.kind === 'orb' ? '#ef7598'
      : projectile.kind === 'shockwave' ? '#e8a33c' : '#78b89b';
  ctx.fillRect(x, y, projectile.w, projectile.h);
  ctx.fillStyle = '#fff8dc';
  ctx.fillRect(x + 3, y + 3, Math.max(3, projectile.w / 4), Math.max(3, projectile.h / 4));
}

function drawParticle(particle) {
  ctx.fillStyle = particle.color;
  ctx.fillRect(
    snap(particle.screen ? particle.x : particle.x - camera),
    snap(particle.y),
    Math.max(3, snap(particle.r)),
    Math.max(3, snap(particle.r * (particle.screen ? 1.8 : 1))),
  );
}

function draw() {
  ctx.imageSmoothingEnabled = false;
  const worldVisible = levelConfig && ['play', 'dialogue', 'paused', 'transition'].includes(scene);
  if (worldVisible) drawWorld();
  else drawBackdrop();
  for (const particle of particles) if (particle.screen) drawParticle(particle);
}

function frame(time) {
  const rawDt = Math.min(.034, (time - last) / 1000 || 0);
  last = time;
  update(rawDt);
  draw();
  requestAnimationFrame(frame);
}

function setAction(action, down) {
  if (!(action in input)) return;
  if (down && !input[action] && (action === 'jump' || action === 'shoot')) input[`${action}Press`] = true;
  input[action] = down;
}

const keyMap = {
  ArrowLeft: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', d: 'right', D: 'right',
  ' ': 'jump', ArrowUp: 'jump', w: 'jump', W: 'jump',
  j: 'shoot', J: 'shoot',
};

addEventListener('keydown', (event) => {
  if (event.key === 'Escape' || event.key === 'p' || event.key === 'P') {
    if (scene === 'play' || scene === 'paused') {
      event.preventDefault();
      togglePause();
    }
    return;
  }
  if (scene === 'tutorial' && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    startTutorialLevel();
    return;
  }
  if (scene === 'levelIntro' && event.key === 'Enter') {
    event.preventDefault();
    beginLevel();
    return;
  }
  if (scene === 'victory' && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    showRewardDialogue();
    return;
  }
  if (scene === 'dialogue') {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      advanceDialogue();
    } else if (event.key === 'ArrowLeft' || event.key === 'Backspace') {
      event.preventDefault();
      previousDialogue();
    }
    return;
  }
  if (scene === 'story') {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      nextStory();
    } else if (event.key === 'ArrowLeft' || event.key === 'Backspace') {
      event.preventDefault();
      previousStory();
    }
    return;
  }
  const action = keyMap[event.key];
  if (action && scene === 'play') {
    event.preventDefault();
    setAction(action, true);
  }
});

addEventListener('keyup', (event) => {
  const action = keyMap[event.key];
  if (action) {
    event.preventDefault();
    setAction(action, false);
  }
});

addEventListener('blur', clearActions);

document.querySelectorAll('.touch-button[data-action]').forEach((button) => {
  const release = (event) => {
    const action = pointerActions.get(event.pointerId);
    if (!action) return;
    pointerActions.delete(event.pointerId);
    if (![...pointerActions.values()].includes(action)) setAction(action, false);
    button.classList.remove('pressed');
  };
  button.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    unlockAudio();
    const action = button.dataset.action;
    pointerActions.set(event.pointerId, action);
    button.setPointerCapture?.(event.pointerId);
    button.classList.add('pressed');
    setAction(action, true);
  });
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', release);
});

function handleOrientation() {
  if (portraitPhone.matches) {
    clearActions();
    if (scene === 'play') pauseGame();
    document.querySelector('.game-card')?.setAttribute('aria-hidden', 'true');
  } else document.querySelector('.game-card')?.removeAttribute('aria-hidden');
  syncChrome();
}
portraitPhone.addEventListener?.('change', handleOrientation);
coarsePointer.addEventListener?.('change', syncChrome);
compactLandscape.addEventListener?.('change', syncChrome);

document.querySelector('#startButton').addEventListener('click', () => { unlockAudio(); storyStart(); });
document.querySelector('#continueButton').addEventListener('click', () => {
  unlockAudio();
  rescuedNames = new Set(priorRescueNames(saveData.highestUnlockedAct));
  showLevelIntro(saveData.highestUnlockedAct);
});
document.querySelector('#skipStory').addEventListener('click', () => {
  unlockAudio();
  saveData.storySeen = true;
  persistSave();
  showLevelIntro(0);
});
document.querySelector('#previousStory').addEventListener('click', previousStory);
document.querySelector('#nextStory').addEventListener('click', nextStory);
document.querySelector('#levelBack').addEventListener('click', returnToStory);
document.querySelector('#levelButton').addEventListener('click', beginLevel);
document.querySelector('#tutorialBack').addEventListener('click', () => {
  tutorialShown = false;
  showLevelIntro(0);
});
document.querySelector('#tutorialButton').addEventListener('click', startTutorialLevel);
document.querySelector('#dialogueBack').addEventListener('click', previousDialogue);
document.querySelector('#dialogueNext').addEventListener('click', advanceDialogue);
ui.dialogueReview.addEventListener('click', reviewDialogue);
document.querySelector('#pauseButton').addEventListener('click', pauseGame);
document.querySelector('#resumeGame').addEventListener('click', resumeGame);
document.querySelector('#restartAct').addEventListener('click', restartCurrentAct);
document.querySelector('#returnTitle').addEventListener('click', () => {
  hide(ui.pauseScreen);
  duckMusic(false);
  showTitle();
});
document.querySelector('#victoryButton').addEventListener('click', showRewardDialogue);
document.querySelector('#playAgain').addEventListener('click', () => {
  saveData = {highestUnlockedAct: 0, storySeen: false, muted, completed: false};
  persistSave();
  location.reload();
});
document.querySelector('#muteButton').addEventListener('click', (event) => {
  unlockAudio();
  muted = !muted;
  saveData.muted = muted;
  persistSave();
  backgroundMusic.muted = muted;
  event.currentTarget.classList.toggle('muted', muted);
  event.currentTarget.setAttribute('aria-pressed', String(muted));
  event.currentTarget.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound');
  say(muted ? 'Sound muted' : 'Sound on');
});
ui.retryLoad.addEventListener('click', loadAssets);
document.querySelector('#giftLink').href = GIFT_LINK;

function fetchImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(file));
    image.src = ASSET_ROOT + file;
  });
}

async function loadAssets() {
  setScene('loading');
  show(ui.loadingScreen);
  hide(ui.titleScreen);
  hide(ui.retryLoad);
  ui.loadingStatus.textContent = 'WARMING THE OVENS...';
  try {
    const entries = Object.entries(ASSET_FILES);
    let loaded = 0;
    await Promise.all(entries.map(async ([key, file]) => {
      images[key] = await fetchImage(file);
      loaded += 1;
      ui.loadingStatus.textContent = `BAKING PIXELS ${loaded} / ${entries.length}`;
    }));
    hide(ui.loadingScreen);
    drawChromeSprites();
    showTitle();
    handleOrientation();
  } catch (error) {
    console.error('Required pixel-art asset failed to load:', error.message);
    ui.loadingStatus.textContent = 'A SPRITE FELL OFF THE TRAY. CHECK YOUR CONNECTION AND RETRY.';
    show(ui.retryLoad);
  }
}

backgroundMusic.src = MUSIC_FILE;
backgroundMusic.volume = .28;
backgroundMusic.muted = muted;
updateTitleButtons();
handleOrientation();
requestAnimationFrame(frame);
loadAssets();
