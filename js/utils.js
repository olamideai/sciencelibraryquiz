// Utility Functions
const utils = {
    // Formatting
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString();
    },

    // UI Helpers
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    showLoading(show = true) {
        const overlay = document.getElementById('loading-overlay');
        if (show) overlay.classList.remove('hidden');
        else overlay.classList.add('hidden');
    },

    // Effects
    createConfetti() {
        const colors = ['#f8fafc', '#3b82f6', '#22c55e', '#ef4444', '#ffd700'];
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 4000);
        }
    },

    screenFlash() {
        const flash = document.createElement('div');
        flash.className = 'screen-flash';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 500);
    },

    // Calculation
    calculateRank(quizzes) {
        if (quizzes >= 100) return { name: 'Legend', badge: '👑', theme: 'theme-legend' };
        if (quizzes >= 50) return { name: 'Master', badge: '🏆', theme: 'theme-master' };
        if (quizzes >= 20) return { name: 'Expert', badge: '🏅', theme: 'theme-expert' };
        if (quizzes >= 10) return { name: 'Scholar', badge: '⭐⭐⭐', theme: 'theme-scholar' };
        if (quizzes >= 5) return { name: 'Explorer', badge: '⭐⭐', theme: 'theme-explorer' };
        return { name: 'Novice', badge: '⭐', theme: 'theme-novice' };
    },

    // Validation
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    // Array manipulation
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    // Local storage helpers
    storage: {
        set(key, value) { localStorage.setItem(`slq_${key}`, JSON.stringify(value)); },
        get(key) { return JSON.parse(localStorage.getItem(`slq_${key}`)); },
        remove(key) { localStorage.removeItem(`slq_${key}`); }
    }
};

window.utils = utils;
