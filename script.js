// ARRAY BASE DE BASE DE DATOS
const baseVehiculos = [
    { id: 101, nombre: "Dodge Charger SRT Hellcat", precio: 85000 },
    { id: 102, nombre: "Dodge Challenger SRT Hellcat.", precio: 96000 }
];

let carrito = [];

// ESTADOS INDEPENDIENTES PARA CADA AUTO
let estadosProductos = {
    101: { precioBase: 85000, costoExtraPaquete: 0, cantidad: 1, color: "Gris" },
    102: { precioBase: 96000, costoExtraPaquete: 0, cantidad: 1, color: "Gris" }
};

// Cambiar imágenes de color por producto
function cambiarColor(idProducto, colorId, rutaArchivo) {
    estadosProductos[idProducto].color = colorId;
    document.getElementById("foto-auto-" + idProducto).src = rutaArchivo;
}

// Controlar los paquetes de cada auto independientemente
function seleccionarPaquete(idProducto, tipoPaquete) {
    const btnStd = document.getElementById("btn-pkg-std-" + idProducto);
    const btnJb = document.getElementById("btn-pkg-jb-" + idProducto);
    const prod = estadosProductos[idProducto];

    if (tipoPaquete === 1) {
        prod.costoExtraPaquete = 0;
        btnStd.classList.add("seleccionado");
        btnJb.classList.remove("seleccionado");
    } else {
        prod.costoExtraPaquete = 5000;
        btnJb.classList.add("seleccionado");
        btnStd.classList.remove("seleccionado");
    }
    
    let calculoPantalla = (prod.precioBase + prod.costoExtraPaquete) * prod.cantidad;
    document.getElementById("precio-dinamico-" + idProducto).innerText = calculoPantalla;
}

// Modificar cantidad con los botones + y - para cada coche
function modificarCantidad(idProducto, valor) {
    const prod = estadosProductos[idProducto];
    if (prod.cantidad + valor >= 1) {
        prod.cantidad = prod.cantidad + valor;
        document.getElementById("visor-cantidad-" + idProducto).innerText = prod.cantidad;
        
        let calculoPantalla = (prod.precioBase + prod.costoExtraPaquete) * prod.cantidad;
        document.getElementById("precio-dinamico-" + idProducto).innerText = calculoPantalla;
    }
}

// ACCIONES PARA EL CARRITO INDEPENDIENTES
function procesarBotonCarrito(idProducto) {
    const boton = document.getElementById("btn-agregar-car-" + idProducto);
    const modeloEncontrado = baseVehiculos.find(function(item) { return item.id === idProducto; });
    const prodEstado = estadosProductos[idProducto];
    
    const nombreCompleto = modeloEncontrado.nombre + " (" + prodEstado.color + ")";
    const precioFinalUnidad = modeloEncontrado.precio + prodEstado.costoExtraPaquete;

    let itemExistente = carrito.find(function(item) { 
        return item.id === idProducto && item.nombre === nombreCompleto; 
    });

    if (itemExistente) {
        itemExistente.cantidad += prodEstado.cantidad;
    } else {
        carrito.push({
            id: idProducto,
            nombre: nombreCompleto,
            precio: precioFinalUnidad,
            cantidad: prodEstado.cantidad
        });
    }

    boton.innerText = "✓ DENTRO DEL CARRITO";
    boton.classList.add("modo-activa");

    actualizarDatosDeInterfaz();
}

function calcularTotal() {
    return carrito.reduce(function(acumulador, objeto) {
        return acumulador + (objeto.precio * objeto.cantidad);
    }, 0);
}

function actualizarDatosDeInterfaz() {
    // 1. Contador del menú superior
    let conteoElementos = carrito.reduce(function(acc, item) { return acc + item.cantidad; }, 0);
    document.getElementById("contador-carrito").innerText = conteoElementos;

    // Render de lista en modal blanco
    const visualLista = document.getElementById("elementos-carrito");
    visualLista.innerHTML = "";

    carrito.forEach(function(item) {
        visualLista.innerHTML += `
            <div class="renglon-car">
                <span>${item.cantidad}x ${item.nombre}</span>
                <span>$${item.precio * item.cantidad} <button style="color:red; border:none; background:none; cursor:pointer; font-size:18px;" onclick="eliminarDelCarrito(${item.id}, '${item.nombre}')">❌</button></span>
            </div>
        `;
    });

    // 3. Totales económicos
    let dineroTotal = calcularTotal();
    document.getElementById("total-carrito").innerText = dineroTotal;
    document.getElementById("monto-final-wizard").innerText = dineroTotal;
}

