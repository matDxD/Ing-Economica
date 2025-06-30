// Archivo: interes.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-interes');
    if (!form) return;

    const resultadosContainer = document.getElementById('resultados-interes');
    
    // Elementos para Interés Simple
    const resultadoVFSimple = document.getElementById('resultado-vf-simple');
    const totalInteresSimple = document.getElementById('total-interes-simple');

    // Elementos para Interés Compuesto
    const resultadoVFCompuesto = document.getElementById('resultado-vf-compuesto');
    const totalInteresCompuesto = document.getElementById('total-interes-compuesto');

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // --- 1. OBTENER DATOS DEL USUARIO ---
        const vp = parseFloat(document.getElementById('interes-vp').value);
        const tasaAnual = parseFloat(document.getElementById('interes-tasa').value);
        const plazoValor = parseFloat(document.getElementById('interes-plazo').value);
        const plazoUnidad = document.getElementById('interes-plazo-unidad').value;

        if (isNaN(vp) || isNaN(tasaAnual) || isNaN(plazoValor)) {
            alert("Por favor, complete todos los campos con valores numéricos válidos.");
            return;
        }

        // --- 2. PREPARAR VARIABLES (Convertir todo a meses para consistencia) ---
        const i_mensual = (tasaAnual / 100) / 12; // Tasa efectiva mensual
        const n_meses = (plazoUnidad === 'anios') ? plazoValor * 12 : plazoValor; // Número total de meses

        // --- 3. CÁLCULO DE INTERÉS SIMPLE ---
        // Fórmula: VF = VP * (1 + i * n)
        const vf_simple = vp * (1 + i_mensual * n_meses);
        const interes_simple_total = vf_simple - vp;

        // --- 4. CÁLCULO DE INTERÉS COMPUESTO ---
        // Fórmula: VF = VP * (1 + i)^n
        const vf_compuesto = vp * Math.pow(1 + i_mensual, n_meses);
        const interes_compuesto_total = vf_compuesto - vp;

        // --- 5. MOSTRAR RESULTADOS ---
        const formatoMoneda = (valor) => valor.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 });

        // Actualizar resultados de Interés Simple
        resultadoVFSimple.textContent = formatoMoneda(vf_simple);
        totalInteresSimple.textContent = formatoMoneda(interes_simple_total);

        // Actualizar resultados de Interés Compuesto
        resultadoVFCompuesto.textContent = formatoMoneda(vf_compuesto);
        totalInteresCompuesto.textContent = formatoMoneda(interes_compuesto_total);

        // Mostrar el contenedor de resultados
        resultadosContainer.classList.remove('hidden');
    });
});