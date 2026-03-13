const http = require('http');

// Test configuration
const USER_SERVICE_PORT = 5000;
const POST_SERVICE_PORT = 5001;
const COMMENT_SERVICE_PORT = 5002;
const GATEWAY_PORT = 4000;

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

// Helper function to make HTTP requests
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// Helper to record test result
function recordTest(passed) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

// ========================================
// USER SERVICE TESTS
// ========================================

async function testUserServiceHealth() {
  console.log(`\n${colors.cyan}TEST: User Service Health Check${colors.reset}`);
  
  const options = {
    hostname: 'localhost',
    port: USER_SERVICE_PORT,
    path: '/health',
    method: 'GET'
  };
  
  try {
    const response = await makeRequest(options);
    console.log(`Status: ${response.statusCode}`);
    const passed = response.statusCode === 200;
    recordTest(passed);
    console.log(passed ? `${colors.green}✓ PASSED${colors.reset}` : `${colors.red}✗ FAILED${colors.reset}`);
    return passed;
  } catch (error) {
    console.log(`${colors.red}✗ FAILED: ${error.message}${colors.reset}`);
    recordTest(false);
    return false;
  }
}

async function testCreateUser() {
  console.log(`\n${colors.cyan}TEST: Create User via POST${colors.reset}`);
  
  const userData = JSON.stringify({
    name: 'Test User',
    email: `test.user.${Date.now()}@example.com`,
    password: 'testPassword123'
  });
  
  const options = {
    hostname: 'localhost',
    port: USER_SERVICE_PORT,
    path: '/users',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(userData)
    }
  };
  
  try {
    const response = await makeRequest(options, userData);
    console.log(`Status: ${response.statusCode}`);
    const passed = response.statusCode === 200 || response.statusCode === 201;
    recordTest(passed);
    console.log(passed ? `${colors.green}✓ PASSED${colors.reset}` : `${colors.red}✗ FAILED${colors.reset}`);
    return passed ? JSON.parse(response.body) : null;
  } catch (error) {
    console.log(`${colors.red}✗ FAILED: ${error.message}${colors.reset}`);
    recordTest(false);
    return null;
  }
}

async function testCreateUserViaGateway() {
  console.log(`\n${colors.cyan}TEST: Create User via Gateway${colors.reset}`);
  
  const userData = JSON.stringify({
    name: 'Gateway User',
    email: `gateway.user.${Date.now()}@example.com`,
    password: 'gatewayPass456'
  });
  
  const options = {
    hostname: 'localhost',
    port: GATEWAY_PORT,
    path: '/users',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(userData)
    }
  };
  
  try {
    const response = await makeRequest(options, userData);
    console.log(`Status: ${response.statusCode}`);
    const passed = response.statusCode === 200 || response.statusCode === 201;
    recordTest(passed);
    console.log(passed ? `${colors.green}✓ PASSED${colors.reset}` : `${colors.red}✗ FAILED${colors.reset}`);
    return passed ? JSON.parse(response.body) : null;
  } catch (error) {
    console.log(`${colors.red}✗ FAILED: ${error.message}${colors.reset}`);
    recordTest(false);
    return null;
  }
}

// ========================================
// POST SERVICE TESTS
// ========================================

async function testPostServiceHealth() {
  console.log(`\n${colors.cyan}TEST: Post Service Health Check${colors.reset}`);
  
  const options = {
    hostname: 'localhost',
    port: POST_SERVICE_PORT,
    path: '/health',
    method: 'GET'
  };
  
  try {
    const response = await makeRequest(options);
    console.log(`Status: ${response.statusCode}`);
    const passed = response.statusCode === 200;
    recordTest(passed);
    console.log(passed ? `${colors.green}✓ PASSED${colors.reset}` : `${colors.red}✗ FAILED${colors.reset}`);
    return passed;
  } catch (error) {
    console.log(`${colors.red}✗ FAILED: ${error.message}${colors.reset}`);
    recordTest(false);
    return false;
  }
}

