#!/usr/bin/env node

/**
 * Test Setup Script
 * Prepares test data for manual testing
 *
 * Usage: node scripts/test-setup.js [action]
 * Actions:
 *   - dataset-demo: Create demo dataset (for video)
 *   - dataset-full: Create full test dataset
 *   - dataset-edge: Create edge case dataset (100+ tasks)
 *   - clear: Clear all data
 *   - timer-fast: Enable fast timer (10sec work, 5sec break)
 *   - timer-normal: Restore normal timer (25min work)
 */

const fs = require('fs');
const path = require('path');

// Paths
const CONSTANTS_PATH = path.join(__dirname, '../src/utils/constants.js');

// ============================================================================
// DATASET GENERATORS
// ============================================================================

const DEMO_DATASET = {
  tasks: [
    // Obligatorias (5)
    { id: '1', title: 'Revisar emails pendientes del trabajo', isMandatory: true, completed: false, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), notes: [] },
    { id: '2', title: 'Completar informe mensual para gerencia', isMandatory: true, completed: false, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), notes: [] },
    { id: '3', title: 'Llamar al médico para renovar receta', isMandatory: true, completed: false, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), notes: [] },
    { id: '4', title: 'Pagar facturas de servicios (luz, internet)', isMandatory: true, completed: false, createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), notes: [] },
    { id: '5', title: 'Preparar presentación para reunión del viernes', isMandatory: true, completed: false, createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), notes: [] },

    // Opcionales (3)
    { id: '6', title: 'Organizar escritorio y archivos', isMandatory: false, completed: false, createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), notes: [] },
    { id: '7', title: 'Ver tutorial de React Native avanzado', isMandatory: false, completed: false, createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), notes: [] },
    { id: '8', title: 'Hacer ejercicio en el gimnasio', isMandatory: false, completed: false, createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), notes: [] },

    // Completadas (2)
    { id: '9', title: 'Comprar medicación en farmacia', isMandatory: true, completed: true, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), completedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(), notes: [] },
    { id: '10', title: 'Leer artículo sobre manejo del TDAH', isMandatory: false, completed: true, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), completedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), notes: [] },
  ],

  pomodoroHistory: [
    // Yesterday - 2 sessions
    {
      id: 'p1',
      taskId: '1',
      taskTitle: 'Revisar emails pendientes del trabajo',
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000 - 30 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      workDuration: 25 * 60,
      breakDuration: 5 * 60,
    },
    {
      id: 'p2',
      taskId: '2',
      taskTitle: 'Completar informe mensual para gerencia',
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000 - 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 - 30 * 60 * 1000).toISOString(),
      workDuration: 25 * 60,
      breakDuration: 5 * 60,
    },

    // Today - 1 session
    {
      id: 'p3',
      taskId: '3',
      taskTitle: 'Llamar al médico para renovar receta',
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      workDuration: 25 * 60,
      breakDuration: 5 * 60,
    },
  ],

  settings: {
    breakDuration: 5 * 60,
    notificationsEnabled: true,
    volume: 0.5,
  },
};

const FULL_TEST_DATASET = {
  tasks: [
    ...DEMO_DATASET.tasks,
    // Add more tasks for comprehensive testing
    { id: '11', title: 'Entregar documentación a RRHH', isMandatory: true, completed: false, createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), notes: [{ id: 'n1', content: 'Llevar copia del DNI', createdAt: new Date().toISOString() }] },
    { id: '12', title: 'Renovar licencia de conducir', isMandatory: true, completed: false, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), notes: [] },
    { id: '13', title: 'Hacer declaración de impuestos', isMandatory: true, completed: false, createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), notes: [] },
    { id: '14', title: 'Actualizar portfolio profesional', isMandatory: false, completed: false, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), notes: [] },
    { id: '15', title: 'Aprender TypeScript básico', isMandatory: false, completed: false, createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), notes: [] },
  ],
  pomodoroHistory: DEMO_DATASET.pomodoroHistory,
  settings: DEMO_DATASET.settings,
};

function generateEdgeCaseDataset() {
  const tasks = [];

  // Generate 100 tasks
  for (let i = 1; i <= 100; i++) {
    tasks.push({
      id: `task-${i}`,
      title: `Tarea de prueba ${i} - ${i % 2 === 0 ? 'Obligatoria' : 'Opcional'}`,
      isMandatory: i % 2 === 0,
      completed: i % 5 === 0, // Every 5th task is completed
      createdAt: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      notes: [],
    });
  }

  return {
    tasks,
    pomodoroHistory: DEMO_DATASET.pomodoroHistory,
    settings: DEMO_DATASET.settings,
  };
}

// ============================================================================
// TIMER CONFIGURATION
// ============================================================================

