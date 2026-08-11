const mongoose = require('mongoose');
require('dotenv').config();

async function warmup() {
  const API = process.env.VITE_API_URL || 'http://localhost:5000';
  console.log('🔥 WARMING UP LLM ENDPOINTS (GROQ LLaMA 70B)...');

  // 1. Admin login
  const adminRes = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@parakh.ai', password: 'admin123' }),
  });
  const { token: adminToken } = await adminRes.json();

  // 2. Demo student login
  const studentRes = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@parakh.ai', password: 'student123' }),
  });
  const { token: studentToken } = await studentRes.json();

  // Warmup AI Tutor
  const t0 = Date.now();
  const tutorRes = await fetch(`${API}/api/tutor/ask`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'What is a binary search tree?' }),
  });
  const tutorData = await tutorRes.json();
  const t1 = Date.now();
  console.log(`✅ AI Tutor Warmed Up in ${t1 - t0}ms (Response length: ${tutorData.reply?.length || 0} chars)`);

  // Warmup AI Question Generator
  const t2 = Date.now();
  const genRes = await fetch(`${API}/api/admin/generate-question`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ concept: 'BST', difficulty: 1, topicHint: 'node structure' }),
  });
  const genData = await genRes.json();
  const t3 = Date.now();
  console.log(`✅ Question Generator Warmed Up in ${t3 - t2}ms (Generated Q: "${genData.question?.text?.slice(0, 40)}...")`);

  console.log('\n🚀 ALL LLM ENDPOINTS READY & WARMED UP FOR DEMO!');
}

warmup();
