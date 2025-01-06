
const mobileMenuIcon = document.getElementById('mobileMenuIcon');
const mobileMenuContainer = document.getElementById('mobileMenuContainer');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuLink = document.querySelectorAll('.mobile-menu__link');

mobileMenuIcon.addEventListener('click', handleToggle);
mobileMenuLink.forEach(element => {
    element.addEventListener('click', handleClose);
});

function handleToggle () {
    mobileMenuContainer.classList.toggle('menu-open');
    setTimeout(() => mobileMenu.classList.toggle('menu-open'), 10);
    mobileMenuIcon.classList.toggle('menu-open');
}

function handleClose () {
    mobileMenuContainer.classList.contains('menu-open') ? mobileMenuContainer.classList.remove('menu-open') : null;
    mobileMenuIcon.classList.contains('menu-open') ? mobileMenuIcon.classList.remove('menu-open'): null;
    mobileMenu.classList.contains('menu-open') ? mobileMenu.classList.remove('menu-open'): null;
}
