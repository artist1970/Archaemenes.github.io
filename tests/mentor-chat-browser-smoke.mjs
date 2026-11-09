import {chromium} from "playwright";
import {readFileSync} from "node:fs";
import assert from "node:assert/strict";
const origin="http://127.0.0.1:8775";
const bank=JSON.parse(readFileSync(new URL("../knowledge/mentor-approved-500.v1.json",import.meta.url),"utf8"));
const sample=bank.records.find(x=>x.status==="founder-approved-editorial"&&x.question==="What does Curiosity mean?")||
 bank.records.find(x=>x.status==="founder-approved-editorial");
const browser=await chromium.launch({headless:true});
const context=await browser.newContext();
const page=await context.newPage();
await page.route("**/*",route=>new URL(route.request().url()).origin===origin?route.continue():route.abort("blockedbyclient"));
try{
 const loaded=page.waitForResponse(r=>r.url().includes("mentor-approved-500.v1.json")&&r.status()===200,{timeout:18000});
 await page.goto(origin+"/",{waitUntil:"domcontentloaded",timeout:20000});
 await loaded;
 await page.waitForTimeout(200);
 await page.locator("#archaemenes-chat-input").fill(sample.question);
 await page.locator("#archaemenesConversation form button[type=submit]").click();
 const answer=await page.locator("#archaemenesConversation [data-chat-log]").innerText();
 assert.ok(answer.includes(sample.answer),"full 500-Q&A answer not shown in public conversation: "+sample.id);
 console.log("PASS archaemenes: approved public 500 Q&A reached real chat interface");
}finally{await context.close();await browser.close();}
