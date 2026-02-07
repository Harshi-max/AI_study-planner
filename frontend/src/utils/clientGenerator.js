/**
 * Client-Side Study Plan Generator
 * Works in browser without backend - Uses Camel AI algorithm
 * Dynamic and works with any input data
 */

// Camel AI - Intelligent Adaptive Algorithm (Browser-compatible)
class CamelAI {
    constructor() {
        this.prerequisiteMap = {
            'Data Structures': ['Programming', 'Algorithms', 'Discrete Mathematics'],
            'Operating Systems': ['Computer Architecture', 'Data Structures'],
            'Database Systems': ['Data Structures', 'Discrete Mathematics'],
            'Machine Learning': ['Linear Algebra', 'Statistics', 'Programming', 'Data Structures'],
            'Computer Networks': ['Operating Systems', 'Data Structures'],
            'Algorithms': ['Data Structures', 'Discrete Mathematics'],
            'Software Engineering': ['Programming', 'Data Structures'],
            'Computer Architecture': ['Digital Logic', 'Mathematics'],
            'Compiler Design': ['Data Structures', 'Algorithms', 'Theory of Computation']
        };
    }

    analyzeCognitiveLoad(subject) {
        let load = 'medium';
        const factors = {
            weakTopics: subject.weak.length,
            confidence: subject.confidence,
            credits: subject.credits,
            prerequisites: this.checkPrerequisites(subject.name)
        };

        if (subject.confidence <= 2 || subject.weak.length >= 3 || factors.prerequisites.missing > 0) {
            load = 'high';
        } else if (subject.confidence >= 4 && subject.weak.length === 0 && factors.prerequisites.missing === 0) {
            load = 'low';
        }

        return { load, factors, priority: this.calculatePriority(subject, factors) };
    }

    checkPrerequisites(subjectName) {
        const prereqs = this.prerequisiteMap[subjectName] || [];
        return { required: prereqs, missing: prereqs.length };
    }

    calculatePriority(subject, factors) {
        const weakTopicWeight = factors.weakTopics * 2.5;
        const creditWeight = subject.credits * 1.2;
        const confidenceWeight = (6 - subject.confidence) * 2;
        const prerequisiteWeight = factors.prerequisites.missing * 3;
        return weakTopicWeight + creditWeight + confidenceWeight + prerequisiteWeight;
    }

    generateSchedule(subjects, availability, targetDate) {
        const totalWeeklyHours = (availability.weekdays * 5) + (availability.weekends * 2);
        const bufferPercent = 0.12;
        const bufferHours = Math.round(totalWeeklyHours * bufferPercent);
        const availableHours = totalWeeklyHours - bufferHours;

        const analyzedSubjects = subjects.map(subject => {
            const analysis = this.analyzeCognitiveLoad(subject);
            return {
                ...subject,
                cognitiveLoad: analysis.load,
                priority: analysis.priority,
                factors: analysis.factors,
                allocatedHours: 0
            };
        });

        analyzedSubjects.forEach(subject => {
            const prereqs = this.prerequisiteMap[subject.name] || [];
            const availableSubjectNames = subjects.map(s => s.name.toLowerCase());
            const missing = prereqs.filter(prereq => 
                !availableSubjectNames.some(name => 
                    name.includes(prereq.toLowerCase()) || prereq.toLowerCase().includes(name)
                )
            );
            subject.factors.prerequisites.missing = missing.length;
            subject.priority = this.calculatePriority(subject, subject.factors);
        });

        analyzedSubjects.sort((a, b) => {
            if (Math.abs(a.factors.prerequisites.missing - b.factors.prerequisites.missing) > 0) {
                return b.factors.prerequisites.missing - a.factors.prerequisites.missing;
            }
            return b.priority - a.priority;
        });

        const totalPriority = analyzedSubjects.reduce((sum, s) => sum + s.priority, 0);
        analyzedSubjects.forEach(subject => {
            const proportion = subject.priority / totalPriority;
            subject.allocatedHours = Math.max(2, Math.round(availableHours * proportion));
        });

        const totalAllocated = analyzedSubjects.reduce((sum, s) => sum + s.allocatedHours, 0);
        if (totalAllocated !== availableHours) {
            const ratio = availableHours / totalAllocated;
            analyzedSubjects.forEach(subject => {
                subject.allocatedHours = Math.round(subject.allocatedHours * ratio);
            });
        }

        analyzedSubjects.forEach(subject => {
            subject.justification = this.generateJustification(subject);
        });

        return {
            subjectAllocations: analyzedSubjects,
            totalWeeklyHours,
            bufferHours,
            availableHours,
            preferredTime: availability.preferredTime
        };
    }

