// Ставим как можно раньше (лучше inline в <head>), чтобы не было мигания
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
        items.forEach((el) => el.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target); // анимация один раз
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px',
    });

    items.forEach((el) => observer.observe(el));
});