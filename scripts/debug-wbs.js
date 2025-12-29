/**
 * Debug WBS - Check data structure
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

async function main() {
  try {
    const token = await login();
    const project = await getFirstProject(token);
    
    console.log('\n🔍 Fetching WBS data...\n');
    
    const response = await axios.get(`${API_BASE_URL}/wbs?projectId=${project.id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    const nodes = response.data;
    
    console.log(`Total nodes: ${nodes.length}\n`);
    
    // Group by level
    const byLevel = {};
    nodes.forEach(node => {
      if (!byLevel[node.level]) byLevel[node.level] = [];
      byLevel[node.level].push(node);
    });
    
    console.log('Nodes by level:');
    Object.keys(byLevel).sort().forEach(level => {
      console.log(`\nLevel ${level}: ${byLevel[level].length} nodes`);
      byLevel[level].forEach(node => {
        console.log(`  ${node.code} ${node.name} (${node.weightage}%)`);
        console.log(`    - ID: ${node.id}`);
        console.log(`    - ParentId: ${node.parentId || 'NULL (root)'}`);
        console.log(`    - Children property: ${node.children ? 'EXISTS' : 'MISSING'}`);
      });
    });
    
    // Check for orphans
    const rootNodes = nodes.filter(n => !n.parentId);
    console.log(`\n\n📊 Summary:`);
    console.log(`Root nodes: ${rootNodes.length}`);
    
    rootNodes.forEach(root => {
      const children = nodes.filter(n => n.parentId === root.id);
      console.log(`\n${root.code} ${root.name}:`);
      console.log(`  Direct children: ${children.length}`);
      
      children.forEach(child => {
        const grandchildren = nodes.filter(n => n.parentId === child.id);
        console.log(`    ${child.code} ${child.name} - grandchildren: ${grandchildren.length}`);
      });
    });
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

main();
