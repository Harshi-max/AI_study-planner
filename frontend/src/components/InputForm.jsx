/**
 * Input Form Component - Collects all required student information
 */

import React, { useState } from 'react';

export default function InputForm({ onSubmit, loading }) {
    const [formData, setFormData] = useState({
        student: {
            name: '',
            college: '',
            branch: '',
            year: 2026,
            email: ''
        },
        subjects: [
            { name: '', credits: 3, strong: [], weak: [], confidence: 3 }
        ],
        availability: {
            weekdays: 3,
            weekends: 6,
            preferredTime: 'Night'
        },
        targetDate: ''
    });

    const addSubject = () => {
        setFormData({
            ...formData,
            subjects: [...formData.subjects, { name: '', credits: 3, strong: [], weak: [], confidence: 3 }]
        });
    };

    const removeSubject = (index) => {
        if (formData.subjects.length > 1) {
            setFormData({
                ...formData,
                subjects: formData.subjects.filter((_, i) => i !== index)
            });
        }
    };

    const updateSubject = (index, field, value) => {
        const updated = [...formData.subjects];
        if (field === 'strong' || field === 'weak') {
            updated[index][field] = value.split(',').map(s => s.trim()).filter(s => s);
        } else {
            updated[index][field] = field === 'credits' || field === 'confidence' ? parseInt(value) || 0 : value;
        }
        setFormData({ ...formData, subjects: updated });
    };

    const updateStudent = (field, value) => {
        setFormData({
            ...formData,
            student: { ...formData.student, [field]: field === 'year' ? parseInt(value) || 2026 : value }
        });
    };

    const updateAvailability = (field, value) => {
        setFormData({
            ...formData,
            availability: { 
                ...formData.availability, 
                [field]: field === 'weekdays' || field === 'weekends' ? parseInt(value) || 0 : value 
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(formData);
        }
    };

    const loadExample = () => {
        setFormData({
            student: {
                name: 'Aman',
                college: 'XYZ Institute of Technology',
                branch: 'Computer Science Engineering',
                year: 2026,
                email: 'aman@example.com'
            },
            subjects: [
                {
                    name: 'Data Structures',
                    credits: 4,
                    strong: ['Arrays', 'Linked Lists'],
                    weak: ['Trees', 'Graphs'],
                    confidence: 3
                },
                {
                    name: 'Operating Systems',
                    credits: 3,
                    strong: ['Processes', 'Threads'],
                    weak: ['Deadlocks', 'Memory Management'],
                    confidence: 2
                },
                {
                    name: 'Engineering Mathematics',
                    credits: 4,
                    strong: ['Differential Equations'],
                    weak: ['Laplace Transform'],
                    confidence: 3
                }
            ],
            availability: {
                weekdays: 3,
                weekends: 6,
                preferredTime: 'Night'
            },
            targetDate: '2026-03-15'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-purple-600 mb-2">📚 AI Study Planner</h1>
                    <p className="text-gray-600">Powered by Camel AI - Personalized Study Schedules for Engineering Students</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Student Information */}
                    <section className="border-b pb-6">
                        <h2 className="text-2xl font-bold mb-4 text-purple-600">Student Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={formData.student.name}
                                    onChange={(e) => updateStudent('name', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">College *</label>
                                <input
                                    type="text"
                                    value={formData.student.college}
                                    onChange={(e) => updateStudent('college', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Branch *</label>
                                <input
                                    type="text"
                                    value={formData.student.branch}
                                    onChange={(e) => updateStudent('branch', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Graduation Year *</label>
                                <input
                                    type="number"
                                    value={formData.student.year}
                                    onChange={(e) => updateStudent('year', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Email ID *</label>
                                <input
                                    type="email"
                                    value={formData.student.email}
                                    onChange={(e) => updateStudent('email', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    {/* Subjects */}
                    <section className="border-b pb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-purple-600">Subjects & Credits</h2>
                            <button
                                type="button"
                                onClick={addSubject}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                + Add Subject
                            </button>
                        </div>
                        <div className="space-y-4">
                            {formData.subjects.map((subject, index) => (
                                <div key={index} className="border-2 border-purple-100 rounded-lg p-4 bg-purple-50">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-semibold text-purple-700">Subject {index + 1}</h3>
                                        {formData.subjects.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeSubject(index)}
                                                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Subject Name *</label>
                                            <input
                                                type="text"
                                                value={subject.name}
                                                onChange={(e) => updateSubject(index, 'name', e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Credits *</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={subject.credits}
                                                onChange={(e) => updateSubject(index, 'credits', e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Strong Areas (comma-separated)</label>
                                            <input
                                                type="text"
                                                value={subject.strong.join(', ')}
                                                onChange={(e) => updateSubject(index, 'strong', e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg"
                                                placeholder="e.g., Arrays, Linked Lists"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Weak Areas (comma-separated) *</label>
                                            <input
                                                type="text"
                                                value={subject.weak.join(', ')}
                                                onChange={(e) => updateSubject(index, 'weak', e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg"
                                                placeholder="e.g., Trees, Graphs"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Self-Rated Confidence Level (1-5) *</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="5"
                                                value={subject.confidence}
                                                onChange={(e) => updateSubject(index, 'confidence', e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg"
                                                required
                                            />
                                            <div className="text-xs text-gray-500 mt-1">
                                                1 = Very Low, 5 = Very High
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Study Time Availability */}
                    <section className="border-b pb-6">
                        <h2 className="text-2xl font-bold mb-4 text-purple-600">Study Time Availability</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Weekdays Hours/Day *</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="12"
                                    value={formData.availability.weekdays}
                                    onChange={(e) => updateAvailability('weekdays', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Weekends Hours/Day *</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="12"
                                    value={formData.availability.weekends}
                                    onChange={(e) => updateAvailability('weekends', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Preferred Study Time *</label>
                                <select
                                    value={formData.availability.preferredTime}
                                    onChange={(e) => updateAvailability('preferredTime', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                >
                                    <option value="Morning">Morning</option>
                                    <option value="Afternoon">Afternoon</option>
                                    <option value="Night">Night</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Target Completion Date */}
                    <section className="pb-6">
                        <h2 className="text-2xl font-bold mb-4 text-purple-600">Target Completion Date</h2>
                        <div>
                            <label className="block text-sm font-medium mb-1">Target Completion Date *</label>
                            <input
                                type="date"
                                value={formData.targetDate}
                                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                                required
                            />
                        </div>
                    </section>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={loadExample}
                            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold"
                        >
                            Load Example
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-bold disabled:opacity-50"
                        >
                            {loading ? 'Generating Plan...' : 'Generate Study Plan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

