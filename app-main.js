// Footy Brain — app-main.js  v5 (clean build)
"use strict";

var SCREEN_MAP = {
  "name-screen":"s-name","position-screen":"s-pos","home-screen":"s-path",
  "quiz-screen":"s-quiz","daily-screen":"s-daily","prizes-screen":"s-prizes",
  "cards-screen":"s-cards","profile-screen":"s-profile",
  "settings-screen":"s-settings","pro-screen":"s-pro",
  "game-screen":"s-games","games-screen":"s-games","drills-screen":"s-drills"
};
var NAV_SCREENS = ["s-path","s-prizes","s-cards","s-profile","s-games","s-drills"];
var _currentScreen = "";

window.showScreen = function(id) {
  var htmlId = SCREEN_MAP[id] || id;
  console.log("[FB] showScreen:", id, "->", htmlId);
  document.querySelectorAll(".screen").forEach(function(el) {
    el.classList.add("hidden");
    el.classList.remove("on");
    el.style.display = "";
  });
  var target = document.getElementById(htmlId);
  if (!target) { console.error("[FB] screen not found:", htmlId); return; }
  target.classList.remove("hidden");
  target.style.display = "flex";
  target.classList.add("on");
  _currentScreen = htmlId;
  var nav = document.getElementById("main-nav");
  if (nav) nav.classList.toggle("hidden", NAV_SCREENS.indexOf(htmlId) === -1);
  function safe(fn) { try { if (typeof fn === "function") fn(); } catch(e) { console.warn("[FB] render err:", e); } }
  if (htmlId === "s-path")     { safe(renderPath); safe(renderDailyBanner); _updateHeader(); }
  if (htmlId === "s-daily")    { safe(renderDailyChallenge); }
  if (htmlId === "s-prizes")   { safe(renderPrizesScreen); }
  if (htmlId === "s-cards")    { safe(renderCollection); }
  if (htmlId === "s-profile")  { safe(renderProfile); }
  if (htmlId === "s-settings") { safe(renderSettings); }
  if (htmlId === "s-games")    { safe(renderGamesScreen); }
  if (htmlId === "s-drills")   { safe(renderDrillsScreen); }
};

window.setNav = function(id) {
  document.querySelectorAll("#main-nav .nb").forEach(function(b) { b.classList.remove("on"); });
  var el = document.getElementById(id); if (el) el.classList.add("on");
};
window.setActiveNav = window.setNav;
window.goHome = function() { showScreen("s-path"); setNav("nb-path"); };

// Global helpers needed by packs.js / games.js
window.el = function(id) { return document.getElementById(id); };
window.showModal  = function(id) { var e=document.getElementById(id); if(e) e.classList.add("on"); };
window.closeModal = function(id) { var e=document.getElementById(id); if(e) e.classList.remove("on"); };

var _toastT = null;
window.showToast = function(msg, dur) {
  var t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(_toastT);
  _toastT = setTimeout(function() { t.classList.remove("show"); }, dur || 2600);
};

window.saveName = function() {
  console.log("[FB] saveName called");
  var inp = document.getElementById("inp-name");
  var name = inp ? inp.value.trim() : "";
  console.log("[FB] name:", JSON.stringify(name));
  if (!name) { showToast("Enter your name ⚽"); return; }
  S.name = name;
  if (typeof saveState === "function") saveState();
  _buildPositionGrid();
  showScreen("s-pos");
};

function _buildPositionGrid() {
  var grid = document.getElementById("pos-grid");
  if (!grid) { console.error("[FB] pos-grid not found!"); return; }
  grid.innerHTML = "";
  var positions = [
    { id:"Striker",    emoji:"⚡", desc:"Goals & movement" },
    { id:"Midfielder", emoji:"🎯", desc:"Vision & passing" },
    { id:"Winger",     emoji:"💨", desc:"Speed & dribbling" },
    { id:"Full-Back",  emoji:"🛡️", desc:"Attack & defend" },
    { id:"Defender",   emoji:"🧱", desc:"Reading the game" },
    { id:"Goalkeeper", emoji:"🥅", desc:"Shot-stopping" }
  ];
  positions.forEach(function(p) {
    var btn = document.createElement("button");
    btn.onclick = function() { selectPos(p.id); };
    btn.style.cssText = "background:var(--s1);border:1.5px solid var(--b2);border-radius:16px;" +
      "padding:.85rem .7rem;display:flex;flex-direction:column;align-items:center;gap:.3rem;" +
      "cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif;-webkit-tap-highlight-color:transparent;";
    var emo = document.createElement("div");
    emo.style.fontSize = "1.85rem"; emo.textContent = p.emoji;
    var nm = document.createElement("div");
    nm.style.cssText = "font-weight:800;font-size:.88rem;color:var(--t1);"; nm.textContent = p.id;
    var dc = document.createElement("div");
    dc.style.cssText = "font-size:.65rem;color:var(--t2);"; dc.textContent = p.desc;
    btn.appendChild(emo); btn.appendChild(nm); btn.appendChild(dc);
    grid.appendChild(btn);
  });
  console.log("[FB] position grid built");
}

window.selectPos = function(pos) {
  console.log("[FB] selectPos:", pos);
  S.position = pos;
  if (typeof saveState   === "function") saveState();
  if (typeof checkStreak === "function") checkStreak();
  _updateHeader();
  if (typeof renderPath        === "function") renderPath();
  if (typeof renderDailyBanner === "function") renderDailyBanner();
  showScreen("s-path");
  setNav("nb-path");
  showToast("Welcome, " + S.name + "! Let’s build your football brain 🧠");
};

function _setText(id, val) { var e = document.getElementById(id); if (e) e.textContent = val; }

function _updateHeader() {
  _setText("hdr-name", S.name || "");
  _setText("streak-disp", S.streak || 0);
  _updateXPDisplay();
  _updateHeartsDisplay();
}

function _updateXPDisplay() {
  if (typeof getLevelFromXP !== "function") return;
  var xp  = S.xp || 0;
  var lv  = getLevelFromXP(xp);
  var pct = typeof getLevelProgress === "function" ? getLevelProgress(xp) : 0;
  var nxt = typeof getXPToNext      === "function" ? getXPToNext(xp)      : 0;
  var ttl = typeof getLevelTitle    === "function" ? getLevelTitle(xp)    : "";
  _setText("ring-lv", lv); _setText("lv-title", ttl);
  _setText("xp-disp", xp.toLocaleString()); _setText("xp-next", nxt.toLocaleString());
  var fill = document.getElementById("xp-fill");
  if (fill) fill.style.width = pct + "%";
}

function _updateHeartsDisplay() {
  if (typeof getHearts !== "function") return;
  var h = getHearts(); var html = "";
  for (var i = 1; i <= 5; i++) {
    html += "<span style=\"" + (i > h ? "opacity:.2;filter:grayscale(1);" : "") + "\">❤️</span>";
  }
  ["hearts-hdr","quizHearts"].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.innerHTML = html;
  });
}

