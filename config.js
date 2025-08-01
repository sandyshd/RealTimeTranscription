// Azure Speech Service Configuration
// Update these values with your Azure Speech Service credentials

// Helper to get environment variable in browser (from window) or Node.js (from process.env)
function getEnvVar(name, fallback) {
    // For debugging: log which environment is being checked
    if (typeof window !== 'undefined') {
        if (window._env_ && window._env_[name]) {
            console.log(`[AzureConfig] Using window._env_['${name}'] for ${name}`);
            return window._env_[name];
        }
    }
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
        console.log(`[AzureConfig] Using process.env['${name}'] for ${name}`);
        return process.env[name];
    }
    console.warn(`[AzureConfig] Using fallback for ${name}`);
    return fallback;
}
// For local browser development, you must inject window._env_ in a <script> tag in index.html before loading config.js, e.g.:
// <script>window._env_ = { AZURE_SPEECH_SUBSCRIPTION_KEY: 'your-key', AZURE_SPEECH_SERVICE_REGION: 'your-region' };</script>

const AzureConfig = {
    // Your Azure Speech Service subscription key
    get speech_service_resource_key() {
        return getEnvVar('AZURE_SPEECH_SUBSCRIPTION_KEY', 'Your Azure Speech Service subscription key');
    },

    // Your Azure region (extracted from endpoint: santechlab.cognitiveservices.azure.com)
    // Common regions: 'eastus', 'westus', 'westus2', 'eastus2', 'centralus', 'northeurope', 'westeurope'
    get speech_service_region() {
        return getEnvVar('AZURE_SPEECH_SERVICE_REGION', 'eastus');
    },
    
    // Default language for speech recognition
    // Common values: 'en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR', 'zh-CN', 'ja-JP'
    language: 'en-US',
    
    // Translation service configuration
    translation: {
        // Azure Translator endpoint (same subscription key can be used)
        endpoint: 'https://api.cognitive.microsofttranslator.com',
        
        // Default target language for translation
        defaultTargetLanguage: 'es',
        
        // Supported languages for translation
        supportedLanguages: {
            'ar': 'العربية',
            'zh': '中文',
            'zh-Hans': '中文 (简体)',
            'zh-Hant': '中文 (繁體)',
            'cs': 'Čeština',
            'da': 'Dansk',
            'nl': 'Nederlands',
            'en': 'English',
            'fi': 'Suomi',
            'fr': 'Français',
            'de': 'Deutsch',
            'el': 'Ελληνικά',
            'hi': 'हिंदी',
            'hu': 'Magyar',
            'it': 'Italiano',
            'ja': '日本語',
            'ko': '한국어',
            'no': 'Norsk',
            'pl': 'Polski',
            'pt': 'Português',
            'pt-br': 'Português (Brasil)',
            'ro': 'Română',
            'ru': 'Русский',
            'es': 'Español',
            'sv': 'Svenska',
            'th': 'ไทย',
            'tr': 'Türkçe',
            'uk': 'Українська',
            'vi': 'Tiếng Việt'
        }
    },
    
    // Speech recognition settings
    settings: {
        // Enable continuous recognition (recommended for real-time transcription)
        continuous: true,
        
        // Request detailed results with word-level timestamps
        requestWordLevelTimestamps: true,
        
        // Enable dictation mode for better handling of punctuation
        enableDictation: true,
        
        // Audio input settings
        audioSettings: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
        }
    }
};

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AzureConfig;
}
