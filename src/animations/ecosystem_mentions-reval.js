// Секция .ecosystem: блок "As mentioned on" плавно появляется, когда доходит до экрана.

const ecosystemSection = document.querySelector('.ecosystem');

if (ecosystemSection) {
    const mentions = ecosystemSection.querySelector('.ecosystem__mentions');
    if (mentions) initReveal(mentions, 'ecosystem__mentions--visible');
}

function initReveal(element, visibleClass) {
    if (!('IntersectionObserver' in window)) {
        element.classList.add(visibleClass);
        return;
    }

    const observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        element.classList.add(visibleClass);
        observer.disconnect();
    }, { threshold: 0.2 });

    observer.observe(element);
}