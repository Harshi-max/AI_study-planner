/**
 * Weekly Schedule - Clean, Structured 7-Day Calendar View
 * Visual, Easy-to-Scan with Color-Coded Cognitive Load
 */

import React, { useState, useEffect, useMemo } from 'react';

const COLOR_CLASSES = {
    Red: 'bg-red-100 border-red-400 text-red-900',
    Yellow: 'bg-yellow-100 border-yellow-400 text-yellow-900',
    Green: 'bg-green-100 border-green-400 text-green-900'
};

const TYPE_BADGES = {
    Learning: { icon: '📚', label: 'Learn', color: 'bg-blue-500' },
    Practice: { icon: '✏️', label: 'Practice', color: 'bg-purple-500' },
    Revision: { icon: '🔄', label: 'Revise', color: 'bg-orange-500' },
    Buffer: { icon: '⏱️', label: 'Buffer', color: 'bg-gray-400' }
};

function StudyBlock({ block, isCompleted, onComplete, onRevise }) {
    const [showDetails, setShowDetails] = useState(false);
    const isRevision = block.type === 'Revision';
    const canRevise = isRevision && !isCompleted;

    return (
        <div
            className={`border-l-4 rounded-r-lg p-3 mb-2 transition-all hover:shadow-md ${
                COLOR_CLASSES[block.color] || COLOR_CLASSES.Yellow
            } ${isCompleted ? 'opacity-60' : ''}`}
        >
            {/* Header Row */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold">{block.time}</span>
                        <span className={`text-xs px-2 py-0.5 rounded text-white ${TYPE_BADGES[block.type]?.color || 'bg-gray-500'}`}>
                            {TYPE_BADGES[block.type]?.icon} {TYPE_BADGES[block.type]?.label || block.type}
                        </span>
                    </div>
                    <div className="font-semibold text-sm">{block.subject}</div>
                    {block.topic && (
                        <div className="text-xs mt-1 font-medium">{block.topic}</div>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {canRevise && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRevise(block);
                            }}
                            className="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition-all"
                            title="Start Revision"
                        >
                            🔄 Revise
                        </button>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onComplete(block.id, !isCompleted);
                        }}
                        className={`px-2 py-1 rounded text-xs transition-all ${
                            isCompleted 
                                ? 'bg-green-600 text-white hover:bg-green-700' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                        {isCompleted ? '✓ Done' : '○'}
                    </button>
                </div>
            </div>

            {/* Rationale */}
            {block.rationale && (
                <div className="text-xs text-gray-600 italic mb-2">{block.rationale}</div>
            )}

            {/* Micro Tasks Toggle */}
            {block.microTasks && block.microTasks.length > 0 && (
                <div>
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-xs text-gray-600 hover:text-gray-800 underline"
                    >
                        {showDetails ? '▼ Hide' : '▶ Show'} Tasks ({block.microTasks.length})
                    </button>
                    {showDetails && (
                        <ul className="list-disc list-inside text-xs mt-2 space-y-1 text-gray-700">
                            {block.microTasks.map((task, idx) => (
                                <li key={idx}>{task}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

function DayColumn({ day, blocks, completedBlocks, onBlockComplete, onRevise, dayStats, isToday }) {
    const dayBlocks = blocks || [];

    return (
        <div className={`bg-white rounded-lg shadow-sm border-2 min-h-[600px] ${
            isToday ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
        }`}>
            {/* Day Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-t-lg">
                <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-sm">{day.day}</div>
                    {isToday && <span className="text-xs bg-white text-purple-600 px-2 py-0.5 rounded">Today</span>}
                </div>
                <div className="text-xs opacity-90">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                {dayStats && (
                    <div className="mt-2 pt-2 border-t border-white border-opacity-30">
                        <div className="text-xs mb-1">
                            {dayStats.completed}/{dayStats.total} blocks
                        </div>
                        <div className="w-full bg-white bg-opacity-30 rounded-full h-1.5">
                            <div
                                className="bg-white h-1.5 rounded-full transition-all"
                                style={{ width: `${dayStats.rate}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Blocks Container */}
            <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
                {dayBlocks.length > 0 ? (
                    dayBlocks.map((block) => (
                        <StudyBlock
                            key={block.id}
                            block={block}
                            isCompleted={completedBlocks?.includes(block.id)}
                            onComplete={onBlockComplete}
                            onRevise={onRevise}
                        />
                    ))
                ) : (
                    <div className="text-center text-gray-400 py-8 text-sm">
                        No study blocks scheduled
                    </div>
                )}
            </div>
        </div>
    );
}

