document.addEventListener('DOMContentLoaded', function () {
    // Normal social icons with only color change
    const socialHoverColors = {
        'fa-github': '#fff', // GitHub white on hover (GitHub-alt)
        'fa-linkedin': '#2467bf',
        'fa-orcid': '#a5cd47',
        'fa-google-scholar': '#79a4f6',
        'fa-stack-overflow': '#f08136',
        'fa-strava': '#f85423',
        'fa-x-twitter': '#64a9db' // X → blue Twitter bird on hover
    };

    function addColorHover(icon, hoverColor) {
        const link = icon.closest('a');
        if (!link) return;

        // Clear the inline style so CSS (incl. hacker-mode) takes over naturally
        const reset = () => { icon.style.removeProperty('color'); };

        link.addEventListener('mouseenter', () => { icon.style.color = hoverColor; });
        link.addEventListener('mouseleave', reset);
        link.addEventListener('click', reset);
        link.addEventListener('touchend', reset);
    }

    Object.entries(socialHoverColors).forEach(([iconClass, hoverColor]) => {
        document.querySelectorAll('.social-links .' + iconClass).forEach(icon => {
            addColorHover(icon, hoverColor);
        });
    });

    // GitHub: normal = fa-github, hover = fa-github-alt
    document.querySelectorAll('.social-links .fa-github').forEach(icon => {
        const link = icon.closest('a');
        if (!link) return;

        const reset = () => {
            icon.classList.remove('fa-github-alt');
            icon.classList.add('fa-github');
            icon.style.removeProperty('color');
        };

        link.addEventListener('mouseenter', () => {
            icon.classList.remove('fa-github');
            icon.classList.add('fa-github-alt');
            icon.style.color = '#fff';
        });

        link.addEventListener('mouseleave', reset);
        link.addEventListener('click', reset);
        link.addEventListener('touchend', reset);
    });

    // X: normal = fa-x-twitter, hover = fa-twitter (blue bird)
    document.querySelectorAll('.social-links .fa-x-twitter').forEach(icon => {
        const link = icon.closest('a');
        if (!link) return;

        const reset = () => {
            icon.classList.remove('fa-twitter');
            icon.classList.add('fa-x-twitter');
            icon.style.removeProperty('color');
        };

        link.addEventListener('mouseenter', () => {
            icon.classList.remove('fa-x-twitter');
            icon.classList.add('fa-twitter');
            icon.style.color = '#64a9db';
        });

        link.addEventListener('mouseleave', reset);
        link.addEventListener('click', reset);
        link.addEventListener('touchend', reset);
    });

    // "Built with" icons hover colors
    const builtWithHoverColors = {
        'fa-bootstrap': '#6a2edc',      // Bootstrap purple
        'fa-font-awesome': '#5a8ed4',   // Font Awesome blue
        'fa-square-js': '#f4de3e',       // JS yellow
        'fa-css': '#2965f1'              // CSS blue
    };

    Object.entries(builtWithHoverColors).forEach(([iconClass, hoverColor]) => {
        document.querySelectorAll('nav .' + iconClass).forEach(icon => {
            const link = icon.closest('a');
            if (!link) return;

            const reset = () => { icon.style.removeProperty('color'); };

            link.addEventListener('mouseenter', () => { icon.style.color = hoverColor; });
            link.addEventListener('mouseleave', reset);
            link.addEventListener('click', reset);
            link.addEventListener('touchend', reset);
        });
    });
});
