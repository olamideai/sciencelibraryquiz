// User Profile Module
const user = {
    // Load profile data
    async loadProfile() {
        if (!authModule.userData) return;
        
        const data = authModule.userData;
        const rank = utils.calculateRank(data.totalQuizzes || 0);

        document.getElementById('profile-name').textContent = data.name;
        document.getElementById('profile-regid').textContent = data.regId;
        document.getElementById('profile-rank').textContent = `${rank.badge} ${rank.name}`;
        document.getElementById('profile-points').textContent = data.totalPoints || 0;
        document.getElementById('profile-quizzes').textContent = data.totalQuizzes || 0;

        // Load recent history
        this.loadHistory();
    },

    // Load quiz history
    async loadHistory() {
        const container = document.getElementById('history-list');
        container.innerHTML = '';
        
        try {
            const snapshot = await collections.scores
                .where('userId', '==', authModule.currentUser.uid)
                .orderBy('completedAt', 'desc')
                .limit(10)
                .get();
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const el = document.createElement('div');
                el.className = 'history-item';
                el.innerHTML = `
                    <span>${data.subject} (${data.difficulty})</span>
                    <span>${data.score}%</span>
                    <span>${utils.formatDate(data.completedAt)}</span>
                `;
                container.appendChild(el);
            });
        } catch (error) {
            console.error('History load error:', error);
        }
    }
};

window.user = user;
