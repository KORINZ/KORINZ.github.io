document.addEventListener('DOMContentLoaded', function () {
    const sidebarToggler = document.getElementById('sidebar-toggler');
    const sidebarIcon = document.getElementById('sidebar-icon');
    const nav = document.getElementById('nav');

    $(nav).on('shown.bs.collapse', function () {
        sidebarIcon.classList.remove('fa-bars');
        sidebarIcon.classList.add('fa-times');
    });

    $(nav).on('hidden.bs.collapse', function () {
        sidebarIcon.classList.remove('fa-times');
        sidebarIcon.classList.add('fa-bars');
    });
});