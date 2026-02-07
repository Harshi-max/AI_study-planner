/**
 * Calendar View - Google Calendar-like interface for 7-day schedule
 * Clean, editable, and easy to scan
 */

import React, { useState } from 'react';

const TIME_SLOTS = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00', '22:00', '23:00'
];

const TYPE_COLORS = {
    Learning: 'bg-blue-500',
    Practice: 'bg-purple-500',
    Revision: 'bg-orange-500',
    Buffer: 'bg-gray-400'
};

const COGNITIVE_COLORS = {
    Red: 'border-l-4 border-red-500',
    Yellow: 'border-l-4 border-yellow-500',
    Green: 'border-l-4 border-green-500'
};

function CalendarBlock({ block, isCompleted, onComplete, onEdit, onDelete }) {
    const [isHovered, setIsHovered] = useState(false);

    const getColorClass = () => {
        if (isCompleted) return 'bg-gray-100';
        if (block.color === 'Red') return 'bg-red-50';
        if (block.color === 'Green') return 'bg-green-50';
        return 'bg-yellow-50';
    };

    return (
        <div
            className={`relative mb-1 p-2 rounded shadow-sm cursor-pointer transition-all border-l-4 ${
                COGNITIVE_COLORS[block.color] || COGNITIVE_COLORS.Yellow
            } ${getColorClass()} ${isCompleted ? 'opacity-60' : 'hover:shadow-md'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-start justify-between gap-1">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1 flex-wrap">
                        <span className={`text-xs px-1.5 py-0.5 rounded text-white ${TYPE_COLORS[block.type] || 'bg-gray-500'}`}>
                            {block.type === 'Learning' ? '📚' : block.type === 'Practice' ? '✏️' : block.type === 'Revision' ? '🔄' : '⏱️'}
                        </span>
                        <span className="text-xs font-semibold text-gray-700">{block.time}</span>
                        {isCompleted && (
                            <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">✓</span>
                        )}
                    </div>
                    <div className="font-semibold text-sm text-gray-900 truncate">{block.subject}</div>
                    {block.topic && (
                        <div className="text-xs text-gray-600 truncate mt-0.5">{block.topic}</div>
                    )}
                </div>
                {isHovered && (
                    <div className="flex gap-0.5 flex-shrink-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(block);
                            }}
                            className="p-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                            title="Edit"
                        >
                            ✏️
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onComplete(block.id, !isCompleted);
                            }}
                            className={`p-1 rounded text-xs text-white ${
                                isCompleted ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'
                            }`}
                            title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                        >
                            {isCompleted ? '↩' : '✓'}
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(block.id);
                            }}
                            className="p-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                            title="Delete"
                        >
                            ×
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function CalendarDay({ day, blocks, completedBlocks, onBlockComplete, onEdit, onDelete, isToday }) {
    const dayBlocks = blocks || [];
    
    // Group blocks by hour slot
    const blocksBySlot = {};
    dayBlocks.forEach(block => {
        const startTime = block.time.split('-')[0];
        const hour = startTime.split(':')[0];
        const minute = parseInt(startTime.split(':')[1]);
        const slotKey = `${hour}:${minute < 30 ? '00' : '30'}`;
        
        if (!blocksBySlot[slotKey]) {
            blocksBySlot[slotKey] = [];
        }
        blocksBySlot[slotKey].push(block);
    });

    return (
        <div className={`flex flex-col border-r border-gray-200 h-[600px] ${isToday ? 'bg-blue-50' : 'bg-white'}`}>
            {/* Day Header */}
            <div className={`sticky top-0 z-10 p-2 border-b text-center ${isToday ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                <div className="text-xs font-semibold uppercase">{day.day.substring(0, 3)}</div>
                <div className={`text-xl font-bold ${isToday ? 'text-white' : 'text-gray-900'}`}>
                    {new Date(day.date).getDate()}
                </div>
                {isToday && (
                    <div className="text-xs mt-1 bg-white text-blue-600 px-2 py-0.5 rounded-full inline-block font-semibold">
                        Today
                    </div>
                )}
            </div>

            {/* Time Slots - Scrollable */}
            <div className="flex-1 overflow-y-auto" style={{ maxHeight: '550px' }}>
                {TIME_SLOTS.map((timeSlot, idx) => {
                    const hour = timeSlot.split(':')[0];
                    const slotKey = `${timeSlot}`;
                    const hourBlocks = blocksBySlot[slotKey] || blocksBySlot[`${hour}:00`] || [];
                    
                    return (
                        <div key={idx} className="border-b border-gray-100 relative" style={{ minHeight: '60px' }}>
                            <div className="absolute left-1 top-1 text-xs text-gray-400 font-medium">{timeSlot}</div>
                            <div className="pl-12 pt-1 pb-1">
                                {hourBlocks.map((block) => (
                                    <CalendarBlock
                                        key={block.id}
                                        block={block}
                                        isCompleted={completedBlocks?.includes(block.id)}
                                        onComplete={onBlockComplete}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function CalendarView({ plan, userProgress, onBlockComplete, onPlanUpdate, onBlockEdit, onBlockDelete }) {
    const [editingBlock, setEditingBlock] = useState(null);
    const [editForm, setEditForm] = useState({ time: '', subject: '', topic: '', type: 'Learning' });

    const today = new Date().toDateString();

    const handleEdit = (block) => {
        setEditingBlock(block);
        setEditForm({
            time: block.time,
            subject: block.subject,
            topic: block.topic || '',
            type: block.type
        });
    };

    const handleSaveEdit = () => {
        if (editingBlock && onBlockEdit) {
            onBlockEdit(editingBlock.id, editForm);
            setEditingBlock(null);
            setEditForm({ time: '', subject: '', topic: '', type: 'Learning' });
        }
    };

    const handleDelete = (blockId) => {
        if (window.confirm('Are you sure you want to delete this study block?')) {
            if (onBlockDelete) {
                onBlockDelete(blockId);
            }
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">7-Day Study Schedule</h2>
                        <p className="text-sm opacity-90 mt-1">
                            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded"></div>
                            <span>High</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                            <span>Medium</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span>Low</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="overflow-x-auto">
                <div className="flex" style={{ minWidth: '1400px' }}>
                    {plan?.week?.map((day) => {
                        const isToday = new Date(day.date).toDateString() === today;
                        return (
                            <div key={day.day} className="flex-1" style={{ minWidth: '200px', maxWidth: '200px' }}>
                                <CalendarDay
                                    day={day}
                                    blocks={day.blocks || []}
                                    completedBlocks={userProgress?.completedBlocks || []}
                                    onBlockComplete={onBlockComplete}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    isToday={isToday}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Edit Modal */}
            {editingBlock && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">Edit Study Block</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Time</label>
                                <input
                                    type="text"
                                    value={editForm.time}
                                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                                    placeholder="18:00-19:00"
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Subject</label>
                                <input
                                    type="text"
                                    value={editForm.subject}
                                    onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Topic</label>
                                <input
                                    type="text"
                                    value={editForm.topic}
                                    onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })}
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Type</label>
                                <select
                                    value={editForm.type}
                                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                                    className="w-full px-3 py-2 border rounded"
                                >
                                    <option value="Learning">Learning</option>
                                    <option value="Practice">Practice</option>
                                    <option value="Revision">Revision</option>
                                    <option value="Buffer">Buffer</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleSaveEdit}
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={() => {
                                    setEditingBlock(null);
                                    setEditForm({ time: '', subject: '', topic: '', type: 'Learning' });
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

