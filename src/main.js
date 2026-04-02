const STORAGE_KEYS = {
  nickname: "paper-plane-nickname",
  personalRuns: "paper-plane-personal-runs",
  globalBoard: "paper-plane-global-board",
};

const papers = [
  {
    id: "default",
    name: "普通打印纸",
    description: "均衡稳定，适合新手和稳定发挥。",
    stats: { speed: 58, lift: 56, stability: 58, weight: 55, drag: 50 },
    theme: "#f6efe2",
  },
  {
    id: "light",
    name: "轻薄笔记纸",
    description: "滑翔更远，但更容易被风影响。",
    stats: { speed: 48, lift: 72, stability: 42, weight: 38, drag: 57 },
    theme: "#f9f4ea",
  },
  {
    id: "card",
    name: "硬质卡纸",
    description: "起步更快更稳，但中后段滑翔较弱。",
    stats: { speed: 72, lift: 42, stability: 72, weight: 74, drag: 42 },
    theme: "#ece4d8",
  },
];

const parameters = [
  {
    key: "crease",
    name: "对折定骨架",
    description: "先把骨架压稳，过松会发飘，过紧会损失一点滑翔空间。",
    value: 54,
  },
  {
    key: "nose",
    name: "机头尖锐度",
    description: "头更尖，飞得更快，但俯冲风险会上升。",
    value: 62,
  },
  {
    key: "wing",
    name: "机翼宽度",
    description: "翼更宽，升力更强，但中段更容易飘。",
    value: 54,
  },
  {
    key: "tail",
    name: "尾翼上翘角度",
    description: "决定抬头还是下坠，过高会有失速风险。",
    value: 48,
  },
];

const FOLD_STEPS = [
  {
    key: "crease",
    eyebrow: "第一步",
    title: "对折定骨架",
    tipTitle: "先把纸对折",
    tipBody: "把骨架压稳，后面的机头和机翼才会更听话。",
    stageOutcome: "骨架平稳，后续折叠更顺手",
    description:
      "先把纸对折，打好骨架。折得越工整，飞起来越稳；压得太死则会损失一点滑翔空间。",
    minLabel: "松折",
    maxLabel: "压实",
    choices: [
      { label: "松折", value: 28 },
      { label: "工整对折", value: 54 },
      { label: "压实折痕", value: 82 },
    ],
    getValueText(value) {
      if (value < 40) return "松折";
      if (value < 70) return "工整对折";
      return "压实折痕";
    },
    getOutcome(value) {
      if (value < 40) return "骨架偏松，更容易在气流里发飘";
      if (value < 70) return "骨架均衡，后续折叠和放飞都更稳";
      return "骨架很紧实，但会吃掉一点滑翔延展";
    },
  },
  {
    key: "nose",
    eyebrow: "第二步",
    title: "折机头",
    tipTitle: "把机头折出来",
    tipBody: "机头越长越尖，起飞越猛，但也更容易往下扎。",
    stageOutcome: "机头决定起飞速度和俯冲倾向",
    description: "把机头折出来。头越尖越快，越长越猛，但前段更容易俯冲，容错也会下降。",
    minLabel: "短头",
    maxLabel: "长尖头",
    choices: [
      { label: "短头", value: 30 },
      { label: "标准", value: 60 },
      { label: "长尖头", value: 84 },
    ],
    getValueText(value) {
      if (value < 42) return "短机头";
      if (value < 72) return "标准机头";
      return "长尖机头";
    },
    getOutcome(value) {
      if (value < 42) return "起步会更柔和，整体更容易控";
      if (value < 72) return "起飞和稳定比较均衡，适合大多数尝试";
      return "前段冲得更猛，但俯冲和失控风险更高";
    },
  },
  {
    key: "wing",
    eyebrow: "第三步",
    title: "折机翼",
    tipTitle: "把机翼拉开",
    tipBody: "翼面越宽越能飘，但中段更容易被风带着晃。",
    stageOutcome: "机翼决定滑翔距离和抗风表现",
    description: "机翼决定它能不能滑起来。越宽越能飘，但阻力更大，中段也更容易吃风。",
    minLabel: "窄翼",
    maxLabel: "宽翼",
    choices: [
      { label: "窄翼", value: 28 },
      { label: "均衡翼", value: 54 },
      { label: "宽翼", value: 82 },
    ],
    getValueText(value) {
      if (value < 40) return "窄翼";
      if (value < 70) return "均衡翼";
      return "宽翼";
    },
    getOutcome(value) {
      if (value < 40) return "更利于快速穿出去，但滑翔会偏短";
      if (value < 70) return "升力和速度较平衡，稳定刷分更舒服";
      return "更能飘更能挂空，但中段更容易吃风";
    },
  },
  {
    key: "tail",
    eyebrow: "第四步",
    title: "调尾翼",
    tipTitle: "最后调尾翼",
    tipBody: "尾翼太高容易抬头过猛，中段可能直接失速。",
    stageOutcome: "尾翼决定抬头、平飞还是提前下坠",
    description: "最后微调尾翼，让飞机决定是平飞、抬头，还是提前下坠。中等幅度通常最稳。",
    minLabel: "平尾",
    maxLabel: "上翘",
    choices: [
      { label: "平尾", value: 24 },
      { label: "轻翘", value: 48 },
      { label: "上翘", value: 78 },
    ],
    getValueText(value) {
      if (value < 35) return "平尾";
      if (value < 65) return "轻翘尾翼";
      return "上翘尾翼";
    },
    getOutcome(value) {
      if (value < 35) return "更容易贴着前段平飞，但下坠也会更快";
      if (value < 65) return "抬头和滑翔较均衡，比较容易飞出完整航线";
      return "更容易抬头滑翔，但中段有明显失速风险";
    },
  },
];

const seededLeaderboard = [
  { nickname: "纸翼学霸", distance: 124.7, paper: "轻薄笔记纸", createdAt: "2026-03-28 12:40", source: "seed" },
  { nickname: "风洞老手", distance: 118.3, paper: "硬质卡纸", createdAt: "2026-03-30 18:12", source: "seed" },
  { nickname: "午休投手", distance: 113.5, paper: "普通打印纸", createdAt: "2026-03-27 09:08", source: "seed" },
  { nickname: "教室冠军", distance: 109.9, paper: "轻薄笔记纸", createdAt: "2026-03-25 16:48", source: "seed" },
  { nickname: "极限折法", distance: 107.4, paper: "硬质卡纸", createdAt: "2026-03-29 14:31", source: "seed" },
  { nickname: "角度大师", distance: 101.2, paper: "普通打印纸", createdAt: "2026-03-31 11:55", source: "seed" },
];

const DISTANCE_SCALE = 34;
const HEIGHT_SCALE = 40;
const SIMULATION_SPEED = 0.42;
const LAUNCH_X = 42;
const WORLD_WIDTH = 4200;
const CAMERA_MIN_Y = -260;
const MUSIC_VOLUME = 0.12;
const MUSIC_TRACKS = {
  builder: "./1.mp3",
  launch: "./2.mp3",
};

