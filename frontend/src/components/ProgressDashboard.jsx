/**
 * Progress Dashboard - Visualize progress and confidence
 */

import React, { useState, useEffect } from 'react';

export default function ProgressDashboard({ planData }) {
    const [completedBlocks, setCompletedBlocks] = useState(new Set());

    useEffect(() => {
        const saved = localStorage.getItem('completedBlocks');
        if (saved) {
            setCompletedBlocks(new Set(JSON.parse(saved)));
        }
    }, []);

    if (!planData) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-2xl font-bold mb-4">No Study Plan Available</div>
                <div className="text-gray-600">Generate a study plan to see your progress.</div>
            </div>
        );
    }

    const subjects = planData.subjectBreakdown || [];
    const totalBlocks = planData.week?.reduce((sum, day) => sum + day.blocks.length, 0) || 0;
    const completedCount = completedBlocks.size;
    const completionRate = totalBlocks > 0 ? (completedCount / totalBlocks) * 100 : 0;

    // Calculate hours completed
    const totalHours = Object.values(planData.subjectHours || {}).reduce((a, b) => a + b, 0);
    const completedHours = Math.round((completionRate / 100) * totalHours);

    return (
        <div className="space-y-6">
            {/* Overall Progress */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Overall Progress</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-3xl font-bold text-purple-600">{Math.round(completionRate)}%</div>
                        <div className="text-sm text-gray-600">Completion Rate</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600">{completedCount}/{totalBlocks}</div>
                        <div className="text-sm text-gray-600">Blocks Completed</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600">{completedHours}/{totalHours}</div>
                        <div className="text-sm text-gray-600">Hours Completed</div>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                            className="bg-purple-600 h-4 rounded-full transition-all"
                            style={{ width: `${completionRate}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Subject-wise Progress */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Subject-wise Progress</h2>
                <div className="space-y-4">
                    {subjects.map((subject) => {
                        const checkpoint = planData.progressCheckpoints?.[0]?.assessments?.find(
                            a => a.subject === subject.name
                        );
                        const currentConfidence = checkpoint?.currentConfidence || subject.currentConfidence || 3;
                        const targetConfidence = checkpoint?.expectedConfidence || 5;
                        const confidenceProgress = (currentConfidence / targetConfidence) * 100;
                        const colorClass = subject.cognitiveLoad === 'high' ? 'red' : 
                                         subject.cognitiveLoad === 'medium' ? 'yellow' : 'green';

                        return (
                            <div key={subject.name} className="border rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg">{subject.name}</h3>
                                        <div className="text-sm text-gray-600">
                                            {subject.allocatedHours} hrs/week • {subject.credits} Credits
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded text-white ${
                                        colorClass === 'red' ? 'bg-red-500' :
                                        colorClass === 'yellow' ? 'bg-yellow-500' :
                                        'bg-green-500'
                                    }`}>
                                        {subject.cognitiveLoad.toUpperCase()}
                                    </div>
                                </div>
                                
                                <div className="mb-2">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Confidence Progress</span>
                                        <span>{currentConfidence}/5 → {targetConfidence}/5</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full transition-all ${
                                                colorClass === 'red' ? 'bg-red-500' :
                                                colorClass === 'yellow' ? 'bg-yellow-500' :
                                                'bg-green-500'
                                            }`}
                                            style={{ width: `${Math.min(confidenceProgress, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {subject.weakTopics && subject.weakTopics.length > 0 && (
                                    <div className="text-sm">
                                        <span className="font-semibold">Weak Topics:</span>
                                        <span className="ml-2 text-red-600">
                                            {subject.weakTopics.join(', ')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Weekly Checkpoints */}
            {planData.progressCheckpoints && Array.isArray(planData.progressCheckpoints) && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">Weekly Confidence Checkpoints</h2>
                    <div className="space-y-4">
                        {planData.progressCheckpoints.map((checkpoint, idx) => (
                            <div key={idx} className="border-l-4 border-purple-500 pl-4 py-2">
                                <div className="font-bold">
                                    Week {checkpoint.week} - {checkpoint.date}
                                </div>
                                <div className="mt-2 space-y-1">
                                    {checkpoint.assessments?.map((assess, assessIdx) => (
                                        <div key={assessIdx} className="text-sm">
                                            <span className="font-semibold">{assess.subject}:</span>
                                            {' '}Expected confidence: {assess.expectedConfidence}/5
                                            {assess.weakTopicsToCover > 0 && (
                                                <span className="text-gray-600">
                                                    {' '}• {assess.weakTopicsToCover} weak topics to cover
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