    generateJustification(subject) {
        const reasons = [];
        if (subject.factors.prerequisites.missing > 0) {
            reasons.push(`prerequisite-heavy (${subject.factors.prerequisites.missing} missing)`);
        }
        if (subject.weak.length > 0) {
            reasons.push(`${subject.weak.length} weak topic${subject.weak.length > 1 ? 's' : ''}`);
        }
        if (subject.confidence <= 2) {
            reasons.push('low confidence level');
        }
        if (subject.credits >= 4) {
            reasons.push('higher credit weight');
        }
        if (subject.cognitiveLoad === 'high') {
            reasons.push('high cognitive load');
        }
        if (subject.strong.length > 0 && subject.weak.length === 0) {
            reasons.push('strong topics - reduced load to avoid over-studying');
        }
        return reasons.length > 0 
            ? `More time allocated due to: ${reasons.join(', ')}`
            : 'Balanced allocation based on standard workload';
    }

    generateNext7DaysFocus(weekSchedule, subjectAllocations) {
        const focus = [];
        const prerequisiteSubjects = subjectAllocations
            .filter(s => s.factors.prerequisites.missing > 0)
            .sort((a, b) => b.factors.prerequisites.missing - a.factors.prerequisites.missing);

        prerequisiteSubjects.forEach(subject => {
            const missing = this.prerequisiteMap[subject.name] || [];
            if (missing.length > 0 && subject.weak.length > 0) {
                focus.push(`Revise ${missing[0]} before starting ${subject.weak[0]} to close prerequisite gap`);
            }
        });

        const weakTopicMap = new Map();
        weekSchedule.forEach(day => {
            day.blocks.forEach(block => {
                if (block.color === 'Red' && block.type === 'Learning' && block.topic) {
                    const key = `${block.subject}-${block.topic}`;
                    if (!weakTopicMap.has(key)) {
                        weakTopicMap.set(key, { subject: block.subject, topic: block.topic });
                    }
                }
            });
        });

        weakTopicMap.forEach(({ subject, topic }) => {
            focus.push(`Next 7 days focus: ${topic} (${subject})`);
        });

        subjectAllocations.forEach(subject => {
            if (subject.weak.length > 0) {
                const topic = subject.weak[0];
                focus.push(`Complete ${topic} before Week 3 to avoid backlog`);
            }
        });

        return focus.slice(0, 7);
    }