// Level intro state
var _introState = { chapterId: null, levelNum: null };

window.openLevelIntro = function(chapterId, levelNum) {
  if (typeof getHearts === "function" && getHearts() <= 0) { _showHeartsModal(); return; }
  var ch = typeof getChapterById === "function" ? getChapterById(chapterId) : null;
  if (!ch) return;
  var lvDef = typeof CHAPTER_LEVELS !== "undefined" ? CHAPTER_LEVELS[levelNum - 1] : null;
  if (!lvDef) return;
  _introState = { chapterId: chapterId, levelNum: levelNum };
  var first = typeof hasSeenIntro === "function" ? !hasSeenIntro(chapterId, levelNum) : false;
  if (first) _showFSI(ch, levelNum, lvDef); else _showCard(ch, levelNum, lvDef);
};

function _defaultQuote(n) {
  var q = ["Every great player started with the basics.",
           "Technique sharpens with practice. These questions will challenge you.",
           "This is where good players separate from average ones.",
           "Pro level knowledge. What coaches teach at academies.",
           "Only the best reach Level 5. A perfect score is required."];
  return q[(n-1)%q.length] || q[0];
}
function _defaultLearns(ch, levelNum, lvDef) {
  return [
    "Core concepts at " + lvDef.name + " level",
    ch.cat + " fundamentals for " + (S.position || "your position"),
    lvDef.desc,
    "Building toward Level " + Math.min(levelNum+1,5)
  ];
}

function _showFSI(ch, levelNum, lvDef) {
  var el = document.getElementById("lvl-intro");
  if (!el) { startChapterLevel(ch.id, levelNum); return; }
  var quote  = (ch.levelQuotes && ch.levelQuotes[levelNum]) || _defaultQuote(levelNum);
  var learns = (ch.levelIntros && ch.levelIntros[levelNum]) || _defaultLearns(ch, levelNum, lvDef);
  var qpp    = typeof QUESTIONS_PER_LEVEL !== "undefined" ? QUESTIONS_PER_LEVEL : 6;
  _setText("fsi-emoji",      ch.emoji);
  _setText("fsi-chapter",    ch.title);
  _setText("fsi-level-name", lvDef.icon+" Level "+lvDef.n+" — "+lvDef.name);
  _setText("fsi-quote",      quote);
  _setText("fsi-cta-txt",    lvDef.cta);
  var glow = document.getElementById("fsi-glow");
  if (glow) glow.style.background = "radial-gradient(circle at 50% 0,"+lvDef.color+"22,transparent 60%)";
  var learnsEl = document.getElementById("fsi-learns");
  if (learnsEl) {
    learnsEl.innerHTML = "";
    learns.forEach(function(l) {
      var d = document.createElement("div");
      d.style.cssText = "display:flex;align-items:flex-start;gap:.6rem;padding:.65rem .85rem;"+
        "border-radius:12px;border:1px solid "+lvDef.border+";background:"+lvDef.bg+";";
      d.innerHTML = "<span style=\"color:"+lvDef.color+";\">✓</span><span>"+l+"</span>";
      learnsEl.appendChild(d);
    });
  }
  var metaEl = document.getElementById("fsi-meta");
  if (metaEl) {
    metaEl.innerHTML =
      "<span class=\"pill\" style=\"background:var(--s2);border:1px solid var(--b2);\">📝 "+qpp+" questions</span> "+
      "<span class=\"pill\" style=\"background:"+lvDef.bg+";border:1px solid "+lvDef.border+";color:"+lvDef.color+";\">✓ Pass: "+lvDef.pass+"/"+qpp+"</span> "+
      "<span class=\"pill\" style=\"background:"+lvDef.bg+";border:1px solid "+lvDef.border+";color:"+lvDef.color+";\">+"+lvDef.xp+" XP</span>";
  }
  var ctaBtn = document.getElementById("fsi-cta");
  if (ctaBtn) ctaBtn.style.background = "linear-gradient(135deg,"+lvDef.color+","+lvDef.color+"bb)";
  el.classList.remove("hidden"); el.style.display = "flex";
}

window.closeFSI = function() { var e=document.getElementById("lvl-intro"); if(e){e.classList.add("hidden");e.style.display="none";} };
window.startFromFSI = function() {
  closeFSI();
  if (typeof markIntroSeen === "function") markIntroSeen(_introState.chapterId, _introState.levelNum);
  startChapterLevel(_introState.chapterId, _introState.levelNum);
};

function _showCard(ch, levelNum, lvDef) {
  var el = document.getElementById("lvl-card");
  if (!el) { startChapterLevel(ch.id, levelNum); return; }
  var quote  = (ch.levelQuotes && ch.levelQuotes[levelNum]) || _defaultQuote(levelNum);
  var learns = (ch.levelIntros && ch.levelIntros[levelNum]) || _defaultLearns(ch, levelNum, lvDef);
  var lvData = typeof getLevelData === "function" ? getLevelData(ch.id,levelNum) : {bestScore:0,attempts:0};
  var qpp    = typeof QUESTIONS_PER_LEVEL !== "undefined" ? QUESTIONS_PER_LEVEL : 6;
  var topEl  = document.getElementById("lc-top");
  if (topEl) {
    topEl.innerHTML = "";
    var iconD = document.createElement("div");
    iconD.style.cssText = "width:58px;height:58px;border-radius:18px;flex-shrink:0;" +
      "background:"+lvDef.bg+";border:1.5px solid "+lvDef.border+";"+
      "display:flex;align-items:center;justify-content:center;font-size:2.1rem;";
    iconD.textContent = ch.emoji;
    var infoD = document.createElement("div");
    var tD = document.createElement("div");
    tD.style.cssText = "font-family:'Bebas Neue',sans-serif;font-size:1.5rem;line-height:1;";
    tD.textContent = ch.title;
    var bD = document.createElement("div");
    bD.style.cssText = "display:inline-flex;align-items:center;gap:.26rem;margin-top:.25rem;padding:.17rem .6rem;"+
      "border-radius:99px;background:"+lvDef.bg+";border:1px solid "+lvDef.border+";color:"+lvDef.color+";font-size:.65rem;font-weight:800;";
    bD.textContent = lvDef.icon+" Level "+lvDef.n+" — "+lvDef.name;
    infoD.appendChild(tD); infoD.appendChild(bD);
    if (lvData.attempts > 0) {
      var aD = document.createElement("div");
      aD.style.cssText = "font-size:.72rem;color:var(--t2);margin-top:.22rem;";
      aD.textContent = "✅ Best: "+lvData.bestScore+"/"+qpp+" · "+lvData.attempts+" attempt"+(lvData.attempts!==1?"s":"");
      infoD.appendChild(aD);
    }
    topEl.appendChild(iconD); topEl.appendChild(infoD);
  }
  var quoteEl = document.getElementById("lc-quote");
  if (quoteEl) quoteEl.textContent = quote;
  var learnsEl = document.getElementById("lc-learns");
  if (learnsEl) {
    learnsEl.innerHTML = "";
    learns.slice(0,3).forEach(function(l) {
      var d = document.createElement("div");
      d.style.cssText = "display:flex;align-items:flex-start;gap:.5rem;font-size:.82rem;color:var(--t2);"+
        "padding:.28rem 0;border-bottom:1px solid var(--b1);";
      d.innerHTML = "<span style=\"color:"+lvDef.color+";flex-shrink:0;\">✓</span><span>"+l+"</span>";
      learnsEl.appendChild(d);
    });
  }
  var metaEl = document.getElementById("lc-meta");
  if (metaEl) {
    metaEl.innerHTML =
      "<span class=\"pill\" style=\"background:var(--s2);border:1px solid var(--b2);\">📝 "+qpp+" questions</span> "+
      "<span class=\"pill\" style=\"background:"+lvDef.bg+";border:1px solid "+lvDef.border+";color:"+lvDef.color+";\">✓ "+lvDef.pass+"/"+qpp+"</span> "+
      "<span class=\"pill\" style=\"background:"+lvDef.bg+";border:1px solid "+lvDef.border+";color:"+lvDef.color+";\">+"+lvDef.xp+" XP</span>";
  }
  var sBtn = document.getElementById("lc-start");
  if (sBtn) {
    sBtn.textContent = lvDef.cta;
    sBtn.style.cssText = "width:100%;padding:.88rem;border:none;border-radius:13px;color:#000;"+
      "font-family:'DM Sans',sans-serif;font-weight:900;font-size:.95rem;cursor:pointer;"+
      "background:linear-gradient(135deg,"+lvDef.color+","+lvDef.color+"bb);";
  }
  el.classList.remove("hidden"); el.style.display = "flex";
}

