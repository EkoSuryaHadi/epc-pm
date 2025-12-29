// Seed Schedule Tasks for Testing
// Usage: node scripts/seed-schedule-tasks.js [projectId]

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const projectId = process.argv[2];

  if (!projectId) {
    // Show all projects
    const projects = await prisma.project.findMany({
      select: { id: true, code: true, name: true }
    });
    console.log('Available projects:\n');
    projects.forEach(p => {
      console.log(`${p.id}`);
      console.log(`  ${p.code} - ${p.name}\n`);
    });
    console.log('Usage: node scripts/seed-schedule-tasks.js [projectId]');
    return;
  }

  console.log('🌱 Seeding schedule tasks...\n');

  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    console.error('❌ Project not found');
    return;
  }

  console.log(`📁 Project: ${project.name} (${project.code})\n`);

  // Get WBS nodes for linking
  const wbsNodes = await prisma.wBS.findMany({
    where: { projectId: project.id },
    take: 5,
  });

  // Define start date (project start date or today)
  const projectStart = new Date(project.startDate);
  const today = new Date();
  const startDate = projectStart > today ? today : projectStart;

  // Sample schedule tasks (typical project phases)
  const tasks = [
    // Phase 1: Engineering & Design (30 days)
    {
      taskName: 'Engineering & Design Phase',
      description: 'Complete engineering design and documentation',
      startDate: new Date(startDate.getTime()),
      endDate: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      duration: 30,
      progress: 85,
      isCritical: true,
      predecessors: [],
      resources: ['Lead Engineer', 'Design Team'],
      plannedHours: 720,
      actualHours: 650,
      wbsId: wbsNodes[0]?.id || null,
    },
    {
      taskName: 'P&ID Development',
      description: 'Process and instrumentation diagrams',
      startDate: new Date(startDate.getTime()),
      endDate: new Date(startDate.getTime() + 20 * 24 * 60 * 60 * 1000),
      duration: 20,
      progress: 100,
      isCritical: false,
      predecessors: [],
      resources: ['Process Engineer'],
      plannedHours: 320,
      actualHours: 310,
      wbsId: wbsNodes[0]?.id || null,
    },
    {
      taskName: '3D Model Development',
      description: 'Create 3D plant model',
      startDate: new Date(startDate.getTime() + 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      duration: 20,
      progress: 75,
      isCritical: true,
      predecessors: [],
      resources: ['3D Modeler', 'Design Lead'],
      plannedHours: 400,
      actualHours: 340,
      wbsId: wbsNodes[0]?.id || null,
    },

    // Phase 2: Procurement (45 days)
    {
      taskName: 'Material Procurement',
      description: 'Purchase and deliver materials',
      startDate: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(startDate.getTime() + 75 * 24 * 60 * 60 * 1000),
      duration: 45,
      progress: 40,
      isCritical: true,
      predecessors: [],
      resources: ['Procurement Manager'],
      plannedHours: 200,
      actualHours: 85,
      wbsId: wbsNodes[1]?.id || null,
    },
    {
      taskName: 'Equipment Delivery',
      description: 'Deliver major equipment to site',
      startDate: new Date(startDate.getTime() + 45 * 24 * 60 * 60 * 1000),
      endDate: new Date(startDate.getTime() + 75 * 24 * 60 * 60 * 1000),
      duration: 30,
      progress: 20,
      isCritical: true,
      predecessors: [],
      resources: ['Logistics Team'],
      plannedHours: 160,
      actualHours: 30,
      wbsId: wbsNodes[1]?.id || null,
    },

    // Phase 3: Construction (90 days)
    {
      taskName: 'Site Preparation',
      description: 'Prepare construction site',
      startDate: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(startDate.getTime() + 45 * 24 * 60 * 60 * 1000),
      duration: 15,
      progress: 100,
      isCritical: true,
      predecessors: [],
      resources: ['Civil Team'],
      plannedHours: 360,
      actualHours: 360,
      wbsId: wbsNodes[2]?.id || null,
    },
    {
      taskName: 'Foundation Works',
      description: 'Construct foundations',
      startDate: new Date(startDate.getTime() + 45 * 24 * 60 * 60 * 1000),
      endDate: new Date(startDate.getTime() + 70 * 24 * 60 * 60 * 1000),
      duration: 25,
      progress: 60,
      isCritical: true,
      predecessors: [],
      resources: ['Civil Team', 'Concrete Crew'],
      plannedHours: 600,
      actualHours: 380,
      wbsId: wbsNodes[2]?.id || null,
    },
    {
      taskName: 'Structural Erection',
      description: 'Erect structural steel',
      startDate: new Date(startDate.getTime() + 70 * 24 * 60 * 60 * 1000),
      endDate: new Date(startDate.getTime() + 100 * 24 * 60 * 60 * 1000),
      duration: 30,
      progress: 30,
      isCritical: true,
      predecessors: [],
      resources: ['Structural Team', 'Crane Operator'],
      plannedHours: 720,
      actualHours: 220,
      wbsId: wbsNodes[2]?.id || null,
    },
    {
      taskName: 'Piping Installation',
      description: 'Install process piping',
      startDate: new Date(startDate.getTime() + 85 * 24 * 60 * 60 * 1000),
      endDate: new Date(startDate.getTime() + 120 * 24 * 60 * 60 * 1000),
      duration: 35,
      progress: 15,
      isCritical: true,
      predecessors: [],
      resources: ['Piping Team', 'Welders'],
      plannedHours: 840,
      actualHours: 130,
      wbsId: wbsNodes[2]?.id || null,
    },
    {
      taskName: 'Electrical Installation',
      description: 'Install electrical systems',
      startDate: new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000),
      endDate: new Date(startDate.getTime() + 120 * 24 * 60 * 60 * 1000),
      duration: 30,
      progress: 10,
      isCritical: false,
      predecessors: [],
      resources: ['Electrical Team'],
      plannedHours: 600,
      actualHours: 60,
      wbsId: wbsNodes[3]?.id || null,
    },

    // Phase 4: Testing & Commissioning (30 days)
    {
      taskName: 'Pre-Commissioning',
      description: 'System checks and preparation',
      startDate: new Date(startDate.getTime() + 120 * 24 * 60 * 60 * 1000),
      endDate: new Date(startDate.getTime() + 135 * 24 * 60 * 60 * 1000),
      duration: 15,
      progress: 0,
      isCritical: true,
      predecessors: [],
      resources: ['Commissioning Team'],
      plannedHours: 360,
      actualHours: 0,
      wbsId: wbsNodes[4]?.id || null,
    },
    {
      taskName: 'Performance Testing',
      description: 'Test system performance',
      startDate: new Date(startDate.getTime() + 135 * 24 * 60 * 60 * 1000),
      endDate: new Date(startDate.getTime() + 150 * 24 * 60 * 60 * 1000),
      duration: 15,
      progress: 0,
      isCritical: true,
      predecessors: [],
      resources: ['Test Engineers', 'Operations'],
      plannedHours: 360,
      actualHours: 0,
      wbsId: wbsNodes[4]?.id || null,
    },
    {
      taskName: 'Final Handover',
      description: 'Project handover to client',
      startDate: new Date(startDate.getTime() + 150 * 24 * 60 * 60 * 1000),
      endDate: new Date(startDate.getTime() + 155 * 24 * 60 * 60 * 1000),
      duration: 5,
      progress: 0,
      isCritical: true,
      predecessors: [],
      resources: ['Project Manager', 'Client Rep'],
      plannedHours: 80,
      actualHours: 0,
      wbsId: wbsNodes[4]?.id || null,
    },
  ];

  console.log('Creating schedule tasks...\n');

  let created = 0;
  for (const task of tasks) {
    try {
      const result = await prisma.schedule.create({
        data: {
          ...task,
          projectId: project.id,
        },
      });
      console.log(`✅ ${result.taskName} (${result.duration} days, ${result.progress}%)`);
      created++;
    } catch (error) {
      console.log(`⚠️  Failed to create task: ${task.taskName}`);
    }
  }

  console.log(`\n✨ Created ${created} schedule tasks`);

  // Show summary
  const allTasks = await prisma.schedule.findMany({
    where: { projectId: project.id },
  });

  const totalDuration = Math.max(...allTasks.map(t => new Date(t.endDate).getTime())) -
                        Math.min(...allTasks.map(t => new Date(t.startDate).getTime()));
  const totalDays = Math.ceil(totalDuration / (1000 * 60 * 60 * 24));

  console.log('\n📊 Schedule Summary:');
  console.log(`   Total Tasks: ${allTasks.length}`);
  console.log(`   Project Duration: ${totalDays} days`);
  console.log(`   Critical Tasks: ${allTasks.filter(t => t.isCritical).length}`);
  console.log(`   Completed Tasks: ${allTasks.filter(t => t.progress === 100).length}`);
  console.log(`   In Progress: ${allTasks.filter(t => t.progress > 0 && t.progress < 100).length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
