// loader.js
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const loaderEl = document.getElementById('loader');
    loaderEl.classList.add('hidden');
    // Una vez ocultado, simplemente queda la página cargada.
  }, LOADER_DELAY);
});
