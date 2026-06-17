export function setupMenuCommands(activeClass = "page-home", menujson = null) {
  const navbarCollapseEl = document.querySelector(".navbar-collapse");
  if (!navbarCollapseEl) return;

  const navLinks = document.querySelectorAll<HTMLElement>(".nav-link");
  navLinks.forEach((link) => {
    const page = link.dataset.page;
    if (page === activeClass) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  /*
  initCopyrightYear();
  initMenuName(SITE_TITLE);
  initMenuNews(menujson);
  initGalleryYears();

  checkItemsForSale();*/
}
