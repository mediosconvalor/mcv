document.addEventListener('DOMContentLoaded', () => {
  const btnOpen  = document.querySelector('.hamburger');
  const btnClose = document.querySelector('.sidebar__close');
  const sidebar  = document.querySelector('.sidebar');

  btnOpen.addEventListener('click',  () => sidebar.classList.add('open'));
  btnClose.addEventListener('click', () => sidebar.classList.remove('open'));
});
