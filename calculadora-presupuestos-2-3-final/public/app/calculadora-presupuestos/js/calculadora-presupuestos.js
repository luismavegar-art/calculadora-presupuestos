(function() {
    const pixelRatio = window.devicePixelRatio || 1;
    document.documentElement.style.zoom = (1 / pixelRatio).toFixed(3);
    document.documentElement.style.fontSize = '16px';
    document.body.style.fontSize = '1rem';
})();
let categoriaActiva = null;  
let productoActivo = null;  
let articuloActivo = null;  
let plantillaActiva = null;  
let colorActivo = null;  
let estampacionActiva = "1";  
let logoActivo = 0;  
let modoColocacion = 0;  
let localizacionesOcupadas = {};  
let modoPrueba = 0;  
let datosArticulos = [];  
let elementoActivo = null;
let datosActivo = new Array(80).fill(0);  
    function inicializarDatosArticulos() {  
        datosArticulos = [];  
        datosArticulos.push(new Array(80).fill(0));  
        for (let i = 1; i <= 13; i++) {  
            datosArticulos.push(new Array(80).fill(0));  
        }  
    }  
    document.addEventListener('keydown', function(e) {  
        if (e.ctrlKey && e.altKey && e.shiftKey && e.key.toLowerCase() === 'p') {  
            modoPrueba = modoPrueba === 0 ? 1 : 0;  
            console.log(`Modo prueba: ${modoPrueba}`);  
            actualizarResumen();  
        }  
    });  
    function reiniciarVariables() {  
        categoriaActiva = null;  
        productoActivo = null;  
        articuloActivo = null;  
        plantillaActiva = null;  
        colorActivo = null;  
        estampacionActiva = "1"; 
        const categoria = datosActivo[1];
        datosActivo = new Array(80).fill(0);
        if (categoria) {
            datosActivo[1] = categoria;
            datosArticulos[13][1] = categoria;
        }
        document.querySelectorAll('.seleccionado').forEach(elemento => {  
            elemento.classList.remove('seleccionado');  
        });  
        document.getElementById('contenedorProductosArticulos').innerHTML = '';  
        inicializarContenedorLocalizaciones();
        document.getElementById('contenedorColores').innerHTML = '';  
        document.querySelectorAll('.talla-cantidad').forEach(input => {
            input.value = '0';
        });
        deshabilitarTodasLasTallas();  
        inicializarInformacion();  
        localizacionesOcupadas = {};  
    } 
    function resetearDatos() {  
        categoriaActiva = null;  
        productoActivo = null;  
        articuloActivo = null;  
        colorActivo = null;  
        plantillaActiva = null;  
        logoActivo = null;  
        estampacionActiva = "1";  
        elementoActivo = null;  
        document.querySelectorAll('.seleccionado').forEach(elem => {  
            elem.classList.remove('seleccionado');  
        });  
        deshabilitarTodasLasTallas();  
        document.getElementById('contenedorProductosArticulos').innerHTML = '';  
        document.getElementById('contenedorLocalizaciones').innerHTML = '';  
        document.getElementById('contenedorColores').innerHTML = '';  
        inicializarInformacion();  
        localizacionesOcupadas = {};  
        actualizarColoresBotonesEstampacion();  
    }  
    function obtenerPreciosMinMax(productoId) {
        const articulos = obtenerArticulosPorProducto(productoId);
        let precioMinimo = 0;
        let precioMaximo = 0;
        if (articulos.length > 0) {
            precioMinimo = obtenerPrecioArticulo(categoriaActiva, articulos[0].id);
            precioMaximo = obtenerPrecioArticulo(categoriaActiva, articulos[articulos.length - 1].id);
        }
        return { precioMinimo, precioMaximo };
    }
    function seleccionPrenda(elemento, tipo) {  
        if (tipo === 'categoria') {  
            reiniciarVariables();  
            categoriaActiva = elemento.getAttribute('data-id');  
            datosActivo[1] = categoriaActiva;
            elemento.classList.add('seleccionado');  
            cargarProductos(categoriaActiva);  
            document.getElementById('contenedorColores').innerHTML = '';  
            deshabilitarTodasLasTallas();  
            inicializarInformacion();  
        }   
        else if (tipo === 'producto') {  
            productoActivo = elemento.getAttribute('data-id');   
            datosActivo[2] = productoActivo;
            const { precioMinimo, precioMaximo } = obtenerPreciosMinMax(productoActivo);
            datosActivo[70] = precioMinimo;
            datosActivo[71] = precioMaximo;
            const articulos = obtenerArticulosPorProducto(productoActivo);
            datosActivo[74] = articulos.length;
            document.querySelectorAll('#contenedorProductosArticulos .seleccionado').forEach(producto => {  
                producto.classList.remove('seleccionado');  
            });  
            elemento.classList.add('seleccionado');  
            cargarArticulos(productoActivo);  
            cargarPlantilla(productoActivo);  
            document.getElementById('contenedorColores').innerHTML = '';  
            deshabilitarTodasLasTallas();  
            actualizarInformacion(`Producto: ${elemento.alt || productoActivo}`);  
        }   
        else if (tipo === 'articulo') {  
            articuloActivo = elemento.getAttribute('data-id');   
            datosActivo[3] = articuloActivo; 
            document.querySelectorAll('#contenedorProductosArticulos .seleccionado').forEach(articulo => {  
                articulo.classList.remove('seleccionado');  
            });  
            elemento.classList.add('seleccionado');  
            cargarDatosArticulo(articuloActivo, categoriaActiva);
            const tallasActuales = {};
            document.querySelectorAll('.talla-cantidad').forEach(input => {
                if (!input.disabled && parseInt(input.value) > 0) {
                    const talla = input.getAttribute('data-talla');
                    tallasActuales[talla] = parseInt(input.value);
                }
            });
            cargarColores(articuloActivo);  
            cargarTallas(articuloActivo);  
            actualizarInformacion(`Seleccionado ${elemento.alt || articuloActivo}`);  
        }
        actualizarDatosActivo(); 
        actualizarEstampacionParcial(); 
    }
    function cargarProductos(categoriaId) {  
        const contenedor = document.getElementById('contenedorProductosArticulos');  
        contenedor.innerHTML = '';  
        const productos = obtenerProductosPorCategoria(categoriaId);  
        productos.forEach(producto => {  
            const imgProducto = document.createElement('img');  
            imgProducto.src = producto.imagen;  
            imgProducto.alt = producto.nombre;  
            imgProducto.setAttribute('data-id', producto.id);  
            imgProducto.onclick = function() {  
                seleccionPrenda(this, 'producto');  
            };  
            contenedor.appendChild(imgProducto);  
        });  
    }  
    function cargarArticulos(productoId) {  
        const contenedor = document.getElementById('contenedorProductosArticulos');  
        contenedor.innerHTML = '';  
        const articulos = obtenerArticulosPorProducto(productoId);  
        const fragment = document.createDocumentFragment();
        articulos.forEach(articulo => {  
            const imgArticulo = document.createElement('img');  
            imgArticulo.src = articulo.imagen;  
            imgArticulo.alt = articulo.nombre;  
            imgArticulo.setAttribute('data-id', articulo.id);  
            imgArticulo.onclick = function() {  
                seleccionPrenda(this, 'articulo');  
            };  
            fragment.appendChild(imgArticulo);  
        });  
        contenedor.appendChild(fragment);
    }
    function cargarPlantilla(productoId) {  
        const contenedor = document.getElementById('contenedorLocalizaciones');  
        contenedor.innerHTML = '';  
        const rutaPlantilla = obtenerRutaPlantilla(productoId);  
        colorActivo = document.createElement('div');  
        colorActivo.style.position = 'absolute';  
        colorActivo.style.zIndex = '1';  
        colorActivo.style.width = 'calc(100% - 4px)';  
        colorActivo.style.height = 'calc(100% - 4px)';  
        colorActivo.style.top = '2px';  
        colorActivo.style.left = '2px';  
        colorActivo.style.backgroundColor = '#FFFFFF';  
        contenedor.appendChild(colorActivo);  
        plantillaActiva = document.createElement('img');  
        plantillaActiva.src = rutaPlantilla;  
        plantillaActiva.style.position = 'absolute';  
        plantillaActiva.style.zIndex = '2';  
        plantillaActiva.style.width = '100%';  
        plantillaActiva.style.height = '100%';  
        contenedor.appendChild(plantillaActiva);  
        crearLocalizaciones(contenedor);  
    }  
    function crearLocalizaciones(contenedor) {  
        let xhr = new XMLHttpRequest();  
        xhr.open('GET', 'productos/productos.xml', false);  
        xhr.send();  
        if (xhr.status === 200) {  
            let xmlDoc = xhr.responseXML;  
            const zonasDisponibles = {};  
            const zonasProducto = xmlDoc.querySelectorAll(`producto[id="${productoActivo}"] > zonas > zona`);  
            zonasProducto.forEach(zona => {  
                const id = zona.getAttribute('id');  
                const disponible = zona.getAttribute('disponible') === "true";  
                zonasDisponibles[id] = disponible;  
            });  
            const zonasConfig = xmlDoc.querySelectorAll('configuracion > zonas-id > zona');  
            zonasConfig.forEach(zona => {  
                const id = zona.getAttribute('id');  
                if (zonasDisponibles[id]) {  
                    const top = zona.getAttribute('top');  
                    const left = zona.getAttribute('left');  
                    const width = zona.getAttribute('width');  
                    const height = zona.getAttribute('height');  
                    const zIndex = zona.getAttribute('z-index');  
                    const localizacion = document.createElement('div');  
                    localizacion.className = 'localizacion';  
                    localizacion.setAttribute('data-zona', id);  
                    localizacion.style.top = top;  
                    localizacion.style.left = left;  
                    localizacion.style.width = width;  
                    localizacion.style.height = height;  
                    localizacion.style.zIndex = zIndex;  
                    localizacion.onclick = function() {  
                        colocacionLogo(this, id);  
                    };  
                    contenedor.appendChild(localizacion);  
                }  
            });  
            actualizarBordesLocalizaciones();  
        }  
    }   
    function obtenerProductosPorCategoria(categoriaId) {  
        return cargarXML(`productos/productos.xml`, 'producto', categoriaId);  
    }  
    function obtenerArticulosPorProducto(productoId) {  
        return cargarXML(`productos/${categoriaActiva}.xml`, 'articulo', productoId);  
    }  
    function obtenerRutaPlantilla(productoId) {  
        let xhr = new XMLHttpRequest();  
        xhr.open('GET', 'productos/productos.xml', false);  
        xhr.send();  
        if (xhr.status === 200) {  
            let xmlDoc = xhr.responseXML;  
            let productos = xmlDoc.querySelectorAll(`producto[id="${productoId}"]`);  
            if (productos.length > 0) {  
                return productos[0].querySelector('plantilla').textContent;  
            }  
        }  
        return '';  
    }  
    function cargarXML(archivo, tipo, filtroId = null) {  
        let resultado = [];  
        let xhr = new XMLHttpRequest();  
        xhr.open('GET', archivo, false);  
        xhr.send();  
        if (xhr.status === 200) {  
            let xmlDoc = xhr.responseXML;  
            if (tipo === 'categoria') {  
                let categorias = xmlDoc.querySelectorAll('categoria');  
                categorias.forEach(cat => {  
                    resultado.push({  
                        id: cat.getAttribute('id'),  
                        nombre: cat.getAttribute('nombre'),  
                        imagen: cat.querySelector('imagen').textContent  
                    });  
                });  
            }   
            else if (tipo === 'producto') {  
                let productos = xmlDoc.querySelectorAll(`categoria[id="${filtroId}"] > producto`);  
                productos.forEach(prod => {  
                    resultado.push({  
                        id: prod.getAttribute('id'),  
                        nombre: prod.getAttribute('nombre'),  
                        imagen: prod.querySelector('imagen').textContent  
                    });  
                });  
            }   
            else if (tipo === 'articulo') {  
                let articulos = xmlDoc.querySelectorAll(`producto[id="${filtroId}"] > articulos > articulo`);  
                articulos.forEach(art => {  
                    resultado.push({  
                        id: art.getAttribute('id'),  
                        nombre: art.querySelector('nombre').textContent,  
                        imagen: art.querySelector('imagen').textContent  
                    });  
                });  
            }  
        }  
        return resultado;  
    }  
    function obtenerCategorias() {  
        return cargarXML('productos/productos.xml', 'categoria');  
    }  
