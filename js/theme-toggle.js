var button = document.querySelector("#theme-toggler");

// Check if the 'flipped' state is stored in localStorage
if (localStorage.getItem('flipped') === 'true') {
    button.classList.add('flipped');
}

button.addEventListener("click", function () {
    this.classList.toggle('flipped');
    // Save the 'flipped' state in localStorage
    if (this.classList.contains('flipped')) {
        localStorage.setItem('flipped', 'true');
    } else {
        localStorage.setItem('flipped', 'false');
    }
});

// Check if the 'dark' state is stored in localStorage and set the class before the page loads
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
    document.getElementById('theme-icon').classList.remove('fas', 'fa-sun');
    document.getElementById('theme-icon').classList.add('fas', 'fa-moon');
} else {
    document.getElementById('theme-icon').classList.remove('fas', 'fa-moon');
    document.getElementById('theme-icon').classList.add('fas', 'fa-sun');
}