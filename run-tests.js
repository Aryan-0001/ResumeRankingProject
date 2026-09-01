#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting AI Resume Ranking System Test Suite...\n');

// Check if backend is running
const checkBackend = () => {
  return new Promise((resolve) => {
    const http = require('http');
    const req = http.request('http://localhost:8000/health', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
};

const runCommand = (command, args, description) => {
  return new Promise((resolve, reject) => {
    console.log(`📋 ${description}...`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${description} completed successfully\n`);
        resolve();
      } else {
        console.log(`❌ ${description} failed with code ${code}\n`);
        reject(new Error(`${description} failed`));
      }
    });
    
    child.on('error', (error) => {
      console.log(`❌ ${description} error: ${error.message}\n`);
      reject(error);
    });
  });
};

const main = async () => {
  try {
    // Check prerequisites
    console.log('🔍 Checking prerequisites...');
    
    // Check if backend is running
    const backendRunning = await checkBackend();
    if (!backendRunning) {
      console.log('❌ Backend server is not running on http://localhost:8000');
      console.log('💡 Please start the backend first:');
      console.log('   cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000\n');
      process.exit(1);
    }
    
    console.log('✅ Backend server is running\n');
    
    // Install dependencies if needed
    try {
      await runCommand('npm', ['list', '@playwright/test'], 'Checking Playwright installation');
    } catch (error) {
      console.log('📦 Installing Playwright...');
      await runCommand('npm', ['install'], 'Installing dependencies');
      await runCommand('npx', ['playwright', 'install'], 'Installing browser binaries');
    }
    
    // Run tests based on arguments
    const args = process.argv.slice(2);
    let testCommand = 'npx playwright test';
    
    if (args.length === 0) {
      // No arguments - run all tests
      console.log('🧪 Running all tests...\n');
    } else if (args[0] === 'auth') {
      testCommand = 'npx playwright test tests/auth.spec.js';
      console.log('🔐 Running authentication tests...\n');
    } else if (args[0] === 'candidate') {
      testCommand = 'npx playwright test tests/candidate-dashboard.spec.js';
      console.log('👤 Running candidate dashboard tests...\n');
    } else if (args[0] === 'company') {
      testCommand = 'npx playwright test tests/company-dashboard.spec.js';
      console.log('🏢 Running company dashboard tests...\n');
    } else if (args[0] === 'api') {
      testCommand = 'npx playwright test tests/api-integration.spec.js';
      console.log('🔌 Running API integration tests...\n');
    } else if (args[0] === 'performance') {
      testCommand = 'npx playwright test tests/performance.spec.js';
      console.log('⚡ Running performance tests...\n');
    } else if (args[0] === 'accessibility') {
      testCommand = 'npx playwright test tests/accessibility.spec.js';
      console.log('♿ Running accessibility tests...\n');
    } else if (args[0] === 'ui') {
      testCommand = 'npx playwright test --ui';
      console.log('🖥️ Running tests in UI mode...\n');
    } else if (args[0] === 'debug') {
      testCommand = 'npx playwright test --debug';
      console.log('🐛 Running tests in debug mode...\n');
    } else {
      testCommand = `npx playwright test ${args.join(' ')}`;
      console.log(`🧪 Running custom test command: ${testCommand}\n`);
    }
    
    // Run the tests
    await runCommand('npx', testCommand.split(' '), 'Running tests');
    
    // Show report
    console.log('📊 Generating test report...');
    await runCommand('npx', ['playwright', 'show-report'], 'Opening test report');
    
    console.log('🎉 Test suite completed successfully!');
    console.log('📈 Check the HTML report for detailed results.\n');
    
  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test suite interrupted by user');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test suite terminated');
  process.exit(1);
});

// Run main function
main().catch(console.error);
