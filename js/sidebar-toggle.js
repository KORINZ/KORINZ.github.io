document.addEventListener('DOMContentLoaded', function () {
    const sidebarIcon = document.getElementById('sidebar-icon');
    const nav = document.getElementById('nav');

    nav.addEventListener('shown.bs.collapse', function () {
        sidebarIcon.classList.remove('fa-bars');
        sidebarIcon.classList.add('fa-times');
    });

    nav.addEventListener('hidden.bs.collapse', function () {
        sidebarIcon.classList.remove('fa-times');
        sidebarIcon.classList.add('fa-bars');
    });
});