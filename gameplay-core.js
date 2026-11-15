/* Little Worlds: Wish & Wander - persistent RPG progression.
 * Additive to the original lw-points/lw-done/lw-visits saves. No dependencies.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.WishWanderCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const KEY = "lw-rpg-v1";
  const QUESTS = [
    { id:"first-steps", title:"The first little step", description:"Discover your first place in the city.", goal:s=>s.visited.length >= 1, reward:{xp:30,wishes:8} },
    { id:"bakery", title:"Something warm from the oven", description:"Step inside the Market Bakery.", goal:s=>s.interiors.includes("bakery"), reward:{xp:40,wishes:12} },
    { id:"music", title:"A new melody", description:"Talk to Astrid at the music atelier.", goal:s=>s.conversations.includes("astrid"), reward:{xp:45,wishes:15} },
    { id:"wanderer", title:"A city of little wonders", description:"Discover three different places.", goal:s=>s.visited.length >= 3, reward:{xp:50,wishes:20} },
    { id:"friends", title:"A friend for the journey", description:"Invite Astrid to join your story.", goal:s=>s.recruited.includes("astrid"), reward:{xp:60,wishes:25} },
    { id:"curious", title:"Make yourself at home", description:"Explore three different interiors.", goal:s=>s.interiors.length >= 3, reward:{xp:65,wishes:25} }
  ];
  function uniqueStrings(value) {
    return Array.isArray(value) ? [...new Set(value.filter(x => typeof x === "string" && x.length < 120))] : [];
  }
  function normalise(raw, legacyVisits) {
    const input = raw && typeof raw === "object" ? raw : {};
    return {
      xp: Number.isFinite(input.xp) ? Math.max(0,Math.floor(input.xp)) : 0,
      visited: uniqueStrings([...(Array.isArray(input.visited)?input.visited:[]),...(Array.isArray(legacyVisits)?legacyVisits:[])]),
      interiors: uniqueStrings(input.interiors),
      conversations: uniqueStrings(input.conversations),
      activities: uniqueStrings(input.activities),
      recruited: uniqueStrings(input.recruited),
      claimed: uniqueStrings(input.claimed)
    };
  }
  function levelInfo(xp) {
    const n = Math.max(0, Number(xp)||0), level = Math.floor(n/100)+1;
    return {level, xp:n, intoLevel:n%100, toNext:100-n%100};
  }
  function questStatuses(s) {
    return QUESTS.map(q=>({...q,ready:q.goal(s),claimed:s.claimed.includes(q.id)}));
  }
  function transition(previous, action) {
    const s = normalise(previous), result = {state:s,changed:false,wishes:0,xp:0,message:""};
    if (!action || typeof action.type!=="string") return result;
    let bucket, id, xp = 0, wishes = 0, label = "";
    if (action.type==="visit") { bucket="visited";id=action.id;xp=15;wishes=4;label="Place discovered"; }
    else if (action.type==="enter") { bucket="interiors";id=action.id;xp=20;wishes=6;label="Interior explored"; }
    else if (action.type==="talk") { bucket="conversations";id=action.id;xp=22;wishes=4;label="A new conversation"; }
    else if (action.type==="activity") { bucket="activities";id=action.id;xp=12;wishes=3;label="A little moment"; }
    else if (action.type==="recruit") {
      if (action.id!=="astrid" || !s.conversations.includes("astrid") || !s.interiors.includes("music-room")) return result;
      bucket="recruited";id=action.id;xp=35;wishes=12;label="Astrid joined your story";
    } else if (action.type==="claim") {
      const q=QUESTS.find(q=>q.id===action.id);
      if (!q || !q.goal(s) || s.claimed.includes(q.id)) return result;
      bucket="claimed";id=q.id;xp=q.reward.xp;wishes=q.reward.wishes;label="Quest completed";
    } else return result;
    if (typeof id!=="string" || !id.trim() || id.length>120 || s[bucket].includes(id)) return result;
    s[bucket].push(id);s.xp+=xp;
    return {state:s,changed:true,wishes,xp,message:label};
  }
  function load(storage, legacyVisits) {
    let raw=null;
    try {raw=JSON.parse(storage.getItem(KEY)||"null");} catch (_) {}
    return normalise(raw,legacyVisits);
  }
  function save(storage,s) {storage.setItem(KEY,JSON.stringify(normalise(s)));}
  return {KEY,QUESTS,normalise,levelInfo,questStatuses,transition,load,save};
});