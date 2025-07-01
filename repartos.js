document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const form = document.getElementById('reparto-form');
    const montoTotalInput = document.getElementById('montoTotal');
    const criteriosContainer = document.getElementById('criterios-container');
    const beneficiariosHeader = document.getElementById('beneficiarios-header');
    const beneficiariosBody = document.getElementById('beneficiarios-body');
    const addCriterioBtn = document.getElementById('add-criterio');
    const addBeneficiarioBtn = document.getElementById('add-beneficiario');
    const metodoSelect = document.getElementById('metodo');

    const resultadoDiv = document.getElementById('resultado');
    const metodoTituloDiv = document.getElementById('metodo-explicacion-titulo');
    const pasosExplicacionDiv = document.getElementById('pasos-explicacion');
    const tablaResultadoDiv = document.getElementById('tabla-resultado');

    // --- LÓGICA DE UI DINÁMICA ---

    // Función para añadir un nuevo criterio
    const agregarCriterio = () => {
        const criterioId = Date.now(); // ID único para el criterio
        const div = document.createElement('div');
        div.className = 'criterio-row';
        div.innerHTML = `
            <input type="text" placeholder="Nombre del Criterio (Ej: Edad)" class="criterio-nombre" required>
            <select class="criterio-tipo">
                <option value="directa">Proporción Directa</option>
                <option value="inversa">Proporción Inversa</option>
            </select>
            <button type="button" class="remove-btn">✖</button>
        `;
        criteriosContainer.appendChild(div);
        actualizarHeaderBeneficiarios();
    };
    
    // Función para añadir un nuevo beneficiario
    const agregarBeneficiario = () => {
        const numCriterios = criteriosContainer.children.length;
        if (numCriterios === 0) {
            alert('Por favor, añade al menos un criterio antes de añadir beneficiarios.');
            return;
        }
        
        const div = document.createElement('div');
        div.className = 'beneficiario-row';
        
        let inputsHTML = '<input type="text" placeholder="Nombre" class="beneficiario-nombre" required>';
        for (let i = 0; i < numCriterios; i++) {
            inputsHTML += '<input type="number" placeholder="Valor" class="beneficiario-valor" required>';
        }
        inputsHTML += '<button type="button" class="remove-btn">✖</button>';
        
        div.innerHTML = inputsHTML;
        beneficiariosBody.appendChild(div);
    };

    // Actualiza la cabecera de la tabla de beneficiarios cuando los criterios cambian
    const actualizarHeaderBeneficiarios = () => {
        const criterioNombres = Array.from(document.querySelectorAll('.criterio-nombre')).map(input => input.value || 'Criterio');
        let headerHTML = '<span>Beneficiario</span>';
        criterioNombres.forEach(nombre => {
            headerHTML += `<span>${nombre}</span>`;
        });
        beneficiariosHeader.innerHTML = headerHTML;
        
        // Sincronizar el número de inputs en cada fila de beneficiario
        const beneficiarioRows = document.querySelectorAll('#beneficiarios-body .beneficiario-row');
        beneficiarioRows.forEach(row => {
            while(row.querySelectorAll('.beneficiario-valor').length < criterioNombres.length) {
                const input = document.createElement('input');
                input.type = 'number';
                input.placeholder = 'Valor';
                input.className = 'beneficiario-valor';
                input.required = true;
                // Inserta antes del botón de eliminar
                row.insertBefore(input, row.querySelector('.remove-btn'));
            }
            while(row.querySelectorAll('.beneficiario-valor').length > criterioNombres.length) {
                row.querySelector('.beneficiario-valor:last-of-type').remove();
            }
        });
    };
    
    // Event Listeners para botones y cambios
    addCriterioBtn.addEventListener('click', agregarCriterio);
    addBeneficiarioBtn.addEventListener('click', agregarBeneficiario);

    // Usar delegación de eventos para los botones de eliminar y para actualizar el header
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            e.target.parentElement.remove();
            actualizarHeaderBeneficiarios();
        }
    });
    document.body.addEventListener('input', (e) => {
        if (e.target.classList.contains('criterio-nombre')) {
            actualizarHeaderBeneficiarios();
        }
    });

    // --- LÓGICA DE CÁLCULO ---

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // 1. Recolectar Datos
        const montoTotal = parseFloat(montoTotalInput.value);
        
        const criterios = Array.from(criteriosContainer.children).map(div => ({
            nombre: div.querySelector('.criterio-nombre').value,
            tipo: div.querySelector('.criterio-tipo').value
        }));

        const beneficiarios = Array.from(beneficiariosBody.children).map(div => ({
            nombre: div.querySelector('.beneficiario-nombre').value,
            valores: Array.from(div.querySelectorAll('.beneficiario-valor')).map(input => parseFloat(input.value))
        }));

        // Validaciones básicas
        if (isNaN(montoTotal) || montoTotal <= 0 || criterios.length === 0 || beneficiarios.length === 0) {
            alert('Por favor, completa todos los campos correctamente.');
            return;
        }

        // 2. Calcular Índice de Reparto (IR) para cada beneficiario
        beneficiarios.forEach(b => {
            b.indiceReparto = 1;
            b.valores.forEach((valor, i) => {
                const factor = (criterios[i].tipo === 'directa') ? valor : (1 / valor);
                b.indiceReparto *= factor;
            });
        });

        // 3. Calcular Suma de Índices (S)
        const sumaIndices = beneficiarios.reduce((sum, b) => sum + b.indiceReparto, 0);

        // 4. Calcular el monto para cada beneficiario
        beneficiarios.forEach(b => {
            b.montoRecibido = (b.indiceReparto / sumaIndices) * montoTotal;
        });
        
        // 5. Mostrar resultados según el método seleccionado
        mostrarResultados(beneficiarios, criterios, sumaIndices, montoTotal, metodoSelect.value);
    });

    const mostrarResultados = (beneficiarios, criterios, sumaIndices, montoTotal, metodo) => {
        const metodoTexto = {
            proporciones: 'Proporciones (Constante K)',
            reduccion: 'Reducción a la Unidad',
            alicuotas: 'Partes Alícuotas (Fracciones)'
        }[metodo];
        
        metodoTituloDiv.innerText = `Solución detallada por el método de ${metodoTexto}`;
        pasosExplicacionDiv.innerHTML = generarExplicacion(beneficiarios, sumaIndices, montoTotal, metodo);
        tablaResultadoDiv.innerHTML = generarTablaFinal(beneficiarios);
        
        resultadoDiv.style.display = 'block';
        resultadoDiv.scrollIntoView({ behavior: 'smooth' });
    };
    
    const generarExplicacion = (beneficiarios, sumaIndices, montoTotal, metodo) => {
        let html = '<h6>1. Cálculo de Índices de Reparto (IR)</h6>';
        html += '<p>El índice de cada beneficiario se calcula multiplicando sus valores de criterio (o sus inversos, si la proporción es inversa).</p><ul>';
        beneficiarios.forEach(b => {
            html += `<li><b>${b.nombre}:</b> IR = ${b.indiceReparto.toFixed(4)}</li>`;
        });
        html += '</ul>';
        html += `<h6>2. Suma Total de Índices (S)</h6><p>S = ${sumaIndices.toFixed(4)}</p>`;
        html += '<h6>3. Aplicación del Método</h6>';

        switch (metodo) {
            case 'proporciones':
                const k = montoTotal / sumaIndices;
                html += '<p>Se calcula la constante de proporcionalidad (K).</p>';
                html += `<p><b>K = Monto Total / S</b> = ${formatCurrency(montoTotal)} / ${sumaIndices.toFixed(4)} = <b>${k.toFixed(4)}</b></p>`;
                html += '<p>El monto de cada uno es su índice por la constante K.</p>';
                html += `<ul><li><b>Monto ${beneficiarios[0].nombre}</b> = IR * K = ${beneficiarios[0].indiceReparto.toFixed(4)} * ${k.toFixed(4)} = ${formatCurrency(beneficiarios[0].montoRecibido)}</li></ul>`;
                break;
            case 'reduccion':
                html += '<p>Se calcula qué porción le corresponde a cada uno por cada $1 a repartir.</p>';
                html += `<p><b>Parte por Unidad = IR / S</b></p>`;
                html += `<p>Luego, se multiplica esa porción por el Monto Total.</p>`;
                html += `<ul><li><b>Monto ${beneficiarios[0].nombre}</b> = (IR / S) * Monto Total = (${beneficiarios[0].indiceReparto.toFixed(4)} / ${sumaIndices.toFixed(4)}) * ${formatCurrency(montoTotal)} = ${formatCurrency(beneficiarios[0].montoRecibido)}</li></ul>`;
                break;
            case 'alicuotas':
                html += '<p>Se calcula la fracción (parte alícuota) del total que le corresponde a cada uno.</p>';
                html += `<p><b>Fracción = IR / S</b></p>`;
                html += '<p>Luego, se multiplica el Monto Total por esa fracción.</p>';
                html += `<ul><li><b>Monto ${beneficiarios[0].nombre}</b> = Monto Total * (IR / S) = ${formatCurrency(montoTotal)} * (${beneficiarios[0].indiceReparto.toFixed(4)} / ${sumaIndices.toFixed(4)}) = ${formatCurrency(beneficiarios[0].montoRecibido)}</li></ul>`;
                break;
        }
        return html;
    };
    
    const generarTablaFinal = (beneficiarios) => {
        let tableHTML = '<table><thead><tr><th>Beneficiario</th><th>Monto Recibido</th></tr></thead><tbody>';
        beneficiarios.forEach(b => {
            tableHTML += `<tr><td>${b.nombre}</td><td>${formatCurrency(b.montoRecibido)}</td></tr>`;
        });
        tableHTML += '</tbody></table>';
        return tableHTML;
    };

    // Función de utilidad (idealmente en common.js)
    const formatCurrency = (number) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 2 }).format(number);
    };

    // Inicializar UI por defecto
    agregarCriterio();
    agregarBeneficiario();
});