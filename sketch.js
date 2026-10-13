/* ČOP-ČOP: Hangman franču revolūcijas tematikā */
const ABC = "AĀBCČDEĒFGĢHIĪJKĶLĻMNŅOPRSŠTUŪVZŽ".split("");
const MAX = 6, N = 5;
const NAVY = "#0b1f4d", SKIN = "#f2cfa6";

/* ---------- "API" ---------- */
// API: ieraksti adresi, kas atgriež JSON. Formāts: {"giljotina":[["VĀRDS","pavediens"],...],"kuka":[...],"frolovics":[...]}
// Ja API_URL ir tukšs vai nav pieejams, vārdus ņem no ārējā faila words.js.
const API_URL = "https://raw.githubusercontent.com/doofy888/cop-cop_12f/main/words.json";
const THEMES = {
  giljotina: { name: "Nākamie rindā uz giljotīnu", sub: "Šobrīd esošie miljardieri" },
  kuka: { name: "Lai viņi ēd kūku!", sub: "Deserti un konditorejas izstrādājumi" },
  frolovics: { name: "Frolovičeva priecātos", sub: "Franču romantisma gleznotāji" }
};
const USED = {}; // jau izmantotie vārdi katrai tēmai, lai tie neatkārtotos
const loadUsed = t => { try { return new Set(JSON.parse(localStorage.getItem("chop_" + t) || "[]")); } catch (e) { return new Set(); } };
const saveUsed = (t, u) => { try { localStorage.setItem("chop_" + t, JSON.stringify([...u])); } catch (e) { /* nav svarīgi */ } };
const shuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(p => p[1]);
async function apiGetWords(theme, n) {
  let raw = (typeof WORDS !== "undefined" && WORDS[theme]) || null; // rezerves saraksts no words.js (ja tāds fails ir)
  if (API_URL) {
    try { const r = await fetch(API_URL); const d = await r.json(); raw = d[theme] || raw; } catch (e) { /* izmanto words.js, ja tāds ir */ }
  }
  if (!raw) return []; // nav ne API, ne words.js
  await new Promise(r => setTimeout(r, 400));
  const pool = raw.map(x => Array.isArray(x) ? { word: x[0].toUpperCase(), hint: x[1] } : { word: x.word.toUpperCase(), hint: x.hint });
  const used = USED[theme] = USED[theme] || loadUsed(theme);
  let fresh = pool.filter(w => !used.has(w.word));
  if (fresh.length < n) { used.clear(); fresh = pool; }
  const pick = shuffle(fresh).slice(0, n);
  pick.forEach(w => used.add(w.word));
  saveUsed(theme, used);
  return pick;
}