window.closeCard = function() { var e=document.getElementById("lvl-card"); if(e){e.classList.add("hidden");e.style.display="none";} };
window.startFromCard = function() {
  closeCard();
  if (typeof markIntroSeen === "function") markIntroSeen(_introState.chapterId, _introState.levelNum);
  startChapterLevel(_introState.chapterId, _introState.levelNum);
};
window.handleCardBackdrop = function(e) { if(e.target===document.getElementById("lvl-card")) closeCard(); };
window.showAllLevels = function() { closeCard(); if(_introState.chapterId&&typeof openChapterLevels==="function") openChapterLevels(_introState.chapterId); };

window.openChapterLevels = function(chapterId) {
  var ch = typeof getChapterById === "function" ? getChapterById(chapterId) : null;
  if (!ch) return;
  var ex = document.getElementById("chapterLevelsOverlay"); if(ex) ex.remove();
  var qpp = typeof QUESTIONS_PER_LEVEL !== "undefined" ? QUESTIONS_PER_LEVEL : 6;
  var lvs = typeof CHAPTER_LEVELS !== "undefined" ? CHAPTER_LEVELS : [];
  var overlay = document.createElement("div");
  overlay.id = "chapterLevelsOverlay";
  overlay.style.cssText = "position:fixed;inset:0;z-index:300;display:flex;align-items:flex-end;"+
    "justify-content:center;padding:1rem;background:rgba(0,0,0,.75);backdrop-filter:blur(8px);";
  overlay.addEventListener("click", function(e){ if(e.target===overlay) overlay.remove(); });
  var sheet = document.createElement("div");
  sheet.style.cssText = "width:100%;max-width:420px;background:#0a1425;border:1px solid rgba(255,255,255,.13);"+
    "border-radius:24px 24px 20px 20px;overflow:hidden;max-height:84vh;overflow-y:auto;scrollbar-width:none;";
  var drag = document.createElement("div");
  drag.style.cssText = "width:40px;height:4px;border-radius:99px;background:rgba(255,255,255,.13);margin:1rem auto .85rem;";
  var body = document.createElement("div");
  body.style.cssText = "padding:0 1.25rem .5rem;";
  var emoD = document.createElement("div");
  emoD.style.cssText = "font-size:2.2rem;text-align:center;margin-bottom:.3rem;"; emoD.textContent = ch.emoji;
  var titD = document.createElement("div");
  titD.style.cssText = "font-family:'Bebas Neue',sans-serif;font-size:1.6rem;text-align:center;"+
    "background:linear-gradient(135deg,#b8ff57,#5edfff);-webkit-background-clip:text;"+
    "-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:1rem;";
  titD.textContent = ch.title;
  body.appendChild(emoD); body.appendChild(titD);
  lvs.forEach(function(lv, i) {
    var lvNum    = i+1;
    var lvData   = typeof getLevelData    === "function" ? getLevelData(chapterId,lvNum)    : {};
    var unlocked = typeof isLevelUnlocked === "function" ? isLevelUnlocked(chapterId,lvNum) : lvNum===1;
    var isCur    = !lvData.done && unlocked;
    var row = document.createElement("div");
    row.style.cssText = "display:flex;align-items:center;gap:.75rem;padding:.72rem .9rem;border-radius:12px;"+
      "cursor:"+(unlocked?"pointer":"not-allowed")+";margin-bottom:.42rem;transition:all .14s;"+
      "border:1.5px solid "+(lvData.done?"rgba(184,255,87,.25)":isCur?lv.color:"rgba(255,255,255,.08)")+";"+
      "background:"+(lvData.done?"rgba(184,255,87,.05)":isCur?lv.bg:"rgba(255,255,255,.03)")+";"+
      "opacity:"+(unlocked?1:0.35)+";";
    if (unlocked) { (function(n){ row.addEventListener("click",function(){ overlay.remove(); openLevelIntro(chapterId,n); }); })(lvNum); }
    else { row.addEventListener("click",function(){ showToast("Complete Level "+(lvNum-1)+" first!"); }); }
    var iD = document.createElement("div");
    iD.style.cssText = "width:38px;height:38px;border-radius:50%;flex-shrink:0;background:"+lv.bg+";"+
      "display:flex;align-items:center;justify-content:center;font-size:1.1rem;";
    iD.textContent = lv.icon;
    var inD = document.createElement("div"); inD.style.flex="1";
    var nD  = document.createElement("div"); nD.style.cssText="font-weight:700;font-size:.88rem;"; nD.textContent="Level "+lvNum+" — "+lv.name;
    var dD  = document.createElement("div"); dD.style.cssText="font-size:.7rem;color:rgba(240,244,255,.4);"; dD.textContent=lv.desc;
    inD.appendChild(nD); inD.appendChild(dD);
    var xD  = document.createElement("div"); xD.style.cssText="text-align:right;flex-shrink:0;";
    var xN  = document.createElement("div"); xN.style.cssText="font-size:.72rem;font-weight:800;color:"+lv.color+";"; xN.textContent="+"+lv.xp+" XP";
    var stD = document.createElement("div"); stD.style.cssText="font-size:.72rem;margin-top:.1rem;";
    if (lvData.done) { stD.style.color="#b8ff57"; stD.textContent="✅ "+lvData.bestScore+"/"+qpp; }
    else if (isCur)  { stD.style.cssText+="color:"+lv.color+";font-weight:700;"; stD.textContent="▶ START"; }
    else             { stD.textContent = unlocked ? "" : "🔒"; }
    xD.appendChild(xN); xD.appendChild(stD);
    row.appendChild(iD); row.appendChild(inD); row.appendChild(xD);
    body.appendChild(row);
  });
  var cBtn = document.createElement("button");
  cBtn.style.cssText = "width:100%;padding:.72rem;background:rgba(255,255,255,.05);"+
    "border:1px solid rgba(255,255,255,.1);color:rgba(240,244,255,.4);"+
    "font-family:'DM Sans',sans-serif;font-size:.82rem;font-weight:600;border-radius:11px;cursor:pointer;";
  cBtn.textContent = "Close";
  cBtn.addEventListener("click", function(){ overlay.remove(); });
  var cW = document.createElement("div"); cW.style.cssText="padding:.25rem 1.25rem 1.5rem;"; cW.appendChild(cBtn);
  sheet.appendChild(drag); sheet.appendChild(body); sheet.appendChild(cW);
  overlay.appendChild(sheet); document.body.appendChild(overlay);
};

