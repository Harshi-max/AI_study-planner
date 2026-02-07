/**
 * Schedule Builder - Creates 7-day calendar with blocks
 */

const TIME_SLOTS = {
    Morning: {
        slots: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00']
    },
    Afternoon: {
        slots: ['13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00']
    },
    Night: {
        slots: ['18:00-19:00', '19:00-20:00', '20:00-21:00', '21:00-22:00', '22:00-23:00']
    }
};

const COLOR_MAP = {
    high: 'Red',
    medium: 'Yellow',
    low: 'Green'
};

/**
 * Generate 7-day week schedule
 */
function generateWeekSchedule(subjectAllocations, availability, bufferHours) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const weekSchedule = [];
    const today = new Date();

    days.forEach((dayName, dayIndex) => {
        const date = new Date(today);
        date.setDate(date.getDate() + dayIndex);
        
        const isWeekend = dayName === 'Saturday' || dayName === 'Sunday';
        const availableHours = isWeekend ? availability.weekends : availability.weekdays;
        
        const daySchedule = {
            day: dayName,
            date: date.toISOString().split('T')[0],
            blocks: []
        };

        const timeSlots = TIME_SLOTS[availability.preferredTime];
        let slotIndex = 0;
        let hoursUsed = 0;

        // Prioritize high cognitive load subjects
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
                    timeSlots,
                    slotIndex,
                    hoursToday,
                    availability.preferredTime,
                    subject.cognitiveLoad
                );

                timeBlocks.forEach((timeBlock, blockIdx) => {
                    const microTask = createStudyBlock(
                        subject,
                        topics[blockIdx] || topics[0] || 'General Study',
                        blockType,
                        timeBlock,
                        dayIndex
                    );
                    daySchedule.blocks.push(microTask);
                    slotIndex++;
                });

                hoursUsed += hoursToday;
            }
        }

        // Add buffer time
        const remainingHours = availableHours - hoursUsed;
        if (remainingHours > 0 && bufferHours > 0) {
            const bufferAllocation = Math.min(remainingHours, Math.ceil(bufferHours / 7));
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

        // Sort blocks by time
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
        if (subject.weak.length > 0 && subject.confidence <= 3) {
            return 'Learning';
        }
    }
    if (dayIndex >= 2 && dayIndex < 5) {
        return 'Practice';
    }
    if (isWeekend) {
        return 'Revision';
    }
    if (subject.cognitiveLoad === 'high') {
        return 'Learning';
    } else if (subject.cognitiveLoad === 'medium') {
        return 'Practice';
    } else {
        return 'Revision';
    }
}

function selectTopicsForDay(subject, dayIndex, blockType) {
    const topics = [];
    if (blockType === 'Learning' && subject.weak.length > 0) {
        const topicIndex = dayIndex % subject.weak.length;
        topics.push(subject.weak[topicIndex]);
    } else if (blockType === 'Practice' && subject.weak.length > 0) {
        const topicIndex = (dayIndex + 1) % subject.weak.length;
        topics.push(`Practice: ${subject.weak[topicIndex]}`);
    } else if (blockType === 'Revision') {
        if (subject.weak.length > 0) {
            topics.push(`Review: ${subject.weak[0]}`);
        }
        if (subject.strong.length > 0) {
            topics.push(`Reinforce: ${subject.strong[0]}`);
        }
    }
    return topics.length > 0 ? topics : ['General study and concept reinforcement'];
}

function generateTimeBlocks(timeSlots, startIndex, hours, preferredTime, cognitiveLoad) {
    const blocks = [];
    const slots = timeSlots.slots;
    let slotOffset = 0;
    
    if (cognitiveLoad === 'medium') {
        slotOffset = 1;
    } else if (cognitiveLoad === 'low') {
        slotOffset = 2;
    }

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

module.exports = { generateWeekSchedule };

