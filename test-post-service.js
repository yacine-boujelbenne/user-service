const http = require('http');

// Test configuration
const POST_SERVICE_PORT = 5001;
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

// Test 1: Direct POST to Post Service
async function testDirectPostCreation() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}TEST 1: Direct POST to Post Service${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  
  const postData = JSON.stringify({
    title: 'My First Post',
    content: 'This is the content of my first post. It contains interesting information!',
    userId: 'user123'
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
async function testGatewayPostCreation() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}TEST 2: POST to Post Service via Gateway${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  
  const postData = JSON.stringify({
    title: 'Second Post via Gateway',
    content: 'This post was created through the API Gateway. Testing microservices communication!',
    userId: 'user456'
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

// Test 3: GET all posts to verify creation
async function testGetAllPosts() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}TEST 3: GET all posts (verification)${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  
  const options = {
    hostname: 'localhost',
    port: POST_SERVICE_PORT,
    path: '/posts',
    method: 'GET'
  };
  
  try {
    const response = await makeRequest(options);
    console.log(`${colors.blue}Status Code:${colors.reset} ${response.statusCode}`);
    console.log(`${colors.blue}Response Body:${colors.reset}`);
    console.log(response.body);
    
    if (response.statusCode === 200) {
      const posts = JSON.parse(response.body);
      console.log(`${colors.green}✓ Test PASSED - Found ${posts.length} posts${colors.reset}`);
      return posts;
    } else {
      console.log(`${colors.red}✗ Test FAILED${colors.reset}`);
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Test FAILED with error: ${error.message}${colors.reset}`);
    return null;
  }
}

// Test 4: GET specific post by ID
async function testGetPostById(postId) {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}TEST 4: GET post by ID${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  
  const options = {
    hostname: 'localhost',
    port: POST_SERVICE_PORT,
    path: `/posts/${postId}`,
    method: 'GET'
  };
  
  try {
    const response = await makeRequest(options);
    console.log(`${colors.blue}Status Code:${colors.reset} ${response.statusCode}`);
    console.log(`${colors.blue}Response Body:${colors.reset}`);
    console.log(response.body);
    
    if (response.statusCode === 200) {
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

// Test 5: Health check
async function testHealthCheck() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}TEST 5: Post Service Health Check${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  
  const options = {
    hostname: 'localhost',
    port: POST_SERVICE_PORT,
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
  console.log(`${colors.yellow}║   POST SERVICE POST TESTS              ║${colors.reset}`);
  console.log(`${colors.yellow}╚════════════════════════════════════════╝${colors.reset}`);
  
  await testHealthCheck();
  const post1 = await testDirectPostCreation();
  const post2 = await testGatewayPostCreation();
  await testGetAllPosts();
  
  // Test getting a specific post if we created one successfully
  if (post1 && post1._id) {
    await testGetPostById(post1._id);
  }
  
  console.log(`\n${colors.yellow}========================================${colors.reset}`);
  console.log(`${colors.yellow}All tests completed!${colors.reset}`);
  console.log(`${colors.yellow}========================================${colors.reset}\n`);
}

// Execute tests
runAllTests();
