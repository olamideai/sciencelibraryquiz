// Main Application Router
const app = {
    currentSection: 'auth',
    sections: [
        'auth', 'verify', 'legend-entrance', 'home', 'quiz-setup', 
        'quiz', 'results', 'review', 'profile', 'achievements', 
        'friends', 'leaderboard', 'admin'
    ],

    // Initialize App
    init() {
        // Hash Routing Listener
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.replace('#', '');
            if (hash && this.sections.includes(hash)) {
                this.navigate(hash, false);
            }
        });

        // Initial Route
        const hash = window.location.hash.replace('#', '');
        if (hash && this.sections.includes(hash)) {
            this.navigate(hash, false);
        } else {
            this.navigate('auth');
        }

        // Initialize Auth
        authModule.init();
    },

    // SPA Navigation
    navigate(section, updateHash = true) {
        // Hide All Sections
        this.sections.forEach(s => {
            const el = document.getElementById(`${s}-section`) || document.getElementById(s);
            if (el) el.classList.add('hidden');
        });

        // Show Target Section
        const target = document.getElementById(`${section}-section`) || document.getElementById(section);
        if (target) {
            target.classList.remove('hidden');
            target.classList.add('active');
        }

        // Update Nav Link Active State
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('onclick')?.includes(section)) {
                link.classList.add('active');
            }
        });

        // Navigation Bar Logic
        const nav = document.getElementById('main-nav');
        const noNavSections = ['auth', 'verify', 'legend-entrance', 'quiz'];
        
        if (noNavSections.includes(section)) {
            nav.classList.add('hidden');
        } else {
            nav.classList.remove('hidden');
        }

        // Update Hash
        if (updateHash) {
            window.location.hash = section;
        }

        this.currentSection = section;

        // Section Specific Initialization
        this.initSection(section);
    },

    // Init Specific Content
    initSection(section) {
        switch(section) {
            case 'home':
                this.loadHome();
                break;
            case 'profile':
                user.loadProfile();
                break;
            case 'achievements':
                achievements.load();
                break;
            case 'friends':
                friends.load();
                break;
            case 'leaderboard':
                leaderboard.load();
                break;
            case 'admin':
                admin.load();
                break;
        }
    },

    // Load Home Content
    async loadHome() {
        if (!authModule.userData) return;

        const data = authModule.userData;
        const rank = utils.calculateRank(data.totalQuizzes || 0);

        // UI Updates
        document.getElementById('welcome-name').textContent = `Welcome back, ${data.name}!`;
        document.getElementById('rank-badge').textContent = `${rank.badge} ${rank.name}`;
        document.getElementById('total-quizzes').textContent = data.totalQuizzes || 0;
        document.getElementById('total-points').textContent = data.totalPoints || 0;
        document.getElementById('current-streak').textContent = `${data.currentStreak || 0} 🔥`;
        document.getElementById('nav-streak').textContent = `🔥 ${data.currentStreak || 0}`;
        document.getElementById('nav-points').textContent = `⭐ ${data.totalPoints || 0}`;

        // Load Subject Cards
        this.loadHomeSubjects();

        // Apply Global Rank Theme
        document.body.className = rank.theme;
    },

    // Load Subject Cards
    async loadHomeSubjects() {
        const container = document.getElementById('home-subjects');
        container.innerHTML = '';

        const subjects = ['mathematics', 'chemistry', 'physics', 'biology', 'astronomy'];
        
        for (const subject of subjects) {
            try {
                const doc = await collections.subjectSettings.doc(subject).get();
                const settings = doc.data() || { locked: false };
                
                const card = document.createElement('div');
                card.className = `subject-card ${settings.locked ? 'locked' : ''}`;
                card.innerHTML = `
                    <img src="images/${subject}.png" alt="${subject}">
                    <span>${subject.charAt(0).toUpperCase() + subject.slice(1)}</span>
                    ${settings.locked ? '🔒' : ''}
                `;
                
                if (!settings.locked) {
                    card.onclick = () => {
                        quiz.selectSubject(subject);
                        this.navigate('quiz-setup');
                    };
                }
                
                container.appendChild(card);
            } catch (error) {
                console.error(`Error loading ${subject}:`, error);
            }
        }
    },

    // Signup form toggle
    showSignup() {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('signup-form').classList.remove('hidden');
    },

    // Login form toggle
    showLogin() {
        document.getElementById('signup-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
    },

    // Legend entrance logic
    enterApp() {
        utils.storage.set('legend_seen', true);
        utils.createConfetti();
        this.navigate('home');
    },

    // Navigation bar visibility update
    updateNav() {
        if (!authModule.userData) return;
        const adminLink = document.getElementById('admin-link');
        if (authModule.userData.isAdmin) {
            adminLink.classList.remove('hidden');
        } else {
            adminLink.classList.add('hidden');
        }
    }
};

// Modal helper
const modal = {
    open(id) { document.getElementById(id).classList.remove('hidden'); },
    close(id) { document.getElementById(id).classList.add('hidden'); }
};

window.app = app;
window.modal = modal;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
