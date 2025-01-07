const aboutBtn = document.getElementById('aboutBtn');
const mobileAboutBtn = document.getElementById('mobileAboutBtn');
aboutBtn.addEventListener('click', () => {
    window.location.href = "index.html";
});

mobileAboutBtn.addEventListener('click', () => {
    window.location.href = "index.html";
});

let currentSlide = 0;
let slides = Array.from(document.querySelectorAll('.about__slide'));

function toggleSlides() {
    [slides[1], slides[2]] = [slides[2], slides[1]];
}

function changeSlide(direction) {
    const currentSlideElement = slides[currentSlide];
    currentSlideElement.classList.remove('about__slide--active');

    // Calculate new current slide index
    currentSlide = (currentSlide + direction + slides.length) % slides.length;

    const nextSlideElement = slides[currentSlide];
    nextSlideElement.classList.add('about__slide--active');

    // Reset the position for the new slide (always from right to left)
    nextSlideElement.style.transform = 'translateX(100%)';
    
    // Animate the transition
    setTimeout(() => {
        nextSlideElement.style.transform = 'translateX(0)'; // Slide into view from right to left
    }, 0); // Timeout needed to trigger reflow
}


slides[currentSlide].classList.add('about__slide--active');

document.querySelector('.about__arrow:nth-child(1)').addEventListener('click', () => changeSlide(-1));
document.querySelector('.about__arrow:nth-child(2)').addEventListener('click', () => changeSlide(1));

document.getElementById('aboutBtn').addEventListener('click', () => {
    currentSlide = 0;
    slides.forEach(slide => slide.classList.remove('about__slide--active'));
    slides[currentSlide].classList.add('about__slide--active');
});

toggleSlides();

function openContactSlide() {
    window.location.assign("index.html#contact");
}

window.addEventListener('DOMContentLoaded', (event) => {
    if (window.location.hash === '#contact') {
        showContactSlide();
    }
});

function openContactSlide() {
    if (window.location.pathname.includes('index.html')) {
        window.location.href = window.location.href.split('#')[0] + "#contact";
        window.location.reload();
    } else {
        window.location.assign("index.html#contact");
    }
}

window.addEventListener('DOMContentLoaded', (event) => {
    if (window.location.hash === '#contact') {
        showContactSlide();
    }
});

function showContactSlide() {
    const slides = document.querySelectorAll('.about__slide'); 
    slides.forEach(slide => slide.classList.remove('about__slide--active'));

    const contactSlide = document.getElementById('contact');
    if (contactSlide) {
        contactSlide.classList.add('about__slide--active');
        contactSlide.style.transform = 'translateX(0)';
    }
}
