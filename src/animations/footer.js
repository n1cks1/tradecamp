// Появление элементов снизу при попадании в область видимости.
// Работает для любых [data-reveal]; [data-reveal-child] анимируются,
// когда их родитель с [data-reveal] получил .is-revealed.
(() => {
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || !('IntersectionObserver' in window)) {
        items.forEach((el) => el.classList.add('is-revealed'));
        return;
    }

    // скрывающие стили включаются только после этого класса — без JS контент виден
    document.documentElement.classList.add('reveal-ready');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-revealed');
                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.2,
            rootMargin: '0px 0px -8% 0px',
        }
    );

    items.forEach((el) => observer.observe(el));
})();