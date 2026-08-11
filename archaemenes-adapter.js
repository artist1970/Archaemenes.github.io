const STAGE_ROUTES = Object.freeze({
  preschool: {
    id:"khaemenes-preschool",
    label:"Khaemenes Preschool",
    url:"https://vervenveda.com/Khaemenes_Preschool.github.io/",
    presentation:"wise-owl"
  },
  kindergarten: {
    id:"khaemenes-kindergarten",
    label:"Khaemenes Kinder Garden",
    url:"https://vervenveda.com/Khaemenes_KinderGarden.github.io/",
    presentation:"wise-owl"
  },
  elementary: {
    id:"khaemenes-elementary",
    label:"Khaemenes Elementary",
    url:"https://vervenveda.com/Khaemenes_Elementary.github.io/",
    presentation:"wise-owl"
  },
  middle: {
    id:"khaemenes-middle",
    label:"Khaemenes Middle",
    url:"https://vervenveda.com/Khaemenes_Middle.github.io/",
    presentation:"academy-mentor"
  },
  high: {
    id:"khaemenes-high",
    label:"Khaemenes High",
    url:"https://vervenveda.com/Khaemenes_High.github.io/",
    presentation:"academy-mentor"
  },
  "higher-learning": {
    id:"khaemenes-higher",
    label:"Khaemenes Higher Learning",
    url:"https://vervenveda.com/Khaemenes_Higher_Learning.github.io/",
    presentation:"scholar"
  },
  adult: {
    id:"khaemenes-academy",
    label:"Khaemenes Academy",
    url:"https://vervenveda.com/Khaemenes_Academy.github.io/",
    presentation:"scholar"
  },
  parent: {
    id:"khaemenes-academy",
    label:"Khaemenes Academy",
    url:"https://vervenveda.com/Khaemenes_Academy.github.io/",
    presentation:"academy-mentor"
  },
  educator: {
    id:"khaemenes-academy",
    label:"Khaemenes Academy",
    url:"https://vervenveda.com/Khaemenes_Academy.github.io/",
    presentation:"scholar"
  }
});

const RESEARCH_WORDS = [
  "current","today","latest","news","recent","election","law","legal","medical",
  "medicine","price","weather","statistics","data","source","sources","verify",
  "fact check","disputed","claim"
];

function normalize(value=""){
  return String(value || "").toLowerCase();
}

function needsVerification(message=""){
  const text=normalize(message);
  return RESEARCH_WORDS.some(word=>text.includes(word));
}

function resolveStage(stage=""){
  const key=String(stage || "").toLowerCase();
  return STAGE_ROUTES[key] || STAGE_ROUTES.adult;
}

export const ArchaemenesAdapter = Object.freeze({
  id:"archaemenes",
  name:"Archaemenes",
  version:"0.1.0",
  capabilities:Object.freeze([
    "age-adaptive-academic-mentoring",
    "question-decomposition",
    "hint-first-tutoring",
    "concept-explanation",
    "worked-example-scaffolding",
    "study-planning",
    "curriculum-pathway-selection",
    "prerequisite-identification",
    "research-question-refinement",
    "source-awareness",
    "academic-writing-scaffolding",
    "structured-education-handoff"
  ]),
  availability:"handoff-ready",

  canExecute(){
    return {
      allowed:false,
      reason:"handoff-ready-specialist",
      note:"Archaemenes 0.1.0 provides academic scaffolding and handoff preparation but does not execute remote Academy actions."
    };
  },

  prepare(context={}){
    const message=String(context.message || context.query || "");
    const stage=String(context.stage || context.audience || "adult");
    const route=resolveStage(stage);
    const verification=needsVerification(message);

    return {
      specialist:"archaemenes",
      status:"prepared",
      presentation:route.presentation,
      stage,
      academyRoute:{
        id:route.id,
        label:route.label,
        url:route.url
      },
      verificationRequired:verification,
      verificationSpecialist:verification ? "verifier" : null,
      requiresUserAction:true,
      authority:"academic-mentoring-and-education-handoff",
      note:verification
        ? "The question appears current or source-sensitive; verification should precede any claim of current factual certainty."
        : "The learner's current school pathway is preferred before the central Academy gateway."
    };
  },

  async execute(context={}){
    return {
      specialist:"archaemenes",
      status:"handoff-required",
      executed:false,
      prepared:this.prepare(context),
      note:"User action is required to open or use the Academy destination."
    };
  }
});

export function getArchaemenesStage(stage="adult"){
  return {...resolveStage(stage)};
}

export function archaemenesNeedsVerification(message=""){
  return needsVerification(message);
}
