# LinkedIn Universal Connection Remover

A powerful JavaScript browser console script that automates the removal of LinkedIn connections with advanced features like tab-switch detection, batch processing, and user-configurable parameters.

## 🌟 Features

- **🎯 Flexible Targeting**: Remove any number of connections (default: 50, supports 1000+)
- **👁️ Tab-Switch Detection**: Automatically pauses when you switch tabs and resumes when you return
- **⚡ Fast & Safe Processing**: Optimized 2-4 second delays between actions
- **📊 Real-time Progress**: Live updates with completion percentage and time tracking
- **🔄 Batch Processing**: Process large numbers in smaller, manageable batches
- **🛡️ Rate Limit Safe**: Built-in delays and randomization to avoid LinkedIn detection
- **🎛️ Configurable Settings**: Customize delays, retry attempts, and default values
- **🔍 Universal Detection**: Works with any LinkedIn interface layout
- **📈 Success Tracking**: Detailed statistics and success rates

## 🚀 Quick Start

### Method 1: Direct Parameter (Recommended)
```javascript
// Copy and paste the entire script into browser console, then:
startRemover(500)  // Removes exactly 500 connections
```

### Method 2: Interactive Prompt
```javascript
startUniversalRemover()  // Shows popup to enter number
```

### Method 3: Batch Processing
```javascript
startBatchRemoval([100, 100, 100, 100, 100])  // 500 connections in 5 batches
```

## 📋 Prerequisites

1. **LinkedIn Account**: You must be logged into LinkedIn
2. **Chrome/Firefox Browser**: Modern browser with developer console access
3. **Connections Page**: Navigate to your LinkedIn connections page
4. **Active Tab**: Keep LinkedIn tab active during processing (script auto-pauses if you switch)

## 🛠️ Installation & Usage

### Step 1: Navigate to LinkedIn Connections
Go to: `https://www.linkedin.com/mynetwork/invite-connect/connections/`

### Step 2: Open Browser Console
- **Chrome**: Press `F12` or `Ctrl+Shift+I` → Go to "Console" tab
- **Firefox**: Press `F12` or `Ctrl+Shift+I` → Go to "Console" tab
- **Safari**: Press `Cmd+Option+I` → Go to "Console" tab

### Step 3: Paste and Run Script
1. Copy the entire script from `linkedin-connection-remover.js`
2. Paste it into the browser console
3. Press Enter to load the script

### Step 4: Start Removal
```javascript
// Remove 500 connections
startRemover(500)

// Or use interactive mode
startUniversalRemover()

// Or use batch processing for large numbers
startBatchRemoval([200, 200, 200, 200, 200])  // 1000 total
```

## 🎛️ Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| `startRemover(count)` | Remove specific number of connections | `startRemover(500)` |
| `startUniversalRemover()` | Interactive mode with popup prompt | `startUniversalRemover()` |
| `startBatchRemoval(array)` | Process in batches with breaks | `startBatchRemoval([100, 100])` |
| `stopUniversalRemover()` | Stop the removal process | `stopUniversalRemover()` |
| `showRemoverStatus()` | Show current progress and status | `showRemoverStatus()` |
| `configureRemover(options)` | Customize script settings | See configuration section |

## ⚙️ Configuration

Customize the script behavior:

```javascript
configureRemover({
    minDelay: 3000,        // Minimum delay between actions (ms)
    maxDelay: 6000,        // Maximum delay between actions (ms)
    defaultRemovals: 100,  // Default number for removal
    maxRetries: 3          // Maximum retry attempts per connection
})
```

## 📊 Example Outputs

```
🚀 Enhanced LinkedIn Connection Remover v2.0
🎯 Target: 500 connections
⏱️ Delays: 2s - 4s
🔄 Tab-switch detection enabled
⚡ Faster processing enabled

✅ SUCCESS! Removed connection 1/500
✅ SUCCESS! Removed connection 2/500
📊 Progress: 2% complete (10/500)
...
🏁 FINAL RESULTS:
✅ Successfully removed: 485/500
❌ Failed attempts: 15
⏱️ Total time: 45 minutes
📊 Success rate: 97%
⚡ Average rate: 11 connections per minute
```

## 🔒 Safety Features

- **Rate Limiting**: 2-4 second delays between actions
- **Tab Monitoring**: Auto-pauses when tab is inactive
- **Error Handling**: Graceful failure recovery
- **Progress Persistence**: Continues from where it left off
- **Confirmation Prompts**: Warnings for large batch operations
- **LinkedIn-Safe**: Mimics human interaction patterns

## 🚨 Important Notes

### ⚠️ Use Responsibly
- This script is for personal use only
- Don't remove connections you want to keep
- LinkedIn's Terms of Service apply
- Use reasonable batch sizes (100-500 recommended)

### 💡 Best Practices
- Keep the LinkedIn tab active during processing
- Start with smaller numbers (50-100) to test
- Use batch processing for large numbers (1000+)
- Don't run multiple instances simultaneously
- Take breaks between large batch operations

### 🐛 Troubleshooting
- **Script stops working**: Refresh page and restart
- **No connections found**: Scroll down manually first
- **High failure rate**: Reduce processing speed in configuration
- **LinkedIn changes detected**: Check for script updates

## 📈 Performance

| Connections | Estimated Time | Recommended Method |
|-------------|----------------|-------------------|
| 50-100 | 5-15 minutes | `startRemover(100)` |
| 100-500 | 15-60 minutes | `startRemover(500)` |
| 500-1000 | 1-2 hours | `startBatchRemoval([200,200,200,200,200])` |
| 1000+ | 2+ hours | Multiple batch sessions |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for:
- Bug fixes
- Performance improvements
- New features
- LinkedIn interface updates
- Documentation improvements

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool is provided as-is for educational and personal use. Users are responsible for complying with LinkedIn's Terms of Service and using the tool responsibly. The authors are not responsible for any account restrictions or violations that may result from misuse.

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Ensure you're on the correct LinkedIn page
3. Try refreshing and restarting
4. Open an issue with detailed error information

---

**Star ⭐ this repo if it helped you manage your LinkedIn connections!**
