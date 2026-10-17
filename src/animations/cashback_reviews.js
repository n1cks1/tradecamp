/**
 * Секция cashback-reviews
 * 1) Появление элементов [data-reveal] снизу вверх при попадании в зону видимости.
 * 2) Лёгкий параллакс 5 иконок кэшбэка: пока курсор по Y находится на уровне
 *    карточки Cashbacks, иконки чуть смещаются в сторону, противоположную движению мыши.
 */
(function () {
    const DESIGN_WIDTH = 1440; // ширина макета, как в fluid-vw
    const EASE = 0.08;         // плавность догоняния (0..1), меньше — мягче

    function initReveal(section, reduceMotion) {
        const items = section.querySelectorAll('[data-reveal]');
        if (!items.length) return;

        if (reduceMotion || !('IntersectionObserver' in window)) {
            items.forEach((el) => el.classList.add('is-revealed'));
            section.classList.add('is-reveal-ready');
            return;
        }

        section.classList.add('is-reveal-ready');

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('is-revealed');
                    observer.unobserve(entry.target);
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
        );

        items.forEach((el) => observer.observe(el));
    }

    function initParallax(section, reduceMotion) {
        const zone = section.querySelector('[data-parallax-zone]');
        if (!zone) return;

        // только для устройств с мышью
        const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (reduceMotion || !finePointer) return;

        const icons = Array.from(zone.querySelectorAll('[data-parallax-depth]')).map((el) => ({
            el,
            depth: parseFloat(el.dataset.parallaxDepth) || 10, // макс. смещение в px макета
            x: 0,
            y: 0,
            tx: 0,
            ty: 0,
        }));
        if (!icons.length) return;

        let mouseX = null;
        let mouseY = null;
        let rafId = null;

        function updateTargets() {
            if (mouseX === null) return;

            const rect = zone.getBoundingClientRect();
            const insideByY = mouseY >= rect.top && mouseY <= rect.bottom;
            const scale = window.innerWidth / DESIGN_WIDTH;

            // -1..1 относительно центра карточки
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const nx = clamp((mouseX - cx) / (window.innerWidth / 2), -1, 1);
            const ny = clamp((mouseY - cy) / (rect.height / 2), -1, 1);

            icons.forEach((icon) => {
                if (insideByY) {
                    const d = icon.depth * scale;
                    icon.tx = -nx * d; // противоположно мыши
                    icon.ty = -ny * d;
                } else {
                    icon.tx = 0;
                    icon.ty = 0;
                }
            });

            startLoop();
        }

        function tick() {
            let moving = false;

            icons.forEach((icon) => {
                icon.x += (icon.tx - icon.x) * EASE;
                icon.y += (icon.ty - icon.y) * EASE;

                if (Math.abs(icon.tx - icon.x) > 0.01 || Math.abs(icon.ty - icon.y) > 0.01) {
                    moving = true;
                } else {
                    icon.x = icon.tx;
                    icon.y = icon.ty;
                }

                icon.el.style.transform = `translate3d(${icon.x.toFixed(2)}px, ${icon.y.toFixed(2)}px, 0)`;
            });

            rafId = moving ? requestAnimationFrame(tick) : null;
        }

        function startLoop() {
            if (rafId === null) rafId = requestAnimationFrame(tick);
        }

        window.addEventListener(
            'mousemove',
            (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
                updateTargets();
            },
            { passive: true }
        );

        // при скролле курсор стоит, а карточка уезжает — пересчитываем
        window.addEventListener('scroll', updateTargets, { passive: true });

        // курсор ушёл из окна — возвращаем иконки на место
        document.addEventListener('mouseleave', () => {
            icons.forEach((icon) => {
                icon.tx = 0;
                icon.ty = 0;
            });
            mouseX = mouseY = null;
            startLoop();
        });
    }

    function clamp(v, min, max) {
        return Math.min(max, Math.max(min, v));
    }

    function init() {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        document.querySelectorAll('[data-cashback-reviews]').forEach((section) => {
            initReveal(section, reduceMotion);
            initParallax(section, reduceMotion);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();