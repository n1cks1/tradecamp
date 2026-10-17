// Появление элементов [data-reveal] из прозрачности при попадании в зону видимости.
// Работает для любой секции с атрибутом data-reveal-scope.
// Задержки (например, правая карточка чуть позже левой) задаются в SCSS через --reveal-delay.
(() => {
    const initReveal = (scope) => {
        const items = scope.querySelectorAll('[data-reveal]');
        if (!items.length) return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Без IntersectionObserver или при reduced motion — просто показываем всё
        if (!('IntersectionObserver' in window) || reduceMotion) {
            items.forEach((el) => el.classList.add('is-revealed'));
            return;
        }

        // Только теперь прячем элементы — без JS секция остаётся видимой
        scope.classList.add('is-reveal-ready');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-revealed');
                observer.unobserve(entry.target);
            });
        }, {
            // срабатывает, когда элемент поднялся на ~15% от нижнего края экрана
            rootMargin: '0px 0px -15% 0px',
            threshold: 0,
        });

        items.forEach((el) => observer.observe(el));
    };

    const init = () => {
        document.querySelectorAll('.client-profile[data-reveal-scope]').forEach(initReveal);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();