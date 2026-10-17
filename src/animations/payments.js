// Секция .payments:
// 1) подзаголовок проявляется, когда попадает в зону видимости;
// 2) после этого плитки один раз «пятнашками» проходят от исходной сетки через кадры 1–6 макета
//    и останавливаются на 6-м (iDEAL на первом ходе исчезает, его место занимает Trustly). За ход плитка сдвигается ровно на 1 клетку по горизонтали/вертикали
//    и только в свободную клетку.
(() => {
    const section = document.querySelector('.payments');
    if (!section) return;

    const subtitle = section.querySelector('.payments__subtitle');
    const grid = section.querySelector('.payments__grid');

    const tiles = new Map();
    section.querySelectorAll('.payments__method[data-pay]').forEach((el) => {
        tiles.set(el.dataset.pay, el);
    });

    // Сетка 11×3 (1-based): колонки 1–4 слева, 5–7 логотип, 8–11 справа.
    const COLS = 11;
    const ROWS = 3;
    const LOGO_COLS = [5, 6, 7];

    // Исходное положение — ровная сетка «3 + лого + 3»
    const INITIAL = {
        amex: [2, 1], discover: [3, 1], visa: [4, 1],
        cashapp: [2, 2], mastercard: [3, 2], alipay: [4, 2],
        cb: [2, 3], jcb: [3, 3], sofort: [4, 3],

        klarna: [8, 1], pix: [9, 1], boleto: [10, 1],
        mercado: [8, 2], blik: [9, 2], giropay: [10, 2],
        ideal: [8, 3], trustly: [9, 3], paysafe: [10, 3],
    };

    const DELTA = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] };

    // Ходы по шагам. В шаге — один или несколько ходов, идут одновременно.
    // Ход: [плитка, направление на 1 клетку] или [плитка, 'hide'] — плавно убрать плитку.
    const STEPS = [
        // CB влево, giropay вправо, iDEAL исчезает — на его место встаёт Trustly
        [['cb', 'left'], ['giropay', 'right'], ['ideal', 'hide'], ['trustly', 'left']],
        // Cash App вниз, BLIK вправо
        [['cashapp', 'down'], ['blik', 'right']],
        // Mastercard уходит в левый верхний угол, Pix опускается, Klarna вправо
        [['mastercard', 'left']],
        [['mastercard', 'left']],
        [['mastercard', 'up'], ['pix', 'down']],
        [['cashapp', 'up'], ['klarna', 'right']],
        // левая часть собирается в финальную раскладку
        [['cashapp', 'right']],
        [['cb', 'up'], ['jcb', 'left']],
        [['jcb', 'left'], ['sofort', 'left']],
        [['amex', 'down']],
        // финал: Mastercard вправо, giropay вниз
        [['mastercard', 'right'], ['giropay', 'down']],
    ];

    const START_DELAY = 700;  // пауза после появления подзаголовка
    const STEP_DELAY = 1400;  // время между ходами (сам переход в CSS — 1.1s)

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // текущее положение каждой плитки
    const pos = {};
    Object.entries(INITIAL).forEach(([key, p]) => { pos[key] = [...p]; });

    const place = (key) => {
        const el = tiles.get(key);
        if (!el) return;
        el.style.setProperty('--col', pos[key][0] - 1);
        el.style.setProperty('--row', pos[key][1] - 1);
    };

    const isFree = (col, row) => (
        col >= 1 && col <= COLS && row >= 1 && row <= ROWS
        && !LOGO_COLS.includes(col)
        && !Object.values(pos).some(([c, r]) => c === col && r === row)
    );

    const applyStep = (moves) => {
        moves.forEach(([key, dir]) => {
            if (!pos[key]) return;
            if (dir === 'hide') {
                delete pos[key]; // клетка освобождается
                tiles.get(key)?.classList.add('is-hidden');
                return;
            }
            const [dc, dr] = DELTA[dir];
            const target = [pos[key][0] + dc, pos[key][1] + dr];
            if (!isFree(...target)) {
                console.warn(`[payments] клетка ${target} занята — ход ${key} ${dir} пропущен`);
                return;
            }
            pos[key] = target;
            place(key);
        });
    };

    Object.keys(pos).forEach(place);

    let step = 0;
    let timer = null;
    let unlocked = false; // ходы стартуют только после появления подзаголовка
    let gridInView = false;

    const tick = () => {
        applyStep(STEPS[step]);
        step += 1;
        timer = step < STEPS.length ? setTimeout(tick, STEP_DELAY) : null;
    };

    const play = (delay) => {
        if (reduceMotion || timer || !unlocked || !gridInView || step >= STEPS.length) return;
        timer = setTimeout(tick, delay);
    };

    const stop = () => {
        clearTimeout(timer);
        timer = null;
    };

    if (!('IntersectionObserver' in window)) {
        section.classList.add('is-visible');
        return;
    }

    // Подзаголовок: проявление один раз
    const subtitleObserver = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        section.classList.add('is-visible');
        subtitleObserver.disconnect();
        unlocked = true;
        play(START_DELAY);
    }, { threshold: 0.6 });

    // Сетка: ходы идут только пока она на экране
    const gridObserver = new IntersectionObserver((entries) => {
        gridInView = entries[0].isIntersecting;
        if (gridInView) play(STEP_DELAY / 2);
        else stop();
    }, { threshold: 0.2 });

    subtitleObserver.observe(subtitle || section);
    gridObserver.observe(grid);
})();