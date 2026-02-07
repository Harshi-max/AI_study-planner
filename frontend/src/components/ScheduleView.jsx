/**
 * Schedule View - Dashboard view with Today/Create/Completed tabs
 * Uses global selectedSubject from RightPanel for consistent filtering
 */

import React, { useState, useMemo } from 'react';
import CalendarView from './CalendarView';
import CreatePlanForm from './CreatePlanForm';

export default function ScheduleView({ plan, userProgress, onBlockComplete, onPlanUpdate, onGeneratePlan, selectedSubject = 'all' }) {
    const [activeTab, setActiveTab] = useState('today');

    const handleBlockEdit = (blockId, updatedData) => {
        if (!plan || !onPlanUpdate) return;
        
        const updatedPlan = { ...plan };
        updatedPlan.week = updatedPlan.week.map(day => ({
            ...day,
            blocks: day.blocks.map(block => 
                block.id === blockId 
                    ? { ...block, ...updatedData }
                    : block
            )
        }));
        onPlanUpdate(updatedPlan);
    };

    const handleBlockDelete = (blockId) => {
        if (!plan || !onPlanUpdate) return;
        
        const updatedPlan = { ...plan };
        updatedPlan.week = updatedPlan.week.map(day => ({
            ...day,
            blocks: day.blocks.filter(block => block.id !== blockId)
        }));
        onPlanUpdate(updatedPlan);
    };

    const today = new Date().toDateString();
    const todayBlocks = useMemo(() => {
        if (!plan?.week) return [];
        const todayDay = plan.week.find(day => new Date(day.date).toDateString() === today);
        return todayDay?.blocks || [];
    }, [plan, today]);

    const completedBlocks = userProgress?.completedBlocks || [];
    const allBlocks = useMemo(() => {
        if (!plan?.week) return [];
        return plan.week.flatMap(day => day.blocks || []);
    }, [plan]);

    const completedBlocksList = useMemo(() => {
        return allBlocks.filter(block => completedBlocks.includes(block.id));
    }, [allBlocks, completedBlocks]);

    // Get all unique subjects from plan
    const allSubjects = useMemo(() => {
        if (!plan?.subjectBreakdown) return [];
        return plan.subjectBreakdown.map(s => s.name);
    }, [plan]);

    // Filter blocks by selected subject
    const filterBlocksBySubject = (blocks) => {
        if (selectedSubject === 'all') return blocks;
        return blocks.filter(block => block.subject === selectedSubject);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'today':
                const filteredTodayBlocks = filterBlocksBySubject(todayBlocks);
                return (
                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg">
                            <h3 className="text-xl font-bold mb-2">Today's Schedule</h3>
                            <p className="text-sm opacity-90">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>

                        {filteredTodayBlocks.length > 0 ? (
                            <div className="space-y-3">
                                {filteredTodayBlocks.map((block) => {
                                    const isCompleted = completedBlocks.includes(block.id);
                                    return (
                                        <div
                                            key={block.id}
                                            className={`p-4 rounded-lg border-l-4 ${
                                                isCompleted
                                                    ? 'bg-green-50 border-green-500'
                                                    : 'bg-white border-purple-500 shadow-sm'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-bold text-sm">{block.time}</span>
                                                        <span className={`text-xs px-2 py-1 rounded text-white ${
                                                            block.type === 'Learning' ? 'bg-blue-500' :
                                                            block.type === 'Practice' ? 'bg-purple-500' :
                                                            block.type === 'Revision' ? 'bg-orange-500' :
                                                            'bg-gray-400'
                                                        }`}>
                                                            {block.type}
                                                        </span>
                                                        {isCompleted && (
                                                            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">✓ Completed</span>
                                                        )}
                                                    </div>
                                                    <div className="font-semibold">{block.subject}</div>
                                                    {block.topic && (
                                                        <div className="text-sm text-gray-600 mt-1">{block.topic}</div>
                                                    )}
                                                    {block.rationale && (
                                                        <div className="text-xs text-gray-500 italic mt-2">{block.rationale}</div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => onBlockComplete(block.id, !isCompleted)}
                                                    className={`px-3 py-1 rounded text-sm ${
                                                        isCompleted
                                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                    }`}
                                                >
                                                    {isCompleted ? '✓' : '○'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No blocks scheduled for today
                            </div>
                        )}
                    </div>
                );

            case 'create':
                return (
                    <CreatePlanForm onGenerate={onGeneratePlan} />
                );

            case 'completed':
                const filteredCompletedBlocks = filterBlocksBySubject(completedBlocksList);
                return (
                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-lg">
                            <h3 className="text-xl font-bold mb-2">Completed Blocks</h3>
                            <p className="text-sm opacity-90">
                                {filteredCompletedBlocks.length} of {completedBlocksList.length} blocks completed
                            </p>
                        </div>
                        {filteredCompletedBlocks.length > 0 ? (
                            <div className="space-y-3">
                                {filteredCompletedBlocks.map((block) => {
                                    const day = plan.week.find(d => d.blocks.some(b => b.id === block.id));
                                    return (
                                        <div
                                            key={block.id}
                                            className="p-4 rounded-lg bg-green-50 border-l-4 border-green-500"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-bold text-sm">{block.time}</span>
                                                        <span className="text-xs text-gray-600">{day?.day}</span>
                                                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">✓ Completed</span>
                                                    </div>
                                                    <div className="font-semibold">{block.subject}</div>
                                                    {block.topic && (
                                                        <div className="text-sm text-gray-600 mt-1">{block.topic}</div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => onBlockComplete(block.id, false)}
                                                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                                                >
                                                    Undo
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No completed blocks yet. Start studying to see your progress here!
                            </div>
                        )}
                    </div>
                );

            case 'full':
                return (
                    <div className="h-full overflow-hidden">
                        <CalendarView
                            plan={plan}
                            userProgress={userProgress}
                            onBlockComplete={onBlockComplete}
                            onPlanUpdate={onPlanUpdate}
                            onBlockEdit={handleBlockEdit}
                            onBlockDelete={handleBlockDelete}
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg h-full flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b bg-gray-50">
                <button
                    onClick={() => setActiveTab('today')}
                    className={`flex-1 px-4 py-3 font-semibold transition-all ${
                        activeTab === 'today'
                            ? 'bg-purple-600 text-white border-b-2 border-purple-600'
                            : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    📅 Today
                </button>
                <button
                    onClick={() => setActiveTab('create')}
                    className={`flex-1 px-4 py-3 font-semibold transition-all ${
                        activeTab === 'create'
                            ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                            : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    ➕ Create
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`flex-1 px-4 py-3 font-semibold transition-all ${
                        activeTab === 'completed'
                            ? 'bg-green-600 text-white border-b-2 border-green-600'
                            : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    ✓ Completed
                </button>
                <button
                    onClick={() => setActiveTab('full')}
                    className={`flex-1 px-4 py-3 font-semibold transition-all ${
                        activeTab === 'full'
                            ? 'bg-indigo-600 text-white border-b-2 border-indigo-600'
                            : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    📆 Full Week
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {renderContent()}
            </div>
        </div>
    );
}

