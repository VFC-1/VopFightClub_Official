
const VFC_KEY = "vfc_site_data_v2";
const OWNER_PASSWORD = "vfc2025"; // Change this before uploading if you want.
const GOOGLE_FORM_LINK = "https://forms.gle/PASTE-YOUR-GOOGLE-FORM-LINK-HERE";

const divisions = [
  {id:"heavy", title:"Heavyweight Division", subtitle:"180 lbs and Above"},
  {id:"middle", title:"Middleweight Division", subtitle:"150 - 180 lbs"},
  {id:"light", title:"Lightweight Division", subtitle:"150 lbs and Below"}
];

const tiers = [
  {id:"contender", title:"✅ Contender Tier"},
  {id:"chud", title:"😂 Chud Tier"}
];

function defaultData(){
  const data = {fighters:{}, champions:{}};
  divisions.forEach(d=>{
    data.champions[d.id] = {name:""};
    tiers.forEach(t=>{
      for(let i=1;i<=3;i++){
        const id = `${d.id}-${t.id}-${i}`;
        data.fighters[id] = {id, division:d.id, tier:t.id, name:"", wins:"", losses:"", kos:"", bio:"", photo:""};
      }
    });
  });
  return data;
}

function getData(){
  const saved = localStorage.getItem(VFC_KEY);
  if(!saved) return defaultData();
  const data = JSON.parse(saved);
  const def = defaultData();
  data.fighters = {...def.fighters, ...(data.fighters || {})};
  data.champions = {...def.champions, ...(data.champions || {})};
  return data;
}

function saveData(data){ localStorage.setItem(VFC_KEY, JSON.stringify(data)); }
function fighterPageUrl(id){ return `fighter.html?id=${encodeURIComponent(id)}`; }
function isEditor(){ return sessionStorage.getItem("vfc_editor_unlocked") === "true"; }

function renderRankings(){
  const root = document.getElementById("rankings-root");
  if(!root) return;
  const data = getData();
  root.innerHTML = "";

  divisions.forEach(d=>{
    const section = document.createElement("section");
    section.className = "division";
    section.id = d.id;

    section.innerHTML = `
      <h2 class="division-title">${d.title}</h2>
      <p class="subtitle">${d.subtitle}</p>
      <div class="champion">
        <div class="belt">VFC CHAMPIONSHIP BELT</div>
        <h3>🏆 ${d.title.replace(" Division","")} Champion</h3>
        <input class="big-input champ-input" data-division="${d.id}" placeholder="Champion name" value="${data.champions[d.id]?.name || ""}">
      </div>
      <div class="grid tier-grid"></div>
    `;

    const grid = section.querySelector(".tier-grid");

    tiers.forEach(t=>{
      const card = document.createElement("div");
      card.className = "tier-card";
      card.dataset.division = d.id;
      card.dataset.tier = t.id;
      card.innerHTML = `<h3>${t.title}</h3><ul class="fighter-list"></ul>`;
      const list = card.querySelector(".fighter-list");

      Object.values(data.fighters)
        .filter(f=>f.division===d.id && f.tier===t.id)
        .forEach((f, index)=> list.appendChild(renderFighter(f, index)));

      grid.appendChild(card);
    });

    root.appendChild(section);
  });

  addInputSaving();
  addDragAndDrop();
  applyEditLock();
}

function renderFighter(f, index){
  const li = document.createElement("li");
  li.className = "fighter";
  li.draggable = true;
  li.dataset.id = f.id;

  li.innerHTML = `
    <div class="fighter-top">
      <span class="rank">${index + 1}.</span>
      <input class="name-input" data-field="name" data-id="${f.id}" placeholder="Fighter name" value="${f.name || ""}">
      <a class="profile-link" href="${fighterPageUrl(f.id)}">Bio</a>
    </div>
    <div class="stats">
      <input data-field="wins" data-id="${f.id}" placeholder="Wins" value="${f.wins || ""}">
      <input data-field="losses" data-id="${f.id}" placeholder="Losses" value="${f.losses || ""}">
      <input data-field="kos" data-id="${f.id}" placeholder="KOs" value="${f.kos || ""}">
    </div>
  `;
  return li;
}

function addInputSaving(){
  document.querySelectorAll("[data-field][data-id]").forEach(input=>{
    input.addEventListener("input", e=>{
      if(!isEditor()) return;
      const data = getData();
      const id = e.target.dataset.id;
      const field = e.target.dataset.field;
      data.fighters[id][field] = e.target.value;
      saveData(data);
    });
  });

  document.querySelectorAll(".champ-input").forEach(input=>{
    input.addEventListener("input", e=>{
      if(!isEditor()) return;
      const data = getData();
      const division = e.target.dataset.division;
      data.champions[division].name = e.target.value;
      saveData(data);
    });
  });
}

function addDragAndDrop(){
  let dragged = null;

  document.querySelectorAll(".fighter").forEach(item=>{
    item.addEventListener("dragstart",(e)=>{
      if(!isEditor()){ e.preventDefault(); return; }
      dragged = item;
    });
  });

  document.querySelectorAll(".fighter-list").forEach(list=>{
    list.addEventListener("dragover", e=>{
      if(!isEditor()) return;
      e.preventDefault();
      list.classList.add("drag-over");
      const after = getDragAfterElement(list, e.clientY);
      if(after == null) list.appendChild(dragged);
      else list.insertBefore(dragged, after);
    });

    list.addEventListener("dragleave",()=>list.classList.remove("drag-over"));

    list.addEventListener("drop", e=>{
      if(!isEditor()) return;
      e.preventDefault();
      list.classList.remove("drag-over");
      saveOrderFromDom();
      updateRanks();
    });
  });
}

