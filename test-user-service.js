const http = require('http');

// Test configuration
const USER_SERVICE_PORT = 5000;
const GATEWAY_PORT = 6000;

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
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

// Test 1: Direct POST to User Service
async function testDirectUserCreation() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}TEST 1: Direct POST to User Service${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  
  const userData = JSON.stringify({
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'securePassword123'
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
    console.log(`${colors.blue}Status Code:${colors.reset} ${response.statusCode}`);
    console.log(`${colors.blue}Response Body:${colors.reset}`);
    console.log(response.body);
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      console.log(`${colors.green}✓ Test PASSED${colors.reset}`);
      return JSON.parse(response.body);
    } else {
      console.log(`${colors.red}✗ Test FAILED${colors.reset}`);
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Test FAILED with error: ${error.message}${colors.reset}`);
    return null;
  }
}

// Test 2: POST via Gateway
async function testGatewayUserCreation() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}TEST 2: POST to User Service via Gateway${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  
  const userData = JSON.stringify({
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: 'anotherSecurePass456'
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
    console.log(`${colors.blue}Status Code:${colors.reset} ${response.statusCode}`);
    console.log(`${colors.blue}Response Body:${colors.reset}`);
    console.log(response.body);
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      console.log(`${colors.green}✓ Test PASSED${colors.reset}`);
      return JSON.parse(response.body);
    } else {
      console.log(`${colors.red}✗ Test FAILED${colors.reset}`);
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Test FAILED with error: ${error.message}${colors.reset}`);
    return null;
  }
}

// Test 3: GET all users to verify creation
async function testGetAllUsers() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}TEST 3: GET all users (verification)${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  
  const options = {
    hostname: 'localhost',
    port: USER_SERVICE_PORT,
    path: '/users',
    method: 'GET'
  };
  
  try {
    const response = await makeRequest(options);
    console.log(`${colors.blue}Status Code:${colors.reset} ${response.statusCode}`);
    console.log(`${colors.blue}Response Body:${colors.reset}`);
    console.log(response.body);
    
    if (response.statusCode === 200) {
      const users = JSON.parse(response.body);
      console.log(`${colors.green}✓ Test PASSED - Found ${users.length} users${colors.reset}`);
      return users;
    } else {
      console.log(`${colors.red}✗ Test FAILED${colors.reset}`);
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Test FAILED with error: ${error.message}${colors.reset}`);
    return null;
  }
}

// Test 4: Health check
async function testHealthCheck() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}TEST 4: User Service Health Check${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  
  const options = {
    hostname: 'localhost',
    port: USER_SERVICE_PORT,
    path: '/health',
    method: 'GET'
  };
  
  try {
    const response = await makeRequest(options);
    console.log(`${colors.blue}Status Code:${colors.reset} ${response.statusCode}`);
    console.log(`${colors.blue}Response Body:${colors.reset}`);
    console.log(response.body);
    
    if (response.statusCode === 200) {
      console.log(`${colors.green}✓ Test PASSED${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}✗ Test FAILED${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Test FAILED with error: ${error.message}${colors.reset}`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log(`${colors.yellow}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.yellow}║   USER SERVICE POST TESTS              ║${colors.reset}`);
  console.log(`${colors.yellow}╚════════════════════════════════════════╝${colors.reset}`);
  
  await testHealthCheck();
  await testDirectUserCreation();
  await testGatewayUserCreation();
  await testGetAllUsers();
  
  console.log(`\n${colors.yellow}========================================${colors.reset}`);
  console.log(`${colors.yellow}All tests completed!${colors.reset}`);
  console.log(`${colors.yellow}========================================${colors.reset}\n`);
}

// Execute tests
runAllTests();
