/**
 * Advanced AI Study Planner - React Component
 * Features: Drag-and-drop, progress tracking, micro-tasks, gamification
 */

import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Color mapping for Tailwind
const COLOR_CLASSES = {
    Red: 'bg-red-500 text-white border-red-600',
    Yellow: 'bg-yellow-400 text-gray-900 border-yellow-500',
    Green: 'bg-green-500 text-white border-green-600'
};

const TYPE_ICONS = {
    Learning: '📚',
    Practice: '✏️',
    Revision: '🔄',
    Buffer: '⏱️'
};

/**
 * Sortable Block Component
 */
function SortableBlock({ block, onComplete, onReschedule }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    };

    const [completed, setCompleted] = useState(false);
    const [showMicroTasks, setShowMicroTasks] = useState(false);

    const handleComplete = () => {
        setCompleted(!completed);
        if (onComplete) onComplete(block.id, !completed);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`p-4 rounded-lg border-2 mb-3 cursor-move ${COLOR_CLASSES[block.color]} ${completed ? 'opacity-60 line-through' : ''}`}
            {...attributes}
            {...listeners}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                    <div className="font-bold text-lg">{block.subject}</div>
                    <div className="text-sm opacity-90">{block.time}</div>
                    {block.topic && (
                        <div className="text-sm font-semibold mt-1">{block.topic}</div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{TYPE_ICONS[block.type]}</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleComplete();
                        }}
                        className={`px-2 py-1 rounded text-xs ${completed ? 'bg-green-600' : 'bg-gray-600'}`}
                    >
                        {completed ? '✓' : '○'}
                    </button>
                </div>
            </div>
            
            <div className="text-xs mb-2 italic">{block.rationale}</div>
            
            {block.microTasks && block.microTasks.length > 0 && (
                <div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMicroTasks(!showMicroTasks);
                        }}
                        className="text-xs underline mb-2"
                    >
                        {showMicroTasks ? 'Hide' : 'Show'} Micro-tasks ({block.microTasks.length})
                    </button>
                    {showMicroTasks && (
                        <ul className="list-disc list-inside text-xs space-y-1 mt-2">
                            {block.microTasks.map((task, idx) => (
                                <li key={idx}>{task}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {onReschedule && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onReschedule(block);
                    }}
                    className="mt-2 text-xs underline"
                >
                    Reschedule
                </button>
            )}
        </div>
    );
}

/**
 * Day Column Component
 */
function DayColumn({ day, blocks, onBlockComplete, onReschedule, onBlockMove }) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = blocks.findIndex(b => b.id === active.id);
            const newIndex = blocks.findIndex(b => b.id === over.id);
            const newBlocks = arrayMove(blocks, oldIndex, newIndex);
            if (onBlockMove) {
                onBlockMove(day.day, newBlocks);
            }
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 min-h-[600px]">
            <div className="font-bold text-center mb-4 pb-2 border-b">
                <div className="text-lg">{day.day}</div>
                <div className="text-xs text-gray-500">{day.date}</div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={blocks.map(b => b.id)}>
                    {blocks.map((block) => (
                        <SortableBlock
                            key={block.id}
                            block={block}
                            onComplete={onBlockComplete}
                            onReschedule={onReschedule}
                        />
                    ))}
                </SortableContext>
            </DndContext>

            {blocks.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                    No study blocks scheduled
                </div>
            )}
        </div>
    );
}

/**
 * Progress Checkpoint Component
 */
function ProgressCheckpoint({ subject, currentConfidence, targetConfidence }) {
    const progress = (currentConfidence / targetConfidence) * 100;

    return (
        <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="font-bold mb-2">{subject}</div>
            <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div
                        className="bg-blue-500 h-4 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
                <div className="text-sm font-semibold">
                    {currentConfidence}/5 → {targetConfidence}/5
                </div>
            </div>
        </div>
    );
}

/**
 * Summary Panel Component
 */
function SummaryPanel({ summary, subjectHours }) {
    return (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div className="text-sm opacity-90">Completion Date</div>
                    <div className="text-xl font-bold">{summary.completionDate}</div>
                </div>
                <div>
                    <div className="text-sm opacity-90">Confidence Improvement</div>
                    <div className="text-xl font-bold">{summary.expectedConfidenceImprovement}</div>
                </div>
                <div>
                    <div className="text-sm opacity-90">Workload Reduction</div>
                    <div className="text-xl font-bold">{summary.lastMinuteWorkloadReduction}</div>
                </div>
                <div>
                    <div className="text-sm opacity-90">Total Study Hours/Week</div>
                    <div className="text-xl font-bold">
                        {Object.values(subjectHours).reduce((a, b) => a + b, 0)} hours
                    </div>
                </div>
            </div>
            <div className="mt-4 text-sm opacity-90 italic">{summary.rationale}</div>
        </div>
    );
}

