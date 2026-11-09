/* Archaemenes public, read-only conversational knowledge. No learner records or remote AI. */
(()=>{"use strict";
const host=document.getElementById("archaemenesConversation");if(!host)return;
const log=host.querySelector("[data-chat-log]"),form=host.querySelector("form"),input=host.querySelector("input"),status=host.querySelector("[data-chat-status]");
let records=[],last="";
const normalize=s=>String(s||"").toLowerCase().replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
function say(who,message){const p=document.createElement("p"),b=document.createElement("strong");b.textContent=who+": ";p.append(b,document.createTextNode(message));log.append(p);log.scrollTop=log.scrollHeight;}

let public500=[];
let public500State="loading";
const normPublic500=v=>String(v||"").normalize("NFKC").toLowerCase().replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
const public500Ready=fetch("./knowledge/mentor-approved-500.v1.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("bank unavailable");return r.json()}).then(d=>{if(d.schema!=="vnv-public-mentor-qa-v1"||d.mentorId!=="archaemenes"||!Array.isArray(d.records)||d.records.length!==500)throw Error("schema");const seen=new Set();public500=d.records.filter(r=>{const q=normPublic500(r.question);if(!q||!r.answer?.trim()||seen.has(q)||!(/^(approved|founder-approved-editorial)/.test(r.status)))return false;seen.add(q);return true;});if(public500.length!==500)throw Error("approval mismatch");public500State="ready";return 500;}).catch(()=>{public500State="unavailable";return 0;});
function lookupPublic500(input){if(public500State!=="ready")return null;const q=normPublic500(input);const exact=public500.find(r=>normPublic500(r.question)===q);if(exact)return exact.answer;const queryWords=new Set(q.split(" ").filter(t=>t.length>=5));if(queryWords.size<2)return null;let best=null,score=0;for(const row of public500){const words=new Set(normPublic500(row.question).split(" ").filter(t=>t.length>=5));let overlap=0;for(const w of queryWords)if(words.has(w))overlap++;const confidence=overlap/Math.max(queryWords.size,words.size,1);if(overlap>=2&&confidence>score){best=row;score=confidence;}}return score>=0.72?best.answer:null;}

function answer(message){const q=normalize(message);if(!q)return "";
const ranked=records.map(r=>{const phrase=normalize(r.question);let score=phrase===q?100:0;if(!score&&phrase.length>3&&q.includes(phrase))score=20;return {r,score};}).sort((a,b)=>b.score-a.score);
const approvedAnswer=lookupPublic500(message);if(approvedAnswer)return approvedAnswer;
if(!ranked.length||ranked[0].score===0)return "Thank you for your question. I don't have a prepared answer for that yet. Could you tell me a little more?";
const options=ranked[0].r.responses.filter(x=>x&&x.text&&x.text!==last);const pool=options.length?options:ranked[0].r.responses;const text=pool[Math.floor(Math.random()*pool.length)]?.text||"";last=text;return text;}
say("Archaemenes","Welcome. What would you like to discuss?");
fetch("./knowledge/question-records.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("Knowledge unavailable");return r.json()}).then(data=>{if(data.schema!=="archaemenes-question-collection-v1"||!Array.isArray(data.records))throw Error("Invalid knowledge");records=data.records.filter(x=>x.status==="approved"&&Array.isArray(x.responses));status.textContent="Curated conversational knowledge ready. No messages are uploaded.";}).catch(()=>{status.textContent="Conversational knowledge is unavailable right now.";});
form.addEventListener("submit",e=>{e.preventDefault();const message=input.value.trim().slice(0,500);if(!message)return;say("You",message);say("Archaemenes",records.length?answer(message):"My conversational library is still loading or unavailable.");input.value="";input.focus();});
host.querySelector("[data-chat-clear]")?.addEventListener("click",()=>{log.replaceChildren();last="";say("Archaemenes","A fresh beginning. What shall we explore?");});
})();