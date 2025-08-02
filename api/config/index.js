// Azure Functions entry point for /api/config endpoint
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