// Eliminar solo un elemento específico del carrito
function eliminarDelCarrito(id, nombreEspecifico) {
    carrito = carrito.filter(function(item) {
        return !(item.id === id && item.nombre === nombreEspecifico);
    });
    
    const boton = document.getElementById("btn-agregar-car-" + id);
    if(boton && !carrito.some(e => e.id === id)) {
        boton.innerText = "AGREGAR AL CARRITO";
        boton.classList.remove("modo-activa");
    }
    
    actualizarDatosDeInterfaz();
}

// Modales abrir/cerrar
function abrirCarrito() { document.getElementById("modal-carrito").style.display = "flex"; }
function cerrarCarrito() { document.getElementById("modal-carrito").style.display = "none"; }
function cerrarWizard() { document.getElementById("modal-wizard").style.display = "none"; }

function pasarAlWizard() {
    if (carrito.length === 0) { alert("Tu carrito está vacío."); return; }
    cerrarCarrito();
    document.getElementById("modal-wizard").style.display = "flex";
    cambiarFase(1);
}

// CONTROL DEL FORMULARIO EN PASOS (WIZARD)
function cambiarFase(numFase) {
    document.getElementById("fase-1").style.display = "none";
    document.getElementById("fase-2").style.display = "none";
    document.getElementById("fase-3").style.display = "none";
    document.getElementById("fase-4").style.display = "none";
    document.getElementById("fase-exito").style.display = "none";

    document.getElementById("b1").classList.remove("activa");
    document.getElementById("b2").classList.remove("activa");
    document.getElementById("b3").classList.remove("activa");
    document.getElementById("b4").classList.remove("activa");

    document.getElementById("fase-" + numFase).style.display = "block";

    if (numFase >= 1) document.getElementById("b1").classList.add("activa");
    if (numFase >= 2) document.getElementById("b2").classList.add("activa");
    if (numFase >= 3) document.getElementById("b3").classList.add("activa");
    if (numFase >= 4) document.getElementById("b4").classList.add("activa");

    let nombresFases = ["", "Cantidad", "Datos", "Método", "Confirmación"];
    document.getElementById("nombre-etapa").innerText = nombresFases[numFase];

    if (numFase === 1) {
        let cajaResumen = document.getElementById("resumen-autos");
        cajaResumen.innerHTML = "";
        carrito.forEach(function(c) {
            cajaResumen.innerHTML += `<p>• ${c.cantidad} unidad(es) de ${c.nombre}</p>`;
        });
    }
}

// VALIDACIONES
function validarPaso2() {
    let nom = document.getElementById("txt-nombre").value;
    let cor = document.getElementById("txt-correo").value;
    let dir = document.getElementById("txt-direccion").value;

    if (nom.length < 3) { alert("El nombre debe poseer al menos 3 caracteres."); return; }
    if (!cor.includes("@") || !cor.includes(".")) { alert("Formato de correo inválido (Debe llevar @ y punto)."); return; }
    if (dir.trim() === "") { alert("La dirección física no puede estar en blanco."); return; }

    cambiarFase(3);
}

function validarPaso3() {
    let usaTarjeta = document.getElementById("tarjeta").checked;
    
    if (usaTarjeta) {
        let num = document.getElementById("txt-tarjeta").value;
        let ven = document.getElementById("txt-vence").value;
        let cvv = document.getElementById("txt-cvv").value;

        if (num === "" || ven === "" || cvv === "") { alert("Campos de tarjeta incompletos."); return; }
    }

    document.getElementById("lbl-nombre").innerText = document.getElementById("txt-nombre").value;
    document.getElementById("lbl-direccion").innerText = document.getElementById("txt-direccion").value;
    document.getElementById("lbl-metodo").innerText = usaTarjeta ? "Tarjeta de Crédito SRT" : "Efectivo";
    document.getElementById("lbl-total").innerText = calcularTotal();

    cambiarFase(4);
}

// LISTENERS RADIOS
const radioTarjeta = document.querySelector("#tarjeta");
const radioChecks  = document.querySelector("#Efectivo");
const divCamposTarjeta = document.querySelector("#bloque-inputs-tarjeta");

radioTarjeta.addEventListener("change", function() { divCamposTarjeta.style.display = "block"; });
radioChecks.addEventListener("change", function() { divCamposTarjeta.style.display = "none"; });

function ejecutarCompraFinal() {
    document.getElementById("fase-4").style.display = "none";
    document.getElementById("fase-exito").style.display = "block";
    document.getElementById("nombre-etapa").innerText = "Completado";
}

function finalizarSistema() {
    carrito = [];
    actualizarDatosDeInterfaz();
    cerrarWizard();
    location.reload();
}
