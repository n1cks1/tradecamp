// Появление элементов при скролле.
// Отслеживает [data-reveal-group] (и одиночные [data-reveal] вне групп),
// при попадании в экран добавляет .is-visible — дальше всё делает CSS.

(function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) return;

    document.documentElement.classList.add('reveal-ready');

    const targets = [
        ...document.querySelectorAll('[data-reveal-group]'),
        ...[...document.querySelectorAll('[data-reveal]')].filter(
            (el) => !el.closest('[data-reveal-group]')
        ),
    ];

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // анимация один раз
            });
        },
        {
            threshold: 0.15,
            rootMargin: '0px 0px -10% 0px',
        }
    );

    targets.forEach((el) => observer.observe(el));
})();