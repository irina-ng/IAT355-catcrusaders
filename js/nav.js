let menu = document.querySelector('#menu');
let toggle = document.querySelector('#menu-toggle');

// Start hidden on small screens
menu.classList.add('hidden');

// Set accessibility attributes on the menu
menu.setAttribute('aria-hidden', 'true');
menu.setAttribute('aria-labelledby', 'menu-toggle');

// Add click event to toggle button
toggle.addEventListener('click', function() {
  console.log('Menu toggle clicked.');

  let isHidden = menu.classList.toggle('hidden');

  if (isHidden) {
    // Menu is now hidden
    menu.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<i class="fas fa-bars"></i>'; // closed
  } else {
    // Menu is now shown
    menu.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.innerHTML = '✖'; // opened
  }
});
