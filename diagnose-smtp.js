// diagnose-smtp.js - troubleshoot SMTP connection issues
const dns = require('dns').promises;
const net = require('net');
require('dotenv').config();

async function checkDNS() {
  console.log('\n1️⃣  Checking DNS resolution for', process.env.SMTP_HOST);
  try {
    const addresses = await dns.resolve4(process.env.SMTP_HOST);
    console.log('✅ DNS resolved:', addresses);
    return true;
  } catch (e) {
    console.error('❌ DNS failed:', e.message);
    return false;
  }
}

function checkPort() {
  return new Promise((resolve) => {
    console.log(`\n2️⃣  Checking port ${process.env.SMTP_PORT} on ${process.env.SMTP_HOST}`);
    const socket = new net.Socket();
    socket.setTimeout(5000);
    
    socket.on('connect', () => {
      console.log('✅ Port is open and listening');
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      console.error('❌ Connection timeout (firewall may be blocking)');
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', (e) => {
      console.error('❌ Connection failed:', e.message);
      socket.destroy();
      resolve(false);
    });
    
    socket.connect(Number(process.env.SMTP_PORT), process.env.SMTP_HOST);
  });
}

function checkEnv() {
  console.log('\n3️⃣  Checking environment variables:');
  const required = ['SMTP_HOST', 'SMTP_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_TO'];
  const missing = required.filter(k => !process.env[k]);
  
  if (missing.length) {
    console.error('❌ Missing:', missing);
    return false;
  }
  
  console.log('✅ SMTP_HOST:', process.env.SMTP_HOST);
  console.log('✅ SMTP_PORT:', process.env.SMTP_PORT);
  console.log('✅ EMAIL_USER:', process.env.EMAIL_USER);
  console.log('✅ EMAIL_PASS: (hidden)');
  console.log('✅ EMAIL_TO:', process.env.EMAIL_TO);
  return true;
}

(async () => {
  const dnsOk = await checkDNS();
  const portOk = await checkPort();
  const envOk = checkEnv();
  
  console.log('\n📋 Summary:');
  console.log(dnsOk ? '✅ DNS OK' : '❌ DNS failed');
  console.log(portOk ? '✅ Port OK' : '❌ Port blocked');
  console.log(envOk ? '✅ Env OK' : '❌ Env incomplete');
  
  if (!portOk) {
    console.log('\n💡 Troubleshooting:');
    console.log('  - Check firewall settings (port 465 may be blocked)');
    console.log('  - Try port 587 with SMTP_PORT=587');
    console.log('  - Check if corporate network blocks outbound mail');
  }
  
  if (!dnsOk) {
    console.log('\n💡 Check DNS - your network may not resolve smtp.gmail.com');
  }
})();
