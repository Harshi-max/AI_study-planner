/**
 * Right Panel - Dynamic Content Viewer
 * Shows different views based on selected navigation item
 * DYNAMIC SUBJECT TRACKING: Progress tracked per subject, filterable in any view
 */

import React, { useMemo, useState } from 'react';
import Chatbot from './Chatbot';
import LinksNotes from './LinksNotes';
import ScheduleView from './ScheduleView';
import RequirementsChecklist from './RequirementsChecklist';
import ConfidenceGraph from './ConfidenceGraph';

export default function RightPanel({ 
    activeView, 
    plan, 
    userProgress, 
    user, 
    onConfidenceUpdate, 
    onUpdateProgress,
    onExport,
    onBlockComplete,
    onPlanUpdate,
    onGeneratePlan,
    onDeleteSubject
}) {
    // Centralized subject selection (persists across all views)
    const [selectedSubject, setSelectedSubject] = useState('all');
    
    // Keep old state for backward compatibility (can be deprecated later)
    const [selectedProgressSubject, setSelectedProgressSubject] = useState('all');
    
    // Calculate dynamic stats
    const stats = useMemo(() => {
        const totalBlocks = plan?.week?.reduce((sum, day) => sum + (day.blocks?.length || 0), 0) || 0;
        const completedBlocks = userProgress?.completedBlocks ? userProgress.completedBlocks.length : 0;
        const completionRate = totalBlocks > 0 ? (completedBlocks / totalBlocks) * 100 : 0;
        const totalHours = Object.values(plan?.subjectHours || {}).reduce((a, b) => a + b, 0);
        const completedHours = userProgress?.completedHours || 0;
        
        return { totalBlocks, completedBlocks, completionRate, totalHours, completedHours };
    }, [plan, userProgress]);

    // Get all unique subjects
    const allSubjects = useMemo(() => {
        return plan?.subjectBreakdown?.map(s => s.name) || [];
    }, [plan]);

    // Helper to get blocks for a specific subject
    const getSubjectBlocks = (subject = selectedSubject) => {
        if (subject === 'all') {
            return plan?.week?.flatMap(day => day.blocks || []) || [];
        }
        return plan?.week?.flatMap(day => 
            day.blocks?.filter(b => b.subject === subject) || []
        ) || [];
    };

    // Helper to get next 7 days focus for a subject
    const getSubjectNext7DaysFocus = () => {
        if (selectedSubject === 'all') {
            return plan?.next7DaysFocus || [];
        }
        return plan?.next7DaysFocus?.filter(item => 
            item.includes(selectedSubject) || 
            plan?.subjectBreakdown?.some(s => s.name === selectedSubject && item.includes(s.name))
        ) || [];
    };

    // Get current confidence for a subject
    const getCurrentConfidence = (subjectName) => {
        return userProgress?.confidenceUpdates?.[subjectName] || 
               plan?.subjectBreakdown?.find(s => s.name === subjectName)?.currentConfidence || 3;
    };

    // Render based on active view
    const renderContent = () => {
        switch (activeView) {
            case 'schedule':
                return (
                    <div className="h-full">
                        <ScheduleView
                            plan={plan}
                            userProgress={userProgress}
                            onBlockComplete={onBlockComplete}
                            onPlanUpdate={onPlanUpdate}
                            onGeneratePlan={onGeneratePlan}
                            selectedSubject={selectedSubject}
                        />
                    </div>
                );

            case 'chatbot':
                return (
                    <div className="h-full">
                        <Chatbot planData={plan} userProgress={userProgress} />
                    </div>
                );

            case 'progress':
                return (
                    <div className="bg-white rounded-lg shadow-lg p-6 h-full overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4 text-purple-600">📊 Progress Tracker</h2>
                        
                        {/* Overall Progress */}
                        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-semibold">Overall Completion</span>
                                <span className="font-bold text-purple-600">{Math.round(stats.completionRate)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div
                                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-4 rounded-full transition-all"
                                    style={{ width: `${stats.completionRate}%` }}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                                <div className="text-center p-3 bg-white rounded">
                                    <div className="font-bold text-purple-600 text-lg">{stats.completedBlocks}/{stats.totalBlocks}</div>
                                    <div className="text-xs text-gray-600">Blocks</div>
                                </div>
                                <div className="text-center p-3 bg-white rounded">
                                    <div className="font-bold text-blue-600 text-lg">{stats.completedHours}/{stats.totalHours}</div>
                                    <div className="text-xs text-gray-600">Hours</div>
                                </div>
                            </div>
                        </div>

                        {/* Subject Filter */}
                        {allSubjects.length > 1 && (
                            <div className="mb-4 p-3 bg-gray-100 rounded-lg border border-gray-300">
                                <label className="block text-xs font-semibold text-gray-700 mb-2">📌 Filter by Subject:</label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setSelectedProgressSubject('all')}
                                        className={`px-3 py-1 rounded text-sm transition-all font-medium ${
                                            selectedProgressSubject === 'all'
                                                ? 'bg-purple-600 text-white shadow-md'
                                                : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-300'
                                        }`}
                                    >
                                        All Subjects
                                    </button>
                                    {allSubjects.map((subject) => (
                                        <button
                                            key={subject}
                                            onClick={() => setSelectedProgressSubject(subject)}
                                            className={`px-3 py-1 rounded text-sm transition-all font-medium ${
                                                selectedProgressSubject === subject
                                                    ? 'bg-purple-600 text-white shadow-md'
                                                    : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-300'
                                            }`}
                                        >
                                            {subject}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Subject Progress with Confidence */}
                        <div className="mb-6">
                            <h3 className="text-lg font-bold mb-3">📚 Subject Progress & Confidence</h3>
                            <div className="space-y-3">
                                {plan?.subjectBreakdown?.filter(subject => 
                                    selectedProgressSubject === 'all' || subject.name === selectedProgressSubject
                                ).map((subject) => {
                                    const subjectBlocks = plan?.week?.flatMap(day => 
                                        day.blocks?.filter(b => b.subject === subject.name) || []
                                    ) || [];
                                    const completedSubjectBlocks = subjectBlocks.filter(b => 
                                        userProgress?.completedBlocks?.includes(b.id)
                                    ).length;
                                    const subjectRate = subjectBlocks.length > 0 
                                        ? (completedSubjectBlocks / subjectBlocks.length) * 100 
                                        : 0;
                                    
                                    const currentConfidence = getCurrentConfidence(subject.name);
                                    const originalConfidence = subject.confidence || 3;
                                    const confidenceImprovement = currentConfidence - originalConfidence;
                                    
                                    return (
                                        <div key={subject.name} className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <span className="font-semibold text-gray-800">{subject.name}</span>
                                                    <div className="text-xs text-gray-500 mt-1">{subject.credits} Credits</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-bold text-purple-600">{Math.round(subjectRate)}%</div>
                                                    <div className="text-xs text-gray-500">Progress</div>
                                                </div>
                                            </div>
                                            
                                            {/* Progress Bar */}
                                            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                                <div
                                                    className="bg-purple-600 h-2 rounded-full transition-all"
                                                    style={{ width: `${subjectRate}%` }}
                                                />
                                            </div>
                                            
                                            {/* Confidence Checkpoint */}
                                            <div className="flex items-center gap-4 text-xs">
                                                <div className="flex-1">
                                                    <div className="text-gray-600 mb-1">Confidence Level</div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 bg-gray-300 rounded-full h-2">
                                                            <div
                                                                className={`h-2 rounded-full ${
                                                                    currentConfidence >= 4 ? 'bg-green-500' :
                                                                    currentConfidence >= 3 ? 'bg-yellow-500' :
                                                                    'bg-red-500'
                                                                }`}
                                                                style={{ width: `${(currentConfidence / 5) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="font-bold text-gray-700 min-w-[30px]">{currentConfidence}/5</span>
                                                    </div>
                                                </div>
                                                {confidenceImprovement !== 0 && (
                                                    <div className={`font-semibold ${
                                                        confidenceImprovement > 0 ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {confidenceImprovement > 0 ? '+' : ''}{confidenceImprovement.toFixed(1)}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="text-xs text-gray-500 mt-2">
                                                {completedSubjectBlocks}/{subjectBlocks.length} blocks • {subject.cognitiveLoad?.toUpperCase() || 'MEDIUM'} load
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Weekly Confidence Checkpoints */}
                        <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                            <h3 className="font-bold text-blue-800 mb-2">📈 Weekly Confidence Checkpoints</h3>
                            <div className="text-sm text-blue-700 space-y-1">
                                <div>✓ Week 1: Establish baseline understanding</div>
                                <div>✓ Week 2: Deepen weak topic areas</div>
                                <div>✓ Week 3: Practice and strengthen</div>
                                <div>✓ Week 4: Revision and final polish</div>
                            </div>
                        </div>
                    </div>
                );

            case 'summary':
                // Filter subjects based on selection
                const summarySubjects = selectedSubject === 'all' 
                    ? (plan?.subjectBreakdown || [])
                    : (plan?.subjectBreakdown?.filter(s => s.name === selectedSubject) || []);
                
                // Calculate dynamic confidence improvement based on current progress
                const confidenceUpdates = userProgress?.confidenceUpdates || {};
                const avgOriginalConfidence = summarySubjects.length > 0 
                    ? summarySubjects.reduce((sum, s) => sum + (s.currentConfidence || s.confidence || 3), 0) / summarySubjects.length 
                    : 3;
                const avgCurrentConfidence = summarySubjects.length > 0
                    ? summarySubjects.reduce((sum, s) => {
                          const current = confidenceUpdates[s.name] || s.currentConfidence || s.confidence || 3;
                          return sum + current;
                      }, 0) / summarySubjects.length
                    : avgOriginalConfidence;
                const actualConfidenceImprovement = avgCurrentConfidence - avgOriginalConfidence;
                
                // Calculate dynamic workload reduction
                const summaryBlocks = getSubjectBlocks();
                const summaryCompleted = summaryBlocks.filter(b => 
                    userProgress?.completedBlocks?.includes(b.id)
                ).length;
                const summaryCompletionRate = summaryBlocks.length > 0 
                    ? (summaryCompleted / summaryBlocks.length) * 100 
                    : 0;
                const summaryTotalHours = selectedSubject === 'all'
                    ? Object.values(plan?.subjectHours || {}).reduce((a, b) => a + b, 0)
                    : (plan?.subjectBreakdown?.find(s => s.name === selectedSubject)?.allocatedHours || 0);
                const hoursRemaining = summaryTotalHours - stats.completedHours;
                const hoursSaved = stats.completedHours > 0 ? Math.round((stats.completedHours / summaryTotalHours) * 100) : 0;
                
                return (
                    <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-lg shadow-lg p-6 h-full overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">📋 Study Plan Summary</h2>
                            {selectedSubject !== 'all' && (
                                <span className="text-xs bg-white bg-opacity-30 text-white px-3 py-1 rounded-full font-semibold">
                                    {selectedSubject}
                                </span>
                            )}
                        </div>
                        
                        <div className="space-y-4">
                            <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                <div className="text-sm opacity-90 mb-1">Target Completion Date</div>
                                <div className="text-xl font-bold">{plan?.summary?.completionDate || 'Not set'}</div>
                            </div>

                            <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                <div className="text-sm opacity-90 mb-1">{selectedSubject === 'all' ? 'Overall' : selectedSubject} Confidence</div>
                                <div className="text-xl font-bold">
                                    {avgCurrentConfidence.toFixed(1)}/5
                                    {actualConfidenceImprovement > 0 && (
                                        <span className="text-green-300 text-lg ml-2">(+{actualConfidenceImprovement.toFixed(1)})</span>
                                    )}
                                </div>
                                <div className="text-xs opacity-75 mt-1">
                                    Original: {avgOriginalConfidence.toFixed(1)}/5
                                </div>
                            </div>

                            <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                <div className="text-sm opacity-90 mb-1">Expected Confidence Improvement</div>
                                <div className="text-xl font-bold">{plan?.summary?.expectedConfidenceImprovement || 'N/A'}</div>
                            </div>

                            <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                <div className="text-sm opacity-90 mb-1">Last Minute Workload Reduction</div>
                                <div className="text-xl font-bold">{plan?.summary?.lastMinuteWorkloadReduction || 'N/A'}</div>
                            </div>

                            <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                <div className="text-sm opacity-90 mb-1">Total Study Hours</div>
                                <div className="text-xl font-bold">{stats.totalHours} hours</div>
                            </div>

                            <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                <div className="text-sm opacity-90 mb-1">Completed Hours</div>
                                <div className="text-xl font-bold">{stats.completedHours} hours ({hoursSaved}%)</div>
                            </div>

                            <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                <div className="text-sm opacity-90 mb-1">Remaining Hours</div>
                                <div className="text-xl font-bold">{hoursRemaining} hours</div>
                            </div>

                            <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                <div className="text-sm opacity-90 mb-1">Overall Progress</div>
                                <div className="text-xl font-bold">{Math.round(stats.completionRate)}%</div>
                                <div className="w-full bg-white bg-opacity-30 rounded-full h-2 mt-2">
                                    <div
                                        className="bg-white h-2 rounded-full transition-all"
                                        style={{ width: `${stats.completionRate}%` }}
                                    />
                                </div>
                            </div>

                            {plan?.summary?.rationale && (
                                <div className="bg-white bg-opacity-20 rounded-lg p-4 mt-4">
                                    <div className="text-sm opacity-90 mb-2">Plan Rationale</div>
                                    <div className="text-sm italic">{plan.summary.rationale}</div>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'subjects':
                const displayedSubjects = selectedSubject === 'all' 
                    ? plan?.subjectBreakdown 
                    : plan?.subjectBreakdown?.filter(s => s.name === selectedSubject);
                    
                return (
                    <div className="bg-white rounded-lg shadow-lg p-6 h-full overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-purple-600">📚 Subject-wise Breakdown</h2>
                            {selectedSubject !== 'all' && (
                                <span className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full font-semibold">
                                    {selectedSubject}
                                </span>
                            )}
                        </div>
                        
                        <div className="space-y-4">
                            {displayedSubjects?.map((subject) => {
                                const currentConf = getCurrentConfidence(subject.name);
                                const colorClass = subject.cognitiveLoad === 'high' ? 'red' : 
                                                 subject.cognitiveLoad === 'medium' ? 'yellow' : 'green';
                                const subjectBlocks = plan?.week?.flatMap(day => 
                                    day.blocks?.filter(b => b.subject === subject.name) || []
                                ) || [];
                                const completedSubjectBlocks = subjectBlocks.filter(b => 
                                    userProgress?.completedBlocks?.includes(b.id)
                                ).length;
                                const subjectProgress = subjectBlocks.length > 0 
                                    ? (completedSubjectBlocks / subjectBlocks.length) * 100 
                                    : 0;
                                
                                return (
                                    <div key={subject.name} className={`p-4 rounded-lg border-l-4 ${
                                        colorClass === 'red' ? 'border-red-500 bg-red-50' :
                                        colorClass === 'green' ? 'border-green-500 bg-green-50' :
                                        'border-yellow-500 bg-yellow-50'
                                    }`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <div className="font-bold text-lg">{subject.name}</div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {subject.credits} Credits • {subject.allocatedHours} hrs/week
                                                    {subject.percentage > 0 && ` (${subject.percentage}%)`}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`Delete "${subject.name}" from your plan?\n\nThis will remove all ${subjectBlocks.length} blocks and cannot be undone.`)) {
                                                        onDeleteSubject(subject.name);
                                                    }
                                                }}
                                                className="px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600 transition-colors"
                                                title="Delete this subject from your plan"
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>

                                        {/* Progress Section */}
                                        <div className="bg-white bg-opacity-70 p-3 rounded mb-3">
                                            <div className="text-xs font-semibold text-gray-700 mb-2">Progress: {Math.round(subjectProgress)}%</div>
                                            <div className="w-full bg-gray-300 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${
                                                        colorClass === 'red' ? 'bg-red-500' :
                                                        colorClass === 'green' ? 'bg-green-500' :
                                                        'bg-yellow-500'
                                                    }`}
                                                    style={{ width: `${subjectProgress}%` }}
                                                />
                                            </div>
                                            <div className="text-xs text-gray-600 mt-1">{completedSubjectBlocks}/{subjectBlocks.length} blocks completed</div>
                                        </div>

                                        {/* Confidence Section */}
                                        <div className="bg-white bg-opacity-70 p-3 rounded mb-3">
                                            <div className="text-xs font-semibold text-gray-700 mb-2">Current Confidence Level</div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-300 rounded-full h-3">
                                                    <div
                                                        className={`h-3 rounded-full ${
                                                            currentConf >= 4 ? 'bg-green-500' :
                                                            currentConf >= 3 ? 'bg-yellow-500' :
                                                            'bg-red-500'
                                                        }`}
                                                        style={{ width: `${(currentConf / 5) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="font-bold text-lg min-w-[45px]">{currentConf}/5</span>
                                            </div>
                                        </div>
                                        
                                        {subject.justification && (
                                            <div className="text-sm text-gray-700 mt-2 italic bg-white p-2 rounded">
                                                {subject.justification}
                                            </div>
                                        )}
                                        
                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="text-sm">
                                                <span className="text-gray-600">Confidence: </span>
                                                <span className="font-semibold">{currentConf}/5</span>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-xs font-semibold ${
                                                colorClass === 'red' ? 'bg-red-200 text-red-800' :
                                                colorClass === 'green' ? 'bg-green-200 text-green-800' :
                                                'bg-yellow-200 text-yellow-800'
                                            }`}>
                                                {subject.cognitiveLoad?.toUpperCase() || 'MEDIUM'} LOAD
                                            </div>
                                        </div>
                                        
                                        {(subject.weakTopics?.length > 0 || subject.strongTopics?.length > 0) && (
                                            <div className="mt-3 space-y-2">
                                                {subject.weakTopics?.length > 0 && (
                                                    <div>
                                                        <div className="text-xs font-semibold text-red-600 mb-1">Weak Topics:</div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {subject.weakTopics.map((topic, idx) => (
                                                                <span key={idx} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                                                    {topic}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {subject.strongTopics?.length > 0 && (
                                                    <div>
                                                        <div className="text-xs font-semibold text-green-600 mb-1">Strong Topics:</div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {subject.strongTopics.map((topic, idx) => (
                                                                <span key={idx} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                                    {topic}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );

            case 'next7days':
                const filteredNext7Days = getSubjectNext7DaysFocus();
                const next7DaysBlocks = getSubjectBlocks();
                const next7DaysCompleted = next7DaysBlocks.filter(b => 
                    userProgress?.completedBlocks?.includes(b.id)
                ).length;
                
                return (
                    <div className="bg-white rounded-lg shadow-lg p-6 h-full overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-purple-600">🎯 Next 7 Days Focus</h2>
                            {selectedSubject !== 'all' && (
                                <span className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full font-semibold">
                                    {selectedSubject}
                                </span>
                            )}
                        </div>
                        
                        {/* Urgency Banner */}
                        {next7DaysCompleted === 0 && (
                            <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 rounded-lg">
                                <div className="text-red-800 font-bold text-lg flex items-center gap-2">
                                    🚨 ACTION REQUIRED
                                </div>
                                <div className="text-red-700 text-sm mt-2">
                                    {selectedSubject === 'all' 
                                        ? "You haven't started studying yet. Begin with the tasks below immediately!"
                                        : `You haven't started ${selectedSubject} yet. Begin with the tasks below immediately!`
                                    }
                                </div>
                            </div>
                        )}
                        
                        {/* Subject-wise Upcoming Blocks */}
                        {selectedSubject !== 'all' && (
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                                <h3 className="text-sm font-bold text-blue-900 mb-2">📚 {selectedSubject} - Next 7 Days Blocks</h3>
                                <div className="space-y-2">
                                    {next7DaysBlocks.map((block, idx) => {
                                        const isCompleted = userProgress?.completedBlocks?.includes(block.id);
                                        return (
                                            <div key={block.id} className={`text-xs p-2 rounded ${
                                                isCompleted
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-white text-gray-700 border border-blue-200'
                                            }`}>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold">{idx + 1}.</span>
                                                    <span className="font-semibold">{block.time}</span>
                                                    <span className="text-xs px-2 py-0.5 rounded bg-gray-200">{block.type}</span>
                                                    {isCompleted && <span className="text-green-600 font-bold">✓</span>}
                                                </div>
                                                {block.topic && <div className="text-xs text-gray-600 ml-7">{block.topic}</div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        
                        <div className="space-y-3">
                            {filteredNext7Days && filteredNext7Days.length > 0 ? (
                                filteredNext7Days.map((item, idx) => (
                                    <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                                        next7DaysCompleted === 0
                                            ? 'bg-red-50 border-red-400'
                                            : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-500'
                                    }`}>
                                        <div className="flex items-start gap-3">
                                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                                                next7DaysCompleted === 0
                                                    ? 'bg-red-600'
                                                    : 'bg-purple-600'
                                            }`}>
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className={`text-sm font-semibold ${
                                                    next7DaysCompleted === 0
                                                        ? 'text-red-800'
                                                        : 'text-gray-800'
                                                }`}>
                                                    {item}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 py-8">
                                    {selectedSubject === 'all' 
                                        ? 'No focus items available. Generate a study plan first.'
                                        : `No focus items available for ${selectedSubject}. Generate a study plan first.`
                                    }
                                </div>
                            )}
                        </div>

                        {/* Upcoming Deadlines */}
                        {plan?.summary?.completionDate && (
                            <div className={`mt-6 p-4 rounded-lg border-l-4 ${
                                next7DaysCompleted === 0 
                                    ? 'bg-red-50 border-red-500' 
                                    : 'bg-yellow-50 border-yellow-500'
                            }`}>
                                <div className={`text-sm font-semibold mb-1 ${
                                    next7DaysCompleted === 0 
                                        ? 'text-red-800' 
                                        : 'text-yellow-800'
                                }`}>
                                    {next7DaysCompleted === 0 ? '🔴 URGENT - Target Date' : '⏰ Target Date'}
                                </div>
                                <div className={`text-lg font-bold ${
                                    next7DaysCompleted === 0 
                                        ? 'text-red-900' 
                                        : 'text-yellow-900'
                                }`}>
                                    {plan.summary.completionDate}
                                </div>
                                {next7DaysCompleted === 0 && (
                                    <div className="text-xs text-red-700 mt-2">
                                        ⚠️ No progress yet. Start studying immediately!
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Weekly Confidence Targets */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-blue-500">
                            <h3 className="font-bold text-blue-900 mb-3">📈 Confidence Targets This Week</h3>
                            <div className="space-y-2">
                                {plan?.subjectBreakdown?.slice(0, 3).map((subject) => {
                                    const currentConf = getCurrentConfidence(subject.name);
                                    const originalConf = subject.confidence || 3;
                                    const targetConf = Math.min(5, originalConf + 1);
                                    
                                    return (
                                        <div key={subject.name} className="flex items-center justify-between text-sm">
                                            <span className="text-blue-800 font-semibold">{subject.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-blue-600">{currentConf}/5</span>
                                                <span className="text-gray-400">→</span>
                                                <span className="text-blue-800 font-bold">{targetConf}/5</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Adaptive Suggestions */}
                        <div className="mt-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                            <h3 className="font-bold text-green-900 mb-2">💡 AI Recommendations</h3>
                            <ul className="space-y-2 text-sm text-green-800">
                                {stats.completedBlocks > 0 ? (
                                    <>
                                        <li>✓ Keep up the momentum! You've started strong.</li>
                                        <li>✓ Focus on weak topics during high-energy slots.</li>
                                        <li>✓ Review prerequisites before moving to advanced topics.</li>
                                    </>
                                ) : (
                                    <>
                                        <li>🎯 Start with high-priority weak topics.</li>
                                        <li>📚 Dedicate 2-3 hours to foundational concepts.</li>
                                        <li>⏱️ Use your preferred study time (high-energy slots).</li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                );

            case 'confidence':
                return (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500">
                            <div className="text-6xl mb-4">📈</div>
                            <div className="text-xl font-semibold">Use "Confidence Graph" view instead</div>
                            <div className="text-sm text-gray-400 mt-2">Click on "Confidence Graph" in the sidebar to see daily progression</div>
                        </div>
                    </div>
                );

            case 'confidenceGraph':
                return (
                    <div className="w-full h-screen max-h-[calc(100vh-150px)] overflow-hidden">
                        <ConfidenceGraph plan={plan} userProgress={userProgress} />
                    </div>
                );

            case 'links':
                return (
                    <div className="bg-white rounded-lg shadow-lg h-full overflow-hidden flex flex-col">
                        <div className="p-4 border-b bg-purple-600 text-white">
                            <h2 className="text-xl font-bold">🔗 Links & Notes</h2>
                            <p className="text-sm opacity-90">Manage your study resources and notes</p>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <LinksNotes 
                                user={user}
                                userProgress={userProgress}
                                onUpdate={onUpdateProgress}
                            />
                        </div>
                    </div>
                );

            case 'checklist':
                return (
                    <div className="h-full overflow-y-auto">
                        <RequirementsChecklist plan={plan} userProgress={userProgress} />
                    </div>
                );

            case 'export':
                return (
                    <div className="bg-white rounded-lg shadow-lg p-6 h-full overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4 text-purple-600">📥 Export Study Plan</h2>
                        
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-gray-700 mb-4">
                                    Export your study plan and progress data in a readable text format. This includes:
                                </p>
                                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                    <li>Complete 7-day schedule with all study blocks</li>
                                    <li>Subject breakdown and time allocations</li>
                                    <li>Progress tracking (completed blocks and hours)</li>
                                    <li>Next 7 days focus items</li>
                                    <li>Your personal notes and links</li>
                                    <li>Summary and target dates</li>
                                </ul>
                            </div>

                            <button
                                onClick={onExport}
                                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
                            >
                                📥 Download Study Plan (TXT)
                            </button>

                            <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                                <strong>Note:</strong> Your data is automatically saved to your browser's local storage. 
                                This export creates a readable text file (.txt) that you can share, print, or save for reference.
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="bg-white rounded-lg shadow-lg p-6 h-full flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <div className="text-4xl mb-4">📚</div>
                            <div className="text-lg">Select a feature from the sidebar</div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Global Subject Selector - Appears in all views */}
            {allSubjects.length > 1 && activeView !== 'chatbot' && activeView !== 'links' && (
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 border-b-2 border-purple-400 px-6 py-3 sticky top-0 z-10">
                    <label className="block text-xs font-bold text-purple-900 mb-2">📌 VIEW BY SUBJECT:</label>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => {
                                setSelectedSubject('all');
                                setSelectedProgressSubject('all');
                            }}
                            className={`px-3 py-1 rounded text-sm transition-all font-medium ${
                                selectedSubject === 'all'
                                    ? 'bg-purple-600 text-white shadow-lg scale-105'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-purple-300'
                            }`}
                        >
                            All Subjects
                        </button>
                        {allSubjects.map((subject) => (
                            <button
                                key={subject}
                                onClick={() => {
                                    setSelectedSubject(subject);
                                    setSelectedProgressSubject(subject);
                                }}
                                className={`px-3 py-1 rounded text-sm transition-all font-medium ${
                                    selectedSubject === subject
                                        ? 'bg-purple-600 text-white shadow-lg scale-105'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-purple-300'
                                }`}
                            >
                                {subject}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
}

