require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT;

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Parse allowed origins from environment variable
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:5173'];

// CORS Configuration
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`Blocked CORS request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Chat proxy endpoint
app.post('/api/chat', async (req, res) => {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
        console.error('N8N_WEBHOOK_URL is not configured');
        return res.status(500).json({
            error: 'Server configuration error',
            message: 'Webhook URL is not configured'
        });
    }

    try {
        console.log(`[${new Date().toISOString()}] Received chat request from: ${req.body.user || 'Unknown'}`);

        // Forward request to n8n (no timeout - wait as long as needed)
        const response = await axios.post(webhookUrl, req.body, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log(`[${new Date().toISOString()}] n8n response received successfully`);

        // Return n8n response to frontend
        res.json(response.data);

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error proxying to n8n:`, error.message);

        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            return res.status(504).json({
                error: 'Gateway Timeout',
                message: 'The AI is taking too long to respond. Please try again.'
            });
        }

        if (error.response) {
            // n8n returned an error response
            return res.status(error.response.status).json({
                error: 'Webhook Error',
                message: error.response.data?.message || 'Failed to process request'
            });
        }

        // Network or other error
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to connect to the AI service'
        });
    }
});

// Zipline Upload proxy endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
    const ziplineUrl = process.env.ZIPLINE_URL || 'https://utech-storage.utopiatech.dpdns.org';
    const apiToken = process.env.ZIPLINE_API_TOKEN;

    if (!apiToken) {
        console.error('ZIPLINE_API_TOKEN is not configured');
        return res.status(500).json({ error: 'Server configuration error: missing upload token' });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        console.log(`[${new Date().toISOString()}] Received file upload request: ${req.file.originalname}`);

        const formData = new FormData();
        formData.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        const response = await axios.post(`${ziplineUrl}/api/upload`, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': apiToken,
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
        });

        console.log(`[${new Date().toISOString()}] File uploaded to Zipline successfully`);
        res.json(response.data);

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error proxying to Zipline:`, error.message);

        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }

        return res.status(500).json({
            error: 'Upload Failed',
            message: 'Failed to upload file to the storage server'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 LMS Chat Server running on port ${PORT}`);
    console.log(`📡 Proxying to: ${process.env.N8N_WEBHOOK_URL || 'NOT CONFIGURED'}`);
    console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`);
});
