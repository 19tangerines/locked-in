// theme switcher

const theme = document.querySelector('[data-theme]');

const radioButtons = document.querySelectorAll('input[name="theme"]');

const themeSwitcher = document.getElementById('theme-switcher');

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme !== null) {
        theme.setAttribute('data-theme', savedTheme);
    } else {
        theme.setAttribute('data-theme', 'light');
    }
});


if (themeSwitcher) {
    themeSwitcher.querySelectorAll('input').forEach(radio => {
        radio.addEventListener('change', (event) => {
            if (event.target.checked) {
                console.log(`Theme: ${event.target.value}`);
                theme.setAttribute('data-theme', event.target.value);
                localStorage.setItem('theme', event.target.value);
            }
        })
    });
}

// extra stuff

function toggleMenu() {
  var bd = document.getElementById('menu-backdrop');
  var dd = document.getElementById('menu-dropdown');
  var show = bd.style.display === 'none';
  bd.style.display = show ? '' : 'none';
  dd.style.display = show ? '' : 'none';
}
function closeMenu() {
  document.getElementById('menu-backdrop').style.display = 'none';
  document.getElementById('menu-dropdown').style.display = 'none';
}
function openModal(id) {
  closeModals();
  document.getElementById(id).style.display = '';
}
function closeModals() {
  document.querySelectorAll('.dialog-backdrop').forEach(function(el) {
    el.style.display = 'none';
  });
}