const state = {
  selectedPaperId: "default",
  parameters: Object.fromEntries(parameters.map((item) => [item.key, item.value])),
  stats: null,
  throwState: {
    active: false,
    power: 0,
    angle: 28,
    stabilityLabel: "未释放",
    releaseScore: 0,
    startY: 0,
    startX: 0,
    originX: 0,
    originY: 0,
    aimX: 0,
    aimY: 0,
    meterDirection: 1,
    meterRaf: null,
  },
  sim: {
    running: false,
    frame: null,
    points: [],
    current: null,
    maxDistance: 0,
    maxHeight: 0,
    windText: "平稳",
    turbulence: 0,
  },
  personalRuns: loadPersonalRuns(),
  globalBoard: loadGlobalBoard(),
  activeBoard: "global",
  activeWorkspace: "builder",
  activeFoldStep: 0,
  audioEnabled: false,
  currentMusicKey: "",
  lastRun: null,
};

const refs = {};

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheRefs();
  initBackgroundMusic();
  renderPaperOptions();
  renderFoldSteps();
  bindEvents();
  loadNickname();
  recalcStats();
  renderAll();
  drawIdleScene();
}

function cacheRefs() {
  refs.nicknameInput = document.getElementById("nicknameInput");
  refs.paperOptions = document.getElementById("paperOptions");
  refs.foldSteps = document.getElementById("foldSteps");
  refs.stepTipTitle = document.getElementById("stepTipTitle");
  refs.stepTipBody = document.getElementById("stepTipBody");
  refs.currentStepEyebrow = document.getElementById("currentStepEyebrow");
  refs.currentStepTitle = document.getElementById("currentStepTitle");
  refs.currentStepValue = document.getElementById("currentStepValue");
  refs.currentStepOutcome = document.getElementById("currentStepOutcome");
  refs.foldWorkbench = document.getElementById("foldWorkbench");
  refs.foldPlanePreview = document.getElementById("foldPlanePreview");
  refs.currentStepName = document.getElementById("currentStepName");
  refs.currentStepDescription = document.getElementById("currentStepDescription");
  refs.currentStepChoices = document.getElementById("currentStepChoices");
  refs.stepRangeInput = document.getElementById("stepRangeInput");
  refs.stepRangeReadout = document.getElementById("stepRangeReadout");
  refs.stepRangeMin = document.getElementById("stepRangeMin");
  refs.stepRangeMax = document.getElementById("stepRangeMax");
  refs.prevStepBtn = document.getElementById("prevStepBtn");
  refs.nextStepBtn = document.getElementById("nextStepBtn");
  refs.statBars = document.getElementById("statBars");
  refs.trendSummary = document.getElementById("trendSummary");
  refs.buildAdvice = document.getElementById("buildAdvice");
  refs.bestDistance = document.getElementById("bestDistance");
  refs.lastDistance = document.getElementById("lastDistance");
  refs.favoritePaper = document.getElementById("favoritePaper");
  refs.planePreview = document.getElementById("planePreview");
  refs.liveDistance = document.getElementById("liveDistance");
  refs.liveHeight = document.getElementById("liveHeight");
  refs.windReadout = document.getElementById("windReadout");
  refs.powerReadout = document.getElementById("powerReadout");
  refs.angleReadout = document.getElementById("angleReadout");
  refs.releaseReadout = document.getElementById("releaseReadout");
  refs.powerMeter = document.getElementById("powerMeter");
  refs.launchPad = document.getElementById("launchPad");
  refs.aimLine = document.getElementById("aimLine");
  refs.aimTip = document.getElementById("aimTip");
  refs.throwHint = document.getElementById("throwHint");
  refs.resultDistance = document.getElementById("resultDistance");
  refs.resultSummary = document.getElementById("resultSummary");
  refs.resultTags = document.getElementById("resultTags");
  refs.resultModal = document.getElementById("resultModal");
  refs.resultModalDistance = document.getElementById("resultModalDistance");
  refs.resultModalSummary = document.getElementById("resultModalSummary");
  refs.modalRetryBtn = document.getElementById("modalRetryBtn");
  refs.modalTuneBtn = document.getElementById("modalTuneBtn");
  refs.globalTab = document.getElementById("globalTab");
  refs.personalTab = document.getElementById("personalTab");
  refs.globalBoard = document.getElementById("globalBoard");
  refs.personalBoard = document.getElementById("personalBoard");
  refs.builderPage = document.getElementById("builderPage");
  refs.launchPage = document.getElementById("launchPage");
  refs.goLaunchBtn = document.getElementById("goLaunchBtn");
  refs.goBuilderBtn = document.getElementById("goBuilderBtn");
  refs.launchBuildSummary = document.getElementById("launchBuildSummary");
  refs.introOverlay = document.getElementById("introOverlay");
  refs.landingScreen = document.getElementById("landingScreen");
  refs.gameScreen = document.getElementById("gameScreen");
  refs.startGameBtn = document.getElementById("startGameBtn");
  refs.canvas = document.getElementById("flightCanvas");
  refs.ctx = refs.canvas.getContext("2d");
}

function initBackgroundMusic() {
  refs.musicPlayers = {
    builder: createMusicPlayer(MUSIC_TRACKS.builder),
    launch: createMusicPlayer(MUSIC_TRACKS.launch),
  };

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseAllMusic();
      return;
    }
    if (state.audioEnabled) {
      syncBackgroundMusic();
    }
  });
}

function createMusicPlayer(src) {
  const audio = new Audio(src);
  audio.preload = "auto";
  audio.loop = true;
  audio.volume = MUSIC_VOLUME;
  return audio;
}

function bindEvents() {
  refs.startGameBtn.addEventListener("click", startGame);
  refs.goLaunchBtn.addEventListener("click", () => switchWorkspace("launch"));
  refs.goBuilderBtn.addEventListener("click", () => switchWorkspace("builder"));
  refs.nicknameInput.addEventListener("change", handleNicknameChange);
  refs.prevStepBtn.addEventListener("click", () => changeFoldStep(-1));
  refs.nextStepBtn.addEventListener("click", () => changeFoldStep(1));
  refs.stepRangeInput.addEventListener("input", handleCurrentStepInput);
  refs.modalRetryBtn.addEventListener("click", retryFromModal);
  refs.modalTuneBtn.addEventListener("click", tuneFromModal);
  refs.globalTab.addEventListener("click", () => switchBoard("global"));
  refs.personalTab.addEventListener("click", () => switchBoard("personal"));

  refs.launchPad.addEventListener("pointerdown", onLaunchStart);
  refs.launchPad.addEventListener("pointermove", onLaunchMove);
  refs.launchPad.addEventListener("pointerup", onLaunchEnd);
  refs.launchPad.addEventListener("pointercancel", cancelLaunch);
  refs.launchPad.addEventListener("pointerleave", (event) => {
    if (state.throwState.active && event.buttons === 0) {
      onLaunchEnd(event);
    }
  });
}

