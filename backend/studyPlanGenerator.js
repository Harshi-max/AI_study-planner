/**
 * AI Study Planner - Backend Core Generator
 * Uses Camel AI (smart adaptive algorithm) - No external API required
 * Generates personalized, adaptive study schedules for engineering students
 */

// Camel AI - Intelligent Adaptive Algorithm
class CamelAI {
    constructor() {
        this.prerequisiteMap = this.initializePrerequisites();
    }

    initializePrerequisites() {
        return {
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

    /**
     * Analyze subject difficulty and cognitive load
     */
    analyzeCognitiveLoad(subject) {
        let load = 'medium';
        const factors = {
            weakTopics: subject.weak.length,
            confidence: subject.confidence,
            credits: subject.credits,
            prerequisites: this.checkPrerequisites(subject.name)
        };

        // High cognitive load if: low confidence OR many weak topics OR missing prerequisites
        if (subject.confidence <= 2 || subject.weak.length >= 3 || factors.prerequisites.missing > 0) {
            load = 'high';
        } else if (subject.confidence >= 4 && subject.weak.length === 0 && factors.prerequisites.missing === 0) {
            load = 'low';
        }

        return {
            load,
            factors,
            priority: this.calculatePriority(subject, factors)
        };
    }

    /**
     * Check prerequisites for a subject
     */
    checkPrerequisites(subjectName) {
        const prereqs = this.prerequisiteMap[subjectName] || [];
        return {
            required: prereqs,
            missing: prereqs.length // Will be updated when comparing with available subjects
        };
    }

    /**
     * Calculate priority score for scheduling
     */
    calculatePriority(subject, factors) {
        const weakTopicWeight = factors.weakTopics * 2.5;
        const creditWeight = subject.credits * 1.2;
        const confidenceWeight = (6 - subject.confidence) * 2;
        const prerequisiteWeight = factors.prerequisites.missing * 3;
        
        return weakTopicWeight + creditWeight + confidenceWeight + prerequisiteWeight;
    }

    /**
     * Generate adaptive schedule allocation
     */
    generateSchedule(subjects, availability, targetDate) {
        const totalWeeklyHours = (availability.weekdays * 5) + (availability.weekends * 2);
        const bufferPercent = 0.12; // 12% buffer
        const bufferHours = Math.round(totalWeeklyHours * bufferPercent);
        const availableHours = totalWeeklyHours - bufferHours;

        // Analyze all subjects
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

        // Update prerequisite missing count by comparing with available subjects
        analyzedSubjects.forEach(subject => {
            const prereqs = this.prerequisiteMap[subject.name] || [];
            const availableSubjectNames = subjects.map(s => s.name.toLowerCase());
            const missing = prereqs.filter(prereq => 
                !availableSubjectNames.some(name => 
                    name.includes(prereq.toLowerCase()) || prereq.toLowerCase().includes(name)
                )
            );
            subject.factors.prerequisites.missing = missing.length;
            // Recalculate priority with updated prerequisite count
            subject.priority = this.calculatePriority(subject, subject.factors);
        });

        // Sort by priority (prerequisites and weak topics first)
        analyzedSubjects.sort((a, b) => {
            if (Math.abs(a.factors.prerequisites.missing - b.factors.prerequisites.missing) > 0) {
                return b.factors.prerequisites.missing - a.factors.prerequisites.missing;
            }
            return b.priority - a.priority;
        });

        // Allocate hours proportionally
        const totalPriority = analyzedSubjects.reduce((sum, s) => sum + s.priority, 0);
        analyzedSubjects.forEach(subject => {
            const proportion = subject.priority / totalPriority;
            subject.allocatedHours = Math.max(2, Math.round(availableHours * proportion));
        });

        // Adjust to fit available hours
        const totalAllocated = analyzedSubjects.reduce((sum, s) => sum + s.allocatedHours, 0);
        if (totalAllocated !== availableHours) {
            const ratio = availableHours / totalAllocated;
            analyzedSubjects.forEach(subject => {
                subject.allocatedHours = Math.round(subject.allocatedHours * ratio);
            });
        }

        // Generate justifications
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

    /**
     * Generate justification for time allocation
     */
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

    /**
     * Generate next 7 days focus with actionable steps
     */
    generateNext7DaysFocus(weekSchedule, subjectAllocations) {
        const focus = [];
        const prerequisiteSubjects = subjectAllocations
            .filter(s => s.factors.prerequisites.missing > 0)
            .sort((a, b) => b.factors.prerequisites.missing - a.factors.prerequisites.missing);

        // Add prerequisite closure tasks
        prerequisiteSubjects.forEach(subject => {
            const missing = this.prerequisiteMap[subject.name] || [];
            if (missing.length > 0 && subject.weak.length > 0) {
                focus.push(`Revise ${missing[0]} before starting ${subject.weak[0]} to close prerequisite gap`);
            }
        });

        // Add weak topic priorities
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

        // Add deadline-based priorities
        subjectAllocations.forEach(subject => {
            if (subject.weak.length > 0) {
                const topic = subject.weak[0];
                focus.push(`Complete ${topic} before Week 3 to avoid backlog`);
            }
        });

        return focus.slice(0, 7);
    }

    /**
     * Generate progress checkpoints with adaptation suggestions
     */
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

            checkpoints.push({
                week,
                date: checkpointDate.toISOString().split('T')[0],
                assessments,
                adaptationSuggestions: this.generateAdaptationSuggestions(assessments, subjectAllocations)
            });
        });

        return checkpoints;
    }

    /**
     * Generate adaptation suggestions based on progress
     */
    generateAdaptationSuggestions(assessments, subjectAllocations) {
        const suggestions = [];
        
        assessments.forEach(assessment => {
            const subject = subjectAllocations.find(s => s.name === assessment.subject);
            if (assessment.expectedConfidence > assessment.currentConfidence + 1) {
                const improvement = assessment.expectedConfidence - assessment.currentConfidence;
                suggestions.push(
                    `Confidence in ${assessment.subject} improved from ${assessment.currentConfidence} → ${assessment.expectedConfidence}; ` +
                    `consider reallocating ${Math.round(subject.allocatedHours * 0.1)} mins to weaker subjects`
                );
            }
        });

        return suggestions;
    }

    /**
     * Generate outcome-oriented summary
     */
    generateSummary(student, subjects, targetDate, scheduleData, weekSchedule) {
        const today = new Date();
        const target = new Date(targetDate);
        const daysUntilTarget = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
        const weeksUntilTarget = Math.ceil(daysUntilTarget / 7);

        const totalWeakTopics = subjects.reduce((sum, s) => sum + s.weak.length, 0);
        const avgConfidence = subjects.reduce((sum, s) => sum + s.confidence, 0) / subjects.length;
        const expectedConfidence = Math.min(5, avgConfidence + Math.ceil(totalWeakTopics * 0.3));
        const confidenceImprovement = expectedConfidence - avgConfidence;

        // Calculate workload reduction
        const totalStudyHours = scheduleData.subjectAllocations.reduce((sum, s) => sum + s.allocatedHours, 0);
        const weakTopicsCovered = Math.ceil(totalWeakTopics * 0.8);
        const hoursSaved = weakTopicsCovered * 2; // ~2 hours per topic
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

// Export Camel AI instance
const camelAI = new CamelAI();

module.exports = { camelAI, CamelAI };