/* ---------- Avatārs ---------- */
const COL = { blue: "#0055A4", red: "#EF4135", white: "#FFFFFF" };
const LBL = {
  color: { blue: "Zils", red: "Sarkans", white: "Balts" },
  acc: { none: "Nav", wig: "Baltā parūka", hat: "Cepure", flag: "Franču karodziņš", mustache: "Ūsas", pipe: "Pīpe" },
  face: { angry: "Dusmīgs", happy: "Priecīgs", sad: "Bēdīgs", excited: "Sajūsmināts" }
};
const GRP = { color: "Drēbju krāsa", acc: "Aksesuārs", face: "Sejas izteiksme" };
const FACES = {
  happy: `<circle cx="-8" cy="-3" r="2.5"/><circle cx="8" cy="-3" r="2.5"/><path d="M-9 7Q0 17 9 7" fill="none"/>`,
  sad: `<circle cx="-8" cy="-2" r="2.5"/><circle cx="8" cy="-2" r="2.5"/><path d="M-13 -9L-5 -12M5 -12L13 -9M-9 14Q0 5 9 14" fill="none"/>`,
  angry: `<circle cx="-8" cy="-2" r="2.5"/><circle cx="8" cy="-2" r="2.5"/><path d="M-13 -13L-4 -8M4 -8L13 -13M-8 12H8" fill="none"/>`,
  excited: `<circle cx="-8" cy="-3" r="4.5" fill="#fff"/><circle cx="8" cy="-3" r="4.5" fill="#fff"/><circle cx="-8" cy="-3" r="1.8"/><circle cx="8" cy="-3" r="1.8"/><path d="M-9 6Q0 24 9 6Z" fill="#8b1a1a"/>`
};
const ACC = {
  none: "",
  wig: `<path d="M-23 -2C-31 -30 -14 -36 0 -36C14 -36 31 -30 23 -2L21 20C19 4 17 -15 0 -15C-17 -15 -19 4 -21 20Z" fill="#fff" stroke="${NAVY}" stroke-width="3"/><circle cx="-24" cy="20" r="6" fill="#fff" stroke="${NAVY}" stroke-width="3"/><circle cx="24" cy="20" r="6" fill="#fff" stroke="${NAVY}" stroke-width="3"/>`,
  hat: `<path d="M-32 -12L-16 -35H16L32 -12Q0 -22 -32 -12Z" fill="${NAVY}" stroke="${NAVY}" stroke-width="2"/><circle cx="22" cy="-18" r="5" fill="#EF4135" stroke="#fff" stroke-width="2"/>`,
  mustache: `<path d="M-15 5Q-8 -1 0 3Q8 -1 15 5Q8 10 0 6Q-8 10 -15 5Z" fill="#3a2a1a" stroke="#3a2a1a" stroke-width="1"/>`,
  pipe: `<path d="M5 13H25" stroke="#6b4226" stroke-width="3.5" stroke-linecap="round"/><rect x="23" y="3" width="9" height="13" rx="2" fill="#6b4226" stroke="${NAVY}" stroke-width="1.5"/>`,
  flag: ""
};
function headSVG(a) {
  return `<circle r="22" fill="${SKIN}" stroke="${NAVY}" stroke-width="3"/>
  <g fill="${NAVY}" stroke="${NAVY}" stroke-width="2.5" stroke-linecap="round">${FACES[a.face]}</g>${ACC[a.acc]}`;
}
function bodySVG(a) {
  const flag = a.acc === "flag" ? `<line x1="44" y1="8" x2="44" y2="80" stroke="#6b4226" stroke-width="3"/>
    <rect x="44" y="16" width="10" height="14" fill="#0055A4"/><rect x="54" y="16" width="10" height="14" fill="#fff" stroke="${NAVY}" stroke-width="1"/><rect x="64" y="16" width="10" height="14" fill="#EF4135"/>` : "";
  return `<rect x="-8" y="-30" width="16" height="32" fill="${SKIN}" stroke="${NAVY}" stroke-width="3"/>
  <path d="M-30 0L30 0L38 80L-38 80Z" fill="${COL[a.color]}" stroke="${NAVY}" stroke-width="3"/>
  <path d="M-12 0L0 16L12 0Z" fill="#fff" stroke="${NAVY}" stroke-width="2"/>${flag}`;
}
const previewSVG = a => `<svg viewBox="-65 -35 130 170" role="img" aria-label="Avatārs"><g transform="translate(0 52)">${bodySVG(a)}</g><g>${headSVG(a)}</g></svg>`;

function guillotineSVG(a) {
  return `<svg viewBox="0 0 320 380" role="img" aria-label="Giljotīna">
  <rect x="0" y="357" width="320" height="23" fill="${NAVY}"/>
  <rect x="64" y="24" width="16" height="333" fill="#fff" stroke="${NAVY}" stroke-width="3"/>
  <rect x="240" y="24" width="16" height="333" fill="#fff" stroke="${NAVY}" stroke-width="3"/>
  <g transform="translate(160 277)">${bodySVG(a)}</g>
  <g id="head"><g transform="translate(160 225)">${headSVG(a)}</g></g>
  <rect x="64" y="267" width="192" height="14" fill="#EF4135" stroke="${NAVY}" stroke-width="3"/>
  <g id="basket"><rect x="62" y="326" width="58" height="31" fill="#fff" stroke="${NAVY}" stroke-width="3"/><path d="M76 326V357M91 326V357M106 326V357" stroke="#EF4135" stroke-width="4"/></g>
  <g id="blade"><polygon points="82,56 238,56 238,92 82,104" fill="#dfe6f2" stroke="${NAVY}" stroke-width="3"/><rect x="82" y="44" width="156" height="12" fill="${NAVY}"/></g>
  <rect x="54" y="20" width="212" height="18" fill="#0055A4" stroke="${NAVY}" stroke-width="3"/>
</svg>`;
}

/* ---------- Stāvoklis ---------- */
const $ = s => document.querySelector(s), scr = $("#screen");
const S = { players: 1, theme: null, words: [], idx: 0, score: 0, av: { color: "blue", acc: "none", face: "happy" } };
let G = { active: false };
const show = h => { scr.innerHTML = h; window.scrollTo(0, 0); };

