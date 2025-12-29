/**
 * Auto-generate WBS Test Data
 * 
 * This script creates a complete WBS hierarchy for testing purposes.
 * Run: node scripts/seed-wbs.js <PROJECT_ID> <ACCESS_TOKEN>
 * 
 * Or get token from login:
 * 1. Login at http://localhost:3000
 * 2. Open DevTools (F12) -> Console
 * 3. Type: localStorage.getItem('token')
 * 4. Copy the token (without quotes)
 * 5. Run: node scripts/seed-wbs.js <PROJECT_ID> <TOKEN>
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// WBS Structure based on testing guide
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

    console.log(`  ${'  '.repeat(level)}Creating: ${nodeData.code} ${nodeData.name} (${nodeData.weightage}%)`);

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
    console.log(`  ${'  '.repeat(level)}✓ Created: ${createdNode.id}`);

    // Create children if any
    if (nodeData.children && nodeData.children.length > 0) {
      for (const child of nodeData.children) {
        await createWBSNode(projectId, child, createdNode.id, token, level + 1);
      }
    }

    return createdNode;
  } catch (error) {
    console.error(`  ${'  '.repeat(level)}✗ Error creating ${nodeData.code}:`, error.response?.data || error.message);
    throw error;
  }
}

async function seedWBS(projectId, token) {
  console.log('\n🌳 Starting WBS Seed Process...\n');
  console.log(`Project ID: ${projectId}`);
  console.log(`API URL: ${API_BASE_URL}\n`);

  let totalCreated = 0;

  try {
    // Verify token by getting projects
    console.log('Verifying access token...');
    await axios.get(`${API_BASE_URL}/projects`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    console.log('✓ Token is valid\n');

    // Check if project exists
    console.log('Checking if project exists...');
    const projectResponse = await axios.get(`${API_BASE_URL}/projects/${projectId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    console.log(`✓ Project found: ${projectResponse.data.name}\n`);

    // Check existing WBS
    console.log('Checking for existing WBS...');
    const existingWBS = await axios.get(`${API_BASE_URL}/wbs?projectId=${projectId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (existingWBS.data.length > 0) {
      console.log(`⚠️  Warning: Project already has ${existingWBS.data.length} WBS elements`);
      console.log('This script will ADD to existing WBS, not replace it.');
      console.log('If you want a fresh start, delete existing WBS first.\n');
      
      // Ask for confirmation (in real scenario, would use readline)
      // For now, we'll continue
    } else {
      console.log('✓ No existing WBS found\n');
    }

    // Create WBS structure
    console.log('Creating WBS structure...\n');
    
    for (const rootNode of WBS_STRUCTURE) {
      await createWBSNode(projectId, rootNode, null, token, 0);
      totalCreated++;
      if (rootNode.children) {
        totalCreated += rootNode.children.length;
        rootNode.children.forEach(child => {
          if (child.children) {
            totalCreated += child.children.length;
          }
        });
      }
    }

    console.log('\n✅ WBS Seed Completed Successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Total nodes created: ${totalCreated}`);
    console.log(`   - Root nodes: 3 (Engineering, Procurement, Construction)`);
    console.log(`   - Total weightage: 100% (30% + 20% + 50%)`);
    console.log(`   - Max depth: 3 levels`);
    console.log(`\n🔗 View in browser:`);
    console.log(`   http://localhost:3000/dashboard/projects/${projectId}/wbs`);
    console.log('');

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data?.message || error.message);
    process.exit(1);
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('\n❌ Missing required arguments\n');
  console.log('Usage:');
  console.log('  node scripts/seed-wbs.js <PROJECT_ID> <ACCESS_TOKEN>\n');
  console.log('How to get ACCESS_TOKEN:');
  console.log('  1. Login at http://localhost:3000');
  console.log('  2. Open DevTools (F12) -> Application tab');
  console.log('  3. Look for "__Secure-next-auth.session-token" in Cookies');
  console.log('  4. Copy the token value');
  console.log('  5. OR: Use the token from API response after login\n');
  console.log('How to get PROJECT_ID:');
  console.log('  1. Go to http://localhost:3000/dashboard/projects');
  console.log('  2. Click on any project');
  console.log('  3. Copy the ID from URL: /projects/<PROJECT_ID>\n');
  process.exit(1);
}

const [projectId, token] = args;

seedWBS(projectId, token);
