import { readFileSync, writeFileSync } from 'fs';

const input  = readFileSync('./tarifas-inergia_btf.csv', 'utf-8');
const lines  = input.trim().split('\n');
const header = lines[0];
const rows   = lines.slice(1);

// Columnas que son numéricas (índice base 0)
const NUMERIC_COLS = new Set([
  0,   // id
  1,   // comercializadora_id
  8,   // activo
  9,   // comparador
  10,  // consumo_desde
  11,  // consumo_hasta
  12,  // potencia_desde
  13,  // potencia_hasta
  15,  // potencia1
  16,  // potencia2
  17,  // potencia3
  18,  // potencia4
  19,  // potencia5
  20,  // potencia6
  21,  // energia1
  22,  // energia2
  23,  // energia3
  24,  // energia4
  25,  // energia5
  26,  // energia6
  28,  // fee_ene
  29,  // fee_pot
  30,  // servicio
]);

// Columna de fecha (índice 27 = vigencia)
const DATE_COL = 27;

const outputLines = [header.replace('tipoPot', 'tipo_pot')];

for (const line of rows) {
  const fields = line.split(';');

  const converted = fields.map((val, i) => {
    const v = val.trim();

    // Fecha DD/MM/YYYY → YYYY-MM-DD
    if (i === DATE_COL && v.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [d, m, y] = v.split('/');
      return `${y}-${m}-${d}`;
    }

    // Numéricos: coma decimal → punto decimal
    if (NUMERIC_COLS.has(i) && v !== '') {
      return v.replace(',', '.');
    }

    return v;
  });

  outputLines.push(converted.join(';'));
}

writeFileSync('./tarifas-inergia_btf_converted.csv', outputLines.join('\n'), 'utf-8');
console.log(`✓ Convertidos ${rows.length} registros → tarifas-inergia_btf_converted.csv`);
