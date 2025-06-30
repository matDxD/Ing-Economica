// Archivo: anualidades.js
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('anualidades-forms-container');
    if (!container) return;

    const controlButtons = document.querySelectorAll('.control-btn');
    const resultadoDiv = document.getElementById('resultado-anualidad');
    const frecuencias = { mensual: 12, bimestral: 6, trimestral: 4, cuatrimestral: 3, semestral: 2, anual: 1 };

    const formTemplates = {
        'form-calc-vp': `<h3>Calcular Valor Presente (VP)</h3><div class="form-group"><label>Cuota (A):</label><input type="number" name="a" step="any" placeholder="Ej: 500" required></div><div class="form-group"><label>Número de Períodos (n):</label><input type="number" name="n" step="any" placeholder="Ej: 24" required></div>`,
        'form-calc-vf': `<h3>Calcular Valor Futuro (VF)</h3><div class="form-group"><label>Cuota (A):</label><input type="number" name="a" step="any" placeholder="Ej: 500" required></div><div class="form-group"><label>Número de Períodos (n):</label><input type="number" name="n" step="any" placeholder="Ej: 60" required></div>`,
        'form-calc-a': `<h3>Calcular Cuota (A)</h3><div class="form-group radio-group"><label><input type="radio" name="base" value="vp" checked> Basado en VP</label><label><input type="radio" name="base" value="vf"> Basado en VF</label></div><div class="form-group"><label>Valor (VP o VF):</label><input type="number" name="valor" step="any" placeholder="Ej: 20000" required></div><div class="form-group"><label>Número de Períodos (n):</label><input type="number" name="n" step="any" placeholder="Ej: 48" required></div>`,
        'form-calc-n': `<h3>Calcular Períodos (n)</h3><div class="form-group radio-group"><label><input type="radio" name="base" value="vp" checked> Basado en VP</label><label><input type="radio" name="base" value="vf"> Basado en VF</label></div><div class="form-group"><label>Valor (VP o VF):</label><input type="number" name="valor" step="any" placeholder="Ej: 15000" required></div><div class="form-group"><label>Cuota (A):</label><input type="number" name="a" step="any" placeholder="Ej: 350" required></div>`
    };

    const commonFields = `<hr><div class="form-group"><label>Tasa de Interés Anual (%):</label><input type="number" name="tasa" step="any" placeholder="Ej: 12" required></div><div class="form-group"><label>Período de Capitalización y Pagos:</label><select name="periodo"><option value="mensual" selected>Mensual</option><option value="bimestral">Bimestral</option><option value="trimestral">Trimestral</option><option value="cuatrimestral">Cuatrimestral</option><option value="semestral">Semestral</option><option value="anual">Anual</option></select></div><div class="form-group checkbox-group"><input type="checkbox" name="anticipada" id="anticipada-check"><label for="anticipada-check">Es Anualidad Anticipada</label></div><button type="submit">Calcular</button>`;

    controlButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            controlButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const formId = this.dataset.form;
            container.innerHTML = `<form id="${formId}" class="calculator-form">${formTemplates[formId]}${commonFields}</form>`;
            attachSubmitListener(formId);
            resultadoDiv.classList.add('hidden');
        });
    });

    function attachSubmitListener(formId) {
        const form = document.getElementById(formId);
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            const data = new FormData(form);
            const i = (parseFloat(data.get('tasa')) / 100) / frecuencias[data.get('periodo')];
            const esAnticipada = data.get('anticipada');
            let resultado = 0, campoCalculado = '';

            try {
                switch (formId) {
                    case 'form-calc-vp':
                        const a_vp = parseFloat(data.get('a'));
                        const n_vp = parseFloat(data.get('n'));
                        resultado = a_vp * ((1 - Math.pow(1 + i, -n_vp)) / i);
                        if (esAnticipada) resultado *= (1 + i);
                        campoCalculado = 'Valor Presente (VP)';
                        break;
                    case 'form-calc-vf':
                        const a_vf = parseFloat(data.get('a'));
                        const n_vf = parseFloat(data.get('n'));
                        resultado = a_vf * ((Math.pow(1 + i, n_vf) - 1) / i);
                        if (esAnticipada) resultado *= (1 + i);
                        campoCalculado = 'Valor Futuro (VF)';
                        break;
                    case 'form-calc-a':
                        const valor_a = parseFloat(data.get('valor'));
                        const n_a = parseFloat(data.get('n'));
                        if (data.get('base') === 'vp') {
                            let factor = (i / (1 - Math.pow(1 + i, -n_a)));
                            resultado = valor_a * factor;
                            if (esAnticipada) resultado /= (1 + i);
                        } else {
                            let factor = (i / (Math.pow(1 + i, n_a) - 1));
                            resultado = valor_a * factor;
                            if (esAnticipada) resultado /= (1 + i);
                        }
                        campoCalculado = 'Cuota (A)';
                        break;
                    case 'form-calc-n':
                        const valor_n = parseFloat(data.get('valor'));
                        const a_n = parseFloat(data.get('a'));
                        if (data.get('base') === 'vp') {
                            let termino = 1 - (valor_n * i) / (esAnticipada ? a_n * (1 + i) : a_n);
                            if (termino <= 0) throw new Error("No es posible calcular 'n'. La cuota es muy baja para cubrir los intereses.");
                            resultado = -Math.log(termino) / Math.log(1 + i);
                        } else {
                            let termino = 1 + (valor_n * i) / (esAnticipada ? a_n * (1 + i) : a_n);
                            resultado = Math.log(termino) / Math.log(1 + i);
                        }
                        campoCalculado = 'Número de Períodos (n)';
                        break;
                }
                mostrarResultadoAnualidad(resultado, campoCalculado);
            } catch (error) {
                alert(error.message);
            }
        });
    }

    function mostrarResultadoAnualidad(valor, campo) {
        let valorFormateado = campo.includes('Períodos') ? valor.toFixed(4) : '$' + valor.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        resultadoDiv.innerHTML = `${campo}: <br> <strong>${valorFormateado}</strong>`;
        resultadoDiv.classList.remove('hidden');
    }
});