function startGame() {
  refs.landingScreen.classList.add("hidden");
  refs.gameScreen.classList.remove("hidden");
  state.audioEnabled = true;
  hideResultModal();
  switchWorkspace("builder");
  syncBackgroundMusic();
  drawIdleScene();
}

function switchWorkspace(nextWorkspace) {
  state.activeWorkspace = nextWorkspace;
  refs.builderPage.classList.toggle("hidden", nextWorkspace !== "builder");
  refs.launchPage.classList.toggle("hidden", nextWorkspace !== "launch");
  if (nextWorkspace !== "launch") {
    hideResultModal();
  }
  if (nextWorkspace === "launch") {
    drawIdleScene();
  }
  syncBackgroundMusic();
}

function loadNickname() {
  const saved = localStorage.getItem(STORAGE_KEYS.nickname) || "";
  refs.nicknameInput.value = saved;
}

function handleNicknameChange() {
  const value = refs.nicknameInput.value.trim();
  localStorage.setItem(STORAGE_KEYS.nickname, value);
}

function loadPersonalRuns() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.personalRuns) || "[]");
  } catch {
    return [];
  }
}

function loadGlobalBoard() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.globalBoard) || "null");
    return Array.isArray(saved) && saved.length > 0 ? saved : seededLeaderboard.slice();
  } catch {
    return seededLeaderboard.slice();
  }
}

function savePersonalRuns() {
  localStorage.setItem(STORAGE_KEYS.personalRuns, JSON.stringify(state.personalRuns));
}

function saveGlobalBoard() {
  localStorage.setItem(STORAGE_KEYS.globalBoard, JSON.stringify(state.globalBoard));
}

function renderPaperOptions() {
  refs.paperOptions.innerHTML = papers
    .map(
      (paper) => `
        <button class="paper-option ${paper.id === state.selectedPaperId ? "active" : ""}" data-paper-id="${paper.id}" type="button">
          <strong>${paper.name}</strong>
          <p>${paper.description}</p>
          <small>速度 ${paper.stats.speed} / 升力 ${paper.stats.lift} / 稳定 ${paper.stats.stability}</small>
        </button>
      `
    )
    .join("");

  refs.paperOptions.querySelectorAll("[data-paper-id]").forEach((element) => {
    element.addEventListener("click", () => {
      state.selectedPaperId = element.dataset.paperId;
      recalcStats();
      renderAll();
      drawIdleScene();
    });
  });
}

function renderFoldSteps() {
  refs.foldSteps.innerHTML = FOLD_STEPS.map((step, index) => {
    const isActive = state.activeFoldStep === index;
    const isCompleted = state.activeFoldStep > index;
    const valueText = step.getValueText(state.parameters[step.key]);
    return `
      <button class="fold-step fold-step-button ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}" data-step-index="${index}" type="button">
        <span>${index + 1}</span>
        <div>
          <strong>${step.title}</strong>
          <p>${valueText}</p>
        </div>
      </button>
    `;
  }).join("");

  refs.foldSteps.querySelectorAll("[data-step-index]").forEach((element) => {
    element.addEventListener("click", () => {
      state.activeFoldStep = Number(element.dataset.stepIndex);
      renderAll();
    });
  });
}

function handleCurrentStepInput() {
  const step = getCurrentFoldStep();
  state.parameters[step.key] = Number(refs.stepRangeInput.value);
  recalcStats();
  renderAll();
  drawIdleScene();
}

function changeFoldStep(direction) {
  const next = clamp(state.activeFoldStep + direction, 0, FOLD_STEPS.length - 1);
  if (next === state.activeFoldStep) return;
  state.activeFoldStep = next;
  renderAll();
}

function renderCurrentStepControls() {
  const step = getCurrentFoldStep();
  const value = state.parameters[step.key];
  refs.currentStepEyebrow.textContent = step.eyebrow;
  refs.currentStepTitle.textContent = step.title;
  refs.currentStepName.textContent = step.title;
  refs.currentStepValue.textContent = step.getValueText(value);
  refs.currentStepOutcome.textContent = step.getOutcome(value);
  refs.currentStepDescription.textContent = step.description;
  refs.stepTipTitle.textContent = step.tipTitle;
  refs.stepTipBody.textContent = step.tipBody;
  refs.stepRangeReadout.textContent = step.getValueText(value);
  refs.stepRangeInput.value = String(value);
  refs.stepRangeMin.textContent = step.minLabel;
  refs.stepRangeMax.textContent = step.maxLabel;
  refs.prevStepBtn.disabled = state.activeFoldStep === 0;
  refs.nextStepBtn.disabled = state.activeFoldStep === FOLD_STEPS.length - 1;
  refs.nextStepBtn.textContent = state.activeFoldStep === FOLD_STEPS.length - 1 ? "最后一步" : "下一步";

  refs.currentStepChoices.innerHTML = step.choices
    .map((choice) => {
      const active = Math.abs(value - choice.value) <= 12 ? "active" : "";
      return `<button class="step-choice ${active}" data-choice-value="${choice.value}" type="button">${choice.label}</button>`;
    })
    .join("");

  refs.currentStepChoices.querySelectorAll("[data-choice-value]").forEach((button) => {
    button.addEventListener("click", () => {
      state.parameters[step.key] = Number(button.dataset.choiceValue);
      recalcStats();
      renderAll();
      drawIdleScene();
    });
  });
}

function getCurrentFoldStep() {
  return FOLD_STEPS[state.activeFoldStep] || FOLD_STEPS[0];
}

function recalcStats() {
  const paper = getSelectedPaper();
  const { crease, nose, wing, tail } = state.parameters;
  const wingBalance = clamp(18 - Math.abs(54 - wing) * 0.36, 0, 18);
  const creaseBalance = clamp(16 - Math.abs(56 - crease) * 0.28, 0, 16);
  const creaseTension = Math.max(0, crease - 72);

  const stats = {
    speed: clamp(paper.stats.speed + nose * 0.26 - wing * 0.14 - tail * 0.03 + creaseBalance * 0.08, 20, 100),
    lift: clamp(
      paper.stats.lift + wing * 0.24 + tail * 0.1 - paper.stats.weight * 0.08 + wingBalance * 0.14 - creaseTension * 0.1,
      16,
      100
    ),
    stability: clamp(
      paper.stats.stability + wingBalance - nose * 0.12 + tail * 0.04 - Math.abs(50 - wing) * 0.18 + creaseBalance * 1.1,
      12,
      100
    ),
    weight: clamp(paper.stats.weight + nose * 0.05 + (100 - wing) * 0.04 + crease * 0.025, 20, 95),
    drag: clamp(paper.stats.drag + wing * 0.18 - nose * 0.12 + tail * 0.05, 10, 100),
  };

  stats.glide = clamp((stats.lift * 0.58 + stats.stability * 0.42) - stats.weight * 0.16, 10, 100);
  stats.risk = clamp((nose * 0.55 + Math.max(0, tail - 58) * 0.8 + Math.abs(50 - wing) * 0.4) / 2, 0, 100);
  state.stats = stats;
}