function cargarColores(articuloId) {
    const contenedor = document.getElementById('contenedorColores');
    contenedor.innerHTML = '';
    if (!articuloId) return;
    const colores = obtenerColoresArticulo(articuloId) || [];
    const MAX_PER_ROW = 16;               
    const fila1Colors = colores.slice(0, MAX_PER_ROW);
    const fila2Colors = colores.slice(MAX_PER_ROW, MAX_PER_ROW * 2); 
    contenedor.style.boxSizing = 'border-box';
    contenedor.style.padding = '8px';
    contenedor.style.display = 'flex';
    contenedor.style.flexDirection = 'column';
    contenedor.style.rowGap = '6px';
    contenedor.style.overflow = 'hidden';
    const fila1 = document.createElement('div');
    const fila2 = document.createElement('div');
    [fila1, fila2].forEach(f => {
        f.className = 'fila-colores';
        f.style.display = 'flex';
        f.style.alignItems = 'center';
        f.style.flexWrap = 'nowrap';
        f.style.gap = '6px';
        f.style.boxSizing = 'border-box';
        contenedor.appendChild(f);
    });
    function crearChip(color) {
        const divColor = document.createElement('div');
        divColor.className = 'color-item';
        divColor.style.flex = '0 0 auto';
        divColor.style.borderRadius = '4px';
        divColor.style.cursor = 'pointer';
        divColor.style.boxSizing = 'border-box';
        divColor.style.backgroundColor = color.codigo;
        divColor.setAttribute('data-color', color.codigo);
        divColor.setAttribute('data-nombre', color.nombre);
        divColor.setAttribute('data-infantil', color.infantil || '0');
        divColor.setAttribute('data-grande', color.grande || '0');
        divColor.onclick = function () {
            contenedor.querySelectorAll('.color-item.seleccionado').forEach(c => c.classList.remove('seleccionado'));
            this.classList.add('seleccionado');
            if (colorActivo) colorActivo.style.backgroundColor = this.getAttribute('data-color');
            datosActivo[4] = this.getAttribute('data-color');
            datosActivo[5] = this.getAttribute('data-nombre');
            actualizarDatosActivo();
            actualizarTallasDisponibles(
                this.getAttribute('data-infantil') === '1',
                this.getAttribute('data-grande') === '1'
            );
        };
        return divColor;
    }
    fila1Colors.forEach(c => fila1.appendChild(crearChip(c)));
    fila2Colors.forEach(c => fila2.appendChild(crearChip(c)));
    const firstChip = contenedor.querySelector('.color-item');
    if (firstChip) {
        firstChip.classList.add('seleccionado');
        if (colorActivo) colorActivo.style.backgroundColor = firstChip.getAttribute('data-color');
        datosActivo[4] = firstChip.getAttribute('data-color');
        datosActivo[5] = firstChip.getAttribute('data-nombre');
        actualizarTallasDisponibles(
            firstChip.getAttribute('data-infantil') === '1',
            firstChip.getAttribute('data-grande') === '1'
        );
    }
    function dimensionarColores() {
        const PAD = 8;      
        const GAP = 6;      
        const ROW_GAP = 6;  
        const MIN = 8;      
        const w = (contenedor.clientWidth || contenedor.getBoundingClientRect().width || 0) - PAD * 2;
        const chip = Math.floor((w - GAP * (MAX_PER_ROW - 1)) / MAX_PER_ROW);
        const size = Math.max(MIN, chip);
        const alturaTotal = size * 2 + ROW_GAP + PAD * 2;
        if ((contenedor.clientHeight || 0) < alturaTotal) {
            contenedor.style.minHeight = alturaTotal + 'px';
        }
        [fila1, fila2].forEach(f => {
            f.style.height = size + 'px';
            f.querySelectorAll('.color-item').forEach(el => {
                el.style.width = size + 'px';
                el.style.height = size + 'px';
            });
        });
    }
    dimensionarColores();
    requestAnimationFrame(dimensionarColores);
}
    function obtenerColoresArticulo(articuloId) {  
        if (!articuloId) return [];  
        let resultado = [];  
        let xhr = new XMLHttpRequest();  
        xhr.open('GET', `productos/${categoriaActiva}.xml`, false);  
        xhr.send();  
        if (xhr.status === 200) {  
            let xmlDoc = xhr.responseXML;  
            let coloresElements = xmlDoc.querySelectorAll(`articulo[id="${articuloId}"] > colores > color`);  
            coloresElements.forEach(colorElement => {  
                resultado.push({  
                    nombre: colorElement.getAttribute('nombre'),  
                    codigo: colorElement.getAttribute('codigo'),  
                    infantil: colorElement.getAttribute('infantil') || "0",  
                    grande: colorElement.getAttribute('grande') || "0"  
                });  
            });  
        }  
        return resultado;  
    }  
function inicializarTallas() {  
    const contenedor = document.getElementById('contenedorTallas');  
    contenedor.innerHTML = '';  
    const grupoInfantil = ['4XS', '3XS', '2XS'];  
    const grupoAdulto = ['XS', 'S', 'M', 'L', 'XL', '2XL'];  
    const grupoGrande = ['3XL', '4XL'];  
    const todasLasTallas = [...grupoInfantil, ...grupoAdulto, ...grupoGrande];  
    datosActivo[17] = 0;
    todasLasTallas.forEach(talla => {  
        const divTalla = document.createElement('div');  
        divTalla.classList.add('talla-item');
        const spanTalla = document.createElement('span');  
        spanTalla.textContent = talla;  
        spanTalla.setAttribute('data-talla', talla);  
        spanTalla.classList.add('talla-label');  
        if (grupoInfantil.includes(talla)) {  
            spanTalla.setAttribute('data-grupo', 'infantil');  
        } else if (grupoGrande.includes(talla)) {  
            spanTalla.setAttribute('data-grupo', 'grande');  
        } else {  
            spanTalla.setAttribute('data-grupo', 'adulto');  
        }  
        const inputCantidad = document.createElement('input');  
        inputCantidad.type = 'number';  
        inputCantidad.min = '0';  
        inputCantidad.max = '999';  
        inputCantidad.value = '0';  
        inputCantidad.setAttribute('data-talla', talla);  
        inputCantidad.classList.add('talla-cantidad');  
        inputCantidad.disabled = true;    
        inputCantidad.addEventListener('change', function() {  
            const tallasPosicion = {"4XS": 6, "3XS": 7, "2XS": 8, "XS": 9, "S": 10, "M": 11, "L": 12, "XL": 13, "2XL": 14, "3XL": 15, "4XL": 16};
            const talla = this.getAttribute('data-talla');
            if (tallasPosicion[talla] !== undefined && !this.disabled) {
                datosActivo[tallasPosicion[talla]] = parseInt(this.value) || 0;
            }
            datosActivo[17] = 0;
            document.querySelectorAll('.talla-cantidad').forEach(input => {
                if (!input.disabled && parseInt(input.value) > 0) {
                    datosActivo[17] += parseInt(input.value);
                }
            });
            actualizarDatosActivo();                
            actualizarEstampacionParcial();  
        });  
        divTalla.appendChild(spanTalla);  
        divTalla.appendChild(inputCantidad);  
        contenedor.appendChild(divTalla);  
    });  
    deshabilitarTodasLasTallas();  
}
    function cargarTallas(articuloId, tallasActuales = {}) {  
        if (!articuloId) return;  
        const tallasDisponibles = obtenerTallasArticulo(articuloId);  
        const elementosLabel = document.querySelectorAll('.talla-label');  
        const elementosInput = document.querySelectorAll('.talla-cantidad');  
        const valoresActuales = {};
        if (Object.keys(tallasActuales).length === 0) {
            elementosInput.forEach(input => {
                if (!input.disabled && parseInt(input.value) > 0) {
                    const talla = input.getAttribute('data-talla');
                    valoresActuales[talla] = parseInt(input.value);
                }
            });
        } else {
            Object.assign(valoresActuales, tallasActuales);
        }
        elementosLabel.forEach((elemento, index) => {  
            const talla = elemento.getAttribute('data-talla');  
            const grupo = elemento.getAttribute('data-grupo');  
            const inputCantidad = elementosInput[index];  
            let disponible = false;  
            if (tallasDisponibles[grupo] && tallasDisponibles[grupo].includes(talla)) {  
                disponible = true;  
            }  
            if (!disponible) {  
                elemento.style.color = '#ff0000';   
                inputCantidad.disabled = true;  
                inputCantidad.style.backgroundColor = '#ffeeee';  
                inputCantidad.value = '0';
            } else {  
                elemento.style.color = '#333';    
                inputCantidad.disabled = false;  
                inputCantidad.style.backgroundColor = '#ffffff';  
                if (valoresActuales[talla]) {
                    inputCantidad.value = valoresActuales[talla];
                }
            }  
        });
        actualizarTotalTallas();
    }    
    function actualizarTotalTallas() {
        datosActivo[17] = 0;
        document.querySelectorAll('.talla-cantidad').forEach(input => {
            if (!input.disabled && parseInt(input.value) > 0) {
                datosActivo[17] += parseInt(input.value);
            }
        });
    }  
    function actualizarTallasDisponibles(infantilDisponible, grandeDisponible) {  
        const elementosLabel = document.querySelectorAll('.talla-label');  
        const elementosInput = document.querySelectorAll('.talla-cantidad');  
        const valoresActuales = {};
        elementosInput.forEach(input => {
            if (!input.disabled && parseInt(input.value) > 0) {
                const talla = input.getAttribute('data-talla');
                valoresActuales[talla] = parseInt(input.value);
            }
        });
        elementosLabel.forEach((elemento, index) => {  
            const grupo = elemento.getAttribute('data-grupo');  
            const talla = elemento.getAttribute('data-talla');
            const inputCantidad = elementosInput[index];  
            if (elemento.style.color === 'rgb(255, 0, 0)') {  
                return;  
            }  
            if ((grupo === 'infantil' && !infantilDisponible) ||   
                (grupo === 'grande' && !grandeDisponible)) {  
                elemento.style.color = '#ff0000';   
                inputCantidad.disabled = true;  
                inputCantidad.style.backgroundColor = '#ffeeee';  
                inputCantidad.value = '0';
            } else {  
                elemento.style.color = '#333';   
                inputCantidad.disabled = false;  
                inputCantidad.style.backgroundColor = '#ffffff';  
                if (valoresActuales[talla]) {
                    inputCantidad.value = valoresActuales[talla];
                }
            }  
        });  
        actualizarTotalTallas();
        actualizarEstampacionParcial();
    }    
    function deshabilitarTodasLasTallas() {  
        const elementosLabel = document.querySelectorAll('.talla-label');  
        const elementosInput = document.querySelectorAll('.talla-cantidad');  
        elementosLabel.forEach((elemento, index) => {  
            elemento.style.color = '#ff0000';   
            const inputCantidad = elementosInput[index];  
            inputCantidad.disabled = true;  
            inputCantidad.style.backgroundColor = '#ffeeee';  
        });  
    }  
    function obtenerTallasArticulo(articuloId) {  
        if (!articuloId) return { infantil: [], adulto: [], grande: [] };  
        let resultado = { infantil: [], adulto: [], grande: [] };  
        let xhr = new XMLHttpRequest();  
        xhr.open('GET', `productos/${categoriaActiva}.xml`, false);  
        xhr.send();  
        if (xhr.status === 200) {  
            let xmlDoc = xhr.responseXML;  
            let grupos = xmlDoc.querySelectorAll(`articulo[id="${articuloId}"] > tallas > grupo`);  
            grupos.forEach(grupo => {  
                const nombreGrupo = grupo.getAttribute('nombre');  
                const tallas = grupo.querySelectorAll('talla');  
                tallas.forEach(talla => {  
                    if (talla.textContent && talla.textContent.trim() !== '') {  
                        resultado[nombreGrupo].push(talla.textContent.trim().toUpperCase());  
                    }  
                });  
            });  
        }  
        return resultado;  
    }  
    function inicializarInformacion() {  
        const contenedor = document.getElementById('contenedorInformacion');  
        contenedor.innerHTML = '';  
        const mensaje = document.createElement('div');  
        mensaje.textContent = 'Selecciona una categoría, producto y artículo para empezar';  
        mensaje.classList.add('mensaje-informacion');
        contenedor.appendChild(mensaje);  
        if (articuloActivo) {
            actualizarEstrellas();
        }
    }
    function actualizarEstrellas() {
        if (!articuloActivo) return;
        const contenedorInfo = document.getElementById('contenedorInformacion');
        const mensajeElement = contenedorInfo.querySelector('div');
        if (!mensajeElement) return;
        let nivel = '';
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `productos/${categoriaActiva}.xml`, false);
        xhr.send();
        if (xhr.status === 200) {
            let xmlDoc = xhr.responseXML;
            let nivelElement = xmlDoc.querySelector(`articulo[id="${articuloActivo}"] > nivel`);
            if (nivelElement) {
                nivel = nivelElement.textContent.toLowerCase();
            }
        }
        const textoActual = mensajeElement.textContent;
        mostrarEstrellas(mensajeElement, textoActual, nivel);
    }
    function actualizarEstrellasArticulo(articuloId) {
        if (!articuloId || !categoriaActiva) return;
        const contenedorInfo = document.getElementById('contenedorInformacion');
        const mensajeElement = contenedorInfo.querySelector('div');
        if (!mensajeElement) return;
        let nivel = '';
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `productos/${categoriaActiva}.xml`, false);
        xhr.send();
        if (xhr.status === 200) {
            let xmlDoc = xhr.responseXML;
            let nivelElement = xmlDoc.querySelector(`articulo[id="${articuloId}"] > nivel`);
            if (nivelElement) {
                nivel = nivelElement.textContent.toLowerCase();
            }
        }
        const textoActual = mensajeElement.textContent;
        mostrarEstrellas(mensajeElement, textoActual, nivel);
    }
    function mostrarEstrellas(mensajeElement, textoActual, nivel) {
        let estrellas = '';
        for (let i = 0; i < 5; i++) {
            const color = ((nivel === 'promo' && i === 0) || 
                        (nivel === 'básica' && i <= 1) || 
                        (nivel === 'top' && i <= 2) || 
                        (nivel === 'premium' && i <= 3) || 
                        (nivel === 'extrapremium')) ? 'gold' : '#cccccc';
            estrellas += `<span style="color: ${color}; font-size: 1.0vw; display: inline-block; vertical-align: top; line-height: 1;">★</span>`;
        }
        mensajeElement.innerHTML = '';
        const contenedorTexto = document.createElement('span');
        contenedorTexto.textContent = textoActual;
        contenedorTexto.style.display = 'inline-block';
        contenedorTexto.style.verticalAlign = 'middle';
        const espacioSpan = document.createElement('span');
        espacioSpan.innerHTML = '&nbsp;&nbsp;';
        espacioSpan.style.display = 'inline-block';
        const contenedorEstrellas = document.createElement('span');
        contenedorEstrellas.innerHTML = estrellas;
        contenedorEstrellas.style.display = 'inline-block';
        contenedorEstrellas.style.verticalAlign = 'bottom';
        mensajeElement.appendChild(contenedorTexto);
        mensajeElement.appendChild(espacioSpan);
        mensajeElement.appendChild(contenedorEstrellas);
    }