async function testCreatePost() {
  console.log(`\n${colors.cyan}TEST: Create Post via POST${colors.reset}`);
  
  const postData = JSON.stringify({
    title: `Test Post ${Date.now()}`,
    content: 'This is a test post created by the automated test suite.',
    userId: 'testUser123'
  });
  
  const options = {
    hostname: 'localhost',
    port: POST_SERVICE_PORT,
    path: '/posts',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  try {
    const response = await makeRequest(options, postData);
    console.log(`Status: ${response.statusCode}`);
    const passed = response.statusCode === 200 || response.statusCode === 201;
    recordTest(passed);
    console.log(passed ? `${colors.green}✓ PASSED${colors.reset}` : `${colors.red}✗ FAILED${colors.reset}`);
    return passed ? JSON.parse(response.body) : null;
  } catch (error) {
    console.log(`${colors.red}✗ FAILED: ${error.message}${colors.reset}`);
    recordTest(false);
    return null;
  }
}

async function testCreatePostViaGateway() {
  console.log(`\n${colors.cyan}TEST: Create Post via Gateway${colors.reset}`);
  
  const postData = JSON.stringify({
    title: `Gateway Post ${Date.now()}`,
    content: 'This post was created through the API Gateway.',
    userId: 'gatewayUser456'
  });
  
  const options = {
    hostname: 'localhost',
    port: GATEWAY_PORT,
    path: '/posts',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  try {
    const response = await makeRequest(options, postData);
    console.log(`Status: ${response.statusCode}`);
    const passed = response.statusCode === 200 || response.statusCode === 201;
    recordTest(passed);
    console.log(passed ? `${colors.green}✓ PASSED${colors.reset}` : `${colors.red}✗ FAILED${colors.reset}`);
    return passed ? JSON.parse(response.body) : null;
  } catch (error) {
    console.log(`${colors.red}✗ FAILED: ${error.message}${colors.reset}`);
    recordTest(false);
    return null;
  }
}

// ========================================
// COMMENT SERVICE TESTS
// ========================================

async function testCommentServiceHealth() {
  console.log(`\n${colors.cyan}TEST: Comment Service Health Check${colors.reset}`);
  
  const options = {
    hostname: 'localhost',
    port: COMMENT_SERVICE_PORT,
    path: '/health',
    method: 'GET'
  };
  
  try {
    const response = await makeRequest(options);
    console.log(`Status: ${response.statusCode}`);
    const passed = response.statusCode === 200;
    recordTest(passed);
    console.log(passed ? `${colors.green}✓ PASSED${colors.reset}` : `${colors.red}✗ FAILED${colors.reset}`);
    return passed;
  } catch (error) {
    console.log(`${colors.red}✗ FAILED: ${error.message}${colors.reset}`);
    recordTest(false);
    return false;
  }
}

async function testCreateComment() {
  console.log(`\n${colors.cyan}TEST: Create Comment via POST${colors.reset}`);
  
  const commentData = JSON.stringify({
    text: `Test comment created at ${new Date().toISOString()}`,
    postId: 'testPost123',
    userId: 'testUser789'
  });
  
  const options = {
    hostname: 'localhost',
    port: COMMENT_SERVICE_PORT,
    path: '/comments',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(commentData)
    }
  };
  
  try {
    const response = await makeRequest(options, commentData);
    console.log(`Status: ${response.statusCode}`);
    const passed = response.statusCode === 200 || response.statusCode === 201;
    recordTest(passed);
    console.log(passed ? `${colors.green}✓ PASSED${colors.reset}` : `${colors.red}✗ FAILED${colors.reset}`);
    return passed ? JSON.parse(response.body) : null;
  } catch (error) {
    console.log(`${colors.red}✗ FAILED: ${error.message}${colors.reset}`);
    recordTest(false);
    return null;
  }
}

async function testCreateCommentViaGateway() {
  console.log(`\n${colors.cyan}TEST: Create Comment via Gateway${colors.reset}`);
  
  const commentData = JSON.stringify({
    text: 'This comment was created through the gateway!',
    postId: 'gatewayPost456',
    userId: 'gatewayUser101'
  });
  
  const options = {
    hostname: 'localhost',
    port: GATEWAY_PORT,
    path: '/comments',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(commentData)
    }
  };
  
  try {
    const response = await makeRequest(options, commentData);
    console.log(`Status: ${response.statusCode}`);
    const passed = response.statusCode === 200 || response.statusCode === 201;
    recordTest(passed);
    console.log(passed ? `${colors.green}✓ PASSED${colors.reset}` : `${colors.red}✗ FAILED${colors.reset}`);
    return passed ? JSON.parse(response.body) : null;
  } catch (error) {
    console.log(`${colors.red}✗ FAILED: ${error.message}${colors.reset}`);
    recordTest(false);
    return null;
  }
}

