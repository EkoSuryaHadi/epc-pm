/**
 * Simple WBS Seed - Root Nodes Only
 * Tests basic WBS creation without children
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';
const LOGIN_EMAIL = 'admin@epc.com';
const LOGIN_PASSWORD = 'admin123';

async function login() {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    email: LOGIN_EMAIL,
    password: LOGIN_PASSWORD,
  });
  return response.data.access_token || response.data.accessToken;
}

async function getFirstProject(token) {
  const response = await axios.get(`${API_BASE_URL}/projects`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.data[0];
}

async function createRootWBS(projectId, token) {
  const roots = [
    { code: '1', name: 'Engineering & Design', description: 'All engineering and design activities', weightage: 30, order: 0 },
    { code: '2', name: 'Procurement', description: 'Equipment and material procurement', weightage: 20, order: 1 },
    { code: '3', name: 'Construction', description: 'All construction and installation work', weightage: 50, order: 2 },
  ];

  console.log('\n🌱 Creating root WBS elements...\n');

  const createdNodes = [];

  for (const root of roots) {
    try {
      const payload = {
        ...root,
        projectId,
        level: 0,
      };

      const response = await axios.post(`${API_BASE_URL}/wbs`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`✓ Created: ${root.code} ${root.name} (${root.weightage}%)`);
      createdNodes.push(response.data);
    } catch (error) {
      console.error(`✗ Failed: ${root.code} - ${error.response?.data?.message || error.message}`);
    }
  }

  return createdNodes;
}

async function main() {
  try {
    console.log('\n🌳 Simple WBS Seed\n');
    
    const token = await login();
    console.log('✓ Logged in');
    
    const project = await getFirstProject(token);
    console.log(`✓ Project: ${project.name}\n`);
    
    const nodes = await createRootWBS(project.id, token);
    
    console.log(`\n✅ Done!`);
    console.log(`Created ${nodes.length} root nodes`);
    console.log(`Total weightage: ${nodes.reduce((sum, n) => sum + n.weightage, 0)}%`);
    console.log(`\n🔗 View at:`);
    console.log(`http://localhost:3000/dashboard/projects/${project.id}/wbs\n`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

main();
