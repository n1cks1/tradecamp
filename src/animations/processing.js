// Анимации появления секции .processing
// Каждый элемент с [data-reveal] получает .is-revealed, когда попадает в область видимости.
(function () {
    const section = document.querySelector('.processing');
    if (!section) return;

    const items = section.querySelectorAll('[data-reveal]');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // включаем скрытое начальное состояние только когда JS точно работает
    section.classList.add('is-animated');

    if (reduceMotion || !('IntersectionObserver' in window)) {
        items.forEach((el) => el.classList.add('is-revealed'));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-revealed');
                observer.unobserve(entry.target); // анимация один раз
            });
        },
        {
            threshold: 0.2,
            rootMargin: '0px 0px -10% 0px', // срабатывает чуть раньше нижнего края экрана
        }
    );

    items.forEach((el) => observer.observe(el));
})();