function actualizarInformacion(mensaje, mostrarEstrellas = false, articuloEspecifico = null, esHTML = false) {
    const contenedor = document.getElementById('contenedorInformacion');
    contenedor.innerHTML = '';
    const mensajeElement = document.createElement('div');
    if (esHTML) {
        mensajeElement.innerHTML = mensaje;
    } else {
        mensajeElement.textContent = mensaje;
    }
    mensajeElement.classList.add('mensaje-informacion');
    contenedor.appendChild(mensajeElement);
    if (mostrarEstrellas && !esHTML) {
        if (articuloEspecifico) {
            actualizarEstrellasArticulo(articuloEspecifico);
        } else if (articuloActivo) {
            actualizarEstrellas();
        }
    }
}
function cargarLogos() {
    const contenedor = document.getElementById('contenedorLogos');
    contenedor.innerHTML = '';

    const esMovil = window.matchMedia('(max-width: 768px)').matches;

    contenedor.style.display = 'grid';
    if (esMovil) {
        contenedor.style.gridTemplateColumns = 'repeat(6, 1fr)';
        contenedor.style.gridTemplateRows = '1fr';
        contenedor.style.gridAutoFlow = 'column';
        contenedor.style.justifyContent = 'space-between';
        contenedor.style.alignItems = 'center';
        contenedor.style.overflowX = 'auto';
        contenedor.style.overflowY = 'hidden';
        contenedor.style.gap = '5px';
        contenedor.style.padding = '5px';
        contenedor.style.width = '100%';
        contenedor.style.height = 'auto';
        contenedor.style.boxSizing = 'border-box';
    } else {
        contenedor.style.gridTemplateColumns = 'repeat(2, 1fr)';
        contenedor.style.gridTemplateRows = 'repeat(3, 1fr)';
        contenedor.style.gap = '5px';
        contenedor.style.padding = '5px';
        contenedor.style.alignItems = 'center';
        contenedor.style.justifyItems = 'center';
        contenedor.style.overflow = 'hidden';
        contenedor.style.width = '100%';
        contenedor.style.height = '100%';
        contenedor.style.boxSizing = 'border-box';
    }

    const logosConfig = [
        { id: 'logo1', src: 'productos/logos/logo1.webp' },
        { id: 'logo2', src: 'productos/logos/logo2.webp' },
        { id: 'logo3', src: 'productos/logos/logo3.webp' },
        { id: 'logo4', src: 'productos/logos/logo4.webp' },
        { id: 'logoDorsal', src: 'productos/logos/logoDorsal.webp' }
    ];

    logosConfig.forEach(config => {
        const logoContainer = document.createElement('div');
        logoContainer.style.width = '100%';
        logoContainer.style.height = '100%';
        logoContainer.style.display = 'flex';
        logoContainer.style.justifyContent = 'center';
        logoContainer.style.alignItems = 'center';
        logoContainer.style.overflow = 'hidden';

        const logo = document.createElement('img');
        logo.src = config.src;
        logo.className = 'logo-img';
        logo.setAttribute('data-logo-id', config.id);
        logo.style.maxWidth = '90%';
        logo.style.maxHeight = '90%';
        logo.style.objectFit = 'contain';
        logo.onclick = function() { activarLogo(this); };

        logoContainer.appendChild(logo);
        contenedor.appendChild(logoContainer);
    });

    const nombreNumeroContainer = document.createElement('div');
    nombreNumeroContainer.style.width = '100%';
    nombreNumeroContainer.style.height = '100%';
    nombreNumeroContainer.style.display = 'flex';
    nombreNumeroContainer.style.flexDirection = 'column';
    nombreNumeroContainer.style.justifyContent = 'space-around';
    nombreNumeroContainer.style.alignItems = 'center';
    nombreNumeroContainer.style.overflow = 'hidden';

    const nombreNumeroConfig = [
        { id: 'logoNombre', src: 'productos/logos/logoNombre.webp' },
        { id: 'logoNumero', src: 'productos/logos/logoNumero.webp' }
    ];

    nombreNumeroConfig.forEach(config => {
        const subContainer = document.createElement('div');
        subContainer.style.width = '100%';
        subContainer.style.height = '45%';
        subContainer.style.display = 'flex';
        subContainer.style.justifyContent = 'center';
        subContainer.style.alignItems = 'center';

        const logo = document.createElement('img');
        logo.src = config.src;
        logo.className = 'logo-img';
        logo.setAttribute('data-logo-id', config.id);
        logo.style.maxWidth = '90%';
        logo.style.maxHeight = '90%';
        logo.style.objectFit = 'contain';
        logo.onclick = function() { activarLogo(this); };

        subContainer.appendChild(logo);
        nombreNumeroContainer.appendChild(subContainer);
    });

    contenedor.appendChild(nombreNumeroContainer);
}

    function activarLogo(logoElement) {
        if (logoElement.classList.contains('activo')) {
            logoElement.classList.remove('activo');
            logoElement.style.border = 'none';
            logoActivo = 0;
            modoColocacion = 0;
            actualizarBordesLocalizaciones();
            return;
        }
        document.querySelectorAll('.logo-img.activo').forEach(logo => {
            logo.classList.remove('activo');
            logo.style.border = 'none';
        });
        logoElement.classList.add('activo');
        const logoId = logoElement.getAttribute('data-logo-id');
        if (logoId === 'logo1') logoActivo = 1;
        else if (logoId === 'logo2') logoActivo = 2;
        else if (logoId === 'logo3') logoActivo = 3;
        else if (logoId === 'logo4') logoActivo = 4;
        else if (logoId === 'logoDorsal') logoActivo = 5;
        else if (logoId === 'logoNombre') logoActivo = 6;
        else if (logoId === 'logoNumero') logoActivo = 7;
        else logoActivo = 0;
        modoColocacion = 1;
        if (estampacionActiva === "1") {
            logoElement.style.border = "2px solid red";
        } else if (estampacionActiva === "2") {
            logoElement.style.border = "2px solid green";
        } else if (estampacionActiva === "3") {
            logoElement.style.border = "2px solid blue";
        }
        actualizarBordesLocalizaciones();
    }
    function colocacionLogo(localizacion, zona) {  
        if (modoColocacion !== 1 || logoActivo === 0) return;  
        if (localizacionesOcupadas[zona]) {  
            localizacion.innerHTML = ''; 
            delete localizacionesOcupadas[zona];
            const zonaIndex = 20 + parseInt(zona);
            if (zonaIndex >= 20 && zonaIndex <= 39) {
                datosActivo[zonaIndex] = 0; 
            }
            localizacion.onclick = function() {  
                colocacionLogo(this, zona);  
            };
            actualizarLocalizacionesDisponibles();
            actualizarBordesLocalizaciones();
            actualizarDatosActivo(); 
            actualizarEstampacionParcial();
            return;
        }  
        const medida = getMedidaLocalizacion(zona); 
        let rutaLogo = getRutaLogo(logoActivo);
        const logoIdActual = logoActivo;
        if ((logoActivo === 6 || logoIdActual === 6) && (zona === "12" || zona === "13")) { rutaLogo = 'productos/logos/logoNombreV.webp'; }
        logoActivo = 0;  
        modoColocacion = 0;
        document.querySelectorAll('.logo-img.activo').forEach(logo => {  
            logo.classList.remove('activo');  
            logo.style.border = 'none';  
        });
        const imgLogo = document.createElement('img');  
        imgLogo.src = rutaLogo;  
        imgLogo.className = 'logo-ubicado';  
        const cruzEliminar = document.createElement('div');  
        cruzEliminar.className = 'cruz-eliminar';  
        cruzEliminar.innerHTML = '✕';  
        const locWidth = parseFloat(localizacion.style.width);
        const locHeight = parseFloat(localizacion.style.height);
        const smallerDimension = Math.min(locWidth, locHeight);
        let cruzSize = Math.max(smallerDimension * 0.075, 8);
        cruzEliminar.style.width = `${cruzSize}px`;
        cruzEliminar.style.height = `${cruzSize}px`;
        cruzEliminar.style.fontSize = `${cruzSize * 0.6}px`;
        cruzEliminar.style.lineHeight = `${cruzSize}px`;
        cruzEliminar.style.position = 'absolute';
        cruzEliminar.style.top = '0';
        cruzEliminar.style.right = '0';
        cruzEliminar.style.transform = 'translate(50%, -50%)';
        cruzEliminar.style.backgroundColor = 'red';
        cruzEliminar.style.color = 'white';
        cruzEliminar.style.borderRadius = '50%';
        cruzEliminar.style.textAlign = 'center';
        cruzEliminar.style.cursor = 'pointer';
        cruzEliminar.style.zIndex = '10';
        cruzEliminar.style.boxShadow = '0 0 3px rgba(0,0,0,0.5)';
        cruzEliminar.style.display = 'flex';
        cruzEliminar.style.justifyContent = 'center';
        cruzEliminar.style.alignItems = 'center';
        localizacion.innerHTML = '';  
        localizacion.appendChild(imgLogo);  
        localizacion.appendChild(cruzEliminar);  
        const logoInfo = [  
            parseInt(estampacionActiva),
            medida,
            logoIdActual,
            0
        ];
        localizacionesOcupadas[zona] = logoInfo;
        const zonaIndex = 20 + parseInt(zona);
        if (zonaIndex >= 20 && zonaIndex <= 39) {
            datosActivo[zonaIndex] = logoInfo.join(',');
        }
        imgLogo.addEventListener('click', function(e) {
            borrarContenidoZona(e, localizacion, zona);
        });
        cruzEliminar.addEventListener('click', function(e) {
            borrarContenidoZona(e, localizacion, zona);
        });
        const clicOriginal = localizacion.onclick;
        localizacion.onclick = function(e) {
            if (!localizacionesOcupadas[zona]) {
                clicOriginal.call(this, e);
            } else {
                borrarContenidoZona(e, localizacion, zona);
            }
        };
        actualizarLocalizacionesDisponibles();
        actualizarBordesLocalizaciones();
        actualizarDatosActivo(); 
        actualizarEstampacionParcial();
    }
    function borrarContenidoZona(e, localizacion, zona) {
        e.stopPropagation();  
        localizacion.innerHTML = ''; 
        delete localizacionesOcupadas[zona];
        const zonaIndex = 20 + parseInt(zona);
        if (zonaIndex >= 20 && zonaIndex <= 39) {
            datosActivo[zonaIndex] = 0; 
        }
        localizacion.onclick = function() {  
            colocacionLogo(this, zona);  
        };
        actualizarLocalizacionesDisponibles();
        actualizarBordesLocalizaciones();
        actualizarDatosActivo(); 
        actualizarEstampacionParcial();
    } 
    function actualizarLocalizacionesDisponibles() {  
        const zonasOcupadas = Object.keys(localizacionesOcupadas);  
        const zonasNoDisponibles = [];  
        zonasOcupadas.forEach(zona => {  
            const zonaNum = parseInt(zona);  
            if ([0, 1, 2].includes(zonaNum)) {  
                zonasNoDisponibles.push(5, 6, 18);  
            }  
            if ([5, 6, 18].includes(zonaNum)) {  
                zonasNoDisponibles.push(0, 1, 2);  
                if (zonaNum === 5) zonasNoDisponibles.push(6, 18);  
                if (zonaNum === 6) zonasNoDisponibles.push(5, 18);  
                if (zonaNum === 18) zonasNoDisponibles.push(5, 6);  
            }  
            if ([8, 9, 10].includes(zonaNum)) {  
                if (zonaNum === 8) zonasNoDisponibles.push(9, 10);  
                if (zonaNum === 9) zonasNoDisponibles.push(8, 10);  
                if (zonaNum === 10) zonasNoDisponibles.push(8, 9);  
            }  
        });  
        for (let i = 0; i <= 19; i++) {  
            const localizacion = document.querySelector(`.localizacion[data-zona="${i}"]`);  
            if (!localizacion) continue;  
            if (zonasNoDisponibles.includes(i) && !localizacionesOcupadas[i]) {  
                localizacion.style.display = 'none';  
            } else {  
                localizacion.style.display = 'block';  
            }  
        }  
    }  
    function getMedidaLocalizacion(zona) {  
        const zonaNum = parseInt(zona);  
        if ([0, 1, 2, 3, 4, 14, 15, 16, 17].includes(zonaNum)) {  
            return 1;  
        }  
        else if ([7, 8, 11, 12, 13, 18].includes(zonaNum)) {  
            return 2;  
        }  
        else if ([5, 9].includes(zonaNum)) {  
            return 3;  
        }  
        else {  
            return 4;  
        }  
    }   
    function actualizarEstampacionParcial() {  
        for (let i = 41; i < 69; i++) {  
            datosActivo[i] = 0;  
        } 
        datosActivo[19] = 0;
        for (const zona in localizacionesOcupadas) {  
            if (localizacionesOcupadas.hasOwnProperty(zona)) {  
                const logoInfo = localizacionesOcupadas[zona];  
                const tipoEstampacion = logoInfo[0];   
                const medida = logoInfo[1];          
                const logoId = logoInfo[2];          
                if (tipoEstampacion === 1) {                      
                    if (medida === 1) datosActivo[41]++, datosActivo[53]++;  
                    else if (medida === 2) datosActivo[42]++, datosActivo[54]++;  
                    else if (medida === 3) datosActivo[43]++, datosActivo[55]++;  
                    else if (medida === 4) datosActivo[44]++, datosActivo[56]++; 
                }   
                else if (tipoEstampacion === 2) {    
                    if (medida === 1) datosActivo[45]++, datosActivo[57]++;  
                    else if (medida === 2) datosActivo[46]++, datosActivo[58]++;  
                    else if (medida === 3) datosActivo[47]++, datosActivo[59]++;  
                    else if (medida === 4) datosActivo[48]++, datosActivo[60]++; 
                }   
                else if (tipoEstampacion === 3) {  
                    if (medida === 1) datosActivo[49]++, datosActivo[61]++;  
                    else if (medida === 2) datosActivo[50]++, datosActivo[62]++;  
                    else if (medida === 3) datosActivo[51]++, datosActivo[63]++;  
                    else if (medida === 4) datosActivo[52]++, datosActivo[64]++; 
                }  
                if (logoId === 5 || logoId === 6 || logoId === 7) { 
                    datosActivo[19]++; 
                }  
            }  
        } 
        datosActivo[18] = datosActivo[41]+datosActivo[42]+datosActivo[43]+datosActivo[44]+
            datosActivo[45]+datosActivo[46]+datosActivo[47]+datosActivo[48]+
            datosActivo[49]+datosActivo[50]+datosActivo[51]+datosActivo[52];
        actualizarDatosActivo();
        actualizarEstampacionTotal(); 
    }  
    function actualizarEstampacionTotal() {  
        for (let i = 1; i <= 12; i++) {  
            datosArticulos[0][i] = 0;  
            datosArticulos[0][i+24] = 0; 
            datosArticulos[0][i+40] = 0; 
            datosArticulos[0][i+52] = 0;  
        } 
        datosArticulos[0][39] = 0;  
        for (let i = 1; i <= 13; i++) {  
            if (datosArticulos[i][0] !== 0 && i !== elementoActivo) {  
                for (let j = 41; j <= 52; j++) {  
                    datosArticulos[0][j] += datosArticulos[i][17] * (datosArticulos[i][j]); 
                    datosArticulos[0][j+12] += (datosArticulos[i][j+12] || 0); 
                }  
                datosArticulos[0][39] += datosArticulos[i][17] * (datosArticulos[i][19]);  
            }  
        }  
        let xhr = new XMLHttpRequest();  
        xhr.open('GET', 'productos/precioEstampacion.xml', false);  
        xhr.send();         
        if (xhr.status === 200) {  
            let xmlDoc = xhr.responseXML;             
            datosArticulos[0][25] = obtenerPrecioPorRango(xmlDoc, 'grabado', 1, datosArticulos[0][41]);  
            datosArticulos[0][26] = obtenerPrecioPorRango(xmlDoc, 'grabado', 2, datosArticulos[0][42]);  
            datosArticulos[0][27] = obtenerPrecioPorRango(xmlDoc, 'grabado', 3, datosArticulos[0][43]);  
            datosArticulos[0][28] = obtenerPrecioPorRango(xmlDoc, 'grabado', 4, datosArticulos[0][44]);  
            datosArticulos[0][29] = obtenerPrecioPorRango(xmlDoc, 'vinilo', 1, datosArticulos[0][45]);  
            datosArticulos[0][30] = obtenerPrecioPorRango(xmlDoc, 'vinilo', 2, datosArticulos[0][46]);  
            datosArticulos[0][31] = obtenerPrecioPorRango(xmlDoc, 'vinilo', 3, datosArticulos[0][47]);  
            datosArticulos[0][32] = obtenerPrecioPorRango(xmlDoc, 'vinilo', 4, datosArticulos[0][48]);  
            datosArticulos[0][33] = obtenerPrecioPorRango(xmlDoc, 'bordado', 1, datosArticulos[0][49]);  
            datosArticulos[0][34] = obtenerPrecioPorRango(xmlDoc, 'bordado', 2, datosArticulos[0][50]);  
            datosArticulos[0][35] = obtenerPrecioPorRango(xmlDoc, 'bordado', 3, datosArticulos[0][51]);  
            datosArticulos[0][36] = obtenerPrecioPorRango(xmlDoc, 'bordado', 4, datosArticulos[0][52]);             
        }  
        datosArticulos[0][65] = 0;      
        datosArticulos[0][66] = 0;      
        datosArticulos[0][67] = 0;      
        datosArticulos[0][68] = 0;     
        datosArticulos[0][72] = 0;      
        datosArticulos[0][73] = 0;     
        datosArticulos[0][74] = 1; 
        for (let i = 1; i <= 13; i++) {
            if (datosArticulos[i][0] !== 0  && i !== elementoActivo) {
                datosArticulos[i][65] = 
                (datosArticulos[0][25]*datosArticulos[i][41] + 
                datosArticulos[0][26]*datosArticulos[i][42] + 
                datosArticulos[0][27]*datosArticulos[i][43] + 
                datosArticulos[0][28]*datosArticulos[i][44]) +
                (datosArticulos[0][29]*datosArticulos[i][45] + 
                datosArticulos[0][30]*datosArticulos[i][46] + 
                datosArticulos[0][31]*datosArticulos[i][47] + 
                datosArticulos[0][32]*datosArticulos[i][48]) +
                (datosArticulos[0][33]*datosArticulos[i][49] + 
                datosArticulos[0][34]*datosArticulos[i][50] + 
                datosArticulos[0][35]*datosArticulos[i][51] + 
                datosArticulos[0][36]*datosArticulos[i][52]) +
                (datosArticulos[0][37]*datosArticulos[i][19]); 
                datosArticulos[i][66] = 
                (!isNaN(datosArticulos[0][53]) && datosArticulos[0][53] !== 0 ? datosArticulos[0][13] * datosArticulos[i][53] / datosArticulos[0][53] : 0) +
                (!isNaN(datosArticulos[0][54]) && datosArticulos[0][54] !== 0 ? datosArticulos[0][14] * datosArticulos[i][54] / datosArticulos[0][54] : 0) +
                (!isNaN(datosArticulos[0][55]) && datosArticulos[0][55] !== 0 ? datosArticulos[0][15] * datosArticulos[i][55] / datosArticulos[0][55] : 0) +
                (!isNaN(datosArticulos[0][56]) && datosArticulos[0][56] !== 0 ? datosArticulos[0][16] * datosArticulos[i][56] / datosArticulos[0][56] : 0) +
                (!isNaN(datosArticulos[0][57]) && datosArticulos[0][57] !== 0 ? datosArticulos[0][17] * datosArticulos[i][57] / datosArticulos[0][57] : 0) +
                (!isNaN(datosArticulos[0][58]) && datosArticulos[0][58] !== 0 ? datosArticulos[0][18] * datosArticulos[i][58] / datosArticulos[0][58] : 0) +
                (!isNaN(datosArticulos[0][59]) && datosArticulos[0][59] !== 0 ? datosArticulos[0][19] * datosArticulos[i][59] / datosArticulos[0][59] : 0) +
                (!isNaN(datosArticulos[0][60]) && datosArticulos[0][60] !== 0 ? datosArticulos[0][20] * datosArticulos[i][60] / datosArticulos[0][60] : 0) +
                (!isNaN(datosArticulos[0][61]) && datosArticulos[0][61] !== 0 ? datosArticulos[0][21] * datosArticulos[i][61] / datosArticulos[0][61] : 0) +
                (!isNaN(datosArticulos[0][62]) && datosArticulos[0][62] !== 0 ? datosArticulos[0][22] * datosArticulos[i][62] / datosArticulos[0][62] : 0) +
                (!isNaN(datosArticulos[0][63]) && datosArticulos[0][63] !== 0 ? datosArticulos[0][23] * datosArticulos[i][63] / datosArticulos[0][63] : 0) +
                (!isNaN(datosArticulos[0][64]) && datosArticulos[0][64] !== 0 ? datosArticulos[0][24] * datosArticulos[i][64] / datosArticulos[0][64] : 0);
                datosArticulos[i][66] = (datosArticulos[i][17] > 0 ? datosArticulos[i][66]/datosArticulos[i][17] : 0);
                datosArticulos[i][67] = datosArticulos[i][40] + datosArticulos[i][65] + datosArticulos[i][66];
                datosArticulos[i][67] = Math.ceil(datosArticulos[i][67]);
                datosArticulos[i][68] = datosArticulos[i][17] * datosArticulos[i][67]; 
                datosArticulos[i][68] = Math.ceil(datosArticulos[i][68]); 
                datosArticulos[0][65] += datosArticulos[i][65];      
                datosArticulos[0][66] += datosArticulos[i][66];      
                datosArticulos[0][67] += datosArticulos[i][67];      
                datosArticulos[0][68] += datosArticulos[i][68]; 
                datosArticulos[i][0] =  `${datosArticulos[i][17]} ${datosArticulos[i][69]} ${datosArticulos[i][5]} 
                P.Unidad: ${datosArticulos[i][67]}€ P.Total: ${datosArticulos[i][68]}€`;
                datosArticulos[i][72] = datosArticulos[i][67] - datosArticulos[i][40] + datosArticulos[i][70];                
                datosArticulos[i][73] = datosArticulos[i][67] - datosArticulos[i][40] + datosArticulos[i][71];
                datosArticulos[0][72] += datosArticulos[i][72];      
                datosArticulos[0][73] += datosArticulos[i][73];
                datosArticulos[0][74] = datosArticulos[0][74] * datosArticulos[i][74];
            }
        }
        for (let i = 0; i < 80; i++) {  
            datosActivo[i] = datosArticulos[13][i];  
        } 
        actualizarDatosActivo();
    }  
    function obtenerPrecioPorRango(xmlDoc, tipoEstampacion, tamanoId, cantidad) {  
        if (cantidad <= 0) return 0;  
        const rangos = xmlDoc.querySelectorAll(`${tipoEstampacion} > tamano[id="${tamanoId}"] > rangoCantidad`);  
        for (const rango of rangos) {  
            const min = parseInt(rango.getAttribute('min'));  
            const max = parseInt(rango.getAttribute('max'));  
            if (cantidad >= min && cantidad <= max) {  
                return parseFloat(rango.getAttribute('precio'));  
            }  
        }  
        return 0;  
    }  
    function cargarPreciosBaseYPersonalizacion() {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', 'productos/precioEstampacion.xml', true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    const xmlDoc = xhr.responseXML;
                    for (let i = 1; i <= 4; i++) {
                        datosArticulos[0][12 + i] = obtenerPrecioBase(xmlDoc, 'grabado', i, 1) || 0;
                        datosArticulos[0][16 + i] = obtenerPrecioBase(xmlDoc, 'vinilo', i, 1) || 0;
                        datosArticulos[0][20 + i] = obtenerPrecioBase(xmlDoc, 'bordado', i, 1) || 0;
                    }
                    const personalizacionNode = xmlDoc.querySelector('personalizacion > rangoCantidad');
                    if (personalizacionNode) {
                        const precio = parseFloat(personalizacionNode.getAttribute('precio'));
                        datosArticulos[0][37] = isNaN(precio) ? 0 : precio; 
                    } else {
                        datosArticulos[0][37] = 0;
                    }
                    console.log('Precios base y personalización cargados en datosArticulos[0]');
                } else {
                    console.error('Error cargando precioEstampacion.xml:', xhr.status);
                }
            }
        };
        xhr.send();
    }
    function obtenerPrecioBase(xmlDoc, tipoEstampacion, tamanoId, cantidad) {
        if (cantidad <= 0) return 0;
        const tamano = xmlDoc.querySelector(`${tipoEstampacion} > tamano[id="${tamanoId}"]`);
        if (tamano) {
            return parseInt(tamano.getAttribute('base'));
        }
        return 0;
    } 
    function getRutaLogo(logoId) {  
        switch (logoId) {  
            case 1: return 'productos/logos/logo1.webp';  
            case 2: return 'productos/logos/logo2.webp';  
            case 3: return 'productos/logos/logo3.webp';  
            case 4: return 'productos/logos/logo4.webp';  
            case 5: return 'productos/logos/logoDorsal.webp';  
            case 6: return 'productos/logos/logoNombre.webp';  
            case 7: return 'productos/logos/logoNumero.webp';  
            default: return '';  
        }  
    }  
    function seleccionarLogo(logoId) {  
        console.log(`Logo seleccionado: ${logoId}`);
        document.querySelectorAll('.logo-img').forEach(logo => {
            logo.style.border = 'none';
        });
        const logoSeleccionado = document.querySelector(`.logo-img[data-id="${logoId}"]`);
        if (logoSeleccionado) {
            let colorBorde;
            if (estampacionActiva === "1") {
                colorBorde = 'red';
            } else if (estampacionActiva === "2") {
                colorBorde = 'green';
            } else if (estampacionActiva === "3") {
                colorBorde = 'blue';
            }
            logoSeleccionado.style.border = `2px solid ${colorBorde}`;
        }
    }   
    function importarPresupuesto() {  
        console.log("Importar presupuesto");  
    }  
    function guardarPresupuesto() {  
        console.log("Guardar presupuesto");  
    }  
    function aceptarElemento() {  
        if (!datosActivo[17] || datosActivo[17] <= 0) {
            actualizarInformacion("No se puede añadir un artículo sin unidades", false, null, true);
            setTimeout(() => {
                if (datosActivo[3]) { 
                    actualizarInformacion(datosActivo[0], true);
                } else {
                    inicializarInformacion();
                }
            }, 2000);
            return;
        }
        if (elementoActivo) {  
            const index = elementoActivo;  
            datosArticulos[index] = new Array(80).fill(0);  
            const elementoVisual = document.querySelector(`.articuloResultado[data-index="${index}"]`);  
            if (elementoVisual) {  
                elementoVisual.remove();  
            }  
            agregarArticulo();  
            elementoActivo = null;  
        } else {  
            agregarArticulo();  
        }   
    }
    function inicializarContenedorLocalizaciones() {
        const contenedor = document.getElementById('contenedorLocalizaciones');
        contenedor.innerHTML = '';
        const mensajeDiv = document.createElement('div');
        mensajeDiv.classList.add('mensaje-container');
        const mensaje = document.createElement('p');
        mensaje.innerHTML = `
            <u>Para calcular un presupuesto:</u> <br>
            <span style='color:red'>*</span> No necesita cargar su logo aún. <br>
            <span style='color:red'>*</span> No importan las tallas exactas aún, sólo la cantidad total.<br>
            <span style='color:red'>*</span> Comprobar que el artículo se fabrica en los colores y tallas adecuados.<br>
            <span style='color:red'>*</span> Usar [Grabado] para colores normales.<br>
            <span style='color:red'>*</span> Usar [Vinilo] para colores flúor o metálicos.<br>
            <span style='color:red'>*</span> Bordado: incluye precio programa picaje estándar, podría necesitar ajustes según complejidad.<br>
            <span style='color:red'>*</span> Una estampación <b><u><span style='color:red'>ENORME*</span></u></b> es más GRANDE y más CARA de lo normal.
        `;
        mensajeDiv.appendChild(mensaje);
        contenedor.appendChild(mensajeDiv);
    }
    document.addEventListener('DOMContentLoaded', () => {  
        inicializarDatosArticulos();  
        datosActivo = new Array(80).fill(0);
        cargarCategorias();  
        inicializarTallas();  
        inicializarInformacion();   
        cargarLogos();   
        actualizarColoresBotonesEstampacion(); 
        cargarPreciosBaseYPersonalizacion(); 
        cargarInfoZonas();
        inicializarHoverInformacion();
        inicializarContenedorLocalizaciones();
        actualizarResumen();
    });
    function cargarCategorias() {  
        const contenedor = document.getElementById('contenedorCategorias');  
        const categorias = obtenerCategorias();  
        categorias.forEach(categoria => {  
            const imgCategoria = document.createElement('img');  
            imgCategoria.src = categoria.imagen;  
            imgCategoria.alt = categoria.nombre;  
            imgCategoria.setAttribute('data-id', categoria.id);  
            imgCategoria.onclick = function() {  
                seleccionPrenda(this, 'categoria');  
            };  
            contenedor.appendChild(imgCategoria);  
        });  
    }  
    function actualizarColoresBotonesEstampacion() {  
        const grabadoBtn = document.getElementById('grabadoBtn');  
        const viniloBtn = document.getElementById('viniloBtn');  
        const bordadoBtn = document.getElementById('bordadoBtn');  
        grabadoBtn.className = 'btn-grabado';
        viniloBtn.className = 'btn-vinilo';
        bordadoBtn.className = 'btn-bordado';
        if (estampacionActiva === "1") {  
            viniloBtn.classList.add('btn-inactivo');  
            bordadoBtn.classList.add('btn-inactivo');  
        } else if (estampacionActiva === "2") {  
            grabadoBtn.classList.add('btn-inactivo');  
            bordadoBtn.classList.add('btn-inactivo');  
        } else if (estampacionActiva === "3") {  
            grabadoBtn.classList.add('btn-inactivo');  
            viniloBtn.classList.add('btn-inactivo');  
        }  
        actualizarBordesLocalizaciones();  
    }
    let colorOriginal = true;
    let intervaloBordes = null;
    function actualizarBordesLocalizaciones() {
        const localizaciones = document.querySelectorAll('.localizacion');
        if (intervaloBordes) {
            clearInterval(intervaloBordes);
            intervaloBordes = null;
        }
        document.body.classList.toggle('modo-colocacion', modoColocacion === 1);
        document.body.classList.remove('modo-grabado', 'modo-vinilo', 'modo-bordado');
        if (modoColocacion === 1) {
            if (estampacionActiva === "1") {
                document.body.classList.add('modo-grabado');
            } else if (estampacionActiva === "2") {
                document.body.classList.add('modo-vinilo');
            } else if (estampacionActiva === "3") {
                document.body.classList.add('modo-bordado');
            }
        }
        localizaciones.forEach(localizacion => {
            const zona = localizacion.getAttribute('data-zona');
            localizacion.classList.remove(
                'estampacion-grabado', 
                'estampacion-vinilo', 
                'estampacion-bordado',
                'colocable',
                'no-colocable'
            );
            if (localizacionesOcupadas[zona]) {
                const tipoEstampacion = localizacionesOcupadas[zona][0];
                if (tipoEstampacion === 1) {
                    localizacion.classList.add('estampacion-grabado');
                } else if (tipoEstampacion === 2) {
                    localizacion.classList.add('estampacion-vinilo');
                } else if (tipoEstampacion === 3) {
                    localizacion.classList.add('estampacion-bordado');
                }
            } else if (modoColocacion === 1) {
                const sePuedeColocar = !verificarZonasIncompatibles(zona).length;
                if (sePuedeColocar) {
                    localizacion.classList.add('colocable');
                } else {
                    localizacion.classList.add('no-colocable');
                }
            }
        });
    }
    function seleccionarEstampacion(valor) {  
        estampacionActiva = valor;  
        actualizarColoresBotonesEstampacion();
        const logoSeleccionado = document.querySelector('.logo-img[style*="border"]');
        if (logoSeleccionado) {
            let colorBorde;
            if (estampacionActiva === "1") {
                colorBorde = 'red';
            } else if (estampacionActiva === "2") {
                colorBorde = 'green';
            } else if (estampacionActiva === "3") {
                colorBorde = 'blue';
            }
            logoSeleccionado.style.border = `2px solid ${colorBorde}`;
        }
    }  
    function obtenerPrecioArticulo(categoriaId, articuloId) {  
        if (!categoriaId || !articuloId) return 10;  
        let precio = 10;  
        let xhr = new XMLHttpRequest();  
        xhr.open('GET', `productos/${categoriaId}.xml`, false);  
        xhr.send();  
        if (xhr.status === 200) {  
            let xmlDoc = xhr.responseXML;  
            let precioElement = xmlDoc.querySelector(`articulo[id="${articuloId}"] > precio`);  
            if (precioElement && precioElement.textContent) {  
                precio = parseFloat(precioElement.textContent);  
            }  
        }  
        return precio;  
    }       
    function cargarElementoSeleccionado(elemento) {  
        const elementIndex = parseInt(elemento.getAttribute('data-index'));  
        if (!elementIndex || !datosArticulos[elementIndex] || datosArticulos[elementIndex][0] === 0) {  
            return;  
        }  
        const tempDatos = [];
        for (let i = 0; i < 80; i++) {
            tempDatos[i] = datosArticulos[elementIndex][i];
        }
        datosArticulos[elementIndex] = new Array(80).fill(0);
        elemento.remove();
        reiniciarVariables();  
        for (let i = 0; i < 80; i++) {
            datosActivo[i] = tempDatos[i];
            datosArticulos[13][i] = tempDatos[i];
        }
        const categoriaId = datosActivo[1];  
        const productoId = datosActivo[2];  
        const articuloId = datosActivo[3];
        const colorCodigo = datosActivo[4];
        categoriaActiva = categoriaId;
        productoActivo = productoId;
        articuloActivo = articuloId;
        const categorias = document.querySelectorAll('#contenedorCategorias img');  
        let categoriaEncontrada = false;
        categorias.forEach(cat => {  
            if (cat.getAttribute('data-id') === categoriaId) {  
                cat.classList.add('seleccionado');  
                cargarProductos(categoriaId);
                categoriaEncontrada = true;  
            }  
        });
        if (!categoriaEncontrada) {
            console.error("No se encontró la categoría:", categoriaId);
            return;
        }
        setTimeout(() => {  
            const productos = document.querySelectorAll('#contenedorProductosArticulos img');  
            let productoEncontrado = false;
            productos.forEach(prod => {  
                if (prod.getAttribute('data-id') === productoId) {  
                    prod.classList.add('seleccionado');  
                    cargarArticulos(productoId);  
                    cargarPlantilla(productoId);
                    productoEncontrado = true;  
                }  
            });
            if (!productoEncontrado) {
                console.error("No se encontró el producto:", productoId);
                return;
            }
            setTimeout(() => {  
                const articulos = document.querySelectorAll('#contenedorProductosArticulos img');  
                let articuloEncontrado = false;
                articulos.forEach(art => {  
                    if (art.getAttribute('data-id') === articuloId) {  
                        art.classList.add('seleccionado');  
                        cargarColores(articuloId);  
                        cargarTallas(articuloId);  
                        actualizarInformacion(`Artículo: ${art.alt || articuloId}`);
                        articuloEncontrado = true;  
                    }  
                });
                if (!articuloEncontrado) {
                    console.error("No se encontró el artículo:", articuloId);
                    return;
                }
                for (let i = 0; i < 80; i++) {
                    datosActivo[i] = tempDatos[i];
                    datosArticulos[13][i] = tempDatos[i];
                }
                setTimeout(() => {  
                    const colores = document.querySelectorAll('#contenedorColores div');  
                    let colorEncontrado = false;
                    colores.forEach(color => {  
                        if (color.getAttribute('data-color') === colorCodigo) {  
                            color.classList.add('seleccionado');  
                            if (colorActivo) {
                                colorActivo.style.backgroundColor = colorCodigo;
                            }
                            actualizarTallasDisponibles(  
                                color.getAttribute('data-infantil') === "1",  
                                color.getAttribute('data-grande') === "1"  
                            );
                            colorEncontrado = true;
                        }  
                    });
                    if (!colorEncontrado) {
                        console.error("No se encontró el color:", colorCodigo);
                    }
                    for (let i = 0; i < 80; i++) {
                        datosActivo[i] = tempDatos[i];
                        datosArticulos[13][i] = tempDatos[i];
                    }
                    const tallasPosicion = {"4XS": 6, "3XS": 7, "2XS": 8, "XS": 9, "S": 10, "M": 11, "L": 12, "XL": 13, "2XL": 14, "3XL": 15, "4XL": 16};
                    const elementosInput = document.querySelectorAll('.talla-cantidad');  
                    elementosInput.forEach(input => {  
                        const talla = input.getAttribute('data-talla');  
                        if (tallasPosicion[talla] !== undefined && !input.disabled) {  
                            input.value = datosActivo[tallasPosicion[talla]] || 0;  
                        }  
                    });
                    localizacionesOcupadas = {};  
                    for (let i = 20; i <= 39; i++) {  
                        if (datosActivo[i] && datosActivo[i] !== 0) {  
                            const zona = i - 20;  
                            const logoData = String(datosActivo[i]).split(',').map(val => parseInt(val));  
                            localizacionesOcupadas[zona] = logoData;  
                            const localizacion = document.querySelector(`.localizacion[data-zona="${zona}"]`);  
                            if (localizacion) {  
                                const tipoEstampacion = logoData[0];  
                                const logoId = logoData[2];  
                                if (!estampacionActiva || estampacionActiva !== tipoEstampacion.toString()) {  
                                    estampacionActiva = tipoEstampacion.toString();  
                                    actualizarColoresBotonesEstampacion();  
                                }  
                                const imgLogo = document.createElement('img');  
                                imgLogo.src = getRutaLogo(logoId);  
                                imgLogo.className = 'logo-ubicado';  
                                const cruzEliminar = document.createElement('div');  
                                cruzEliminar.className = 'cruz-eliminar';  
                                cruzEliminar.innerHTML = '✕';  
                                localizacion.innerHTML = '';  
                                localizacion.appendChild(imgLogo);  
                                localizacion.appendChild(cruzEliminar);  
                                cruzEliminar.addEventListener('click', function(e) {  
                                    e.stopPropagation();  
                                    localizacion.innerHTML = '';  
                                    delete localizacionesOcupadas[zona];  
                                    datosActivo[20 + parseInt(zona)] = 0;
                                    datosArticulos[13][20 + parseInt(zona)] = 0;
                                    actualizarLocalizacionesDisponibles();  
                                    actualizarBordesLocalizaciones();  
                                    actualizarEstampacionParcial();  
                                });  
                            }  
                        }  
                    }  
                    actualizarLocalizacionesDisponibles();  
                    actualizarBordesLocalizaciones();
                    actualizarEstampacionParcial();
                    actualizarInformacion(`Editando: ${datosActivo[69]} - ${datosActivo[5]}`);
                    actualizarResumen();
                }, 150);  
            }, 150);  
        }, 150);  
    }
