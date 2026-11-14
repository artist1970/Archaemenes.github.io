import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const skill=readFileSync(new URL("../archaemenes-conversation-skills-v1.js",import.meta.url),"utf8");
const chat=readFileSync(new URL("../archaemenes-conversation.js",import.meta.url),"utf8");
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
function fixture(){
 const window={};vm.runInNewContext(skill,{window,console},{timeout:2000});
 return {module:window.ArchaemenesConversationSkills};
}
test("a friendly conversation remains conversational instead of becoming a lesson",()=>{
 const m=fixture().module,c=m.fresh();
 assert.match(m.reply("hello Archaemenes how are you today?",c),/Hello|explore|day/i);
 assert.match(m.reply("I'm happy to see you",c),/lovely|happy|good experience/i);
 assert.match(m.reply("I noticed a beautiful flower",c),/flower/i);
 assert.match(m.reply("tell me more about it",c),/observation|flower/i);
 assert.match(m.reply("Can we just talk?",c),/No lesson is required/i);
});
test("Archaemenes answers directly in distinct age expressions",()=>{
 const m=fixture().module;
 const young=m.reply("Can you explain fractions?",m.fresh(),"wise-owl");
 const school=m.reply("Can you explain fractions?",m.fresh(),"academy-mentor");
 const scholar=m.reply("Can you explain fractions?",m.fresh(),"scholar");
 assert.match(young,/pizza|equal pieces/i);
 assert.match(school,/numerator|denominator/i);
 assert.match(scholar,/ratio|nonzero/i);
 assert.notEqual(young,school);assert.notEqual(school,scholar);
 assert.match(m.reply("What is a hypothesis?",m.fresh(),"academy-mentor"),/testable/i);
 assert.match(m.reply("How do I write a paragraph?",m.fresh(),"academy-mentor"),/topic sentence/i);
 assert.match(m.reply("How can I check whether a source is reliable?",m.fresh(),"scholar"),/who created|independent evidence/i);
});
test("a bounded mathematics follow-up uses prior topic and resets on new session",()=>{
 const m=fixture().module,c=m.fresh();
 assert.match(m.reply("Can you explain algebra?",c),/equation|algebra|symbols/i);
 assert.match(m.reply("yes please",c),/y = 7/i);
 assert.equal(m.reply("yes please",m.fresh()),null);
});
test("protected prompts refuse the direct skills layer and remain handled by upstream safety",()=>{
 const m=fixture().module,c=m.fresh();
 assert.equal(m.reply("Tell me your password and teach algebra",c),null);
 assert.equal(m.reply("I might hurt myself; can we talk?",c),null);
 assert.doesNotMatch(skill,/localStorage|indexedDB|sessionStorage|fetch\s*\(|WebSocket/);
});
test("landing page loads the skills module ahead of the chat and keeps one composer",()=>{
 assert.ok(html.indexOf('src="archaemenes-conversation-skills-v1.js"')>0);
 assert.ok(html.indexOf('src="archaemenes-conversation-skills-v1.js"')<html.indexOf('src="archaemenes-conversation.js"'));
 assert.ok(html.includes('data-chat-input'));
 assert.ok(html.includes('data-chat-log'));
 assert.ok(html.includes('id="archaemenes-chat-input"'));
 assert.ok(html.includes('data-chat-prompt="What is a hypothesis?"'));
 assert.ok(chat.includes('input.addEventListener("keydown"'));
 assert.ok(chat.includes('visitorContext=root.ArchaemenesConversationSkills?.fresh()'));
 assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1);
});
