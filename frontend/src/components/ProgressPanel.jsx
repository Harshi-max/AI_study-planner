/**
 * Progress Panel - Right Sidebar
 * Shows: Progress Tracker, Subject-wise Breakdown, Next 7 Days Focus, Summary, Confidence Graphs
 */

import React from 'react';

export default function ProgressPanel({ plan, userProgress, onConfidenceUpdate }) {
    const totalBlocks = plan?.week?.reduce((sum, day) => sum + day.blocks.length, 0) || 0;
    const completedBlocks = userProgress?.completedBlocks?.length || 0;
    const completionRate = totalBlocks > 0 ? (completedBlocks / totalBlocks) * 100 : 0;
    const totalHours = Object.values(plan?.subjectHours || {}).reduce((a, b) => a + b, 0);
    const completedHours = userProgress?.completedHours || 0;

    // Get current confidence from user progress or plan
    const getCurrentConfidence = (subjectName) => {
        return userProgress?.confidenceUpdates?.[subjectName] || 
               plan?.subjectBreakdown?.find(s => s.name === subjectName)?.currentConfidence || 3;
    };

    return (
        <div className="space-y-4">
            {/* Progress Tracker */}
            <div className="bg-white rounded-lg shadow-lg p-4">
                <h3 className="text-lg font-bold mb-3">📊 Progress Tracker</h3>
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Completion</span>
                            <span>{Math.round(completionRate)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-purple-600 h-3 rounded-full transition-all"
                                style={{ width: `${completionRate}%` }}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-center p-2 bg-purple-50 rounded">
                            <div className="font-bold text-purple-600">{completedBlocks}/{totalBlocks}</div>
                            <div className="text-xs text-gray-600">Blocks</div>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="font-bold text-blue-600">{completedHours}/{totalHours}</div>
                            <div className="text-xs text-gray-600">Hours</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subject-wise Breakdown */}
            <div className="bg-white rounded-lg shadow-lg p-4">
                <h3 className="text-lg font-bold mb-3">📚 Subject-wise Breakdown</h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {plan?.subjectBreakdown?.map((subject) => {
                        const currentConf = getCurrentConfidence(subject.name);
                        const colorClass = subject.cognitiveLoad === 'high' ? 'red' : 
                                         subject.cognitiveLoad === 'medium' ? 'yellow' : 'green';
                        
                        return (
                            <div key={subject.name} className={`p-3 rounded-lg border-l-4 ${
                                colorClass === 'red' ? 'border-red-500 bg-red-50' :
                                colorClass === 'green' ? 'border-green-500 bg-green-50' :
                                'border-yellow-500 bg-yellow-50'
                            }`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <div className="font-bold text-sm">{subject.name}</div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            {subject.credits} Credits • {subject.allocatedHours} hrs/week
                                            {subject.percentage > 0 && ` (${subject.percentage}%)`}
                                        </div>
                                    </div>
                                </div>
                                {subject.justification && (
                                    <div className="text-xs text-gray-700 mt-2 italic">
                                        {subject.justification}
                                    </div>
                                )}
                                <div className="mt-2 text-xs">
                                    <div className="flex justify-between">
                                        <span>Confidence:</span>
                                        <span className="font-semibold">{currentConf}/5</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Next 7 Days Focus */}
            <div className="bg-white rounded-lg shadow-lg p-4">
                <h3 className="text-lg font-bold mb-3">🎯 Next 7 Days Focus</h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {plan?.next7DaysFocus && plan.next7DaysFocus.length > 0 ? (
                        plan.next7DaysFocus.map((item, idx) => (
                            <div key={idx} className="text-sm p-2 bg-gray-50 rounded">
                                <span className="text-purple-600 font-bold">{idx + 1}.</span> {item}
                            </div>
                        ))
                    ) : (
                        <div className="text-sm text-gray-500">No focus items available</div>
                    )}
                </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-lg p-4">
                <h3 className="text-lg font-bold mb-3">📋 Summary</h3>
                <div className="space-y-3 text-sm">
                    <div>
                        <div className="opacity-90 text-xs mb-1">Target Completion Date</div>
                        <div className="font-bold">{plan?.summary?.completionDate || 'Not set'}</div>
                    </div>
                    <div>
                        <div className="opacity-90 text-xs mb-1">Estimated Timeline</div>
                        <div className="font-bold">{plan?.summary?.estimatedTimeline || 'N/A'}</div>
                    </div>
                    <div>
                        <div className="opacity-90 text-xs mb-1">Expected Confidence Improvement</div>
                        <div className="font-bold">{plan?.summary?.expectedConfidenceImprovement || 'N/A'}</div>
                    </div>
                    <div>
                        <div className="opacity-90 text-xs mb-1">Last Minute Workload Reduction</div>
                        <div className="font-bold">{plan?.summary?.lastMinuteWorkloadReduction || 'N/A'}</div>
                    </div>
                    {plan?.summary?.rationale && (
                        <div className="mt-3 pt-3 border-t border-white border-opacity-30">
                            <div className="opacity-90 text-xs mb-1">Rationale</div>
                            <div className="text-xs italic">{plan.summary.rationale}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confidence Graphs */}
            <div className="bg-white rounded-lg shadow-lg p-4">
                <h3 className="text-lg font-bold mb-3">📈 Confidence Progress</h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {plan?.subjectBreakdown?.map((subject) => {
                        const currentConf = getCurrentConfidence(subject.name);
                        const checkpoint = plan?.progressCheckpoints?.[0]?.assessments?.find(
                            a => a.subject === subject.name
                        );
                        const targetConf = checkpoint?.expectedConfidence || 5;
                        const progress = (currentConf / targetConf) * 100;
                        const colorClass = subject.cognitiveLoad === 'high' ? 'red' : 
                                         subject.cognitiveLoad === 'medium' ? 'yellow' : 'green';

                        return (
                            <div key={subject.name} className="border rounded p-2">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="text-sm font-semibold">{subject.name}</div>
                                    <div className="text-xs text-gray-600">{currentConf}/5</div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                    <div
                                        className={`h-2 rounded-full transition-all ${
                                            colorClass === 'red' ? 'bg-red-500' :
                                            colorClass === 'yellow' ? 'bg-yellow-500' :
                                            'bg-green-500'
                                        }`}
                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mb-2">
                                    <span>Current: {currentConf}/5</span>
                                    <span>Target: {targetConf}/5</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    value={currentConf}
                                    onChange={(e) => onConfidenceUpdate(subject.name, parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
