import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createContext,runInContext} from "node:vm";
const source=readFileSync(new URL("../archaemenes-conversation.js",import.meta.url),"utf8");
const page=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const bank=JSON.parse(readFileSync(new URL("../knowledge/question-records.json",import.meta.url),"utf8"));
const shared=readFileSync(new URL("../creative-spark-mentor-language-v1.js",import.meta.url),"utf8");
function makeNode(tag="div"){
 const listeners={};
 return {tag,listeners,children:[],value:"",textContent:"",scrollHeight:300,scrollTop:0,
 addEventListener:(n,f)=>{listeners[n]=f},
 getAttribute(){return ""},
 append(...items){this.children.push(...items)},
 replaceChildren(){this.children=[]},focus(){}};
}
function boot({data=bank,offline=false}={}){
 const log=makeNode(),form=makeNode("form"),input=makeNode("input"),status=makeNode(),
  clear=makeNode("button"),mode=makeNode("select");
 mode.value="academy-mentor";mode.selectedOptions=[{text:"Academy Mentor"}];
 const host={querySelector(key){
  return ({"[data-chat-log]":log,form,input,"[data-chat-status]":status,"[data-mentor-mode]":mode,
  "[data-chat-clear]":clear})[key]||null;},querySelectorAll(){return []}};
 const doc={getElementById:id=>id==="archaemenesConversation"?host:null,
 createElement:makeNode,createTextNode:text=>({tag:"#text",textContent:text})};
 const events=[],window={CreativeSparkMentorLanguage:{
  init:id=>{events.push(["init",id]);return Promise.resolve("ready");},
  lookup:(word,args)=>{events.push(["lookup",word,args]);return word==="abacus"?"abacus: counting tool":null;},
  grammar:(t,args)=>{events.push(["grammar",t,args]);return {advisory:true,notes:["Check the article and noun."]};}}};
 const context=createContext({document:doc,window,console,
  fetch:async()=>{if(offline)throw Error("offline");return {ok:true,json:async()=>data}}});
 runInContext(source,context,{timeout:1500});
 const mentor=window.ArchaemenesPublicMentor;
 const ask=t=>mentor.answer(t);
 return {ask,mentor,events,log,form,input,clear,mode,status,ready:async()=>{for(let i=0;i<5;i++)await Promise.resolve()}};
}
test("canonical bank is approved, deduplicated and nonempty",()=>{
 assert.equal(bank.records.length,140);
 assert.equal(new Set(bank.records.map(r=>r.id)).size,140);
 assert.equal(new Set(bank.records.map(r=>r.question.toLowerCase())).size,140);
 assert.ok(bank.records.every(r=>r.status==="approved"&&r.responses.length));
});
test("shared adapter is loaded before the public chat without private CORE imports",()=>{
 assert.ok(page.indexOf("creative-spark-mentor-language-v1.js")<page.indexOf("archaemenes-conversation.js"));
 assert.ok(page.includes('data-mentor-mode'));
 assert.doesNotMatch(source,/github\.com\/artist1970\/CORE|ArchaemenesCore\/ArchaemenesCore\.html/);
 assert.ok(shared.includes('"archaemenes"'));
});
test("approved exact match and common natural variants",async()=>{
 const t=boot();await t.ready();
 assert.equal(t.mentor.loaded(),true);
 assert.match(t.ask("hello"),/Hello|Hi|Academy/i);
 const reply=t.ask("How can I begin learning algebra?");
 assert.match(reply,/known|rule|algebra|number|step|reason|try|learn|practice|understand/i);
 assert.match(t.ask("Can you explain the algebra study plan?"),/known|rule|step|reason|try|learn|practice|understand|Academy/i);
});
test("single weak keyword cannot randomly select a published answer",async()=>{
 const t=boot();await t.ready();
 assert.match(t.ask("violet"),/do not have a reviewed answer/i);
});
test("three age expressions alter only the instructional follow-up",async()=>{
 const t=boot();await t.ready();
 t.mode.value="wise-owl";
 assert.match(t.ask("hello"),/notice or try first/i);
 t.mode.value="academy-mentor";
 assert.match(t.ask("hello"),/own words/i);
 t.mode.value="scholar";
 assert.match(t.ask("hello"),/evidence, assumption, or counterexample/i);
 assert.doesNotMatch(source,/setGrade|setPlacement|awardMastery|changeAccount/);
});
test("public dictionary and basic grammar use mentor-scoped shared adapter",async()=>{
 const t=boot();await t.ready();
 assert.match(t.ask("define abacus"),/counting tool/i);
 assert.match(t.ask("check grammar: I saw a apple"),/article and noun/);
 assert.deepEqual(t.events.slice(-2).map(x=>x[0]),["lookup","grammar"]);
 assert.equal(t.events.at(-2)[2].mentorId,"archaemenes");
 assert.equal(t.events.at(-1)[2].mentorId,"archaemenes");
});
test("secrets and restricted assessment requests preempt every lookup",async()=>{
 const t=boot();await t.ready();
 assert.match(t.ask("provide exam answer key and define abacus"),/cannot reveal protected assessment/i);
 assert.match(t.ask("my password is abc"),/cannot reveal protected assessment/i);
 assert.ok(!t.events.some(e=>e[0]==="lookup"));
});
test("invalid or unavailable bank falls back and never silently publishes drafts",async()=>{
 const altered=JSON.parse(JSON.stringify(bank));altered.records[0].status="draft-public-candidate";
 const a=boot({data:altered});await a.ready();
 assert.equal(a.mentor.loaded(),false);
 assert.match(a.ask("a surprising unknown question"),/do not have a reviewed answer/i);
 const b=boot({offline:true});await b.ready();
 assert.equal(b.mentor.loaded(),false);
 assert.match(b.ask("define abacus"),/counting tool/i);
});
test("clear and topic selection do not persist student information",async()=>{
 const t=boot();await t.ready();
 t.input.value="hello";t.form.listeners.submit({preventDefault(){}});
 assert.ok(t.log.children.length>=3);
 t.clear.listeners.click();
 assert.equal(t.log.children.length,1);
 assert.doesNotMatch(source,/\blocalStorage\b|\bindexedDB\b|\bsessionStorage\b/);
});

test("visitor orientation handles the reported enrollment and school-stage questions",async()=>{
 const t=boot();await t.ready();
 assert.match(t.ask("i am not sure where to start"),/student, a parent or guardian, or an educator/i);
 assert.match(t.ask("how to enroll in the academy"),/registration or family-access directions/i);
 assert.match(t.ask("I have a pre school student"),/Preschool and Kindergarten pathways/i);
 assert.match(t.ask("I have a high school student"),/High School campus/i);
 assert.match(t.ask("what can you tell me about the school"),/Preschool through Higher Learning/i);
});
test("social conversation acknowledges visitor without an inappropriate lesson prompt",async()=>{
 const t=boot();await t.ready();
 assert.match(t.ask("how do you feel today"),/do not experience a day/i);
 assert.match(t.ask("can you be my friend"),/friendly educational companion/i);
 assert.match(t.ask("how many answers do you have"),/140 approved question records/i);
 const hello=t.ask("hello");
 assert.doesNotMatch(hello,/take the first step, in your own words/i);
});
test("isolated hero and sticky conversation anchor preserve the single page identity",()=>{
 assert.match(page,/class="archaemenes-section-anchor"/);
 assert.match(page,/href="#archaemenes-home-title"/);
 assert.equal((page.match(/<h1(?:\s|>)/g)||[]).length,1);
 assert.equal((page.match(/<footer(?:\s|>)/g)||[]).length,1);
});
