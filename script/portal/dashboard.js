document.addEventListener('DOMContentLoaded', () => {
  // Resaltar enlace activo
  document.querySelectorAll('.navigation a').forEach(link => {
    if (link.getAttribute('href') === window.location.pathname.split('/').pop()) {
      link.classList.add('active');
    }
  });

  // Toggle de tema
  const toggle = document.getElementById('themeToggle');
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const mode = document.body.classList.contains('dark') ? 'oscuro' : 'claro';
    document.cookie = "modo=" + mode + "; path=/; max-age=" + (60*60*24*30);
  });
});
