document.addEventListener('DOMContentLoaded', function () {
    // On touch devices there is no hover, so a tap toggles the enlarged size
    // instead of opening the full-size certificate in a new tab.
    if (!window.matchMedia('(hover: none)').matches) return;

    document.querySelectorAll('.award-link').forEach(link => {
        const img = link.querySelector('.award-img');
        if (!img) return;

        link.addEventListener('click', event => {
            event.preventDefault();
            img.classList.toggle('enlarged');
        });
    });
});
