/* =============================================================
   DETALLES VÁSQUEZ – script.js
   ============================================================= */

/* ============================================================
   🎁 ARRAY DE PRODUCTOS
   ─────────────────────────────────────────────────────────────
   Para agregar un nuevo producto, simplemente añade un objeto
   al array 'productos' con el siguiente formato:

   {
     nombre:      "Nombre del producto",
     descripcion: "Descripción breve del producto.",
     imagen:      "img/tu-imagen.jpg",   ← ruta relativa desde index.html
     categoria:   "Regalo",              ← categoría libre (se muestra como etiqueta)
   }

   Las imágenes deben colocarse en la carpeta /img/
   Ej: img/producto1.jpg, img/caja-sorpresa.jpg, etc.
   ============================================================ */


async function renderProductos() {
  const grid = document.getElementById("productosGrid");
  if (!grid) return;

  grid.innerHTML = "";

  try {
    const res = await fetch("/productos/productos.json");
    const data = await res.json();

    data.items.forEach((producto, index) => {
      const card = document.createElement("div");
      card.classList.add("product-card");

      card.innerHTML = `
        <div class="product-card__img-wrap">
          <img src="${producto.imagen}" alt="${producto.nombre}">
        </div>
        <div class="product-card__body">
          <h3 class="product-card__nombre">${producto.nombre}</h3>
          <p class="product-card__desc">${producto.descripcion}</p>
          <p class="product-card__precio">${producto.precio || ""}</p>
          ${
            producto.estado === "Agotado"
              ? `<p style="color:red;font-size:12px;">AGOTADO</p>`
              : ""
          }
        </div>
      `;

      grid.appendChild(card);
    });

  } catch (err) {
    console.error("Error cargando productos:", err);
  }
}`);

    /* Construir contenido de imagen:
       Si la ruta existe, se usa la <img>.
       De lo contrario, se muestra un placeholder decorativo. */
    const imgContent = `
      <img
        src="${producto.imagen}"
        alt="${producto.nombre}"
        loading="lazy"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
      />
      <div class="product-card__img-placeholder" style="display:none; position:absolute; inset:0;">
        <span>🎁</span>
        <p>${producto.imagen}</p>
      </div>
    `;

    card.innerHTML = `
      <div class="product-card__img-wrap">
        ${imgContent}
        <div class="product-card__overlay">
          <button class="product-card__overlay-btn" tabindex="-1" aria-hidden="true">Ver detalles</button>
        </div>
      </div>
      <div class="product-card__body">
        <h3 class="product-card__nombre">${producto.nombre}</h3>
        <p class="product-card__desc">${producto.descripcion}</p>
        <span class="product-card__tag">${producto.categoria}</span>
      </div>
    `;

    /* Animación escalonada de entrada */
    card.style.transitionDelay = `${index * 0.07}s`;

    /* Abrir modal al hacer clic o Enter */
    card.addEventListener("click", () => openModal(producto));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") openModal(producto);
    });

    grid.appendChild(card);
  });

  /* Activar animación al aparecer en viewport */
  observeCards();
}

/* ============================================================
   INTERSECTION OBSERVER – animación de tarjetas
   ============================================================ */
function observeCards() {
  const cards = document.querySelectorAll(".product-card");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  cards.forEach((card) => observer.observe(card));
}

/* ============================================================
   MODAL DE PRODUCTO
   ============================================================ */
function openModal(producto) {
  const overlay   = document.getElementById("modalOverlay");
  const imgWrap   = document.getElementById("modalImgWrap");
  const title     = document.getElementById("modalTitle");
  const desc      = document.getElementById("modalDesc");
  const cta       = document.getElementById("modalCta");

  /* Imagen o placeholder */
  imgWrap.innerHTML = `
    <img
      src="${producto.imagen}"
      alt="${producto.nombre}"
      style="width:100%;height:100%;object-fit:cover;"
      onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
    />
    <div class="modal__img-placeholder" style="display:none;width:100%;height:100%;">
      <span>🎁</span>
    </div>
  `;

  title.textContent = producto.nombre;
  desc.textContent  = producto.descripcion;

  /* El botón CTA redirige a contacto y cierra el modal */
  cta.onclick = () => {
    closeModal();
    document.getElementById("contacto").scrollIntoView({ behavior: "smooth" });
  };

  overlay.classList.add("is-open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const overlay = document.getElementById("modalOverlay");
  overlay.classList.remove("is-open");
  overlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

/* ============================================================
   NAVEGACIÓN – HAMBURGER MOBILE
   ============================================================ */
function setupMobileNav() {
  const btn     = document.getElementById("hamburgerBtn");
  const nav     = document.getElementById("mobileNav");
  const overlay = document.getElementById("mobileNavOverlay");

  if (!btn) return;

  function openNav() {
    btn.classList.add("is-open");
    nav.classList.add("is-open");
    overlay.classList.add("is-open");
    overlay.style.display = "block";
    nav.style.display = "flex";
    btn.setAttribute("aria-expanded", "true");
    nav.setAttribute("aria-hidden", "false");
  }

  function closeNav() {
    btn.classList.remove("is-open");
    nav.classList.remove("is-open");
    overlay.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    nav.setAttribute("aria-hidden", "true");
    // Esperar a que termine la transición para ocultar
    setTimeout(() => {
      if (!nav.classList.contains("is-open")) overlay.style.display = "none";
    }, 350);
  }

  btn.addEventListener("click", () => {
    btn.classList.contains("is-open") ? closeNav() : openNav();
  });

  overlay.addEventListener("click", closeNav);

  /* Cerrar al hacer clic en un enlace */
  nav.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", closeNav);
  });
}

/* ============================================================
   ACTIVE NAV LINK – basado en scroll
   ============================================================ */
function setupActiveNav() {
  const sections = document.querySelectorAll(".section[id]");
  const links    = document.querySelectorAll(".nav-link");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          links.forEach((link) => {
            link.classList.toggle(
              "active",
              link.getAttribute("data-section") === id
            );
          });
        }
      });
    },
    { threshold: 0.35 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ============================================================
   SMOOTH SCROLL para enlaces internos
   ============================================================ */
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href").slice(1);
      const target   = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

/* ============================================================
   FORMULARIO DE CONTACTO
   ============================================================ */
function setupContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre  = form.querySelector("#nombre");
    const email   = form.querySelector("#email");
    const mensaje = form.querySelector("#mensaje");

    let valid = true;

    /* Validación simple */
    [nombre, email, mensaje].forEach((field) => {
      if (!field.value.trim()) {
        field.classList.add("error");
        valid = false;
      } else {
        field.classList.remove("error");
      }
    });

    if (email.value && !email.value.includes("@")) {
      email.classList.add("error");
      valid = false;
    }

    if (!valid) return;

    /* Simulación de envío exitoso.
       En producción, reemplaza este bloque con tu integración real
       (Formspree, EmailJS, backend propio, etc.) */
    const wrap = document.querySelector(".contacto__form-wrap");
    wrap.innerHTML = `
      <div class="form-success">
        <p>🌸 ¡Mensaje recibido!</p>
        <p style="font-family:var(--font-body);font-size:0.9rem;color:var(--mid);margin-top:12px;">
          Te responderé muy pronto por email o Instagram. ¡Gracias!
        </p>
      </div>
    `;
  });

  /* Quitar clase error al escribir */
  form.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("input", () => field.classList.remove("error"));
  });
}

/* ============================================================
   MODAL – cierre al hacer clic en overlay o botón de cerrar
   ============================================================ */
function setupModal() {
  const overlay = document.getElementById("modalOverlay");
  const closeBtn = document.getElementById("modalClose");

  closeBtn?.addEventListener("click", closeModal);

  overlay?.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  /* Cerrar con tecla Escape */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

/* ============================================================
   AÑO ACTUAL EN EL FOOTER
   ============================================================ */
function setCurrentYear() {
  const el = document.getElementById("currentYear");
  if (el) el.textContent = new Date().getFullYear();
}

/* ============================================================
   INICIALIZACIÓN
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  renderProductos();
  setupMobileNav();
  setupActiveNav();
  setupSmoothScroll();
  setupContactForm();
  setupModal();
  setCurrentYear();
});
