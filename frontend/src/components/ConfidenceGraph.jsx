/**
 * Confidence Graph Component
 * Displays confidence levels for each subject across days as a line/area graph
 */

import React, { useState, useMemo } from 'react';

export default function ConfidenceGraph({ plan, userProgress }) {
    const [selectedSubject, setSelectedSubject] = useState(null);

    // Generate confidence data for each subject across days
    const confidenceData = useMemo(() => {
        if (!plan?.week || !plan?.subjectBreakdown) return { days: [], subjects: {} };

        const days = plan.week.map((day, idx) => {
            const dateObj = new Date(day.date);
            return {
                index: idx,
                label: dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                date: day.date
            };
        });

        const subjects = {};
        plan.subjectBreakdown.forEach(subject => {
            const confidenceUpdates = userProgress?.confidenceUpdates || {};
            const initialConfidence = subject.confidence || 3;
            const currentConfidence = confidenceUpdates[subject.name] || initialConfidence;

            // Simulate progressive confidence improvement across days
            const data = [];
            for (let i = 0; i < plan.week.length; i++) {
                // Progressive improvement: start at initial, gradually improve
                const progressFactor = i / (plan.week.length - 1);
                const improvementRange = 4.5 - initialConfidence; // Max improvement is to 4.5
                const dayConfidence = initialConfidence + (improvementRange * progressFactor * 0.6) + 
                                     (currentConfidence - initialConfidence);
                data.push(Math.min(5, Math.max(1, dayConfidence)));
            }
            subjects[subject.name] = data;
        });

        return { days, subjects };
    }, [plan, userProgress]);

    const allSubjects = Object.keys(confidenceData.subjects);
    const activeSubject = selectedSubject || (allSubjects.length > 0 ? allSubjects[0] : null);
    const activeData = confidenceData.subjects[activeSubject] || [];

    // Get color based on confidence level
    const getConfidenceColor = (confidence) => {
        if (confidence >= 4) return 'rgb(34, 197, 94)'; // Green
        if (confidence >= 3) return 'rgb(234, 179, 8)'; // Yellow
        return 'rgb(239, 68, 68)'; // Red
    };

    const getConfidenceBgColor = (confidence) => {
        if (confidence >= 4) return 'bg-green-100';
        if (confidence >= 3) return 'bg-yellow-100';
        return 'bg-red-100';
    };

    const getConfidenceTextColor = (confidence) => {
        if (confidence >= 4) return 'text-green-700';
        if (confidence >= 3) return 'text-yellow-700';
        return 'text-red-700';
    };

    // SVG Graph dimensions
    const SVG_WIDTH = 1000;
    const SVG_HEIGHT = 400;
    const PADDING = 60;
    const GRAPH_WIDTH = SVG_WIDTH - 2 * PADDING;
    const GRAPH_HEIGHT = SVG_HEIGHT - 2 * PADDING;

    // Calculate SVG path for line graph
    const generatePath = () => {
        if (activeData.length === 0) return '';

        const points = activeData.map((value, idx) => {
            const x = PADDING + (idx / (activeData.length - 1)) * GRAPH_WIDTH;
            const y = PADDING + GRAPH_HEIGHT - ((value - 1) / 4) * GRAPH_HEIGHT; // Normalize 1-5 to height
            return `${x},${y}`;
        });

        return `M${points.join('L')}`;
    };

    // Y-axis labels (confidence levels)
    const yAxisLabels = [
        { value: 1, label: 'Very Low' },
        { value: 2, label: 'Low' },
        { value: 3, label: 'Medium' },
        { value: 4, label: 'High' },
        { value: 5, label: 'Very High' }
    ];

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 w-full h-full overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-purple-600">📈 Confidence Progression</h2>

            {/* Subject Selector */}
            <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-gray-700">
                    📌 Select Subject:
                </label>
                <div className="flex flex-wrap gap-2">
                    {allSubjects.map((subject) => (
                        <button
                            key={subject}
                            onClick={() => setSelectedSubject(subject)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer active:scale-95 ${
                                activeSubject === subject
                                    ? 'bg-purple-600 text-white shadow-lg scale-105'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105'
                            }`}
                        >
                            {subject}
                        </button>
                    ))}
                </div>
            </div>

            {/* Graph Section */}
            {activeSubject && activeData.length > 0 && (
                <div className="mb-8">
                    <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                        <svg width={SVG_WIDTH} height={SVG_HEIGHT} className="mx-auto">
                            {/* Grid lines */}
                            {yAxisLabels.map((label) => {
                                const y = PADDING + GRAPH_HEIGHT - ((label.value - 1) / 4) * GRAPH_HEIGHT;
                                return (
                                    <g key={`grid-${label.value}`}>
                                        <line
                                            x1={PADDING}
                                            y1={y}
                                            x2={SVG_WIDTH - PADDING}
                                            y2={y}
                                            stroke="#e5e7eb"
                                            strokeDasharray="4"
                                        />
                                    </g>
                                );
                            })}

                            {/* Y-Axis */}
                            <line
                                x1={PADDING}
                                y1={PADDING}
                                x2={PADDING}
                                y2={SVG_HEIGHT - PADDING}
                                stroke="#374151"
                                strokeWidth="2"
                            />

                            {/* X-Axis */}
                            <line
                                x1={PADDING}
                                y1={SVG_HEIGHT - PADDING}
                                x2={SVG_WIDTH - PADDING}
                                y2={SVG_HEIGHT - PADDING}
                                stroke="#374151"
                                strokeWidth="2"
                            />

                            {/* Y-Axis Labels */}
                            {yAxisLabels.map((label) => {
                                const y = PADDING + GRAPH_HEIGHT - ((label.value - 1) / 4) * GRAPH_HEIGHT;
                                return (
                                    <g key={`label-${label.value}`}>
                                        <text
                                            x={PADDING - 10}
                                            y={y + 5}
                                            textAnchor="end"
                                            fontSize="12"
                                            fill="#6b7280"
                                        >
                                            {label.value}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* X-Axis Labels */}
                            {confidenceData.days.map((day, idx) => {
                                const x = PADDING + (idx / (confidenceData.days.length - 1)) * GRAPH_WIDTH;
                                return (
                                    <g key={`day-${idx}`}>
                                        <text
                                            x={x}
                                            y={SVG_HEIGHT - PADDING + 20}
                                            textAnchor="middle"
                                            fontSize="11"
                                            fill="#6b7280"
                                        >
                                            {day.label}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Area fill */}
                            <defs>
                                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor={getConfidenceColor(activeData[0])} stopOpacity="0.3" />
                                    <stop offset="100%" stopColor={getConfidenceColor(activeData[0])} stopOpacity="0.05" />
                                </linearGradient>
                            </defs>

                            {/* Area path */}
                            <path
                                d={`${generatePath()} L${PADDING + GRAPH_WIDTH},${SVG_HEIGHT - PADDING} L${PADDING},${SVG_HEIGHT - PADDING} Z`}
                                fill="url(#areaGradient)"
                            />

                            {/* Line path */}
                            <path
                                d={generatePath()}
                                stroke={getConfidenceColor(activeData[0])}
                                strokeWidth="3"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* Data points */}
                            {activeData.map((value, idx) => {
                                const x = PADDING + (idx / (activeData.length - 1)) * GRAPH_WIDTH;
                                const y = PADDING + GRAPH_HEIGHT - ((value - 1) / 4) * GRAPH_HEIGHT;
                                return (
                                    <circle
                                        key={`point-${idx}`}
                                        cx={x}
                                        cy={y}
                                        r="5"
                                        fill={getConfidenceColor(value)}
                                        stroke="white"
                                        strokeWidth="2"
                                    />
                                );
                            })}
                        </svg>
                    </div>
                </div>
            )}

            {/* Daily Confidence Breakdown */}
            {activeSubject && (
                <div>
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Daily Breakdown - {activeSubject}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {confidenceData.days.map((day, idx) => {
                            const confidence = activeData[idx];
                            return (
                                <div
                                    key={`breakdown-${idx}`}
                                    className={`p-3 rounded-lg border-2 ${getConfidenceBgColor(confidence)}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-gray-800">{day.label}</span>
                                        <span className={`text-lg font-bold ${getConfidenceTextColor(confidence)}`}>
                                            {confidence.toFixed(1)}/5
                                        </span>
                                    </div>
                                    <div className="mt-2 w-full bg-gray-300 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all`}
                                            style={{
                                                width: `${(confidence / 5) * 100}%`,
                                                backgroundColor: getConfidenceColor(confidence)
                                            }}
                                        />
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                        {confidence >= 4 && '✓ Strong'}
                                        {confidence >= 3 && confidence < 4 && '→ Improving'}
                                        {confidence < 3 && '⚠ Needs focus'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-800">Confidence Scale:</h3>
                <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm">1-2: Weak</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-sm">3: Medium</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">4-5: Strong</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