function actualizarResumen() {  
    const contenedorResumen = document.getElementById('contenedorResumen');  
    contenedorResumen.innerHTML = '';  
    const articulos = document.querySelectorAll('.articuloResultado');  

    if (modoPrueba !== 1 && articulos.length === 0) {  
        const mensajeVacio = document.createElement('div');  
        mensajeVacio.className = 'resumen-vacio';
        mensajeVacio.textContent = 'Presupuesto vacío';
        contenedorResumen.appendChild(mensajeVacio);
        return; 
    }  

    if (modoPrueba === 1) {  
        const resumenContenido = document.createElement('div');  
        resumenContenido.className = 'resumen resumen-prueba';
        const datosGlobales = document.createElement('div');  
        const tabla = document.createElement('table');  
        tabla.className = 'tabla-resumen';

        const filaIndices = document.createElement('tr');  
        const celdaVacia = document.createElement('th');  
        celdaVacia.textContent = 'Array';
        filaIndices.appendChild(celdaVacia);
        for (let i = 0; i < 80; i++) {  
            const celda = document.createElement('th');  
            celda.textContent = i;
            filaIndices.appendChild(celda);
        }  
        tabla.appendChild(filaIndices);

        const filaGlobal = document.createElement('tr');  
        const celdaGlobal = document.createElement('td');  
        celdaGlobal.className = 'celda-titulo';
        celdaGlobal.textContent = 'Global';
        filaGlobal.appendChild(celdaGlobal);
        for (let i = 0; i < 80; i++) {  
            const celda = document.createElement('td');  
            celda.textContent = datosArticulos[0][i] ?? '';
            filaGlobal.appendChild(celda);
        }  
        tabla.appendChild(filaGlobal);

        for (let j = 1; j <= 13; j++) {  
            if (j === 13 || datosArticulos[j][0] !== 0) {
                const filaElemento = document.createElement('tr');  
                const celdaElemento = document.createElement('td');  
                celdaElemento.className = 'celda-titulo';
                celdaElemento.textContent = `Elemento ${j}`;
                filaElemento.appendChild(celdaElemento);
                for (let i = 0; i < 80; i++) {  
                    const celda = document.createElement('td');  
                    celda.textContent = datosArticulos[j][i] ?? '';
                    filaElemento.appendChild(celda);
                }  
                tabla.appendChild(filaElemento);
            }  
        }  

        datosGlobales.appendChild(tabla);
        resumenContenido.appendChild(datosGlobales);
        contenedorResumen.appendChild(resumenContenido);  
        return;
    } 

    // --- Resumen normal ---
    const resumenContenido = document.createElement('div');
    resumenContenido.className = 'resumen resumen-contenido';

    const tituloResumen = document.createElement('div');
    tituloResumen.className = 'titulo-resumen';

    const totalPedidoLabel = document.createElement('span');
    totalPedidoLabel.textContent = 'Total: ';
    totalPedidoLabel.className = 'resumen-label';
    tituloResumen.appendChild(totalPedidoLabel);

    const totalPedidoValor = document.createElement('span');
    totalPedidoValor.innerHTML = `${datosArticulos[0][68]}€<span class="espacios">&nbsp;</span>`;
    totalPedidoValor.className = 'resumen-valor';
    tituloResumen.appendChild(totalPedidoValor);

    const equipacionLabel = document.createElement('span');
    equipacionLabel.textContent = 'Equipación: ';
    equipacionLabel.className = 'resumen-label';
    tituloResumen.appendChild(equipacionLabel);

    const equipacionValor = document.createElement('span');
    equipacionValor.textContent = datosArticulos[0][67] + '€';
    equipacionValor.className = 'resumen-valor';
    tituloResumen.appendChild(equipacionValor);

    if (datosArticulos[0][74] > 0) {
        const combinaciones = document.createElement('span');
        combinaciones.className = 'resumen-opciones';
        combinaciones.innerHTML = `(Tienes otras <span class="resumen-valor">${datosArticulos[0][74]}</span> combinaciones de <span class="resumen-valor">${datosArticulos[0][72]}€</span> a <span class="resumen-valor">${datosArticulos[0][73]}€</span>)`;
        tituloResumen.appendChild(combinaciones);
    }
    const explicacion = document.createElement('span');
    explicacion.className = 'resumen-explicacion';
    explicacion.innerHTML = 'IVA incluido<span class="resumen-envio"> - Envío gratuito para pedidos superiores a </span>100€';
    tituloResumen.appendChild(explicacion);
    
    resumenContenido.appendChild(tituloResumen);

    const elementosContainer = document.createElement('div');
    elementosContainer.className = 'resumen-elementos';

    for (let i = 1; i <= 12; i++) {
        if (datosArticulos[i][0]) {
            const elementoResumen = document.createElement('div');
            elementoResumen.className = 'elemento-resumen';
            elementoResumen.style.whiteSpace = 'nowrap';
            elementoResumen.style.display = 'block';
            elementoResumen.style.marginBottom = '2px';

            const espacio = () => document.createTextNode('\u00A0'.repeat(1));

            const cantidad = document.createElement('span');
            cantidad.className = 'resumen-valor';
            cantidad.style.color = 'red';
            cantidad.textContent = datosArticulos[i][17] || 0;

            const descripcion = document.createElement('span');
            descripcion.className = 'resumen-texto';
            const nombre = datosArticulos[i][69] || '';
            const color = datosArticulos[i][5] || '';
            descripcion.textContent = `${nombre} ${color}`;

            const precioUnidad = document.createElement('span');
            precioUnidad.className = 'resumen-bloque';
            precioUnidad.style.marginLeft = '2px';
            precioUnidad.innerHTML = `P.Unidad: <span class="resumen-valor" style="color:red;">${datosArticulos[i][67] || 0}€</span>`;

/*             const precioTotal = document.createElement('span');
            precioTotal.className = 'resumen-bloque';
            precioTotal.style.marginLeft = '2px';
            precioTotal.innerHTML = `P.Total: <span class="resumen-valor" style="color:red;">${datosArticulos[i][68] || 0}€</span>`; */

            elementoResumen.appendChild(cantidad);
            elementoResumen.appendChild(espacio());
            elementoResumen.appendChild(descripcion);
            elementoResumen.appendChild(espacio());
            elementoResumen.appendChild(precioUnidad);
/*             elementoResumen.appendChild(espacio());
            elementoResumen.appendChild(precioTotal); */

/*             if (datosArticulos[i][75]) {
                elementoResumen.appendChild(espacio());
                const contenedorEstrellas = document.createElement('span');
                contenedorEstrellas.className = 'contenedorEstrellas';
                contenedorEstrellas.style.lineHeight = '1';
                contenedorEstrellas.style.marginLeft = '2px';
                for (let j = 0; j < 5; j++) {
                    const estrella = document.createElement('span');
                    estrella.textContent = '★';
                    estrella.style.marginRight = '1px';
                    estrella.className = (
                        (datosArticulos[i][75] === 'promo' && j === 0) ||
                        (datosArticulos[i][75] === 'básica' && j <= 1) ||
                        (datosArticulos[i][75] === 'top' && j <= 2) ||
                        (datosArticulos[i][75] === 'premium' && j <= 3) ||
                        (datosArticulos[i][75] === 'extrapremium')
                    ) ? 'estrella estrella-dorada' : 'estrella estrella-gris';
                    contenedorEstrellas.appendChild(estrella);
                }
                elementoResumen.appendChild(contenedorEstrellas);
            } */

            elementosContainer.appendChild(elementoResumen);
        }
    }

    resumenContenido.appendChild(elementosContainer);
    contenedorResumen.appendChild(resumenContenido);
}



