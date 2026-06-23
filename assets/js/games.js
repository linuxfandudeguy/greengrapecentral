
/* =========================
   SOURCES
========================= */

const GN_SOURCE =
"https://cdn.jsdelivr.net/gh/freebuisness/assets@main/zones.json";

const GN_HTML =
"https://cdn.statically.io/gh/freebuisness/html@main/";

const GN_COVER =
"https://cdn.statically.io/gh/freebuisness/covers@main/";

const SEA_SOURCE =
"https://cdn.jsdelivr.net/gh/sea-bean-unblocked/sde@main/zzz.json";

const SEA_HTML =
"https://cdn.jsdelivr.net/gh/sea-bean-unblocked/Singlemile@main/games/";

const SEA_COVER =
"https://cdn.jsdelivr.net/gh/sea-bean-unblocked/Singlemile@main/Icon/";

const UGS_SOURCE =
"https://gcore.jsdelivr.net/gh/tharun9772/ugs-2/";

const UGS_HTML =
"https://gcore.jsdelivr.net/gh/tharun9772/ugs-2/";

const UGS_COVER =
"https://cdn.jsdelivr.net/gh/tharun9772/game-assets@main/5968517.png";

/* =========================
   STATE
========================= */

let games = [];
let launchCache = new Map();
let currentSource = "gn";

/* =========================
   STATUS
========================= */

const statusBox = document.getElementById("status");

function showStatus(t){
  statusBox.textContent = t;
  statusBox.style.display = "block";
}

function hideStatus(){
  setTimeout(()=>statusBox.style.display="none",800);
}

/* =========================
   HELPERS
========================= */

/* GN */
function resolveGN(g){
  return {
    name: g.name,
    desc: g.author ? `by ${g.author}` : "",
    cover: decodeURIComponent(g.cover || "")
      .replace("{COVER_URL}", GN_COVER),
    url: decodeURIComponent(g.url || "")
      .replace("{HTML_URL}", GN_HTML)
      .replace("{COVER_URL}", GN_COVER)
  };
}

/* SEA */
function resolveSEA(g){
  return {
    name: g.name,
    desc: g.author ? `by ${g.author}` : "",
    cover: (g.cover || "").replace("{COVER_URL}", SEA_COVER),
    url: (g.url || "")
      .replace("{HTML_URL}", SEA_HTML)
      .replace("{COVER_URL}", SEA_COVER)
  };
}

/* UGS - directory based */
function resolveUGS(h){

  let file = h.split("/").pop() || h;

  file = file.replace(".html", "");
  file = file.replace(/^cl/i, "");

  return {
    name: file,
    desc: "",
    cover: UGS_COVER,
    url: UGS_HTML + file + ".html"
  };
}

/* =========================
   LOAD SOURCES
========================= */

async function load(){

  showStatus("Loading...");

  let data = [];

  if(currentSource === "gn"){

    const res = await fetch(GN_SOURCE);
    const json = await res.json();
    data = json.map(resolveGN);

  }

  else if(currentSource === "sea"){

    const res = await fetch(SEA_SOURCE);
    const json = await res.json();
    data = json.map(resolveSEA);

  }

  else if(currentSource === "ugs"){

    const res = await fetch(UGS_SOURCE);
    const html = await res.text();

    const doc = new DOMParser()
      .parseFromString(html, "text/html");

    const links = [...doc.querySelectorAll("a")]
      .map(a => a.getAttribute("href"))
      .filter(h => h && h.includes(".html") && !h.includes("index"));

    data = links.map(resolveUGS);
  }

  games = data;

  render();
  hideStatus();
  preload();
}

/* =========================
   PRELOAD CACHE
========================= */

async function preload(){

  launchCache.clear();

  showStatus("Preloading...");

  for(const g of games){

    try{

      const res = await fetch(g.url);
      const html = await res.text();

      const blob = new Blob([html], {type:"text/html"});
      const blobUrl = URL.createObjectURL(blob);

      launchCache.set(g.url, blobUrl);

    } catch(e){}

  }

  hideStatus();
}

/* =========================
   LAUNCH
========================= */

async function launch(game){

  const cached = launchCache.get(game.url);

  if(cached){
    window.open(cached, "_blank");
    return;
  }

  try{

    showStatus("Loading...");

    const res = await fetch(game.url);
    const html = await res.text();

    const blob = new Blob([html], {type:"text/html"});
    const blobUrl = URL.createObjectURL(blob);

    launchCache.set(game.url, blobUrl);

    window.open(blobUrl, "_blank");

  } catch(e){
    showStatus("Failed ❌");
  }

  hideStatus();
}

/* =========================
   RENDER
========================= */

function render(){

  const el = document.getElementById("games");
  el.innerHTML = "";

  for(const g of games){

    const card = document.createElement("div");
    card.className = "game";

    card.innerHTML = `
      <img src="${g.cover}"
           loading="lazy"
           onerror="this.src='https://cdn.jsdelivr.net/gh/linuxfandudeguy/greengrapecentral@main/assets/images/dummy_600x400_000000_6ddb9d_no-cover-sorry.png'">

      <div class="game-body">
        <div class="game-title">${g.name}</div>
        <div class="game-desc">${g.desc}</div>
      </div>
    `;

    card.onclick = () => launch(g);

    el.appendChild(card);
  }
}

/* =========================
   DROPDOWN
========================= */

document.getElementById("sourceSelect")
.addEventListener("change", (e)=>{

  currentSource = e.target.value;
  launchCache.clear();
  load();

});

/* =========================
   INIT
========================= */

load();