/* ---------- Ekrāni ---------- */
function screenPlayers() {
  G.active = false;
  show(`<div class="step">1 no 4</div><h2>Cik spēlētāju?</h2><p class="sub">Vienam vārdus piešķir spēle, diviem draugi vārdus ievada viens otram</p>
  <div class="grid"><button class="card" data-a="players" data-v="1"><h3>Viens spēlētājs</h3><p>Vārdus piešķir spēle</p></button>
  <button class="card" data-a="players" data-v="2"><h3>Divi spēlētāji</h3><p>Draugs ievada vārdus</p></button></div>`);
}
function screenTheme() {
  G.active = false;
  show(`<div class="step">2 no 4</div><h2>Izvēlies tēmu</h2><p class="sub">Katrā kārtā ir ${N} vārdi</p>
  <div class="grid">${Object.entries(THEMES).map(([k, t]) => `<button class="card" data-a="theme" data-v="${k}"><h3>${t.name}</h3><p>${t.sub}</p></button>`).join("")}</div>
  <div class="row"><button class="btn alt" data-a="players-back">Atpakaļ</button></div>`);
}
async function screenRound() {
  G.active = false;
  const t = THEMES[S.theme];
  if (S.players === 2) {
    show(`<div class="step">3 no 4</div><h2>Cik spēlēs: divi</h2><p class="sub">${t.name}: ievadi ${N} vārdus savam draugam</p>
    <div class="form">${Array.from({ length: N }, (_, i) => `<input class="w" type="password" maxlength="26" autocomplete="off" placeholder="${i + 1}. vārds vai frāze">`).join("")}</div>
    <p class="err" id="err"></p>
    <div class="row"><button class="btn alt" data-a="peek">Rādīt / slēpt</button><button class="btn" data-a="words">Tālāk</button><button class="btn alt" data-a="theme-back">Mainīt tēmu</button></div>`);
  } else {
    show(`<div class="step">3 no 4</div><h2>Cik spēlēs: viens</h2><p class="sub">Spēle meklē vārdus</p><div class="big">...</div>`);
    S.words = await apiGetWords(S.theme, N);
    if (!S.words.length) {
      show(`<div class="step">3 no 4</div><h2>Vārdi nav pieejami</h2><p class="sub">API neatbild un rezerves saraksta nav. Pārbaudi API_URL failā sketch.js.</p>
      <div class="row"><button class="btn" data-a="again">Mēģināt vēlreiz</button><button class="btn alt" data-a="theme-back">Mainīt tēmu</button></div>`);
      return;
    }
    show(`<div class="step">3 no 4</div><h2>Cik spēlēs: viens</h2><p class="sub">${t.name}</p>
    <div class="info">Kārtā ir ${N} vārdi.<br>Katram vārdam ir ${MAX} kļūdas.<br>Vienu pavedienu drīkst izmantot katram vārdam.</div>
    <div class="row"><button class="btn" data-a="toAvatar">Tālāk</button><button class="btn alt" data-a="theme-back">Mainīt tēmu</button></div>`);
  }
}
function screenAvatar() {
  show(`<div class="step">4 no 4</div><h2>Izveido avatāru</h2><p class="sub">Viņš stāvēs zem giljotīnas</p>
  <div class="av">${previewSVG(S.av)}<div>${Object.keys(GRP).map(k => `<div class="grp"><h3>${GRP[k]}</h3><div class="opts">${Object.entries(LBL[k]).map(([v, n]) => `<button class="opt ${S.av[k] === v ? "sel" : ""}" data-a="opt" data-k="${k}" data-v="${v}">${n}</button>`).join("")}</div></div>`).join("")}</div></div>
  <div class="row"><button class="btn" data-a="start">Sākt spēli</button></div>`);
}
function screenEnd() {
  G.active = false;
  show(`<h2>Kārta beigusies</h2><p class="sub">${THEMES[S.theme].name}</p><div class="big">${S.score} no ${N}</div>
  <p class="sub" style="margin-top:12px">${S.score >= 4 ? "Galva palika uz pleciem!" : S.score >= 2 ? "Tikko izglābies no giljotīnas" : "Giljotīna šodien bija aizņemta"}</p>
  <div class="row"><button class="btn" data-a="again">Spēlēt vēlreiz</button><button class="btn alt" data-a="theme-back">Mainīt tēmu</button></div>`);
}

