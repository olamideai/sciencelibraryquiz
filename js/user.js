// User profile module
const user = {
    // Load profile data
    async loadProfile() {
        if (!auth.userData) return;
        
        const data = auth.userData;
        const rank = utils.calculateRank(data.totalQuizzes || 0);
        
        // Basic info
        document.getElementById('profile-name').textContent = data.name;
        document.getElementById('profile-regid').textContent = data.regId;
        document.getElementById('profile-rank').textContent = `${rank.badge} ${rank.name}`;
        
        // Stats
        document.getElementById('profile-quizzes').textContent = data.totalQuizzes || 0;
        document.getElementById('profile-points').textContent = data.totalPoints || 0;
        document.getElementById('profile-streak').textContent = data.currentStreak || 0;
        document.getElementById('profile-best-streak').textContent = data.longestStreak || 0;
        
        // Load detailed stats
        await this.loadDetailedStats();
        
        // Load subject mastery
        await this.loadSubjectMastery();
        
        // Load quiz history
        await this.loadQuizHistory();
        
        // Load settings
        document.getElementById('theme-select').value = data.settings?.theme || 'dark';
    },

    // Load detailed statistics
    async loadDetailedStats() {
        try {
            const snapshot = await collections.scores
                .where('userId', '==', auth.currentUser.uid)
                .get();
            
            if (snapshot.empty) {
                document.getElementById('profile-avg').textContent = '0%';
                document.getElementById('profile-perfect').textContent = '0';
                return;
            }
            
            let totalScore = 0;
            let perfectScores = 0;
            
            snapshot.forEach(doc => {
                const score = doc.data().score;
                totalScore += score;
                if (score === 100) perfectScores++;
            });
            
            const avg = Math.round(totalScore / snapshot.size);
            document.getElementById('profile-avg').textContent = `${avg}%`;
            document.getElementById('profile-perfect').textContent = perfectScores;
            
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    },

    // Load subject mastery
    async loadSubjectMastery() {
        const container = document.getElementById('mastery-list');
        container.innerHTML = '';
        
        const subjects = ['mathematics', 'chemistry', 'physics', 'biology', 'agriculture', 'computer', 'furthermath'];
        
        for (const subject of subjects) {
            try {
                const snapshot = await collections.scores
                    .where('userId', '==', auth.currentUser.uid)
                    .where('subject', '==', subject)
                    .get();
                
                let totalScore = 0;
                let count = 0;
                
                snapshot.forEach(doc => {
                    totalScore += doc.data().score;
                    count++;
                });
                
                const avg = count > 0 ? Math.round(totalScore / count) : 0;
                
                const item = document.createElement('div');
                item.className = 'mastery-item';
                item.innerHTML = `
                    <span>${utils.getSubjectName(subject)}</span>
                    <div class="mastery-bar">
                        <div class="mastery-fill" style="width: ${avg}%"></div>
                    </div>
                    <span>${avg}%</span>
                `;
                container.appendChild(item);
                
            } catch (error) {
                console.error(`Error loading mastery for ${subject}:`, error);
            }
        }
    },

    // Load quiz history
    async loadQuizHistory() {
        const container = document.getElementById('history-list');
        container.innerHTML = '';
        
        try {
            const snapshot = await collections.scores
                .where('userId', '==', auth.currentUser.uid)
                .orderBy('completedAt', 'desc')
                .limit(10)
                .get();
            
            if (snapshot.empty) {
                container.innerHTML = '<p class="empty">No quizzes taken yet</p>';
                return;
            }
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const item = document.createElement('div');
                item.className = 'history-item';
                item.innerHTML = `
                    <div>
                        <strong>${utils.getSubjectName(data.subject)}</strong>
                        <span style="color: var(--text-secondary); display: block; font-size: 0.9rem;">
                            ${data.difficulty} • ${utils.formatDate(data.completedAt)}
                        </span>
                    </div>
                    <span style="font-weight: bold; color: ${data.score >= 60 ? 'var(--success)' : 'var(--danger)'};">
                        ${data.score}%
                    </span>
                `;
                container.appendChild(item);
            });
            
        } catch (error) {
            console.error('Error loading history:', error);
            container.innerHTML = '<p class="empty">Error loading history</p>';
        }
    },

    // Change theme
    changeTheme(theme) {
        auth.updateUserData({
            'settings.theme': theme
        });
        
        // Apply theme immediately
        if (theme === 'light') {
            document.documentElement.style.setProperty('--bg-primary', '#f1f5f9');
            document.documentElement.style.setProperty('--bg-secondary', '#e2e8f0');
            document.documentElement.style.setProperty('--text-primary', '#0f172a');
        } else if (theme === 'dark') {
            document.documentElement.style.setProperty('--bg-primary', '#0f172a');
            document.documentElement.style.setProperty('--bg-secondary', '#1e293b');
            document.documentElement.style.setProperty('--text-primary', '#f8fafc');
        }
        // Auto would check system preference
    }
};

window.user = user;

