(() => {
    const title = document.querySelector('.ecosystem__title');
    if (!title) return;

    // для скринридеров: полный текст в одном месте
    title.setAttribute('aria-label', title.textContent.replace(/\s+/g, ' ').trim());

    // разбиваем на слова и буквы, <br> оставляем на месте
    const fragment = document.createDocumentFragment();

    [...title.childNodes].forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            node.textContent
                .split(/\s+/)
                .filter(Boolean)
                .forEach(word => {
                    const wordEl = document.createElement('span');
                    wordEl.className = 'ecosystem__title-word';
                    wordEl.setAttribute('aria-hidden', 'true');

                    [...word].forEach(char => {
                        const letter = document.createElement('span');
                        letter.className = 'ecosystem__title-letter';
                        letter.textContent = char;
                        wordEl.append(letter);
                    });

                    fragment.append(wordEl, ' ');
                });
        } else {
            fragment.append(node.cloneNode(true));
        }
    });

    title.replaceChildren(fragment);

    const letters = title.querySelectorAll('.ecosystem__title-letter');

    const START = 0.8; // подсветка начинается, когда верх заголовка на 80% высоты окна
    const END = 0.3;   // полностью горит, когда верх поднялся до 30%
    let ticking = false;

    function update() {
        const vh = window.innerHeight;
        const { top } = title.getBoundingClientRect();

        const progress = Math.min(
            Math.max((vh * START - top) / (vh * (START - END)), 0),
            1
        );
        const lit = Math.round(progress * letters.length);

        letters.forEach((letter, i) => {
            letter.classList.toggle('ecosystem__title-letter--active', i < lit);
        });

        ticking = false;
    }

    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
})();