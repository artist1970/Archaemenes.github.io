/* Living Mentor public preview v1.0.0 · no microphone, remote AI, or learner data.
 * Core authority: artist1970/CORE/ArchaemenesCore.
 * NAIB = AI Administrator; Noema = Chancellor; Archaemenes = Principal / Educational Mentor.
 */
(()=>{"use strict";
const stages=Object.freeze({
 young:{image:"assets/Archaemenes-young.png",label:"Wise Owl · Early Learning",phrase:"Hello, explorer. Let us notice one interesting thing and ask a good question."},
 middle:{image:"assets/Archaemens-mid.png",label:"Academy Mentor · Middle School",phrase:"What do you already understand? Show me your reasoning and we will find the next useful clue."},
 high:{image:"assets/Archaemens-high.png",label:"Academy Mentor · High School",phrase:"Begin with the evidence and the governing principle. Which part of the reasoning should we examine?"},
 university:{image:"assets/Archaemenes-University.png",label:"Scholar · Higher Learning",phrase:"Let us distinguish assumptions from evidence, compare interpretations, and test the strongest argument."}
});
function mount(){
 const mountPoint=document.getElementById("livingMentorPreview");
 if(!mountPoint||mountPoint.dataset.mounted)return;
 mountPoint.dataset.mounted="true";
 const pic=mountPoint.querySelector("[data-mentor-image]");
 const label=mountPoint.querySelector("[data-mentor-label]");
 const transcript=mountPoint.querySelector("[data-mentor-transcript]");
 const button=mountPoint.querySelector("[data-mentor-speak]");
 const stop=mountPoint.querySelector("[data-mentor-stop]");
 const stageButtons=[...mountPoint.querySelectorAll("[data-mentor-stage]")];
 let current="high";
 function silence(){try{window.speechSynthesis?.cancel()}catch{}}
 function choose(stage){
   if(!Object.hasOwn(stages,stage))return;
   silence();current=stage;const item=stages[stage];
   pic.src=item.image;pic.alt="Original Archaemenes artwork · "+item.label;
   label.textContent=item.label;transcript.textContent=item.phrase;
   stageButtons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.mentorStage===stage)));
 }
 stageButtons.forEach(b=>b.addEventListener("click",()=>choose(b.dataset.mentorStage)));
 button?.addEventListener("click",()=>{
   silence();
   if(!("speechSynthesis" in window)||typeof SpeechSynthesisUtterance==="undefined"){
     label.textContent=stages[current].label+" · On-device voice unavailable";return;
   }
   const u=new SpeechSynthesisUtterance(stages[current].phrase);
   u.lang="en-US";u.rate=current==="young"?.85:current==="middle"?.92:1;u.pitch=current==="young"?1.14:1;
   window.speechSynthesis.speak(u);
 });
 stop?.addEventListener("click",silence);
 document.addEventListener("visibilitychange",()=>{if(document.hidden)silence()});
 window.addEventListener("pagehide",silence);
 choose("high");
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
})();