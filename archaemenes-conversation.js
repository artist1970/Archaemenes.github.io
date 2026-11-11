/* Archaemenes public, read-only conversational knowledge. No learner records or remote AI. */
(()=>{"use strict";
const host=document.getElementById("archaemenesConversation");if(!host)return;
const log=host.querySelector("[data-chat-log]"),form=host.querySelector("form"),input=host.querySelector("input"),status=host.querySelector("[data-chat-status]");
let records=[],last="";
const normalize=s=>String(s||"").toLowerCase().replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
function say(who,message){const p=document.createElement("p"),b=document.createElement("strong");b.textContent=who+": ";p.append(b,document.createTextNode(message));log.append(p);log.scrollTop=log.scrollHeight;}
function answer(message){const q=normalize(message);if(!q)return "";
// Public visitor safeguards mirrored from the Academy introduction.
// The full Academy account-bound tutor stays on its own origin.
if(/\b(answer|quiz|exam|graded|assessment|password|login)\b/i.test(q))
 return "I can help you practise the concept, but not provide protected assessment answers or account details. Which idea would you like to understand?";
if(/\b(unsafe|emergency|scared|afraid|hurt)\b/i.test(q))
 return "If you are in danger, contact a trusted adult or local emergency services. We can also discuss a safe next step.";

const ranked=records.map(r=>{const phrase=normalize(r.question);let score=phrase===q?100:0;if(!score&&phrase.length>3&&q.includes(phrase))score=20;return {r,score};}).sort((a,b)=>b.score-a.score);
if(!ranked.length||ranked[0].score===0){
 if(/\b(algebra|math|fraction|geometry|equation|number)\b/.test(q))
  return "Start with what is known. Write a small example and identify the rule you think applies. Which step is confusing?";
 if(/\b(write|story|poem|art|creative|drawing|music)\b/.test(q))
  return "Begin with one idea or character, a setting, and a question worth exploring. What would you like your audience to feel?";
 if(/\b(academy|school|course|learn)\b/.test(q))
  return "Khaemenes Academy offers learning pathways from early childhood through higher study. What subject interests you?";
 return "Thank you for your question. I do not have a prepared answer for that yet. Could you tell me a little more?";
}
const options=ranked[0].r.responses.filter(x=>x&&x.text&&x.text!==last);const pool=options.length?options:ranked[0].r.responses;const text=pool[Math.floor(Math.random()*pool.length)]?.text||"";last=text;return text;}
say("Archaemenes","Welcome. What would you like to discuss?");
fetch("./knowledge/question-records.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("Knowledge unavailable");return r.json()}).then(data=>{if(data.schema!=="archaemenes-question-collection-v1"||!Array.isArray(data.records))throw Error("Invalid knowledge");records=data.records.filter(x=>x.status==="approved"&&Array.isArray(x.responses));status.textContent="Curated conversational knowledge ready. No messages are uploaded.";}).catch(()=>{status.textContent="Conversational knowledge is unavailable right now.";});
form.addEventListener("submit",e=>{e.preventDefault();const message=input.value.trim().slice(0,500);if(!message)return;say("You",message);say("Archaemenes",records.length?answer(message):"My conversational library is still loading or unavailable.");input.value="";input.focus();});
host.querySelectorAll("[data-chat-prompt]").forEach(button=>button.addEventListener("click",()=>{
 const suggestion=button.getAttribute("data-chat-prompt")||"";
 input.value=suggestion.slice(0,500);
 input.focus();
}));
host.querySelector("[data-chat-clear]")?.addEventListener("click",()=>{log.replaceChildren();last="";say("Archaemenes","A fresh beginning. What shall we explore?");});
})();