/**
 * AI Recommendations Panel - Actionable insights and suggestions
 */

import React from 'react';

export default function AIPanel({ planData }) {
    if (!planData) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-2xl font-bold mb-4">No Study Plan Available</div>
                <div className="text-gray-600">Generate a study plan to see AI recommendations.</div>
            </div>
        );
    }

    const next7DaysFocus = planData.next7DaysFocus || [];
    const checkpoints = planData.progressCheckpoints || [];
    const subjects = planData.subjectBreakdown || [];
    const weakTopics = subjects.flatMap(s => s.weakTopics || []);

    // Generate AI recommendations
    const recommendations = [
        {
            type: 'priority',
            title: '🎯 Priority Focus',
            content: `Focus on ${weakTopics.length} weak topics first. Start with prerequisite-heavy subjects.`,
            action: 'Review your Next 7 Days Focus below'
        },
        {
            type: 'time',
            title: '⏰ Time Management',
            content: `You have ${Object.values(planData.subjectHours || {}).reduce((a, b) => a + b, 0)} hours/week allocated. ` +
                    `Use buffer time (10-15%) for spillovers and unexpected delays.`,
            action: 'Schedule high-focus tasks during your preferred study time'
        },
        {
            type: 'confidence',
            title: '📈 Confidence Building',
            content: `Track your progress weekly. Aim to improve confidence by 0.5-1 point per weak topic.`,
            action: 'Check progress checkpoints regularly'
        }
    ];

    // Adaptation suggestions from checkpoints
    const adaptationSuggestions = checkpoints
        .flatMap(cp => cp.adaptationSuggestions || [])
        .slice(0, 3);

    return (
        <div className="space-y-6">
            {/* AI Recommendations */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">🤖 AI Recommendations</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recommendations.map((rec, idx) => (
                        <div key={idx} className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-blue-50">
                            <div className="font-bold text-lg mb-2">{rec.title}</div>
                            <div className="text-sm text-gray-700 mb-3">{rec.content}</div>
                            <div className="text-xs text-purple-600 italic">{rec.action}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Next 7 Days Focus */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">🎯 Next 7 Days Focus</h2>
                <div className="space-y-2">
                    {next7DaysFocus.length > 0 ? (
                        next7DaysFocus.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <span className="text-purple-600 font-bold text-lg">{idx + 1}.</span>
                                <span className="flex-1">{item}</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-600">No focus items available. Generate a study plan first.</div>
                    )}
                </div>
            </div>

            {/* Adaptation Suggestions */}
            {adaptationSuggestions.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">🔄 Dynamic Adaptation Suggestions</h2>
                    <div className="space-y-2">
                        {adaptationSuggestions.map((suggestion, idx) => (
                            <div key={idx} className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                                <div className="text-sm">{suggestion}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Weekly Motivation Tips */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">💪 Weekly Motivation</h2>
                <div className="space-y-2">
                    <div>✨ Consistency beats intensity - study a little every day</div>
                    <div>🎯 Focus on weak topics first - they'll give you the biggest confidence boost</div>
                    <div>📚 Use buffer time wisely - it's your safety net</div>
                    <div>🏆 Track your progress - celebrate small wins</div>
                    <div>🔄 Adapt as you go - adjust your plan based on performance</div>
                </div>
            </div>
        </div>
    );
}

