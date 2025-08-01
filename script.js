class RealTimeTranscription {
    constructor() {
        // Azure Speech Service Configuration
        this.speech_service_resource_key = AzureConfig.speech_service_resource_key;
        this.speech_service_region = AzureConfig.speech_service_region;
        this.language = AzureConfig.language;
        
        // Translation Service
        this.translationService = new TranslationService(this.speech_service_resource_key, this.speech_service_region);
        this.isTranslationEnabled = false;
        this.translatedWordCount = 0;
        
        // Speech Recognition Objects
        this.speechConfig = null;
        this.audioConfig = null;
        this.recognizer = null;
        
        // Application State
        this.isRecording = false;
        this.isPaused = false;
        this.sessionStartTime = null;
        this.transcriptData = [];
        this.wordCount = 0;
        
        // Audio Analysis
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.audioLevelInterval = null;
        
        // DOM Elements
        this.elements = {
            startBtn: document.getElementById('start-btn'),
            stopBtn: document.getElementById('stop-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            clearBtn: document.getElementById('clear-transcript'),
            connectionStatus: document.getElementById('connection-status'),
            micIndicator: document.getElementById('mic-indicator'),
            micStatusText: document.getElementById('mic-status-text'),
            audioLevelFill: document.getElementById('audio-level-fill'),
            transcriptionFeed: document.getElementById('transcription-feed'),
            translationFeed: document.getElementById('translation-feed'),
            interimText: document.getElementById('interim-text'),
            interimTranslation: document.getElementById('interim-translation'),
            sessionDuration: document.getElementById('session-duration'),
            wordCount: document.getElementById('word-count'),
            translatedWordCount: document.getElementById('translated-word-count'),
            confidenceScore: document.getElementById('confidence-score'),
            detectedLanguage: document.getElementById('detected-language'),
            sourceLanguageBadge: document.getElementById('source-language'),
            targetLanguageBadge: document.getElementById('target-language-badge'),
            targetLanguageSelect: document.getElementById('target-language'),
            toggleTranslationBtn: document.getElementById('toggle-translation'),
            translationSection: document.getElementById('translation-section'),
            translationStatus: document.getElementById('translation-status'),
            statusMessage: document.getElementById('status-message'),
            exportTxt: document.getElementById('export-txt'),
            exportJson: document.getElementById('export-json')
        };
        
        this.init();
    }
    
    init() {
        this.initializeSpeechService();
        this.initializeTranslationUI();
        this.setupEventListeners();
        this.updateUI();
    }
    
    initializeSpeechService() {
        try {
            // Initialize Azure Speech SDK
            this.speechConfig = SpeechSDK.SpeechConfig.fromSubscription(this.speech_service_resource_key, this.speech_service_region);
            this.speechConfig.speechRecognitionLanguage = this.language;
            
            // Enable detailed result with confidence scores
            this.speechConfig.requestWordLevelTimestamps();
            this.speechConfig.enableDictation();
            
            this.audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
            
            this.updateStatus('Speech service initialized', 'success');
            this.elements.connectionStatus.textContent = 'Ready';
            this.elements.connectionStatus.className = 'status-badge connecting';
            
        } catch (error) {
            console.error('Failed to initialize speech service:', error);
            this.updateStatus('Failed to initialize speech service', 'error');
            this.elements.connectionStatus.textContent = 'Error';
            this.elements.connectionStatus.className = 'status-badge disconnected';
        }
    }
    
    initializeTranslationUI() {
        // Populate language selector
        const supportedLanguages = this.translationService.getSupportedLanguages();
        
        // Clear existing options except the first one
        this.elements.targetLanguageSelect.innerHTML = '<option value="">No Translation</option>';
        
        // Add supported languages
        Object.entries(supportedLanguages).forEach(([code, name]) => {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = name;
            this.elements.targetLanguageSelect.appendChild(option);
        });
        
        // Set default selection
        const defaultLang = AzureConfig.translation.defaultTargetLanguage;
        if (defaultLang && supportedLanguages[defaultLang]) {
            this.elements.targetLanguageSelect.value = defaultLang;
            this.enableTranslation(defaultLang);
        }
    }
    
    setupEventListeners() {
        // Control buttons
        this.elements.startBtn.addEventListener('click', () => this.startRecording());
        this.elements.stopBtn.addEventListener('click', () => this.stopRecording());
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.clearBtn.addEventListener('click', () => this.clearTranscript());
        
        // Export buttons
        this.elements.exportTxt.addEventListener('click', () => this.exportTranscript('txt'));
        this.elements.exportJson.addEventListener('click', () => this.exportTranscript('json'));
        
        // Translation controls
        this.elements.targetLanguageSelect.addEventListener('change', (e) => {
            const targetLang = e.target.value;
            if (targetLang) {
                this.enableTranslation(targetLang);
            } else {
                this.disableTranslation();
            }
        });
        
        this.elements.toggleTranslationBtn.addEventListener('click', () => {
            this.toggleTranslation();
        });
        
        // Handle page unload
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }
    
    enableTranslation(targetLanguage) {
        this.translationService.setTargetLanguage(targetLanguage);
        this.isTranslationEnabled = true;
        
        // Update UI
        const languageName = this.translationService.getLanguageDisplayName(targetLanguage);
        this.elements.targetLanguageBadge.textContent = languageName;
        this.elements.translationStatus.textContent = `Active (${languageName})`;
        this.elements.toggleTranslationBtn.classList.add('active');
        
        // Clear translation disabled message
        this.elements.translationFeed.innerHTML = `
            <div class="welcome-message">
                <i class="fas fa-language"></i>
                <p>Translation to ${languageName} is enabled</p>
            </div>
        `;
        
        this.updateStatus(`Translation enabled: ${languageName}`, 'success');
    }
    
    disableTranslation() {
        this.translationService.disable();
        this.isTranslationEnabled = false;
        
        // Update UI
        this.elements.targetLanguageBadge.textContent = 'Select Language';
        this.elements.translationStatus.textContent = 'Disabled';
        this.elements.toggleTranslationBtn.classList.remove('active');
        this.elements.targetLanguageSelect.value = '';
        
        // Show translation disabled message
        this.elements.translationFeed.innerHTML = `
            <div class="translation-disabled-message">
                <i class="fas fa-language"></i>
                <p>Select a target language to enable real-time translation</p>
            </div>
        `;
        
        this.updateStatus('Translation disabled', 'info');
    }
    
    toggleTranslation() {
        if (this.isTranslationEnabled) {
            this.disableTranslation();
        } else {
            const targetLang = this.elements.targetLanguageSelect.value;
            if (targetLang) {
                this.enableTranslation(targetLang);
            } else {
                this.updateStatus('Please select a target language first', 'error');
            }
        }
    }
    
    async startRecording() {
        try {
            this.updateStatus('Requesting microphone access...', 'info');
            
            // Request microphone permission and setup audio analysis
            await this.setupAudioAnalysis();
            
            // Create new recognizer
            this.recognizer = new SpeechSDK.SpeechRecognizer(this.speechConfig, this.audioConfig);
            
            // Setup recognition event handlers
            this.setupRecognitionEvents();
            
            // Start continuous recognition
            this.recognizer.startContinuousRecognitionAsync(
                () => {
                    this.isRecording = true;
                    this.sessionStartTime = new Date();
                    this.startSessionTimer();
                    this.updateUI();
                    this.updateStatus('Recording started - speak now!', 'success');
                    this.elements.connectionStatus.textContent = 'Recording';
                    this.elements.connectionStatus.className = 'status-badge connected';
                },
                (error) => {
                    console.error('Recognition start failed:', error);
                    this.updateStatus(`Failed to start recording: ${error}`, 'error');
                    this.cleanup();
                }
            );
            
        } catch (error) {
            console.error('Start recording error:', error);
            this.updateStatus(`Error: ${error.message}`, 'error');
        }
    }
    
    stopRecording() {
        if (this.recognizer) {
            this.recognizer.stopContinuousRecognitionAsync(
                () => {
                    this.cleanup();
                    this.updateStatus('Recording stopped', 'info');
                    this.elements.connectionStatus.textContent = 'Ready';
                    this.elements.connectionStatus.className = 'status-badge connecting';
                },
                (error) => {
                    console.error('Stop recognition error:', error);
                    this.cleanup();
                }
            );
        }
    }
    
    togglePause() {
        if (!this.isRecording) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.recognizer.stopContinuousRecognitionAsync();
            this.elements.pauseBtn.innerHTML = '<i class="fas fa-play"></i><span>Resume</span>';
            this.updateStatus('Recording paused', 'info');
            this.elements.connectionStatus.textContent = 'Paused';
            this.elements.connectionStatus.className = 'status-badge connecting';
        } else {
            this.recognizer.startContinuousRecognitionAsync();
            this.elements.pauseBtn.innerHTML = '<i class="fas fa-pause"></i><span>Pause</span>';
            this.updateStatus('Recording resumed', 'success');
            this.elements.connectionStatus.textContent = 'Recording';
            this.elements.connectionStatus.className = 'status-badge connected';
        }
        
        this.updateUI();
    }
    
    setupRecognitionEvents() {
        // Recognizing event (interim results)
        this.recognizer.recognizing = (sender, args) => {
            if (args.result.reason === SpeechSDK.ResultReason.RecognizingSpeech) {
                this.displayInterimResult(args.result.text);
            }
        };
        
        // Recognized event (final results)
        this.recognizer.recognized = (sender, args) => {
            if (args.result.reason === SpeechSDK.ResultReason.RecognizedSpeech && args.result.text) {
                this.addTranscriptEntry(args.result.text, args.result.properties);
                this.clearInterimResult();
            } else if (args.result.reason === SpeechSDK.ResultReason.NoMatch) {
                console.log('No speech could be recognized');
            }
        };
        
        // Canceled event
        this.recognizer.canceled = (sender, args) => {
            console.log('Recognition canceled:', args.reason);
            if (args.reason === SpeechSDK.CancellationReason.Error) {
                console.error('Error details:', args.errorDetails);
                this.updateStatus(`Recognition error: ${args.errorDetails}`, 'error');
            }
            this.cleanup();
        };
        
        // Session events
        this.recognizer.sessionStarted = (sender, args) => {
            console.log('Session started:', args.sessionId);
        };
        
        this.recognizer.sessionStopped = (sender, args) => {
            console.log('Session stopped:', args.sessionId);
            this.cleanup();
        };
    }
    
    async setupAudioAnalysis() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });
            
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            
            this.analyser.fftSize = 256;
            this.microphone.connect(this.analyser);
            
            this.startAudioLevelMonitoring();
            
        } catch (error) {
            console.error('Microphone access error:', error);
            throw new Error('Microphone access denied. Please allow microphone access and try again.');
        }
    }
    
    startAudioLevelMonitoring() {
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        this.audioLevelInterval = setInterval(() => {
            if (!this.isRecording) return;
            
            this.analyser.getByteFrequencyData(dataArray);
            
            // Calculate RMS (Root Mean Square) for audio level
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i] * dataArray[i];
            }
            const rms = Math.sqrt(sum / bufferLength);
            const level = (rms / 255) * 100;
            
            this.elements.audioLevelFill.style.width = `${level}%`;
        }, 100);
    }
    
    addTranscriptEntry(text, properties) {
        const timestamp = new Date();
        const confidence = this.extractConfidence(properties);
        
        const entry = {
            text: text,
            timestamp: timestamp,
            confidence: confidence,
            id: Date.now()
        };
        
        this.transcriptData.push(entry);
        this.wordCount += text.split(' ').length;
        
        // Create DOM element for original transcription
        const entryElement = document.createElement('div');
        entryElement.className = 'transcript-entry';
        entryElement.innerHTML = `
            <div class="transcript-timestamp">${timestamp.toLocaleTimeString()}</div>
            <div class="transcript-text">${text}</div>
        `;
        
        // Remove welcome message if present
        const welcomeMessage = this.elements.transcriptionFeed.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
        
        this.elements.transcriptionFeed.appendChild(entryElement);
        this.elements.transcriptionFeed.scrollTop = this.elements.transcriptionFeed.scrollHeight;
        
        // Update metadata
        this.elements.wordCount.textContent = this.wordCount;
        this.elements.confidenceScore.textContent = confidence ? `${Math.round(confidence * 100)}%` : '--';
        
        // Translate if enabled
        if (this.isTranslationEnabled) {
            this.translateAndDisplayEntry(text, timestamp, entry.id);
        }
    }
    
    async translateAndDisplayEntry(text, timestamp, entryId) {
        try {
            // Create translation entry with loading state
            const translationElement = document.createElement('div');
            translationElement.className = 'translation-entry';
            translationElement.id = `translation-${entryId}`;
            translationElement.innerHTML = `
                <div class="translation-timestamp">${timestamp.toLocaleTimeString()}</div>
                <div class="translation-text translation-loading">
                    <div class="loading-spinner"></div>
                    Translating...
                </div>
            `;
            
            // Remove welcome message if present
            const welcomeMessage = this.elements.translationFeed.querySelector('.welcome-message, .translation-disabled-message');
            if (welcomeMessage) {
                welcomeMessage.remove();
            }
            
            this.elements.translationFeed.appendChild(translationElement);
            this.elements.translationFeed.scrollTop = this.elements.translationFeed.scrollHeight;
            
            // Perform translation
            const translatedText = await this.translationService.translateText(text, this.language);
            
            if (translatedText) {
                // Update with translated text
                const textElement = translationElement.querySelector('.translation-text');
                textElement.className = 'translation-text';
                textElement.textContent = translatedText;
                
                // Update word count
                this.translatedWordCount += translatedText.split(' ').length;
                this.elements.translatedWordCount.textContent = this.translatedWordCount;
                
                // Store translation in transcript data
                const originalEntry = this.transcriptData.find(entry => entry.id === entryId);
                if (originalEntry) {
                    originalEntry.translation = translatedText;
                }
            } else {
                // Handle translation failure
                const textElement = translationElement.querySelector('.translation-text');
                textElement.className = 'translation-text translation-error';
                textElement.textContent = 'Translation failed';
            }
            
        } catch (error) {
            console.error('Translation error:', error);
            const translationElement = document.getElementById(`translation-${entryId}`);
            if (translationElement) {
                const textElement = translationElement.querySelector('.translation-text');
                textElement.className = 'translation-text translation-error';
                textElement.textContent = 'Translation error';
            }
        }
    }
    
    displayInterimResult(text) {
        this.elements.interimText.textContent = text;
        
        // Translate interim result if enabled
        if (this.isTranslationEnabled && text.trim()) {
            this.translateInterimResult(text);
        } else {
            this.elements.interimTranslation.textContent = '';
        }
    }
    
    async translateInterimResult(text) {
        try {
            const translatedText = await this.translationService.translateWithDebounce(text, this.language, true);
            if (translatedText && this.elements.interimTranslation) {
                this.elements.interimTranslation.textContent = translatedText;
            }
        } catch (error) {
            console.warn('Interim translation error:', error);
            this.elements.interimTranslation.textContent = '';
        }
    }
    
    clearInterimResult() {
        this.elements.interimText.textContent = '';
        this.elements.interimTranslation.textContent = '';
    }
    
    extractConfidence(properties) {
        try {
            if (properties && properties.getProperty) {
                const confidenceStr = properties.getProperty(SpeechSDK.PropertyId.SpeechServiceResponse_JsonResult);
                if (confidenceStr) {
                    const result = JSON.parse(confidenceStr);
                    return result.NBest?.[0]?.Confidence || null;
                }
            }
        } catch (error) {
            console.warn('Could not extract confidence score:', error);
        }
        return null;
    }
    
    startSessionTimer() {
        this.sessionTimer = setInterval(() => {
            if (this.sessionStartTime && this.isRecording && !this.isPaused) {
                const elapsed = new Date() - this.sessionStartTime;
                const hours = Math.floor(elapsed / 3600000);
                const minutes = Math.floor((elapsed % 3600000) / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);
                
                this.elements.sessionDuration.textContent = 
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    clearTranscript() {
        if (confirm('Are you sure you want to clear the transcript and translations?')) {
            this.transcriptData = [];
            this.wordCount = 0;
            this.translatedWordCount = 0;
            
            // Clear transcription feed
            this.elements.transcriptionFeed.innerHTML = `
                <div class="welcome-message">
                    <i class="fas fa-info-circle"></i>
                    <p>Transcript cleared. Continue speaking to add new text.</p>
                </div>
            `;
            
            // Clear translation feed
            if (this.isTranslationEnabled) {
                const languageName = this.translationService.getLanguageDisplayName(
                    this.translationService.getTargetLanguage()
                );
                this.elements.translationFeed.innerHTML = `
                    <div class="welcome-message">
                        <i class="fas fa-language"></i>
                        <p>Translation to ${languageName} is enabled</p>
                    </div>
                `;
            } else {
                this.elements.translationFeed.innerHTML = `
                    <div class="translation-disabled-message">
                        <i class="fas fa-language"></i>
                        <p>Select a target language to enable real-time translation</p>
                    </div>
                `;
            }
            
            // Update metadata
            this.elements.wordCount.textContent = '0';
            this.elements.translatedWordCount.textContent = '0';
            this.elements.confidenceScore.textContent = '--';
            this.updateStatus('Transcript and translations cleared', 'info');
        }
    }
    
    exportTranscript(format) {
        if (this.transcriptData.length === 0) {
            this.updateStatus('No transcript data to export', 'error');
            return;
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        let content, filename, mimeType;
        
        if (format === 'txt') {
            content = this.transcriptData
                .map(entry => {
                    let line = `[${entry.timestamp.toLocaleTimeString()}] ${entry.text}`;
                    if (entry.translation && this.isTranslationEnabled) {
                        const targetLang = this.translationService.getLanguageDisplayName(
                            this.translationService.getTargetLanguage()
                        );
                        line += `\n    [${targetLang}] ${entry.translation}`;
                    }
                    return line;
                })
                .join('\n\n');
            filename = `transcript_${timestamp}.txt`;
            mimeType = 'text/plain';
        } else if (format === 'json') {
            content = JSON.stringify({
                exportTime: new Date().toISOString(),
                sessionDuration: this.elements.sessionDuration.textContent,
                totalWords: this.wordCount,
                translatedWords: this.translatedWordCount,
                sourceLanguage: this.language,
                targetLanguage: this.isTranslationEnabled ? this.translationService.getTargetLanguage() : null,
                translationEnabled: this.isTranslationEnabled,
                entries: this.transcriptData.map(entry => ({
                    ...entry,
                    timestamp: entry.timestamp.toISOString()
                }))
            }, null, 2);
            filename = `transcript_${timestamp}.json`;
            mimeType = 'application/json';
        }
        
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.updateStatus(`Transcript exported as ${format.toUpperCase()}`, 'success');
    }
    
    updateUI() {
        // Update button states
        this.elements.startBtn.disabled = this.isRecording;
        this.elements.stopBtn.disabled = !this.isRecording;
        this.elements.pauseBtn.disabled = !this.isRecording;
        
        // Update microphone indicator
        if (this.isRecording && !this.isPaused) {
            this.elements.micIndicator.className = 'mic-indicator recording';
            this.elements.micIndicator.innerHTML = '<i class="fas fa-microphone"></i>';
            this.elements.micStatusText.textContent = 'Recording';
        } else if (this.isRecording && this.isPaused) {
            this.elements.micIndicator.className = 'mic-indicator active';
            this.elements.micIndicator.innerHTML = '<i class="fas fa-pause"></i>';
            this.elements.micStatusText.textContent = 'Paused';
        } else {
            this.elements.micIndicator.className = 'mic-indicator inactive';
            this.elements.micIndicator.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            this.elements.micStatusText.textContent = 'Inactive';
        }
    }
    
    updateStatus(message, type = 'info') {
        this.elements.statusMessage.textContent = message;
        this.elements.statusMessage.className = `status-message ${type}`;
        
        console.log(`Status (${type}):`, message);
        
        // Auto-clear status after 5 seconds
        setTimeout(() => {
            if (this.elements.statusMessage.textContent === message) {
                this.elements.statusMessage.textContent = this.isRecording ? 'Recording in progress...' : 'Ready to start transcription';
                this.elements.statusMessage.className = 'status-message';
            }
        }, 5000);
    }
    
    cleanup() {
        this.isRecording = false;
        this.isPaused = false;
        
        // Stop recognizer
        if (this.recognizer) {
            try {
                this.recognizer.close();
            } catch (error) {
                console.warn('Error closing recognizer:', error);
            }
            this.recognizer = null;
        }
        
        // Stop session timer
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
            this.sessionTimer = null;
        }
        
        // Stop audio level monitoring
        if (this.audioLevelInterval) {
            clearInterval(this.audioLevelInterval);
            this.audioLevelInterval = null;
        }
        
        // Clean up audio context
        if (this.audioContext && this.audioContext.state !== 'closed') {
            try {
                this.audioContext.close();
            } catch (error) {
                console.warn('Error closing audio context:', error);
            }
            this.audioContext = null;
        }
        
        // Clear interim translation timeouts
        if (this.translationService && this.translationService.interimTimeout) {
            clearTimeout(this.translationService.interimTimeout);
        }
        
        // Reset UI
        this.updateUI();
        this.elements.audioLevelFill.style.width = '0%';
        
        // Reset pause button text
        this.elements.pauseBtn.innerHTML = '<i class="fas fa-pause"></i><span>Pause</span>';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check for required browser features
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support microphone access. Please use a modern browser like Chrome, Firefox, or Edge.');
        return;
    }
    
    if (typeof SpeechSDK === 'undefined') {
        alert('Azure Speech SDK failed to load. Please check your internet connection and refresh the page.');
        return;
    }
    
    if (typeof TranslationService === 'undefined') {
        alert('Translation service failed to load. Please check your internet connection and refresh the page.');
        return;
    }
    
    if (typeof AzureConfig === 'undefined') {
        alert('Configuration file failed to load. Please check that config.js is available.');
        return;
    }
    
    // Initialize the transcription app
    window.transcriptionApp = new RealTimeTranscription();
    
    console.log('Real-time transcription application with translation support initialized successfully!');
});
