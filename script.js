// ===== EASY EDIT SECTION =====

// Put your Google Form link here
const GOOGLE_FORM_LINK = "https://forms.gle/PASTE-YOUR-LINK";

// Edit fighters here
const VFC_DATA = {
  divisions: [
    {
      id: "heavy",
      name: "Heavyweight Division",
      weight: "180 lbs and Above",
      champion: {
        name: "TBA",
        wins: "0",
        losses: "0",
        kos: "0",
        bio: ""
      },
      contender: [
        { name: "TBA", wins: "0", losses: "0", kos: "0", bio: "" },
        { name: "TBA", wins: "0", losses: "0", kos: "0", bio: "" },
        { name: "TBA", wins: "0", losses: "0", kos: "0", bio: "" }
      ],
      chud: [
        { name: "TBA", wins: "0", losses: "0", kos: "0", bio: "" },
        { name: "TBA", wins: "0", losses: "0", kos: "0", bio: "" },
        { name: "TBA", wins: "0", losses: "0", kos: "0", bio: "" }
      ]
    },

    {
      id: "middle",
      name: "Middleweight Division",
      weight: "150 - 180 lbs",
      champion: {
        name: "TBA",
        wins: "0",
        losses: "0",
        kos: "0",
        bio: ""
      },
      contender: [
        { name: "TBA", wins: "0", losses: "0", kos: "0", bio: "" },
        { name: "TBA", wins: "0", losses: "0", kos: "0", bio: "" },
        { name: "TBA", wins: "0", losses: "0", kos: "0", bio: "" }
      ],
      chud: [
        { name: "TBA", wins: "0", losses: "0", kos: "0", bio: "" },
        { name: "TBA", wins: "0", losses: "0", kos: "0", bio: "" },
        { name: "TBA", wins: "0", losses: "0", kos: "0", bio: "" }
      ]
    },

    {
      id: "light",
      name: "Lightweight Division",
      weight: "150 lbs and Below",
      champion: {
        name: "TBA",
        wins: "0",
        losses: "0",
        kos: "0",
        bio: ""
      },
      contender: [
        { name: "TBA", wins: "0", losses: "0", kos: "0", bio: "" },
        { name: "TBA", wins: "0", losses: "0", kos: "0", bio: "" },
        { name: "TBA", wins: "0", losses: "0", kos: "0", bio: "" }
      ],
      chud: [
        { name: "TBA", wins: "0", losses: "0", kos: "0", bio: "" },
        { name: "TBA", wins: "0", losses: "0", kos: "0", bio: "" },
        { name: "TBA", wins: "0", losses: "0", kos: "0", bio: "" }
      ]
    }
  ]
};

// ===== DO NOT TOUCH BELOW =====

function displayName(name){
  return name && name.trim() ? name : "TBA";
}

function recordText(f){
  return `${f.wins}-${f.losses} • ${f.kos} KOs`;
}

function renderRankings(){
  const root = document.getElementById("rankings-root");
  if(!root) return;

  root.innerHTML = VFC_DATA.divisions.map(division => `
    <section>
      <h2>${division.name}</h2>
      <p>${division.weight}</p>

      <h3>🏆 Champion</h3>
      <p>${displayName(division.champion.name)} (${recordText(division.champion)})</p>

      <h3>✅ Contender Tier</h3>
      ${division.contender.map((f,i)=>`
        <p>${i+1}. ${displayName(f.name)} (${recordText(f)})</p>
      `).join("")}

      <h3>😂 Chud Tier</h3>
      ${division.chud.map((f,i)=>`
        <p>${i+1}. ${displayName(f.name)} (${recordText(f)})</p>
      `).join("")}
    </section>
  `).join("");
}

function setupCallout(){
  document.querySelectorAll(".callout-link").forEach(btn=>{
    btn.href = GOOGLE_FORM_LINK;
    btn.target = "_blank";
  });
}

document.addEventListener("DOMContentLoaded", ()=>{
  renderRankings();
  setupCallout();
});

