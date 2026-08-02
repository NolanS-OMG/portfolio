export function navigateToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (!el) return;

  el.scrollIntoView({ behavior: 'smooth', block: 'start' });

  setTimeout(() => {
    el.classList.add('tool-highlight-active');
    setTimeout(() => {
      el.classList.remove('tool-highlight-active');
    }, 1500);
  }, 600);
}