    generateProgressCheckpoints(subjects, subjectAllocations, targetDate) {
        const today = new Date();
        const target = new Date(targetDate);
        const daysUntilTarget = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
        const weeksUntilTarget = Math.ceil(daysUntilTarget / 7);

        const checkpoints = [];
        const checkpointWeeks = [
            Math.ceil(weeksUntilTarget * 0.25),
            Math.ceil(weeksUntilTarget * 0.5),
            Math.ceil(weeksUntilTarget * 0.75)
        ];

        checkpointWeeks.forEach((week, index) => {
            const percentage = [0.25, 0.5, 0.75][index];
            const checkpointDate = new Date(today);
            checkpointDate.setDate(checkpointDate.getDate() + (week * 7));

            const assessments = subjectAllocations.map(subj => {
                const expectedConfidence = Math.min(5, 
                    subj.confidence + Math.ceil((5 - subj.confidence) * percentage));
                const weakTopicsToCover = Math.ceil(subj.weak.length * percentage);
                
                return {
                    subject: subj.name,
                    currentConfidence: subj.confidence,
                    expectedConfidence,
                    weakTopicsToCover,
                    topicsToReview: subj.weak.slice(0, weakTopicsToCover)
                };
            });

            const suggestions = [];
            assessments.forEach(assessment => {
                const subject = subjectAllocations.find(s => s.name === assessment.subject);
                if (subject && assessment.expectedConfidence > assessment.currentConfidence + 1) {
                    suggestions.push(
                        `Confidence in ${assessment.subject} improved from ${assessment.currentConfidence} → ${assessment.expectedConfidence}; ` +
                        `consider reallocating ${Math.round(subject.allocatedHours * 0.1)} mins to weaker subjects`
                    );
                }
            });

            checkpoints.push({
                week,
                date: checkpointDate.toISOString().split('T')[0],
                assessments,
                adaptationSuggestions: suggestions
            });
        });

        return checkpoints;
    }

    generateSummary(student, subjects, targetDate, scheduleData, weekSchedule) {
        const today = new Date();
        const target = new Date(targetDate);
        const daysUntilTarget = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
        const weeksUntilTarget = Math.ceil(daysUntilTarget / 7);

        const totalWeakTopics = subjects.reduce((sum, s) => sum + s.weak.length, 0);
        const avgConfidence = subjects.reduce((sum, s) => sum + s.confidence, 0) / subjects.length;
        const expectedConfidence = Math.min(5, avgConfidence + Math.ceil(totalWeakTopics * 0.3));
        const confidenceImprovement = expectedConfidence - avgConfidence;

        const totalStudyHours = scheduleData.subjectAllocations.reduce((sum, s) => sum + s.allocatedHours, 0);
        const weakTopicsCovered = Math.ceil(totalWeakTopics * 0.8);
        const hoursSaved = weakTopicsCovered * 2;
        const totalHoursOverWeeks = totalStudyHours * weeksUntilTarget;
        const workloadReduction = Math.round((hoursSaved / (totalHoursOverWeeks * 0.3)) * 100);

        return {
            completionDate: targetDate,
            estimatedTimeline: `${weeksUntilTarget} weeks (${daysUntilTarget} days)`,
            expectedConfidenceImprovement: `From ${avgConfidence.toFixed(1)}/5 to ${expectedConfidence.toFixed(1)}/5 (+${confidenceImprovement.toFixed(1)})`,
            lastMinuteWorkloadReduction: `${workloadReduction}%`,
            rationale: `Balanced allocation of ${totalWeakTopics} weak topics across ${subjects.length} subjects, ` +
                       `${scheduleData.bufferHours} hours buffer time, and high-focus blocks scheduled during ` +
                       `${scheduleData.preferredTime}. Prerequisite-heavy subjects prioritized.`
        };
    }
}

