/**
 * Dashboard Component - Main dashboard with login/logout and features
 */

import React, { useState, useEffect } from 'react';
import StudyPlanViewer from './StudyPlanViewer';
import Chatbot from './Chatbot';
import ProgressDashboard from './ProgressDashboard';
import AIPanel from './AIPanel';

export default function Dashboard({ user, onLogout, planData }) {
    const [activeTab, setActiveTab] = useState('schedule');
    const [plan, setPlan] = useState(planData);

    useEffect(() => {
        const savedPlan = localStorage.getItem('studyPlan');
        if (savedPlan) {
            try {
                setPlan(JSON.parse(savedPlan));
            } catch (e) {
                console.error('Error loading plan:', e);
            }
        }
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
            {/* Header */}
            <div className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-purple-600">📚 AI Study Planner Dashboard</h1>
                        <p className="text-sm text-gray-600">Welcome, {user?.name || 'Student'}!</p>
                    </div>
                    <button
                        onClick={onLogout}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex space-x-2 border-b">
                    {[
                        { id: 'schedule', label: '📅 Schedule', icon: '📅' },
                        { id: 'progress', label: '📊 Progress', icon: '📊' },
                        { id: 'ai', label: '🤖 AI Recommendations', icon: '🤖' },
                        { id: 'chat', label: '💬 Chatbot', icon: '💬' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                                activeTab === tab.id
                                    ? 'border-purple-600 text-purple-600'
                                    : 'border-transparent text-gray-600 hover:text-purple-600'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-4 pb-8">
                {activeTab === 'schedule' && plan && (
                    <StudyPlanViewer planData={plan} />
                )}
                {activeTab === 'schedule' && !plan && (
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                        <div className="text-2xl font-bold mb-4">No Study Plan Available</div>
                        <div className="text-gray-600">Please generate a study plan first.</div>
                    </div>
                )}
                {activeTab === 'progress' && (
                    <ProgressDashboard planData={plan} />
                )}
                {activeTab === 'ai' && (
                    <AIPanel planData={plan} />
                )}
                {activeTab === 'chat' && (
                    <Chatbot planData={plan} />
                )}
            </div>
        </div>
    );
}

