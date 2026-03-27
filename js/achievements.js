// Achievements module
const achievements = {
    allAchievements: [
        // Quiz Count Achievements
        { id: 'first_steps', type: 'quiz_count', name: 'First Steps', description: 'Complete your first quiz', badge: '🎯', points: 10, requirement: 1 },
        { id: 'rising_star', type: 'quiz_count', name: 'Rising Star', description: 'Complete 5 quizzes', badge: '⬆️', points: 25, requirement: 5 },
        { id: 'dedicated', type: 'quiz_count', name: 'Dedicated', description: 'Complete 10 quizzes', badge: '📚', points: 50, requirement: 10 },
        { id: 'quiz_master', type: 'quiz_count', name: 'Quiz Master', description: 'Complete 25 quizzes', badge: '🎓', points: 100, requirement: 25 },
        { id: 'unstoppable', type: 'quiz_count', name: 'Unstoppable', description: 'Complete 50 quizzes', badge: '🚀', points: 200, requirement: 50 },
        { id: 'legendary', type: 'quiz_count', name: 'Legendary', description: 'Complete 100 quizzes', badge: '👑', points: 500, requirement: 100 },
        
        // Score Achievements
        { id: 'perfect_score', type: 'score', name: 'Perfect Score', description: 'Score 100/100', badge: '💯', points: 50, requirement: 100 },
        { id: 'near_perfect', type: 'score', name: 'Near Perfect', description: 'Score 95-99%', badge: '🌟', points: 30, requirement: 95 },
        { id: 'high_achiever', type: 'score', name: 'High Achiever', description: 'Score 90-94%', badge: '🏆', points: 20, requirement: 90 },
        
        // Streak Achievements
        { id: 'streak_3', type: 'streak', name: '3-Day Streak', description: 'Quiz 3 days in a row', badge: '🔥', points: 15, requirement: 3 },
        { id: 'streak_7', type: 'streak', name: '7-Day Streak', description: 'Quiz 7 days in a row', badge: '🔥', points: 40, requirement: 7 },
        { id: 'streak_30', type: 'streak', name: '30-Day Streak', description: 'Quiz 30 days in a row', badge: '🌞', points: 150, requirement: 30 },
        { id: 'streak_365', type: 'streak', name: '365-Day Streak', description: 'Quiz every day for a year', badge: '🗓️', points: 1000, requirement: 365 },
        
        // Subject Mastery
        { id: 'math_whiz', type: 'subject', name: 'Math Whiz', description: 'Master Mathematics', badge: '🧮', points: 50, requirement: 'mathematics' },
        { id: 'chemistry_pro', type: 'subject', name: 'Chemistry Pro', description: 'Master Chemistry', badge: '⚗️', points: 50, requirement: 'chemistry' },
        { id: 'physics_genius', type: 'subject', name: 'Physics Genius', description: 'Master Physics', badge: '⚛️', points: 50, requirement: 'physics' },
        { id: 'biology_expert', type: 'subject', name: 'Biology Expert', description: 'Master Biology', badge: '🧬', points: 50, requirement: 'biology' },
        { id: 'agriculture_ace', type: 'subject', name: 'Agriculture Ace', description: 'Master Agriculture', badge: '🌾', points: 50, requirement: 'agriculture' },
        { id: 'computer_wiz', type: 'subject', name: 'Computer Wiz', description: 'Master Computer', badge: '💻', points: 50, requirement: 'computer' },
        { id: 'furthermath_master', type: 'subject', name: 'Further Math Master', description: 'Master Further Math', badge: '📐', points: 50, requirement: 'furthermath' },
        { id: 'all_rounder', type: 'subject', name: 'All-Rounder', description: 'Master all 7 subjects', badge: '🌟', points: 300, requirement: 'all' },
        
        // Special Achievements
        { id: 'speed_demon', type: 'special', name: 'Speed Demon', description: 'Complete quiz under 10 min with 90%+', badge: '⚡', points: 40, requirement: 'speed' },
        { id: 'night_owl', type: 'special', name: 'Night Owl', description: 'Quiz between 12am-5am', badge: '🦉', points: 10, requirement: 'night' },
        { id: 'early_bird', type: 'special', name: 'Early Bird', description: 'Quiz between 5am-8am', badge: '🐦', points: 10, requirement: 'morning' },
        { id: 'weekend_warrior', type: 'special', name: 'Weekend Warrior', description: 'Quiz on weekend', badge: '🏖️', points: 20, requirement: 'weekend' },
        { id: 'social_butterfly', type: 'special', name: 'Social Butterfly', description: 'Have 5 friends', badge: '🦋', points: 25, requirement: 5 },
        { id: 'challenge_accepted', type: 'special', name: 'Challenge Accepted', description: 'Win 5 challenges', badge: '🥊', points: 50, requirement: 5 }
    ],

    userAchievements: [],

    // Load achievements
    async load() {
        await this.loadUserAchievements();
        this.render();
    },

    // Load user's earned achievements
    async loadUserAchievements() {
        try {
            const snapshot = await collections.achievements
                .where('userId', '==', auth.currentUser.uid)
                .get();
            
            this.userAchievements = [];
            snapshot.forEach(doc => {
                this.userAchievements.push(doc.data().achievementId);
            });
            
        } catch (error) {
            console.error('Error loading achievements:', error);
        }
    },

    // Render achievements grid
    render() {
        const container = document.getElementById('achievements-grid');
        container.innerHTML = '';
        
        let unlockedCount = 0;
        let totalPoints = 0;
        
        this.allAchievements.forEach(achievement => {
            const isUnlocked = this.userAchievements.includes(achievement.id);
            if (isUnlocked) {
                unlockedCount++;
                totalPoints += achievement.points;
            }
            
            const card = document.createElement('div');
            card.className = `achievement-card ${isUnlocked ? 'unlocked' : ''}`;
            card.innerHTML = `
                <div class="achievement-icon">${achievement.badge}</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
                <div class="achievement-points">${achievement.points} pts</div>
            `;
            container.appendChild(card);
        });
        
        // Update summary
        document.getElementById('achievements-count').textContent = `${unlockedCount}/${this.allAchievements.length} Unlocked`;
        document.getElementById('achievement-points').textContent = `${totalPoints} pts`;
    },

    // Check and award achievements
    async checkAchievements(type, value) {
        const toAward = [];
        
        this.allAchievements.forEach(achievement => {
            if (this.userAchievements.includes(achievement.id)) return;
            
            if (achievement.type === type) {
                let shouldAward = false;
                
                switch(type) {
                    case 'quiz_count':
                        if (value >= achievement.requirement) shouldAward = true;
                        break;
                    case 'score':
                        if (value >= achievement.requirement) shouldAward = true;
                        break;
                    case 'streak':
                        if (value >= achievement.requirement) shouldAward = true;
                        break;
                }
                
                if (shouldAward) {
                    toAward.push(achievement);
                }
            }
        });
        
        // Award achievements
        for (const achievement of toAward) {
            await this.awardAchievement(achievement);
        }
        
        return toAward;
    },

    // Award single achievement
    async awardAchievement(achievement) {
        try {
            await collections.achievements.add({
                userId: auth.currentUser.uid,
                achievementId: achievement.id,
                name: achievement.name,
                badge: achievement.badge,
                points: achievement.points,
                earnedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Update user points
            await auth.updateUserData({
                totalPoints: firebase.firestore.FieldValue.increment(achievement.points)
            });
            
            // Show toast
            utils.showToast(`Achievement Unlocked: ${achievement.name} ${achievement.badge}`, 'success', 5000);
            
        } catch (error) {
            console.error('Error awarding achievement:', error);
        }
    }
};

window.achievements = achievements;

