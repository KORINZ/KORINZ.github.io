document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('back-to-top');
    var isAnimating = false;

    function updateVisibility() {
        var scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        btn.style.display = scrollPercent >= 80 ? 'block' : 'none';
    }

    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();

    btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (isAnimating) return;
        isAnimating = true;
        var start = window.scrollY;
        var startTime = null;
        var duration = 400;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var ease = 1 - Math.pow(1 - progress, 3);
            window.scrollTo(0, start * (1 - ease));
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                isAnimating = false;
            }
        }

        requestAnimationFrame(step);
    });
});
