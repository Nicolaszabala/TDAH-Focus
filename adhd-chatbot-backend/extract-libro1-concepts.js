/**
 * Extract key concepts from libro1.md (Scattered Minds full text)
 *
 * Since the full book is too large (10,505 lines), we'll extract:
 * 1. Key quotes for each major pattern
 * 2. Specific strategies mentioned
 * 3. Conceptual frameworks
 *
 * This creates a curated knowledge base rather than including entire book
 */

const fs = require('fs');
const path = require('path');

const libro1Path = path.join(__dirname, 'knowledge', 'libro1.md');

console.log('\n=== EXTRACCIÓN DE CONCEPTOS CLAVE DE LIBRO1.MD ===\n');
console.log('Archivo: knowledge/libro1.md (Scattered Minds - Dr. Gabor Maté)\n');

try {
  const content = fs.readFileSync(libro1Path, 'utf-8');

  console.log(`Longitud total: ${content.length} caracteres`);
  console.log(`Líneas: ${content.split('\n').length}`);
  console.log(`Palabras (aprox): ${content.split(/\s+/).length}`);

  console.log('\n--- ANÁLISIS ---\n');
  console.log('Este archivo contiene el libro completo "Scattered Minds".');
  console.log('RECOMENDACIÓN: NO incluir directamente en prompts (demasiado grande).\n');

  console.log('ESTRATEGIA DE INTEGRACIÓN:\n');
  console.log('1. Ya tenemos conceptos clave en scattered-minds-concepts.js');
  console.log('2. libro1.md puede usarse para:');
  console.log('   - Referencia durante desarrollo');
  console.log('   - Extracción manual de citas específicas');
  console.log('   - Validación de conceptos ya extraídos');
  console.log('   - Búsqueda de ejemplos para casos específicos\n');

  // Search for key concepts
  console.log('--- BÚSQUEDA DE CONCEPTOS ESPECÍFICOS ---\n');

  const searches = [
    { term: 'executive function', name: 'Función Ejecutiva' },
    { term: 'self-regulation', name: 'Auto-regulación' },
    { term: 'attunement', name: 'Sintonización' },
    { term: 'dopamine', name: 'Dopamina' },
    { term: 'procrastination', name: 'Procrastinación' },
    { term: 'shame', name: 'Vergüenza' },
  ];

  searches.forEach(search => {
    const regex = new RegExp(search.term, 'gi');
    const matches = content.match(regex);
    const count = matches ? matches.length : 0;
    console.log(`${search.name} ("${search.term}"): ${count} menciones`);
  });

  console.log('\n--- RECOMENDACIÓN FINAL ---\n');
  console.log('✅ Mantener scattered-minds-concepts.js como está (ya contiene lo esencial)');
  console.log('✅ Usar libro1.md como referencia offline, NO inyectar en prompts');
  console.log('✅ Si se necesitan citas específicas, extraer manualmente y agregar a');
  console.log('   adhd-knowledge-base-optimized.js en secciones por patrón');
  console.log('');

} catch (error) {
  console.error('❌ Error leyendo archivo:', error.message);
}
