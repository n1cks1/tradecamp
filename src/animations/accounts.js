(() => {
    const section = document.querySelector('.accounts');
    if (!section) return;

    // ───── появление элементов при скролле ─────
    // каждый элемент отслеживается отдельно и выезжает, когда сам доходит до экрана.
    // если в экран попало сразу несколько (например, ряд валют), они идут
    // по очереди сверху вниз и слева направо с шагом STEP
    const STEP = 80; // мс
    const items = section.querySelectorAll('[data-reveal]');
    section.classList.add('reveal-ready');

    if (!('IntersectionObserver' in window)) {
        items.forEach((el) => el.classList.add('is-visible'));
    } else {
        const observer = new IntersectionObserver(
            (entries) => {
                entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) =>
                        (a.boundingClientRect.top - b.boundingClientRect.top) ||
                        (a.boundingClientRect.left - b.boundingClientRect.left)
                    )
                    .forEach((entry, index) => {
                        const el = entry.target;
                        el.style.setProperty('--reveal-delay', `${index * STEP}ms`);
                        el.classList.add('is-visible');
                        observer.unobserve(el); // анимация один раз
                    });
            },
            // элемент срабатывает, когда на 15% поднялся выше нижних 8% экрана
            { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
        );
        items.forEach((el) => observer.observe(el));
    }

    // ───── тултип: hover работает на CSS, тут тап на тач-экранах и Esc ─────
    const hint = section.querySelector('.accounts__note-hint');
    if (!hint) return;

    const setOpen = (open) => hint.setAttribute('aria-expanded', String(open));

    hint.addEventListener('click', (e) => {
        e.stopPropagation();
        setOpen(hint.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('click', () => setOpen(false));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setOpen(false);
    });

    hint.addEventListener('blur', () => setOpen(false));
})();