function cargarDatosArticulo(articuloId, categoriaId) {
    if (!articuloId || !categoriaId) return;
    let xhr = new XMLHttpRequest();
    xhr.open('GET', `productos/${categoriaId}.xml`, false);
    xhr.send();
    if (xhr.status === 200) {
        let xmlDoc = xhr.responseXML;
        let articulo = xmlDoc.querySelector(`articulo[id="${articuloId}"]`);
        if (articulo) {
            let precioElement = articulo.querySelector('precio');
            if (precioElement && precioElement.textContent) {
                datosActivo[40] = parseFloat(precioElement.textContent);
            }
            let nombreElement = articulo.querySelector('nombre');
            if (nombreElement && nombreElement.textContent) {
                datosActivo[69] = nombreElement.textContent;
            }
            let nivelElement = articulo.querySelector('nivel');
            if (nivelElement && nivelElement.textContent) {
                datosActivo[75] = nivelElement.textContent.toLowerCase();
            }
        }
    }
}
    function actualizarDatosActivo() {
        const cantidadTotal = datosActivo[17] || 0;
        const nombreArticulo = datosActivo[69] || '';
        const colorNombre = datosActivo[5] || '';
        const precioUnidad = datosActivo[67] || '';
        const precioTotal = datosActivo[68] || '';
        datosActivo[0] = `${cantidadTotal} ${nombreArticulo} ${colorNombre} 
        / P.Unidad: ${precioUnidad}€ - P.Total: ${precioTotal}€`;
        for (let i = 0; i < 80; i++) {
            datosArticulos[13][i] = datosActivo[i];
        }
        if (datosActivo[17] > 0 && datosActivo[69]) {
            actualizarInformacion(datosActivo[0]);
        }
        actualizarResumen();
    }
    document.addEventListener('DOMContentLoaded', function() {
        const grabadoBtn = document.getElementById('grabadoBtn');
        grabadoBtn.setAttribute('info', 'Selecciona tipo de estampación:<span style="color: red; font-weight: bold; margin-left: 5px;">Grabado</span>');
        const viniloBtn = document.getElementById('viniloBtn');
        viniloBtn.setAttribute('info', 'Selecciona tipo de estampación:<span style="color: green; font-weight: bold; margin-left: 5px;">Vinilo</span>');
        const bordadoBtn = document.getElementById('bordadoBtn');
        bordadoBtn.setAttribute('info', 'Selecciona tipo de estampación:<span style="color: blue; font-weight: bold; margin-left: 5px;">Bordado</span>');
    });
    window.addEventListener('load', function() {
        if (document.readyState === 'complete') {
            cargarPreciosBaseYPersonalizacion();
        }
    }); 


