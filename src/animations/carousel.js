// Бегущая строка с постоянной скоростью: скролл вниз → лента вправо, вверх → влево.
// Плюс .ecosystem наезжает на карусель при прокрутке.

const carousel = document.querySelector('.carousel');

if (carousel) {
    initMarquee(carousel);

    const ecosystem = document.querySelector('.ecosystem');
    if (ecosystem) initOverlap(carousel, ecosystem);
}

function initMarquee(root) {
    const track = root.querySelector('.carousel__track');
    const group = track && track.querySelector('.carousel__group');
    if (!group) return;

    const DESIGN_WIDTH = 1440;
    const SPEED = 50; // px/с на ширине макета, не зависит от скорости скролла

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let groupWidth = 0;
    let offset = 0;
    let direction = -1; // -1 влево, 1 вправо
    let lastScrollY = window.scrollY;
    let lastTime = 0;
    let rafId = 0;
    let buildId = 0;
    let inView = false;

    // держим offset в диапазоне (-groupWidth, 0] в обе стороны
    const wrap = (x) => (groupWidth ? ((x % groupWidth) - groupWidth) % groupWidth : 0);
    const scale = () => window.innerWidth / DESIGN_WIDTH;
    const render = () => {
        track.style.transform = `translate3d(${offset}px, 0, 0)`;
    };

    // клонируем группу столько раз, чтобы лента всегда перекрывала экран
    function build() {
        buildId = 0;
        track.querySelectorAll('[data-clone]').forEach((node) => node.remove());

        groupWidth = group.getBoundingClientRect().width;
        if (!groupWidth) return;

        const copies = Math.ceil(root.clientWidth / groupWidth) + 1;
        for (let i = 0; i < copies; i++) {
            const clone = group.cloneNode(true);
            clone.dataset.clone = '';
            clone.setAttribute('aria-hidden', 'true');
            track.append(clone);
        }

        offset = wrap(offset);
        render();
    }

    function scheduleBuild() {
        if (!buildId) buildId = requestAnimationFrame(build);
    }

    function tick(time) {
        const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.1) : 0;
        lastTime = time;

        offset = wrap(offset + direction * SPEED * scale() * dt);

        render();
        rafId = requestAnimationFrame(tick);
    }

    function start() {
        if (rafId || !inView || reducedMotion.matches) return;
        lastTime = 0;
        rafId = requestAnimationFrame(tick);
    }

    function stop() {
        cancelAnimationFrame(rafId);
        rafId = 0;
    }

    function onScroll() {
        const y = window.scrollY;
        const delta = y - lastScrollY;
        lastScrollY = y;
        if (!delta) return;

        // меняется только направление; обновляем всегда,
        // чтобы при появлении на экране оно уже было верным
        direction = delta > 0 ? 1 : -1;
    }

    // крутим только пока карусель на экране
    new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        inView ? start() : stop();
    }).observe(root);

    new ResizeObserver(scheduleBuild).observe(root);
    new ResizeObserver(scheduleBuild).observe(group);

    reducedMotion.addEventListener('change', () => (reducedMotion.matches ? stop() : start()));
    window.addEventListener('scroll', onScroll, { passive: true });
    if (document.fonts) document.fonts.ready.then(scheduleBuild);

    build();
}

function initOverlap(root, next) {
    const RANGE = 0.8; // за какую долю высоты окна секция полностью накрывает карусель

    let start = 0;
    let range = 1;
    let shift = 0;
    let ticking = false;

    function measure() {
        next.style.transform = '';
        next.style.marginBottom = '';

        const baseMargin = parseFloat(getComputedStyle(next).marginBottom) || 0;
        const rootTop = root.getBoundingClientRect().top + window.scrollY;
        const nextRect = next.getBoundingClientRect();
        const nextTop = nextRect.top + window.scrollY;

        // насколько поднять секцию, чтобы её верх дошёл до верха карусели
        shift = nextTop - rootTop;

        // старт: верх секции показался у нижнего края окна
        start = Math.max(0, nextTop - window.innerHeight);

        // наезд заканчивается раньше, чем покажется низ секции, —
        // иначе было бы видно, как под неё заезжает следующий блок
        range = Math.max(1, Math.min(window.innerHeight * RANGE, nextRect.height - shift));

        // убираем пустое место под секцией после её подъёма
        next.style.marginBottom = `${baseMargin - shift}px`;

        update();
    }

    function update() {
        ticking = false;
        const progress = Math.min(1, Math.max(0, (window.scrollY - start) / range));
        next.style.transform = progress ? `translate3d(0, ${-shift * progress}px, 0)` : '';
    }

    function onScroll() {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    if (document.fonts) document.fonts.ready.then(measure);

    measure();
}