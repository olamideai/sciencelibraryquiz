// Leaderboard module
const leaderboard = {
    // Load leaderboard
    async load() {
        const type = document.getElementById('leaderboard-type')?.value || 'global';
        const subject = document.getElementById('leaderboard-subject')?.value || 'all';
        
        if (type === 'global') {
            await this.loadGlobal(subject);
        } else {
            await this.loadFriends(subject);
        }
    },

    // Load global leaderboard
    async loadGlobal(subject) {
        try {
            let query = collections.users.orderBy('totalPoints', 'desc').limit(50);
            const snapshot = await query.get();
            
            const users = [];
            snapshot.forEach(doc => {
                users.push({ id: doc.id, ...doc.data() });
            });
            
            this.render(users, subject);
            
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        }
    },

    // Load friends leaderboard
    async loadFriends(subject) {
        // Would filter to show only friends
        utils.showToast('Friends leaderboard coming soon!', 'info');
    },

    // Render leaderboard
    render(users, subjectFilter) {
        const podium = document.getElementById('podium');
        const list = document.getElementById('leaderboard-list');
        
        podium.innerHTML = '';
        list.innerHTML = '';
        
        if (users.length === 0) {
            list.innerHTML = '<p class="empty">No data available</p>';
            return;
        }
        
        // Render podium (top 3)
        const top3 = users.slice(0, 3);
        const positions = ['second', 'first', 'third'];
        const order = [1, 0, 2]; // 2nd, 1st, 3rd display order
        
        order.forEach((idx, displayIdx) => {
            if (top3[idx]) {
                const user = top3[idx];
                const rank = utils.calculateRank(user.totalQuizzes || 0);
                const place = document.createElement('div');
                place.className = `podium-place ${positions[displayIdx]}`;
                place.innerHTML = `
                    <div class="podium-rank">${idx + 1}</div>
                    <div style="font-size: 2rem; margin-bottom: 10px;">${rank.badge}</div>
                    <strong>${user.name}</strong>
                    <span style="color: var(--text-secondary); display: block;">
                        ${user.totalPoints} pts
                    </span>
                `;
                podium.appendChild(place);
            }
        });
        
        // Render rest of list
        users.slice(3).forEach((user, index) => {
            const rank = utils.calculateRank(user.totalQuizzes || 0);
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <div class="leaderboard-rank">${index + 4}</div>
                <div class="leaderboard-user">
                    <div class="friend-avatar">${rank.badge}</div>
                    <div>
                        <strong>${user.name}</strong>
                        <span style="color: var(--text-secondary); display: block; font-size: 0.9rem;">
                            ${user.regId}
                        </span>
                    </div>
                </div>
                <div class="leaderboard-stats">
                    <span>${user.totalPoints} pts</span>
                    <span>${user.totalQuizzes} quizzes</span>
                </div>
            `;
            list.appendChild(item);
        });
    }
};

window.leaderboard = leaderboard;