function agregarArticulo() {  
    if (!datosActivo[0]) {  
        alert("No hay datos de artículo para agregar");  
        return;  
    }  
    const contenedorElementos = document.getElementById('contenedorElementos');  
    if (contenedorElementos.querySelectorAll('.articuloResultado').length >= 13) {  
        alert("Límite de 13 artículos alcanzado. Por favor, elimine alguno para continuar.");  
        return;  
    }  
    let elementIndex = 0;  
    for (let i = 1; i <= 12; i++) {  
        if (datosArticulos[i][0] === 0) {  
            elementIndex = i;  
            break;  
        }  
    }  
    if (elementIndex === 0) {  
        alert("No hay más espacio disponible en el array de datos");  
        return;  
    }  
    for (let i = 0; i < 80; i++) {  
        datosArticulos[elementIndex][i] = datosActivo[i];  
    }  
    const articuloNombre = datosActivo[69] || 'Artículo';  
    const colorNombre = datosActivo[5] || 'Color';  
    const colorCodigo = datosActivo[4] || '#FFFFFF';  
    const productoId = datosActivo[2];  
    const precioUnitario = datosActivo[67] || 0;  
    const precioTotal = datosActivo[68] || 0;  

    const articuloResultado = document.createElement('div');  
    articuloResultado.className = 'articuloResultado';  
    articuloResultado.setAttribute('data-index', elementIndex);  
    articuloResultado.onclick = function() {  
        cargarElementoSeleccionado(this);  
    };  

    const clonLocalizacion = document.createElement('div');  
    clonLocalizacion.className = 'clonLocalizacion';  
    const colorFondo = document.createElement('div');  
    colorFondo.className = 'colorFondo';  
    colorFondo.style.backgroundColor = colorCodigo;  
    clonLocalizacion.appendChild(colorFondo);  
    const rutaPlantilla = obtenerRutaPlantilla(productoId);  
    const plantilla = document.createElement('img');  
    plantilla.className = 'plantillaImg';  
    plantilla.src = rutaPlantilla;  
    clonLocalizacion.appendChild(plantilla);  
    for (let i = 20; i <= 39; i++) {  
        if (datosActivo[i] && datosActivo[i] !== 0) {  
            const zona = i - 20;  
            const logoData = String(datosActivo[i]).split(',').map(val => parseInt(val));  
            const tipoEstampacion = logoData[0];  
            const logoId = logoData[2];  
            let xhr = new XMLHttpRequest();  
            xhr.open('GET', 'productos/productos.xml', false);  
            xhr.send();  
            if (xhr.status === 200) {  
                const xmlDoc = xhr.responseXML;  
                const zonaConfig = xmlDoc.querySelector(`configuracion > zonas-id > zona[id="${zona}"]`);  
                if (zonaConfig) {  
                    const logoContainer = document.createElement('div');  
                    logoContainer.className = `logoContainer tipo-${tipoEstampacion}`;  
                    logoContainer.style.top = zonaConfig.getAttribute('top');  
                    logoContainer.style.left = zonaConfig.getAttribute('left');  
                    logoContainer.style.width = zonaConfig.getAttribute('width');  
                    logoContainer.style.height = zonaConfig.getAttribute('height');  
                    logoContainer.style.zIndex = zonaConfig.getAttribute('z-index');  
                    const imgLogo = document.createElement('img');  
                    imgLogo.className = 'logoImg';  
                    imgLogo.src = getRutaLogo(logoId);  
                    logoContainer.appendChild(imgLogo);  
                    clonLocalizacion.appendChild(logoContainer);  
                }  
            }  
        }  
    }  

    const clonDesglose = document.createElement('div');  
    clonDesglose.className = 'clonDesglose';  

    const clonResumenElemento = document.createElement('div');  
    clonResumenElemento.className = 'clonResumenElemento';  
    const totalUnidades = document.createElement('span');  
    totalUnidades.className = 'totalUnidades';  
    totalUnidades.textContent = `${datosActivo[17]}`;  
    const titulo = document.createElement('div');  
    titulo.className = 'tituloArticulo';  
    titulo.textContent = `${articuloNombre} - ${colorNombre}`;  
    if (datosActivo[75]) {  
        const contenedorEstrellas = document.createElement('span');  
        contenedorEstrellas.className = 'contenedorEstrellas';  
        for (let i = 0; i < 5; i++) {  
            const estrella = document.createElement('span');  
            estrella.textContent = '★';  
            const tipo = datosActivo[75];  
            const esDorada =  
                (tipo === 'promo' && i === 0) ||  
                (tipo === 'básica' && i <= 1) ||  
                (tipo === 'top' && i <= 2) ||  
                (tipo === 'premium' && i <= 3) ||  
                (tipo === 'extrapremium');  
            estrella.className = esDorada ? 'estrella estrella-dorada' : 'estrella estrella-gris';  
            contenedorEstrellas.appendChild(estrella);  
        }  
        titulo.appendChild(contenedorEstrellas);  
    }  
    const precioInfo = document.createElement('span');  
    precioInfo.className = 'precioInfo';  
    precioInfo.innerHTML = `<b>P.Unidad: <span class="precioValor">${precioUnitario}€</span></b>`;
/* | Total: <span class="precioValor">${precioTotal}€</span> // Comentado por mandato */  
    clonResumenElemento.appendChild(totalUnidades);  
    clonResumenElemento.appendChild(titulo);  
    clonResumenElemento.appendChild(precioInfo);  

    const clonTallas = document.createElement('div');  
    clonTallas.className = 'clonTallas';  
    const todasLasTallas = ['4XS', '3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];  
    const tallasPosicion = {"4XS": 6, "3XS": 7, "2XS": 8, "XS": 9, "S": 10, "M": 11, "L": 12, "XL": 13, "2XL": 14, "3XL": 15, "4XL": 16};  
    todasLasTallas.forEach(talla => {  
        const tallaContainer = document.createElement('div');  
        tallaContainer.className = 'tallaContainer';  
        const tallaLabel = document.createElement('div');  
        tallaLabel.className = 'tallaLabel';  
        tallaLabel.textContent = talla;  
        const cantidadTalla = document.createElement('div');  
        cantidadTalla.className = 'cantidadTalla';  
        const indice = tallasPosicion[talla];  
        cantidadTalla.textContent = indice && datosActivo[indice] > 0 ? datosActivo[indice] : '';  
        tallaContainer.appendChild(tallaLabel);  
        tallaContainer.appendChild(cantidadTalla);  
        clonTallas.appendChild(tallaContainer);  
    });  

    const clonDesgloseEstampacion = document.createElement('div');  
    clonDesgloseEstampacion.className = 'clonDesgloseEstampacion';  
    let textoLogos = `${datosActivo[18] || 0} Logos: `;  
    const logosTextos = [];  
    if (datosActivo[41] > 0) logosTextos.push(`${datosActivo[41]}Grab.Pequeña`);  
    if (datosActivo[42] > 0) logosTextos.push(`${datosActivo[42]}Grab.Mediana`);  
    if (datosActivo[43] > 0) logosTextos.push(`${datosActivo[43]}Grab.Grande`);  
    if (datosActivo[44] > 0) logosTextos.push(`${datosActivo[44]}<u><b class="logoEnorme">Grab.ENORME*</b></u>`);  
    if (datosActivo[45] > 0) logosTextos.push(`${datosActivo[45]}Vin.Pequeño`);  
    if (datosActivo[46] > 0) logosTextos.push(`${datosActivo[46]}Vin.Mediano`);  
    if (datosActivo[47] > 0) logosTextos.push(`${datosActivo[47]}Vin.Grande`);  
    if (datosActivo[48] > 0) logosTextos.push(`${datosActivo[48]}<u><b class="logoEnorme">Vin.ENORME*</b></u>`);  
    if (datosActivo[49] > 0) logosTextos.push(`${datosActivo[49]}Bord.Pequeño`);  
    if (datosActivo[50] > 0) logosTextos.push(`${datosActivo[50]}Bord.Mediano`);  
    if (datosActivo[51] > 0) logosTextos.push(`${datosActivo[51]}Bord.Grande`);  
    if (datosActivo[52] > 0) logosTextos.push(`${datosActivo[52]}<u><b class="logoEnorme">Bord.ENORME*</b></u>`);  
    if (datosActivo[19] > 0) logosTextos.push(`${datosActivo[19]}Pers`);  
    clonDesgloseEstampacion.innerHTML = textoLogos + logosTextos.join(', ');  

    clonDesglose.appendChild(clonResumenElemento);  
    clonDesglose.appendChild(clonTallas);  
    clonDesglose.appendChild(clonDesgloseEstampacion);  

    const btnEliminar = document.createElement('div');  
    btnEliminar.className = 'btnEliminar';  
    btnEliminar.innerHTML = '✕';  
    btnEliminar.onclick = function(e) {  
        e.stopPropagation();  
        const elementIndex = parseInt(articuloResultado.getAttribute('data-index'));  
        if (elementIndex) {  
            datosArticulos[elementIndex] = new Array(80).fill(0);  
        }  
        articuloResultado.remove();  
        actualizarResumen();  
        actualizarEstampacionTotal();  
    };  

    articuloResultado.style.display = 'flex';
    articuloResultado.style.flexWrap = 'wrap';

    clonDesglose.removeChild(clonTallas);
    clonDesglose.removeChild(clonDesgloseEstampacion);
    clonDesglose.style.flexBasis = '100%';

    const derecha = document.createElement('div');
    derecha.style.display = 'flex';
    derecha.style.flexDirection = 'column';
    derecha.style.flex = '0 0 70%';

    const refLoc = document.getElementById('contenedorLocalizaciones');
    if (refLoc) {
        const rect = refLoc.getBoundingClientRect();
        const rw = rect.width || refLoc.clientWidth || 1;
        const rh = rect.height || refLoc.clientHeight || 1;
        const ratio = rh / rw;
        clonLocalizacion.style.flex = '0 0 30%';
        clonLocalizacion.style.position = 'relative';
        clonLocalizacion.style.aspectRatio = `${rw} / ${rh}`;
        const ajustarAltura = () => {
            const w = clonLocalizacion.getBoundingClientRect().width || 0;
            if (!('aspectRatio' in document.documentElement.style)) {
                clonLocalizacion.style.height = (w * ratio) + '%';
            } else {
                clonLocalizacion.style.height = 'auto';
            }
        };
        ajustarAltura();
        window.addEventListener('resize', ajustarAltura);
    } else {
        clonLocalizacion.style.flex = '0 0 30%';
        clonLocalizacion.style.position = 'relative';
    }

    derecha.appendChild(clonTallas);
    derecha.appendChild(clonDesgloseEstampacion);

    articuloResultado.appendChild(clonDesglose);
    articuloResultado.appendChild(clonLocalizacion);
    articuloResultado.appendChild(derecha);
    articuloResultado.appendChild(btnEliminar);
    const btnEditar = document.createElement('div');
    btnEditar.className = 'btnEditar';
    articuloResultado.appendChild(btnEditar);

    contenedorElementos.appendChild(articuloResultado);  
    contenedorElementos.scrollTop = contenedorElementos.scrollHeight;  
    datosArticulos[13] = new Array(80).fill(0);  
    datosActivo = new Array(80).fill(0);  
    actualizarResumen();  
    actualizarEstampacionTotal();  
    actualizarInformacion("Artículo añadido correctamente");  
    setTimeout(() => inicializarInformacion(), 2000);  
    reiniciarVariables();  
    return elementIndex;  
}


    function inicializarHoverInformacion() {
        document.querySelectorAll('#contenedorCategorias img').forEach(img => {
            img.addEventListener('mouseenter', function() {
                actualizarInformacion(`Mostrar ${this.alt}`);
            });
            img.addEventListener('mouseleave', function() {
                if (datosActivo[3]) {
                    actualizarInformacion(datosActivo[0], true);
                } else {
                    inicializarInformacion();
                }
            });
        });
        document.getElementById('contenedorProductosArticulos').addEventListener('mouseover', function(e) {
            if (e.target.tagName === 'IMG') {
                const articuloId = e.target.getAttribute('data-id');
                const esArticulo = articuloId && productoActivo && 
                                document.querySelectorAll('#contenedorProductosArticulos img').length > 1;
                if (esArticulo) {
                    actualizarInformacion(`Seleccionar ${e.target.alt || articuloId}`, true, articuloId);
                } else {
                    actualizarInformacion(`Mostrar ${e.target.alt || articuloId}`);
                }
            }
        });           
        document.getElementById('contenedorProductosArticulos').addEventListener('mouseout', function(e) {
            if (e.target.tagName === 'IMG') {
                if (datosActivo[3]) { 
                    actualizarInformacion(datosActivo[0], true);
                } else {
                    inicializarInformacion();
                }
            }
        });
        document.querySelectorAll('.logo-img').forEach(logo => {
            logo.addEventListener('mouseenter', function() {
                let tipoEstampacion = '';
                if (estampacionActiva === "1") tipoEstampacion = "Grabado";
                else if (estampacionActiva === "2") tipoEstampacion = "Vinilo";
                else if (estampacionActiva === "3") tipoEstampacion = "Bordado";
                actualizarInformacion(`Seleccionar logo (Estampación actual: ${tipoEstampacion})`);
            });
            logo.addEventListener('mouseleave', function() {
                if (datosActivo[3]) { 
                    actualizarInformacion(datosActivo[0], true);
                } else {
                    inicializarInformacion();
                }
            });
        });
        document.addEventListener('mouseover', function(e) {
            let localizacion = null;
            if (e.target.classList.contains('localizacion')) {
                localizacion = e.target;
            } else if (e.target.parentElement && e.target.parentElement.classList.contains('localizacion')) {
                localizacion = e.target.parentElement;
            }
            if (localizacion) {
                const zonaId = localizacion.getAttribute('data-zona');
                if (zonaId && (localizacionesOcupadas[zonaId] || modoColocacion === 1)) {
                    const infoZona = zonasInfo[zonaId] || { 
                        nombre: 'Zona ' + zonaId, 
                        descripcion: 'Ubicación para logo o personalización' 
                    };
                    let descripcion = infoZona.descripcion;
                    if (descripcion.includes('ENORME')) {
                        descripcion = descripcion.replace(/([ ]*)ENORME([ ]*)/g, function(match, spaceBefore, spaceAfter) {
                            return spaceBefore + '<b><u><span style="color:red">ENORME*</span></u></b>' + spaceAfter;
                        });
                    }
                    actualizarInformacion(descripcion, false, null, true);
                }
            }
        });           
        document.addEventListener('mouseout', function(e) {
            if (e.target.classList.contains('localizacion')) {
                if (datosActivo[3]) { 
                    actualizarInformacion(datosActivo[0], true);
                } else {
                    inicializarInformacion();
                }
            }
        });
        document.getElementById('contenedorColores').addEventListener('mouseover', function(e) {
            if (e.target.hasAttribute && e.target.hasAttribute('data-color')) {
                const colorNombre = e.target.getAttribute('data-nombre');
                const colorCodigo = e.target.getAttribute('data-color');
                actualizarInformacion(`Color: ${colorNombre} (${colorCodigo})`);
            }
        });
        document.getElementById('contenedorColores').addEventListener('mouseout', function(e) {
            if (e.target.hasAttribute && e.target.hasAttribute('data-color')) {
                if (datosActivo[3]) { 
                    actualizarInformacion(datosActivo[0], true);
                } else {
                    inicializarInformacion();
                }
            }
        });
        document.querySelectorAll('#contenedorBotones button').forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                const info = this.getAttribute('info') || this.textContent;
                const contieneHTML = info.includes('<') && info.includes('>');
                actualizarInformacion(info, false, null, contieneHTML);
            });
            btn.addEventListener('mouseleave', function() {
                if (datosActivo[3]) { 
                    actualizarInformacion(datosActivo[0], true);
                } else {
                    inicializarInformacion();
                }
            });
        });
    }
    function obtenerInfoZona(zonaId) {
        return new Promise((resolve) => {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', 'productos/productos.xml', false);
            xhr.send();
            if (xhr.status === 200) {
                const xmlDoc = xhr.responseXML;
                const zonaNode = xmlDoc.querySelector(`configuracion > zonas-id > zona[id="${zonaId}"]`);
                if (zonaNode) {
                    resolve({
                        nombre: zonaNode.getAttribute('nombre'),
                        descripcion: zonaNode.getAttribute('descripcion')
                    });
                } else {
                    resolve({ nombre: 'Zona', descripcion: 'Sin información disponible' });
                }
            } else {
                resolve({ nombre: 'Zona', descripcion: 'Error al cargar información' });
            }
        });
    }
    let zonasInfo = {};
    function cargarInfoZonas() {
        console.log('Cargando información de zonas...');
        let xhr = new XMLHttpRequest();
        xhr.open('GET', 'productos/productos.xml', false);
        xhr.send();
        if (xhr.status === 200) {
            const xmlDoc = xhr.responseXML;
            const zonasNodes = xmlDoc.querySelectorAll('configuracion > zonas-id > zona');
            zonasNodes.forEach(zona => {
                const id = zona.getAttribute('id');
                zonasInfo[id] = {
                    nombre: zona.getAttribute('nombre'),
                    descripcion: zona.getAttribute('descripcion')
                };
            });
            console.log('Información de zonas cargada:', zonasInfo);
        } else {
            console.error('Error al cargar información de zonas');
        }
    }
    function verificarZonasIncompatibles(zonaId) {
        const zonaNum = parseInt(zonaId);
        const zonasIncompatibles = [];
        const zonasOcupadas = Object.keys(localizacionesOcupadas).map(z => parseInt(z));
        if ([0, 1, 2].includes(zonaNum)) {
            if (!zonasOcupadas.includes(5) && !zonasOcupadas.includes(6) && !zonasOcupadas.includes(18)) {
            } else {
                if (zonasOcupadas.includes(5)) zonasIncompatibles.push('delante-normal');
                if (zonasOcupadas.includes(6)) zonasIncompatibles.push('delante-grande');
                if (zonasOcupadas.includes(18)) zonasIncompatibles.push('delante-nombre');
            }
        }
        if ([5, 6, 18].includes(zonaNum)) {
            if (!zonasOcupadas.includes(0) && !zonasOcupadas.includes(1) && !zonasOcupadas.includes(2)) {
            } else {
                if (zonasOcupadas.includes(0)) zonasIncompatibles.push('escudo');
                if (zonasOcupadas.includes(1)) zonasIncompatibles.push('centroescudo');
                if (zonasOcupadas.includes(2)) zonasIncompatibles.push('contraescudo');
            }
            if (zonaNum === 5 && (zonasOcupadas.includes(6) || zonasOcupadas.includes(18))) {
                if (zonasOcupadas.includes(6)) zonasIncompatibles.push('delante-grande');
                if (zonasOcupadas.includes(18)) zonasIncompatibles.push('delante-nombre');
            }
            if (zonaNum === 6 && (zonasOcupadas.includes(5) || zonasOcupadas.includes(18))) {
                if (zonasOcupadas.includes(5)) zonasIncompatibles.push('delante-normal');
                if (zonasOcupadas.includes(18)) zonasIncompatibles.push('delante-nombre');
            }
            if (zonaNum === 18 && (zonasOcupadas.includes(5) || zonasOcupadas.includes(6))) {
                if (zonasOcupadas.includes(5)) zonasIncompatibles.push('delante-normal');
                if (zonasOcupadas.includes(6)) zonasIncompatibles.push('delante-grande');
            }
        }
        if ([8, 9, 10].includes(zonaNum)) {
            if (zonaNum === 8 && (zonasOcupadas.includes(9) || zonasOcupadas.includes(10))) {
                if (zonasOcupadas.includes(9)) zonasIncompatibles.push('detras-normal');
                if (zonasOcupadas.includes(10)) zonasIncompatibles.push('detras-grande');
            }
            if (zonaNum === 9 && (zonasOcupadas.includes(8) || zonasOcupadas.includes(10))) {
                if (zonasOcupadas.includes(8)) zonasIncompatibles.push('detras-nombre');
                if (zonasOcupadas.includes(10)) zonasIncompatibles.push('detras-grande');
            }
            if (zonaNum === 10 && (zonasOcupadas.includes(8) || zonasOcupadas.includes(9))) {
                if (zonasOcupadas.includes(8)) zonasIncompatibles.push('detras-nombre');
                if (zonasOcupadas.includes(9)) zonasIncompatibles.push('detras-normal');
            }
        }
        return zonasIncompatibles;
    }
