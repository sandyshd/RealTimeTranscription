# Real-Time Transcription & Translation Web Application

A modern, responsive web application that provides real-time speech-to-text transcription with live translation using Azure Cognitive Services Speech-to-Text and Translator APIs. Features a professional call center-style interface with dual-panel display.

## 🚀 Features

- **Real-time Speech Recognition**: Live transcription using Azure Speech-to-Text
- **Real-time Translation**: Instant translation to 25+ languages using Azure Translator
- **Dual-Panel Interface**: Side-by-side display of original transcription and translation
- **Modern UI**: Call center-style interface with responsive design
- **Audio Visualization**: Real-time audio level monitoring
- **Session Management**: Start, stop, and pause recording functionality
- **Language Selection**: Dropdown selector with native language names
- **Export Options**: Export transcripts with translations as TXT or JSON formats
- **Privacy Focused**: Clear privacy notifications and no permanent audio storage
- **Confidence Scores**: Display confidence levels for recognized speech
- **Translation Statistics**: Track original and translated word counts
- **Low Latency**: Optimized for minimal translation delays

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Audio Processing**: Web Audio API
- **Speech Recognition**: Azure Cognitive Services Speech SDK
- **Translation**: Azure Cognitive Services Translator API
- **Design**: Responsive CSS Grid/Flexbox layout
- **Icons**: Font Awesome 6

## 📋 Prerequisites

- Modern web browser (Chrome, Firefox, Edge, Safari)
- Microphone access permission
- Internet connection for Azure APIs
- Azure Cognitive Services Speech resource
- Azure Cognitive Services Translator resource (or multi-service resource)

## 🔧 Setup Instructions

### 1. Azure Services Setup

1. Create an Azure account if you don't have one
2. Create a Speech resource in Azure Portal
3. (Optional) Create a Translator resource or use multi-service resource
4. Copy your subscription key and region
5. Update the credentials in `config.js`:

```javascript
const AzureConfig = {
    speech_service_resource_key: 'YOUR_SUBSCRIPTION_KEY',
    speech_service_region: 'YOUR_REGION', // e.g., 'eastus'
    language: 'en-US',
    translation: {
        defaultTargetLanguage: 'es', // Default to Spanish
        // ... other settings
    }
};
```

### 2. Local Development

1. Clone or download this project
2. Update Azure credentials in `config.js`
3. Serve the files using a local web server:

**Option A: Using the provided scripts**
```bash
# Windows Command Prompt
start-server.bat

# Windows PowerShell
.\start-server.ps1
```

**Option B: Using Python**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Option C: Using Node.js**
```bash
npx http-server -p 8000
```

**Option D: Using VS Code Live Server**
- Install the "Live Server" extension
- Right-click on `index.html` and select "Open with Live Server"

4. Open your browser and navigate to `http://localhost:8000`

### 3. HTTPS Requirement

For microphone access, the application must be served over HTTPS in production. For local development, `localhost` is exempt from this requirement.

## 🚀 Azure Deployment

### Option A: Azure Static Web Apps (Recommended)

Azure Static Web Apps provides free hosting with automatic HTTPS, perfect for this application.

#### Prerequisites
- Azure account with active subscription
- Azure CLI installed locally
- Git repository (GitHub, Azure DevOps, or GitLab)

#### Step 1: Prepare Your Repository
1. Push your code to a Git repository (GitHub recommended)
2. Ensure your `config.js` contains your Azure credentials
3. Add a `.gitignore` file to exclude sensitive files:

```gitignore
# Sensitive files (if you want to keep credentials separate)
config.local.js

# Development files
.vscode/
node_modules/
*.log
```

#### Step 2: Create Static Web App via Azure Portal
1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource" → "Static Web App"
3. Fill in the details:
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Create new or use existing
   - **Name**: `realtime-transcription-app`
   - **Plan type**: Free (for development) or Standard (for production)
   - **Region**: Choose closest to your users
   - **Source**: GitHub (or your Git provider)
   - **Organization**: Your GitHub username/organization
   - **Repository**: Your repository name
   - **Branch**: `main` or `master`
   - **Build Presets**: Custom
   - **App location**: `/` (root)
   - **Api location**: Leave empty
   - **Output location**: Leave empty