/**
 * Next 7 Days Focus Component
 */
function Next7DaysFocus({ focusItems }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Next 7 Days Focus</h2>
            <ul className="space-y-2">
                {focusItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold">{idx + 1}.</span>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/**
 * Subject Hours Allocation Component
 */
function SubjectHoursAllocation({ subjectHours, progressCheckpoints, subjectBreakdown }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Subject-Wise Focus Breakdown</h2>
            <div className="space-y-3">
                {(subjectBreakdown || Object.entries(subjectHours).map(([name, hours]) => ({
                    name,
                    allocatedHours: hours,
                    percentage: 0,
                    justification: '',
                    cognitiveLoad: 'medium',
                    color: 'Yellow'
                }))).map((subject) => (
                    <div key={subject.name} className={`p-4 rounded-lg border-l-4 ${
                        subject.color === 'Red' ? 'border-red-500 bg-red-50' :
                        subject.color === 'Green' ? 'border-green-500 bg-green-50' :
                        'border-yellow-500 bg-yellow-50'
                    }`}>
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                                <div className="font-bold text-lg">{subject.name}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                    {subject.credits && `${subject.credits} Credits • `}
                                    {subject.allocatedHours} hrs/week
                                    {subject.percentage > 0 && ` (${subject.percentage}%)`}
                                </div>
                            </div>
                            <div className="text-lg font-bold text-blue-600">
                                {subject.allocatedHours} hrs
                            </div>
                        </div>
                        {subject.justification && (
                            <div className="text-sm text-gray-700 mt-2 italic">
                                {subject.justification}
                            </div>
                        )}
                        {progressCheckpoints && typeof progressCheckpoints === 'object' && !Array.isArray(progressCheckpoints) && progressCheckpoints[subject.name] && (
                            <div className="text-xs text-gray-500 mt-2">
                                Target Confidence: {progressCheckpoints[subject.name]}/5
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Gamification Badge Component
 */
function BadgeTracker({ completedBlocks, totalBlocks }) {
    const completionRate = (completedBlocks / totalBlocks) * 100;
    const badges = [];

    if (completionRate >= 100) badges.push({ name: 'Perfect Week', icon: '🏆', color: 'gold' });
    if (completionRate >= 80) badges.push({ name: 'Excellent', icon: '⭐', color: 'yellow' });
    if (completionRate >= 60) badges.push({ name: 'Good Progress', icon: '👍', color: 'green' });
    if (completedBlocks >= 10) badges.push({ name: '10 Blocks', icon: '🎯', color: 'blue' });
    if (completedBlocks >= 20) badges.push({ name: '20 Blocks', icon: '🔥', color: 'red' });

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Progress Tracker</h2>
            <div className="mb-4">
                <div className="flex justify-between mb-2">
                    <span>Completion</span>
                    <span>{completedBlocks}/{totalBlocks} blocks ({Math.round(completionRate)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                        className="bg-blue-500 h-4 rounded-full transition-all"
                        style={{ width: `${completionRate}%` }}
                    />
                </div>
            </div>
            {badges.length > 0 && (
                <div className="mt-4">
                    <div className="font-semibold mb-2">Badges Earned:</div>
                    <div className="flex flex-wrap gap-2">
                        {badges.map((badge, idx) => (
                            <div key={idx} className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-1">
                                <span>{badge.icon}</span>
                                <span className="text-sm">{badge.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Main Study Plan App Component
 */
export default function StudyPlanApp({ planData }) {
    const [plan, setPlan] = useState(planData);
    const [completedBlocks, setCompletedBlocks] = useState(new Set());
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        // Load from localStorage
        const saved = localStorage.getItem('studyPlan');
        const savedCompleted = localStorage.getItem('completedBlocks');
        if (saved) setPlan(JSON.parse(saved));
        if (savedCompleted) setCompletedBlocks(new Set(JSON.parse(savedCompleted)));

        // Calculate streak
        const lastDate = localStorage.getItem('lastStudyDate');
        const today = new Date().toDateString();
        if (lastDate === today) {
            setStreak(parseInt(localStorage.getItem('streak') || '0'));
        }
    }, []);

    const handleBlockComplete = (blockId, isCompleted) => {
        const newCompleted = new Set(completedBlocks);
        if (isCompleted) {
            newCompleted.add(blockId);
            // Update streak
            const today = new Date().toDateString();
            const lastDate = localStorage.getItem('lastStudyDate');
            if (lastDate !== today) {
                const newStreak = lastDate === new Date(Date.now() - 86400000).toDateString() 
                    ? streak + 1 
                    : 1;
                setStreak(newStreak);
                localStorage.setItem('streak', newStreak.toString());
                localStorage.setItem('lastStudyDate', today);
            }
        } else {
            newCompleted.delete(blockId);
        }
        setCompletedBlocks(newCompleted);
        localStorage.setItem('completedBlocks', JSON.stringify([...newCompleted]));
    };

    const handleBlockMove = (day, newBlocks) => {
        const updatedPlan = { ...plan };
        const dayIndex = updatedPlan.week.findIndex(d => d.day === day);
        if (dayIndex !== -1) {
            updatedPlan.week[dayIndex].blocks = newBlocks;
            setPlan(updatedPlan);
            localStorage.setItem('studyPlan', JSON.stringify(updatedPlan));
        }
    };

    const handleReschedule = (block) => {
        // Open reschedule modal (simplified - you can enhance this)
        const newTime = prompt('Enter new time (HH:MM-HH:MM):', block.time);
        if (newTime) {
            const updatedPlan = { ...plan };
            updatedPlan.week.forEach(day => {
                const blockIndex = day.blocks.findIndex(b => b.id === block.id);
                if (blockIndex !== -1) {
                    day.blocks[blockIndex].time = newTime;
                }
            });
            setPlan(updatedPlan);
            localStorage.setItem('studyPlan', JSON.stringify(updatedPlan));
        }
    };

    if (!plan) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-2xl font-bold mb-4">No Study Plan Available</div>
                    <div className="text-gray-600">Please generate a study plan first.</div>
                </div>
            </div>
        );
    }

    const totalBlocks = plan.week.reduce((sum, day) => sum + day.blocks.length, 0);
    const completedCount = completedBlocks.size;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h1 className="text-3xl font-bold text-purple-600 mb-2">
                        📚 AI Study Planner
                    </h1>
                    <p className="text-gray-600">
                        {plan.metadata?.student?.name || 'Student'} • 
                        Target: {plan.summary.completionDate} • 
                        Streak: {streak} days 🔥
                    </p>
                </div>

                {/* Summary and Focus */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SummaryPanel summary={plan.summary} subjectHours={plan.subjectHours} />
                    <Next7DaysFocus focusItems={plan.next7DaysFocus} />
                </div>

                {/* Progress Tracking */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <BadgeTracker completedBlocks={completedCount} totalBlocks={totalBlocks} />
                    <SubjectHoursAllocation 
                        subjectHours={plan.subjectHours} 
                        progressCheckpoints={plan.progressCheckpoints}
                        subjectBreakdown={plan.subjectBreakdown}
                    />
                </div>

                {/* Weekly Calendar */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">7-Day Study Schedule</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                        {plan.week.map((day) => (
                            <DayColumn
                                key={day.day}
                                day={day}
                                blocks={day.blocks}
                                onBlockComplete={handleBlockComplete}
                                onReschedule={handleReschedule}
                                onBlockMove={handleBlockMove}
                            />
                        ))}
                    </div>
                </div>

                {/* Progress Checkpoints */}
                {plan.progressCheckpoints && Array.isArray(plan.progressCheckpoints) && plan.progressCheckpoints.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Progress Checkpoints</h2>
                        <div className="space-y-4">
                            {plan.progressCheckpoints.map((checkpoint, idx) => (
                                <div key={idx} className="bg-white rounded-lg shadow-md p-6">
                                    <div className="font-bold text-lg mb-3">
                                        Week {checkpoint.week} - {checkpoint.date}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {checkpoint.assessments && checkpoint.assessments.map((assess, assessIdx) => (
                                            <ProgressCheckpoint
                                                key={assessIdx}
                                                subject={assess.subject}
                                                currentConfidence={assess.currentConfidence || 3}
                                                targetConfidence={assess.expectedConfidence || 5}
                                            />
                                        ))}
                                    </div>
                                    {checkpoint.adaptationSuggestions && checkpoint.adaptationSuggestions.length > 0 && (
                                        <div className="mt-4 p-3 bg-blue-50 rounded">
                                            <div className="font-semibold mb-2">Adaptation Suggestions:</div>
                                            {checkpoint.adaptationSuggestions.map((suggestion, sugIdx) => (
                                                <div key={sugIdx} className="text-sm text-gray-700">{suggestion}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

