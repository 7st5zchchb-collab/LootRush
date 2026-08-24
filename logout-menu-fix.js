// LootRush avatar/profile dropdown fix
(function () {
  function setupProfileMenu() {
    const avatar = document.querySelector('.player-avatar');
    const menu = document.querySelector('.player-menu');
    const dropdown = document.getElementById('profileDropdown');
    if (!avatar || !menu || !dropdown) return;

    avatar.onclick = function (event) {
      event.preventDefault();
      event.stopPropagation();
      dropdown.classList.toggle('show');
    };

    document.addEventListener('click', function (event) {
      if (!menu.contains(event.target)) dropdown.classList.remove('show');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupProfileMenu);
  } else {
    setupProfileMenu();
  }
})();