// Schedule Builder (Browser-compatible)
const TIME_SLOTS = {
    Morning: { slots: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00'] },
    Afternoon: { slots: ['13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'] },
    Night: { slots: ['18:00-19:00', '19:00-20:00', '20:00-21:00', '21:00-22:00', '22:00-23:00'] }
};

const COLOR_MAP = { high: 'Red', medium: 'Yellow', low: 'Green' };

function generateWeekSchedule(subjectAllocations, availability, bufferHours) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const weekSchedule = [];
    const today = new Date();

    days.forEach((dayName, dayIndex) => {
        const date = new Date(today);
        date.setDate(date.getDate() + dayIndex);
        
        const isWeekend = dayName === 'Saturday' || dayName === 'Sunday';
        const availableHours = isWeekend ? availability.weekends : availability.weekdays;
        
        const daySchedule = { day: dayName, date: date.toISOString().split('T')[0], blocks: [] };
        const timeSlots = TIME_SLOTS[availability.preferredTime];
        let slotIndex = 0;
        let hoursUsed = 0;

        const subjectsForDay = [...subjectAllocations]
            .sort((a, b) => {
                if (a.cognitiveLoad === 'high' && b.cognitiveLoad !== 'high') return -1;
                if (b.cognitiveLoad === 'high' && a.cognitiveLoad !== 'high') return 1;
                return Math.random() - 0.5;
            });

        for (const subject of subjectsForDay) {
            if (hoursUsed >= availableHours) break;

            const hoursPerDay = Math.ceil(subject.allocatedHours / 7);
            const hoursToday = Math.min(hoursPerDay, availableHours - hoursUsed, 3);

            if (hoursToday > 0) {
                const blockType = determineBlockType(subject, dayIndex, isWeekend);
                const topics = selectTopicsForDay(subject, dayIndex, blockType);
                const timeBlocks = generateTimeBlocks(
                    timeSlots, slotIndex, hoursToday, availability.preferredTime, subject.cognitiveLoad
                );

                timeBlocks.forEach((timeBlock, blockIdx) => {
                    const microTask = createStudyBlock(
                        subject, topics[blockIdx] || topics[0] || 'General Study',
                        blockType, timeBlock, dayIndex
                    );
                    daySchedule.blocks.push(microTask);
                });
                slotIndex += timeBlocks.length;

                hoursUsed += hoursToday;
            }
        }

        const remainingHours = availableHours - hoursUsed;
        if (remainingHours > 0 && bufferHours > 0) {
            const bufferTime = getBufferTimeSlot(availability.preferredTime, slotIndex);
            daySchedule.blocks.push({
                time: bufferTime,
                subject: 'Buffer',
                topic: '',
                type: 'Buffer',
                color: 'Yellow',
                rationale: 'Planned buffer for spillover tasks and unexpected delays',
                microTasks: ['Review previous day\'s notes', 'Catch up on missed topics', 'Take a break']
            });
        }

        daySchedule.blocks.sort((a, b) => {
            const timeA = a.time.split('-')[0];
            const timeB = b.time.split('-')[0];
            return timeA.localeCompare(timeB);
        });

        weekSchedule.push(daySchedule);
    });

    return weekSchedule;
}

function determineBlockType(subject, dayIndex, isWeekend) {
    if (dayIndex < 2) {
        if (subject.weak.length > 0 && subject.confidence <= 3) return 'Learning';
    }
    if (dayIndex >= 2 && dayIndex < 5) return 'Practice';
    if (isWeekend) return 'Revision';
    if (subject.cognitiveLoad === 'high') return 'Learning';
    if (subject.cognitiveLoad === 'medium') return 'Practice';
    return 'Revision';
}

function selectTopicsForDay(subject, dayIndex, blockType) {
    const topics = [];
    if (blockType === 'Learning' && subject.weak.length > 0) {
        topics.push(subject.weak[dayIndex % subject.weak.length]);
    } else if (blockType === 'Practice' && subject.weak.length > 0) {
        topics.push(`Practice: ${subject.weak[(dayIndex + 1) % subject.weak.length]}`);
    } else if (blockType === 'Revision') {
        if (subject.weak.length > 0) topics.push(`Review: ${subject.weak[0]}`);
        if (subject.strong.length > 0) topics.push(`Reinforce: ${subject.strong[0]}`);
    }
    return topics.length > 0 ? topics : ['General study and concept reinforcement'];
}

function generateTimeBlocks(timeSlots, startIndex, hours, preferredTime, cognitiveLoad) {
    const blocks = [];
    const slots = timeSlots.slots;
    let slotOffset = cognitiveLoad === 'medium' ? 1 : cognitiveLoad === 'low' ? 2 : 0;
    for (let i = 0; i < hours; i++) {
        const slotIdx = (startIndex + i + slotOffset) % slots.length;
        blocks.push(slots[slotIdx]);
    }
    return blocks;
}

