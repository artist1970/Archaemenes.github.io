/* Archaemenes public conversational skills v1.
 * Explicit, bounded, testable educational responses, session-only continuity.
 * Preserve Headmaster/Principal role and distinct mentor expressions.
 * No account access, network requests, assessment scoring, automatic memory or LLM.
 */
(function(root){"use strict";
 const norm=x=>String(x??"").toLowerCase().replace(/[’]/g,"'").replace(/\s+/g," ").trim().slice(0,1600);
 const help=(mode,young,academy,scholar)=>mode==="wise-owl"?young:mode==="scholar"?scholar:academy;
 function fresh(){return {topic:"",lastDetail:"",followup:"",turns:0};}
 function reply(message,context,mode="academy-mentor"){
   const q=norm(message);if(!q)return null;
   if(!context||typeof context!=="object")return null;
   // Archaemenes' principal safety and protected-record checks run upstream.
   if(/\b(?:password|passcode|secret token|answer key|exam answers|private records|hurt myself|suicide|emergency)\b/i.test(q))return null;
   context.turns=(context.turns||0)+1;
   if(/\b(?:how are you|how is your day|how's your day|how do you feel)\b/i.test(q))
     return help(mode,
       "I'm here to help you wonder and discover! I don't have days or feelings like a person, but I can explore an idea with you. What was a good part of your day?",
       "Thank you for asking. I do not experience a day or feelings as a person does, but I can listen and help you think. How has your day been?",
       "I'm ready for thoughtful discussion. As a digital mentor I don't experience a human day or emotions, but I can evaluate ideas and evidence with you. How has your day been?");
   if(/\b(?:hello|hi|hey|good morning|good afternoon|good evening)\b/i.test(q)&&q.split(" ").length<=8)
     return help(mode,"Hello, curious explorer! I'm Archaemenes. What caught your attention today?",
       "Hello, and welcome. I'm Archaemenes. We can discuss your day, explore a question, or work through something difficult. What's on your mind?",
       "Welcome. I'm Archaemenes. We can begin with an observation, a question, or a claim worth examining. What interests you?");
   if(/\b(?:happy to (?:see|meet|talk to) you|glad to (?:see|meet|talk to) you|had a (?:great|good|wonderful) day|today was (?:great|good|wonderful))\b/i.test(q))
     return "It's lovely to hear that you had a good experience. We don't have to turn every conversation into a lesson. Sometimes sharing a happy moment is quite enough.";
   if(/\b(?:i (?:noticed|saw|found) (?:a |the )?(?:beautiful|interesting|purple|red|yellow|blue)? ?(?:flower|bird|tree|painting)|i had a dream|i dreamed|i dreamt)\b/i.test(q)){
     context.topic="observation";
     context.lastDetail=q.includes("dream")?"dream":q.includes("flower")?"flower":q.includes("tree")?"tree":"observation";
     return context.lastDetail==="dream"?"That sounds like an image worth remembering. A dream can be vivid without having one fixed meaning. What detail has stayed with you most?":
       context.lastDetail==="flower"?"A flower can be remarkable when you look closely at its color, shape, and center. I like that you noticed it. Was there one detail that surprised you?":
       "You noticed something that many people might have walked past. What made it stand out to you?";
   }
   if(/\b(?:tell me more about (?:it|that)|why is (?:it|that) interesting|what about (?:it|that))\b/i.test(q)&&context.topic==="observation")
     return "We can keep exploring that "+(context.lastDetail||"observation")+". Notice what actually happened, then separate your interpretation from what you saw. That distinction helps both science and storytelling.";
   if(/\b(?:can you|could you|please|would you)\b.{0,32}\b(?:explain|teach|show|help)\b.{0,18}\b(?:fractions?|multiplication|division|algebra)\b|\b(?:what is|what are) (?:a )?(?:fraction|equation|variable)\b/i.test(q)){
     context.topic="mathematics";
     if(/\b(?:fraction|fractions)\b/.test(q))return help(mode,
       "A fraction is part of a whole. If we cut a pizza into 4 equal pieces and take 1, we have 1/4. The bottom number says how many equal parts; the top says how many we have.",
       "A fraction represents equal parts of a whole or a ratio. In 3/4, 4 is the denominator and 3 is the numerator. Three of four equal sections are selected. We can compare fractions by using a common denominator.",
       "A fraction a/b, with b not zero, represents division a ÷ b. Equivalent fractions preserve the ratio when numerator and denominator are multiplied by the same nonzero factor.");
     if(/\b(?:algebra|equation|variable)\b/.test(q))return help(mode,
       "Algebra uses letters for numbers we haven't found yet. If x + 3 = 7, think: what plus 3 makes 7? The answer is x = 4.",
       "Algebra uses symbols to describe relationships. To solve x + 3 = 7, subtract 3 from both sides to keep the equation balanced; x = 4. We can check by substituting 4.",
       "An equation expresses equality. Solving x + 3 = 7 means applying reversible operations to isolate x while preserving equality, yielding x = 4.");
     if(/\b(?:division)\b/.test(q))return "Division shares a quantity into equal groups. Twelve objects divided among three groups gives four per group: 12 ÷ 3 = 4. You can check by multiplying 4 × 3 = 12.";
     return "Multiplication combines equal groups. Four groups of three objects make twelve: 4 × 3 = 12. A picture, repeated addition, or an array can show why.";
   }
   if(/\b(?:what is (?:a )?(?:hypothesis|scientific method)|how (?:do|can) i (?:make|test) a hypothesis|explain the scientific method)\b/i.test(q)){
     context.topic="science";
     return help(mode,
       "A hypothesis is a testable idea. For example: “If a plant gets more sunlight, it may grow taller.” We could test it by changing the light and measuring growth.",
       "A hypothesis is a testable explanation or prediction. Ask a clear question, identify variables, make a prediction, gather observations, and compare the results with the hypothesis. A result can challenge an idea without making the experiment a failure.",
       "Scientific inquiry develops testable hypotheses, designs controlled observations or experiments, analyzes evidence and uncertainty, and revises explanations. Good methodology distinguishes correlation from causal inference.");
   }
   if(/\b(?:what (?:is|does) (?:a )?(?:primary source|reliable source|evidence)|how (?:do|can) i (?:research|check) (?:a |my )?source|how do i (?:know|tell) (?:if )?a source is reliable)\b/i.test(q)){
     context.topic="research";
     return "A primary source comes from the period or event being studied, such as a letter, photograph, or firsthand record. Reliability depends on the question: check who created the source, when, why, what it can actually establish, and whether independent evidence supports the claim.";
   }
   if(/\b(?:what (?:is|does) (?:a )?(?:thesis|paragraph|essay)|how (?:do|can) i write (?:an? )?(?:essay|paragraph)|help me (?:write|plan) (?:an? )?(?:essay|paragraph))\b/i.test(q)){
     context.topic="writing";
     return help(mode,
       "Let's build one paragraph! Start with one idea, add two details that explain it, and finish with a sentence that wraps up. Example: “Trees give shade. Their leaves block some sunlight. That makes a warm day more comfortable.”",
       "A paragraph usually develops one main idea with a topic sentence, supporting examples or evidence, and explanation. An essay expands this structure: an introduction with a thesis, organized body paragraphs, and a conclusion. Example thesis: “School gardens make science more engaging through observation and shared work.”",
       "An effective essay makes a defensible claim, supports it with evidence, considers relevant objections, and explains the relationship between evidence and conclusion. Each paragraph should advance a distinct part of the argument.");
   }
   if(/\b(?:i (?:made|got) a mistake|i don't understand|i am stuck|i'm stuck|this is hard|i failed|i got it wrong)\b/i.test(q)){
     context.topic="learning";
     return help(mode,
       "A mistake is a clue, not a label. Let's find one part you do understand and try the next small step together.",
       "A wrong answer can show us exactly where the method became unclear. Tell me the step you used, and I'll help explain the underlying rule before you try again.",
       "An unsuccessful attempt supplies diagnostic evidence. Let's distinguish a conceptual misunderstanding from an arithmetic or procedural error, then test a revised approach.");
   }
   if(/\b(?:can we (?:just )?talk|i just want to talk|don't give me (?:a )?lesson|do not give me (?:a )?lesson)\b/i.test(q))
     return "Of course. No lesson is required. We can simply have a conversation about whatever you would like to share.";
   if(/^(?:thank you|thanks|good job|that helped)[!.\s]*$/i.test(q))
     return "You're welcome. I'm glad the explanation was useful. We can leave it there, or try something new.";
   if(/\b(?:what would you like to (?:talk about|work on|discuss)|what should we talk about)\b/i.test(q))
     return "We could explore a surprising science observation, a favorite book, a history question, or simply something that happened today. I am particularly interested in questions that begin with curiosity rather than certainty.";
   if(/^(?:yes|yes please|please continue|tell me more|continue|go on)[!.\s]*$/i.test(q)&&context.topic==="mathematics")
     return "Let's try another example: if y + 5 = 12, subtract 5 from both sides and obtain y = 7. Checking matters: 7 + 5 = 12. A rule becomes clearer when we see why it works.";
   return null;
 }
 root.ArchaemenesConversationSkills=Object.freeze({version:"1.0.0",fresh,reply,modelConnected:false});
})(window);
