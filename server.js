const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8000;

// Security middleware for production
app.use((req, res, next) => {
    // Force HTTPS in production
    if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
        res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
        next();
    }
});

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});

// Enable compression
app.use(require('compression')());

// Serve static files with cache headers
app.use(express.static('.', {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API endpoint to serve configuration (for environment-based config)
app.get('/api/config', (req, res) => {
    const config = {
        subscriptionKey: process.env.AZURE_SUBSCRIPTION_KEY || 'YOUR_KEY_HERE',
        serviceRegion: process.env.AZURE_REGION || 'eastus',
        language: process.env.DEFAULT_LANGUAGE || 'en-US'
    };
    res.json(config);
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        timestamp: new Date().toISOString()
    });
});

app.listen(port, () => {
    console.log(`Real-time Transcription Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