4. Click "Review + create" then "Create"

#### Step 3: Configure Build Settings
Azure will automatically create a GitHub Action. Update the workflow file (`.github/workflows/azure-static-web-apps-*.yml`):

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: ""
          output_location: ""

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

#### Step 4: Configure Custom Domain (Optional)
1. In Azure Portal, go to your Static Web App
2. Navigate to "Custom domains"
3. Click "Add" and configure your domain
4. Add DNS records as instructed

#### Step 5: Environment Variables (for sensitive config)
1. In Azure Portal, go to your Static Web App
2. Navigate to "Configuration"
3. Add application settings:
   - `AZURE_SPEECH_SUBSCRIPTION_KEY`: Your Azure subscription key
   - `AZURE_SPEECH_SERVICE_REGION`: Your Azure region

Then modify your `config.js` to use environment variables in production:

```javascript
const AzureConfig = {
    speech_service_resource_key: window.location.hostname === 'localhost' 
        ? 'YOUR_LOCAL_DEV_KEY'
        : 'Your Azure Speech Service subscription key',
    speech_service_region: window.location.hostname === 'localhost' 
        ? 'eastus'
        : 'eastus',
    // ... rest of config
};
```

### Option B: Azure App Service

For more control and features, deploy to Azure App Service.

#### Step 1: Create App Service
1. In Azure Portal, create new "App Service"
2. Choose:
   - **Resource Group**: Create new or existing
   - **Name**: `realtime-transcription`
   - **Runtime stack**: Node.js (latest LTS)
   - **Operating System**: Linux
   - **Region**: Choose closest to users
   - **Pricing tier**: F1 (Free) for testing, B1 or higher for production

#### Step 2: Prepare Application for App Service
Create `package.json` in your root directory:

```json
{
  "name": "realtime-transcription",
  "version": "1.0.0",
  "description": "Real-time transcription and translation app",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "path": "^0.12.7"
  }
}
```

Create `server.js` to serve your static files:

```javascript
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8000;

// Serve static files
app.use(express.static('.'));

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
```

#### Step 3: Deploy using Git
1. In Azure Portal, go to your App Service
2. Navigate to "Deployment Center"
3. Choose "GitHub" as source
4. Authorize and select your repository
5. Choose branch and save

#### Step 4: Configure Application Settings
1. Go to "Configuration" → "Application settings"
2. Add:
   - `WEBSITE_NODE_DEFAULT_VERSION`: `18-lts`
   - `SCM_DO_BUILD_DURING_DEPLOYMENT`: `true`

### Option C: Azure Blob Storage + CDN

For a cost-effective static hosting solution.

#### Step 1: Create Storage Account
1. Create new "Storage Account" in Azure Portal
2. Enable "Static website" in the storage account
3. Set index document to `index.html`
4. Note the primary endpoint URL

#### Step 2: Upload Files
Using Azure CLI:
```bash
# Install Azure CLI if not already installed
az login

# Upload files to blob storage
az storage blob upload-batch \
    --source . \
    --destination '$web' \
    --account-name yourstorageaccount
```

Using Azure Storage Explorer:
1. Download and install Azure Storage Explorer
2. Connect to your storage account
3. Upload all files to the `$web` container

#### Step 3: Configure CDN (Optional)
1. Create "CDN Profile" in Azure Portal
2. Add CDN endpoint pointing to your blob storage
3. Configure custom domain if needed

## 🔧 Production Configuration

### Security Considerations
1. **Environment Variables**: Store sensitive keys in Azure Key Vault or App Settings
2. **CORS Configuration**: Configure allowed origins in Azure
3. **Authentication**: Add Azure AD authentication if needed
4. **Rate Limiting**: Implement rate limiting for API calls

