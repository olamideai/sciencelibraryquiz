// Achievements Module
const achievements = {
    // List of all achievement definitions
    all: [
        { id: 'first_steps', name: 'First Steps', type: 'count', req: 1, points: 10, badge: '🎯' },
        { id: 'dedicated', name: 'Dedicated', type: 'count', req: 10, points: 50, badge: '📚' },
        { id: 'perfect_score', name: 'Perfect Score', type: 'score', req: 100, points: 50, badge: '💯' },
        { id: 'math_whiz', name: 'Math Whiz', type: 'subject', req: 'mathematics', points: 50, badge: '🧮' }
    ],

    // Load user achievements
    async load() {
        const container = document.getElementById('achievements-grid');
        container.innerHTML = '';

        try {
            const snapshot = await collections.achievements
                .where('userId', '==', authModule.currentUser.uid)
                .get();
            
            const unlocked = [];
            snapshot.forEach(doc => unlocked.push(doc.data().achievementId));

            this.all.forEach(ach => {
                const isUnlocked = unlocked.includes(ach.id);
                const el = document.createElement('div');
                el.className = `achievement-card ${isUnlocked ? 'unlocked' : ''}`;
                el.innerHTML = `
                    <div class="ach-icon">${ach.badge}</div>
                    <div class="ach-name">${ach.name}</div>
                    <div class="ach-pts">${ach.points} pts</div>
                `;
                container.appendChild(el);
            });

            document.getElementById('achievements-count').textContent = `${unlocked.length}/${this.all.length} Unlocked`;
        } catch (error) {
            console.error('Error loading achievements:', error);
        }
    },

    // Check and Unlock Achievements
    async check(type, value) {
        // Achievement check logic here
    }
};

window.achievements = achievements;
