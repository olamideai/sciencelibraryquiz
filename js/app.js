// Main Application Router
const app = {
    currentSection: 'auth',
    sections: [
        'auth', 'verify', 'legend-entrance', 'home', 'quiz-setup', 
        'quiz', 'results', 'review', 'profile', 'achievements', 
        'friends', 'leaderboard', 'admin'
    ],

    // Initialize app
    init() {
        // Check for hash route
        const hash = window.location.hash.replace('#', '');
        if (hash && this.sections.includes(hash)) {
            this.navigate(hash, false);
        }
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.replace('#', '');
            if (hash && this.sections.includes(hash)) {
                this.navigate(hash, false);
            }
        });

        // Initialize auth
        auth.init();
    },

    // Navigate to section
    navigate(section, updateHash = true) {
        // Hide all sections
        this.sections.forEach(s => {
            const el = document.getElementById(`${s}-section`) || 
                      document.getElementById(s);
            if (el) el.classList.add('hidden');
        });

        // Show target section
        const target = document.getElementById(`${section}-section`) || 
                      document.getElementById(section);
        if (target) {
            target.classList.remove('hidden');
            target.classList.add('active');
        }

        // Update nav active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('onclick')?.includes(section)) {
                link.classList.add('active');
            }
        });

        // Show/hide nav based on section
        const nav = document.getElementById('main-nav');
        const noNavSections = ['auth', 'verify', 'legend-entrance', 'quiz'];
        
        if (noNavSections.includes(section)) {
            nav.classList.add('hidden');
        } else {
            nav.classList.remove('hidden');
        }

        // Update hash
        if (updateHash) {
            window.location.hash = section;
        }

        this.currentSection = section;

        // Section-specific initialization
        this.initSection(section);
    },

    // Initialize section-specific content
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

    // Load home content
    async loadHome() {
        if (!auth.userData) return;

        const data = auth.userData;
        const rank = utils.calculateRank(data.totalQuizzes || 0);

        // Update stats
        document.getElementById('welcome-name').textContent = `Welcome, ${data.name}!`;
        document.getElementById('rank-badge').textContent = `${rank.badge} ${rank.name}`;
        document.getElementById('total-quizzes').textContent = data.totalQuizzes || 0;
        document.getElementById('total-points').textContent = data.totalPoints || 0;
        document.getElementById('current-streak').textContent = `${data.currentStreak || 0} 🔥`;
        document.getElementById('nav-streak').textContent = `🔥 ${data.currentStreak || 0}`;
        document.getElementById('nav-points').textContent = `⭐ ${data.totalPoints || 0}`;

        // Calculate average score
        this.loadAverageScore();

        // Load subjects
        this.loadHomeSubjects();

        // Apply theme
        document.body.className = rank.theme;
    },

    // Calculate and display average score
    async loadAverageScore() {
        try {
            const snapshot = await collections.scores
                .where('userId', '==', auth.currentUser.uid)
                .get();
            
            if (snapshot.empty) {
                document.getElementById('avg-score').textContent = '0%';
                return;
            }

            let total = 0;
            snapshot.forEach(doc => {
                total += doc.data().score;
            });
            
            const avg = Math.round(total / snapshot.size);
            document.getElementById('avg-score').textContent = `${avg}%`;
        } catch (error) {
            console.error('Error loading average:', error);
        }
    },

    // Load subjects on home
    async loadHomeSubjects() {
        const container = document.getElementById('home-subjects');
        container.innerHTML = '';

        const subjects = ['mathematics', 'chemistry', 'physics', 'biology', 'agriculture', 'computer', 'furthermath'];
        
        for (const subject of subjects) {
            try {
                const doc = await collections.subjectSettings.doc(subject).get();
                const settings = doc.data() || { locked: false };
                
                const card = document.createElement('div');
                card.className = `subject-card ${settings.locked ? 'locked' : ''}`;
                card.innerHTML = `
                    <img src="images/${subject}.png" alt="${utils.getSubjectName(subject)}">
                    <span>${utils.getSubjectName(subject)}</span>
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
                console.error(`Error loading subject ${subject}:`, error);
            }
        }
    },

    // Show signup form
    showSignup() {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('signup-form').classList.remove('hidden');
    },

    // Show login form
    showLogin() {
        document.getElementById('signup-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
    },

    // Enter app from legend entrance
    enterApp() {
        utils.storage.set('legend_seen', true);
        utils.createConfetti();
        this.navigate('home');
    },

    // Update navigation based on user
    updateNav() {
        if (!auth.userData) return;
        
        // Show admin link if user is admin
        const adminLink = document.getElementById('admin-link');
        if (auth.userData.isAdmin) {
            adminLink.classList.remove('hidden');
        } else {
            adminLink.classList.add('hidden');
        }
    }
};

// Modal helper
const modal = {
    open(id) {
        document.getElementById(id).classList.remove('hidden');
    },
    
    close(id) {
        document.getElementById(id).classList.add('hidden');
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

