/**
 * Express API Server for Study Planner
 */

const express = require('express');
const cors = require('cors');
const { generateStudyPlan } = require('./studyPlanService');

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'AI Study Planner API',
        ai: 'Camel AI (No external API required)',
        version: '2.0'
    });
});

// Generate study plan
app.post('/api/generate-plan', async (req, res) => {
    try {
        const input = req.body;
        const plan = await generateStudyPlan(input);
        
        res.json({
            success: true,
            data: plan
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Get prerequisites info
app.get('/api/prerequisites', (req, res) => {
    const { camelAI } = require('./studyPlanGenerator');
    res.json({
        success: true,
        prerequisites: camelAI.prerequisiteMap
    });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 AI Study Planner API running on http://localhost:${PORT}`);
    console.log(`📚 Using Camel AI - No external API required`);
    console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
    console.log(`📝 Generate plan: POST http://localhost:${PORT}/api/generate-plan`);
});

module.exports = app;

