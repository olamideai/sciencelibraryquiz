// Theme Management Module
const themes = {
    // Rank-based theme mapping
    rankThemes: {
        'Novice': { color: '#94a3b8', badge: '⭐', effect: 'none' },
        'Explorer': { color: '#22c55e', badge: '⭐⭐', effect: 'green-glow' },
        'Scholar': { color: '#3b82f6', badge: '⭐⭐⭐', effect: 'blue-glow' },
        'Expert': { color: '#a855f7', badge: '🏅', effect: 'purple-glow' },
        'Master': { color: '#ffd700', badge: '🏆', effect: 'gold-shimmer' },
        'Legend': { color: 'rainbow', badge: '👑', effect: 'legend-rainbow' }
    },

    // Apply Global Theme based on rank
    applyGlobal(rank) {
        const theme = this.rankThemes[rank];
        if (theme) {
            document.body.className = `theme-${rank.toLowerCase()}`;
            this.updateIcons(theme.color);
        }
    },

    // Change Theme Mode
    async changeMode(mode) {
        await collections.users.doc(authModule.currentUser.uid).update({
            'settings.theme': mode
        });

        // Immediate UI Update
        if (mode === 'light') {
            document.documentElement.style.setProperty('--bg-primary', '#f1f5f9');
            document.documentElement.style.setProperty('--bg-secondary', '#e2e8f0');
            document.documentElement.style.setProperty('--text-primary', '#0f172a');
        } else if (mode === 'dark') {
            document.documentElement.style.setProperty('--bg-primary', '#0f172a');
            document.documentElement.style.setProperty('--bg-secondary', '#1e293b');
            document.documentElement.style.setProperty('--text-primary', '#f8fafc');
        }
    },

    // Update Favicon Color based on rank
    updateIcons(color) {
        // SVG Icon processing
    }
};

window.themes = themes;