### Performance Optimization
1. **CDN**: Use Azure CDN for global distribution
2. **Compression**: Enable gzip compression
3. **Caching**: Configure appropriate cache headers
4. **Minification**: Minify CSS and JavaScript files

### Monitoring and Analytics
1. **Application Insights**: Add Azure Application Insights for monitoring
2. **Log Analytics**: Configure logging for troubleshooting
3. **Alerts**: Set up alerts for service health

Add Application Insights to your `index.html`:

```html
<script type="text/javascript">
!function(T,l,y){var S=T.location,k="script",D="instrumentationKey",C="ingestionendpoint",I="disableExceptionTracking",E="ai.device.",b="toLowerCase",w="crossOrigin",N="POST",e="appInsightsSDK",t=y.name||"appInsights";(y.name||T[e])&&(T[e]=t);var n=T[t]||function(d){var g=!1,f=!1,m={initialize:!0,queue:[],sv:"5",version:2,config:d};function v(e,t){var n={},a="Browser";return n[E+"id"]=a[b](),n[E+"type"]=a,n["ai.operation.name"]=S&&S.pathname||"_unknown_",n["ai.internal.sdkVersion"]="javascript:snippet_"+(m.sv||m.version),{time:function(){var e=new Date;function t(e){var t=""+e;return 1===t.length&&(t="0"+t),t}return e.getUTCFullYear()+"-"+t(1+e.getUTCMonth())+"-"+t(e.getUTCDate())+"T"+t(e.getUTCHours())+":"+t(e.getUTCMinutes())+":"+t(e.getUTCSeconds())+"."+((e.getUTCMilliseconds()/1e3).toFixed(3)+"").slice(2,5)+"Z"}(),iKey:e,name:"Microsoft.ApplicationInsights."+e.replace(/-/g,"")+"."+t,sampleRate:100,tags:n,data:{baseData:{ver:2}}}}var h=d.url||y.src;if(h){function a(e){var t,n,a,i,r,o,s,c,u,p,l;g=!0,m.queue=[],f||(f=!0,t=h,s=function(){var e={},t=d.connectionString;if(t)for(var n=t.split(";"),a=0;a<n.length;a++){var i=n[a].split("=");2===i.length&&(e[i[0][b]()]=i[1])}if(!e[C]){var r=e.endpointsuffix,o=r?e.location:null;e[C]="https://"+(o?o+".":"")+"dc."+(r||"services.visualstudio.com")}return e}(),c=s[D]||d[D]||"",u=s[C],p=u?u+"/v2/track":d.endpointUrl,(l=[]).push((n="SDK LOAD Failure: Failed to load Application Insights SDK script (See stack for details)",a=t,i=p,(o=(r=v(c,"Exception")).data).baseType="ExceptionData",o.baseData.exceptions=[{typeName:"SDKLoadFailed",message:n.replace(/\./g,"-"),hasFullStack:!1,stack:n+"\nSnippet failed to load ["+a+"] -- Telemetry is disabled\nHelp Link: https://go.microsoft.com/fwlink/?linkid=2128109\nHost: "+(S&&S.pathname||"_unknown_")+"\nEndpoint: "+i,parsedStack:[]}],r)),l.push(function(e,t,n,a){var i=v(c,"Message"),r=i.data;r.baseType="MessageData";var o=r.baseData;return o.message='AI (Internal): 99 message:"'+("SDK LOAD Failure: Failed to load Application Insights SDK script (See stack for details) ("+n+")").replace(/\"/g,"")+'"',o.properties={endpoint:a},i}(0,0,t,p)),function(e,t){if(JSON){var n=T.fetch;if(n&&!y.useXhr)n(t,{method:N,body:JSON.stringify(e),mode:"cors"});else if(XMLHttpRequest){var a=new XMLHttpRequest;a.open(N,t),a.setRequestHeader("Content-type","application/json"),a.send(JSON.stringify(e))}}}(l,p))}function i(e,t){f||setTimeout(function(){!t&&m.core||a()},500)}var e=function(){var n=l.createElement(k);n.src=h;var e=y[w];return!e&&""!==e||"undefined"==n[w]||(n[w]=e),n.onload=i,n.onerror=a,n.onreadystatechange=function(e,t){"loaded"!==n.readyState&&"complete"!==n.readyState||i(0,t)},n}();y.ld<0?l.getElementsByTagName("head")[0].appendChild(e):setTimeout(function(){l.getElementsByTagName(k)[0].parentNode.insertBefore(e,l.getElementsByTagName(k)[0])},y.ld||0)}try{m.cookie=l.cookie}catch(p){}function t(e){for(;e.length;)!function(t){m[t]=function(){var e=arguments;g||m.queue.push(function(){m[t].apply(m,e)})}}(e.pop())}var n="track",r="TrackPage",o="TrackEvent";t([n+"Event",n+"PageView",n+"Exception",n+"Trace",n+"DependencyData",n+"Metric",n+"PageViewPerformance","start"+r,"stop"+r,"start"+o,"stop"+o,"addTelemetryInitializer","setAuthenticatedUserContext","clearAuthenticatedUserContext","flush"]),m.SeverityLevel={Verbose:0,Information:1,Warning:2,Error:3,Critical:4};var s=(d.extensionConfig||{}).ApplicationInsightsAnalytics||{};if(!0!==d[I]&&!0!==s[I]){var c="onerror";t(["_"+c]);var u=T[c];T[c]=function(e,t,n,a,i){var r=u&&u(e,t,n,a,i);return!0!==r&&m["_"+c]({message:e,url:t,lineNumber:n,columnNumber:a,error:i}),r},d.autoExceptionInstrumented=!0}return m}(y.cfg);function a(){y.onInit&&y.onInit(n)}(T[t]=n).queue&&0===n.queue.length?(n.queue.push(a),n.trackPageView({})):a()}(window,document,{
src: "https://js.monitor.azure.com/scripts/b/ai.2.min.js",
cfg: {
    instrumentationKey: "YOUR_APPLICATION_INSIGHTS_KEY"
}
});
</script>
```

