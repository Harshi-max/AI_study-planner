/**
 * Study Plan Service - Main entry point
 * Generates complete study plan using Camel AI
 */

const { camelAI } = require('./studyPlanGenerator');
const { generateWeekSchedule } = require('./scheduleBuilder');

/**
 * Generate complete study plan
 */
async function generateStudyPlan(input) {
    const { student, subjects, availability, targetDate } = input;

    // Validate input
    validateInput(input);

    // Generate adaptive schedule using Camel AI
    const scheduleData = camelAI.generateSchedule(subjects, availability, targetDate);

    // Generate 7-day week schedule
    const weekSchedule = generateWeekSchedule(
        scheduleData.subjectAllocations,
        availability,
        scheduleData.bufferHours
    );

    // Generate subject hours allocation
    const subjectHours = {};
    scheduleData.subjectAllocations.forEach(subj => {
        subjectHours[subj.name] = subj.allocatedHours;
    });

    // Generate next 7 days focus
    const next7DaysFocus = camelAI.generateNext7DaysFocus(weekSchedule, scheduleData.subjectAllocations);

    // Generate progress checkpoints
    const progressCheckpoints = camelAI.generateProgressCheckpoints(
        subjects,
        scheduleData.subjectAllocations,
        targetDate
    );

    // Generate summary
    const summary = camelAI.generateSummary(
        student,
        subjects,
        targetDate,
        scheduleData,
        weekSchedule
    );

    // Generate subject-wise breakdown with justifications
    const subjectBreakdown = scheduleData.subjectAllocations.map(subj => ({
        name: subj.name,
        credits: subj.credits,
        allocatedHours: subj.allocatedHours,
        hoursPerWeek: subj.allocatedHours,
        percentage: Math.round((subj.allocatedHours / scheduleData.availableHours) * 100),
        cognitiveLoad: subj.cognitiveLoad,
        color: subj.cognitiveLoad === 'high' ? 'Red' : subj.cognitiveLoad === 'medium' ? 'Yellow' : 'Green',
        justification: subj.justification,
        strongTopics: subj.strong,
        weakTopics: subj.weak,
        currentConfidence: subj.confidence,
        priority: subj.priority
    }));

    return {
        metadata: {
            generatedAt: new Date().toISOString(),
            student: student,
            targetDate: targetDate,
            version: '2.0-camel-ai'
        },
        week: weekSchedule,
        subjectHours: subjectHours,
        subjectBreakdown: subjectBreakdown,
        next7DaysFocus: next7DaysFocus,
        progressCheckpoints: progressCheckpoints.map(cp => ({
            week: cp.week,
            date: cp.date,
            assessments: cp.assessments.map(assess => ({
                subject: assess.subject,
                currentConfidence: assess.currentConfidence,
                expectedConfidence: assess.expectedConfidence,
                weakTopicsToCover: assess.weakTopicsToCover,
                topicsToReview: assess.topicsToReview
            })),
            adaptationSuggestions: cp.adaptationSuggestions
        })),
        summary: summary,
        adaptiveFeatures: {
            canReschedule: true,
            confidenceAdjusted: true,
            microTasksEnabled: true,
            prerequisiteTracking: true,
            camelAI: true
        }
    };
}

function validateInput(input) {
    if (!input.student || !input.subjects || !input.availability || !input.targetDate) {
        throw new Error('Missing required input fields');
    }
    
    if (!input.student.name || !input.student.college || !input.student.branch || 
        !input.student.year || !input.student.email) {
        throw new Error('Missing required student information');
    }
    
    if (!Array.isArray(input.subjects) || input.subjects.length === 0) {
        throw new Error('At least one subject is required');
    }
    
    input.subjects.forEach(subj => {
        if (!subj.name || typeof subj.credits !== 'number' || 
            !Array.isArray(subj.strong) || !Array.isArray(subj.weak) ||
            typeof subj.confidence !== 'number' || subj.confidence < 1 || subj.confidence > 5) {
            throw new Error(`Invalid subject data: ${subj.name || 'Unknown'}`);
        }
    });
    
    if (typeof input.availability.weekdays !== 'number' || 
        typeof input.availability.weekends !== 'number' ||
        !['Morning', 'Afternoon', 'Night'].includes(input.availability.preferredTime)) {
        throw new Error('Invalid availability data');
    }
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(input.targetDate)) {
        throw new Error('Invalid target date format. Use YYYY-MM-DD');
    }
}

module.exports = { generateStudyPlan };

