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

  const level = document.getElementById("learningLevel");
  const open = document.getElementById("openLevel");
  const status = document.getElementById("routeStatus");

  if (!level || !open) return;

  function setStatus(message) {
    if (status) status.textContent = message;
  }

  function openSelectedLevel() {
    const route = ROUTES[level.value];
    if (!route) {
      setStatus("Please choose a valid learning level.");
      return;
    }
    setStatus("Opening the selected Khaemenes learning campus…");
    window.location.assign(route);
  }

  open.addEventListener("click", openSelectedLevel);

  level.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      openSelectedLevel();
    }
  });
})();