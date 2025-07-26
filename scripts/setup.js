#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 GitHub Search MCP Setup Assistant\n');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function setupEnvironment() {
  const envPath = path.join(projectRoot, '.env');
  const envExamplePath = path.join(projectRoot, '.env.example');

  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file already exists');
    const overwrite = await askQuestion('Do you want to overwrite it? (y/N): ');
    if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
      console.log('📋 Keeping existing .env file');
      return;
    }
  }

  // Copy from example
  if (fs.existsSync(envExamplePath)) {
    let envContent = fs.readFileSync(envExamplePath, 'utf8');
    
    console.log('\n📝 Setting up environment variables...\n');
    
    // Ask for GitHub token
    console.log('To use this application, you need a GitHub Personal Access Token.');
    console.log('Get one from: https://github.com/settings/tokens\n');
    
    const token = await askQuestion('Enter your GitHub Personal Access Token (or press Enter to skip): ');
    if (token) {
      envContent = envContent.replace('your_github_personal_access_token_here', token);
    }
    
    // Ask for port
    const port = await askQuestion('Enter port number (default: 3000): ');
    if (port && !isNaN(port)) {
      envContent = envContent.replace('PORT=3000', `PORT=${port}`);
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file');
  } else {
    console.log('❌ .env.example file not found');
  }
}

async function checkNodeVersion() {
  const version = process.version;
  const majorVersion = parseInt(version.split('.')[0].substring(1));
  
  console.log(`📋 Node.js version: ${version}`);
  
  if (majorVersion < 18) {
    console.log('⚠️  Warning: This application requires Node.js 18.0.0 or higher');
    console.log('   Please upgrade your Node.js version');
    return false;
  }
  
  console.log('✅ Node.js version is compatible');
  return true;
}

async function installDependencies() {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const nodeModulesPath = path.join(projectRoot, 'node_modules');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ package.json not found');
    return false;
  }
  
  if (fs.existsSync(nodeModulesPath)) {
    console.log('✅ Dependencies already installed');
    return true;
  }
  
  console.log('📦 Installing dependencies...');
  console.log('   Run: npm install');
  console.log('   (Please run this command manually)');
  return true;
}

async function createDirectories() {
  const dirs = [
    path.join(projectRoot, 'logs'),
    path.join(projectRoot, 'temp')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${path.relative(projectRoot, dir)}`);
    }
  });
}

async function showNextSteps() {
  console.log('\n🎉 Setup complete! Next steps:\n');
  
  console.log('1. Install dependencies:');
  console.log('   npm install\n');
  
  console.log('2. Start the development server:');
  console.log('   npm run dev\n');
  
  console.log('3. Open your browser:');
  console.log('   http://localhost:3000\n');
  
  console.log('4. For MCP integration, add this to your MCP client config:');
  console.log('   {');
  console.log('     "mcpServers": {');
  console.log('       "github-search": {');
  console.log('         "command": "node",');
  console.log(`         "args": ["${path.join(projectRoot, 'src/server.js')}"],`);
  console.log('         "env": {');
  console.log('           "GITHUB_TOKEN": "your_token_here"');
  console.log('         }');
  console.log('       }');
  console.log('     }');
  console.log('   }\n');
  
  console.log('📖 For more information, see README.md');
  console.log('🆘 For support, check the troubleshooting section in README.md');
}

async function main() {
  try {
    console.log('🔍 Checking system requirements...');
    const nodeOk = await checkNodeVersion();
    
    if (!nodeOk) {
      process.exit(1);
    }
    
    console.log('\n📁 Creating directories...');
    await createDirectories();
    
    console.log('\n⚙️  Setting up environment...');
    await setupEnvironment();
    
    console.log('\n📦 Checking dependencies...');
    await installDependencies();
    
    await showNextSteps();
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main(); 