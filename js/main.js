const slides = document.querySelectorAll('.slide');
const btns   = document.querySelectorAll('.nav-btn');
const main   = document.querySelector('.scroll-container');

const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
    if (e.isIntersecting) {
        const i = [...slides].indexOf(e.target);
        btns.forEach((b, j) => b.classList.toggle('active', i === j));
    }
    });
}, { root: main, threshold: 0.5 });

slides.forEach(s => obs.observe(s));
btns.forEach((b, i) => b.addEventListener('click', () => slides[i].scrollIntoView({ behavior: 'smooth' })));