### Deployment Checklist
- [ ] Azure services are provisioned and configured
- [ ] Subscription keys are stored securely
- [ ] HTTPS is enabled
- [ ] CORS is configured properly
- [ ] Custom domain is configured (if applicable)
- [ ] CDN is set up for global distribution
- [ ] Monitoring and alerting are configured
- [ ] Performance testing is completed
- [ ] Security scanning is performed

## 🎯 Usage

### Basic Transcription
1. **Start Recording**: Click the "Start Recording" button to begin transcription
2. **Speak Clearly**: Speak into your microphone at a normal pace
3. **View Live Results**: See real-time transcription in the left panel
4. **Monitor Audio**: Check the audio level indicator in the left panel

### Translation Features
1. **Select Target Language**: Choose a language from the dropdown menu
2. **Enable Translation**: Click the language toggle button or select a language
3. **View Translations**: See real-time translations in the right panel
4. **Toggle Translation**: Use the language button to enable/disable translation

### Session Management
5. **Pause/Resume**: Use the pause button to temporarily stop recognition
6. **Export Data**: Export your transcript with translations as TXT or JSON format
7. **Clear Session**: Clear both transcription and translation feeds
8. **Stop Recording**: Click "Stop Recording" when finished

### Supported Languages

**Translation supports 25+ languages including:**
- Arabic (العربية)
- Chinese Simplified (中文简体)
- Chinese Traditional (中文繁體)
- English
- French (Français)
- German (Deutsch)
- Hindi (हिंदी)
- Italian (Italiano)
- Japanese (日本語)
- Korean (한국어)
- Portuguese (Português)
- Russian (Русский)
- Spanish (Español)
- And many more...

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers (optimal experience)
- Tablets (landscape and portrait)
- Mobile phones (portrait mode)

## 🔒 Privacy & Security

