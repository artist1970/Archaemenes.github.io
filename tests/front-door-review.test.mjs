import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {Script} from "node:vm";
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const js=readFileSync(new URL("../archaemenes-conversation.js",import.meta.url),"utf8");
const bank=JSON.parse(readFileSync(new URL("../knowledge/mentor-approved-500.v1.json",import.meta.url),"utf8"));
test("approved 500 source is distinct, bounded and present",()=>{
 assert.equal(bank.schema,"vnv-public-mentor-qa-v1");
 assert.equal(bank.records.length,500);
 const seen=new Set();
 for(const r of bank.records){assert.ok(r.question?.trim()&&r.answer?.trim());assert.match(r.status,/^(approved|approved-public|approved-public-seed|founder-approved-editorial)$/);
 const key=r.question.normalize("NFKC").toLowerCase().replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();assert.ok(key&&!seen.has(key));seen.add(key);}
});
test("front door remains intact and 500-source JS compiles",()=>{
 assert.match(html,/<html/i);
 assert.match(html,new RegExp("archaemenes-conversation\.js"));
 assert.doesNotThrow(()=>new Script(js));
 assert.match(js,/mentor-approved-500\.v1\.json/);
 assert.match(js,/public500State="unavailable"/);
 assert.doesNotMatch(js,/https?:\/\/[^"']+\/api\/.*(token|secret)/i);
});
