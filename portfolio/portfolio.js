(() => {
  "use strict";

  const SECTION_IDS = ["top", "problem", "decisions", "experience", "evidence", "outcome", "resume"];
  const SECTION_LABELS = {
    top: "Overview",
    problem: "Problem",
    decisions: "Decisions",
    experience: "Product",
    evidence: "Proof",
    outcome: "Outcome",
    resume: "Resume"
  };

  const sections = SECTION_IDS
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const sectionLinks = Array.from(document.querySelectorAll("[data-section-link]"));
  const positionOutput = document.getElementById("sectionPosition");
  const progress = document.getElementById("readingProgress");
  const dockButtons = Array.from(document.querySelectorAll("[data-section-direction]"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeSectionId = SECTION_IDS[0];
  let scrollFrame = 0;

  function sectionIndex(id) {
    const index = SECTION_IDS.indexOf(id);
    return index < 0 ? 0 : index;
  }

  function setActiveSection(id) {
    if (!SECTION_LABELS[id]) return;
    activeSectionId = id;
    const index = sectionIndex(id);

    sectionLinks.forEach((link) => {
      if (link.dataset.sectionLink === id) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });

    if (positionOutput) {
      positionOutput.textContent = `${SECTION_LABELS[id]} // ${String(index + 1).padStart(2, "0")} of ${String(SECTION_IDS.length).padStart(2, "0")}`;
    }

    dockButtons.forEach((button) => {
      const direction = Number(button.dataset.sectionDirection);
      const unavailable = (direction < 0 && index === 0) || (direction > 0 && index === SECTION_IDS.length - 1);
      button.disabled = unavailable;
    });
  }

  function updateReadingState() {
    scrollFrame = 0;
    const documentHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const readingPercent = Math.min(100, Math.max(0, (window.scrollY / documentHeight) * 100));
    if (progress) progress.style.setProperty("--reading-progress", `${readingPercent}%`);

    const probe = window.scrollY + Math.min(window.innerHeight * 0.34, 300);
    let current = sections[0]?.id || SECTION_IDS[0];
    sections.forEach((section) => {
      if (section.offsetTop <= probe) current = section.id;
    });
    setActiveSection(current);
  }

  function requestReadingState() {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(updateReadingState);
  }

  function moveSection(direction) {
    const currentIndex = sectionIndex(activeSectionId);
    const targetIndex = Math.min(SECTION_IDS.length - 1, Math.max(0, currentIndex + direction));
    const target = document.getElementById(SECTION_IDS[targetIndex]);
    if (!target) return;
    target.scrollIntoView({ block: "start", behavior: reduceMotion.matches ? "auto" : "smooth" });
    setActiveSection(SECTION_IDS[targetIndex]);
  }

  dockButtons.forEach((button) => {
    button.addEventListener("click", () => moveSection(Number(button.dataset.sectionDirection)));
  });

  const tabs = Array.from(document.querySelectorAll("[data-world-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-world-panel]"));

  function activateWorld(world, moveFocus = false) {
    const selectedTab = tabs.find((tab) => tab.dataset.worldTab === world);
    if (!selectedTab) return;

    tabs.forEach((tab) => {
      const selected = tab === selectedTab;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.worldPanel !== world;
    });

    if (moveFocus) selectedTab.focus({ preventScroll: true });
  }

  tabs.forEach((tab, tabIndex) => {
    tab.addEventListener("click", () => activateWorld(tab.dataset.worldTab));
    tab.addEventListener("keydown", (event) => {
      let nextIndex = tabIndex;
      if (event.key === "ArrowRight") nextIndex = (tabIndex + 1) % tabs.length;
      else if (event.key === "ArrowLeft") nextIndex = (tabIndex - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      activateWorld(tabs[nextIndex].dataset.worldTab, true);
    });
  });

  window.addEventListener("scroll", requestReadingState, { passive: true });
  window.addEventListener("resize", requestReadingState, { passive: true });

  setActiveSection(activeSectionId);
  activateWorld("home");
  updateReadingState();
})();