function renderAll() {
  renderPaperOptions();
  renderFoldSteps();
  renderCurrentStepControls();
  renderFoldWorkbench();
  renderStatBars();
  renderTrendSummary();
  renderBuildAdvice();
  renderHeroStats();
  renderPlanePreview();
  renderLaunchBuildSummary();
  renderBoards();
  renderResultSummary(state.lastRun);
  refs.angleReadout.textContent = `${Math.round(state.throwState.angle)}°`;
  refs.powerReadout.textContent = `${Math.round(state.throwState.power)}%`;
  refs.releaseReadout.textContent = state.throwState.stabilityLabel;
  refs.powerMeter.style.width = `${state.throwState.power}%`;
}

function renderLaunchBuildSummary() {
  const paper = getSelectedPaper();
  const descriptors = {
    crease: `骨架：${FOLD_STEPS[0].getValueText(state.parameters.crease)}`,
    nose: `机头：${FOLD_STEPS[1].getValueText(state.parameters.nose)}`,
    wing: `机翼：${FOLD_STEPS[2].getValueText(state.parameters.wing)}`,
    tail: `尾翼：${FOLD_STEPS[3].getValueText(state.parameters.tail)}`,
  };
  refs.launchBuildSummary.innerHTML = `
    <div class="summary-chip">
      <span>当前纸张</span>
      <strong>${paper.name}</strong>
    </div>
    <div class="summary-chip">
      <span>折法摘要</span>
      <strong>${descriptors.crease}</strong>
    </div>
    <div class="summary-chip">
      <span>机头 / 机翼</span>
      <strong>${descriptors.nose} / ${descriptors.wing}</strong>
    </div>
    <div class="summary-chip">
      <span>尾翼 / 建议</span>
      <strong>${descriptors.tail}，准备好后直接在中间飞行区完成发射。</strong>
    </div>
  `;
}

function syncBackgroundMusic() {
  if (!state.audioEnabled || !refs.musicPlayers) return;
  const targetKey = state.activeWorkspace === "launch" ? "launch" : "builder";
  const currentPlayer = refs.musicPlayers[targetKey];
  if (state.currentMusicKey === targetKey && currentPlayer && !currentPlayer.paused && !document.hidden) return;

  pauseAllMusic(targetKey);
  state.currentMusicKey = targetKey;

  const player = refs.musicPlayers[targetKey];
  if (!player) return;
  player.volume = MUSIC_VOLUME;
  if (document.hidden) return;
  safePlayAudio(player);
}

function pauseAllMusic(exceptKey = "") {
  if (!refs.musicPlayers) return;
  Object.entries(refs.musicPlayers).forEach(([key, player]) => {
    if (!player || key === exceptKey) return;
    player.pause();
  });
}

function safePlayAudio(player) {
  const playPromise = player.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {
      // Ignore autoplay/device playback restrictions.
    });
  }
}

function renderStatBars() {
  const statNames = {
    speed: "初速度",
    lift: "升力",
    stability: "稳定性",
    weight: "重量",
    drag: "阻力",
    glide: "滑翔",
    risk: "风险",
  };

  refs.statBars.innerHTML = Object.entries(statNames)
    .map(([key, name]) => {
      const value = Math.round(state.stats[key]);
      return `
        <div class="stat-row">
          <span>${name}</span>
          <div class="stat-track">
            <div class="stat-fill" style="width:${value}%"></div>
          </div>
          <strong>${value}</strong>
        </div>
      `;
    })
    .join("");
}

function renderTrendSummary() {
  const trends = [
    {
      label: "起飞速度",
      value: state.stats.speed,
      text: getTrendLabel(state.stats.speed, ["偏柔和", "比较顺", "偏快", "很猛"]),
    },
    {
      label: "滑翔能力",
      value: state.stats.glide,
      text: getTrendLabel(state.stats.glide, ["偏短", "均衡", "偏强", "很能飘"]),
    },
    {
      label: "飞行稳定",
      value: state.stats.stability,
      text: getTrendLabel(state.stats.stability, ["易晃动", "一般", "比较稳", "很稳"]),
    },
    {
      label: "风险等级",
      value: state.stats.risk,
      text: getTrendLabel(100 - state.stats.risk, ["偏高", "有波动", "可控", "很低"]),
    },
  ];

  refs.trendSummary.innerHTML = trends
    .map(
      (trend) => `
        <div class="trend-card">
          <span>${trend.label}</span>
          <strong>${trend.text}</strong>
          <small>${Math.round(trend.value)} / 100</small>
        </div>
      `
    )
    .join("");
}

function renderBuildAdvice() {
  refs.buildAdvice.textContent = getBuildAdvice();
}

function renderHeroStats() {
  const best = getBestRun()?.distance ?? 0;
  const last = state.personalRuns[0]?.distance ?? 0;
  refs.bestDistance.textContent = `${best.toFixed(1)} m`;
  refs.lastDistance.textContent = last > 0 ? `${last.toFixed(1)} m` : "-";
  refs.favoritePaper.textContent = getFavoritePaper();
}

function renderPlanePreview() {
  updatePlaneNode(refs.planePreview, false);
  updatePlaneNode(refs.foldPlanePreview, true);
}

function updatePlaneNode(root, isWorkbench) {
  if (!root) return;
  const paper = getSelectedPaper();
  const { crease, nose, wing, tail } = state.parameters;
  const body = root.querySelector(".plane-body");
  const leftWing = root.querySelector(".plane-wing.left");
  const rightWing = root.querySelector(".plane-wing.right");
  const tailWing = root.querySelector(".plane-tail");
  if (!body || !leftWing || !rightWing || !tailWing) return;

  root.style.setProperty("--plane-paper", paper.theme);
  root.style.setProperty("--plane-shadow", isWorkbench ? "0 28px 34px rgba(42, 33, 21, 0.2)" : "0 16px 24px rgba(28, 38, 55, 0.14)");
  body.style.transform = `translateX(-50%) rotate(${12 + nose / 9}deg) scaleY(${0.9 + nose / 260})`;
  body.style.height = `${112 + crease * 0.08}px`;
  leftWing.style.width = `${66 + wing}px`;
  rightWing.style.width = `${66 + wing}px`;
  leftWing.style.transform = `translateX(-100%) rotate(${-8 - tail / 9}deg)`;
  rightWing.style.transform = `rotate(${8 + tail / 9}deg)`;
  tailWing.style.top = `${100 - tail / 6}px`;
}

