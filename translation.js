// Azure Translation Service Module
class TranslationService {
    constructor(subscriptionKey, region) {
        this.subscriptionKey = subscriptionKey;
        this.region = region;
        this.endpoint = AzureConfig.translation.endpoint;
        this.isEnabled = false;
        this.targetLanguage = null;
        this.translationQueue = [];
        this.isProcessing = false;
    }
    
    // Initialize translation service
    async initialize(targetLanguage) {
        this.targetLanguage = targetLanguage;
        this.isEnabled = !!targetLanguage;
        return this.isEnabled;
    }
    
    // Set target language
    setTargetLanguage(languageCode) {
        this.targetLanguage = languageCode;
        this.isEnabled = !!languageCode;
    }
    
    // Get supported languages
    getSupportedLanguages() {
        return AzureConfig.translation.supportedLanguages;
    }
    
    // Translate text with caching and batching for better performance
    async translateText(text, sourceLanguage = 'en') {
        if (!this.isEnabled || !text.trim()) {
            return null;
        }
        
        try {
            // Detect source language from speech recognition language
            const sourceLang = this.extractLanguageCode(sourceLanguage);
            
            // Skip translation if source and target are the same
            if (sourceLang === this.targetLanguage) {
                return text;
            }
            
            const response = await this.callTranslationAPI(text, sourceLang, this.targetLanguage);
            return response;
        } catch (error) {
            console.error('Translation error:', error);
            throw error;
        }
    }
    
    // Call Azure Translator API
    async callTranslationAPI(text, from, to) {
        const url = `${this.endpoint}/translate?api-version=3.0&from=${from}&to=${to}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': this.subscriptionKey,
                'Ocp-Apim-Subscription-Region': this.region,
                'Content-Type': 'application/json',
                'X-ClientTraceId': this.generateTraceId()
            },
            body: JSON.stringify([{ text: text }])
        });
        
        if (!response.ok) {
            throw new Error(`Translation API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data[0]?.translations?.[0]?.text || text;
    }
    
    // Batch translate multiple texts for better performance
    async batchTranslate(texts, sourceLanguage = 'en') {
        if (!this.isEnabled || !texts.length) {
            return [];
        }
        
        try {
            const sourceLang = this.extractLanguageCode(sourceLanguage);
            
            if (sourceLang === this.targetLanguage) {
                return texts;
            }
            
            const url = `${this.endpoint}/translate?api-version=3.0&from=${sourceLang}&to=${this.targetLanguage}`;
            
            const requestBody = texts.map(text => ({ text }));
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Ocp-Apim-Subscription-Key': this.subscriptionKey,
                    'Ocp-Apim-Subscription-Region': this.region,
                    'Content-Type': 'application/json',
                    'X-ClientTraceId': this.generateTraceId()
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                throw new Error(`Batch translation API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.map(item => item.translations?.[0]?.text || '');
        } catch (error) {
            console.error('Batch translation error:', error);
            throw error;
        }
    }
    
    // Extract language code from full locale (e.g., 'en-US' -> 'en')
    extractLanguageCode(locale) {
        return locale.split('-')[0].toLowerCase();
    }
    
    // Generate unique trace ID for API calls
    generateTraceId() {
        return 'xxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    // Check if translation is enabled
    isTranslationEnabled() {
        return this.isEnabled && this.targetLanguage;
    }
    
    // Get current target language
    getTargetLanguage() {
        return this.targetLanguage;
    }
    
    // Get language display name
    getLanguageDisplayName(languageCode) {
        return AzureConfig.translation.supportedLanguages[languageCode] || languageCode;
    }
    
    // Disable translation
    disable() {
        this.isEnabled = false;
        this.targetLanguage = null;
    }
    
    // Real-time translation with debouncing for interim results
    async translateWithDebounce(text, sourceLanguage = 'en', isInterim = false) {
        if (isInterim) {
            // For interim results, use shorter debounce
            clearTimeout(this.interimTimeout);
            return new Promise((resolve) => {
                this.interimTimeout = setTimeout(async () => {
                    try {
                        const translation = await this.translateText(text, sourceLanguage);
                        resolve(translation);
                    } catch (error) {
                        resolve(null);
                    }
                }, 300); // 300ms debounce for interim results
            });
        } else {
            // For final results, translate immediately
            return this.translateText(text, sourceLanguage);
        }
    }
}

// Export for use in main application
if (typeof window !== 'undefined') {
    window.TranslationService = TranslationService;
}
