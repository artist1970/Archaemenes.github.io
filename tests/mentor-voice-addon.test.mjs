import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const code=readFileSync(new URL('../mentor-voice-addon-v1.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const kind=html.includes('id="archaemenesConversation"')?'archaemenes':'klasaipeer';
function elem(tag='div'){
 const events={};return {tag,events,children:[],textContent:'',value:'',disabled:false,style:{},
  append(...items){this.children.push(...items);},
  replaceChildren(...items){this.children=[...items];},
  insertAdjacentElement(){},setAttribute(){},
  addEventListener(k,v){events[k]=v;},
  querySelector(selector){
   if(selector==='strong'||selector==='.mentor-turn-replay')return this.children.find(x=>selector==='strong'?x.tag==='strong':x.className==='mentor-turn-replay')||null;
   return selector==='[data-chat-log]'||selector==='#klasaipeer-chat-log'?this.log||null:null;
  },
  get scrollHeight(){return 300;},scrollTop:0
 };
}
function setup(){
 const host=elem(),log=elem(),storage=new Map(),spoken=[],voices=[
 {name:'Arthur',lang:'en-GB',voiceURI:'a',localService:true},
 {name:'Samantha',lang:'en-US',voiceURI:'b',localService:true},
 {name:'Amélie',lang:'fr-FR',voiceURI:'c',localService:true}];
 host.log=log;
 const row=elem(kind==='archaemenes'?'p':'div'),strong=elem('strong');
 strong.textContent=kind==='archaemenes'?'Archaemenes: ':'Klasaipeer · demo';
 row.textContent=strong.textContent+'Hello there!';row.append(strong);log.append(row);
 const document={querySelector:selector=>selector===(kind==='archaemenes'?'#archaemenesConversation':'#klasaipeer-chat')?host:null,
  createElement:elem,head:{append(){}}};
 function SpeechSynthesisUtterance(s){this.text=s;}
 const window={speechSynthesis:{getVoices:()=>voices,addEventListener(){},cancel(){},speak:u=>spoken.push(u)},SpeechSynthesisUtterance};
 const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
 vm.runInNewContext(code,{document,window,localStorage,SpeechSynthesisUtterance},{timeout:1000});
 const panel=log.children[0];return {log,row,spoken,storage,kind};
}
test('mentor addon loads after existing chat engine without replacing it',()=>{
 assert.match(html,/mentor-voice-addon-v1\.js/);
 assert.match(code,/getVoices\(\)/);
 assert.doesNotMatch(code,/fetch\s*\(|indexedDB|XMLHttpRequest/);
});
test('existing mentor reply is decorated with replay control',()=>{
 const x=setup(),button=x.row.children.find(y=>y.className==='mentor-turn-replay');
 assert.ok(button);
 button.events.click();
 assert.equal(x.spoken.length,1);
 assert.match(x.spoken[0].text,/Hello there!/);
});
test('addon is read-only and stores no message content',()=>{
 const x=setup();
 assert.equal(x.storage.size,0);
 assert.doesNotMatch(code,/innerHTML|sessionStorage|conversation\.replaceChildren/);
});
