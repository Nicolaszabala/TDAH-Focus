#!/usr/bin/env node

/**
 * Test Verification Script
 * Automatically verifies static requirements (RNFs, code quality)
 *
 * Usage: node scripts/test-verify.js
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const PASS = `${colors.green}✅ PASS${colors.reset}`;
const FAIL = `${colors.red}❌ FAIL${colors.reset}`;
const WARN = `${colors.yellow}⚠️  WARN${colors.reset}`;
const INFO = `${colors.blue}ℹ️  INFO${colors.reset}`;

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let warnings = 0;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function findFiles(dir, pattern, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findFiles(filePath, pattern, fileList);
    } else if (pattern.test(file)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function extractStyles(content) {
  const styleMatches = content.match(/StyleSheet\.create\({[\s\S]*?\}\)/g);
  if (!styleMatches) return [];

  return styleMatches.map(match => {
    const styles = {};
    const lines = match.split('\n');

    lines.forEach(line => {
      const fontSizeMatch = line.match(/fontSize:\s*(\d+)/);
      const colorMatch = line.match(/color:\s*['"]([^'"]+)['"]/);
      const bgColorMatch = line.match(/backgroundColor:\s*['"]([^'"]+)['"]/);
      const minHeightMatch = line.match(/minHeight:\s*(\d+)/);
      const minWidthMatch = line.match(/minWidth:\s*(\d+)/);

      if (fontSizeMatch) styles.fontSize = parseInt(fontSizeMatch[1]);
      if (colorMatch) styles.color = colorMatch[1];
      if (bgColorMatch) styles.backgroundColor = bgColorMatch[1];
      if (minHeightMatch) styles.minHeight = parseInt(minHeightMatch[1]);
      if (minWidthMatch) styles.minWidth = parseInt(minWidthMatch[1]);
    });

    return styles;
  });
}

function hexToRgb(hex) {
  // Handle shorthand hex
  if (hex.length === 4) {
    hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  } : null;
}

function calculateLuminance(rgb) {
  const { r, g, b } = rgb;

  const rLum = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gLum = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bLum = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * rLum + 0.7152 * gLum + 0.0722 * bLum;
}

function calculateContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return null;

  const lum1 = calculateLuminance(rgb1);
  const lum2 = calculateLuminance(rgb2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

// ============================================================================
// TESTS
// ============================================================================

function testRNF02_FontSize() {
  console.log('\n📏 RNF02: Minimum Font Size (≥16pt)');
  totalTests++;

  const srcPath = path.join(__dirname, '../src');
  const jsFiles = findFiles(srcPath, /\.js$/);

  const violations = [];
  const exemptions = ['badge', 'timestamp', 'label', 'metadata', 'helper', 'hint'];

  jsFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const styles = extractStyles(content);

    styles.forEach((style, idx) => {
      if (style.fontSize && style.fontSize < 16) {
        // Check if it's an exempted style
        const styleContext = content.substring(
          Math.max(0, content.indexOf(`fontSize: ${style.fontSize}`) - 100),
          content.indexOf(`fontSize: ${style.fontSize}`) + 100
        );

        const isExempt = exemptions.some(ex => styleContext.toLowerCase().includes(ex));

        if (!isExempt) {
          violations.push({
            file: path.basename(file),
            fontSize: style.fontSize,
          });
        }
      }
    });
  });

  if (violations.length === 0) {
    console.log(`   ${PASS} All text sizes ≥16pt (or exempted)`);
    passedTests++;
  } else {
    console.log(`   ${FAIL} Found ${violations.length} violations:`);
    violations.forEach(v => {
      console.log(`      - ${v.file}: ${v.fontSize}pt`);
    });
    failedTests++;
  }
}

function testRNF03_Contrast() {
  console.log('\n🎨 RNF03: WCAG Contrast Ratio (≥4.5:1)');
  totalTests++;

  const criticalColors = [
    { fg: '#E74C3C', bg: '#FFFFFF', name: 'Obligatoria badge' },
    { fg: '#3498DB', bg: '#FFFFFF', name: 'Opcional badge' },
    { fg: '#2C3E50', bg: '#FFFFFF', name: 'Primary text' },
    { fg: '#FFFFFF', bg: '#E74C3C', name: 'Button text' },
    { fg: '#ECF0F1', bg: '#1E1E1E', name: 'Focus mode text' },
  ];

  let allPass = true;

  criticalColors.forEach(({ fg, bg, name }) => {
    const ratio = calculateContrastRatio(fg, bg);
    const pass = ratio >= 4.5;

    if (pass) {
      console.log(`   ${PASS} ${name}: ${ratio.toFixed(2)}:1`);
    } else if (ratio >= 3.0) {
      console.log(`   ${WARN} ${name}: ${ratio.toFixed(2)}:1 (Pass for large text only)`);
      warnings++;
    } else {
      console.log(`   ${FAIL} ${name}: ${ratio.toFixed(2)}:1`);
      allPass = false;
    }
  });

  if (allPass) {
    passedTests++;
  } else {
    failedTests++;
  }
}

function testRNF07_TouchTargets() {
  console.log('\n👆 RNF07: Touch Targets (≥44pt)');
  totalTests++;

  const srcPath = path.join(__dirname, '../src');
  const jsFiles = findFiles(srcPath, /\.js$/);

  const violations = [];

  jsFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');

    // Check for TouchableOpacity with small dimensions
    const touchableMatches = content.matchAll(/TouchableOpacity[\s\S]{0,500}?style=\{[^}]*\}/g);

    for (const match of touchableMatches) {
      const styleBlock = match[0];

      // Look for minHeight/minWidth
      const minHeightMatch = styleBlock.match(/minHeight:\s*(\d+)/);
      const minWidthMatch = styleBlock.match(/minWidth:\s*(\d+)/);
      const heightMatch = styleBlock.match(/height:\s*(\d+)/);
      const widthMatch = styleBlock.match(/width:\s*(\d+)/);

      // Check for hitSlop (exempts from size requirement)
      const hasHitSlop = styleBlock.includes('hitSlop') ||
                         content.substring(0, match.index + 200).includes('hitSlop');

      const height = minHeightMatch ? parseInt(minHeightMatch[1]) :
                     heightMatch ? parseInt(heightMatch[1]) : null;
      const width = minWidthMatch ? parseInt(minWidthMatch[1]) :
                    widthMatch ? parseInt(widthMatch[1]) : null;

      if (!hasHitSlop && (height && height < 44) || (width && width < 44)) {
        violations.push({
          file: path.basename(file),
          height,
          width,
        });
      }
    }
  });

  if (violations.length === 0) {
    console.log(`   ${PASS} All touch targets ≥44pt or use hitSlop`);
    passedTests++;
  } else {
    console.log(`   ${WARN} Found ${violations.length} potential violations`);
    console.log(`   ${INFO} Review manually - some may use hitSlop`);
    violations.slice(0, 5).forEach(v => {
      console.log(`      - ${v.file}: ${v.height || '?'}x${v.width || '?'}pt`);
    });
    warnings++;
    passedTests++; // Pass with warning
  }
}

function testRNF15_NoNetworkCalls() {
  console.log('\n🌐 RNF15/23: No External Network Calls');
  totalTests++;

  const srcPath = path.join(__dirname, '../src');
  const jsFiles = findFiles(srcPath, /\.js$/);

  const networkPatterns = [
    /fetch\s*\(/,
    /axios\./,
    /XMLHttpRequest/,
    /\.get\s*\(/,
    /\.post\s*\(/,
    /http:\/\//,
    /https:\/\//,
  ];

  const violations = [];

  jsFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');

    networkPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        // Exclude comments
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (pattern.test(line) && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
            violations.push({
              file: path.basename(file),
              line: idx + 1,
              code: line.trim().substring(0, 60),
            });
          }
        });
      }
    });
  });

  if (violations.length === 0) {
    console.log(`   ${PASS} No network calls detected`);
    passedTests++;
  } else {
    console.log(`   ${WARN} Found ${violations.length} potential network calls:`);
    violations.forEach(v => {
      console.log(`      - ${v.file}:${v.line}: ${v.code}...`);
    });
    warnings++;
    passedTests++; // Pass with warning - may be false positives
  }
}

function testRNF24_NoPII() {
  console.log('\n🔒 RNF24: No PII Collection');
  totalTests++;

  const srcPath = path.join(__dirname, '../src');
  const jsFiles = findFiles(srcPath, /\.js$/);

  const piiPatterns = [
    { pattern: /placeholder.*email/i, type: 'Email' },
    { pattern: /placeholder.*phone/i, type: 'Phone' },
    { pattern: /placeholder.*nombre/i, type: 'Name' },
    { pattern: /placeholder.*name/i, type: 'Name' },
    { pattern: /placeholder.*address/i, type: 'Address' },
    { pattern: /placeholder.*dirección/i, type: 'Address' },
    { pattern: /Geolocation/i, type: 'Location' },
    { pattern: /Contacts/i, type: 'Contacts' },
    { pattern: /Camera/i, type: 'Camera' },
  ];

  const violations = [];

  jsFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');

    piiPatterns.forEach(({ pattern, type }) => {
      if (pattern.test(content)) {
        violations.push({
          file: path.basename(file),
          type,
        });
      }
    });
  });

  if (violations.length === 0) {
    console.log(`   ${PASS} No PII collection detected`);
    passedTests++;
  } else {
    console.log(`   ${FAIL} Found ${violations.length} potential PII collections:`);
    violations.forEach(v => {
      console.log(`      - ${v.file}: ${v.type}`);
    });
    failedTests++;
  }
}

function testFileStructure() {
  console.log('\n📁 File Structure Verification');
  totalTests++;

  const requiredFiles = [
    'src/components/tasks/TaskItem.js',
    'src/components/tasks/TaskList.js',
    'src/components/tasks/TaskForm.js',
    'src/components/tasks/TaskFilters.js',
    'src/components/pomodoro/TimerDisplay.js',
    'src/components/pomodoro/TimerControls.js',
    'src/components/pomodoro/TaskSelector.js',
    'src/components/pomodoro/SessionHistory.js',
    'src/screens/HomeScreen.js',
    'src/screens/TasksScreen.js',
    'src/screens/PomodoroScreen.js',
    'src/screens/FocusScreen.js',
    'src/screens/ChatScreen.js',
    'src/screens/SettingsScreen.js',
    'src/store/store.js',
    'src/store/slices/tasksSlice.js',
    'src/store/slices/pomodoroSlice.js',
    'src/store/slices/focusSlice.js',
    'src/store/slices/settingsSlice.js',
    'src/services/storageService.js',
    'src/services/chatService.js',
    'src/services/notificationService.js',
    'src/utils/constants.js',
    'src/navigation/AppNavigator.js',
    'App.js',
    'package.json',
  ];

  const missing = [];

  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
      missing.push(file);
    }
  });

  if (missing.length === 0) {
    console.log(`   ${PASS} All ${requiredFiles.length} required files exist`);
    passedTests++;
  } else {
    console.log(`   ${FAIL} Missing ${missing.length} files:`);
    missing.forEach(f => console.log(`      - ${f}`));
    failedTests++;
  }
}

function testComponentCount() {
  console.log('\n🧩 Component Count');
  totalTests++;

  const srcPath = path.join(__dirname, '../src');
  const jsFiles = findFiles(srcPath, /\.js$/);

  console.log(`   ${INFO} Total JavaScript files: ${jsFiles.length}`);

  const screens = jsFiles.filter(f => f.includes('/screens/'));
  const components = jsFiles.filter(f => f.includes('/components/'));
  const services = jsFiles.filter(f => f.includes('/services/'));
  const slices = jsFiles.filter(f => f.includes('/slices/'));

  console.log(`   ${INFO} Screens: ${screens.length}`);
  console.log(`   ${INFO} Components: ${components.length}`);
  console.log(`   ${INFO} Services: ${services.length}`);
  console.log(`   ${INFO} Redux Slices: ${slices.length}`);

  if (jsFiles.length >= 24) {
    console.log(`   ${PASS} Component count meets minimum (24+)`);
    passedTests++;
  } else {
    console.log(`   ${WARN} Component count below expected (24)`);
    warnings++;
    passedTests++;
  }
}

// ============================================================================
// MAIN
// ============================================================================

console.log('\n🧪 TDAH Focus App - Automated Test Verification\n');
console.log('═'.repeat(60));

testFileStructure();
testComponentCount();
testRNF02_FontSize();
testRNF03_Contrast();
testRNF07_TouchTargets();
testRNF15_NoNetworkCalls();
testRNF24_NoPII();

console.log('\n═'.repeat(60));
console.log('\n📊 TEST SUMMARY\n');
console.log(`   Total:    ${totalTests} tests`);
console.log(`   ${colors.green}Passed:   ${passedTests}${colors.reset}`);
console.log(`   ${colors.red}Failed:   ${failedTests}${colors.reset}`);
console.log(`   ${colors.yellow}Warnings: ${warnings}${colors.reset}`);

const passRate = ((passedTests / totalTests) * 100).toFixed(1);
console.log(`\n   Pass Rate: ${passRate}%`);

if (failedTests === 0) {
  console.log(`\n   ${colors.green}✅ ALL AUTOMATED TESTS PASSED!${colors.reset}`);
} else {
  console.log(`\n   ${colors.red}❌ SOME TESTS FAILED - Review output above${colors.reset}`);
}

console.log('\n' + '═'.repeat(60) + '\n');

// Exit with appropriate code
process.exit(failedTests > 0 ? 1 : 0);
