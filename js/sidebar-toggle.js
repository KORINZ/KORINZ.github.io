document.addEventListener('DOMContentLoaded', function () {
    var sidebarToggler = document.getElementById('sidebar-toggler');
    var sidebarIcon = document.getElementById('sidebar-icon');
    var nav = document.getElementById('nav');

    $(nav).on('shown.bs.collapse', function () {
        sidebarIcon.classList.remove('fa-bars');
        sidebarIcon.classList.add('fa-times');
    });

    $(nav).on('hidden.bs.collapse', function () {
        sidebarIcon.classList.remove('fa-times');
        sidebarIcon.classList.add('fa-bars');
    });
});