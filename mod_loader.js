// ============================================
// LUATOOLS MOD LOADER ENGINE
// Loads user mods from the mods/ directory
// without modifying core luatools.js
// ============================================

(function() {
    'use strict';

    // Global mod registry
    window.LuaToolsMods = {
        _mods: {},
        _hooks: {},
        version: '1.0.0',

        // Register a mod
        registerMod: function(modDef) {
            if (!modDef || !modDef.id) {
                console.warn('[ModLoader] Mod registration failed: missing id');
                return;
            }
            this._mods[modDef.id] = modDef;
            console.log('[ModLoader] Registered mod: ' + modDef.id + ' v' + (modDef.version || '?'));

            // Auto-register lifecycle hooks
            var hookNames = ['onOverlayOpen', 'onOverlayClose', 'onFixApplied', 
                           'onFixFailed', 'onGameDetected', 'onSettingsOpen',
                           'onDownloadStart', 'onDownloadComplete', 'onModsPanel'];
            for (var i = 0; i < hookNames.length; i++) {
                var hook = hookNames[i];
                if (typeof modDef[hook] === 'function') {
                    if (!this._hooks[hook]) this._hooks[hook] = [];
                    this._hooks[hook].push({ modId: modDef.id, fn: modDef[hook] });
                }
            }
        },

        // Fire a lifecycle hook
        fireHook: function(hookName, data) {
            var handlers = this._hooks[hookName] || [];
            for (var i = 0; i < handlers.length; i++) {
                try {
                    handlers[i].fn(data);
                } catch (err) {
                    console.error('[ModLoader] Error in ' + handlers[i].modId + '.' + hookName + ':', err);
                }
            }
        },

        // Get list of registered mods
        getMods: function() {
            return Object.keys(this._mods).map(function(id) { return this._mods[id]; }.bind(this));
        },

        // Check if a mod is registered
        hasMod: function(id) {
            return !!this._mods[id];
        },

        // Utility: inject CSS string
        injectCSS: function(id, cssText) {
            var existing = document.getElementById('ltmod-css-' + id);
            if (existing) existing.remove();
            var style = document.createElement('style');
            style.id = 'ltmod-css-' + id;
            style.textContent = cssText;
            document.head.appendChild(style);
        },

        // Utility: create a panel inside the LuaTools overlay
        createPanel: function(options) {
            var panel = document.createElement('div');
            panel.id = 'ltmod-panel-' + (options.id || 'unknown');
            panel.style.cssText = 'background:rgba(30,30,30,0.95);border:1px solid rgba(255,255,255,0.1);' +
                'border-radius:8px;padding:16px;margin-top:12px;';
            if (options.title) {
                var title = document.createElement('div');
                title.style.cssText = 'font-size:14px;font-weight:600;color:#fff;margin-bottom:8px;';
                title.textContent = options.title;
                panel.appendChild(title);
            }
            if (options.content) {
                var content = document.createElement('div');
                content.style.cssText = 'font-size:13px;color:#aaa;line-height:1.5;';
                if (typeof options.content === 'string') {
                    content.innerHTML = options.content;
                } else {
                    content.appendChild(options.content);
                }
                panel.appendChild(content);
            }
            return panel;
        },

        // Utility: show a toast notification
        showToast: function(message, durationMs) {
            var toast = document.createElement('div');
            toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#1a1a2e;color:#00ffff;' +
                'padding:12px 20px;border-radius:8px;border:1px solid #00ffff33;font-size:13px;z-index:99999;' +
                'box-shadow:0 4px 20px rgba(0,255,255,0.15);animation:ltmod-toast-in 0.3s ease;';
            toast.textContent = message;
            
            var style = document.createElement('style');
            style.textContent = '@keyframes ltmod-toast-in{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}' +
                '@keyframes ltmod-toast-out{from{opacity:1}to{opacity:0;transform:translateY(-10px)}}';
            document.head.appendChild(style);
            document.body.appendChild(toast);
            
            setTimeout(function() {
                toast.style.animation = 'ltmod-toast-out 0.3s ease forwards';
                setTimeout(function() { toast.remove(); style.remove(); }, 300);
            }, durationMs || 3000);
        },

        // Utility: add a button to the LuaTools overlay
        addOverlayButton: function(options) {
            return {
                label: options.label || 'Mod Button',
                icon: options.icon || 'fa-puzzle-piece',
                onClick: options.onClick || function() {},
                _modId: options.modId || 'unknown'
            };
        }
    };

    // Load mods from backend
    async function loadMods() {
        try {
            var modList = await Millennium.callServerMethod('luatools', 'GetModList', {});
            var mods = JSON.parse(modList);
            console.log('[ModLoader] Found ' + mods.length + ' mod(s) to load');

            for (var i = 0; i < mods.length; i++) {
                var mod = mods[i];
                if (!mod.enabled) {
                    console.log('[ModLoader] Skipping disabled mod: ' + mod.id);
                    continue;
                }

                try {
                    // Load CSS if present
                    if (mod.style) {
                        var cssContent = await Millennium.callServerMethod('luatools', 'GetModFile', {
                            mod_id: mod.id, filename: mod.style
                        });
                        if (cssContent) {
                            LuaToolsMods.injectCSS(mod.id, cssContent);
                        }
                    }

                    // Load JS
                    var jsContent = await Millennium.callServerMethod('luatools', 'GetModFile', {
                        mod_id: mod.id, filename: mod.main
                    });
                    if (jsContent) {
                        // Execute in isolated scope
                        var script = document.createElement('script');
                        script.textContent = '(function(){ try {' + jsContent + '} catch(e) { console.error("[ModLoader] Error loading ' + mod.id + ':", e); } })();';
                        script.dataset.modId = mod.id;
                        document.head.appendChild(script);
                    }
                } catch (err) {
                    console.error('[ModLoader] Failed to load mod ' + mod.id + ':', err);
                }
            }

            console.log('[ModLoader] All mods loaded. ' + Object.keys(LuaToolsMods._mods).length + ' registered.');
        } catch (err) {
            // Backend method not available = mod loader not installed on backend
            console.log('[ModLoader] Backend not available, skipping mod loading:', err.message || err);
        }
    }

    // Boot the mod loader after a short delay to let core LuaTools initialize
    setTimeout(loadMods, 500);
})();
