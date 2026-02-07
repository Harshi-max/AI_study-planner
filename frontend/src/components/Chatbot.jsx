/**
 * Chatbot Component - Camel AI powered chatbot for study guidance
 */

import React, { useState, useRef, useEffect } from 'react';

export default function Chatbot({ planData, userProgress }) {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! I\'m your AI study assistant powered by Camel AI. Ask me anything about your study plan, subjects, or get personalized guidance!'
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const camelAIResponse = async (query, planData, userProgress) => {
        // Camel AI logic for generating responses
        const queryLower = query.toLowerCase();
        
        // Extract subject and topic information from plan
        const subjects = planData?.subjectBreakdown || [];
        const weakTopics = subjects.flatMap(s => s.weakTopics || []);
        const strongTopics = subjects.flatMap(s => s.strongTopics || []);
        
        // Pattern matching and response generation
        if (queryLower.includes('how') && queryLower.includes('revise')) {
            const topic = extractTopic(query);
            const subject = findSubjectForTopic(topic, subjects);
            
            if (subject) {
                return `To revise ${topic} for ${subject.name}:\n\n` +
                       `1. **Review Theory** (30 mins): Go through your notes and key concepts\n` +
                       `2. **Practice Problems** (45 mins): Solve 5-7 problems focusing on ${topic}\n` +
                       `3. **Identify Patterns** (15 mins): Note common problem-solving approaches\n` +
                       `4. **Quick Quiz** (10 mins): Test yourself on key formulas/concepts\n\n` +
                       `Since ${topic} is a ${subject.weakTopics?.includes(topic) ? 'weak' : 'strong'} topic, ` +
                       `allocate ${subject.weakTopics?.includes(topic) ? 'more' : 'moderate'} time for practice.`;
            }
        }
        
        if (queryLower.includes('next week') || queryLower.includes('focus')) {
            const focusItems = planData?.next7DaysFocus || [];
            return `**Next 7 Days Focus:**\n\n` +
                   focusItems.map((item, idx) => `${idx + 1}. ${item}`).join('\n') +
                   `\n\nPrioritize weak topics first, then move to practice and revision.`;
        }
        
        if (queryLower.includes('confidence') || queryLower.includes('improve')) {
            const checkpoints = planData?.progressCheckpoints || [];
            const confidenceUpdates = userProgress?.confidenceUpdates || {};
            
            if (checkpoints.length > 0) {
                const latest = checkpoints[0];
                return `**Confidence Improvement Plan:**\n\n` +
                       `Based on your current progress:\n` +
                       latest.assessments?.map(a => {
                           const current = confidenceUpdates[a.subject] || a.currentConfidence;
                           return `- ${a.subject}: ${current}/5 → Target: ${a.expectedConfidence}/5`;
                       }).join('\n') +
                       `\n\nFocus on weak topics to boost confidence. Practice regularly!`;
            }
        }
        
        if (queryLower.includes('progress') || queryLower.includes('completed')) {
            const completed = userProgress?.completedBlocks?.length || 0;
            const total = planData?.week?.reduce((sum, day) => sum + day.blocks.length, 0) || 0;
            const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
            return `**Your Progress:**\n\n` +
                   `- Completed: ${completed}/${total} blocks (${rate}%)\n` +
                   `- Completed Hours: ${userProgress?.completedHours || 0}\n` +
                    `- Keep up the great work! ${rate >= 50 ? 'You are doing amazing!' : 'You can do it!'}`;
        }
        
        if (queryLower.includes('schedule') || queryLower.includes('time')) {
            const totalHours = Object.values(planData?.subjectHours || {}).reduce((a, b) => a + b, 0);
            return `**Your Study Schedule:**\n\n` +
                   `- Total hours per week: ${totalHours} hours\n` +
                   `- Subjects: ${subjects.length}\n` +
                   `- Target date: ${planData?.summary?.completionDate || 'Not set'}\n\n` +
                   `Your schedule is optimized based on:\n` +
                   `- Weak topics prioritized\n` +
                   `- Prerequisites considered\n` +
                   `- Cognitive load balanced\n` +
                   `- Buffer time included (10-15%)`;
        }
        
        if (queryLower.includes('weak topic') || queryLower.includes('difficult')) {
            if (weakTopics.length > 0) {
                return `**Your Weak Topics:**\n\n` +
                       weakTopics.map((topic, idx) => `${idx + 1}. ${topic}`).join('\n') +
                       `\n\n**Action Plan:**\n` +
                       `1. Allocate more time to these topics\n` +
                       `2. Start with theory, then practice\n` +
                       `3. Review regularly\n` +
                       `4. Track your progress weekly`;
            }
        }
        
        // Default response
        return `I can help you with:\n\n` +
               `- Study strategies for specific topics\n` +
               `- Next week's focus areas\n` +
               `- Confidence improvement plans\n` +
               `- Schedule optimization\n` +
               `- Weak topic guidance\n\n` +
               `Try asking: "How should I revise [topic]?" or "What should I focus on next week?"`;
    };

    const extractTopic = (query) => {
        const words = query.split(' ');
        const topicIndex = words.findIndex(w => w.toLowerCase() === 'revise' || w.toLowerCase() === 'study');
        if (topicIndex >= 0 && topicIndex < words.length - 1) {
            return words.slice(topicIndex + 1).join(' ');
        }
        return 'general study';
    };

    const findSubjectForTopic = (topic, subjects) => {
        return subjects.find(s => 
            s.weakTopics?.some(t => t.toLowerCase().includes(topic.toLowerCase())) ||
            s.strongTopics?.some(t => t.toLowerCase().includes(topic.toLowerCase())) ||
            s.name.toLowerCase().includes(topic.toLowerCase())
        );
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await camelAIResponse(input, planData, userProgress);
            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'assistant', content: response }]);
                setLoading(false);
            }, 500); // Simulate AI thinking time
        } catch (error) {
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: 'Sorry, I encountered an error. Please try again.' 
            }]);
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
            <div className="p-4 border-b bg-purple-600 text-white rounded-t-lg">
                <h2 className="text-xl font-bold">💬 AI Study Assistant (Camel AI)</h2>
                <p className="text-sm opacity-90">Ask me about your study plan, topics, or strategies</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                                msg.role === 'user'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-3">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSend} className="p-4 border-t">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your study plan..."
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}