function _showHeartsModal() {
  var t = document.getElementById("hearts-timer");
  if (t && typeof getHeartRegenText==="function") t.textContent = getHeartRegenText() || "30:00";
  showModal("m-hearts");
}
window.showNoHeartsModal = _showHeartsModal;
window.showLevelUpModal = function(level) {
  _setText("lu-num",   "Level " + level);
  _setText("lu-title", typeof getLevelTitle==="function" ? getLevelTitle(S.xp) : "");
  showModal("m-levelup");
  if (typeof confetti==="function") confetti({particleCount:130,spread:75,origin:{y:.5}});
};

setInterval(function() {
  var t=document.getElementById("hearts-timer");
  if(t&&typeof getHeartRegenText==="function"){var tx=getHeartRegenText();if(tx)t.textContent=tx;}
  _updateHeartsDisplay();
}, 15000);

window.renderDailyChallenge = function() {
  var el = document.getElementById("daily-content"); if (!el) return;
  var done = S.lastDailyDate === new Date().toDateString();
  el.innerHTML = "";
  var outer = document.createElement("div"); outer.style.cssText="padding:1rem 0;";
  if (done) {
    var emo = document.createElement("div"); emo.style.cssText="font-size:4rem;margin-bottom:1rem;text-align:center;"; emo.textContent="✅";
    var h2  = document.createElement("h2");
    h2.style.cssText="font-family:'Bebas Neue',sans-serif;font-size:2.2rem;color:var(--lime);margin-bottom:.5rem;text-align:center;";
    h2.textContent="CHALLENGE DONE!";
    var p   = document.createElement("p"); p.style.cssText="color:var(--t2);font-size:.9rem;line-height:1.6;margin-bottom:1.5rem;text-align:center;"; p.textContent="Come back tomorrow to keep your streak!";
    var sc  = document.createElement("div"); sc.className="glass"; sc.style.cssText="padding:1rem;text-align:center;margin-bottom:1rem;";
    sc.innerHTML="<div style=\"font-size:.75rem;color:var(--t2);margin-bottom:.3rem;\">STREAK</div><div style=\"font-family:'Bebas Neue',sans-serif;font-size:3rem;color:var(--amber);\">"+(S.streak||0)+" 🔥</div>";
    var bb  = document.createElement("button"); bb.className="btn btg"; bb.style.width="100%"; bb.textContent="← Back to Path"; bb.addEventListener("click",goHome);
    outer.appendChild(emo); outer.appendChild(h2); outer.appendChild(p); outer.appendChild(sc); outer.appendChild(bb);
  } else {
    var streak = document.createElement("div"); streak.className="glass";
    streak.style.cssText="padding:1.25rem;margin-bottom:1rem;text-align:center;";
    streak.innerHTML="<div style=\"font-size:.75rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--t2);margin-bottom:.4rem;\">STREAK</div>"+
      "<div style=\"font-family:'Bebas Neue',sans-serif;font-size:3.2rem;color:var(--amber);line-height:1;\">"+(S.streak||0)+" 🔥</div>"+
      "<div style=\"font-size:.75rem;color:var(--t2);margin-top:.3rem;\">days in a row</div>";
    var card = document.createElement("div"); card.className="glass";
    card.style.cssText="padding:1.25rem;margin-bottom:1.2rem;";
    var hdr = document.createElement("div");
    hdr.style.cssText="display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem;";
    hdr.innerHTML="<div style=\"font-size:2rem;\">📅</div><div><div style=\"font-weight:800;font-size:.95rem;\">Today’s Challenge</div><div style=\"font-size:.75rem;color:var(--t2);\">5 mixed questions · Bonus XP</div></div>";
    var sb = document.createElement("button");
    sb.style.cssText="width:100%;padding:.95rem;border:none;border-radius:13px;"+
      "background:linear-gradient(135deg,var(--amber),#d97706);color:#000;"+
      "font-family:'DM Sans',sans-serif;font-weight:900;font-size:1rem;cursor:pointer;";
    sb.textContent="Start Daily Challenge 🔥";
    sb.addEventListener("click",function(){if(typeof startDailyQuiz==="function")startDailyQuiz();});
    card.appendChild(hdr); card.appendChild(sb);
    outer.appendChild(streak); outer.appendChild(card);
  }
  el.appendChild(outer);
};

