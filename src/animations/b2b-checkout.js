// Анимации секции B2B Checkout
(() => {
    const section = document.querySelector('.b2b-checkout');
    if (!section) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // включаем стартовые состояния анимаций (скрытие) только когда JS работает
    section.classList.add('is-anim');

    // ---------- Бегущий элемент по линии во 2 блоке ----------
    // Стартует сразу, как только появилась группа справа (invoice, лого, карточки)
    const connector = section.querySelector('.terms-block__connector');
    const connectorGroup = Array.from(section.querySelectorAll('.terms-block__visual [data-reveal]'));

    const tryStartRunner = () => {
        if (!connector || connector.classList.contains('is-visible')) return;
        if (!connectorGroup.every((el) => el.classList.contains('is-visible'))) return;
        connector.classList.add('is-visible');
    };

    // ---------- Появление при попадании в область видимости ----------
    const targets = section.querySelectorAll('[data-reveal]');

    if (reduceMotion || !('IntersectionObserver' in window)) {
        targets.forEach((el) => el.classList.add('is-visible'));
        tryStartRunner();
    } else {
        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    // если элемент в группе — показываем всю группу разом
                    const group = entry.target.closest('[data-reveal-group]');
                    const items = group ? group.querySelectorAll('[data-reveal]') : [entry.target];

                    items.forEach((el) => {
                        el.classList.add('is-visible');
                        obs.unobserve(el);
                    });
                });
                tryStartRunner();
            },
            { rootMargin: '0px 0px -12% 0px', threshold: 0.15 }
        );

        targets.forEach((el) => observer.observe(el));
    }

    // ---------- Иконка спускается по пунктиру при скролле ----------
    // Прогресс считается для каждого блока отдельно по положению его линии в окне:
    // верх линии на 85% высоты экрана -> иконка вверху, на 40% -> иконка внизу у заголовка
    const tracks = Array.from(section.querySelectorAll('[data-track]'))
        .map((track) => ({ track, icon: track.querySelector('[data-track-icon]') }))
        .filter((item) => item.icon);

    if (!tracks.length || reduceMotion) return;

    const START = 0.85;
    const END = 0.4;
    let ticking = false;

    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

    const update = () => {
        ticking = false;
        const vh = window.innerHeight;
        const start = vh * START;
        const end = vh * END;

        tracks.forEach(({ track, icon }) => {
            const top = track.getBoundingClientRect().top;
            const progress = clamp((start - top) / (start - end), 0, 1);
            const travel = track.clientHeight - icon.offsetHeight;

            // иконка по умолчанию стоит внизу, поэтому сдвигаем вверх на оставшийся путь
            icon.style.transform = `translate3d(0, ${-(1 - progress) * travel}px, 0)`;
        });
    };

    const requestUpdate = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    update();
})();