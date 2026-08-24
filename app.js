(() => {
  "use strict";

  const ROUTES = Object.freeze({
    preschool: "https://vervenveda.com/Khaemenes_Preschool.github.io/",
    kindergarten: "https://vervenveda.com/Khaemenes_KinderGarden.github.io/",
    elementary: "https://vervenveda.com/Khaemenes_Elementary.github.io/",
    middle: "https://vervenveda.com/Khaemenes_Middle.github.io/",
    high: "https://vervenveda.com/Khaemenes_High.github.io/",
    higher: "https://vervenveda.com/Khaemenes_Higher_Learning.github.io/",
    linguistics: "https://vervenveda.com/Khaemenes_Linguistics.github.io/"
  });

  const MENTOR_URL = "https://vervenveda.com/Khaemenes_Academy.github.io/mentor/";
  const NOTE_KEY = "archaemenes_public_home_notes_v1";
  const PREF_KEY = "archaemenes_public_home_preferences_v1";
  const ROLE_KEY = "archaemenes_public_home_role_v1";

  const WELCOMES = Object.freeze({
    student: {
      text: "Welcome. You do not need to know exactly what you need before you begin. Tell me what you are trying to understand, and we will find the first useful question together.",
      meta: "Student welcome · public home"
    },
    parent: {
      text: "Welcome. You know your learner in ways a school page cannot. Bring your questions, your observations and your concerns. Good educational decisions begin by listening carefully to the people who know the child best.",
      meta: "Parent / guardian welcome · public home"
    },
    educator: {
      text: "Welcome, colleague. Teaching improves when we can compare evidence, methods and outcomes without turning professional judgment into competition. What are you noticing in your learners?",
      meta: "Educator welcome · public home"
    },
    visitor: {
      text: "Welcome. Curiosity does not require enrollment. You may explore, read, follow a question into the Academy, or simply stay long enough to discover something you did not expect to wonder about.",
      meta: "Visitor welcome · public home"
    }
  });

  const RESPONSES = Object.freeze({
    mistake: "A mistake gives us evidence. Let us find the exact point where your reasoning changed direction; that is usually more useful than simply replacing the answer.",
    stuck: "Then we should make the problem smaller. What is the last part you are certain about? We can begin there rather than pretending the whole path must be visible at once.",
    disagree: "You may disagree with me. Show me your reasoning. If your argument is stronger, we should follow it; scholarship is not loyalty to a speaker.",
    idea: "Interesting ideas do not need permission to be examined. Tell me what led you there, and then we can ask what evidence would make the idea stronger—or prove it wrong.",
    research: "Begin with a question narrow enough to investigate and important enough to care about. Then separate what you know, what you suspect, and what you still need evidence to establish.",
    begin: "When there are too many doors, choose the one that helps you ask a better question. We are not choosing your entire future; we are choosing the next useful step."
  });

  const QUESTIONS = Object.freeze([
    "What is something you understand better today than you did a week ago?",
    "What question have you been avoiding because it feels too large?",
    "What would change your mind about something you currently believe?",
    "Where did you make a mistake recently that taught you something useful?",
    "What is one thing you can explain clearly enough to teach someone else?",
    "What evidence would you want before making an important conclusion?",
    "What is something ordinary that becomes interesting when you look at it carefully?",
    "If two good explanations disagree, how might you decide which one is stronger?",
    "What is a question for which 'I do not know yet' is a good beginning?",
    "What did you notice today that you might have ignored a year ago?",
    "What assumption are you making without realizing it?",
    "What would you investigate if nobody were grading you?"
  ]);

  const CHARACTER = Object.freeze({
    curiosity: "A good question does not need to arrive fully formed. Begin with what you notice.",
    dignity: "Do not confuse speed with intelligence, confidence with competence, or quietness with lack of understanding.",
    disagreement: "You may disagree with me. Show me your reasoning.",
    uncertainty: "We do not need certainty before we begin investigating.",
    wonder: "That is an interesting thought. Stay with it for a moment before we turn it into work.",
    fairness: "Let us be fair to the evidence—and to one another."
  });

  const $ = id => document.getElementById(id);

  function safeJSON(raw, fallback) {
    try { return JSON.parse(raw); } catch { return fallback; }
  }

  function readStore(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? safeJSON(raw, fallback) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeStore(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function setStatus(id, text) {
    const node = $(id);
    if (node) node.textContent = text;
  }

  async function hydratePublicPersona() {
    try {
      const response = await fetch("./archaemenes_persona.json", { cache: "no-store" });
      if (!response.ok) return;
      const persona = await response.json();
      const quote = $("heroQuote");
      const lede = $("heroLede");
      if (quote && persona?.motto) quote.textContent = `“${persona.motto}”`;
      if (lede && persona?.description) lede.textContent = persona.description;
    } catch {
      /* Public home remains complete without the JSON. */
    }
  }

  function bindVisitorRoles() {
    const host = $("visitorRoles");
    if (!host) return;
    let selected = readStore(ROLE_KEY, "student");
    if (!WELCOMES[selected]) selected = "student";

    function apply(role, persist = true) {
      const data = WELCOMES[role] || WELCOMES.student;
      host.querySelectorAll("[data-role]").forEach(btn => {
        btn.setAttribute("aria-pressed", String(btn.dataset.role === role));
      });
      if ($("welcomeText")) $("welcomeText").textContent = data.text;
      if ($("welcomeMeta")) $("welcomeMeta").textContent = data.meta;
      if (persist) writeStore(ROLE_KEY, role);
    }

    host.addEventListener("click", event => {
      const btn = event.target.closest("[data-role]");
      if (!btn) return;
      apply(btn.dataset.role);
    });

    apply(selected, false);
  }

  function bindCharacterExamples() {
    const grid = $("promptGrid");
    const out = $("characterResponse");
    if (!grid || !out) return;
    const keys = Object.keys(RESPONSES);

    function show(key) {
      out.textContent = `“${RESPONSES[key] || RESPONSES.begin}”`;
      grid.querySelectorAll("[data-prompt]").forEach(btn => {
        btn.dataset.active = String(btn.dataset.prompt === key);
      });
    }

    grid.addEventListener("click", event => {
      const btn = event.target.closest("[data-prompt]");
      if (!btn) return;
      show(btn.dataset.prompt);
    });

    $("anotherPrompt")?.addEventListener("click", () => {
      show(keys[Math.floor(Math.random() * keys.length)]);
    });
  }

  function bindDailyQuestion() {
    const out = $("dailyQuestion");
    if (!out) return;
    const day = Math.floor(Date.now() / 86400000);
    let index = day % QUESTIONS.length;

    function render() {
      out.textContent = QUESTIONS[index];
    }

    $("anotherQuestion")?.addEventListener("click", () => {
      index = (index + 1) % QUESTIONS.length;
      render();
    });

    render();
  }

  function readNotes() {
    const notes = readStore(NOTE_KEY, []);
    return Array.isArray(notes) ? notes : [];
  }

  function saveNotes(notes) {
    return writeStore(NOTE_KEY, notes.slice(-20));
  }

  function renderNotes() {
    const box = $("noteList");
    if (!box) return;
    const notes = readNotes().slice(-3).reverse();

    if (!notes.length) {
      box.innerHTML = '<p class="form-note">No saved notes yet.</p>';
      return;
    }

    box.innerHTML = notes.map(note => `
      <article class="saved-note" data-note-id="${escapeHTML(note.id)}">
        <strong>${escapeHTML(note.name || "Private note")}</strong>
        <small>${escapeHTML(note.topicLabel)} · ${escapeHTML(note.when)}</small>
        <p>${escapeHTML(note.text)}</p>
        <div class="saved-note-actions">
          <button class="mini" type="button" data-note-action="copy">Copy</button>
          <button class="mini" type="button" data-note-action="delete">Delete</button>
        </div>
      </article>
    `).join("");
  }

  async function copyText(text) {
    if (!text) return false;
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const temp = document.createElement("textarea");
      temp.value = text;
      temp.setAttribute("readonly", "");
      temp.style.position = "fixed";
      temp.style.opacity = "0";
      document.body.appendChild(temp);
      temp.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch {}
      temp.remove();
      return ok;
    }
  }

  function bindNotes() {
    const form = $("noteForm");
    if (!form) return;

    form.addEventListener("submit", event => {
      event.preventDefault();
      const name = $("noteName")?.value.trim().slice(0, 40) || "";
      const topicSelect = $("noteTopic");
      const text = $("noteText")?.value.trim().slice(0, 1200) || "";

      if (!text) {
        setStatus("noteStatus", "Please write a note before saving.");
        $("noteText")?.focus();
        return;
      }

      const notes = readNotes();
      notes.push({
        id: `note_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        name,
        topic: topicSelect?.value || "message",
        topicLabel: topicSelect?.selectedOptions?.[0]?.textContent || "Message",
        text,
        when: new Date().toLocaleString()
      });

      if (saveNotes(notes)) {
        setStatus("noteStatus", "Saved on this device. Nothing was uploaded.");
        renderNotes();
      } else {
        setStatus("noteStatus", "This browser did not allow local note storage.");
      }
    });

    $("clearDraft")?.addEventListener("click", () => {
      if ($("noteName")) $("noteName").value = "";
      if ($("noteText")) $("noteText").value = "";
      setStatus("noteStatus", "Draft cleared.");
    });

    $("copyOpenMentor")?.addEventListener("click", async () => {
      const name = $("noteName")?.value.trim() || "";
      const topic = $("noteTopic")?.selectedOptions?.[0]?.textContent || "Message";
      const text = $("noteText")?.value.trim() || "";

      if (!text) {
        setStatus("noteStatus", "Write your note first, then use Copy & Open Mentor.");
        $("noteText")?.focus();
        return;
      }

      const composed = `${name ? `${name}\n` : ""}${topic}\n\n${text}`;
      const copied = await copyText(composed);
      setStatus("noteStatus", copied ? "Copied. Opening the Academy Mentor…" : "Opening the Academy Mentor. You may need to copy the note manually.");
      setTimeout(() => window.location.assign(MENTOR_URL), 250);
    });

    $("noteList")?.addEventListener("click", async event => {
      const action = event.target.closest("[data-note-action]");
      const card = event.target.closest("[data-note-id]");
      if (!action || !card) return;
      const id = card.dataset.noteId;
      const notes = readNotes();
      const note = notes.find(item => item.id === id);
      if (!note) return;

      if (action.dataset.noteAction === "copy") {
        const text = `${note.name ? `${note.name}\n` : ""}${note.topicLabel}\n\n${note.text}`;
        const ok = await copyText(text);
        setStatus("noteStatus", ok ? "Saved note copied." : "Could not copy automatically.");
      }

      if (action.dataset.noteAction === "delete") {
        saveNotes(notes.filter(item => item.id !== id));
        renderNotes();
        setStatus("noteStatus", "Saved note deleted.");
      }
    });

    $("clearAllNotes")?.addEventListener("click", () => {
      saveNotes([]);
      renderNotes();
      setStatus("noteStatus", "All saved notes on this device were cleared.");
    });

    renderNotes();
  }

  function bindLearningRoutes() {
    const level = $("learningLevel");
    const open = $("openLevel");
    if (!level || !open) return;

    function go() {
      const route = ROUTES[level.value];
      if (!route) {
        setStatus("routeStatus", "Please choose a valid learning level.");
        return;
      }
      setStatus("routeStatus", "Opening the selected Khaemenes learning campus…");
      window.location.assign(route);
    }

    open.addEventListener("click", go);
    level.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        go();
      }
    });
  }

  function bindCharacterPrinciples() {
    const grid = $("characterGrid");
    const output = $("characterPrinciple");
    if (!grid || !output) return;

    grid.addEventListener("click", event => {
      const btn = event.target.closest("[data-character]");
      if (!btn) return;
      const key = btn.dataset.character;
      output.textContent = `“${CHARACTER[key] || CHARACTER.curiosity}”`;
      grid.querySelectorAll("[data-character]").forEach(item => {
        item.setAttribute("aria-pressed", String(item === btn));
      });
    });
  }

  function bindComfort() {
    const prefs = readStore(PREF_KEY, { calm: false, largeText: false, reduceMotion: false });

    function apply() {
      document.body.classList.toggle("calm", !!prefs.calm);
      document.body.classList.toggle("large-text", !!prefs.largeText);
      document.body.classList.toggle("reduce-motion", !!prefs.reduceMotion);
      $("calmToggle")?.setAttribute("aria-pressed", String(!!prefs.calm));
      $("textToggle")?.setAttribute("aria-pressed", String(!!prefs.largeText));
      $("motionToggle")?.setAttribute("aria-pressed", String(!!prefs.reduceMotion));
      writeStore(PREF_KEY, prefs);
    }

    $("calmToggle")?.addEventListener("click", () => { prefs.calm = !prefs.calm; apply(); });
    $("textToggle")?.addEventListener("click", () => { prefs.largeText = !prefs.largeText; apply(); });
    $("motionToggle")?.addEventListener("click", () => { prefs.reduceMotion = !prefs.reduceMotion; apply(); });

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) prefs.reduceMotion = true;
    apply();
  }

  hydratePublicPersona();
  bindVisitorRoles();
  bindCharacterExamples();
  bindDailyQuestion();
  bindNotes();
  bindLearningRoutes();
  bindCharacterPrinciples();
  bindComfort();
})();
