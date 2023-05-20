// Function to change the theme
function changeTheme() {
  var button = document.getElementById('theme-toggler');
  document.body.classList.toggle('dark');
  button.classList.toggle('dark');
  button.classList.toggle('flipped');

  if (document.body.classList.contains('dark')) {
    localStorage.setItem('darkMode', 'true');
    localStorage.setItem('flipped', 'true');
    document.getElementById('theme-icon').classList.remove('fas', 'fa-sun');
    document.getElementById('theme-icon').classList.add('fas', 'fa-moon');
  } else {
    localStorage.setItem('darkMode', 'false');
    localStorage.setItem('flipped', 'false');
    document.getElementById('theme-icon').classList.remove('fas', 'fa-moon');
    document.getElementById('theme-icon').classList.add('fas', 'fa-sun');
  }
}

// Event listener for the button
document.getElementById('theme-toggler').addEventListener('click', changeTheme);

(function () {
  var button = document.getElementById('theme-toggler');
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
    button.classList.add('dark');
    button.classList.add('flipped');
    document.getElementById('theme-icon').classList.remove('fas', 'fa-sun');
    document.getElementById('theme-icon').classList.add('fas', 'fa-moon');
  } else {
    document.body.classList.remove('dark');
    button.classList.remove('dark');
    button.classList.remove('flipped');
    document.getElementById('theme-icon').classList.remove('fas', 'fa-moon');
    document.getElementById('theme-icon').classList.add('fas', 'fa-sun');
  }
})();
