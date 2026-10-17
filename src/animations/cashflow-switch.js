// Переключатель Disable / Cashflow в секции cashflow-hero
document.querySelectorAll('.cashflow-hero__payout').forEach((payout) => {
    const buttons = payout.querySelectorAll('.cashflow-hero__switch-btn');
    const timelines = payout.querySelectorAll('.cashflow-hero__timeline');

    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;

            buttons.forEach((b) => {
                const active = b === btn;
                b.classList.toggle('is-active', active);
                b.setAttribute('aria-pressed', active);
            });

            timelines.forEach((t) => {
                t.hidden = t.dataset.mode !== mode;
            });
        });
    });
});