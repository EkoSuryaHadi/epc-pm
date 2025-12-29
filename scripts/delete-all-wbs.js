/**
 * Delete All WBS for a Project
 * Use this to clean up before re-seeding
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

async function deleteAllWBS(projectId, token) {
  console.log('\n🗑️  Fetching existing WBS...\n');
  
  const response = await axios.get(`${API_BASE_URL}/wbs?projectId=${projectId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  
  const nodes = response.data;
  
  if (nodes.length === 0) {
    console.log('✓ No WBS found. Already clean!\n');
    return;
  }
  
  console.log(`Found ${nodes.length} WBS elements\n`);
  
  // Delete root nodes first (cascade delete will remove children)
  const rootNodes = nodes.filter(node => !node.parentId);
  
  console.log(`Deleting ${rootNodes.length} root nodes (will cascade)...\n`);
  
  for (const node of rootNodes) {
    try {
      await axios.delete(`${API_BASE_URL}/wbs/${node.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log(`✓ Deleted: ${node.code} ${node.name}`);
    } catch (error) {
      console.error(`✗ Failed to delete ${node.code}:`, error.response?.data?.message || error.message);
    }
  }
  
  console.log('\n✅ All WBS deleted!\n');
}

async function main() {
  try {
    console.log('\n🗑️  WBS Delete Script\n');
    
    const token = await login();
    console.log('✓ Logged in');
    
    const project = await getFirstProject(token);
    console.log(`✓ Project: ${project.name}`);
    
    await deleteAllWBS(project.id, token);
    
    console.log(`🔗 View at:`);
    console.log(`http://localhost:3000/dashboard/projects/${project.id}/wbs\n`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

main();
