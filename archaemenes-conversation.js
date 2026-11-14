/* Archaemenes public visitor conversation v2.
 * Public-only approved Q&A, optional shared public lexicon, and developmental prompts.
 * No account, grade, learner profile, private CORE or third-party inference.
 */
(function(root){"use strict";
const host=document.getElementById("archaemenesConversation");if(!host)return;
const log=host.querySelector("[data-chat-log]"),form=host.querySelector("form"),input=host.querySelector("input"),
 status=host.querySelector("[data-chat-status]"),modePicker=host.querySelector("[data-mentor-mode]");
if(!log||!form||!input||!status)return;
let records=[],loaded=false,last="",recentIds=[],topic="";
let visitorContext=root.ArchaemenesConversationSkills?.fresh()||{topic:"",lastDetail:"",turns:0};
const normalize=s=>String(s||"").normalize("NFKC").toLowerCase().replace(/[’]/g,"'").replace(/[^\p{L}\p{N} ]/gu," ").replace(/\s+/g," ").trim();
const STOP=new Set(["the","and","for","from","with","what","where","when","would","could","should","your","about","have","that","this","can","you","how","are","please","me","my","to","an","a","is","do","i"]);
const terms=s=>normalize(s).split(" ").filter(w=>w.length>=3&&!STOP.has(w));
const modes=new Set(["wise-owl","academy-mentor","scholar"]);
function getMode(){return modes.has(modePicker?.value)?modePicker.value:"academy-mentor"}
function askBack(message){
 const v=getMode();
 if(v==="wise-owl")return "What is one thing you can notice or try first?";
 if(v==="scholar")return "Which evidence, assumption, or counterexample would help us investigate further?";
 return "Can you tell me how you would take the first step, in your own words?";
}
function say(who,message){
 const p=document.createElement("p"),b=document.createElement("strong");b.textContent=who+": ";
 p.append(b,document.createTextNode(message));log.append(p);log.scrollTop=log.scrollHeight;
}
function safe(r){return r&&r.status==="approved"&&typeof r.id==="string"&&typeof r.question==="string"&&
 r.question.length<=350&&typeof r.topic==="string"&&Array.isArray(r.responses)&&r.responses.length>0&&r.responses.length<=8&&
 r.responses.every(v=>v&&typeof v.text==="string"&&v.text.length>0&&v.text.length<=1600)&&
 (!r.alternateQuestions||(Array.isArray(r.alternateQuestions)&&r.alternateQuestions.every(s=>typeof s==="string"&&s.length<=350)))&&
 (!r.keywords||(Array.isArray(r.keywords)&&r.keywords.every(s=>typeof s==="string"&&s.length<=100)));}
function validated(data){
 if(!data||data.schema!=="archaemenes-question-collection-v1"||!Array.isArray(data.records)||!data.records.length||data.records.length>1000)throw Error("invalid-bank");
 const ids=new Set(),questions=new Set();
 for(const r of data.records){
  if(!safe(r)||ids.has(r.id)||questions.has(normalize(r.question)))throw Error("invalid-record");
  ids.add(r.id);questions.add(normalize(r.question));
 }
 return data.records;
}
function rank(question){
 const q=normalize(question),qTerms=new Set(terms(q));
 const scores=records.map(r=>{
   const exact=[r.question,...(r.alternateQuestions||[])].map(normalize);
   if(exact.includes(q))return {record:r,score:100};
   const aliases=exact.filter(x=>x.length>=9&&q.includes(x));
   if(aliases.length)return {record:r,score:65};
   // Require two distinct content words for a non-exact semantic match.
   const keywords=[...(r.keywords||[]),r.question].flatMap(terms);
   const matching=[...new Set(keywords)].filter(w=>qTerms.has(w));
   const ratio=matching.length/Math.max(qTerms.size,1);
   return {record:r,score:matching.length>=2&&ratio>=0.55?35+matching.length*2+ratio*10:0};
 });
 scores.sort((a,b)=>b.score-a.score);
 return scores[0]?.score>=40&&(!scores[1]||scores[0].score-scores[1].score>=4)?scores[0].record:null;
}
function pick(r){
 const options=r.responses.filter(x=>x.text!==last);
 const variants=options.length?options:r.responses;
 const choice=variants[Math.floor(Math.random()*variants.length)];
 last=choice.text;
 recentIds.push(r.id);recentIds=recentIds.slice(-30);topic=r.topic;
 return choice.text;
}
function answer(message){
 const q=normalize(message);
 if(!q)return "";
 // Institutional safeguards are evaluated before any public knowledge access.
 if(/\b(?:password|secret token|api key|private record|login credential|authentication)\b/i.test(message)||
    /\b(?:reveal|provide|give|show|unlock|leak)\b.{0,60}\b(?:quiz answer|exam answer|answer key|locked test|graded assessment|private|password)\b/i.test(message))
   return "I can help practise a concept, but I cannot reveal protected assessment answers, credentials, or private records.";
 if(/\b(?:hurt myself|suicide|immediate danger|emergency|unsafe)\b/i.test(message))
   return "Your safety comes first. Please reach out to a trusted adult or emergency services if there is immediate danger.";
 const immediate=root.ArchaemenesConversationSkills?.reply(message,visitorContext,getMode());
 if(immediate)return immediate;
 // Visitor-facing conversation and enrollment orientation, not course-grade decisions.
 // These specific intents take precedence over generic 'Academy' keyword fallbacks.
 if(/\b(?:how (?:do|can) (?:i|we) (?:enroll|register|sign up)|enroll(?:ment|ing)?|register(?:ing|ation)?|sign up|admission)\b/i.test(message))
   return "I can guide you to the Academy's public entrance and explain how to begin. Choose your learner's stage first, then use the registration or family-access directions there. I cannot enroll a student or create an account from this public chat. Are you looking for preschool, elementary, middle school, or high school?";
 if(/\b(?:pre[- ]?school|pre[- ]?k|kindergarten|kindergarden|little (?:one|learner)|young child)\b/i.test(message))
   return "Welcome to our youngest learners! The Preschool and Kindergarten pathways offer age-appropriate introductions to learning. You can begin at the Academy's Preschool doorway or Kindergarten campus. Would you like help finding the campus or understanding what children learn there?";
 if(/\b(?:high[- ]?school|(?:9th|10th|11th|12th|ninth|tenth|eleventh|twelfth) grade|teen(?:ager)?)\b/i.test(message))
   return "For a high-school learner, begin at the High School campus, where subjects and grade-level pathways are organized. A registered family can use the Academy's student and parent access routes. Would you like help finding the right grade page or understanding the available subjects?";
 if(/\b(?:elementary|first grade|second grade|third grade|fourth grade|fifth grade)\b/i.test(message))
   return "Our Elementary campus organizes learning by grade level and subject. Start with the grade your family is exploring, and use the campus guidance to understand the available lessons and enrollment steps. Which grade interests you?";
 if(/\b(?:middle school|sixth grade|seventh grade|eighth grade)\b/i.test(message))
   return "Our Middle School campus offers its own grade-level learning paths. Are you exploring a particular grade or trying to understand the transition into high school?";
 if(/\b(?:not sure (?:where|how) to start|don't know where to start|do not know where to start|where should (?:i|we) start|i am new here|i'm new here)\b/i.test(message))
   return "That is quite all right. We can begin with one simple choice: are you visiting as a student, a parent or guardian, or an educator? I can help you find the appropriate Academy doorway.";
 if(/\b(?:how (?:do )?you feel|how are you feeling|how is your day|how are you today|how's your day)\b/i.test(message))
   return "Thank you for asking. I do not experience a day the way people do, but I am here and ready to explore a question or simply have a conversation. How is your day going?";
 if(/\b(?:can you be my friend|are we friends|will you be my friend)\b/i.test(message))
   return "I can be a friendly educational companion and someone to explore ideas with. I am a digital mentor, not a person, and the relationships you build with family, friends, and teachers are important too. What would you enjoy talking about?";
 if(/\b(?:how many (?:answers|questions|responses)|how big is your (?:knowledge|library)|what do you know)\b/i.test(message))
   return "This public conversation currently uses 140 approved question records, with 190 authored reply variations, plus limited public language guidance. That is not the entirety of the Academy's knowledge or a full generative AI model. What topic would you like to explore?";
 if(/\b(?:what can you tell me about (?:the )?school|tell me about (?:the )?(?:academy|school)|what is khaemenes academy)\b/i.test(message))
   return "Khaemenes Academy brings together learning pathways from Preschool through Higher Learning. The campus pages organize lessons and subjects, while registered families use separate account pathways. Would you like to explore a campus, the subjects, or how families get started?";
 const language=root.CreativeSparkMentorLanguage;
 const grammar=message.match(/^(?:check|review|help with)(?: my)? grammar\s*[:—-]\s*(.{4,400})$/i);
 if(grammar){
  const notes=language?.grammar(grammar[1],{mentorId:"archaemenes"})?.notes;
  return notes?.length?notes.join(" "):"I cannot confirm a full grammar analysis. Try reading the sentence aloud and checking each subject and verb.";
 }
 const definition=message.match(/^(?:define|meaning of|synonyms of|antonyms of)\s+(?:the word\s+)?['"“”]?([a-z-]{2,70})['"“”]?[?.!]?$/i);
 if(definition){
  const mode=/^synonyms/i.test(message)?"synonyms":/^antonyms/i.test(message)?"antonyms":"definition";
  return language?.lookup(definition[1],{mentorId:"archaemenes",mode})||
   "That word is not currently in my approved public dictionary. Let's examine the sentence it appears in, or consult a trusted dictionary.";
 }
 if(/^(?:tell me more|another example|another question|continue|what else)[.!?\s]*$/i.test(message)&&topic){
  const next=records.find(r=>r.topic===topic&&!recentIds.includes(r.id));
  return next?pick(next)+" "+askBack(message):"We have reviewed the available examples in this subject. Would you like to revisit one or choose another question?";
 }
 const found=rank(message);
 if(found)return pick(found)+(found.topic==="social-conversation"?"":" "+askBack(message));
 if(/\b(?:algebra|math|fraction|geometry|equation|number)\b/i.test(message))
  return "Start with what you know, and try a small example. Which rule seems to apply? "+askBack(message);
 if(/\b(?:write|story|poem|art|creative|drawing|music)\b/i.test(message))
  return "Name an idea, a setting, and a question worth exploring. Another specialist may help us go deeper. "+askBack(message);
 if(/\b(?:academy|school|course|learn)\b/i.test(message))
  return "Khaemenes Academy offers pathways from early childhood through higher learning. Which subject interests you? "+askBack(message);
 const cross=root.CreativeSparkMentorQA?.answer(message,{mentorId:"archaemenes",scope:"principal-public"});
 if(cross)return "From "+cross.sourceName+"'s approved public knowledge: "+cross.answer+" (Reference: "+cross.sourceName+" · "+cross.topic+".) Would you like to investigate the reasoning behind it?";
 return "I do not have a reviewed answer to that question yet. Could you tell me a little more about what you want to understand?";
}
say("Archaemenes","Welcome. What would you like to discuss?");
root.CreativeSparkMentorLanguage?.init("archaemenes");
fetch("./knowledge/question-records.json",{cache:"no-store",credentials:"same-origin"})
 .then(r=>{if(!r.ok)throw Error("Knowledge unavailable");return r.json()})
 .then(data=>{records=validated(data);loaded=true;status.textContent="140-entry public conversation library available. Developmental mode is guidance only; no learner account is accessed.";})
 .catch(()=>{loaded=false;records=[];status.textContent="Curated knowledge unavailable. Public-only guidance remains available.";});
form.addEventListener("submit",e=>{
 e.preventDefault();const message=input.value.trim().slice(0,500);if(!message)return;
 say("You",message);say("Archaemenes",answer(message));input.value="";input.focus();
});
host.querySelectorAll("[data-chat-prompt]").forEach(button=>button.addEventListener("click",()=>{
 input.value=(button.getAttribute("data-chat-prompt")||"").slice(0,500);input.focus();
}));
host.querySelector("[data-chat-clear]")?.addEventListener("click",()=>{
 log.replaceChildren();last="";recentIds=[];topic="";visitorContext=root.ArchaemenesConversationSkills?.fresh()||{topic:"",lastDetail:"",turns:0};
 say("Archaemenes","A fresh beginning. What shall we explore?");
});
modePicker?.addEventListener("change",()=>{last="";recentIds=[];topic="";visitorContext=root.ArchaemenesConversationSkills?.fresh()||{topic:"",lastDetail:"",turns:0};
 status.textContent="Public teaching style: "+modePicker.selectedOptions[0].text+". This is a visitor preference, not a verified grade or placement.";});
root.ArchaemenesPublicMentor=Object.freeze({answer,validated,rank,getMode,loaded:()=>loaded});
})(window);