const initialWidth = window.innerWidth;
const initialHeight = window.innerHeight;
const contenedorCentral = document.getElementById('contenedorCentral');
const contenedorSeleccion = document.getElementById('contenedorSeleccion');
const contenedorResultado = document.getElementById('contenedorResultado');
const initialCentralHeight = initialHeight * 1.0;
const originalSeleccionWidth = initialWidth * 0.5;
const originalSeleccionHeight = initialCentralHeight * 0.99;

(function() {
  if (window.innerWidth <= 768) return; // No aplica en móviles

  const seleccion = document.getElementById('contenedorSeleccion');
  const resultado = document.getElementById('contenedorResultado');
  const elementos = document.getElementById('contenedorElementos');

  if (!seleccion || !resultado || !elementos) return;

  const ajustarAltura = () => {
    const altura = seleccion.getBoundingClientRect().height;
    resultado.style.height = altura + 'px';
  };

  const ro = new ResizeObserver(ajustarAltura);
  ro.observe(seleccion);
  window.addEventListener('resize', ajustarAltura);
  ajustarAltura();

  resultado.style.display = 'flex';
  resultado.style.flexDirection = 'column';
  elementos.style.flex = '1';
  elementos.style.overflowY = 'scroll';
  elementos.style.scrollbarWidth = 'none';
  elementos.style.msOverflowStyle = 'none';
  elementos.style.overflowX = 'hidden';
  elementos.style.scrollBehavior = 'smooth';
  elementos.style.margin = '0';
})();


// --- Igualar altura de contenedorResultado a contenedorSeleccion (solo en tablets y monitores) ---
(function sincronizarAlturasPantallasGrandes() {
  const seleccion = document.getElementById('contenedorSeleccion');
  const resultado = document.getElementById('contenedorResultado');
  if (!seleccion || !resultado) return;

  const ajustar = () => {
    const ancho = window.innerWidth || document.documentElement.clientWidth;

    // Aplica sólo a pantallas mayores de 768px (tablets y monitores)
    if (ancho > 768) {
      const alturaReal = seleccion.offsetHeight;
      resultado.style.minHeight = alturaReal + 'px';
      resultado.style.height = alturaReal + 'px';
      resultado.style.maxHeight = alturaReal + 'px';
    } else {
      // En móviles, no se modifica nada
      resultado.style.minHeight = '';
      resultado.style.height = '';
      resultado.style.maxHeight = '';
    }
  };

  ajustar();

  if (window.ResizeObserver) {
    const ro = new ResizeObserver(ajustar);
    ro.observe(seleccion);
  }

  window.addEventListener('resize', ajustar);
})();