window.renderPrizesScreen = function() {
  var el=document.getElementById("prizes-content"); if(!el) return;
  var col=S.collection||[];
  el.innerHTML="";
  if(col.length===0){
    var wrap=document.createElement("div"); wrap.style.cssText="text-align:center;padding:3rem 1rem;";
    wrap.innerHTML="<div style=\"font-size:4rem;margin-bottom:1rem;\">🎁</div>";
    var h3=document.createElement("h3");
    h3.style.cssText="font-family:'Bebas Neue',sans-serif;font-size:1.8rem;color:var(--amber);margin-bottom:.5rem;";
    h3.textContent="WIN YOUR FIRST CARD";
    var p=document.createElement("p"); p.style.cssText="color:var(--t2);font-size:.88rem;line-height:1.6;margin-bottom:1.5rem;"; p.textContent="Score 3+ in arcade games to win card packs!";
    var btn=document.createElement("button"); btn.className="btn btl"; btn.style.width="100%"; btn.textContent="Play & Win Cards →";
    btn.addEventListener("click",function(){showScreen("s-games");setNav("nb-games");});
    wrap.appendChild(h3); wrap.appendChild(p); wrap.appendChild(btn); el.appendChild(wrap); return;
  }
  var rc={"common":"#94a3b8","uncommon":"#4ade80","rare":"#60a5fa","epic":"#c084fc","legendary":"#fbbf24"};
  var hdr=document.createElement("div"); hdr.style.cssText="display:flex;justify-content:space-between;margin-bottom:1rem;font-size:.8rem;color:var(--t2);";
  hdr.innerHTML="<span>"+col.length+" cards</span><span>"+(S.totalAttempts||0)+" packs opened</span>";
  var grid=document.createElement("div"); grid.style.cssText="display:grid;grid-template-columns:repeat(3,1fr);gap:.65rem;";
  col.slice(0,30).forEach(function(card){
    var c2=rc[card.rarity]||"#94a3b8";
    var div=document.createElement("div");
    div.style.cssText="background:var(--s1);border:1.5px solid "+c2+"44;border-radius:12px;padding:.75rem .5rem;text-align:center;cursor:pointer;";
    div.innerHTML="<div style=\"font-size:1.8rem;margin-bottom:.3rem;\">"+(card.emoji||"🎴")+"</div>"+
      "<div style=\"font-size:.68rem;font-weight:700;line-height:1.2;\">"+(card.name||"Card")+"</div>"+
      "<div style=\"font-size:.6rem;color:"+c2+";margin-top:.2rem;text-transform:uppercase;\">"+(card.rarity||"common")+"</div>";
    div.addEventListener("click",function(){showToast((card.name||"Card")+" — "+(card.rarity||"common"));});
    grid.appendChild(div);
  });
  var outer=document.createElement("div"); outer.style.cssText="padding:.5rem 0;";
  outer.appendChild(hdr); outer.appendChild(grid); el.appendChild(outer);
};

window.renderCollection = function() {
  var el=document.getElementById("coll-content");
  if(el){el.innerHTML="<div id=\"prizes-content\"></div>"; renderPrizesScreen();}
  var cnt=document.getElementById("coll-count"); if(cnt) cnt.textContent=(S.collection||[]).length+" cards";
};

window.renderProfile = function() {
  var el=document.getElementById("profile-content"); if(!el) return;
  var xp  = S.xp||0;
  var lv  = typeof getLevelFromXP==="function"?getLevelFromXP(xp):1;
  var ttl = typeof getLevelTitle ==="function"?getLevelTitle(xp):"";
  var done= (S.completedChapters||[]).length;
  var mast= (S.masteredChapters||[]).length;
  var pro = typeof hasPro==="function"&&hasPro();
  var pp  = document.getElementById("pro-pill"); if(pp) pp.style.display=pro?"inline-flex":"none";
  el.innerHTML="";
  var outer=document.createElement("div"); outer.style.cssText="padding:1rem 1.2rem 2rem;";
  var av=document.createElement("div"); av.style.cssText="text-align:center;padding:1.5rem 0 1rem;";
  var avImg=document.createElement("div");
  avImg.style.cssText="width:80px;height:80px;border-radius:50%;margin:0 auto .75rem;"+
    "background:linear-gradient(135deg,var(--lime),var(--sky));"+
    "display:flex;align-items:center;justify-content:center;font-size:2.8rem;";
  avImg.textContent="⚽";
  var avName=document.createElement("div");
  avName.style.cssText="font-family:'Bebas Neue',sans-serif;font-size:2rem;line-height:1;";
  avName.textContent=S.name||"Player";
  var avPos=document.createElement("div"); avPos.style.cssText="font-size:.82rem;color:var(--t2);margin-top:.25rem;"; avPos.textContent=S.position||"All-Rounder";
  av.appendChild(avImg); av.appendChild(avName); av.appendChild(avPos);
  if(pro){var pb=document.createElement("div");pb.className="pill pa";pb.style.cssText="margin:.4rem auto 0;display:inline-block;";pb.textContent="⭐ Pro Player";av.appendChild(pb);}
  var sg=document.createElement("div"); sg.style.cssText="display:grid;grid-template-columns:1fr 1fr;gap:.7rem;margin-bottom:1rem;";
  [{l:"Level",v:String(lv),e:"🏆"},{l:"XP",v:xp.toLocaleString(),e:"⭐"},
   {l:"Streak",v:(S.streak||0)+" 🔥",e:"🔥"},{l:"Chapters",v:String(done),e:"📖"},
   {l:"Mastered",v:String(mast),e:"💎"},{l:"Cards",v:String((S.collection||[]).length),e:"🎴"}
  ].forEach(function(s){
    var c=document.createElement("div"); c.className="glass"; c.style.cssText="padding:.85rem;text-align:center;";
    var eD=document.createElement("div"); eD.style.cssText="font-size:1.4rem;margin-bottom:.25rem;"; eD.textContent=s.e;
    var vD=document.createElement("div");
    vD.style.cssText="font-family:'Bebas Neue',sans-serif;font-size:1.5rem;color:var(--lime);line-height:1;";
    vD.textContent=s.v;
    var lD=document.createElement("div"); lD.style.cssText="font-size:.68rem;color:var(--t2);text-transform:uppercase;letter-spacing:.07em;"; lD.textContent=s.l;
    c.appendChild(eD); c.appendChild(vD); c.appendChild(lD); sg.appendChild(c);
  });
  var rk=document.createElement("div"); rk.className="glass"; rk.style.cssText="padding:1rem;text-align:center;margin-bottom:1rem;";
  var rkL=document.createElement("div"); rkL.style.cssText="font-size:.72rem;color:var(--t2);margin-bottom:.3rem;text-transform:uppercase;letter-spacing:.1em;"; rkL.textContent="Rank";
  var rkV=document.createElement("div");
  rkV.style.cssText="font-family:'Bebas Neue',sans-serif;font-size:1.6rem;background:linear-gradient(135deg,var(--lime),var(--sky));"+
    "-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;";
  rkV.textContent=ttl;
  rk.appendChild(rkL); rk.appendChild(rkV);
  outer.appendChild(av); outer.appendChild(sg); outer.appendChild(rk);
  if(!pro){
    var pb2=document.createElement("button");
    pb2.style.cssText="width:100%;padding:1rem;border:none;border-radius:14px;"+
      "background:linear-gradient(135deg,var(--gold),#d97706);color:#000;"+
      "font-family:'DM Sans',sans-serif;font-weight:900;font-size:.95rem;cursor:pointer;margin-bottom:.75rem;";
    pb2.textContent="⭐ Upgrade to Pro — 2× XP, Unlimited Hearts";
    pb2.addEventListener("click",function(){showScreen("s-pro");});
    outer.appendChild(pb2);
  }
  var rb=document.createElement("button");
  rb.style.cssText="width:100%;padding:.7rem;border:1px solid rgba(255,94,138,.2);border-radius:11px;"+
    "background:transparent;color:var(--rose);font-family:'DM Sans',sans-serif;font-size:.8rem;font-weight:600;cursor:pointer;";
  rb.textContent="Reset Progress";
  rb.addEventListener("click",window._confirmReset);
  outer.appendChild(rb); el.appendChild(outer);
};

