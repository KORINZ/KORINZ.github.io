// Function to change the theme
function changeTheme() {
  const isDark = !document.body.classList.contains('dark');
  document.body.classList.toggle('dark', isDark);
  localStorage.setItem('darkMode', isDark);
  document.documentElement.style.setProperty('color-scheme', isDark ? 'dark' : 'light');
  document.documentElement.style.setProperty('--bg-color', isDark ? '#333' : '#fff');
  document.documentElement.style.setProperty('--text-color', isDark ? '#fff' : '#333');

  const button = document.getElementById('theme-toggler');
  button.classList.toggle('dark', isDark);

  const icon = document.getElementById('theme-icon');
  icon.classList.toggle('fa-sun', !isDark);
  icon.classList.toggle('fa-moon', isDark);

  // Toggle the flipped class only when the button is clicked
  button.classList.toggle('flipped');
}

// Event listener for the button
document.getElementById('theme-toggler').addEventListener('click', changeTheme);

// Initialize theme on page load
(function () {
  const isDark = localStorage.getItem('darkMode') === 'true';
  document.body.classList.toggle('dark', isDark);

  const button = document.getElementById('theme-toggler');
  button.classList.toggle('dark', isDark);

  const icon = document.getElementById('theme-icon');
  icon.classList.toggle('fa-sun', !isDark);
  icon.classList.toggle('fa-moon', isDark);

  // Remove the flipped class on page load
  button.classList.remove('flipped');
})();