function renderFoldWorkbench() {
  const paper = getSelectedPaper();
  const step = getCurrentFoldStep();
  const progress = (state.activeFoldStep + 1) / FOLD_STEPS.length;
  refs.foldWorkbench.dataset.step = step.key;
  refs.foldWorkbench.style.setProperty("--paper-tone", paper.theme);
  refs.foldWorkbench.style.setProperty("--fold-progress", progress.toFixed(2));
  refs.foldWorkbench.style.setProperty("--crease-value", (state.parameters.crease / 100).toFixed(2));
  refs.foldWorkbench.style.setProperty("--nose-value", (state.parameters.nose / 100).toFixed(2));
  refs.foldWorkbench.style.setProperty("--wing-value", (state.parameters.wing / 100).toFixed(2));
  refs.foldWorkbench.style.setProperty("--tail-value", (state.parameters.tail / 100).toFixed(2));
}

function getTrendLabel(value, labels) {
  if (value < 28) return labels[0];
  if (value < 52) return labels[1];
  if (value < 76) return labels[2];
  return labels[3];
}

function getBuildAdvice() {
  const paper = getSelectedPaper();
  if (state.stats.risk > 72) return `这架 ${paper.name} 机型现在偏激进，建议放飞时别拉太高，争取把前段速度吃满。`;
  if (state.stats.glide > 76 && state.stats.stability < 54) return `这套折法很能飘，但中段也更容易吃风，放飞时更适合稳着送出去。`;
  if (state.stats.stability > 72) return `当前骨架和机翼比较稳，适合连续刷分，先用中等力度找一条稳定航线。`;
  if (state.parameters.tail > 68) return "尾翼偏高，适合给一点抬头空间，但不要把角度拉得太陡，不然容易中段失速。";
  return `这是一架偏均衡的 ${paper.name} 飞机，先用中高力度试飞，再围绕机头和尾翼做微调。`;
}