window._confirmReset = function() {
  if(confirm("Reset all progress? This cannot be undone.")) {
    if(typeof resetState==="function") resetState();
    showScreen("s-name");
    showToast("Progress reset. Starting fresh! ⚽");
  }
};

window.renderSettings = function() {
  var el=document.getElementById("settings-content"); if(!el) return;
  var st=S.settings||{};
  el.innerHTML="";
  var outer=document.createElement("div"); outer.style.cssText="padding:1rem 1.2rem 2rem;";
  [{label:"Sound effects",emoji:"🔊",key:"sound",on:st.sound!==false},
   {label:"Dark mode",emoji:"🌑",key:"darkMode",on:st.darkMode!==false},
   {label:"Reduced motion",emoji:"♿",key:"reducedMotion",on:!!st.reducedMotion}
  ].forEach(function(s){
    var row=document.createElement("div");
    row.style.cssText="display:flex;align-items:center;justify-content:space-between;padding:.9rem 0;border-bottom:1px solid var(--b1);";
    var left=document.createElement("div"); left.style.cssText="display:flex;align-items:center;gap:.65rem;";
    var eS=document.createElement("span"); eS.style.fontSize="1.2rem"; eS.textContent=s.emoji;
    var lS=document.createElement("span"); lS.style.fontWeight="600"; lS.textContent=s.label;
    left.appendChild(eS); left.appendChild(lS);
    var tog=document.createElement("div");
    tog.style.cssText="width:46px;height:26px;border-radius:13px;cursor:pointer;"+
      "background:"+(s.on?"var(--lime)":"rgba(255,255,255,.12)")+";position:relative;transition:background .2s;";
    var knob=document.createElement("div");
    knob.style.cssText="position:absolute;top:3px;"+(s.on?"right:3px":"left:3px")+";width:20px;height:20px;border-radius:50%;"+
      "background:"+(s.on?"#000":"rgba(255,255,255,.6)")+";transition:all .2s;";
    tog.appendChild(knob);
    (function(k){tog.addEventListener("click",function(){toggleSetting(k);});})(s.key);
    row.appendChild(left); row.appendChild(tog); outer.appendChild(row);
  });
  var sep=document.createElement("div"); sep.style.cssText="height:1px;background:var(--b1);margin:1.2rem 0;"; outer.appendChild(sep);
  var pc=document.createElement("div"); pc.className="glass"; pc.style.cssText="padding:1rem;margin-bottom:1rem;";
  var pT=document.createElement("div"); pT.style.cssText="font-weight:700;margin-bottom:.5rem;"; pT.textContent="Change Position";
  var pC=document.createElement("div"); pC.style.cssText="font-size:.82rem;color:var(--t2);margin-bottom:.75rem;";
  pC.innerHTML="Current: <strong style=\"color:var(--lime);\">"+(S.position||"None")+"</strong>";
  var pB=document.createElement("div"); pB.style.cssText="display:flex;flex-wrap:wrap;gap:.42rem;";
  ["Striker","Midfielder","Winger","Full-Back","Defender","Goalkeeper","All-Rounder"].forEach(function(p){
    var b=document.createElement("button"); var sel=S.position===p;
    b.style.cssText="padding:.35rem .75rem;border-radius:99px;font-size:.75rem;font-weight:700;cursor:pointer;"+
      "border:1px solid "+(sel?"var(--lime)":"var(--b2)")+";"+
      "background:"+(sel?"rgba(184,255,87,.1)":"var(--s1)")+";"+
      "color:"+(sel?"var(--lime)":"var(--t1)")+";";
    b.textContent=p;
    b.addEventListener("click",function(){S.position=p;if(typeof saveState==="function")saveState();renderSettings();showToast("Position: "+p);_updateHeader();});
    pB.appendChild(b);
  });
  pc.appendChild(pT); pc.appendChild(pC); pc.appendChild(pB); outer.appendChild(pc);
  var ft=document.createElement("div"); ft.style.cssText="font-size:.72rem;color:var(--t3);text-align:center;line-height:1.5;padding-top:.5rem;"; ft.textContent="Footy Brain v4 · Made with ⚽ & 🧠";
  outer.appendChild(ft); el.appendChild(outer);
};

window.toggleSetting = function(key) {
  if(!S.settings) S.settings={};
  S.settings[key]=!S.settings[key];
  if(typeof saveState==="function") saveState();
  if(key==="darkMode") document.documentElement.setAttribute("data-theme",S.settings.darkMode?"dark":"light");
  renderSettings();
};

