document.addEventListener('DOMContentLoaded', function () {
    // Map icon classes → hover colors
    const hoverColors = {
        'fa-github': '#fff', // GitHub white on hover (GitHub-alt)
        'fa-linkedin': '#2467bf',
        'fa-orcid': '#a5cd47',
        'fa-google-scholar': '#79a4f6',
        'fa-stack-overflow': '#f08136',
        'fa-strava': '#f85423',
        'fa-x-twitter': '#64a9db' // X → blue Twitter bird on hover
    };

    Object.entries(hoverColors).forEach(([iconClass, hoverColor]) => {
        // Find each icon in the sidebar
        document.querySelectorAll('.social-links .' + iconClass).forEach(icon => {
            const link = icon.closest('a');
            if (!link) return;

            const originalColor = getComputedStyle(icon).color;

            // Special case: X → Twitter bird on hover
            if (icon.classList.contains('fa-x-twitter')) {
                link.addEventListener('mouseenter', () => {
                    icon.classList.remove('fa-x-twitter');
                    icon.classList.add('fa-twitter');  // switch to bird
                    icon.style.color = hoverColor;
                });

                link.addEventListener('mouseleave', () => {
                    icon.classList.remove('fa-twitter');
                    icon.classList.add('fa-x-twitter'); // back to X
                    icon.style.color = originalColor;
                });

                // Special case: GitHub → GitHub-alt on hover
            } else if (icon.classList.contains('fa-github')) {
                link.addEventListener('mouseenter', () => {
                    icon.classList.remove('fa-github');
                    icon.classList.add('fa-github-alt');
                    icon.style.color = hoverColor;
                });

                link.addEventListener('mouseleave', () => {
                    icon.classList.remove('fa-github-alt');
                    icon.classList.add('fa-github');
                    icon.style.color = originalColor;
                });

                // Normal case: only color change
            } else {
                link.addEventListener('mouseenter', () => {
                    icon.style.color = hoverColor;
                });

                link.addEventListener('mouseleave', () => {
                    icon.style.color = originalColor;
                });
            }
        });
    });

    // "Built with" icons hover colors
    const builtWithHoverColors = {
        'fa-bootstrap': '#6a2edc',      // Bootstrap purple
        'fa-font-awesome': '#5a8ed4',   // Font Awesome blue
        'fa-square-js': '#f4de3e'       // JS yellow
    };

    Object.entries(builtWithHoverColors).forEach(([iconClass, hoverColor]) => {
        document.querySelectorAll('nav .' + iconClass).forEach(icon => {
            const link = icon.closest('a');
            if (!link) return;

            const originalColor = getComputedStyle(icon).color;

            link.addEventListener('mouseenter', () => {
                icon.style.color = hoverColor;
            });

            link.addEventListener('mouseleave', () => {
                icon.style.color = originalColor;
            });
        });
    });
});
