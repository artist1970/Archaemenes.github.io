/* Public mentor voice addon for existing chronological chats.
 * Read-only narration; optional user-enabled automatic speech with a saved toggle.
 * No private data or chat transcript storage.
 */
(function(){"use strict";
const cases=[
 {id:"archaemenes",name:"Archaemenes",host:"#archaemenesConversation",log:"[data-chat-log]"},
 {id:"klasaipeer",name:"Klasaipeer",host:"#klasaipeer-chat",log:"#klasaipeer-chat-log"}
];
const cfg=cases.find(x=>document.querySelector(x.host));if(!cfg)return;
const host=document.querySelector(cfg.host),log=host.querySelector(cfg.log);if(!log)return;
const voiceArea=document.createElement("div");voiceArea.className="mentor-voice-addon";
const lab=document.createElement("label");lab.textContent=cfg.name+" voice";lab.htmlFor="mentor-voice-select";
const select=document.createElement("select");select.id="mentor-voice-select";
const autoplay=document.createElement("button");
autoplay.type="button";autoplay.setAttribute("aria-pressed","false");
autoplay.setAttribute("aria-label","Toggle automatic mentor narration");
autoplay.textContent="Voice Off";
const preview=document.createElement("button");preview.type="button";preview.textContent="Preview voice";
const last=document.createElement("button");last.type="button";last.textContent="Listen to latest reply";
const stop=document.createElement("button");stop.type="button";stop.textContent="Stop audio";
const status=document.createElement("p");status.setAttribute("role","status");status.setAttribute("aria-live","polite");status.textContent="Loading browser voices…";
voiceArea.append(lab,select,autoplay,preview,last,stop,status);
const css=document.createElement("style");
css.textContent=".mentor-voice-addon{margin:15px 0;padding:15px;border:1px solid #b58b46;border-radius:7px;display:flex;align-items:center;flex-wrap:wrap;gap:10px;font-size:16px}.mentor-voice-addon label,.mentor-voice-addon p{width:100%;margin:0;font-size:16px}.mentor-voice-addon select{min-width:180px;max-width:100%;flex:1;background:#f4f0e7;color:#243038;padding:10px;border:1px solid #9d8b6d;border-radius:7px;font:inherit;font-size:16px}.mentor-voice-addon button,.mentor-turn-replay{padding:9px 12px;border:1px solid #b58b46;border-radius:7px;background:#28332f;color:#f4f0e7;font:inherit;font-size:16px;cursor:pointer}.mentor-turn-replay{margin:7px 0;display:block}";
document.head.append(css);log.insertAdjacentElement("afterend",voiceArea);
let voices=[],choice="auto",autoRead=false;
const preference="vnv.public.voice."+cfg.id+".v1";
const autoPreference="vnv.public.voice.autoplay."+cfg.id+".v1";
try{autoRead=localStorage.getItem(autoPreference)==="on";}catch{}
const supported="speechSynthesis" in window&&"SpeechSynthesisUtterance" in window;
function renderAutoplay(){
 autoplay.textContent=autoRead?"Voice On":"Voice Off";
 autoplay.setAttribute("aria-pressed",String(autoRead));
 status.textContent=autoRead?"Automatic replies are on.":"Automatic replies are off; use Listen for individual replies.";
}
autoplay.addEventListener("click",()=>{
 if(!supported){status.textContent="Speech is unavailable in this browser.";return;}
 autoRead=!autoRead;
 try{localStorage.setItem(autoPreference,autoRead?"on":"off");}catch{}
 if(!autoRead)window.speechSynthesis.cancel();
 renderAutoplay();
});
renderAutoplay();
const key=v=>JSON.stringify([v.voiceURI||"",v.name||"",v.lang||"",!!v.localService]);
try{const stored=localStorage.getItem(preference);if(stored&&stored.length<500)choice=stored;}catch{}
// Archaemenes: Google UK English Male first, Daniel (English UK) second.
 // Browser speech synthesis exposes installed voices only; availability depends on the device.
function automatic(){
 if(cfg.id==="archaemenes"){
  const british=v=>/^en[-_]gb$/i.test(v.lang||"");
  const google=voices.find(v=>/^Google UK English Male$/i.test((v.name||"").trim()))||
    voices.find(v=>/Google.*UK.*English.*Male/i.test(v.name||"")&&british(v));
  const daniel=voices.find(v=>/^Daniel(?:\s*\(English UK\))?$/i.test((v.name||"").trim())&&british(v))||
    voices.find(v=>/^Daniel/i.test(v.name||"")&&british(v));
  return google||daniel||voices.find(v=>british(v))||voices.find(v=>/^en/i.test(v.lang||""))||voices[0]||null;
 }
 return voices.find(v=>v.name==="Arthur"&&v.lang==="en-GB")||voices.find(v=>/^en/i.test(v.lang||""))||voices[0]||null;
}
function picked(){return choice==="auto"?automatic():voices.find(v=>key(v)===choice)||automatic();}
function name(v){return(v.name||"Unnamed")+" · "+(v.lang||"unknown")+(v.localService?" · device":" · browser/service");}
function refresh(){
 if(!supported)return;
 voices=Array.from(window.speechSynthesis.getVoices()||[]);select.replaceChildren();
 const d=document.createElement("option");d.value="auto";d.textContent="Automatic · preferred voice";select.append(d);
 const seen=new Set();
 for(const v of voices){const k=key(v);if(seen.has(k))continue;seen.add(k);const o=document.createElement("option");o.value=k;o.textContent=name(v);select.append(o);}
 if(choice!=="auto"&&!seen.has(choice)&&voices.length){status.textContent="Saved voice is unavailable on this device; using the preferred UK fallback until it returns.";}
 select.value=seen.has(choice)?choice:"auto";
}
function speak(text){
 if(!supported){status.textContent="Speech is not available in this browser.";return;}
 try{window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(String(text||"").trim().slice(0,2800));const v=picked();if(v){u.voice=v;u.lang=v.lang;}else u.lang=cfg.id==="archaemenes"?"en-GB":"en-US";u.rate=.95;u.volume=.85;u.onstart=()=>{status.textContent="Speaking: "+(v?.name||"browser default");};u.onend=()=>{status.textContent="Playback finished.";};u.onerror=()=>{status.textContent="Speech playback interrupted or unavailable.";};window.speechSynthesis.speak(u);}
 catch{status.textContent="Speech playback is unavailable.";}
}
function isMentor(p){
 const strong=p.querySelector("strong");const speaker=strong?.textContent||"";
 return cfg.id==="archaemenes"?/^Archaemenes\s*:/i.test(speaker):speaker.length>0&&!/^You\b/i.test(speaker);
}
function replyText(p){
 const speaker=p.querySelector("strong")?.textContent||"";
 return p.textContent?.slice(speaker.length).trim()||"";
}
function decorate(readNew=false){
 for(const p of Array.from(log.children)){
  if(!isMentor(p)||p.querySelector(".mentor-turn-replay"))continue;
  const button=document.createElement("button");button.type="button";button.className="mentor-turn-replay";button.textContent="Listen to this reply";
  const words=replyText(p);button.addEventListener("click",()=>speak(words));p.append(button);
  if(readNew&&autoRead&&cfg.id==="archaemenes"&&words)speak(words);
 }
}
decorate();
if("MutationObserver" in window){
 const observer=new MutationObserver(records=>{
  if(!records.some(r=>r.type==="childList"&&Array.from(r.addedNodes||[]).some(n=>n.parentNode===log)))return;
  decorate(true);
 });
 observer.observe(log,{childList:true});
}
select.addEventListener("change",()=>{choice=select.value||"auto";try{localStorage.setItem(preference,choice);}catch{}status.textContent="Voice: "+(picked()?name(picked()):"browser default");});
preview.addEventListener("click",()=>speak("Hello, I am "+cfg.name+". Welcome to our learning conversation."));
last.addEventListener("click",()=>{const rows=Array.from(log.children).filter(isMentor);const r=rows.at(-1);if(r)speak(replyText(r));else status.textContent="There is no mentor reply to read yet.";});
stop.addEventListener("click",()=>{if(supported)window.speechSynthesis.cancel();status.textContent="Audio stopped.";});
if(supported){refresh();window.speechSynthesis.addEventListener?.("voiceschanged",refresh);}
else{select.disabled=true;autoplay.disabled=true;preview.disabled=true;last.disabled=true;stop.disabled=true;status.textContent="Speech is unavailable in this browser.";}
})();