export default function WeeklySchedule({ plan, userProgress, onBlockComplete, onPlanUpdate }) {
    const [localPlan, setLocalPlan] = useState(plan);
    const [revisionModal, setRevisionModal] = useState(null);

    useEffect(() => {
        setLocalPlan(plan);
    }, [plan]);

    // Calculate dynamic stats
    const stats = useMemo(() => {
        const totalBlocks = localPlan?.week?.reduce((sum, day) => sum + (day.blocks?.length || 0), 0) || 0;
        const completedBlocks = userProgress?.completedBlocks || [];
        const completedCount = completedBlocks.length;
        const completionRate = totalBlocks > 0 ? (completedCount / totalBlocks) * 100 : 0;
        const today = new Date().toDateString();

        return { totalBlocks, completedBlocks, completedCount, completionRate, today };
    }, [localPlan, userProgress]);

    // Get dynamic color based on progress and confidence
    const getDynamicColor = useMemo(() => {
        return (block) => {
            const isCompleted = stats.completedBlocks.includes(block.id);
            const confidenceUpdates = userProgress?.confidenceUpdates || {};
            const subjectConfidence = confidenceUpdates[block.subject] || block.confidence || 3;
            
            if (isCompleted) return 'Green';
            
            const originalConfidence = block.confidence || 3;
            const confidenceImproved = subjectConfidence > originalConfidence;
            
            if (subjectConfidence <= 2 || (block.cognitiveLoad === 'high' && !confidenceImproved)) {
                return 'Red';
            } else if (subjectConfidence >= 4 || (block.cognitiveLoad === 'low' && confidenceImproved)) {
                return 'Green';
            }
            return block.color || 'Yellow';
        };
    }, [stats.completedBlocks, userProgress?.confidenceUpdates]);

    // Get blocks with dynamic updates
    const getDynamicBlocks = useMemo(() => {
        return (dayBlocks) => {
            return dayBlocks.map(block => ({
                ...block,
                dynamicColor: getDynamicColor(block),
                isCompleted: stats.completedBlocks.includes(block.id)
            }));
        };
    }, [stats.completedBlocks, getDynamicColor]);

    // Calculate daily completion stats
    const getDayStats = (day) => {
        const dayBlocks = day.blocks || [];
        const dayCompleted = dayBlocks.filter(b => stats.completedBlocks.includes(b.id)).length;
        const dayTotal = dayBlocks.length;
        return { 
            completed: dayCompleted, 
            total: dayTotal, 
            rate: dayTotal > 0 ? (dayCompleted / dayTotal) * 100 : 0 
        };
    };

    const handleRevise = (block) => {
        setRevisionModal({
            subject: block.subject,
            topic: block.topic,
            time: block.time,
            blockId: block.id
        });
    };

    const handleRevisionComplete = () => {
        if (revisionModal) {
            onBlockComplete(revisionModal.blockId, true);
            setRevisionModal(null);
        }
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-lg p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-purple-600">7-Day Study Schedule</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Color-coded by cognitive load • {Math.round(stats.completionRate)}% Complete
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded"></div>
                            <span>High Load</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                            <span>Medium</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span>Low Load</span>
                        </div>
                    </div>
                </div>

                {/* 7-Day Grid */}
                <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                    {localPlan?.week?.map((day) => {
                        const dayStats = getDayStats(day);
                        const isToday = new Date(day.date).toDateString() === stats.today;
                        const dynamicBlocks = getDynamicBlocks(day.blocks || []);
                        
                        return (
                            <DayColumn
                                key={day.day}
                                day={day}
                                blocks={dynamicBlocks}
                                completedBlocks={stats.completedBlocks}
                                onBlockComplete={onBlockComplete}
                                onRevise={handleRevise}
                                dayStats={dayStats}
                                isToday={isToday}
                            />
                        );
                    })}
                </div>

                {/* Summary Stats */}
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <div className="text-gray-600 text-xs">Total Blocks</div>
                            <div className="font-bold text-lg">{stats.totalBlocks}</div>
                        </div>
                        <div>
                            <div className="text-gray-600 text-xs">Completed</div>
                            <div className="font-bold text-lg text-green-600">{stats.completedCount}</div>
                        </div>
                        <div>
                            <div className="text-gray-600 text-xs">Remaining</div>
                            <div className="font-bold text-lg text-orange-600">{stats.totalBlocks - stats.completedCount}</div>
                        </div>
                        <div>
                            <div className="text-gray-600 text-xs">Progress</div>
                            <div className="font-bold text-lg text-purple-600">{Math.round(stats.completionRate)}%</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revision Modal */}
            {revisionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">🔄 Revision Session</h3>
                        <div className="space-y-3 mb-6">
                            <div>
                                <div className="text-sm text-gray-600">Subject</div>
                                <div className="font-semibold">{revisionModal.subject}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Topic</div>
                                <div className="font-semibold">{revisionModal.topic || 'General Revision'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Time</div>
                                <div className="font-semibold">{revisionModal.time}</div>
                            </div>
                            <div className="mt-4 p-3 bg-blue-50 rounded">
                                <div className="text-sm font-semibold mb-2">Revision Checklist:</div>
                                <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                                    <li>Review key concepts and formulas</li>
                                    <li>Solve practice problems</li>
                                    <li>Identify areas needing more practice</li>
                                    <li>Take notes on difficult points</li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleRevisionComplete}
                                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold"
                            >
                                ✓ Complete Revision
                            </button>
                            <button
                                onClick={() => setRevisionModal(null)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
