// Azure Static Web Apps/Azure Functions/Express compatible API endpoint for secure config
// Place this file at /api/config.js (for Azure Functions) or as an Express route

// For Azure Functions (V3+):
module.exports = async function (context, req) {
    context.res = {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
        body: {
            speechKey: process.env.AZURE_SPEECH_SUBSCRIPTION_KEY || '',
            speechRegion: process.env.AZURE_SPEECH_SERVICE_REGION || '',
            language: process.env.AZURE_SPEECH_LANGUAGE || 'en-US',
            defaultTargetLanguage: process.env.DEFAULT_TARGET_LANGUAGE || 'es'
        }
    };
};

// For Express.js, use this instead:
// const express = require('express');
// const router = express.Router();
// router.get('/api/config', (req, res) => {
//   res.json({
//     speechKey: process.env.AZURE_SPEECH_SUBSCRIPTION_KEY || '',
//     speechRegion: process.env.AZURE_SPEECH_SERVICE_REGION || '',
//     language: process.env.AZURE_SPEECH_LANGUAGE || 'en-US',
//     defaultTargetLanguage: process.env.DEFAULT_TARGET_LANGUAGE || 'es'
//   });
// });
// module.exports = router;
