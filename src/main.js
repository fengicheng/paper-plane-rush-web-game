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
    key: "symmetry",
    name: "左右对称度",
    description: "对称更稳，偏航更少，更容易稳定出分。",
    value: 76,
  },
  {
    key: "tail",
    name: "尾翼上翘角度",
    description: "决定抬头还是下坠，过高会有失速风险。",
    value: 48,
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

const DISTANCE_SCALE = 10.6;

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
  lastRun: null,
};

const refs = {};

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheRefs();
  renderPaperOptions();
  renderParameterControls();
  bindEvents();
  loadNickname();
  recalcStats();
  renderAll();
  drawIdleScene();
}

function cacheRefs() {
  refs.nicknameInput = document.getElementById("nicknameInput");
  refs.paperOptions = document.getElementById("paperOptions");
  refs.parameterControls = document.getElementById("parameterControls");
  refs.statBars = document.getElementById("statBars");
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
  refs.throwHint = document.getElementById("throwHint");
  refs.resultDistance = document.getElementById("resultDistance");
  refs.resultSummary = document.getElementById("resultSummary");
  refs.resultTags = document.getElementById("resultTags");
  refs.relaunchBtn = document.getElementById("relaunchBtn");
  refs.randomizeBtn = document.getElementById("randomizeBtn");
  refs.globalTab = document.getElementById("globalTab");
  refs.personalTab = document.getElementById("personalTab");
  refs.globalBoard = document.getElementById("globalBoard");
  refs.personalBoard = document.getElementById("personalBoard");
  refs.introOverlay = document.getElementById("introOverlay");
  refs.canvas = document.getElementById("flightCanvas");
  refs.ctx = refs.canvas.getContext("2d");
}

