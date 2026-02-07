/**
 * Sidebar Navigation Component
 * Left panel with navigation items
 */

import React from 'react';

const NAV_ITEMS = [
    { id: 'schedule', label: '📅 Schedule', icon: '📅' },
    { id: 'chatbot', label: '💬 Chatbot', icon: '💬' },
    { id: 'progress', label: '📊 Progress', icon: '📊' },
    { id: 'summary', label: '📋 Summary', icon: '📋' },
    { id: 'subjects', label: '📚 Subjects', icon: '📚' },
    { id: 'next7days', label: '🎯 Next 7 Days', icon: '🎯' },
    { id: 'confidenceGraph', label: '📈 Confidence Graph', icon: '📈' },
    { id: 'links', label: '🔗 Links & Notes', icon: '🔗' },
    { id: 'export', label: '📥 Export', icon: '📥' }
];

export default function Sidebar({ activeView, onViewChange, user }) {
    return (
        <div className="w-64 bg-gradient-to-b from-purple-600 to-blue-600 text-white h-screen fixed left-0 top-0 shadow-2xl overflow-y-auto">
            {/* User Info */}
            <div className="p-6 border-b border-white border-opacity-20">
                <div className="text-2xl font-bold mb-1">📚 Study Planner</div>
                <div className="text-sm opacity-90">Welcome, {user?.name || 'Student'}!</div>
            </div>

            {/* Navigation Items */}
            <nav className="p-4 space-y-2">
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                            activeView === item.id
                                ? 'bg-white text-purple-600 shadow-lg transform scale-105'
                                : 'hover:bg-white hover:bg-opacity-20 text-white'
                        }`}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-semibold">{item.label.replace(/^\S+\s/, '')}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}

