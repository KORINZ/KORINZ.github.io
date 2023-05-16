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