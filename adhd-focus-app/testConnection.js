/**
 * Test connection to LLM backend API
 * Run with: node testConnection.js
 */

const API_URL = 'https://adhd-chatbot-api.onrender.com/api/chat';

console.log('='.repeat(60));
console.log('Testing ADHD Chatbot API Connection');
console.log('='.repeat(60));
console.log(`API URL: ${API_URL}`);
console.log(`Timestamp: ${new Date().toISOString()}`);
console.log('='.repeat(60));

async function testConnection() {
  console.log('\n1. Testing Health Endpoint...');
  try {
    const healthUrl = API_URL.replace('/api/chat', '/health');
    const healthResponse = await fetch(healthUrl);
    console.log(`   Status: ${healthResponse.status} ${healthResponse.statusText}`);

    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log(`   Backend Status: ${healthData.status}`);
      console.log(`   Environment: ${healthData.environment}`);
      console.log(`   Uptime: ${Math.round(healthData.uptime)}s`);
    }
  } catch (error) {
    console.error(`   ERROR: ${error.message}`);
  }

  console.log('\n2. Testing Chat Endpoint...');
  try {
    const startTime = Date.now();
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'No sé por dónde empezar',
        context: {
          tasks: [],
          pomodoroSessions: 0,
          hasPendingTasks: false,
        },
      }),
    });

    const elapsed = Date.now() - startTime;
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Response Time: ${elapsed}ms`);

    if (response.ok) {
      const data = await response.json();
      console.log(`   Response Length: ${data.response.length} chars`);
      console.log(`   Cached: ${data.cached}`);
      console.log(`   Processing Time: ${data.processingTime}ms`);
      console.log(`   Response Preview: ${data.response.substring(0, 100)}...`);
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error(`   ERROR: ${JSON.stringify(errorData)}`);
    }
  } catch (error) {
    console.error(`   ERROR: ${error.message}`);
    console.error(`   Error Name: ${error.name}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('Connection Test Complete');
  console.log('='.repeat(60));
}

testConnection().catch(console.error);
