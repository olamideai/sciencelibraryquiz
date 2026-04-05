// Leaderboard Module
const leaderboard = {
    // Load Global Leaderboard
    async load() {
        const container = document.getElementById('leaderboard-list');
        container.innerHTML = '<p>Loading scores...</p>';
        
        try {
            const snapshot = await collections.users
                .orderBy('totalPoints', 'desc')
                .limit(50)
                .get();
            
            container.innerHTML = '';
            let rank = 1;
            snapshot.forEach(doc => {
                const data = doc.data();
                const el = document.createElement('div');
                el.className = 'leaderboard-item';
                el.innerHTML = `
                    <span>${rank++}.</span>
                    <span>${data.name}</span>
                    <span>${data.totalPoints} pts</span>
                `;
                container.appendChild(el);
            });
        } catch (error) {
            console.error('Leaderboard error:', error);
        }
    }
};

window.leaderboard = leaderboard;