function setFastTimer() {
  console.log('⚡ Enabling FAST TIMER for testing...');
  console.log('   - Work: 10 seconds (instead of 25 minutes)');
  console.log('   - Break: 5 seconds (instead of 5 minutes)');

  let content = fs.readFileSync(CONSTANTS_PATH, 'utf8');

  // Replace timer durations
  content = content.replace(
    /WORK_DURATION:\s*25\s*\*\s*60/g,
    'WORK_DURATION: 10 // TEST MODE: 10 seconds'
  );

  content = content.replace(
    /BREAK_DURATION_SHORT:\s*5\s*\*\s*60/g,
    'BREAK_DURATION_SHORT: 5 // TEST MODE: 5 seconds'
  );

  content = content.replace(
    /BREAK_DURATION_LONG:\s*10\s*\*\s*60/g,
    'BREAK_DURATION_LONG: 10 // TEST MODE: 10 seconds'
  );

  fs.writeFileSync(CONSTANTS_PATH, content);
  console.log('✅ Fast timer enabled!');
  console.log('⚠️  Remember to restart Expo dev server: npx expo start -c');
}

function setNormalTimer() {
  console.log('🔄 Restoring NORMAL TIMER...');

  let content = fs.readFileSync(CONSTANTS_PATH, 'utf8');

  // Restore normal durations
  content = content.replace(
    /WORK_DURATION:\s*10\s*\/\/\s*TEST MODE:.*/g,
    'WORK_DURATION: 25 * 60'
  );

  content = content.replace(
    /BREAK_DURATION_SHORT:\s*5\s*\/\/\s*TEST MODE:.*/g,
    'BREAK_DURATION_SHORT: 5 * 60'
  );

  content = content.replace(
    /BREAK_DURATION_LONG:\s*10\s*\/\/\s*TEST MODE:.*/g,
    'BREAK_DURATION_LONG: 10 * 60'
  );

  fs.writeFileSync(CONSTANTS_PATH, content);
  console.log('✅ Normal timer restored!');
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

function exportDataset(dataset, name) {
  const outputPath = path.join(__dirname, `test-data-${name}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(dataset, null, 2));
  console.log(`\n📦 Dataset exported to: ${outputPath}`);
  console.log('\n📋 To import this data into the app:');
  console.log('   1. Open app in emulator/device');
  console.log('   2. Open Chrome DevTools (React Native Debugger)');
  console.log('   3. In Console, run:');
  console.log('\n   const data = ' + JSON.stringify(dataset, null, 2));
  console.log('\n   AsyncStorage.setItem("@adhd_app:tasks", JSON.stringify(data.tasks));');
  console.log('   AsyncStorage.setItem("@adhd_app:pomodoro_history", JSON.stringify(data.pomodoroHistory));');
  console.log('   AsyncStorage.setItem("@adhd_app:settings", JSON.stringify(data.settings));');
  console.log('\n   4. Reload app (Cmd+R / Ctrl+R)');
}

// ============================================================================
// CLI
// ============================================================================

const action = process.argv[2] || 'help';

console.log('\n🧪 TDAH Focus App - Test Setup Script\n');

switch (action) {
  case 'dataset-demo':
    console.log('📦 Generating DEMO dataset (for video)...');
    exportDataset(DEMO_DATASET, 'demo');
    console.log('✅ Demo dataset ready!');
    console.log('   - 8 pending tasks (5 mandatory, 3 optional)');
    console.log('   - 2 completed tasks');
    console.log('   - 3 Pomodoro sessions (2 yesterday, 1 today)');
    break;

  case 'dataset-full':
    console.log('📦 Generating FULL test dataset...');
    exportDataset(FULL_TEST_DATASET, 'full');
    console.log('✅ Full dataset ready!');
    console.log('   - 15 tasks total');
    console.log('   - Includes task with note');
    console.log('   - 3 Pomodoro sessions');
    break;

  case 'dataset-edge':
    console.log('📦 Generating EDGE CASE dataset (100+ tasks)...');
    const edgeDataset = generateEdgeCaseDataset();
    exportDataset(edgeDataset, 'edge');
    console.log('✅ Edge case dataset ready!');
    console.log('   - 100 tasks (50 mandatory, 50 optional)');
    console.log('   - 20 completed tasks');
    console.log('   - Tests performance with large dataset');
    break;

  case 'clear':
    console.log('🗑️  To clear all data:');
    console.log('   1. Open app in emulator');
    console.log('   2. Shake device (Cmd+D / Ctrl+D)');
    console.log('   3. Tap "Debug" → "Clear AsyncStorage"');
    console.log('   4. Reload app');
    console.log('\n   OR in Chrome DevTools Console:');
    console.log('   AsyncStorage.clear();');
    break;

  case 'timer-fast':
    setFastTimer();
    break;

  case 'timer-normal':
    setNormalTimer();
    break;

  case 'help':
  default:
    console.log('Usage: node scripts/test-setup.js [action]\n');
    console.log('Available actions:');
    console.log('  dataset-demo    - Generate demo dataset for video (10 tasks, 3 sessions)');
    console.log('  dataset-full    - Generate full test dataset (15 tasks with notes)');
    console.log('  dataset-edge    - Generate edge case dataset (100+ tasks)');
    console.log('  clear           - Instructions to clear all data');
    console.log('  timer-fast      - Enable fast timer (10sec work, 5sec break)');
    console.log('  timer-normal    - Restore normal timer (25min work, 5min break)');
    console.log('  help            - Show this help message');
    console.log('\nExamples:');
    console.log('  node scripts/test-setup.js dataset-demo');
    console.log('  node scripts/test-setup.js timer-fast');
    console.log('  node scripts/test-setup.js timer-normal');
    break;
}

console.log('');
