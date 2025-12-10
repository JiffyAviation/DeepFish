/**
 * Example: How bots use project memory
 */

import { projectMemory } from './projectMemory.js';

// ============================================
// MEI (Initializer) - Creates project memory
// ============================================
async function meiInitializesProject(userRequest: string) {
    // User: "Design a rocket engine"

    // Mei analyzes and creates project
    await projectMemory.createProject('rocket-001', [
        { id: 'arch', assignedTo: 'oracle' },
        { id: 'thrust', assignedTo: 'gladyce' },
        { id: 'cad', assignedTo: 'hanna' }
    ]);

    console.log('✅ Mei created project: rocket-001');
}

// ============================================
// ORACLE (Worker) - Reads memory, does work
// ============================================
async function oracleWorkerCycle() {
    const projectId = 'rocket-001';

    // 1. Read memory (where am I?)
    const myFeatures = await projectMemory.getBotFeatures(projectId, 'oracle');
    const nextTask = myFeatures.find(f => f.s === 'Q' || f.s === 'F');

    if (!nextTask) {
        console.log('Oracle: No tasks for me');
        return;
    }

    console.log(`Oracle: Working on ${nextTask.i}`);

    // 2. Start work
    await projectMemory.appendProgress(
        projectId,
        'oracle',
        'START',
        nextTask.i
    );

    await projectMemory.updateFeature(projectId, nextTask.i, { s: 'W' });

    // 3. Do research
    await projectMemory.appendProgress(
        projectId,
        'oracle',
        'RESEARCH',
        nextTask.i,
        'Found MUD/MUSH patterns'
    );

    // 4. Complete
    await projectMemory.appendProgress(
        projectId,
        'oracle',
        'COMPLETE',
        nextTask.i,
        'Architecture design complete',
        'P'
    );

    await projectMemory.updateFeature(projectId, nextTask.i, { s: 'P' });

    await projectMemory.updateTestResult(projectId, nextTask.i, {
        s: 'P',
        t: 'manual',
        ts: Date.now()
    });

    console.log('✅ Oracle completed architecture');

    // 5. Exit (forget everything)
    // Oracle has NO memory of this work
    // But the files remember!
}

// ============================================
// GLADYCE (Worker) - Picks up where left off
// ============================================
async function gladyceWorkerCycle() {
    const projectId = 'rocket-001';

    // 1. Read memory
    const nextTask = await projectMemory.getNextFailingFeature(projectId, 'gladyce');

    if (!nextTask) {
        console.log('Gladyce: All my tasks passing!');
        return;
    }

    // 2. Read history (what was tried?)
    const history = await projectMemory.readProgress(projectId, nextTask.i);
    console.log(`Gladyce: Reading history for ${nextTask.i}:`, history);

    // 3. Start work
    await projectMemory.appendProgress(
        projectId,
        'gladyce',
        'START',
        nextTask.i
    );

    // 4. Design
    await projectMemory.appendProgress(
        projectId,
        'gladyce',
        'DESIGN',
        nextTask.i,
        'Vector control v1'
    );

    // 5. Test (fails)
    await projectMemory.appendProgress(
        projectId,
        'gladyce',
        'TEST',
        nextTask.i,
        undefined,
        'F',
        'Vector calc error'
    );

    await projectMemory.updateFeature(projectId, nextTask.i, { s: 'F' });

    console.log('❌ Gladyce: Test failed, will retry next cycle');
}

// ============================================
// NEXT DAY - Gladyce continues
// ============================================
async function gladyceNextDay() {
    const projectId = 'rocket-001';

    // Gladyce has NO memory of yesterday
    // But reads the files:

    const nextTask = await projectMemory.getNextFailingFeature(projectId, 'gladyce');
    const history = await projectMemory.readProgress(projectId, nextTask!.i);

    console.log('Gladyce: I see I tried v1 yesterday and it failed');
    console.log('Gladyce: Let me try v2');

    await projectMemory.appendProgress(
        projectId,
        'gladyce',
        'FIX',
        nextTask!.i,
        'Trying vector control v2'
    );

    // ... work ...

    await projectMemory.appendProgress(
        projectId,
        'gladyce',
        'TEST',
        nextTask!.i,
        undefined,
        'P'
    );

    await projectMemory.updateFeature(projectId, nextTask!.i, { s: 'P' });

    console.log('✅ Gladyce: v2 works! Test passing!');
}

// ============================================
// Run example
// ============================================
export async function runMemoryExample() {
    console.log('=== Day 1 ===');
    await meiInitializesProject('Design a rocket engine');
    await oracleWorkerCycle();
    await gladyceWorkerCycle();

    console.log('\n=== Day 2 ===');
    await gladyceNextDay();

    console.log('\n=== Check Final Status ===');
    const features = await projectMemory.readFeatures('rocket-001');
    console.log('Features:', features.f);

    const tests = await projectMemory.getTestResults('rocket-001');
    console.log('Tests:', tests);
}
