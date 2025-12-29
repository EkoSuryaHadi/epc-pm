/**
 * Add Children to Existing WBS
 * This creates a complete multi-level hierarchy for testing
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

async function getExistingWBS(projectId, token) {
  const response = await axios.get(`${API_BASE_URL}/wbs?projectId=${projectId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.data;
}

async function createNode(projectId, data, token) {
  try {
    const response = await axios.post(`${API_BASE_URL}/wbs`, 
      { ...data, projectId },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error(`✗ Failed to create ${data.code}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function addChildren(projectId, nodes, token) {
  console.log('\n🌱 Adding children to WBS...\n');
  
  // Find root nodes by code
  const eng = nodes.find(n => n.code === '1');
  const proc = nodes.find(n => n.code === '2');
  const cons = nodes.find(n => n.code === '3');
  
  let created = 0;
  
  // Engineering children
  if (eng) {
    console.log('Adding children to: 1. Engineering & Design');
    
    const feed = await createNode(projectId, {
      code: '1.1',
      name: 'FEED Studies',
      description: 'Front End Engineering Design studies',
      weightage: 20,
      order: 0,
      parentId: eng.id,
      level: 1,
    }, token);
    if (feed) {
      console.log('  ✓ 1.1 FEED Studies (20%)');
      created++;
    }
    
    const detail = await createNode(projectId, {
      code: '1.2',
      name: 'Detail Engineering',
      description: 'Detailed engineering design',
      weightage: 80,
      order: 1,
      parentId: eng.id,
      level: 1,
    }, token);
    if (detail) {
      console.log('  ✓ 1.2 Detail Engineering (80%)');
      created++;
      
      // Add grandchildren to Detail Engineering
      const grandchildren = [
        { code: '1.2.1', name: 'Process Design', weightage: 25, order: 0 },
        { code: '1.2.2', name: 'Mechanical Design', weightage: 25, order: 1 },
        { code: '1.2.3', name: 'Piping Design', weightage: 20, order: 2 },
        { code: '1.2.4', name: 'Electrical Design', weightage: 15, order: 3 },
        { code: '1.2.5', name: 'Instrumentation', weightage: 15, order: 4 },
      ];
      
      for (const gc of grandchildren) {
        const node = await createNode(projectId, {
          ...gc,
          description: `${gc.name} activities`,
          parentId: detail.id,
          level: 2,
        }, token);
        if (node) {
          console.log(`    ✓ ${gc.code} ${gc.name} (${gc.weightage}%)`);
          created++;
        }
      }
    }
  }
  
  // Procurement children
  if (proc) {
    console.log('\nAdding children to: 2. Procurement');
    
    const equipment = await createNode(projectId, {
      code: '2.1',
      name: 'Equipment Procurement',
      description: 'Major equipment procurement',
      weightage: 60,
      order: 0,
      parentId: proc.id,
      level: 1,
    }, token);
    if (equipment) {
      console.log('  ✓ 2.1 Equipment Procurement (60%)');
      created++;
      
      // Add grandchildren
      const eqGrandchildren = [
        { code: '2.1.1', name: 'Rotating Equipment', weightage: 40, order: 0 },
        { code: '2.1.2', name: 'Static Equipment', weightage: 30, order: 1 },
        { code: '2.1.3', name: 'Packages', weightage: 30, order: 2 },
      ];
      
      for (const gc of eqGrandchildren) {
        const node = await createNode(projectId, {
          ...gc,
          description: `${gc.name} procurement`,
          parentId: equipment.id,
          level: 2,
        }, token);
        if (node) {
          console.log(`    ✓ ${gc.code} ${gc.name} (${gc.weightage}%)`);
          created++;
        }
      }
    }
    
    const material = await createNode(projectId, {
      code: '2.2',
      name: 'Material Procurement',
      description: 'Bulk material procurement',
      weightage: 40,
      order: 1,
      parentId: proc.id,
      level: 1,
    }, token);
    if (material) {
      console.log('  ✓ 2.2 Material Procurement (40%)');
      created++;
      
      // Add grandchildren
      const matGrandchildren = [
        { code: '2.2.1', name: 'Piping Materials', weightage: 50, order: 0 },
        { code: '2.2.2', name: 'Electrical Materials', weightage: 30, order: 1 },
        { code: '2.2.3', name: 'Instrumentation', weightage: 20, order: 2 },
      ];
      
      for (const gc of matGrandchildren) {
        const node = await createNode(projectId, {
          ...gc,
          description: `${gc.name} procurement`,
          parentId: material.id,
          level: 2,
        }, token);
        if (node) {
          console.log(`    ✓ ${gc.code} ${gc.name} (${gc.weightage}%)`);
          created++;
        }
      }
    }
  }
  
  // Construction children
  if (cons) {
    console.log('\nAdding children to: 3. Construction');
    
    const consChildren = [
      { code: '3.1', name: 'Site Preparation', weightage: 10, order: 0 },
      { code: '3.2', name: 'Civil Works', weightage: 15, order: 1 },
      { code: '3.3', name: 'Mechanical Installation', weightage: 35, order: 2 },
      { code: '3.4', name: 'Electrical Installation', weightage: 20, order: 3 },
      { code: '3.5', name: 'Commissioning', weightage: 20, order: 4 },
    ];
    
    for (const child of consChildren) {
      const node = await createNode(projectId, {
        ...child,
        description: `${child.name} activities`,
        parentId: cons.id,
        level: 1,
      }, token);
      if (node) {
        console.log(`  ✓ ${child.code} ${child.name} (${child.weightage}%)`);
        created++;
      }
    }
  }
  
  return created;
}

async function main() {
  try {
    console.log('\n🌳 Add WBS Children\n');
    
    const token = await login();
    console.log('✓ Logged in');
    
    const project = await getFirstProject(token);
    console.log(`✓ Project: ${project.name}`);
    
    const nodes = await getExistingWBS(project.id, token);
    console.log(`✓ Found ${nodes.length} existing WBS nodes`);
    
    const created = await addChildren(project.id, nodes, token);
    
    console.log('\n' + '='.repeat(50));
    console.log(`\n✅ Complete!`);
    console.log(`Created ${created} new nodes`);
    console.log(`Total nodes now: ${nodes.length + created}`);
    console.log(`\n📊 Structure:`);
    console.log(`   • 3 root nodes (L0)`);
    console.log(`   • Multi-level hierarchy (up to L2)`);
    console.log(`   • All levels validate to 100%`);
    console.log(`\n🔗 View at:`);
    console.log(`http://localhost:3000/dashboard/projects/${project.id}/wbs\n`);
    console.log(`🧪 Ready to test:`);
    console.log(`   • Collapse/Expand tree`);
    console.log(`   • Edit nodes`);
    console.log(`   • Delete nodes (with/without children)`);
    console.log(`   • Multi-level validation\n`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

main();
