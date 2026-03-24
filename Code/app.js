/**
 * app.js — Main application module
 * Handles: slide carousel, portfolio loading, mobile menu, contact navigation
 */

/* ============================================================
   DOM REFERENCES
   ============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const content = $("#content");
const mobileMenuIcon = $("#mobileMenuIcon");
const mobileMenuContainer = $("#mobileMenuContainer");
const mobileMenu = $("#mobileMenu");

/* ============================================================
   SLIDE CAROUSEL
   ============================================================ */
const slides = $$(".about__slide");
let currentSlide = 0;

// Swap slides[1] and slides[2] to match original order (Facts ↔ Contact)
if (slides.length >= 3) {
  [slides[1], slides[2]] = [slides[2], slides[1]];
}

function showSlide(index) {
  slides.forEach((slide) => {
    slide.classList.remove("about__slide--active");
    slide.style.transform = "";
  });

  const target = slides[index];
  target.classList.add("about__slide--active");
  target.style.transform = "translateX(100%)";

  // Force reflow, then animate in
  requestAnimationFrame(() => {
    target.style.transform = "translateX(0)";
  });

  currentSlide = index;
}

function changeSlide(direction) {
  const next = (currentSlide + direction + slides.length) % slides.length;
  showSlide(next);
}

// Arrow buttons
$(".about__arrow--prev")?.addEventListener("click", () => changeSlide(-1));
$(".about__arrow--next")?.addEventListener("click", () => changeSlide(1));

// Keyboard navigation within the slide region
$(".about__description")?.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") changeSlide(-1);
  if (e.key === "ArrowRight") changeSlide(1);
});

// Ensure first slide is active on load
showSlide(0);

/* ============================================================
   CONTACT SLIDE
   ============================================================ */
function showContactSlide() {
  const contactIndex = slides.findIndex((s) => s.id === "contact");
  if (contactIndex !== -1) showSlide(contactIndex);
}

// Handle #contact hash on page load
if (location.hash === "#contact") {
  showContactSlide();
}

/* ============================================================
   PORTFOLIO LOADER
   ============================================================ */
const PORTFOLIO_FILES = {
  backend: "Portfolio/backend.html",
  frontend: "Portfolio/frontend.html",
  ux: "Portfolio/ux.html",
  "data-analysis": "Portfolio/data-analysis.html",
  publications: "Portfolio/publications.html",
};

async function showPortfolio(type) {
  const filePath = PORTFOLIO_FILES[type];
  if (!filePath) {
    console.error(`Unknown portfolio type: ${type}`);
    return;
  }

  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    content.innerHTML = await response.text();
  } catch (error) {
    console.error("Error loading portfolio:", error);
    content.innerHTML = `<p>Sorry, an error occurred while loading the portfolio. Please try again later.</p>`;
  }
}

/* ============================================================
   MOBILE MENU
   ============================================================ */
function toggleMobileMenu() {
  const isOpen = mobileMenuContainer.classList.toggle("menu-open");
  mobileMenuIcon.classList.toggle("menu-open");
  mobileMenuIcon.setAttribute("aria-expanded", String(isOpen));

  // Slight delay for the slide-in animation
  setTimeout(() => mobileMenu.classList.toggle("menu-open", isOpen), 10);
}

function closeMobileMenu() {
  mobileMenuContainer.classList.remove("menu-open");
  mobileMenuIcon.classList.remove("menu-open");
  mobileMenu.classList.remove("menu-open");
  mobileMenuIcon.setAttribute("aria-expanded", "false");
}

mobileMenuIcon?.addEventListener("click", toggleMobileMenu);

/* ============================================================
   EVENT DELEGATION — ALL NAVIGATION
   ============================================================ */
document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-portfolio]");
  if (target) {
    e.preventDefault();
    showPortfolio(target.dataset.portfolio);
    closeMobileMenu();
    return;
  }

  const aboutBtn = e.target.closest("[data-nav='about']");
  if (aboutBtn) {
    // If already on index, reset to first slide; otherwise navigate
    if (location.pathname.endsWith("index.html") || location.pathname.endsWith("/")) {
      // Restore the about section in case portfolio was loaded
      if (!$(".about", content)) location.reload();
      showSlide(0);
    } else {
      location.href = "index.html";
    }
    closeMobileMenu();
    return;
  }

  const contactAction = e.target.closest("[data-action='contact']");
  if (contactAction) {
    e.preventDefault();
    if (location.pathname.endsWith("index.html") || location.pathname.endsWith("/")) {
      showContactSlide();
    } else {
      location.assign("index.html#contact");
    }
    closeMobileMenu();
    return;
  }

  // Close mobile menu on any link click inside it
  if (e.target.closest(".mobile-menu__link")) {
    closeMobileMenu();
  }
});

// Close mobile menu on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && mobileMenuContainer?.classList.contains("menu-open")) {
    closeMobileMenu();
  }
});