/* ---------- Spēle ---------- */
function startGame() { S.idx = 0; S.score = 0; loadWord(); }
function loadWord() {
  const w = S.words[S.idx];
  G = { active: true, word: w.word, hint: w.hint || "", guessed: new Set(), wrong: 0, done: false, win: false, hintUsed: false };
  show(`<div class="top"><span>${THEMES[S.theme].name}</span><span>Vārds ${S.idx + 1} no ${N}</span><span>Uzminēti: ${S.score}</span></div>
  <div class="game"><div>${guillotineSVG(S.av)}</div><div>
    <div class="top"><span id="lives"></span></div>
    <div class="word" id="word"></div>
    <div class="msg" id="msg">Mini burtu</div>
    <div class="keys">${ABC.map(l => `<button class="key" data-a="key" data-v="${l}">${l}</button>`).join("")}</div>
    <div class="full"><input class="w" id="full" maxlength="26" autocomplete="off" placeholder="Minēt visu vārdu"><button class="btn" id="fullBtn" data-a="full">Minēt</button></div>
    <div class="row" style="justify-content:flex-start;margin-top:0"><button class="btn alt" id="hintBtn" data-a="hint">Pavediens</button><button class="btn" id="nextBtn" data-a="next" hidden>Nākamais vārds</button><button class="btn alt" data-a="theme-back">Iziet</button></div>
  </div></div>`);
  update();
}
function update() {
  $("#word").innerHTML = [...G.word].map(c => c === " " ? `<span class="sp"></span>` :
    `<span class="l ${G.done && !G.guessed.has(c) ? "miss" : ""}">${G.guessed.has(c) || G.done ? c : ""}</span>`).join("");
  $("#lives").textContent = `Kļūdas: ${G.wrong} no ${MAX}`;
  document.querySelectorAll(".key").forEach(b => {
    const l = b.dataset.v, used = G.guessed.has(l);
    b.disabled = used || G.done;
    b.classList.toggle("ok", used && G.word.includes(l));
    b.classList.toggle("bad", used && !G.word.includes(l));
  });
  const blade = $("#blade");
  if (G.wrong >= MAX) { blade.classList.add("drop"); blade.style.transform = "translateY(142px)"; $("#head").classList.add("fall"); }
  else blade.style.transform = `translateY(${G.wrong * 16}px)`;
  if (G.done) {
    const m = $("#msg"); m.className = "msg " + (G.win ? "win" : "lose");
    m.textContent = G.win ? "Vārds ir uzminēts!" : "Vārds nav uzminēts! Tas bija: " + G.word;
    $("#hintBtn").disabled = true; $("#nextBtn").hidden = false; $("#full").disabled = true; $("#fullBtn").disabled = true;
  }
}
function checkEnd() {
  const letters = [...G.word].filter(c => c !== " ");
  if (letters.every(c => G.guessed.has(c))) { G.done = true; G.win = true; S.score++; }
  else if (G.wrong >= MAX) { G.done = true; G.win = false; }
}
function guess(l) {
  if (!G.active || G.done || G.guessed.has(l)) return;
  G.guessed.add(l);
  if (!G.word.includes(l)) G.wrong++;
  checkEnd(); update();
}
function guessFull() {
  if (!G.active || G.done) return;
  const inp = $("#full"), v = inp.value.trim().toUpperCase().replace(/\s+/g, " ");
  inp.value = ""; if (!v) return;
  if (v === G.word) [...G.word].forEach(c => G.guessed.add(c));
  else { G.wrong++; $("#msg").textContent = "Nepareizs vārds: " + v; }
  checkEnd(); update();
}
function hint() {
  if (!G.active || G.done || G.hintUsed) return;
  G.hintUsed = true; $("#hintBtn").disabled = true;
  if (G.hint) { $("#msg").textContent = "Pavediens: " + G.hint; return; }
  const left = [...new Set([...G.word].filter(c => c !== " " && !G.guessed.has(c)))];
  G.guessed.add(left[Math.floor(Math.random() * left.length)]);
  $("#msg").textContent = "Pavediens: atklāts viens burts";
  checkEnd(); update();
}
function next() { S.idx++; S.idx >= N ? screenEnd() : loadWord(); }
function submitWords() {
  const out = [];
  for (const i of document.querySelectorAll(".w")) {
    const raw = i.value.trim().toUpperCase().replace(/\s+/g, " ");
    const clean = [...raw].filter(c => c === " " || ABC.includes(c)).join("");
    if (clean !== raw || clean.replace(/ /g, "").length < 2) {
      $("#err").textContent = "Katram vārdam jābūt vismaz 2 burtiem, izmantojot tikai latviešu alfabēta burtus.";
      return;
    }
    out.push({ word: clean, hint: "" });
  }
  S.words = out; screenAvatar();
}

/* ---------- Notikumi ---------- */
document.addEventListener("click", e => {
  const t = e.target.closest("[data-a]");
  if (!t || t.disabled) return;
  const v = t.dataset.v;
  const acts = {
    players: () => { S.players = +v; screenTheme(); },
    "players-back": screenPlayers,
    theme: () => { S.theme = v; screenRound(); },
    "theme-back": screenTheme,
    peek: () => document.querySelectorAll(".w").forEach(i => i.type = i.type === "password" ? "text" : "password"),
    words: submitWords,
    toAvatar: screenAvatar,
    opt: () => { S.av[t.dataset.k] = v; screenAvatar(); },
    start: startGame,
    key: () => guess(v),
    full: guessFull, hint, next,
    again: screenRound
  };
  if (acts[t.dataset.a]) acts[t.dataset.a]();
});
document.addEventListener("keydown", e => {
  if (e.target.id === "full") { if (e.key === "Enter") guessFull(); return; }
  if (!G.active || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === "Enter" && G.done) return next();
  const k = e.key.toUpperCase();
  if (ABC.includes(k)) guess(k);
});

screenPlayers();
