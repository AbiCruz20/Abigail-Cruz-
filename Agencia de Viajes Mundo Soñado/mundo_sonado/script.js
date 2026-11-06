const WHATSAPP = "528184724203";

const botonMenu = document.getElementById("boton-menu");
const menu = document.getElementById("menu-principal");
if (botonMenu && menu) {
  botonMenu.addEventListener("click", () => {
    const abierto = menu.classList.toggle("abierto");
    botonMenu.setAttribute("aria-expanded", abierto);
  });
}

document.querySelectorAll(".carrusel").forEach((carrusel) => {
  const pista = carrusel.querySelector(".pista");
  const diapositivas = Array.from(pista.children);
  const anterior = carrusel.querySelector(".anterior");
  const siguiente = carrusel.querySelector(".siguiente");
  const puntos = carrusel.querySelector(".puntos");

  const paso = () => {
    const separacion = parseFloat(getComputedStyle(pista).columnGap) || 0;
    return diapositivas[0].getBoundingClientRect().width + separacion;
  };

  anterior.addEventListener("click", () => pista.scrollBy({ left: -paso(), behavior: "smooth" }));
  siguiente.addEventListener("click", () => pista.scrollBy({ left: paso(), behavior: "smooth" }));

  diapositivas.forEach((_, i) => {
    const punto = document.createElement("button");
    punto.className = "punto";
    punto.type = "button";
    punto.setAttribute("aria-label", "Ir a la diapositiva " + (i + 1));
    punto.addEventListener("click", () =>
      pista.scrollTo({ left: diapositivas[i].offsetLeft - diapositivas[0].offsetLeft, behavior: "smooth" })
    );
    puntos.appendChild(punto);
  });

  const marcarPunto = () => {
    const indice = Math.min(diapositivas.length - 1, Math.round(pista.scrollLeft / paso()));
    puntos.querySelectorAll(".punto").forEach((p, i) => p.classList.toggle("activo", i === indice));
  };
  pista.addEventListener("scroll", marcarPunto, { passive: true });
  window.addEventListener("resize", marcarPunto);
  marcarPunto();
});

const botonesFiltro = document.querySelectorAll(".filtros button");
const tarjetasDestino = document.querySelectorAll("[data-categoria]");
botonesFiltro.forEach((boton) => {
  boton.addEventListener("click", () => {
    botonesFiltro.forEach((b) => {
      b.classList.remove("activo");
      b.setAttribute("aria-pressed", "false");
    });
    boton.classList.add("activo");
    boton.setAttribute("aria-pressed", "true");
    const filtro = boton.dataset.filtro;
    tarjetasDestino.forEach((t) => {
      t.hidden = !(filtro === "todos" || t.dataset.categoria === filtro);
    });
  });
});

const contadores = document.querySelectorAll("[data-meta]");
if (contadores.length && "IntersectionObserver" in window) {
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      const el = entrada.target;
      const meta = Number(el.dataset.meta);
      const sufijo = el.dataset.sufijo || "";
      let actual = 0;
      const paso = Math.max(1, Math.ceil(meta / 50));
      const reloj = setInterval(() => {
        actual = Math.min(meta, actual + paso);
        el.textContent = actual + sufijo;
        if (actual >= meta) clearInterval(reloj);
      }, 25);
      observador.unobserve(el);
    });
  });
  contadores.forEach((c) => observador.observe(c));
}

const formulario = document.getElementById("formulario-contacto");
if (formulario) {

  const parametros = new URLSearchParams(window.location.search);
  ["destino", "paquete"].forEach((nombre) => {
    const valor = parametros.get(nombre);
    const select = document.getElementById(nombre);
    if (valor && select) {
      const opcion = Array.from(select.options).find((o) => o.value === valor);
      if (opcion) select.value = valor;
    }
  });

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    let valido = true;

    formulario.querySelectorAll(".campo[data-requerido]").forEach((campo) => {
      const control = campo.querySelector("input, select, textarea");
      let ok = control.value.trim() !== "";
      if (ok && control.type === "tel") ok = /^[0-9\s()+-]{10,}$/.test(control.value.trim());
      campo.classList.toggle("invalido", !ok);
      if (!ok) valido = false;
    });

    const exito = document.getElementById("mensaje-exito");
    if (!valido) {
      exito.style.display = "none";
      return;
    }

    const nombre = document.getElementById("nombre").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const destino = document.getElementById("destino").value;
    const paquete = document.getElementById("paquete").value;
    const personas = document.getElementById("personas").value;
    const mensaje = document.getElementById("mensaje").value.trim();

    let texto = "Hola, soy " + nombre + ". Me interesa viajar a: " + destino;
    if (paquete) texto += ", paquete: " + paquete;
    texto += " (" + personas + " persona(s)). " + mensaje + " Mi teléfono: " + telefono + ".";

    exito.style.display = "block";
    window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(texto), "_blank", "noopener");
    formulario.reset();
  });
}

document.querySelectorAll(".rejilla").forEach((rejilla) => {
  if (rejilla.closest(".estadisticas")) return;
  const puntos = document.createElement("div");
  puntos.className = "puntos";
  rejilla.insertAdjacentElement("afterend", puntos);

  const visibles = () => Array.from(rejilla.children).filter((t) => !t.hidden);

  const dibujar = () => {
    puntos.innerHTML = "";
    visibles().forEach((t, i) => {
      const punto = document.createElement("button");
      punto.className = "punto";
      punto.type = "button";
      punto.setAttribute("aria-label", "Ir a la tarjeta " + (i + 1));
      punto.addEventListener("click", () => {
        const centro = t.offsetLeft - (rejilla.clientWidth - t.offsetWidth) / 2;
        rejilla.scrollTo({ left: centro, behavior: "smooth" });
      });
      puntos.appendChild(punto);
    });
    marcar();
  };

  const marcar = () => {
    const tarjetas = visibles();
    if (!tarjetas.length) return;
    const centro = rejilla.scrollLeft + rejilla.clientWidth / 2;
    let activo = 0, minimo = Infinity;
    tarjetas.forEach((t, i) => {
      const d = Math.abs(t.offsetLeft + t.offsetWidth / 2 - centro);
      if (d < minimo) { minimo = d; activo = i; }
    });
    puntos.querySelectorAll(".punto").forEach((p, i) => p.classList.toggle("activo", i === activo));
  };

  rejilla.addEventListener("scroll", marcar, { passive: true });
  window.addEventListener("resize", marcar);
  document.querySelectorAll(".filtros button").forEach((b) =>
    b.addEventListener("click", () => { rejilla.scrollLeft = 0; setTimeout(dibujar, 0); })
  );
  dibujar();
});
