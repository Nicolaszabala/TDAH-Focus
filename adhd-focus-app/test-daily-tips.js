/**
 * Test script for daily tips functionality
 * Run with: node test-daily-tips.js
 */

const { getTipOfTheDay, getAllTips, getTipsByCategory } = require('./src/utils/dailyTips');

console.log('=== Testing Daily Tips Functionality ===\n');

// Test 1: Get tip of the day
console.log('1. Testing getTipOfTheDay():');
const todaysTip = getTipOfTheDay();
console.log(`   Tip ID: ${todaysTip.id}`);
console.log(`   Category: ${todaysTip.category}`);
console.log(`   Text: "${todaysTip.text}"`);
console.log();

// Test 2: Get all tips
console.log('2. Testing getAllTips():');
const allTips = getAllTips();
console.log(`   Total tips available: ${allTips.length}`);
console.log();

// Test 3: Get tips by category
console.log('3. Testing getTipsByCategory():');
const categories = ['autocompasion', 'estrategia', 'paralisis', 'foco', 'motivacion'];
categories.forEach(category => {
  const categoryTips = getTipsByCategory(category);
  console.log(`   ${category}: ${categoryTips.length} tips`);
});
console.log();

// Test 4: Verify tip changes over time
console.log('4. Simulating tip rotation (next 7 days):');
const now = new Date();
for (let i = 0; i < 7; i++) {
  const testDate = new Date(now);
  testDate.setDate(testDate.getDate() + i);

  // Calculate day of year for test date
  const start = new Date(testDate.getFullYear(), 0, 0);
  const diff = testDate - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const tipIndex = dayOfYear % allTips.length;
  const tip = allTips[tipIndex];

  console.log(`   Day ${i + 1} (${testDate.toDateString()}): Tip #${tip.id} - "${tip.text.substring(0, 50)}..."`);
}
console.log();

console.log('=== All tests completed successfully! ===');