window.showProModal = function() {
  showScreen("s-pro");
  var el=document.getElementById("pro-content"); if(!el) return;
  var pro=typeof hasPro==="function"&&hasPro();
  el.innerHTML="";
  if(pro){
    var pd=document.createElement("div"); pd.style.cssText="text-align:center;padding:3rem 1.5rem;";
    var pe=document.createElement("div"); pe.style.fontSize="4rem"; pe.textContent="⭐";
    var ph=document.createElement("h2");
    ph.style.cssText="font-family:'Bebas Neue',sans-serif;font-size:2.5rem;color:var(--gold);";
    ph.textContent="YOU'RE PRO!";
    var pp2=document.createElement("p"); pp2.style.color="var(--t2)"; pp2.textContent="Enjoy unlimited hearts, 2× XP and all Pro features!";
    pd.appendChild(pe); pd.appendChild(ph); pd.appendChild(pp2); el.appendChild(pd); return;
  }
  var outer=document.createElement("div"); outer.style.cssText="padding:1rem 1.2rem 2rem;";
  var hdr2=document.createElement("div"); hdr2.style.cssText="text-align:center;padding:1.5rem 0 1rem;";
  var he=document.createElement("div"); he.style.cssText="font-size:3.5rem;margin-bottom:.75rem;"; he.textContent="⭐";
  var hh=document.createElement("h2");
  hh.style.cssText="font-family:'Bebas Neue',sans-serif;font-size:2.2rem;background:linear-gradient(135deg,var(--gold),var(--amber));"+
    "-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:.3rem;";
  hh.textContent="FOOTY BRAIN PRO";
  var hp=document.createElement("p"); hp.style.cssText="color:var(--t2);font-size:.85rem;"; hp.textContent="Everything unlocked.";
  hdr2.appendChild(he); hdr2.appendChild(hh); hdr2.appendChild(hp);
  outer.appendChild(hdr2);
  [["❤️","Unlimited Hearts","Never run out — play as much as you want"],
   ["⚡","2× XP","Level up twice as fast"],
   ["🔥","Streak Freeze","One missed day protected per week"],
   ["🎴","Better Card Drops","3× higher chance of epic and legendary"],
   ["👑","Pro Badge","Exclusive profile badge"]
  ].forEach(function(f){
    var row=document.createElement("div");
    row.style.cssText="display:flex;align-items:center;gap:.85rem;padding:.72rem 0;border-bottom:1px solid var(--b1);";
    var fE=document.createElement("div"); fE.style.cssText="font-size:1.4rem;width:2rem;text-align:center;flex-shrink:0;"; fE.textContent=f[0];
    var fI=document.createElement("div");
    var fN=document.createElement("div"); fN.style.cssText="font-weight:700;font-size:.88rem;"; fN.textContent=f[1];
    var fD=document.createElement("div"); fD.style.cssText="font-size:.74rem;color:var(--t2);"; fD.textContent=f[2];
    fI.appendChild(fN); fI.appendChild(fD);
    row.appendChild(fE); row.appendChild(fI); outer.appendChild(row);
  });
  var btns=document.createElement("div"); btns.style.cssText="margin-top:1.5rem;display:flex;flex-direction:column;gap:.65rem;";
  var tb=document.createElement("button");
  tb.style.cssText="width:100%;padding:1rem;border:none;border-radius:14px;"+
    "background:linear-gradient(135deg,var(--gold),#d97706);color:#000;"+
    "font-family:'DM Sans',sans-serif;font-weight:900;font-size:1rem;cursor:pointer;";
  tb.textContent="⭐ Try 7 Days Free Then £24.99/yr";
  tb.addEventListener("click",window._startProTrial);
  var mb=document.createElement("button");
  mb.style.cssText="width:100%;padding:.9rem;border:1px solid rgba(251,191,36,.25);border-radius:14px;"+
    "background:rgba(251,191,36,.07);color:var(--gold);font-family:'DM Sans',sans-serif;font-weight:700;font-size:.9rem;cursor:pointer;";
  mb.textContent="Monthly — £3.99/month";
  mb.addEventListener("click",function(){window._buyPro("monthly");});
  var nt=document.createElement("div"); nt.style.cssText="text-align:center;font-size:.72rem;color:var(--t3);"; nt.textContent="Cancel anytime · All prices include VAT";
  btns.appendChild(tb); btns.appendChild(mb); btns.appendChild(nt);
  outer.appendChild(btns); el.appendChild(outer);
};

window._startProTrial=function(){if(typeof grantPro==="function")grantPro(7*24*60*60*1000);showToast("🎉 7-day Pro trial started!");renderProfile();showScreen("s-profile");};
window._buyPro=function(p){var d=p==="monthly"?30*24*60*60*1000:365*24*60*60*1000;if(typeof grantPro==="function")grantPro(d);showToast("⭐ Pro activated!");renderProfile();showScreen("s-profile");};

var GAME_LIST_DEFS=[
  {id:"penalty", name:"Penalty Shootout",  emoji:"⚽",         desc:"3D goal · Aim & charge"},
  {id:"offside",  name:"Offside Trap",       emoji:"🚩", desc:"8 law scenarios"},
  {id:"freekick", name:"Free Kick Master",   emoji:"🌀", desc:"Wall · Wind · Curl"},
  {id:"rondo",    name:"Rondo IQ",           emoji:"🎯", desc:"Live tactical drill"},
  {id:"scanning", name:"Scanning Vision",    emoji:"👁", desc:"Formation flash"},
  {id:"header",   name:"Aerial Duel",        emoji:"💥", desc:"Jump timing · 5 rounds"}
];

window.renderGamesScreen=function(){
  var grid=document.getElementById("game-grid"); if(!grid) return;
  grid.innerHTML="";
  GAME_LIST_DEFS.forEach(function(g){
    var div=document.createElement("div");
    div.style.cssText="background:var(--s1);border:1.5px solid var(--b2);border-radius:16px;padding:1rem .75rem;cursor:pointer;text-align:center;transition:all .15s;-webkit-tap-highlight-color:transparent;";
    var eD=document.createElement("div"); eD.style.cssText="font-size:2rem;margin-bottom:.35rem;"; eD.textContent=g.emoji;
    var nD=document.createElement("div"); nD.style.cssText="font-weight:800;font-size:.82rem;line-height:1.2;color:var(--t1);"; nD.textContent=g.name;
    var dD=document.createElement("div"); dD.style.cssText="font-size:.65rem;color:var(--t2);margin-top:.2rem;"; dD.textContent=g.desc;
    div.appendChild(eD); div.appendChild(nD); div.appendChild(dD);
    div.addEventListener("mouseenter",function(){this.style.borderColor="var(--lime)";this.style.background="rgba(255,255,255,.07)";});
    div.addEventListener("mouseleave",function(){this.style.borderColor="var(--b2)";this.style.background="var(--s1)";});
    (function(id){div.addEventListener("click",function(){startGame(id);});})(g.id);
    grid.appendChild(div);
  });
  var sel=document.getElementById("game-selector"),act=document.getElementById("game-active");
  if(sel) sel.style.display="";
  if(act) act.style.display="none";
};

window.startGame=function(name){
  var sel=document.getElementById("game-selector"),act=document.getElementById("game-active");
  if(sel) sel.style.display="none";
  if(act) act.style.display="";
  if(typeof showGame==="function") showGame(name);
};

window.closeGame=function(){
  if(typeof _activeGameCleanup==="function"){try{_activeGameCleanup();}catch(e){}}
  window._activeGameCleanup=null;
  var sel=document.getElementById("game-selector"),act=document.getElementById("game-active");
  if(sel) sel.style.display="";
  if(act){act.style.display="none";var gc=document.getElementById("game-container");if(gc)gc.innerHTML="";}
};

