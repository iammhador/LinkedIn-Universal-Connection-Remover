// Enhanced LinkedIn Universal Connection Remover
// Features: Tab-switch detection, user input, faster processing, progress persistence

(function() {
    const CONFIG = {
        defaultRemovals: 50,    // Default number of connections to remove
        minDelay: 2000,         // Faster minimum delay (2s)
        maxDelay: 4000,         // Faster maximum delay (4s)
        maxRetries: 3,
        scrollDelay: 2000,      // Faster scrolling
        menuWaitTime: 2000,     // Faster menu wait
        confirmWaitTime: 1500,  // Faster confirmation wait
        tabCheckInterval: 5000, // Check tab visibility every 5 seconds
        maxNoButtonsRetries: 5  // Maximum retries when no buttons found
    };

    let isRunning = false;
    let removedCount = 0;
    let failedCount = 0;
    let targetCount = CONFIG.defaultRemovals;
    let tabSwitchPaused = false;
    let visibilityCheckInterval = null;
    let lastActivity = Date.now();

    // Tab visibility detection
    function isTabVisible() {
        return !document.hidden && document.visibilityState === 'visible';
    }

    // Monitor tab visibility
    function startVisibilityMonitoring() {
        document.addEventListener('visibilitychange', handleVisibilityChange);
        visibilityCheckInterval = setInterval(checkTabStatus, CONFIG.tabCheckInterval);
        console.log('👁️ Tab visibility monitoring started');
    }

    function stopVisibilityMonitoring() {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (visibilityCheckInterval) {
            clearInterval(visibilityCheckInterval);
            visibilityCheckInterval = null;
        }
        console.log('👁️ Tab visibility monitoring stopped');
    }

    function handleVisibilityChange() {
        if (isRunning) {
            if (isTabVisible()) {
                if (tabSwitchPaused) {
                    tabSwitchPaused = false;
                    console.log('👀 Tab is now visible - resuming process...');
                }
                lastActivity = Date.now();
            } else {
                tabSwitchPaused = true;
                console.log('🔄 Tab switched or minimized - pausing process...');
            }
        }
    }

    function checkTabStatus() {
        if (isRunning && !isTabVisible()) {
            tabSwitchPaused = true;
            console.log('⏸️ Process paused due to tab visibility');
        }
    }

    // Wait for tab to be visible
    async function waitForTabVisible() {
        while (!isTabVisible() && isRunning) {
            tabSwitchPaused = true;
            console.log('⏳ Waiting for tab to be visible...');
            await sleep(2000);
        }
        tabSwitchPaused = false;
    }

    // Enhanced sleep function with tab monitoring
    function sleep(ms) {
        return new Promise(resolve => {
            const startTime = Date.now();
            const checkVisibility = () => {
                if (!isRunning) {
                    resolve();
                    return;
                }
                
                if (isTabVisible()) {
                    const elapsed = Date.now() - startTime;
                    if (elapsed >= ms) {
                        resolve();
                    } else {
                        setTimeout(checkVisibility, Math.min(500, ms - elapsed));
                    }
                } else {
                    // Tab not visible, wait longer
                    setTimeout(checkVisibility, 1000);
                }
            };
            checkVisibility();
        });
    }

    function getRandomDelay() {
        return Math.floor(Math.random() * (CONFIG.maxDelay - CONFIG.minDelay + 1)) + CONFIG.minDelay;
    }

    // Get user input for number of connections
    function getUserInput() {
        const userInput = prompt(
            `LinkedIn Connection Remover\n\n` +
            `How many connections would you like to remove?\n` +
            `(Default: ${CONFIG.defaultRemovals}, Max recommended: 500 per session)\n\n` +
            `Enter a number:`
        );

        if (userInput === null) {
            console.log('❌ Process cancelled by user');
            return null;
        }

        const count = parseInt(userInput.trim()) || CONFIG.defaultRemovals;
        
        if (count <= 0) {
            console.log('❌ Invalid number. Using default:', CONFIG.defaultRemovals);
            return CONFIG.defaultRemovals;
        }

        if (count > 1000) {
            const confirm = window.confirm(
                `You've requested ${count} removals. This is a large number and may take several hours.\n\n` +
                `Recommendations:\n` +
                `• Keep the LinkedIn tab active\n` +
                `• Don't use your computer heavily during the process\n` +
                `• Consider running smaller batches (100-500)\n\n` +
                `Do you want to continue?`
            );
            
            if (!confirm) {
                console.log('❌ Process cancelled by user');
                return null;
            }
        }

        console.log(`🎯 Target set: ${count} connections`);
        return count;
    }

    // Enhanced button finding with better performance
    function findAllPotentialMenuButtons() {
        const selectors = [
            '.mn-connection-card__dropdown-trigger',
            '.artdeco-dropdown__trigger',
            'button[aria-expanded="false"]',
            'button[aria-haspopup="true"]',
            'button[data-control-name*="dropdown"]',
            'button[data-control-name*="more"]',
            'button[aria-label*="More"]',
            'button[aria-label*="actions"]',
            '.mn-connection-card button',
            '[data-test-component="connection-card"] button',
            // Additional selectors for better detection
            'button[data-artdeco-dropdown-trigger="true"]',
            'button.artdeco-dropdown__trigger--placement-bottom',
            'button svg[viewBox="0 0 16 16"]',
        ];

        let allButtons = new Set();
        
        for (const selector of selectors) {
            try {
                const buttons = document.querySelectorAll(selector);
                buttons.forEach(btn => allButtons.add(btn));
            } catch (e) {
                // Skip invalid selectors
            }
        }

        // Filter and prioritize buttons
        const validButtons = Array.from(allButtons).filter(btn => {
            const rect = btn.getBoundingClientRect();
            const isVisible = btn.offsetParent !== null && 
                             !btn.disabled && 
                             rect.width > 0 && 
                             rect.height > 0 &&
                             rect.width < 100 && 
                             rect.height < 100;
            
            // Prioritize buttons that are likely connection menu buttons
            const hasConnectionContext = btn.closest('.mn-connection-card') || 
                                       btn.closest('[data-test-component="connection-card"]') ||
                                       btn.getAttribute('aria-label')?.toLowerCase().includes('more');
            
            return isVisible && hasConnectionContext;
        });

        // Sort by vertical position (top to bottom)
        validButtons.sort((a, b) => {
            const rectA = a.getBoundingClientRect();
            const rectB = b.getBoundingClientRect();
            return rectA.top - rectB.top;
        });

        return validButtons.slice(0, 10); // Process up to 10 at a time
    }

    // Enhanced remove option finding
    function findRemoveOption() {
        // Method 1: Direct text match (fastest)
        const directMatches = Array.from(document.querySelectorAll('*')).filter(el => {
            return el.offsetParent !== null && 
                   el.textContent?.trim() === 'Remove connection' &&
                   (el.tagName === 'BUTTON' || el.getAttribute('role') === 'button' || el.closest('button'));
        });

        if (directMatches.length > 0) {
            console.log('✅ Found remove option (direct match)');
            return directMatches[0].closest('button') || directMatches[0];
        }

        // Method 2: Text contains "remove" (case insensitive)
        const removeElements = Array.from(document.querySelectorAll('button, [role="button"], a')).filter(el => {
            return el.offsetParent !== null && 
                   el.textContent &&
                   el.textContent.toLowerCase().includes('remove connection');
        });

        if (removeElements.length > 0) {
            console.log('✅ Found remove option (text search)');
            return removeElements[0];
        }

        // Method 3: Look for trash icons with remove context
        const trashIcons = document.querySelectorAll('svg[data-test-icon*="trash"], svg[aria-label*="remove" i]');
        for (const icon of trashIcons) {
            if (icon.offsetParent !== null) {
                const button = icon.closest('button') || icon.closest('[role="button"]');
                if (button && button.textContent?.toLowerCase().includes('remove')) {
                    console.log('✅ Found remove option (icon)');
                    return button;
                }
            }
        }

        return null;
    }

    // Enhanced click function
    async function smartClick(element) {
        if (!element) return false;

        try {
            // Ensure element is in viewport
            element.scrollIntoView({ behavior: 'instant', block: 'nearest' });
            await sleep(300);

            // Try native click first
            if (element.click && typeof element.click === 'function') {
                element.click();
                lastActivity = Date.now();
                return true;
            }

            // Fallback to event dispatch
            const event = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            
            element.dispatchEvent(event);
            lastActivity = Date.now();
            return true;

        } catch (error) {
            console.log('❌ Click failed:', error.message);
            return false;
        }
    }

    async function attemptConnectionRemoval(menuButton) {
        try {
            await waitForTabVisible();
            
            console.log('🖱️ Processing connection...');
            
            // Scroll to element
            menuButton.scrollIntoView({ behavior: 'instant', block: 'center' });
            await sleep(800);

            // Click menu button
            const menuClicked = await smartClick(menuButton);
            if (!menuClicked) {
                console.log('❌ Failed to click menu button');
                return false;
            }

            await sleep(CONFIG.menuWaitTime);

            // Find remove option
            const removeOption = findRemoveOption();
            if (!removeOption) {
                console.log('❌ Remove option not found');
                document.body.click(); // Close menu
                return false;
            }

            // Click remove option
            const removeClicked = await smartClick(removeOption);
            if (!removeClicked) {
                console.log('❌ Failed to click remove option');
                return false;
            }

            await sleep(CONFIG.confirmWaitTime);

            // Find and click confirmation
            const confirmButtons = Array.from(document.querySelectorAll('button, [role="button"]'))
                .filter(btn => {
                    return btn.offsetParent !== null && 
                           btn.textContent &&
                           (btn.textContent.toLowerCase().includes('remove') ||
                            btn.textContent.toLowerCase().includes('confirm') ||
                            btn.textContent.toLowerCase() === 'yes');
                });

            if (confirmButtons.length > 0) {
                await smartClick(confirmButtons[0]);
                await sleep(1000);
                
                removedCount++;
                console.log(`✅ SUCCESS! Removed connection ${removedCount}/${targetCount}`);
                
                // Show progress every 10 removals
                if (removedCount % 10 === 0) {
                    const percentage = Math.round((removedCount / targetCount) * 100);
                    console.log(`📊 Progress: ${percentage}% complete (${removedCount}/${targetCount})`);
                }
                
                return true;
            } else {
                console.log('❌ Confirmation button not found');
            }

            return false;

        } catch (error) {
            console.log('❌ Error during removal:', error.message);
            return false;
        } finally {
            // Clean up any open menus
            document.body.click();
        }
    }

    async function startRemoving() {
        if (isRunning) {
            console.log('⚠️ Already running! Use stopUniversalRemover() to stop.');
            return;
        }

        // Get user input
        targetCount = getUserInput();
        if (targetCount === null) return;

        console.log('\n🚀 Enhanced LinkedIn Connection Remover v2.0');
        console.log(`🎯 Target: ${targetCount} connections`);
        console.log(`⏱️ Delays: ${CONFIG.minDelay/1000}s - ${CONFIG.maxDelay/1000}s`);
        console.log('🔄 Tab-switch detection enabled');
        console.log('⚡ Faster processing enabled\n');

        isRunning = true;
        removedCount = 0;
        failedCount = 0;
        tabSwitchPaused = false;

        startVisibilityMonitoring();

        let noButtonsCount = 0;
        const startTime = Date.now();

        try {
            while (removedCount < targetCount && isRunning) {
                await waitForTabVisible();
                
                const buttons = findAllPotentialMenuButtons();

                if (buttons.length === 0) {
                    noButtonsCount++;
                    console.log(`🔍 No buttons found (${noButtonsCount}/${CONFIG.maxNoButtonsRetries}). Scrolling...`);
                    
                    if (noButtonsCount >= CONFIG.maxNoButtonsRetries) {
                        console.log('❌ Maximum scroll attempts reached. No more connections found.');
                        break;
                    }
                    
                    window.scrollBy(0, 1000);
                    await sleep(CONFIG.scrollDelay);
                    continue;
                }

                noButtonsCount = 0;

                // Process buttons
                for (const button of buttons) {
                    if (removedCount >= targetCount || !isRunning) break;
                    
                    await waitForTabVisible();
                    
                    const success = await attemptConnectionRemoval(button);
                    
                    if (!success) {
                        failedCount++;
                    }

                    // Delay between attempts
                    if (removedCount < targetCount && isRunning) {
                        const delay = getRandomDelay();
                        await sleep(delay);
                    }
                }

                // Scroll for more connections
                if (removedCount < targetCount && isRunning) {
                    window.scrollBy(0, 600);
                    await sleep(CONFIG.scrollDelay);
                }
            }
        } finally {
            stopVisibilityMonitoring();
        }

        // Final results
        const endTime = Date.now();
        const duration = Math.round((endTime - startTime) / 1000 / 60);
        
        isRunning = false;
        console.log(`\n🏁 FINAL RESULTS:`);
        console.log(`✅ Successfully removed: ${removedCount}/${targetCount}`);
        console.log(`❌ Failed attempts: ${failedCount}`);
        console.log(`⏱️ Total time: ${duration} minutes`);
        console.log(`📊 Success rate: ${removedCount + failedCount > 0 ? Math.round((removedCount/(removedCount + failedCount)) * 100) : 0}%`);
        
        if (removedCount > 0) {
            const rate = Math.round(removedCount / duration);
            console.log(`⚡ Average rate: ${rate} connections per minute`);
        }

        if (removedCount >= targetCount) {
            console.log(`\n🎉 Mission accomplished! All ${targetCount} connections processed.`);
        }
    }

    function stopRemoving() {
        if (isRunning) {
            isRunning = false;
            stopVisibilityMonitoring();
            console.log('⏹️ Process stopped by user');
            console.log(`📊 Removed ${removedCount} connections before stopping`);
        } else {
            console.log('ℹ️ Process is not currently running');
        }
    }

    function showStatus() {
        console.log('\n📊 Current Status:');
        console.log(`Running: ${isRunning ? '✅' : '❌'}`);
        console.log(`Removed: ${removedCount}/${targetCount}`);
        console.log(`Failed: ${failedCount}`);
        console.log(`Tab visible: ${isTabVisible() ? '✅' : '❌'}`);
        console.log(`Tab paused: ${tabSwitchPaused ? '⏸️' : '▶️'}`);
    }

    // Enhanced start function with optional parameter
    async function startRemovingWithCount(count) {
        if (isRunning) {
            console.log('⚠️ Already running! Use stopUniversalRemover() to stop.');
            return;
        }

        // Use provided count or get user input
        if (count !== undefined && count !== null) {
            if (typeof count !== 'number' || count <= 0) {
                console.log('❌ Invalid count provided. Must be a positive number.');
                return;
            }
            targetCount = count;
            console.log(`🎯 Using provided target: ${count} connections`);
        } else {
            targetCount = getUserInput();
            if (targetCount === null) return;
        }

        // Rest of the start logic...
        console.log('\n🚀 Enhanced LinkedIn Connection Remover v2.0');
        console.log(`🎯 Target: ${targetCount} connections`);
        console.log(`⏱️ Delays: ${CONFIG.minDelay/1000}s - ${CONFIG.maxDelay/1000}s`);
        console.log('🔄 Tab-switch detection enabled');
        console.log('⚡ Faster processing enabled\n');

        isRunning = true;
        removedCount = 0;
        failedCount = 0;
        tabSwitchPaused = false;

        startVisibilityMonitoring();

        let noButtonsCount = 0;
        const startTime = Date.now();

        try {
            while (removedCount < targetCount && isRunning) {
                await waitForTabVisible();
                
                const buttons = findAllPotentialMenuButtons();

                if (buttons.length === 0) {
                    noButtonsCount++;
                    console.log(`🔍 No buttons found (${noButtonsCount}/${CONFIG.maxNoButtonsRetries}). Scrolling...`);
                    
                    if (noButtonsCount >= CONFIG.maxNoButtonsRetries) {
                        console.log('❌ Maximum scroll attempts reached. No more connections found.');
                        break;
                    }
                    
                    window.scrollBy(0, 1000);
                    await sleep(CONFIG.scrollDelay);
                    continue;
                }

                noButtonsCount = 0;

                // Process buttons
                for (const button of buttons) {
                    if (removedCount >= targetCount || !isRunning) break;
                    
                    await waitForTabVisible();
                    
                    const success = await attemptConnectionRemoval(button);
                    
                    if (!success) {
                        failedCount++;
                    }

                    // Delay between attempts
                    if (removedCount < targetCount && isRunning) {
                        const delay = getRandomDelay();
                        await sleep(delay);
                    }
                }

                // Scroll for more connections
                if (removedCount < targetCount && isRunning) {
                    window.scrollBy(0, 600);
                    await sleep(CONFIG.scrollDelay);
                }
            }
        } finally {
            stopVisibilityMonitoring();
        }

        // Final results
        const endTime = Date.now();
        const duration = Math.round((endTime - startTime) / 1000 / 60);
        
        isRunning = false;
        console.log(`\n🏁 FINAL RESULTS:`);
        console.log(`✅ Successfully removed: ${removedCount}/${targetCount}`);
        console.log(`❌ Failed attempts: ${failedCount}`);
        console.log(`⏱️ Total time: ${duration} minutes`);
        console.log(`📊 Success rate: ${removedCount + failedCount > 0 ? Math.round((removedCount/(removedCount + failedCount)) * 100) : 0}%`);
        
        if (removedCount > 0) {
            const rate = Math.round(removedCount / duration);
            console.log(`⚡ Average rate: ${rate} connections per minute`);
        }

        if (removedCount >= targetCount) {
            console.log(`\n🎉 Mission accomplished! All ${targetCount} connections processed.`);
        }
    }

    // Configuration function
    function configureRemover(options = {}) {
        if (options.minDelay) CONFIG.minDelay = Math.max(1000, options.minDelay);
        if (options.maxDelay) CONFIG.maxDelay = Math.max(CONFIG.minDelay, options.maxDelay);
        if (options.defaultRemovals) CONFIG.defaultRemovals = Math.max(1, options.defaultRemovals);
        if (options.maxRetries) CONFIG.maxRetries = Math.max(1, options.maxRetries);
        
        console.log('⚙️ Configuration updated:', CONFIG);
        return CONFIG;
    }

    // Batch processing function
    async function startBatchRemoval(batches) {
        if (!Array.isArray(batches) || batches.length === 0) {
            console.log('❌ Invalid batches array. Provide array of numbers, e.g., [50, 100, 75]');
            return;
        }

        console.log(`📦 Starting batch removal: ${batches.length} batches`);
        console.log(`📊 Total target: ${batches.reduce((a, b) => a + b, 0)} connections`);

        for (let i = 0; i < batches.length; i++) {
            console.log(`\n📦 Starting batch ${i + 1}/${batches.length} - Target: ${batches[i]}`);
            
            await startRemovingWithCount(batches[i]);
            
            if (!isRunning) {
                console.log('⏹️ Batch processing stopped by user');
                break;
            }

            // Wait between batches
            if (i < batches.length - 1) {
                console.log('⏳ Waiting 30 seconds before next batch...');
                await sleep(30000);
            }
        }

        console.log(`\n🏁 All batches completed!`);
    }

    // Global functions
    window.startUniversalRemover = startRemoving; // Original with prompt
    window.startRemover = startRemovingWithCount; // New with parameter
    window.stopUniversalRemover = stopRemoving;
    window.showRemoverStatus = showStatus;
    window.configureRemover = configureRemover;
    window.startBatchRemoval = startBatchRemoval;

    console.log('🌟 Enhanced LinkedIn Connection Remover v2.0 loaded!');
    console.log('🔧 Commands:');
    console.log('   startUniversalRemover() - Start removal (with user input)');
    console.log('   stopUniversalRemover() - Stop process');
    console.log('   showRemoverStatus() - Show current status');
    console.log('\n✨ New Features:');
    console.log('   • Tab-switch detection & auto-pause');
    console.log('   • User input for removal count');
    console.log('   • Faster processing (2-4s delays)');
    console.log('   • Better progress tracking');
    console.log('   • Enhanced error handling');
    console.log('\n🚀 Ready! Run startUniversalRemover() to begin');
})();