function createStudyBlock(subject, topic, blockType, timeBlock, dayIndex) {
    const color = COLOR_MAP[subject.cognitiveLoad] || 'Yellow';
    const microTasks = generateMicroTasks(subject, topic, blockType);
    const rationale = generateBlockRationale(subject, topic, blockType, color);

    return {
        time: timeBlock,
        subject: subject.name,
        topic: topic,
        type: blockType,
        color: color,
        rationale: rationale,
        microTasks: microTasks,
        cognitiveLoad: subject.cognitiveLoad,
        confidence: subject.confidence,
        isHighFocus: subject.cognitiveLoad === 'high',
        canReschedule: true,
        id: `${subject.name}-${dayIndex}-${timeBlock.replace(/:/g, '')}`
    };
}

function generateMicroTasks(subject, topic, blockType) {
    const tasks = [];
    if (blockType === 'Learning') {
        tasks.push(`Read theory on ${topic}`);
        tasks.push(`Watch video tutorial on ${topic}`);
        tasks.push(`Take notes on key concepts`);
        tasks.push(`Solve 2-3 basic problems`);
    } else if (blockType === 'Practice') {
        tasks.push(`Solve 5-7 problems on ${topic}`);
        tasks.push(`Review solution approaches`);
        tasks.push(`Identify common patterns`);
        tasks.push(`Attempt challenging problem`);
    } else if (blockType === 'Revision') {
        tasks.push(`Review notes on ${topic}`);
        tasks.push(`Quick recap of formulas/concepts`);
        tasks.push(`Solve 2-3 revision problems`);
        tasks.push(`Create summary sheet`);
    } else {
        tasks.push('Flexible study time');
        tasks.push('Catch up on missed topics');
    }
    return tasks;
}

function generateBlockRationale(subject, topic, blockType, color) {
    const reasons = [];
    if (color === 'Red') reasons.push('Weak topic');
    if (subject.confidence <= 2) reasons.push('low confidence');
    if (subject.credits >= 4) reasons.push('high credit');
    if (blockType === 'Learning') reasons.push('new concept introduction');
    return reasons.length > 0 
        ? `${reasons.join(', ')} - ${blockType} session`
        : `${blockType} session for ${topic}`;
}

function getBufferTimeSlot(preferredTime, slotIndex) {
    const oppositeTime = {
        Morning: TIME_SLOTS.Night,
        Afternoon: TIME_SLOTS.Morning,
        Night: TIME_SLOTS.Afternoon
    };
    const bufferSlots = oppositeTime[preferredTime].slots;
    return bufferSlots[slotIndex % bufferSlots.length];
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

// Main generator function
export async function generateStudyPlan(input) {
    validateInput(input);
    
    const camelAI = new CamelAI();
    const scheduleData = camelAI.generateSchedule(input.subjects, input.availability, input.targetDate);
    const weekSchedule = generateWeekSchedule(
        scheduleData.subjectAllocations,
        input.availability,
        scheduleData.bufferHours
    );

    const subjectHours = {};
    scheduleData.subjectAllocations.forEach(subj => {
        subjectHours[subj.name] = subj.allocatedHours;
    });

    const next7DaysFocus = camelAI.generateNext7DaysFocus(weekSchedule, scheduleData.subjectAllocations);
    const progressCheckpoints = camelAI.generateProgressCheckpoints(
        input.subjects,
        scheduleData.subjectAllocations,
        input.targetDate
    );
    const summary = camelAI.generateSummary(
        input.student,
        input.subjects,
        input.targetDate,
        scheduleData,
        weekSchedule
    );

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
            student: input.student,
            targetDate: input.targetDate,
            version: '2.0-camel-ai-client'
        },
        week: weekSchedule,
        subjectHours: subjectHours,
        subjectBreakdown: subjectBreakdown,
        next7DaysFocus: next7DaysFocus,
        progressCheckpoints: progressCheckpoints,
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

