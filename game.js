let day = 1;

let stats = {
  people: 50,
  army: 50,
  treasury: 50,
  relations: 50
};

/* OYUN HAFIZASI */
let flags = {
  raisedTaxes: false,
  supportedArmy: false,
  festivalHeld: false
};

/* UI SCREEN SWITCH */
function switchScreen(id) {
  document.querySelectorAll(".screen").forEach(s =>
    s.classList.remove("active")
  );
  document.getElementById(id).classList.add("active");
}

/* EVENTLER */
const events = [
  {
    id: "tax",
    title: "Danışman",
    text: "Vergileri artırmak istiyoruz.",
    portrait: "https://i.imgur.com/8Qf4KQp.png",
    yes() {
      flags.raisedTaxes = true;
      return { treasury:+15, people:-15 };
    },
    no() {
      return { relations:+5 };
    }
  },
  {
    id: "army",
    title: "General",
    text: "Orduya daha fazla bütçe.",
    portrait: "https://i.imgur.com/Z6aXnqE.png",
    yes() {
      flags.supportedArmy = true;
      return { army:+15, treasury:-10 };
    },
    no() {
      return { army:-10 };
    }
  },
  {
    id: "festival",
    title: "Halk",
    text: "Festival düzenleyelim.",
    portrait: "https://i.imgur.com/1Xf0F8k.png",
    yes() {
      flags.festivalHeld = true;
      return { people:+15, treasury:-15 };
    },
    no() {
      return { people:-10 };
    }
  },
  {
    id: "revolt",
    requires: () => flags.raisedTaxes && stats.people < 40,
    title: "İsyan Kıvılcımı",
    text: "Halk sokaklara dökülüyor.",
    portrait: "https://i.imgur.com/1Xf0F8k.png",
    rare: true,
    yes() {
      return { people:-20, army:-10 };
    },
    no() {
      return { people:-30 };
    }
  },
  {
    id: "coup",
    requires: () => flags.supportedArmy && stats.army > 70,
    title: "Sessiz Darbe",
    text: "Ordu seni test ediyor.",
    portrait: "https://i.imgur.com/Z6aXnqE.png",
    rare: true,
    yes() {
      return { army:-20, relations:+10 };
    },
    no() {
      return { army:-40 };
    }
  }
];

let currentEvent = null;
let startX = 0;

/* UI */
function updateUI() {
  peopleBar.style.width = stats.people + "%";
  armyBar.style.width = stats.army + "%";
  treasuryBar.style.width = stats.treasury + "%";
  relationsBar.style.width = stats.relations + "%";
  day.textContent = `Gün ${day}`;
}

/* EVENT SEÇ */
function loadEvent() {
  let available = events.filter(e => !e.requires || e.requires());
  let pool = available.filter(e => !e.rare || Math.random() < 0.25);

  currentEvent = pool[Math.floor(Math.random() * pool.length)];

  cardTitle.textContent = currentEvent.title;
  cardText.textContent = currentEvent.text;
  portrait.src = currentEvent.portrait;
}

/* SONUÇ */
function applyResult(result) {
  for (let k in result) {
    stats[k] += result[k];
    stats[k] = Math.max(0, Math.min(100, stats[k]));
    if (stats[k] === 0) return endGame(k);
  }
}

/* BİTİŞ */
function endGame(reason) {
  const endings = {
    people: ["İsyan", "Halk seni devirdi."],
    army: ["Darbe", "Ordu yönetime el koydu."],
    treasury: ["İflas", "Krallık çöktü."],
    relations: ["Yalnızlık", "Herkes seni terk etti."]
  };

  endTitle.textContent = endings[reason][0];
  endText.textContent = endings[reason][1];
  clearSave();
  switchScreen("end");
}

/* KARAR */
function choose(type) {
  card.classList.add(type === "yes" ? "right" : "left");

  setTimeout(() => {
    const result = currentEvent[type]();
    applyResult(result);

    day++;
    if (day > 30) {
      endTitle.textContent = "Efsane Kral";
      endText.textContent = "30 gün hayatta kaldın.";
      clearSave();
      switchScreen("end");
      return;
    }

    saveGame();
    updateUI();
    loadEvent();
    card.className = "card";
  }, 250);
}

/* SAVE */
function saveGame() {
  localStorage.setItem("kingGame", JSON.stringify({ day, stats, flags }));
}

function loadGame() {
  const data = JSON.parse(localStorage.getItem("kingGame"));
  if (!data) return false;
  day = data.day;
  stats = data.stats;
  flags = data.flags;
  return true;
}

function clearSave() {
  localStorage.removeItem("kingGame");
}

/* INPUT */
card.addEventListener("touchstart", e => startX = e.touches[0].clientX);
card.addEventListener("touchend", e => {
  let diff = e.changedTouches[0].clientX - startX;
  if (diff > 60) choose("yes");
  if (diff < -60) choose("no");
});

document.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") choose("yes");
  if (e.key === "ArrowLeft") choose("no");
});

/* BAŞLAT */
function startGame() {
  switchScreen("game");

  if (!loadGame()) {
    day = 1;
    stats = { people:50, army:50, treasury:50, relations:50 };
    flags = { raisedTaxes:false, supportedArmy:false, festivalHeld:false };
  }

  updateUI();
  loadEvent();
}
