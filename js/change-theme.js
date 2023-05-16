// Function to change the theme
function changeTheme() {
    var button = document.getElementById('theme-toggler');
    document.body.classList.toggle('dark');
    button.classList.toggle('dark');
    if (document.body.classList.contains('dark')) {
        localStorage.setItem('darkMode', 'true');
        document.getElementById('theme-icon').classList.remove('fas', 'fa-sun');
        document.getElementById('theme-icon').classList.add('fas', 'fa-moon');
    } else {
        localStorage.setItem('darkMode', 'false');
        document.getElementById('theme-icon').classList.remove('fas', 'fa-moon');
        document.getElementById('theme-icon').classList.add('fas', 'fa-sun');
    }
}

// Event listener for the button
document.getElementById('theme-toggler').addEventListener('click', changeTheme);

