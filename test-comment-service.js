const http = require('http');

// Test configuration
const COMMENT_SERVICE_PORT = 5002;
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

// Test 1: Direct POST to Comment Service
async function testDirectCommentCreation() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}TEST 1: Direct POST to Comment Service${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  
  const commentData = JSON.stringify({
    text: 'This is my first comment on this post!',
    postId: 'post123',
    userId: 'user789'
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
async function testGatewayCommentCreation() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}TEST 2: POST to Comment Service via Gateway${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  
  const commentData = JSON.stringify({
    text: 'Great post! This comment was created through the gateway.',
    postId: 'post456',
    userId: 'user101'
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

// Test 3: Create multiple comments for the same post
async function testMultipleCommentsOnSamePost() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}TEST 3: Create multiple comments on same post${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  
  const testPostId = 'post999';
  const comments = [
    { text: 'First comment on this post', postId: testPostId, userId: 'user201' },
    { text: 'Second comment - I agree!', postId: testPostId, userId: 'user202' },
    { text: 'Third comment - very interesting', postId: testPostId, userId: 'user203' }
  ];
  
  let successCount = 0;
  
  for (let i = 0; i < comments.length; i++) {
    const commentData = JSON.stringify(comments[i]);
    
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
      console.log(`${colors.blue}Comment ${i + 1} - Status Code:${colors.reset} ${response.statusCode}`);
      
      if (response.statusCode === 200 || response.statusCode === 201) {
        successCount++;
      }
    } catch (error) {
      console.log(`${colors.red}Comment ${i + 1} - Error: ${error.message}${colors.reset}`);
    }
  }
  
  console.log(`\n${colors.blue}Created ${successCount}/${comments.length} comments successfully${colors.reset}`);
  
  if (successCount === comments.length) {
    console.log(`${colors.green}✓ Test PASSED${colors.reset}`);
    return testPostId;
  } else {
    console.log(`${colors.red}✗ Test FAILED${colors.reset}`);
    return null;
  }
}

// Test 4: GET all comments
async function testGetAllComments() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}TEST 4: GET all comments (verification)${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  
  const options = {
    hostname: 'localhost',
    port: COMMENT_SERVICE_PORT,
    path: '/comments',
    method: 'GET'
  };
  
  try {
    const response = await makeRequest(options);
    console.log(`${colors.blue}Status Code:${colors.reset} ${response.statusCode}`);
    console.log(`${colors.blue}Response Body:${colors.reset}`);
    console.log(response.body);
    
    if (response.statusCode === 200) {
      const comments = JSON.parse(response.body);
      console.log(`${colors.green}✓ Test PASSED - Found ${comments.length} comments${colors.reset}`);
      return comments;
    } else {
      console.log(`${colors.red}✗ Test FAILED${colors.reset}`);
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Test FAILED with error: ${error.message}${colors.reset}`);
    return null;
  }
}

// Test 5: GET comments for a specific post
async function testGetCommentsByPostId(postId) {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}TEST 5: GET comments for post ${postId}${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  
  const options = {
    hostname: 'localhost',
    port: COMMENT_SERVICE_PORT,
    path: `/comments/post/${postId}`,
    method: 'GET'
  };
  
  try {
    const response = await makeRequest(options);
    console.log(`${colors.blue}Status Code:${colors.reset} ${response.statusCode}`);
    console.log(`${colors.blue}Response Body:${colors.reset}`);
    console.log(response.body);
    
    if (response.statusCode === 200) {
      const comments = JSON.parse(response.body);
      console.log(`${colors.green}✓ Test PASSED - Found ${comments.length} comments for this post${colors.reset}`);
      return comments;
    } else {
      console.log(`${colors.red}✗ Test FAILED${colors.reset}`);
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Test FAILED with error: ${error.message}${colors.reset}`);
    return null;
  }
}

// Test 6: Health check
async function testHealthCheck() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}TEST 6: Comment Service Health Check${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  
  const options = {
    hostname: 'localhost',
    port: COMMENT_SERVICE_PORT,
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
  console.log(`${colors.yellow}║   COMMENT SERVICE POST TESTS           ║${colors.reset}`);
  console.log(`${colors.yellow}╚════════════════════════════════════════╝${colors.reset}`);
  
  await testHealthCheck();
  await testDirectCommentCreation();
  await testGatewayCommentCreation();
  const testPostId = await testMultipleCommentsOnSamePost();
  await testGetAllComments();
  
  // Test getting comments for a specific post if we created them successfully
  if (testPostId) {
    await testGetCommentsByPostId(testPostId);
  }
  
  console.log(`\n${colors.yellow}========================================${colors.reset}`);
  console.log(`${colors.yellow}All tests completed!${colors.reset}`);
  console.log(`${colors.yellow}========================================${colors.reset}\n`);
}

// Execute tests
runAllTests();
