document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-contrato");
  const fieldsets = form.querySelectorAll("fieldset");
  let currentStep = 0;
  const storageKey = "formularioContratoMCV";

  function detectarPasoDesdeDatos(data) {
    const secciones = Array.from(fieldsets);
    for (let i = secciones.length - 1; i >= 0; i--) {
      const inputs = secciones[i].querySelectorAll("input");
      for (let input of inputs) {
        if (data[input.name] && data[input.name].trim() !== "") {
          return i;
        }
      }
    }
    return 0;
  }

  function mostrarBotonBorrarSiAplica(data) {
    const hayDatos = Object.values(data).some(v => v && v.trim() !== "");
    if (hayDatos) {
      document.getElementById("borrar-borrador").style.display = "block";
    }
  }

  const dataGuardada = localStorage.getItem(storageKey);
  let mostrarModal = true;

  if (dataGuardada) {
    const data = JSON.parse(dataGuardada);
    const hayDatos = Object.keys(data).some(k => k !== "razon_social" && k !== "sucursal" && data[k].trim() !== "");
    if (hayDatos) {
      currentStep = detectarPasoDesdeDatos(data);
      form.style.display = "block";
      cargarDatos();
      showStep(currentStep);
      mostrarBotonBorrarSiAplica(data);
      mostrarModal = false;
    } else {
      localStorage.removeItem(storageKey);
    }
  }

  if (mostrarModal) {
    const modal = document.createElement("div");
    modal.id = "modal-inicio";
    modal.innerHTML = `
      <div class="modal-contenido">
        <h2>Inicio</h2>
        <label>Razón social:<br><input type="text" id="razon-social-modal" placeholder="Ej. Grupo Ambiental"></label>
        <p>Selecciona tu sucursal:</p>
        <div>
          <button id="btn-geolocalizar" class="btn">📍 Usar ubicación</button>
          <button id="btn-manual" class="btn">📝 Elegir manualmente</button>
        </div>
        <div id="manual-select" style="margin-top:1em; display:none;">
          <select id="sucursal-lista">
            <option value="">Selecciona una sucursal</option>
            <option value="mty">Monterrey</option>
            <option value="ags">Aguascalientes</option>
            <option value="qro">Querétaro</option>
          </select>
        </div>
        <button id="acceder-modal" class="btn" style="margin-top:1em;">Acceder</button>
      </div>`;
    modal.classList.add("modal");
    document.body.appendChild(modal);
  }

  document.getElementById("btn-manual")?.addEventListener("click", () => {
    document.getElementById("manual-select").style.display = "block";
  });

  document.getElementById("btn-geolocalizar")?.addEventListener("click", () => {
    if (!navigator.geolocation) {
      mostrarError("Tu navegador no permite geolocalización.");
      return;
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const json = await res.json();
        const estado = json.address.state || "";
        let sucursal = "qro";
        if (/aguascalientes/i.test(estado)) sucursal = "ags";
        else if (/nuevo le[oó]n/i.test(estado)) sucursal = "mty";
        document.getElementById("sucursal-lista").value = sucursal;
        document.getElementById("manual-select").style.display = "block";
      } catch (e) {
        mostrarError("No se pudo determinar tu ubicación.");
      }
    });
  });

  document.getElementById("acceder-modal")?.addEventListener("click", () => {
    const razon = document.getElementById("razon-social-modal").value.trim();
    const sucursal = document.getElementById("sucursal-lista").value;
    if (!razon || !sucursal) {
      mostrarError("Completa la razón social y la sucursal.");
      return;
    }
    const data = { razon_social: razon, sucursal: sucursal };
    localStorage.setItem(storageKey, JSON.stringify(data));
    document.getElementById("modal-inicio").remove();
    form.style.display = "block";
    cargarDatos();
    showStep(currentStep);

    const whatsapp = document.getElementById("whatsapp-float");
    let numero = "524424710760";
    if (sucursal === "mty") numero = "528123575710";
    else if (sucursal === "ags") numero = "524492656569";
    else if (sucursal === "qro") numero = "524424710760";
    whatsapp.href = `https://wa.me/${numero}`;
  });

  function showStep(index) {
    fieldsets.forEach((fs, i) => {
      fs.style.display = i === index ? "block" : "none";
    });
  }

  function guardarPaso(index) {
    const data = JSON.parse(localStorage.getItem(storageKey)) || {};
    const inputs = fieldsets[index].querySelectorAll("input");
    inputs.forEach(input => {
      if (input.name) data[input.name] = input.value;
    });
    localStorage.setItem(storageKey, JSON.stringify(data));
  }

  function cargarDatos() {
    const data = JSON.parse(localStorage.getItem(storageKey));
    if (!data) return;
    fieldsets.forEach(fs => {
      const inputs = fs.querySelectorAll("input");
      inputs.forEach(input => {
        if (data[input.name]) input.value = data[input.name];
      });
    });
  }

  function avanzar() {
    const inputs = fieldsets[currentStep].querySelectorAll("input[required]");
    for (let input of inputs) {
      if (!input.value.trim()) {
        mostrarError("Por favor completa todos los campos requeridos.");
        return;
      }
    }
    guardarPaso(currentStep);
    if (currentStep < fieldsets.length - 1) {
      currentStep++;
      showStep(currentStep);
    }
  }

  function retroceder() {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  }

  form.addEventListener("click", (e) => {
    if (e.target.classList.contains("siguiente")) avanzar();
    if (e.target.classList.contains("anterior")) retroceder();
  });

  form.addEventListener("submit", (e) => {
    if (currentStep < fieldsets.length - 1) {
      e.preventDefault();
      avanzar();
      return;
    }

    e.preventDefault();
    guardarPaso(currentStep);

    const datos = JSON.parse(localStorage.getItem(storageKey));
    const btnEnviar = document.getElementById("btn-enviar");
    btnEnviar.disabled = true;
    btnEnviar.textContent = "Enviando...";

    // ✅ AJUSTE: envío como JSON, sin CORS
    fetch("https://script.google.com/macros/s/AKfycbxutyZXZRJVIAXJNOXmF79BWRV_sr7YwG2kvYBCY4Pde7TKnSwnfMcouyPy0dK5QWfdvw/exec", {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(datos)
    })
    .then(() => {
      localStorage.removeItem(storageKey);
      document.getElementById("modal-exito").style.display = "flex";
      document.getElementById("form-contrato").style.display = "none";
    })
    .catch(() => mostrarError("Hubo un problema de conexión con el servidor."))
    .finally(() => {
      btnEnviar.disabled = false;
      btnEnviar.textContent = "Enviar";
    });
  });

  form.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && currentStep < fieldsets.length - 1) {
      e.preventDefault();
      avanzar();
    }
  });

  document.getElementById("borrar-borrador").addEventListener("click", () => {
    confirmarAccion("¿Deseas borrar el borrador actual?", () => {
      localStorage.removeItem(storageKey);
      location.reload();
    });
  });

  document.getElementById("exportar-json").addEventListener("click", () => {
    const data = localStorage.getItem(storageKey);
    if (data) {
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "borrador_formulario.json";
      a.click();
      URL.revokeObjectURL(url);
    } else {
      mostrarError("No hay datos para exportar.");
    }
  });
});

function mostrarError(texto) {
  const modal = document.getElementById("modal-error");
  document.getElementById("mensaje-error").textContent = texto || "Ocurrió un error inesperado.";
  modal.style.display = "flex";
}

function confirmarAccion(mensaje, callback) {
  const modal = document.getElementById("modal-confirmar");
  document.getElementById("mensaje-confirmar").textContent = mensaje;
  modal.style.display = "flex";

  const btn = document.getElementById("btn-confirmar-si");
  const clone = btn.cloneNode(true);
  btn.parentNode.replaceChild(clone, btn);
  clone.addEventListener("click", () => {
    modal.style.display = "none";
    callback();
  });
}
