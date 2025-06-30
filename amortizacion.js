// Archivo: amortizacion.js (con lógica de plazo flexible)
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-amortizacion');
    if (!form) return;

    const tablaContainer = document.getElementById('tabla-container');
    const tablaBody = document.getElementById('amortizacion-body');
    const frecuenciasMap = { mensual: 12, bimestral: 6, trimestral: 4, semestral: 2, anual: 1 };

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // --- 1. OBTENER DATOS DEL USUARIO (con la nueva unidad de plazo) ---
        const vp = parseFloat(document.getElementById('prestamo-monto').value);
        const tasaAnual = parseFloat(document.getElementById('prestamo-tasa').value);
        const plazoValor = parseFloat(document.getElementById('prestamo-plazo').value);
        const plazoUnidad = document.getElementById('prestamo-plazo-unidad').value; // 'anios' o 'meses'
        const frecuenciaPagos = document.getElementById('prestamo-frecuencia').value;

        if (isNaN(vp) || isNaN(tasaAnual) || isNaN(plazoValor)) {
            alert("Por favor, complete todos los campos con valores numéricos válidos.");
            return;
        }

        // --- 2. PRE-COMPUTACIÓN (Lógica de 'n' mejorada) ---
        const frecuenciaNum = frecuenciasMap[frecuenciaPagos];
        const i = (tasaAnual / 100) / frecuenciaNum; // Tasa de interés periódica

        // --- ¡AQUÍ ESTÁ LA NUEVA LÓGICA INTELIGENTE! ---
        let n; // Número total de pagos
        if (plazoUnidad === 'anios') {
            // Si el plazo está en años, la lógica es la misma de antes
            n = plazoValor * frecuenciaNum;
        } else { // Si el plazo está en 'meses'
            // Calculamos cuántos meses hay en cada período de pago
            const mesesPorPeriodo = 12 / frecuenciaNum;
            // Dividimos el total de meses del plazo por los meses de cada período
            n = plazoValor / mesesPorPeriodo;
        }
        // ------------------------------------------------

        // Calcular la cuota (A) usando la fórmula de anualidad
        // Manejo de caso donde el interés es 0 para evitar división por cero
        let cuotaA;
        if (i === 0) {
            cuotaA = vp / n;
        } else {
            const factor = (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
            cuotaA = vp * factor;
        }

        // --- 3. GENERAR LA TABLA ---
        tablaBody.innerHTML = ''; // Limpiar resultados anteriores
        let saldo = vp;

        for (let periodo = 1; periodo <= n; periodo++) {
            const interesDelPeriodo = saldo * i;
            const capitalPagado = cuotaA - interesDelPeriodo;
            saldo -= capitalPagado;

            const fila = document.createElement('tr');
            const formatoMoneda = (valor) => valor.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 });

            fila.innerHTML = `
                <td>${periodo}</td>
                <td>${formatoMoneda(cuotaA)}</td>
                <td>${formatoMoneda(interesDelPeriodo)}</td>
                <td>${formatoMoneda(capitalPagado)}</td>
                <td>${formatoMoneda(Math.abs(saldo))}</td>
            `;
            tablaBody.appendChild(fila);
        }

        // --- 4. MOSTRAR LA TABLA ---
        tablaContainer.classList.remove('hidden');
    });
});