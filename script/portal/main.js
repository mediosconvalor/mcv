document.addEventListener('DOMContentLoaded', () => {
  const btnOpen  = document.querySelector('.hamburger');
  const btnClose = document.querySelector('.sidebar__close');
  const sidebar  = document.querySelector('.sidebar');
  const body     = document.body;

  btnOpen.addEventListener('click', () => {
    sidebar.classList.add('open');
    body.classList.add('sidebar-open');
  });

  btnClose.addEventListener('click', () => {
    sidebar.classList.remove('open');
    body.classList.remove('sidebar-open');
  });
});
