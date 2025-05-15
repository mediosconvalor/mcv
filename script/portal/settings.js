document.addEventListener('DOMContentLoaded', () => {
  // Mostrar toast si existe
  const toast = document.querySelector('.toast');
  if (toast) {
    toast.style.display = 'block';
    setTimeout(() => toast.remove(), 4000);
  }

  // Cambio de usuario a visualizar (privilegiados)
  const selectUser = document.getElementById('view_user');
  if (selectUser) {
    selectUser.addEventListener('change', () => {
      window.location.search = '?view_user=' + selectUser.value;
    });
  }

  // Subida de documentos a GAS_DOCS_URL
  const uploadBtn = document.getElementById('uploadDocs');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      const form = document.getElementById('docsForm');
      const data = new FormData(form);
      data.append('user', '<?= $_SESSION['user_id'] ?>');
      fetch('<?= GAS_DOCS_URL ?>', {
        method: 'POST',
        body: data
      })
      .then(res => res.json())
      .then(json => {
        const div = document.createElement('div');
        div.className = 'toast ' + (json.success ? 'success' : 'error');
        div.textContent = json.message || (json.success ? 'Subida OK' : 'Error al subir');
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 4000);
      });
    });
  }
});
