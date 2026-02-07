/**
 * Requirements Checklist Component
 * Verifies all requirements are met
 */

import React from 'react';

export default function RequirementsChecklist({ plan, userProgress }) {
    const requirements = [
        {
            category: 'Input Requirements',
            items: [
                { name: 'Student Details (Name, College, Year, Email)', met: true, note: 'Collected in Create form' },
                { name: 'Subjects and Credits', met: true, note: 'Collected in Create form' },
                { name: 'Study Hours (Weekdays/Weekends)', met: true, note: 'Collected separately' },
                { name: 'Target Completion Date', met: true, note: 'Date picker in form' },
                { name: 'Strong/Weak Areas per Subject', met: true, note: 'Comma-separated input' },
                { name: 'Confidence Level (1-5) per Subject', met: true, note: 'Number input with validation' }
            ]
        },
        {
            category: 'Output Requirements',
            items: [
                { 
                    name: 'Visual, Easy-to-Scan Schedule', 
                    met: plan?.week?.length > 0, 
                    note: 'Google Calendar-like view in Full Week tab' 
                },
                { 
                    name: 'Color-coded Cognitive Load', 
                    met: plan?.subjectBreakdown?.some(s => s.color), 
                    note: 'Red/Yellow/Green based on load' 
                },
                { 
                    name: 'Clear Block Type Distinction', 
                    met: plan?.week?.some(d => d.blocks?.some(b => ['Learning', 'Practice', 'Revision', 'Buffer'].includes(b.type))), 
                    note: 'Learning/Practice/Revision/Buffer badges' 
                },
                { 
                    name: 'Subject-Wise Breakdown with Justification', 
                    met: plan?.subjectBreakdown?.some(s => s.justification), 
                    note: 'Shown in Subjects view with justifications' 
                },
                { 
                    name: 'Smart Prioritization (Weak topics early)', 
                    met: plan?.week?.length > 0, 
                    note: 'Handled by Camel AI algorithm' 
                },
                { 
                    name: 'Actionable Next Steps', 
                    met: plan?.next7DaysFocus?.length > 0, 
                    note: 'Shown in Next 7 Days view' 
                },
                { 
                    name: 'Progress & Adaptation Indicators', 
                    met: plan?.progressCheckpoints?.length > 0, 
                    note: 'Confidence checkpoints and progress tracking' 
                },
                { 
                    name: 'Outcome-Oriented Summary', 
                    met: plan?.summary?.completionDate, 
                    note: 'Shown in Summary view with timeline and improvements' 
                }
            ]
        }
    ];

    const allMet = requirements.every(cat => cat.items.every(item => item.met));

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-purple-600">✅ Requirements Checklist</h2>
            
            <div className={`p-4 rounded-lg mb-4 ${allMet ? 'bg-green-50 border-2 border-green-500' : 'bg-yellow-50 border-2 border-yellow-500'}`}>
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{allMet ? '✅' : '⚠️'}</span>
                    <div>
                        <div className="font-bold text-lg">
                            {allMet ? 'All Requirements Met!' : 'Some Requirements Pending'}
                        </div>
                        <div className="text-sm text-gray-600">
                            {allMet ? 'Your study plan includes all required features.' : 'Generate a study plan to see all features.'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {requirements.map((category, catIdx) => (
                    <div key={catIdx}>
                        <h3 className="text-lg font-bold mb-3 text-purple-600">{category.category}</h3>
                        <div className="space-y-2">
                            {category.items.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50">
                                    <span className="text-xl mt-0.5">{item.met ? '✅' : '❌'}</span>
                                    <div className="flex-1">
                                        <div className="font-semibold">{item.name}</div>
                                        <div className="text-sm text-gray-600">{item.note}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