- **No Audio Storage**: Audio is processed in real-time and not stored
- **Secure Transmission**: All data is transmitted over HTTPS to Azure
- **User Consent**: Clear privacy notifications are displayed
- **Local Processing**: Audio level monitoring happens locally in the browser

## 🏗️ Project Structure

```
RealTimeTranscription/
├── index.html           # Main HTML structure with dual-panel layout
├── styles.css           # CSS styling and responsive design
├── script.js            # Main JavaScript application logic
├── translation.js       # Translation service module
├── config.js            # Azure services configuration
├── package.json         # Project configuration and dependencies
├── start-server.bat     # Windows batch script to start dev server
├── start-server.ps1     # PowerShell script to start dev server
├── .vscode/tasks.json   # VS Code task configuration
└── README.md           # This documentation file
```

## ⚙️ Configuration Options

### Speech Recognition Settings

You can modify these settings in `config.js`:

- **Language**: Change `language: 'en-US'` to support other speech recognition languages
- **Recognition Mode**: Continuous recognition is enabled by default
- **Audio Settings**: Echo cancellation and noise suppression are enabled

### Translation Settings

- **Default Language**: Set `defaultTargetLanguage` in config
- **Supported Languages**: Modify the `supportedLanguages` object to add/remove languages
- **Translation Endpoint**: Uses Azure Translator API v3.0

### UI Customization

- **Theme Colors**: Modify CSS custom properties in `styles.css`
- **Layout**: Adjust grid layouts for different screen sizes
- **Components**: Add or remove UI components as needed
- **Dual Panel**: Toggle between single and dual-panel layouts

## 🐛 Troubleshooting

### Common Issues

**Microphone Not Working**
- Ensure microphone permissions are granted
- Check browser compatibility
- Verify microphone is not muted or being used by another application

**Azure Connection Failed**
- Verify subscription key and region are correct
- Check internet connection
- Ensure Azure Speech resource is active and not exceeded quota

**Audio Level Not Showing**
- Grant microphone access when prompted
- Check browser console for audio context errors
- Ensure page is served over HTTPS (for production)

**Translation Not Working**
- Verify Azure Translator service is enabled
- Check that the subscription key has Translator permissions
- Ensure target language is supported
- Check browser console for translation API errors

**High Translation Latency**
- Translation API calls are optimized with debouncing
- Network latency affects real-time performance
- Consider using a closer Azure region

### Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Edge 79+
- ✅ Safari 14+

## 📊 Performance Considerations

- **Bandwidth**: Real-time streaming and translation require stable internet connection
- **Latency**: 
  - Speech recognition: 200-500ms depending on connection
  - Translation: Additional 300-800ms for API calls
- **Resource Usage**: Moderate CPU usage for audio processing and translation
- **Battery**: Continuous microphone access will drain mobile battery
- **API Limits**: Monitor Azure service quotas and usage

## 🔄 Future Enhancements

Potential improvements for future versions:

- Multi-language detection and automatic switching
- Speaker identification and diarization
- Custom vocabulary and phrase lists for both speech and translation
- Integration with other Azure Cognitive Services (sentiment analysis, key phrases)
- Offline transcription and translation capabilities
- Advanced audio processing filters
- Real-time collaboration features
- Voice synthesis for translated text (text-to-speech)
- Conversation mode with speaker separation

## 📄 License

This project is provided as-is for educational and development purposes. Please ensure compliance with Azure Cognitive Services terms of service and applicable privacy regulations.

## 🆘 Support

For issues related to:
- **Azure Services**: Consult Azure documentation
- **Browser Compatibility**: Check MDN Web Docs
- **Application Code**: Review browser console for errors

## 🙏 Acknowledgments

- Microsoft Azure Cognitive Services for Speech-to-Text and Translator APIs
- Azure Static Web Apps for seamless deployment and hosting
- Azure CDN for global content distribution
- Font Awesome for icons
- Web Audio API for microphone access
- Modern CSS Grid and Flexbox for responsive layout
- GitHub Actions for CI/CD automation