function getDragAfterElement(container, y){
  const els = [...container.querySelectorAll(".fighter")];
  return els.reduce((closest, child)=>{
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if(offset < 0 && offset > closest.offset) return {offset, element:child};
    return closest;
  }, {offset:Number.NEGATIVE_INFINITY}).element;
}

function saveOrderFromDom(){
  if(!isEditor()) return;
  const data = getData();
  document.querySelectorAll(".tier-card").forEach(card=>{
    const division = card.dataset.division;
    const tier = card.dataset.tier;
    card.querySelectorAll(".fighter").forEach(item=>{
      const id = item.dataset.id;
      data.fighters[id].division = division;
      data.fighters[id].tier = tier;
    });
  });
  saveData(data);
}

function updateRanks(){
  document.querySelectorAll(".fighter-list").forEach(list=>{
    list.querySelectorAll(".fighter").forEach((item, index)=>{
      item.querySelector(".rank").textContent = `${index + 1}.`;
    });
  });
}

function renderFighterProfile(){
  const root = document.getElementById("fighter-profile-root");
  if(!root) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const data = getData();
  const f = data.fighters[id];

  if(!f){
    root.innerHTML = `<div class="panel"><h2>Fighter not found</h2><a class="button" href="rankings.html">Back to Rankings</a></div>`;
    return;
  }

  root.innerHTML = `
    <div class="profile-layout">
      <div class="photo-box">
        <img class="photo-preview" id="photo-preview" alt="Fighter photo">
        <p class="note">Insert fighter picture</p>
        <input type="file" id="photo-input" accept="image/*">
      </div>
      <div class="panel">
        <h1>Fighter Bio</h1>
        <label>Name</label>
        <input class="big-input" id="profile-name" value="${f.name || ""}" placeholder="Fighter name">

        <div class="grid">
          <div><label>Wins</label><input class="big-input" id="profile-wins" value="${f.wins || ""}" placeholder="0"></div>
          <div><label>Losses</label><input class="big-input" id="profile-losses" value="${f.losses || ""}" placeholder="0"></div>
          <div><label>KOs</label><input class="big-input" id="profile-kos" value="${f.kos || ""}" placeholder="0"></div>
        </div>

        <label>Bio</label>
        <textarea id="profile-bio" placeholder="Write this fighter's bio here...">${f.bio || ""}</textarea>
        <a class="button" href="rankings.html">Back to Rankings</a>
      </div>
    </div>
  `;

  const preview = document.getElementById("photo-preview");
  if(f.photo){
    preview.src = f.photo;
    preview.style.display = "block";
  }

  function saveProfile(){
    if(!isEditor()) return;
    const data = getData();
    data.fighters[id].name = document.getElementById("profile-name").value;
    data.fighters[id].wins = document.getElementById("profile-wins").value;
    data.fighters[id].losses = document.getElementById("profile-losses").value;
    data.fighters[id].kos = document.getElementById("profile-kos").value;
    data.fighters[id].bio = document.getElementById("profile-bio").value;
    saveData(data);
  }

  ["profile-name","profile-wins","profile-losses","profile-kos","profile-bio"].forEach(el=>{
    document.getElementById(el).addEventListener("input", saveProfile);
  });

  document.getElementById("photo-input").addEventListener("change", e=>{
    if(!isEditor()) return;
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      const data = getData();
      data.fighters[id].photo = reader.result;
      saveData(data);
      preview.src = reader.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  applyEditLock();
}

function setupCalloutButton(){
  const btn = document.getElementById("callout-link");
  if(!btn) return;
  btn.href = GOOGLE_FORM_LINK;
  btn.target = "_blank";
}

function applyEditLock(){
  const editableRoots = [
    document.getElementById("rankings-root"),
    document.getElementById("fighter-profile-root")
  ].filter(Boolean);

  editableRoots.forEach(root=>{
    if(isEditor()) root.classList.remove("locked");
    else root.classList.add("locked");
  });

  const status = document.getElementById("edit-status");
  const msg = document.querySelector(".lock-message");
  if(status) status.textContent = isEditor() ? "Edit mode unlocked" : "Read-only mode";
  if(msg){
    msg.textContent = isEditor()
      ? "You can edit names, stats, bios, pictures, and rankings."
      : "Editing is locked for viewers.";
  }
}

function setupAdminControls(){
  const unlock = document.getElementById("unlock-edit");
  const lock = document.getElementById("lock-edit");
  const pass = document.getElementById("admin-password");

  if(unlock){
    unlock.addEventListener("click", ()=>{
      if(pass.value === OWNER_PASSWORD){
        sessionStorage.setItem("vfc_editor_unlocked", "true");
        pass.value = "";
        applyEditLock();
      } else alert("Wrong password.");
    });
  }

  if(lock){
    lock.addEventListener("click", ()=>{
      sessionStorage.removeItem("vfc_editor_unlocked");
      applyEditLock();
    });
  }

  applyEditLock();
}

document.addEventListener("DOMContentLoaded", ()=>{
  renderRankings();
  renderFighterProfile();
  setupCalloutButton();
  setupAdminControls();
});