function getFavoritePaper() {
  if (!state.personalRuns.length) return getSelectedPaper().name;
  const counts = state.personalRuns.reduce((acc, run) => {
    acc[run.paper] = (acc[run.paper] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function getSelectedPaper() {
  return papers.find((paper) => paper.id === state.selectedPaperId) || papers[0];
}

function onLaunchStart(event) {
  if (state.sim.running) return;
  refs.introOverlay.classList.add("hidden");
  const rect = refs.launchPad.getBoundingClientRect();
  state.throwState.power = 0;
  state.throwState.active = true;
  state.throwState.startX = event.clientX;
  state.throwState.startY = event.clientY;
  state.throwState.originX = rect.width * 0.5;
  state.throwState.originY = rect.height - 34;
  state.throwState.aimX = state.throwState.originX + 90;
  state.throwState.aimY = state.throwState.originY - 48;
  state.throwState.angle = 28;
  state.throwState.stabilityLabel = "蓄力中";
  state.throwState.meterDirection = 1;
  refs.launchPad.classList.add("active");
  refs.throwHint.textContent = "拖向右上方调整角度，线越平越低，越陡越高";
  refs.launchPad.setPointerCapture(event.pointerId);
  updateAimVisual();
  startPowerLoop();
  renderAll();
}

function onLaunchMove(event) {
  if (!state.throwState.active) return;
  const rect = refs.launchPad.getBoundingClientRect();
  const localX = clamp(event.clientX - rect.left, state.throwState.originX, rect.width - 18);
  const localY = clamp(event.clientY - rect.top, 18, rect.height - 18);
  const dx = Math.max(0.001, localX - state.throwState.originX);
  const dy = Math.max(8, state.throwState.originY - localY);
  state.throwState.aimX = localX;
  state.throwState.aimY = localY;
  state.throwState.angle = clamp((Math.atan2(dy, dx) * 180) / Math.PI, 10, 90);
  updateAimVisual();
  refs.angleReadout.textContent = `${Math.round(state.throwState.angle)}°`;
}

function onLaunchEnd(event) {
  if (!state.throwState.active || state.sim.running) return;
  stopPowerLoop();
  refs.launchPad.classList.remove("active");
  refs.throwHint.textContent = "飞行中，观察距离、轨迹和风扰动";

  try {
    refs.launchPad.releasePointerCapture(event.pointerId);
  } catch {
    // Ignore pointer capture release errors.
  }

  const releaseScore = getReleaseScore(state.throwState.power);
  state.throwState.releaseScore = releaseScore;
  state.throwState.stabilityLabel = getReleaseLabel(releaseScore);
  refs.releaseReadout.textContent = state.throwState.stabilityLabel;
  state.throwState.active = false;
  hideAimVisual();
  startSimulation();
}

function cancelLaunch() {
  if (!state.throwState.active) return;
  stopPowerLoop();
  state.throwState.active = false;
  refs.launchPad.classList.remove("active");
  refs.throwHint.textContent = "按住开始蓄力，拖出一条向右上方的发射轨迹";
  hideAimVisual();
}

function updateAimVisual() {
  const dx = state.throwState.aimX - state.throwState.originX;
  const dy = state.throwState.aimY - state.throwState.originY;
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  refs.aimLine.style.opacity = "1";
  refs.aimLine.style.width = `${length}px`;
  refs.aimLine.style.left = `${state.throwState.originX}px`;
  refs.aimLine.style.bottom = `${refs.launchPad.clientHeight - state.throwState.originY}px`;
  refs.aimLine.style.transform = `rotate(${angle}rad)`;
  refs.aimTip.style.opacity = "1";
  refs.aimTip.style.left = `${state.throwState.aimX}px`;
  refs.aimTip.style.top = `${state.throwState.aimY}px`;
}

function hideAimVisual() {
  refs.aimLine.style.opacity = "0";
  refs.aimTip.style.opacity = "0";
}

function startPowerLoop() {
  cancelAnimationFrame(state.throwState.meterRaf);
  let lastTime = performance.now();
  const loop = (time) => {
    if (!state.throwState.active) return;
    const delta = Math.min(40, time - lastTime);
    lastTime = time;
    state.throwState.power += state.throwState.meterDirection * delta * 0.12;
    if (state.throwState.power >= 100) {
      state.throwState.power = 100;
      state.throwState.meterDirection = -1;
    } else if (state.throwState.power <= 0) {
      state.throwState.power = 0;
      state.throwState.meterDirection = 1;
    }
    refs.powerReadout.textContent = `${Math.round(state.throwState.power)}%`;
    refs.powerMeter.style.width = `${state.throwState.power}%`;
    state.throwState.meterRaf = requestAnimationFrame(loop);
  };
  state.throwState.meterRaf = requestAnimationFrame(loop);
}

function stopPowerLoop() {
  cancelAnimationFrame(state.throwState.meterRaf);
}

function getReleaseScore(power) {
  const sweetCenter = 66;
  const diff = Math.abs(power - sweetCenter);
  return clamp(100 - diff * 3.2, 0, 100);
}

function getReleaseLabel(score) {
  if (score >= 88) return "完美释放";
  if (score >= 66) return "稳定释放";
  if (score >= 38) return "略有晃动";
  return "失衡出手";
}

function startSimulation() {
  const paper = getSelectedPaper();
  const stats = state.stats;
  const powerFactor = state.throwState.power / 100;
  const angleRad = (state.throwState.angle * Math.PI) / 180;
  const releaseFactor = state.throwState.releaseScore / 100;

  const baseSpeed = 11 + stats.speed * 0.13 + powerFactor * 7.4;
  const launchStability = clamp((stats.stability * 0.7 + state.throwState.releaseScore * 0.55) / 125, 0.18, 1.08);
  const liftFactor = stats.lift / 100;
  const dragFactor = stats.drag / 100;
  const weightFactor = stats.weight / 100;
  const riskFactor = stats.risk / 100;
  const noseBias = state.parameters.nose / 100;
  const tailBias = state.parameters.tail / 100;

  state.sim.running = true;
  state.sim.points = [];
  state.sim.current = {
    x: LAUNCH_X,
    y: refs.canvas.height - 116,
    vx: baseSpeed * Math.cos(angleRad),
    vy: -baseSpeed * Math.sin(angleRad) * (0.82 + tailBias * 0.36),
    rotation: -state.throwState.angle / 1.8,
  };
  state.sim.maxDistance = 0;
  state.sim.maxHeight = 0;
  state.sim.turbulence = (1.16 - launchStability) * 0.42 + Math.abs(0.54 - stats.lift / 100) * 0.18 + Math.random() * 0.12;
  state.sim.windText = "平稳";
  state.sim.startTime = performance.now();
  state.sim.lastTime = performance.now();
  const groundY = getWorldGroundY();

  const frame = (time) => {
    if (!state.sim.running) return;
    const deltaSeconds = Math.min(0.032, (time - state.sim.lastTime) / 1000);
    state.sim.lastTime = time;

    const jet = state.sim.current;
    const elapsed = (time - state.sim.startTime) / 1000;
    const gust = Math.sin(elapsed * 2.2 + noseBias * 2.4) * state.sim.turbulence;
    const micro = Math.cos(elapsed * 4.9 + tailBias * 3.1) * state.sim.turbulence * 0.45;
    const turbulence = (gust + micro) * (1.1 - stats.stability / 125);

    const liftBoost = liftFactor * 19 + tailBias * 6 - weightFactor * 6;
    const gravity = 18 + weightFactor * 12 + riskFactor * 4;
    const drag = 0.3 + dragFactor * 0.6;

    jet.vx += (0.15 - drag * jet.vx * 0.012 - Math.max(0, riskFactor - 0.62) * 0.12) * deltaSeconds * 60 * SIMULATION_SPEED;
    jet.vy += (gravity - liftBoost - gust * 10) * deltaSeconds * SIMULATION_SPEED;
    jet.vx += turbulence * deltaSeconds * 26 * SIMULATION_SPEED;
    jet.vy += (Math.max(0, riskFactor - 0.58) * 18 - stats.stability / 38) * deltaSeconds * SIMULATION_SPEED;

    if (elapsed > 0.6 && tailBias > 0.68) {
      jet.vy += (tailBias - 0.68) * 36 * deltaSeconds * SIMULATION_SPEED;
    }

    if (elapsed < 0.65 && noseBias > 0.72) {
      jet.vy += noseBias * 14 * deltaSeconds * SIMULATION_SPEED;
    }

    jet.x += jet.vx * SIMULATION_SPEED;
    jet.y += jet.vy * SIMULATION_SPEED;
    jet.rotation = clamp(jet.rotation + (jet.vy * 0.06 + turbulence * 14), -48, 72);
    state.sim.points.push({ x: jet.x, y: jet.y });

    const distance = Math.max(0, (jet.x - LAUNCH_X) / DISTANCE_SCALE);
    const height = Math.max(0, (refs.canvas.height - 116 - jet.y) / HEIGHT_SCALE);
    state.sim.maxDistance = Math.max(state.sim.maxDistance, distance);
    state.sim.maxHeight = Math.max(state.sim.maxHeight, height);
    state.sim.windText = getWindText(Math.abs(gust));

    refs.liveDistance.textContent = `${distance.toFixed(1)} m`;
    refs.liveHeight.textContent = `${height.toFixed(1)} m`;
    refs.windReadout.textContent = state.sim.windText;
    drawScene(distance, height);

    if (jet.y >= groundY) {
      jet.y = groundY;
      finishSimulation(distance, {
        releaseFactor,
        launchStability,
        paper,
      });
      return;
    }

    state.sim.frame = requestAnimationFrame(frame);
  };

  state.sim.frame = requestAnimationFrame(frame);
}

function finishSimulation(distance, meta) {
  state.sim.running = false;
  cancelAnimationFrame(state.sim.frame);
  const finalDistance = Math.max(0, state.sim.maxDistance);
  const entry = buildResult(finalDistance, meta);
  state.lastRun = entry;
  state.personalRuns = [entry, ...state.personalRuns].slice(0, 20);
  savePersonalRuns();
  maybeUpdateGlobalBoard(entry);
  renderAll();
  refs.throwHint.textContent = "可以再试一局，或者调参后继续冲榜";
  refs.liveDistance.textContent = `${finalDistance.toFixed(1)} m`;
  refs.liveHeight.textContent = "0.0 m";
  refs.windReadout.textContent = state.sim.windText;
  drawScene(finalDistance, 0, true);
  showResultModal(entry);
}

function buildResult(distance, meta) {
  const reasons = getRunReasons(distance, meta.launchStability, meta.releaseFactor);
  const now = new Date();
  return {
    nickname: getNickname(),
    distance: Number(distance.toFixed(1)),
    paper: meta.paper.name,
    createdAt: formatDate(now),
    summary: buildResultSummary(distance, reasons),
    tags: reasons,
    stats: { ...state.stats },
    params: { ...state.parameters },
    throw: {
      power: Math.round(state.throwState.power),
      angle: Math.round(state.throwState.angle),
      release: state.throwState.stabilityLabel,
    },
  };
}

function maybeUpdateGlobalBoard(entry) {
  state.globalBoard = [...state.globalBoard, { ...entry, source: "local" }]
    .sort((a, b) => b.distance - a.distance)
    .slice(0, 12);
  saveGlobalBoard();
}

function buildResultSummary(distance, reasons) {
  const best = getBestRun()?.distance ?? 0;
  const lead = state.globalBoard[0]?.distance ?? 0;

  if (distance > lead) return "新纪录诞生，这一投已经超过当前总榜榜首。";
  if (distance > best) return `刷新个人最佳，距离榜首还差 ${(lead - distance).toFixed(1)} m。`;
  if (reasons.includes("失速明显")) return "这架飞机前段抬头不错，但尾翼过高导致中段失速。";
  if (reasons.includes("机体抖动")) return "这次出手稳定度一般，飞机在中段出现了明显抖动。";
  return "这把已经有不错雏形，再优化参数或释放时机还有明显提升空间。";
}

function getRunReasons(distance, launchStability, releaseFactor) {
  const reasons = [];
  if (distance >= 110) reasons.push("极限滑翔");
  if (state.parameters.tail > 72) reasons.push("失速明显");
  if (state.parameters.nose > 78 && state.parameters.tail < 42) reasons.push("前段俯冲");
  if (launchStability < 0.62 || state.stats.stability < 44) reasons.push("机体抖动");
  if (releaseFactor > 0.84) reasons.push("释放稳");
  if (state.stats.stability > 72) reasons.push("机体稳定");
  if (state.stats.lift > 78) reasons.push("滑翔表现强");
  return reasons.slice(0, 4);
}

function renderResultSummary(entry) {
  if (!entry) {
    refs.resultDistance.textContent = "0.0 m";
    refs.resultSummary.textContent = "调好参数后发射，看看这架纸飞机到底能飞多远。";
    refs.resultTags.innerHTML = [
      "头更尖，飞得更快",
      "翼更宽，飞得更久",
      "尾翼决定抬头与下坠",
      "释放时机越准越稳",
    ]
      .map((tag) => `<span class="result-tag">${tag}</span>`)
      .join("");
    return;
  }

  refs.resultDistance.textContent = `${entry.distance.toFixed(1)} m`;
  refs.resultSummary.textContent = entry.summary;
  refs.resultTags.innerHTML = entry.tags.map((tag) => `<span class="result-tag">${tag}</span>`).join("");
}

function showResultModal(entry) {
  refs.resultModalDistance.textContent = `${entry.distance.toFixed(1)} m`;
  refs.resultModalSummary.textContent = entry.summary;
  refs.resultModal.classList.remove("hidden");
}

function hideResultModal() {
  refs.resultModal.classList.add("hidden");
}

function retryFromModal() {
  hideResultModal();
  switchWorkspace("launch");
  resetForNextRun();
}

function tuneFromModal() {
  hideResultModal();
  resetForNextRun();
  switchWorkspace("builder");
}

function renderBoards() {
  renderGlobalBoard();
  renderPersonalBoard();
}

function renderGlobalBoard() {
  const rows = state.globalBoard
    .sort((a, b) => b.distance - a.distance)
    .map(
      (entry, index) => `
        <tr>
          <td class="${entry.nickname === getNickname() ? "board-highlight" : ""}">#${index + 1}</td>
          <td class="${entry.nickname === getNickname() ? "board-highlight" : ""}">${entry.nickname}</td>
          <td>${entry.distance.toFixed(1)} m</td>
          <td>${entry.paper}</td>
          <td>${entry.createdAt}</td>
        </tr>
      `
    )
    .join("");

  refs.globalBoard.innerHTML = `
    <table class="board-table">
      <thead>
        <tr>
          <th>排名</th>
          <th>玩家</th>
          <th>距离</th>
          <th>纸张</th>
          <th>时间</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderPersonalBoard() {
  if (!state.personalRuns.length) {
    refs.personalBoard.innerHTML = `<div class="board-empty">还没有历史记录，先飞一局看看你的起步成绩。</div>`;
    return;
  }

  const sortedRuns = getSortedPersonalRuns();
  const best = sortedRuns[0].distance;
  const avg = state.personalRuns.reduce((sum, run) => sum + run.distance, 0) / state.personalRuns.length;
  const recent = [...state.personalRuns].slice(0, 10);
  const rows = recent
    .map(
      (entry, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${entry.distance.toFixed(1)} m</td>
          <td>${entry.paper}</td>
          <td>${entry.throw.angle}° / ${entry.throw.power}%</td>
          <td>${entry.createdAt}</td>
        </tr>
      `
    )
    .join("");

  refs.personalBoard.innerHTML = `
    <div class="summary-strip">
      <div class="summary-item">
        <span>历史最佳</span>
        <strong>${best.toFixed(1)} m</strong>
      </div>
      <div class="summary-item">
        <span>最近 ${Math.min(10, state.personalRuns.length)} 次平均</span>
        <strong>${avg.toFixed(1)} m</strong>
      </div>
      <div class="summary-item">
        <span>最常用纸张</span>
        <strong>${getFavoritePaper()}</strong>
      </div>
    </div>
    <table class="board-table">
      <thead>
        <tr>
          <th>#</th>
          <th>距离</th>
          <th>纸张</th>
          <th>投掷</th>
          <th>时间</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function switchBoard(nextBoard) {
  state.activeBoard = nextBoard;
  refs.globalTab.classList.toggle("active", nextBoard === "global");
  refs.personalTab.classList.toggle("active", nextBoard === "personal");
  refs.globalBoard.classList.toggle("hidden", nextBoard !== "global");
  refs.personalBoard.classList.toggle("hidden", nextBoard !== "personal");
}

function resetForNextRun() {
  cancelAnimationFrame(state.sim.frame);
  state.sim.running = false;
  state.throwState.power = 0;
  state.throwState.angle = 28;
  state.throwState.stabilityLabel = "未释放";
  refs.powerMeter.style.width = "0%";
  refs.powerReadout.textContent = "0%";
  refs.angleReadout.textContent = "28°";
  refs.releaseReadout.textContent = "未释放";
  refs.throwHint.textContent = "按住开始蓄力，拖出一条向右上方的发射轨迹";
  refs.liveDistance.textContent = "0.0 m";
  refs.liveHeight.textContent = "0.0 m";
  refs.windReadout.textContent = "平稳";
  hideResultModal();
  hideAimVisual();
  drawIdleScene();
}

function getNickname() {
  return refs.nicknameInput.value.trim() || "匿名飞手";
}

function getSortedPersonalRuns() {
  return [...state.personalRuns].sort((a, b) => b.distance - a.distance);
}

function getBestRun() {
  return getSortedPersonalRuns()[0] || null;
}

function drawIdleScene() {
  const ctx = refs.ctx;
  ctx.clearRect(0, 0, refs.canvas.width, refs.canvas.height);
  const focusX = LAUNCH_X;
  const focusY = getWorldGroundY() - 24;
  const cameraX = getCameraX(focusX);
  const cameraY = getCameraY(focusY);
  drawBackdrop(ctx, cameraX, cameraY);
  drawDistanceMarkers(ctx, cameraX, cameraY, 0);
  drawRunway(ctx, cameraX, cameraY);
  drawPlane(ctx, focusX - cameraX, focusY - cameraY, -18, getSelectedPaper().theme, true);
}

function drawScene(distance, height, landed = false) {
  const ctx = refs.ctx;
  ctx.clearRect(0, 0, refs.canvas.width, refs.canvas.height);
  const jet = state.sim.current;
  const focusX = jet ? jet.x : LAUNCH_X;
  const focusY = jet ? jet.y : getWorldGroundY() - 24;
  const cameraX = getCameraX(focusX);
  const cameraY = getCameraY(focusY);
  drawBackdrop(ctx, cameraX, cameraY);
  drawDistanceMarkers(ctx, cameraX, cameraY, distance);
  drawRunway(ctx, cameraX, cameraY);

  if (state.sim.points.length > 1) {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    state.sim.points.forEach((point, index) => {
      const screenX = point.x - cameraX;
      const screenY = point.y - cameraY;
      if (index === 0) ctx.moveTo(screenX, screenY);
      else ctx.lineTo(screenX, screenY);
    });
    ctx.stroke();
    ctx.restore();
  }

  if (jet) {
    const planeY = landed ? getWorldGroundY() - cameraY - 2 : jet.y - cameraY;
    drawPlane(ctx, jet.x - cameraX, planeY, jet.rotation, getSelectedPaper().theme, true);
  }

  drawHudCloud(ctx, distance, height);
}

function getCameraX(focusX) {
  return focusX - refs.canvas.width * 0.5;
}

function getWorldGroundY() {
  return refs.canvas.height - 92;
}

function getCameraY(focusY) {
  return focusY - refs.canvas.height * 0.5;
}

function drawBackdrop(ctx, cameraX, cameraY) {
  const gradient = ctx.createLinearGradient(0, 0, 0, refs.canvas.height);
  gradient.addColorStop(0, "#bfe0f3");
  gradient.addColorStop(0.55, "#d8eef8");
  gradient.addColorStop(0.551, "#dce9c5");
  gradient.addColorStop(1, "#aac988");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, refs.canvas.width, refs.canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.38)";
  const parallax = cameraX * 0.18;
  const cloudLift = cameraY * 0.2;
  drawCloud(ctx, 120 - parallax, 98 - cloudLift, 58);
  drawCloud(ctx, 340 - parallax, 160 - cloudLift, 44);
  drawCloud(ctx, 840 - parallax, 124 - cloudLift, 68);
  drawCloud(ctx, 1040 - parallax, 212 - cloudLift, 52);
  drawCloud(ctx, 1440 - parallax, 120 - cloudLift, 48);
}

function drawRunway(ctx, cameraX, cameraY) {
  ctx.save();
  const groundY = getWorldGroundY() - cameraY;
  ctx.fillStyle = "#97bc72";
  ctx.fillRect(0, groundY - 28, refs.canvas.width, refs.canvas.height - groundY + 28);
  ctx.fillStyle = "rgba(53, 98, 56, 0.18)";
  const stripeOffset = -((cameraX * 0.35) % 70);
  for (let i = stripeOffset; i < refs.canvas.width + 70; i += 70) {
    ctx.fillRect(i, groundY, 26, 36);
  }
  ctx.fillStyle = "#d1b38c";
  ctx.fillRect(0, groundY + 18, refs.canvas.width, 12);
  ctx.restore();
}

function drawDistanceMarkers(ctx, cameraX, cameraY, distance) {
  ctx.save();
  ctx.strokeStyle = "rgba(47, 111, 161, 0.16)";
  ctx.fillStyle = "rgba(46, 36, 28, 0.52)";
  ctx.font = "18px Segoe UI";
  const groundY = getWorldGroundY() - cameraY;
  const maxMarker = Math.floor((WORLD_WIDTH - LAUNCH_X) / DISTANCE_SCALE / 10) * 10;
  for (let meters = 0; meters <= maxMarker; meters += 10) {
    const worldX = LAUNCH_X + meters * DISTANCE_SCALE;
    const x = worldX - cameraX;
    if (x < -80 || x > refs.canvas.width + 80) continue;
    ctx.beginPath();
    ctx.moveTo(x, groundY - 28);
    ctx.lineTo(x, groundY + 8);
    ctx.stroke();
    ctx.fillText(`${meters}m`, x - 18, groundY + 40);
  }
  ctx.font = "bold 28px Segoe UI";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText(`飞行距离 ${distance.toFixed(1)} m`, 36, 48);
  ctx.restore();
}

function drawHudCloud(ctx, distance, height) {
  ctx.save();
  ctx.fillStyle = "rgba(255, 252, 246, 0.92)";
  roundRect(ctx, refs.canvas.width - 250, 26, 208, 98, 20);
  ctx.fill();
  ctx.fillStyle = "#2e241c";
  ctx.font = "bold 22px Segoe UI";
  ctx.fillText("实时飞行", refs.canvas.width - 218, 58);
  ctx.font = "16px Segoe UI";
  ctx.fillStyle = "#786b5d";
  ctx.fillText(`距离 ${distance.toFixed(1)} m`, refs.canvas.width - 218, 84);
  ctx.fillText(`高度 ${height.toFixed(1)} m`, refs.canvas.width - 218, 108);
  ctx.restore();
}

function drawCloud(ctx, x, y, size) {
  ctx.beginPath();
  ctx.arc(x, y, size * 0.34, Math.PI * 0.5, Math.PI * 1.5);
  ctx.arc(x + size * 0.4, y - size * 0.18, size * 0.32, Math.PI, Math.PI * 1.8);
  ctx.arc(x + size * 0.8, y, size * 0.38, Math.PI * 1.5, Math.PI * 0.5);
  ctx.closePath();
  ctx.fill();
}

function drawPlane(ctx, x, y, rotation, color, emphasis = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rotation * Math.PI) / 180);
  if (emphasis) {
    ctx.save();
    ctx.fillStyle = "rgba(255, 90, 54, 0.18)";
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.scale(1.18, 1.18);
  }

  ctx.fillStyle = color;
  ctx.strokeStyle = emphasis ? "rgba(39, 56, 76, 0.86)" : "rgba(118, 96, 68, 0.35)";
  ctx.lineWidth = emphasis ? 2.6 : 2;

  ctx.beginPath();
  ctx.moveTo(0, -32);
  ctx.lineTo(-28 - state.parameters.wing * 0.35, 18);
  ctx.lineTo(-5, 10);
  ctx.lineTo(0, 30);
  ctx.lineTo(5, 10);
  ctx.lineTo(28 + state.parameters.wing * 0.35, 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -32 - state.parameters.nose * 0.22);
  ctx.lineTo(-5, 0);
  ctx.lineTo(5, 0);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-14, 16);
  ctx.lineTo(0, 20 - state.parameters.tail * 0.12);
  ctx.lineTo(14, 16);
  ctx.stroke();

  if (emphasis) {
    ctx.restore();
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.68)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function getWindText(intensity) {
  if (intensity < 0.12) return "平稳";
  if (intensity < 0.28) return "微风";
  if (intensity < 0.42) return "扰动";
  return "乱流";
}

function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = `${date.getMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getDate()}`.padStart(2, "0");
  const hh = `${date.getHours()}`.padStart(2, "0");
  const mi = `${date.getMinutes()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
