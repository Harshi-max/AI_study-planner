/**
 * Main Dashboard - Navigation-based Layout
 * Left: Sidebar Navigation
 * Center: 7-Day Schedule with Drag & Drop
 * Right: Dynamic Content Panel (shows selected feature)
 * 
 * DYNAMIC SUBJECT TRACKING:
 * - Any subject added to the plan is automatically tracked
 * - Progress stored per subject in localStorage as: progress_{userId}.confidenceUpdates[subjectName]
 * - Works with DBMS, Physics, Chemistry, Math, DSA, OS, or any subject
 * - Each subject's confidence is independently stored and updated
 * - Check browser console for verification: "📚 Subjects Being Tracked: [...]"
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import RightPanel from './RightPanel';

export default function MainDashboard({ user, onLogout, planData }) {
    const [plan, setPlan] = useState(planData);
    const [userProgress, setUserProgress] = useState(null);
    const [activeView, setActiveView] = useState('schedule'); // Default view
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load user-specific progress
        const savedPlan = localStorage.getItem(`studyPlan_${user.id}`);
        const savedProgress = localStorage.getItem(`progress_${user.id}`);
        
        if (savedPlan) {
            try {
                setPlan(JSON.parse(savedPlan));
            } catch (e) {
                console.error('Error loading plan:', e);
            }
        } else if (planData) {
            setPlan(planData);
            localStorage.setItem(`studyPlan_${user.id}`, JSON.stringify(planData));
        }
        
        if (savedProgress) {
            try {
                setUserProgress(JSON.parse(savedProgress));
            } catch (e) {
                console.error('Error loading progress:', e);
            }
        } else {
            // Initialize progress
            setUserProgress({
                completedBlocks: [],
                completedHours: 0,
                confidenceUpdates: {},
                notes: [],
                links: []
            });
        }
    }, [user.id, planData]);

    const updateProgress = (updates) => {
        const newProgress = { ...userProgress, ...updates };
        setUserProgress(newProgress);
        localStorage.setItem(`progress_${user.id}`, JSON.stringify(newProgress));
        
        // Log comprehensive tracking information
        if (updates.confidenceUpdates) {
            console.group('📊 Dynamic Subject Tracking Update');
            console.log('✅ Subjects Being Tracked:', Object.keys(updates.confidenceUpdates));
            console.log('📈 Confidence Levels:', updates.confidenceUpdates);
            console.log('💾 Saved to localStorage as key:', `progress_${user.id}`);
            console.log('🔒 Full Progress Object:', newProgress);
            console.groupEnd();
        }
    };

    const handleBlockComplete = (blockId, isCompleted) => {
        const completedBlocks = userProgress.completedBlocks || [];
        let updatedBlocks;
        
        if (isCompleted) {
            updatedBlocks = [...completedBlocks, blockId];
        } else {
            updatedBlocks = completedBlocks.filter(id => id !== blockId);
        }
        
        // Calculate completed hours
        const totalBlocks = plan?.week?.reduce((sum, day) => sum + day.blocks.length, 0) || 0;
        const completedHours = Math.round((updatedBlocks.length / totalBlocks) * (Object.values(plan?.subjectHours || {}).reduce((a, b) => a + b, 0) || 0));
        
        updateProgress({
            completedBlocks: updatedBlocks,
            completedHours
        });
    };

    const handlePlanUpdate = (updatedPlan) => {
        setPlan(updatedPlan);
        localStorage.setItem(`studyPlan_${user.id}`, JSON.stringify(updatedPlan));
    };

    const handleConfidenceUpdate = (subject, newConfidence) => {
        const confidenceUpdates = { ...userProgress.confidenceUpdates, [subject]: newConfidence };
        updateProgress({ confidenceUpdates });
        
        // Log for debugging - shows dynamic subject tracking
        console.log(`✅ Confidence Updated: ${subject} → ${newConfidence}/5`);
        console.log(`📊 Full Confidence Map:`, confidenceUpdates);
        console.log(`📚 All Subjects Tracked: [${Object.keys(confidenceUpdates).join(', ')}]`);
        
        // Trigger schedule re-evaluation if confidence improved significantly
        if (plan) {
            const updatedPlan = { ...plan };
            if (updatedPlan.subjectBreakdown) {
                const subjectIndex = updatedPlan.subjectBreakdown.findIndex(s => s.name === subject);
                if (subjectIndex !== -1) {
                    updatedPlan.subjectBreakdown[subjectIndex].currentConfidence = newConfidence;
                    setPlan(updatedPlan);
                    localStorage.setItem(`studyPlan_${user.id}`, JSON.stringify(updatedPlan));
                }
            }
        }
    };

    const handleGeneratePlan = async (input) => {
        setLoading(true);
        try {
            // Try backend first
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
            try {
                const response = await fetch(`${API_URL}/api/generate-plan`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(input)
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        const mergedPlan = mergePlanSubjects(plan, result.data);
                        setPlan(mergedPlan);
                        localStorage.setItem(`studyPlan_${user.id}`, JSON.stringify(mergedPlan));
                        localStorage.setItem(`studyPlanInput_${user.id}`, JSON.stringify(input));
                        setActiveView('schedule');
                        setLoading(false);
                        alert('✅ Study plan created! New subjects added to your existing plan.');
                        return;
                    }
                }
            } catch (err) {
                console.warn('Backend unavailable, using client-side generation');
            }

            // Fallback to client-side
            const { generateStudyPlan } = await import('../utils/clientGenerator');
            const generatedPlan = await generateStudyPlan(input);
            
            // Merge with existing plan
            const mergedPlan = mergePlanSubjects(plan, generatedPlan);
            setPlan(mergedPlan);
            localStorage.setItem(`studyPlan_${user.id}`, JSON.stringify(mergedPlan));
            localStorage.setItem(`studyPlanInput_${user.id}`, JSON.stringify(input));
            
            // Initialize/Update confidence tracking for all subjects
            if (mergedPlan?.subjectBreakdown) {
                const currentConfidence = userProgress?.confidenceUpdates || {};
                const updatedConfidenceUpdates = { ...currentConfidence };
                
                // Add any new subjects to confidence tracking
                mergedPlan.subjectBreakdown.forEach(subject => {
                    if (!updatedConfidenceUpdates.hasOwnProperty(subject.name)) {
                        updatedConfidenceUpdates[subject.name] = subject.confidence || 3;
                    }
                });
                
                const updatedProgress = {
                    ...userProgress,
                    confidenceUpdates: updatedConfidenceUpdates
                };
                setUserProgress(updatedProgress);
                localStorage.setItem(`progress_${user.id}`, JSON.stringify(updatedProgress));
                
                console.log('📚 All Subjects Now Tracked:', mergedPlan.subjectBreakdown.map(s => s.name));
                console.log('💾 Confidence Updates:', Object.keys(updatedConfidenceUpdates));
                console.log('✅ New subjects ADDED to existing plan (not replaced)');
            }
            
            setActiveView('schedule');
            alert('✅ Study plan created! New subjects added to your existing plan.');

        } catch (error) {
            console.error('Error generating plan:', error);
            alert('❌ Failed to generate study plan. Please check your input and try again.');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to merge new plan subjects into existing plan
    const mergePlanSubjects = (existingPlan, newPlan) => {
        // If no existing plan, return new plan as is
        if (!existingPlan || !existingPlan.subjectBreakdown || existingPlan.subjectBreakdown.length === 0) {
            return newPlan;
        }

        // Merge subject breakdowns (avoid duplicates)
        const existingSubjectNames = new Set(existingPlan.subjectBreakdown.map(s => s.name));
        const newSubjects = newPlan.subjectBreakdown.filter(s => !existingSubjectNames.has(s.name));
        const mergedSubjectBreakdown = [...existingPlan.subjectBreakdown, ...newSubjects];

        // Merge blocks from new plan (add new subject blocks to existing schedule)
        const mergedWeek = existingPlan.week.map((dayData, idx) => {
            const newDayBlocks = newPlan.week?.[idx]?.blocks || [];
            const existingDayBlocks = dayData.blocks || [];
            
            // Only add blocks from new subjects
            const blocksToAdd = newDayBlocks.filter(newBlock => 
                !existingSubjectNames.has(newBlock.subject)
            );
            
            return {
                ...dayData,
                blocks: [...existingDayBlocks, ...blocksToAdd]
            };
        });

        // Merge subject hours
        const mergedSubjectHours = {
            ...existingPlan.subjectHours,
            ...newPlan.subjectHours
        };

        // Return merged plan
        return {
            ...existingPlan,
            subjectBreakdown: mergedSubjectBreakdown,
            week: mergedWeek,
            subjectHours: mergedSubjectHours,
            summary: {
                ...existingPlan.summary,
                ...newPlan.summary
            }
        };
    };

    const handleExport = () => {
        // Generate readable text format
        let exportText = `AI STUDY PLAN - ${user.name}\n`;
        exportText += `Generated: ${new Date().toLocaleDateString()}\n`;
        exportText += `=${'='.repeat(50)}\n\n`;

        // Summary
        if (plan?.summary) {
            exportText += `SUMMARY\n`;
            exportText += `${'-'.repeat(50)}\n`;
            exportText += `Target Completion: ${plan.summary.completionDate || 'Not set'}\n`;
            exportText += `Expected Confidence Improvement: ${plan.summary.expectedConfidenceImprovement || 'N/A'}\n`;
            exportText += `Workload Reduction: ${plan.summary.lastMinuteWorkloadReduction || 'N/A'}\n`;
            if (plan.summary.rationale) {
                exportText += `Rationale: ${plan.summary.rationale}\n`;
            }
            exportText += `\n`;
        }

        // Subject Breakdown
        if (plan?.subjectBreakdown) {
            exportText += `SUBJECT BREAKDOWN\n`;
            exportText += `${'-'.repeat(50)}\n`;
            plan.subjectBreakdown.forEach((subject, idx) => {
                exportText += `${idx + 1}. ${subject.name}\n`;
                exportText += `   Credits: ${subject.credits}\n`;
                exportText += `   Allocated Hours: ${subject.allocatedHours} hrs/week\n`;
                exportText += `   Percentage: ${subject.percentage || 0}%\n`;
                exportText += `   Cognitive Load: ${subject.cognitiveLoad || 'Medium'}\n`;
                if (subject.justification) {
                    exportText += `   Justification: ${subject.justification}\n`;
                }
                exportText += `\n`;
            });
        }

        // 7-Day Schedule
        if (plan?.week) {
            exportText += `7-DAY STUDY SCHEDULE\n`;
            exportText += `${'-'.repeat(50)}\n`;
            plan.week.forEach((day) => {
                exportText += `\n${day.day} - ${new Date(day.date).toLocaleDateString()}\n`;
                if (day.blocks && day.blocks.length > 0) {
                    day.blocks.forEach((block) => {
                        const isCompleted = userProgress?.completedBlocks?.includes(block.id) ? ' [✓]' : '';
                        exportText += `  ${block.time} - ${block.subject}${isCompleted}\n`;
                        if (block.topic) {
                            exportText += `    Topic: ${block.topic}\n`;
                        }
                        exportText += `    Type: ${block.type}\n`;
                        if (block.rationale) {
                            exportText += `    Note: ${block.rationale}\n`;
                        }
                        exportText += `\n`;
                    });
                } else {
                    exportText += `  No blocks scheduled\n`;
                }
            });
        }

        // Progress
        const totalBlocks = plan?.week?.reduce((sum, day) => sum + (day.blocks?.length || 0), 0) || 0;
        const completedBlocks = userProgress?.completedBlocks?.length || 0;
        const completionRate = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;

        exportText += `\nPROGRESS TRACKER\n`;
        exportText += `${'-'.repeat(50)}\n`;
        exportText += `Completed Blocks: ${completedBlocks}/${totalBlocks} (${completionRate}%)\n`;
        exportText += `Completed Hours: ${userProgress?.completedHours || 0}\n`;
        exportText += `\n`;

        // Next 7 Days Focus
        if (plan?.next7DaysFocus && plan.next7DaysFocus.length > 0) {
            exportText += `NEXT 7 DAYS FOCUS\n`;
            exportText += `${'-'.repeat(50)}\n`;
            plan.next7DaysFocus.forEach((item, idx) => {
                exportText += `${idx + 1}. ${item}\n`;
            });
            exportText += `\n`;
        }

        // Notes
        if (userProgress?.notes && userProgress.notes.length > 0) {
            exportText += `NOTES\n`;
            exportText += `${'-'.repeat(50)}\n`;
            userProgress.notes.forEach((note, idx) => {
                exportText += `${idx + 1}. ${note.text}\n`;
            });
            exportText += `\n`;
        }

        // Links
        if (userProgress?.links && userProgress.links.length > 0) {
            exportText += `LINKS\n`;
            exportText += `${'-'.repeat(50)}\n`;
            userProgress.links.forEach((link, idx) => {
                exportText += `${idx + 1}. ${link.title}\n`;
                exportText += `   ${link.url}\n`;
            });
        }

        // Create and download file
        const dataBlob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Study-Plan-${user.name}-${Date.now()}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleDeleteSubject = (subjectName) => {
        if (!plan) return;

        // Remove subject from subjectBreakdown
        const updatedSubjects = plan.subjectBreakdown.filter(s => s.name !== subjectName);

        // Remove blocks for this subject from all days
        const updatedWeek = plan.week.map(day => ({
            ...day,
            blocks: day.blocks.filter(block => block.subject !== subjectName)
        }));

        // Remove subject hours
        const updatedSubjectHours = { ...plan.subjectHours };
        delete updatedSubjectHours[subjectName];

        // Create updated plan
        const updatedPlan = {
            ...plan,
            subjectBreakdown: updatedSubjects,
            week: updatedWeek,
            subjectHours: updatedSubjectHours
        };

        // Remove subject from progress/confidence tracking
        const updatedConfidenceUpdates = { ...userProgress.confidenceUpdates };
        delete updatedConfidenceUpdates[subjectName];
        const updatedProgress = {
            ...userProgress,
            confidenceUpdates: updatedConfidenceUpdates,
            // Remove any blocks for this subject from completedBlocks
            completedBlocks: (userProgress.completedBlocks || []).filter(blockId => {
                const block = plan.week.flatMap(d => d.blocks).find(b => b.id === blockId);
                return block && block.subject !== subjectName;
            })
        };

        // Update state and storage
        setPlan(updatedPlan);
        setUserProgress(updatedProgress);
        localStorage.setItem(`studyPlan_${user.id}`, JSON.stringify(updatedPlan));
        localStorage.setItem(`progress_${user.id}`, JSON.stringify(updatedProgress));

        console.log(`🗑️ Deleted Subject: ${subjectName}`);
        console.log(`📚 Remaining Subjects:`, updatedSubjects.map(s => s.name));
        alert(`✅ "${subjectName}" has been deleted from your study plan!`);
    };

    if (!plan) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="text-2xl font-bold mb-4">No Study Plan Available</div>
                    <div className="text-gray-600">Please generate a study plan first.</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex">
                {/* Left Sidebar Navigation */}
                <Sidebar 
                    activeView={activeView}
                    onViewChange={setActiveView}
                    user={user}
                />

                {/* Main Content Area */}
                <div className="flex-1 ml-64 flex flex-col">
                    {/* Header */}
                    <div className="bg-white shadow-md sticky top-0 z-10">
                        <div className="px-6 py-4 flex justify-between items-center gap-4">
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl font-bold text-purple-600 truncate">📚 AI Study Planner</h1>
                                <p className="text-sm text-gray-600">Welcome, {user.name}!</p>
                            </div>
                            <button
                                onClick={onLogout}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex-shrink-0"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Content Area - Full Width */}
                    <div className="flex-1 p-6">
                        <RightPanel
                            activeView={activeView}
                            plan={plan}
                            userProgress={userProgress}
                            user={user}
                            onConfidenceUpdate={handleConfidenceUpdate}
                            onUpdateProgress={updateProgress}
                            onExport={handleExport}
                            onBlockComplete={handleBlockComplete}
                            onPlanUpdate={handlePlanUpdate}
                            onGeneratePlan={handleGeneratePlan}
                            onDeleteSubject={handleDeleteSubject}
                        />
                    </div>
                </div>
            </div>
    );
}