window.renderDrillsScreen=function(){
  var el=document.getElementById("drills-content"); if(!el) return;
  var drill=typeof getTodaysDrill==="function"?getTodaysDrill():null;
  var pd=typeof getDrillsForPosition==="function"?getDrillsForPosition(S.position||"All-Rounder").slice(0,6):[];
  if(!drill){el.innerHTML="<div style='padding:2rem;text-align:center;color:var(--t2);'>Drills loading...</div>";return;}
  var dL=["","Beginner","Intermediate","Advanced","Elite"];
  var dC=["","var(--lime)","var(--sky)","var(--amber)","var(--rose)"];
  el.innerHTML="";
  var outer=document.createElement("div"); outer.style.cssText="padding:1rem 0;";
  var card=document.createElement("div"); card.className="glass"; card.style.cssText="padding:1.25rem;margin-bottom:1rem;";
  var ch2=document.createElement("div");
  ch2.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem;";
  var lbl=document.createElement("div");
  lbl.style.cssText="font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--amber);";
  lbl.textContent="📅 TODAY'S DRILL";
  var db=document.createElement("span");
  db.style.cssText="background:rgba(255,182,39,.1);border:1px solid rgba(255,182,39,.2);color:var(--amber);font-size:.65rem;font-weight:700;padding:.18rem .55rem;border-radius:99px;";
  db.textContent=dL[drill.difficulty]||"Intermediate";
  ch2.appendChild(lbl); ch2.appendChild(db);
  var dtitle=document.createElement("div");
  dtitle.style.cssText="font-family:'Bebas Neue',sans-serif;font-size:1.6rem;line-height:1;margin-bottom:.25rem;";
  dtitle.textContent=drill.title||"";
  var dtag=document.createElement("div"); dtag.style.cssText="font-size:.75rem;color:var(--t2);margin-bottom:.85rem;font-style:italic;"; dtag.textContent="“"+(drill.tagline||"")+"”";
  var ddesc=document.createElement("div"); ddesc.style.cssText="font-size:.85rem;line-height:1.65;color:rgba(240,244,255,.7);margin-bottom:.85rem;"; ddesc.textContent=drill.description||drill.desc||"";
  card.appendChild(ch2); card.appendChild(dtitle); card.appendChild(dtag); card.appendChild(ddesc);
  if(drill.steps&&drill.steps.length){
    var sH=document.createElement("div"); sH.style.cssText="font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--t2);margin-bottom:.5rem;"; sH.textContent="Steps";
    var sL=document.createElement("div"); sL.style.cssText="display:flex;flex-direction:column;gap:.38rem;margin-bottom:.85rem;";
    drill.steps.forEach(function(step,i){
      var r=document.createElement("div"); r.style.cssText="display:flex;align-items:flex-start;gap:.65rem;padding:.6rem .8rem;background:var(--s1);border:1px solid var(--b1);border-radius:10px;";
      var n=document.createElement("span"); n.style.cssText="min-width:20px;height:20px;border-radius:50%;background:var(--lime);color:#000;font-size:.65rem;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;"; n.textContent=String(i+1);
      var t=document.createElement("span"); t.style.cssText="font-size:.82rem;line-height:1.45;"; t.textContent=step;
      r.appendChild(n); r.appendChild(t); sL.appendChild(r);
    });
    card.appendChild(sH); card.appendChild(sL);
  }
  if(drill.coaching_tip){
    var tip=document.createElement("div");
    tip.style.cssText="background:rgba(94,223,255,.07);border:1px solid rgba(94,223,255,.15);border-radius:10px;padding:.75rem .9rem;";
    var tipH=document.createElement("div"); tipH.style.cssText="font-size:.65rem;font-weight:700;color:var(--sky);margin-bottom:.25rem;"; tipH.textContent="💡 COACHING TIP";
    var tipT=document.createElement("div"); tipT.style.cssText="font-size:.8rem;line-height:1.5;color:rgba(240,244,255,.7);"; tipT.textContent=drill.coaching_tip;
    tip.appendChild(tipH); tip.appendChild(tipT); card.appendChild(tip);
  }
  outer.appendChild(card);
  if(pd.length){
    var mH=document.createElement("div"); mH.style.cssText="font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--t2);margin-bottom:.6rem;"; mH.textContent="More for "+(S.position||"All Positions");
    outer.appendChild(mH);
    var mL=document.createElement("div"); mL.style.cssText="display:flex;flex-direction:column;gap:.5rem;padding-bottom:1.5rem;";
    pd.forEach(function(d){
      var row=document.createElement("div");
      row.style.cssText="background:var(--s1);border:1px solid var(--b1);border-radius:12px;padding:.85rem;cursor:pointer;transition:all .14s;";
      var top=document.createElement("div"); top.style.cssText="display:flex;align-items:center;justify-content:space-between;";
      var tn=document.createElement("div"); tn.style.cssText="font-weight:700;font-size:.88rem;"; tn.textContent=d.title||"";
      var td=document.createElement("span"); td.style.cssText="color:"+(dC[d.difficulty]||"var(--t2)")+";font-size:.7rem;font-weight:700;"; td.textContent=dL[d.difficulty]||"";
      top.appendChild(tn); top.appendChild(td);
      var ts=document.createElement("div"); ts.style.cssText="font-size:.74rem;color:var(--t2);"; ts.textContent=d.tagline||"";
      var exp=document.createElement("div"); exp.className="drill-expand"; exp.style.cssText="display:none;margin-top:.65rem;font-size:.82rem;line-height:1.6;color:rgba(240,244,255,.7);"; exp.textContent=d.description||d.desc||"";
      row.appendChild(top); row.appendChild(ts); row.appendChild(exp);
      row.addEventListener("click",function(){window.expandDrill(row);});
      mL.appendChild(row);
    });
    outer.appendChild(mL);
  }
  el.appendChild(outer);
};

window.expandDrill=function(el){var exp=el.querySelector(".drill-expand");if(!exp)return;var open=exp.style.display!=="none";exp.style.display=open?"none":"block";el.style.borderColor=open?"var(--b1)":"var(--lime)";};

document.addEventListener("DOMContentLoaded", function() {
  console.log("[FB] DOMContentLoaded fired");
  if(typeof loadState==="function") loadState();
  console.log("[FB] S.name="+S.name+" S.position="+S.position);
  document.documentElement.setAttribute("data-theme",(!S.settings||S.settings.darkMode!==false)?"dark":"light");
  if(S.name&&S.position){
    console.log("[FB] returning user -> s-path");
    if(typeof checkStreak==="function") checkStreak();
    _updateHeader();
    if(typeof renderPath==="function") renderPath();
    if(typeof renderDailyBanner==="function") renderDailyBanner();
    showScreen("s-path"); setNav("nb-path");
  } else if(S.name){
    console.log("[FB] has name -> s-pos");
    _buildPositionGrid(); showScreen("s-pos");
  } else {
    console.log("[FB] new user -> s-name");
    showScreen("s-name");
  }
  var inp=document.getElementById("inp-name");
  if(inp){
    inp.addEventListener("focus",function(){inp.style.borderColor="var(--lime)";});
    inp.addEventListener("blur", function(){inp.style.borderColor="var(--b2)";});
    inp.addEventListener("keydown",function(e){if(e.key==="Enter") saveName();});
    console.log("[FB] inp-name bound OK");
  } else {
    console.error("[FB] inp-name NOT FOUND - check HTML");
  }
  window.addEventListener("beforeinstallprompt",function(e){
    e.preventDefault();
    var btn=document.createElement("button");
    btn.textContent="📲 Install App";
    btn.style.cssText="position:fixed;top:1rem;right:1rem;z-index:200;background:var(--amber);color:#000;"+
      "border:none;font-weight:700;font-size:.78rem;padding:.45rem .9rem;border-radius:99px;"+
      "cursor:pointer;font-family:'DM Sans',sans-serif;";
    btn.onclick=function(){e.prompt();e.userChoice.then(function(){btn.remove();});};
    document.body.appendChild(btn);
  });
  if("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(function(){});
  console.log("[FB] init complete");
});
