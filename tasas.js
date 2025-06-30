// Archivo: tasas.js (con todas las correcciones)

document.addEventListener('DOMContentLoaded', function() {
    const conversionTypeSelect = document.getElementById('conversion-type');
    const formNominalAEfectiva = document.getElementById('form-nominal-a-efectiva');
    const formEfectivaAEfectiva = document.getElementById('form-efectiva-a-efectiva');
    // CORRECCIÓN 1: Seleccionar el nuevo formulario
    const formEfectivaANominal = document.getElementById('form-efectiva-a-nominal');
    
    const resultadoDiv = document.getElementById('resultado-tasas');

    const frecuencias = {
        mensual: 12, bimestral: 6, trimestral: 4,
        cuatrimestral: 3, semestral: 2, anual: 1
    };

    // --- CONTROLADOR PRINCIPAL: Muestra el formulario correcto ---
    conversionTypeSelect.addEventListener('change', function() {
        // Ocultar todos los formularios y el resultado al cambiar de opción
        formNominalAEfectiva.classList.add('hidden');
        formEfectivaAEfectiva.classList.add('hidden');
        formEfectivaANominal.classList.add('hidden'); // Ocultar el nuevo también
        resultadoDiv.classList.add('hidden');

        // Mostrar el formulario seleccionado
        const selectedValue = this.value;
        if (selectedValue === 'nominal-a-efectiva') {
            formNominalAEfectiva.classList.remove('hidden');
        } else if (selectedValue === 'efectiva-a-efectiva') {
            formEfectivaAEfectiva.classList.remove('hidden');
        } else if (selectedValue === 'efectiva-a-nominal') { // CORRECCIÓN 1: Añadir la lógica para mostrar el nuevo form
            formEfectivaANominal.classList.remove('hidden');
        }
    });

    // --- LÓGICA PARA EL FORMULARIO 1: NOMINAL A EFECTIVA ---
    formNominalAEfectiva.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(this);
        const j = parseFloat(formData.get('tasa')) / 100;
        const m1 = frecuencias[formData.get('periodo_conocido')];
        const m2 = frecuencias[formData.get('periodo_deseado')];

        const i_periodica = j / m1;
        const i_deseada = Math.pow(1 + i_periodica, m1 / m2) - 1;
        
        mostrarResultado(i_deseada, formData.get('periodo_deseado'), 'Efectiva');
    });

    // --- LÓGICA PARA EL FORMULARIO 2: EFECTIVA A EFECTIVA ---
    formEfectivaAEfectiva.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(this);
        const i_conocida = parseFloat(formData.get('tasa')) / 100;
        const m1 = frecuencias[formData.get('periodo_conocido')];
        const m2 = frecuencias[formData.get('periodo_deseado')];

        const i_deseada = Math.pow(1 + i_conocida, m1 / m2) - 1;

        mostrarResultado(i_deseada, formData.get('periodo_deseado'), 'Efectiva');
    });

    // --- CORRECCIÓN 1: LÓGICA AÑADIDA PARA EL FORMULARIO 3: EFECTIVA A NOMINAL ---
    formEfectivaANominal.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(this);
        const i_conocida = parseFloat(formData.get('tasa')) / 100;
        const m1 = frecuencias[formData.get('periodo_conocido')];
        const m2 = frecuencias[formData.get('periodo_deseado')];

        // Paso 1: Convertir la efectiva conocida a la efectiva del período deseado (el puente)
        const i_periodica_nueva = Math.pow(1 + i_conocida, m1 / m2) - 1;

        // Paso 2: Convertir esa efectiva periódica a nominal (j = i * m)
        const j_deseada = i_periodica_nueva * m2;

        mostrarResultado(j_deseada, formData.get('periodo_deseado'), 'Nominal');
    });

    // --- FUNCIÓN AUXILIAR PARA MOSTRAR EL RESULTADO (Mejorada) ---
    function mostrarResultado(valor, periodo, tipoTasa) {
        const tasaResultado = valor * 100;
        const periodoTexto = periodo.charAt(0).toUpperCase() + periodo.slice(1);
        
        let tituloResultado = `Tasa ${tipoTasa} ${periodoTexto} equivalente:`;
        if (tipoTasa === 'Nominal') {
            tituloResultado = `Tasa ${tipoTasa} Capitalizable ${periodoTexto}:`;
        }

        resultadoDiv.innerHTML = `${tituloResultado} <br> <strong>${tasaResultado.toFixed(2)}%</strong>`;
        resultadoDiv.classList.remove('hidden');
    }
});