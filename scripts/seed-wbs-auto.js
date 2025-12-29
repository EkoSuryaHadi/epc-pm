/**
 * Auto-generate WBS Test Data with Auto-Login
 * 
 * This script:
 * 1. Logs in as admin
 * 2. Gets first project
 * 3. Creates complete WBS hierarchy
 * 
 * Run: node scripts/seed-wbs-auto.js
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';
const LOGIN_EMAIL = 'admin@epc.com';
const LOGIN_PASSWORD = 'admin123';

// WBS Structure
const WBS_STRUCTURE = [
  {
    code: '1',
    name: 'Engineering & Design',
    description: 'All engineering and design activities',
    weightage: 30,
    order: 0,
    children: [
      {
        code: '1.1',
        name: 'FEED Studies',
        description: 'Front End Engineering Design studies',
        weightage: 20,
        order: 0,
      },
      {
        code: '1.2',
        name: 'Detail Engineering',
        description: 'Detailed engineering design',
        weightage: 80,
        order: 1,
        children: [
          {
            code: '1.2.1',
            name: 'Process Design',
            description: 'Process engineering design',
            weightage: 25,
            order: 0,
          },
          {
            code: '1.2.2',
            name: 'Mechanical Design',
            description: 'Mechanical engineering design',
            weightage: 25,
            order: 1,
          },
          {
            code: '1.2.3',
            name: 'Piping Design',
            description: 'Piping and pipeline design',
            weightage: 20,
            order: 2,
          },
          {
            code: '1.2.4',
            name: 'Electrical Design',
            description: 'Electrical engineering design',
            weightage: 15,
            order: 3,
          },
          {
            code: '1.2.5',
            name: 'Instrumentation',
            description: 'Instrumentation and control design',
            weightage: 15,
            order: 4,
          },
        ],
      },
    ],
  },
  {
    code: '2',
    name: 'Procurement',
    description: 'Equipment and material procurement',
    weightage: 20,
    order: 1,
    children: [
      {
        code: '2.1',
        name: 'Equipment Procurement',
        description: 'Major equipment procurement',
        weightage: 60,
        order: 0,
        children: [
          {
            code: '2.1.1',
            name: 'Rotating Equipment',
            description: 'Pumps, compressors, turbines',
            weightage: 40,
            order: 0,
          },
          {
            code: '2.1.2',
            name: 'Static Equipment',
            description: 'Vessels, heat exchangers, tanks',
            weightage: 30,
            order: 1,
          },
          {
            code: '2.1.3',
            name: 'Packages',
            description: 'Packaged equipment and skids',
            weightage: 30,
            order: 2,
          },
        ],
      },
      {
        code: '2.2',
        name: 'Material Procurement',
        description: 'Bulk material procurement',
        weightage: 40,
        order: 1,
        children: [
          {
            code: '2.2.1',
            name: 'Piping Materials',
            description: 'Pipes, fittings, valves',
            weightage: 50,
            order: 0,
          },
          {
            code: '2.2.2',
            name: 'Electrical Materials',
            description: 'Cables, panels, transformers',
            weightage: 30,
            order: 1,
          },
          {
            code: '2.2.3',
            name: 'Instrumentation',
            description: 'Control instruments and devices',
            weightage: 20,
            order: 2,
          },
        ],
      },
    ],
  },
  {
    code: '3',
    name: 'Construction',
    description: 'All construction and installation work',
    weightage: 50,
    order: 2,
    children: [
      {
        code: '3.1',
        name: 'Site Preparation',
        description: 'Site mobilization and preparation',
        weightage: 10,
        order: 0,
      },
      {
        code: '3.2',
        name: 'Civil Works',
        description: 'Foundations, buildings, roads',
        weightage: 15,
        order: 1,
      },
      {
        code: '3.3',
        name: 'Mechanical Installation',
        description: 'Equipment and piping installation',
        weightage: 35,
        order: 2,
      },
      {
        code: '3.4',
        name: 'Electrical Installation',
        description: 'Electrical systems installation',
        weightage: 20,
        order: 3,
      },
      {
        code: '3.5',
        name: 'Commissioning',
        description: 'Testing and commissioning',
        weightage: 20,
        order: 4,
      },
    ],
  },
];

async function login() {
  try {
    console.log('🔐 Logging in as admin...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: LOGIN_EMAIL,
      password: LOGIN_PASSWORD,
    });
    
    const token = response.data.access_token || response.data.accessToken;
    console.log('✓ Login successful');
    console.log(`   Token: ${token.substring(0, 20)}...`);
    return token;
  } catch (error) {
    console.error('✗ Login failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function getFirstProject(token) {
  try {
    console.log('📂 Getting projects...');
    const response = await axios.get(`${API_BASE_URL}/projects`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (response.data.length === 0) {
      throw new Error('No projects found. Create a project first!');
    }
    
    const project = response.data[0];
    console.log(`✓ Using project: ${project.name} (ID: ${project.id})`);
    return project;
  } catch (error) {
    console.error('✗ Failed to get projects:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function deleteExistingWBS(projectId, token) {
  try {
    console.log('\n🗑️  Checking for existing WBS...');
    const response = await axios.get(`${API_BASE_URL}/wbs?projectId=${projectId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (response.data.length > 0) {
      console.log(`⚠️  Found ${response.data.length} existing WBS elements`);
      console.log('🗑️  Deleting existing WBS to start fresh...');
      
      // Delete root nodes first (will cascade delete children)
      const rootNodes = response.data.filter(node => !node.parentId);
      
      for (const node of rootNodes) {
        await axios.delete(`${API_BASE_URL}/wbs/${node.id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        console.log(`   ✓ Deleted: ${node.code} ${node.name}`);
      }
      
      console.log('✓ Old WBS deleted');
    } else {
      console.log('✓ No existing WBS found');
    }
  } catch (error) {
    console.error('✗ Error checking/deleting WBS:', error.response?.data?.message || error.message);
  }
}

async function createWBSNode(projectId, nodeData, parentId, token, level = 0) {
  try {
    const payload = {
      code: nodeData.code,
      name: nodeData.name,
      description: nodeData.description || '',
      weightage: nodeData.weightage,
      order: nodeData.order,
      projectId,
      parentId: parentId || null,
      level,
    };

    const indent = '  '.repeat(level);
    process.stdout.write(`${indent}Creating: ${nodeData.code} ${nodeData.name} (${nodeData.weightage}%)... `);

    const response = await axios.post(
      `${API_BASE_URL}/wbs`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const createdNode = response.data;
    console.log('✓');

    // Create children if any
    if (nodeData.children && nodeData.children.length > 0) {
      for (const child of nodeData.children) {
        await createWBSNode(projectId, child, createdNode.id, token, level + 1);
      }
    }

    return createdNode;
  } catch (error) {
    console.log('✗');
    console.error(`Error: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

function countNodes(structure) {
  let count = 0;
  for (const node of structure) {
    count++; // Count current node
    if (node.children) {
      count += countNodes(node.children); // Count children recursively
    }
  }
  return count;
}

async function main() {
  console.log('\n🌳 WBS Auto-Seed Script\n');
  console.log('═'.repeat(50));
  console.log('');

  try {
    // Step 1: Login
    const token = await login();
    
    // Step 2: Get first project
    const project = await getFirstProject(token);
    
    // Step 3: Delete existing WBS
    await deleteExistingWBS(project.id, token);
    
    // Step 4: Create new WBS
    console.log('\n🌱 Creating WBS structure...\n');
    
    for (const rootNode of WBS_STRUCTURE) {
      await createWBSNode(project.id, rootNode, null, token, 0);
    }
    
    const totalNodes = countNodes(WBS_STRUCTURE);
    
    console.log('\n' + '═'.repeat(50));
    console.log('\n✅ WBS Seed Completed Successfully!\n');
    console.log(`📊 Summary:`);
    console.log(`   • Project: ${project.name}`);
    console.log(`   • Total nodes: ${totalNodes}`);
    console.log(`   • Root nodes: 3`);
    console.log(`   • Max depth: 3 levels`);
    console.log(`   • Total weightage: 100% ✓`);
    console.log('');
    console.log(`🔗 View WBS:`);
    console.log(`   http://localhost:3000/dashboard/projects/${project.id}/wbs`);
    console.log('');
    console.log('🧪 Ready for testing!');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure backend is running on port 3001');
    console.log('2. Make sure you can login with admin@epc.com / admin123');
    console.log('3. Make sure at least 1 project exists');
    console.log('');
    process.exit(1);
  }
}

// Run the script
main();
