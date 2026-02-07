/**
 * Main App Component - AI Study Planner
 * Integrates input form and study plan viewer
 */

import React, { useState, useEffect } from 'react';
import InputForm from './components/InputForm';
import MainDashboard from './components/MainDashboard';
import Login from './components/Login';
import Signup from './components/Signup';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function App() {
    const [user, setUser] = useState(null);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showSignup, setShowSignup] = useState(false);

    // Load saved user and plan on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const savedPlan = localStorage.getItem('studyPlan');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error('Error loading user:', e);
            }
        }
        if (savedPlan) {
            try {
                setPlan(JSON.parse(savedPlan));
            } catch (e) {
                console.error('Error loading saved plan:', e);
            }
        }
    }, []);

    const handleGenerate = async (input) => {
        setLoading(true);
        setError(null);
        
        try {
            // Try to call backend API first
            const response = await fetch(`${API_URL}/api/generate-plan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(input)
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                setPlan(result.data);
                if (user) {
                    localStorage.setItem(`studyPlan_${user.id}`, JSON.stringify(result.data));
                    localStorage.setItem(`studyPlanInput_${user.id}`, JSON.stringify(input));
                }
                } else {
                    throw new Error(result.error || 'Failed to generate plan');
                }
            } else {
                // Fallback: use client-side generator if backend is not available
                throw new Error('Backend not available, using fallback');
            }
        } catch (err) {
            // Fallback to client-side generation
            console.warn('Backend unavailable, using client-side generation:', err);
            try {
                // Import and use client-side generator
                const { generateStudyPlan } = await import('./utils/clientGenerator');
                const generatedPlan = await generateStudyPlan(input);
                setPlan(generatedPlan);
                if (user) {
                    localStorage.setItem(`studyPlan_${user.id}`, JSON.stringify(generatedPlan));
                    localStorage.setItem(`studyPlanInput_${user.id}`, JSON.stringify(input));
                }
            } catch (fallbackError) {
                setError(fallbackError.message || 'Failed to generate study plan. Please check your input and try again.');
                console.error('Error generating plan:', fallbackError);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const handleSignup = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setShowSignup(false);
    };

    const handleLogout = () => {
        setUser(null);
        setPlan(null);
        localStorage.removeItem('user');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <div className="text-xl font-semibold text-purple-600">Generating your study plan...</div>
                    <div className="text-gray-600 mt-2">Using Camel AI to optimize your schedule</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
                    <div className="text-red-500 text-2xl mb-4">⚠️ Error</div>
                    <div className="text-gray-700 mb-4">{error}</div>
                    <button
                        onClick={() => { setError(null); setLoading(false); }}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Show login/signup if not authenticated
    if (!user) {
        if (showSignup) {
            return <Signup onSignup={handleSignup} onSwitchToLogin={() => setShowSignup(false)} />;
        }
        return <Login onLogin={handleLogin} onSwitchToSignup={() => setShowSignup(true)} />;
    }

    // Show dashboard if authenticated
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
            {plan ? (
                <MainDashboard user={user} onLogout={handleLogout} planData={plan} />
            ) : (
                <div>
                    <div className="bg-white shadow-md p-4 mb-4">
                        <div className="max-w-7xl mx-auto flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-purple-600">📚 AI Study Planner</h1>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                    <InputForm onSubmit={handleGenerate} loading={loading} />
                </div>
            )}
        </div>
    );
}