// ========================================
// GATEWAY HEALTH CHECK
// ========================================

async function testGatewayHealth() {
  console.log(`\n${colors.cyan}TEST: Gateway Health Check${colors.reset}`);
  
  const options = {
    hostname: 'localhost',
    port: GATEWAY_PORT,
    path: '/health',
    method: 'GET'
  };
  
  try {
    const response = await makeRequest(options);
    console.log(`Status: ${response.statusCode}`);
    const passed = response.statusCode === 200;
    recordTest(passed);
    console.log(passed ? `${colors.green}✓ PASSED${colors.reset}` : `${colors.red}✗ FAILED${colors.reset}`);
    return passed;
  } catch (error) {
    console.log(`${colors.red}✗ FAILED: ${error.message}${colors.reset}`);
    recordTest(false);
    return false;
  }
}

// ========================================
// MAIN TEST RUNNER
// ========================================

async function runAllTests() {
  console.log(`${colors.bold}${colors.magenta}`);
  console.log(`╔════════════════════════════════════════════════════════╗`);
  console.log(`║                                                        ║`);
  console.log(`║     MICROSERVICES POST TESTS - COMPLETE SUITE         ║`);
  console.log(`║                                                        ║`);
  console.log(`╚════════════════════════════════════════════════════════╝`);
  console.log(`${colors.reset}`);
  
  // Gateway Health
  console.log(`\n${colors.yellow}${colors.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.yellow}${colors.bold}  GATEWAY SERVICE${colors.reset}`);
  console.log(`${colors.yellow}${colors.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  await testGatewayHealth();
  
  // User Service Tests
  console.log(`\n${colors.yellow}${colors.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.yellow}${colors.bold}  USER SERVICE${colors.reset}`);
  console.log(`${colors.yellow}${colors.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  await testUserServiceHealth();
  await testCreateUser();
  await testCreateUserViaGateway();
  
  // Post Service Tests
  console.log(`\n${colors.yellow}${colors.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.yellow}${colors.bold}  POST SERVICE${colors.reset}`);
  console.log(`${colors.yellow}${colors.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  await testPostServiceHealth();
  await testCreatePost();
  await testCreatePostViaGateway();
  
  // Comment Service Tests
  console.log(`\n${colors.yellow}${colors.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.yellow}${colors.bold}  COMMENT SERVICE${colors.reset}`);
  console.log(`${colors.yellow}${colors.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  await testCommentServiceHealth();
  await testCreateComment();
  await testCreateCommentViaGateway();
  
  // Summary
  console.log(`\n${colors.bold}${colors.magenta}`);
  console.log(`╔════════════════════════════════════════════════════════╗`);
  console.log(`║                   TEST SUMMARY                         ║`);
  console.log(`╚════════════════════════════════════════════════════════╝`);
  console.log(`${colors.reset}`);
  console.log(`${colors.blue}Total Tests:${colors.reset} ${testResults.total}`);
  console.log(`${colors.green}Passed:${colors.reset} ${testResults.passed}`);
  console.log(`${colors.red}Failed:${colors.reset} ${testResults.failed}`);
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  console.log(`${colors.yellow}Success Rate:${colors.reset} ${successRate}%`);
  
  if (testResults.failed === 0) {
    console.log(`\n${colors.green}${colors.bold}🎉 ALL TESTS PASSED! 🎉${colors.reset}\n`);
  } else {
    console.log(`\n${colors.red}${colors.bold}⚠️  SOME TESTS FAILED ⚠️${colors.reset}\n`);
  }
}

// Execute all tests
runAllTests();
