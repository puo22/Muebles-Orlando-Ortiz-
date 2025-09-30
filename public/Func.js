document.addEventListener('DOMContentLoaded', () => {

    
    // ===========================================
    // LÓGICA DE ESTADO DE AUTENTICACIÓN
    // ===========================================
    let isLoggedIn = false; // Estado inicial: NO logueado

    const loginAlert = document.getElementById('login-alert');
    
    function showLoginAlert() {
        loginAlert.classList.remove('hidden-alert');
        setTimeout(() => {
            loginAlert.classList.add('hidden-alert');
        }, 4000);
    }
    
    const citaForm = document.getElementById('cita-form');
    const catalogoForm = document.getElementById('catalogo-form');
    const refaccionForm = document.getElementById('refaccion-form');
    const registroForm = document.getElementById('registro-form');
    const loginForm = document.getElementById('login-form');

    // Función de validación de LOGIN
    function validateLogin(event) {
        if (!isLoggedIn) {
            event.preventDefault(); 
            showLoginAlert(); 
            return false;
        }
        return true;
    }

    // --- FORMULARIOS ---

    // 1. CITA DIRECTA (DISEÑO DESDE CERO) - PERMITE INVITADOS
    if (citaForm) {
        citaForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Detiene el envío de formulario HTML por defecto
            
            // ✅ ACEPTA INVITADOS: Se eliminó la validación de login.
            
            alert('¡Solicitud de Cita Enviada! Gracias. El dueño se contactará directamente contigo...');
            // *** PUNTO DE CONEXIÓN AL BACKEND (Cloud Function) ***
            // Aquí se debe implementar la llamada fetch a: POST /api/solicitar-cita
            
            citaForm.reset();
        });
    }
    
    // 2. SOLICITUD DE REFACCIÓN - PERMITE INVITADOS
    if (refaccionForm) {
        refaccionForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Detiene el envío de formulario HTML por defecto

            // ✅ ACEPTA INVITADOS: Se eliminó la validación de login.
            
            alert('¡Solicitud de Refacción Enviada! Gracias. Nos contactaremos vía correo o WhatsApp para solicitar fotos del mueble y enviarte la cotización detallada. (Lógica de Backend)');
            // *** PUNTO DE CONEXIÓN AL BACKEND (Cloud Function) ***
            // Aquí se debe implementar la llamada fetch a: POST /api/solicitar-refaccion

            refaccionForm.reset();
        });
    }

    // 3. PEDIDO POR CATÁLOGO - REQUIERE LOGIN
    if (catalogoForm) {
        catalogoForm.addEventListener('submit', function(event) {
            // ❌ REQUIERE LOGIN: Si no hay sesión, se muestra el alert y se detiene el envío.
            if (!validateLogin(event)) return; 
            
            event.preventDefault(); // Detiene el envío de formulario HTML por defecto

            alert('¡Solicitud de Personalización Enviada! Gracias. En las próximas horas recibirás un **Correo de Certificación**...');
            // *** PUNTO DE CONEXIÓN AL BACKEND (Cloud Function) ***
            // Aquí se debe implementar la llamada fetch a: POST /api/crear-pedido
            // El backend deberá gestionar el flujo de pago con PSE u otros métodos.

            catalogoForm.reset();
        });
    }

    // Lógica de Login/Registro (Solo simulación de estado para el frontend)
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault(); 

            const email = document.querySelector('#login-form input[name="email"], #login-email')?.value;
            const password = document.querySelector('#login-form input[name="password"], #login-pass')?.value;

            try {
                const res = await fetch("http://localhost:4000/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();
                alert(data.message || data.error);

                if (res.ok) {
                    isLoggedIn = true; 
                    const loginButton = document.getElementById('login-button');
                    if (loginButton) {
                        loginButton.textContent = 'Bienvenido(a)';
                        loginButton.style.backgroundColor = '#556B2F'; 
                        loginButton.style.pointerEvents = 'none'; 
                    }
                }
            } catch (error) {
                console.error(error);
                alert("Error en la conexión con el servidor");
            }
        });
    }

    
    if (registroForm) {
        registroForm.addEventListener('submit', async function(event) {
            event.preventDefault(); 

            const email = document.querySelector('#registro-form input[name="email"], #registro-email')?.value;
            const password = document.querySelector('#registro-form input[name="password"], #registro-pass')?.value;

            try {
                const res = await fetch("http://localhost:4000/api/registro", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();
                alert(data.message || data.error);

                if (res.ok) registroForm.reset();
            } catch (error) {
                console.error(error);
                alert("Error en la conexión con el servidor");
            }
        });
    }

    
    // ===========================================
    // LÓGICA DE FILTRADO Y DETALLE (Se mantiene igual)
    // ===========================================

    const filterMenu = document.getElementById('category-filter-menu');
    const productGrid = document.getElementById('product-grid');
    const initialTrendProductsHTML = productGrid.innerHTML; 

    const MODAL_ELEMENTS = {
        modal: document.getElementById('product-modal'),
        closeBtn: document.querySelector('.close-btn'),
        modalTitle: document.getElementById('modal-titulo'),
        modalImage: document.getElementById('modal-imagen'),
        modalTela: document.getElementById('modal-tela'),
        modalMadera: document.getElementById('modal-madera'),
        modalPrecio: document.getElementById('modal-precio'),
        modalMedidas: document.getElementById('modal-medidas') 
    };

    function setupModalListeners() {
        const productCards = document.querySelectorAll('#product-grid .card');
        productCards.forEach(card => {
            card.addEventListener('click', function() {
                const title = card.querySelector('h3').textContent;
                const price = card.querySelector('.precio').textContent;
                const imageSrc = card.querySelector('img').src;
                
                const tela = card.getAttribute('data-tela');
                const madera = card.getAttribute('data-madera');
                const medidas = card.getAttribute('data-medidas'); 

                MODAL_ELEMENTS.modalTitle.textContent = title;
                MODAL_ELEMENTS.modalImage.src = imageSrc;
                MODAL_ELEMENTS.modalTela.textContent = tela;
                MODAL_ELEMENTS.modalMadera.textContent = madera;
                MODAL_ELEMENTS.modalPrecio.textContent = price;
                MODAL_ELEMENTS.modalMedidas.textContent = medidas; 
                
                MODAL_ELEMENTS.modal.classList.add('show');
            });
        });
    }

    MODAL_ELEMENTS.closeBtn.addEventListener('click', function() {
        MODAL_ELEMENTS.modal.classList.remove('show');
    });

    window.addEventListener('click', function(event) {
        if (event.target == MODAL_ELEMENTS.modal) {
            MODAL_ELEMENTS.modal.classList.remove('show');
        }
    });

    function generateDetailedProducts(category) {
        let html = '';
        const numProducts = Math.floor(Math.random() * (20 - 15 + 1)) + 15;
        const categoryMap = {
            'sofases': { name: 'Sofá', tela: 'Lino Italiano', madera: 'Cedro', precio: '$850.000', medidas: 'Largo: 210cm | Ancho: 95cm | Profundidad: 80cm', imageSeed: 'modernsofa' },
            'poltronas': { name: 'Poltrona', tela: 'Terciopelo', madera: 'Amarilla', precio: '$400.000', medidas: 'Largo: 75cm | Ancho: 80cm | Profundidad: 90cm', imageSeed: 'armchair' },
            'cabeceros': { name: 'Cabecero', tela: 'Microfibra', madera: 'Pino', precio: '$300.000', medidas: 'Largo: 180cm | Ancho: 8cm | Profundidad: 130cm', imageSeed: 'headboard' },
            'puffs': { name: 'Puff', tela: 'Pana', madera: 'MDF', precio: '$150.000', medidas: 'Largo: 55cm | Ancho: 55cm | Profundidad: 45cm', imageSeed: 'ottoman' },
            'bases': { name: 'Base Cama', tela: 'Chenille', madera: 'Roble', precio: '$600.000', medidas: 'Largo: 200cm | Ancho: 140cm | Profundidad: 30cm', imageSeed: 'bedbase' },
        };
        const productBase = categoryMap[category];
        
        for (let i = 1; i <= numProducts; i++) {
            const imageSrc = `https://picsum.photos/seed/${productBase.imageSeed}${i}/400/300`;
            const randomPrice = Math.floor(Math.random() * 500) + 200;
            
            html += `
                <div class="card" 
                    data-category="${category}"
                    data-tela="${productBase.tela} Premium ${i}" 
                    data-madera="${productBase.madera} (Tipo ${i % 3 + 1})" 
                    data-precio="$${(randomPrice * 1000).toLocaleString('es-CO')} (Precio base)" 
                    data-medidas="${productBase.medidas}"
                >
                    <img src="${imageSrc}" alt="${productBase.name} ${i}">
                    <h3>${productBase.name} ${i} - Estilo ${i % 5 + 1}</h3>
                    <p class="detalle-tecnico">Madera: ${productBase.madera} | Tela: ${productBase.tela}</p>
                    <p class="precio">$${(randomPrice * 1000).toLocaleString('es-CO')} (Precio base)</p>
                </div>
            `;
        }
        return html;
    }

    if (filterMenu) {
        filterMenu.addEventListener('click', function(event) {
            const button = event.target.closest('button');
            if (!button || !button.dataset.filter) return; 

            const selectedCategory = button.dataset.filter;

            if (selectedCategory === 'all') {
                productGrid.innerHTML = initialTrendProductsHTML;
            } else {
                productGrid.innerHTML = generateDetailedProducts(selectedCategory);
            }

            setupModalListeners();

            filterMenu.querySelectorAll('.btn').forEach(btn => {
                btn.classList.remove('active-filter');
            });
            button.classList.add('active-filter');
        });
    }

    setupModalListeners();

    
    // ===========================================
    // LÓGICA DE SCROLL (Se mantiene igual)
    // ===========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); 
            const targetId = this.getAttribute('href');
            if (document.querySelector(targetId)) {
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

});