function bindEvents() {
  refs.nicknameInput.addEventListener("change", handleNicknameChange);
  refs.relaunchBtn.addEventListener("click", resetForNextRun);
  refs.randomizeBtn.addEventListener("click", randomizeBuild);
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

function renderParameterControls() {
  refs.parameterControls.innerHTML = parameters
    .map(
      (item) => `
        <div class="slider-card">
          <header>
            <strong>${item.name}</strong>
            <span id="value-${item.key}">${state.parameters[item.key]}</span>
          </header>
          <p>${item.description}</p>
          <input type="range" min="0" max="100" step="1" value="${state.parameters[item.key]}" data-param="${item.key}" />
        </div>
      `
    )
    .join("");

  refs.parameterControls.querySelectorAll("input[type='range']").forEach((input) => {
    input.addEventListener("input", () => {
      state.parameters[input.dataset.param] = Number(input.value);
      const readout = document.getElementById(`value-${input.dataset.param}`);
      if (readout) readout.textContent = input.value;
      recalcStats();
      renderAll();
      drawIdleScene();
    });
  });
}

function recalcStats() {
  const paper = getSelectedPaper();
  const { nose, wing, symmetry, tail } = state.parameters;

  const stats = {
    speed: clamp(paper.stats.speed + nose * 0.26 - wing * 0.14 - tail * 0.03, 20, 100),
    lift: clamp(paper.stats.lift + wing * 0.24 + tail * 0.1 - paper.stats.weight * 0.08, 16, 100),
    stability: clamp(paper.stats.stability + symmetry * 0.22 - nose * 0.12 + tail * 0.04 - Math.abs(50 - wing) * 0.18, 12, 100),
    weight: clamp(paper.stats.weight + nose * 0.05 + (100 - wing) * 0.04, 20, 95),
    drag: clamp(paper.stats.drag + wing * 0.18 - nose * 0.12 + tail * 0.05, 10, 100),
  };

  stats.glide = clamp((stats.lift * 0.58 + stats.stability * 0.42) - stats.weight * 0.16, 10, 100);
  stats.risk = clamp((nose * 0.55 + Math.max(0, tail - 58) * 0.8 + Math.max(0, 42 - symmetry) * 1.15) / 2, 0, 100);
  state.stats = stats;
}

function renderAll() {
  renderPaperOptions();
  renderStatBars();
  renderHeroStats();
  renderPlanePreview();
  renderBoards();
  renderResultSummary(state.lastRun);
  refs.angleReadout.textContent = `${Math.round(state.throwState.angle)}°`;
  refs.powerReadout.textContent = `${Math.round(state.throwState.power)}%`;
  refs.releaseReadout.textContent = state.throwState.stabilityLabel;
  refs.powerMeter.style.width = `${state.throwState.power}%`;
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

function renderHeroStats() {
  const best = getBestRun()?.distance ?? 0;
  const last = state.personalRuns[0]?.distance ?? 0;
  refs.bestDistance.textContent = `${best.toFixed(1)} m`;
  refs.lastDistance.textContent = last > 0 ? `${last.toFixed(1)} m` : "-";
  refs.favoritePaper.textContent = getFavoritePaper();
}

function renderPlanePreview() {
  const { nose, wing, tail, symmetry } = state.parameters;
  const body = refs.planePreview.querySelector(".plane-body");
  const leftWing = refs.planePreview.querySelector(".plane-wing.left");
  const rightWing = refs.planePreview.querySelector(".plane-wing.right");
  const tailWing = refs.planePreview.querySelector(".plane-tail");

  body.style.transform = `translateX(-50%) rotate(${12 + nose / 9}deg) scaleY(${0.9 + nose / 260})`;
  leftWing.style.width = `${66 + wing}px`;
  rightWing.style.width = `${66 + wing}px`;
  leftWing.style.transform = `translateX(calc(-100% - ${(100 - symmetry) / 5}px)) rotate(${-8 - tail / 9}deg)`;
  rightWing.style.transform = `translateX(${(100 - symmetry) / 5}px) rotate(${8 + tail / 9}deg)`;
  tailWing.style.top = `${98 - tail / 6}px`;
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
  state.throwState.active = true;
  state.throwState.startY = event.clientY;
  state.throwState.angle = 28;
  state.throwState.stabilityLabel = "蓄力中";
  state.throwState.meterDirection = 1;
  refs.launchPad.classList.add("active");
  refs.throwHint.textContent = "继续按住保持蓄力，向上拖动会抬高投掷角度";
  refs.launchPad.setPointerCapture(event.pointerId);
  startPowerLoop();
  renderAll();
}

function onLaunchMove(event) {
  if (!state.throwState.active) return;
  const dragY = clamp(state.throwState.startY - event.clientY, -15, 140);
  state.throwState.angle = clamp(18 + dragY * 0.22, 8, 48);
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
  startSimulation();
}

function cancelLaunch() {
  if (!state.throwState.active) return;
  stopPowerLoop();
  state.throwState.active = false;
  refs.launchPad.classList.remove("active");
  refs.throwHint.textContent = "按住开始蓄力，向上拖动调整角度";
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

  const baseSpeed = 18 + stats.speed * 0.22 + powerFactor * 14;
  const launchStability = clamp((stats.stability * 0.7 + state.throwState.releaseScore * 0.55) / 125, 0.18, 1.08);
  const liftFactor = stats.lift / 100;
  const dragFactor = stats.drag / 100;
  const weightFactor = stats.weight / 100;
  const riskFactor = stats.risk / 100;
  const noseBias = state.parameters.nose / 100;
  const tailBias = state.parameters.tail / 100;
  const symmetryBias = state.parameters.symmetry / 100;

  state.sim.running = true;
  state.sim.points = [];
  state.sim.current = {
    x: 42,
    y: refs.canvas.height - 116,
    vx: baseSpeed * Math.cos(angleRad),
    vy: -baseSpeed * Math.sin(angleRad) * (0.82 + tailBias * 0.36),
    rotation: -state.throwState.angle / 1.8,
  };
  state.sim.maxDistance = 0;
  state.sim.maxHeight = 0;
  state.sim.turbulence = (1.16 - launchStability) * 0.42 + (1 - symmetryBias) * 0.22 + Math.random() * 0.12;
  state.sim.windText = "平稳";
  state.sim.startTime = performance.now();
  state.sim.lastTime = performance.now();

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

    jet.vx += (0.15 - drag * jet.vx * 0.012 - Math.max(0, riskFactor - 0.62) * 0.12) * deltaSeconds * 60;
    jet.vy += (gravity - liftBoost - gust * 10) * deltaSeconds;
    jet.vx += turbulence * deltaSeconds * 26;
    jet.vy += (Math.max(0, riskFactor - 0.58) * 18 - symmetryBias * 4) * deltaSeconds;

    if (elapsed > 0.6 && tailBias > 0.68) {
      jet.vy += (tailBias - 0.68) * 36 * deltaSeconds;
    }

    if (elapsed < 0.65 && noseBias > 0.72) {
      jet.vy += noseBias * 14 * deltaSeconds;
    }

    jet.x += jet.vx;
    jet.y += jet.vy;
    jet.rotation = clamp(jet.rotation + (jet.vy * 0.06 + turbulence * 14), -48, 72);
    state.sim.points.push({ x: jet.x, y: jet.y });

    const distance = Math.max(0, (jet.x - 42) / DISTANCE_SCALE);
    const height = Math.max(0, (refs.canvas.height - 116 - jet.y) / 9.8);
    state.sim.maxDistance = Math.max(state.sim.maxDistance, distance);
    state.sim.maxHeight = Math.max(state.sim.maxHeight, height);
    state.sim.windText = getWindText(Math.abs(gust));

    refs.liveDistance.textContent = `${distance.toFixed(1)} m`;
    refs.liveHeight.textContent = `${height.toFixed(1)} m`;
    refs.windReadout.textContent = state.sim.windText;
    drawScene(distance, height);

    if (jet.y >= refs.canvas.height - 92 || jet.x >= refs.canvas.width - 56 || jet.vx <= 0.6) {
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
  refs.liveHeight.textContent = `${state.sim.maxHeight.toFixed(1)} m`;
  refs.windReadout.textContent = state.sim.windText;
  drawScene(distance, state.sim.maxHeight, true);
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
  if (reasons.includes("偏航损失")) return "对称度略差，飞机在中段出现了明显偏航。";
  return "这把已经有不错雏形，再优化参数或释放时机还有明显提升空间。";
}

function getRunReasons(distance, launchStability, releaseFactor) {
  const reasons = [];
  if (distance >= 110) reasons.push("极限滑翔");
  if (state.parameters.tail > 72) reasons.push("失速明显");
  if (state.parameters.nose > 78 && state.parameters.tail < 42) reasons.push("前段俯冲");
  if (state.parameters.symmetry < 56 || launchStability < 0.62) reasons.push("偏航损失");
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
      "更对称，更稳定",
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
  refs.throwHint.textContent = "按住开始蓄力，向上拖动调整角度";
  refs.liveDistance.textContent = "0.0 m";
  refs.liveHeight.textContent = "0.0 m";
  refs.windReadout.textContent = "平稳";
  drawIdleScene();
}

function randomizeBuild() {
  state.selectedPaperId = papers[Math.floor(Math.random() * papers.length)].id;
  parameters.forEach((item) => {
    state.parameters[item.key] = Math.round(22 + Math.random() * 64);
  });
  renderParameterControls();
  recalcStats();
  renderAll();
  resetForNextRun();
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
  drawBackdrop(ctx);
  drawRunway(ctx);
  drawDistanceMarkers(ctx, 0);
  drawPlane(ctx, 130, refs.canvas.height - 130, -18, getSelectedPaper().theme);
}

function drawScene(distance, height, landed = false) {
  const ctx = refs.ctx;
  ctx.clearRect(0, 0, refs.canvas.width, refs.canvas.height);
  drawBackdrop(ctx);
  drawDistanceMarkers(ctx, distance);
  drawRunway(ctx);

  if (state.sim.points.length > 1) {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    state.sim.points.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
    ctx.restore();
  }

  const jet = state.sim.current;
  if (jet) {
    drawPlane(ctx, jet.x, landed ? refs.canvas.height - 94 : jet.y, jet.rotation, getSelectedPaper().theme);
  }

  drawHudCloud(ctx, distance, height);
}

function drawBackdrop(ctx) {
  const gradient = ctx.createLinearGradient(0, 0, 0, refs.canvas.height);
  gradient.addColorStop(0, "#bfe0f3");
  gradient.addColorStop(0.55, "#d8eef8");
  gradient.addColorStop(0.551, "#dce9c5");
  gradient.addColorStop(1, "#aac988");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, refs.canvas.width, refs.canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.38)";
  drawCloud(ctx, 120, 98, 58);
  drawCloud(ctx, 340, 160, 44);
  drawCloud(ctx, 840, 124, 68);
  drawCloud(ctx, 1040, 212, 52);
}

function drawRunway(ctx) {
  ctx.save();
  ctx.fillStyle = "#97bc72";
  ctx.fillRect(0, refs.canvas.height - 120, refs.canvas.width, 120);
  ctx.fillStyle = "rgba(53, 98, 56, 0.18)";
  for (let i = 0; i < refs.canvas.width; i += 70) {
    ctx.fillRect(i, refs.canvas.height - 92, 26, 36);
  }
  ctx.fillStyle = "#d1b38c";
  ctx.fillRect(0, refs.canvas.height - 74, refs.canvas.width, 12);
  ctx.restore();
}

function drawDistanceMarkers(ctx, distance) {
  ctx.save();
  ctx.strokeStyle = "rgba(47, 111, 161, 0.16)";
  ctx.fillStyle = "rgba(46, 36, 28, 0.52)";
  ctx.font = "18px Segoe UI";
  for (let i = 0; i < 12; i += 1) {
    const x = 90 + i * 90;
    ctx.beginPath();
    ctx.moveTo(x, refs.canvas.height - 120);
    ctx.lineTo(x, refs.canvas.height - 84);
    ctx.stroke();
    ctx.fillText(`${i * 10}m`, x - 18, refs.canvas.height - 52);
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

function drawPlane(ctx, x, y, rotation, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.fillStyle = color;
  ctx.strokeStyle = "rgba(118, 96, 68, 0.35)";
  ctx.lineWidth = 2;

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
