// Utility functions
const utils = {
    // Format time (seconds to MM:SS)
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    // Format date
    formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    },

    // Format relative time
    timeAgo(timestamp) {
        if (!timestamp) return 'Never';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const seconds = Math.floor((new Date() - date) / 1000);
        
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };
        
        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }
        return 'Just now';
    },

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Shuffle array (Fisher-Yates)
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    // Calculate rank based on quiz count
    calculateRank(totalQuizzes) {
        if (totalQuizzes >= 100) return { name: 'Legend', badge: '👑', theme: 'theme-legend' };
        if (totalQuizzes >= 50) return { name: 'Master', badge: '🏆', theme: 'theme-master' };
        if (totalQuizzes >= 20) return { name: 'Expert', badge: '🏅', theme: 'theme-expert' };
        if (totalQuizzes >= 10) return { name: 'Scholar', badge: '⭐⭐⭐', theme: 'theme-scholar' };
        if (totalQuizzes >= 5) return { name: 'Explorer', badge: '⭐⭐', theme: 'theme-explorer' };
        return { name: 'Novice', badge: '⭐', theme: 'theme-novice' };
    },

    // Calculate level from quiz count
    calculateLevel(totalQuizzes) {
        if (totalQuizzes >= 100) return 'Legend';
        if (totalQuizzes >= 50) return 'Master';
        if (totalQuizzes >= 20) return 'Expert';
        if (totalQuizzes >= 10) return 'Scholar';
        if (totalQuizzes >= 5) return 'Explorer';
        return 'Novice';
    },

    // Check streak status
    checkStreak(lastQuizDate) {
        if (!lastQuizDate) return { active: false, days: 0 };
        
        const lastDate = lastQuizDate.toDate ? lastQuizDate.toDate() : new Date(lastQuizDate);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Reset time to midnight for comparison
        lastDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        yesterday.setHours(0, 0, 0, 0);
        
        const diffTime = today - lastDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return { active: true, days: 0, canExtend: false }; // Already played today
        if (diffDays === 1) return { active: true, days: 1, canExtend: true }; // Can extend streak
        return { active: false, days: diffDays, canExtend: false }; // Streak broken
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Deep clone
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // Validate email
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    // Show toast notification
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    // Show loading
    showLoading(show = true) {
        const overlay = document.getElementById('loading-overlay');
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    },

    // Create confetti effect
    createConfetti() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            confetti.style.animationDelay = Math.random() * 2 + 's';
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 4000);
        }
    },

    // Screen flash effect
    screenFlash() {
        const flash = document.createElement('div');
        flash.className = 'screen-flash';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 500);
    },

    // Add ripple effect to button
    addRipple(event, button) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = event.clientX - rect.left - size / 2 + 'px';
        ripple.style.top = event.clientY - rect.top - size / 2 + 'px';
        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    },

    // Local storage helpers
    storage: {
        set(key, value) {
            localStorage.setItem(`slq_${key}`, JSON.stringify(value));
        },
        get(key, defaultValue = null) {
            const item = localStorage.getItem(`slq_${key}`);
            return item ? JSON.parse(item) : defaultValue;
        },
        remove(key) {
            localStorage.removeItem(`slq_${key}`);
        }
    },

    // Subject display names
    subjectNames: {
        mathematics: 'Mathematics',
        chemistry: 'Chemistry',
        physics: 'Physics',
        biology: 'Biology',
        agriculture: 'Agriculture Science',
        computer: 'Computer',
        furthermath: 'Further Mathematics'
    },

    // Get subject display name
    getSubjectName(subject) {
        return this.subjectNames[subject] || subject;
    }
};

// Make utils globally available
window.utils = utils;
