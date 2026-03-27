// Admin module
const admin = {
    isAuthenticated: false,
    attemptCount: 0,
    lockoutUntil: null,

    // Load admin panel
    async load() {
        if (!auth.userData?.isAdmin) {
            // Check if PIN access
            document.getElementById('admin-login').classList.remove('hidden');
            document.getElementById('admin-dashboard').classList.add('hidden');
        } else {
            this.isAuthenticated = true;
            document.getElementById('admin-login').classList.add('hidden');
            document.getElementById('admin-dashboard').classList.remove('hidden');
            await this.loadStats();
            await this.loadSubjects();
        }
    },

    // Admin login with PIN
    async login() {
        // Check lockout
        if (this.lockoutUntil && Date.now() < this.lockoutUntil) {
            const mins = Math.ceil((this.lockoutUntil - Date.now()) / 60000);
            document.getElementById('admin-error').textContent = `Locked out. Try again in ${mins} minutes.`;
            return;
        }
        
        const pin = document.getElementById('admin-pin').value;
        
        if (pin === ADMIN_PIN) {
            this.isAuthenticated = true;
            this.attemptCount = 0;
            document.getElementById('admin-login').classList.add('hidden');
            document.getElementById('admin-dashboard').classList.remove('hidden');
            await this.loadStats();
            await this.loadSubjects();
        } else {
            this.attemptCount++;
            const remaining = 5 - this.attemptCount;
            document.getElementById('admin-error').textContent = `Invalid PIN. ${remaining} attempts remaining.`;
            
            if (this.attemptCount >= 5) {
                this.lockoutUntil = Date.now() + 15 * 60000; // 15 minutes
                document.getElementById('admin-error').textContent = 'Too many attempts. Locked out for 15 minutes.';
            }
        }
    },

    // Load admin stats
    async loadStats() {
        try {
            // Total users
            const usersSnapshot = await collections.users.get();
            document.getElementById('admin-users').textContent = usersSnapshot.size;
            
            // Today's quizzes
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const scoresSnapshot = await collections.scores
                .where('completedAt', '>=', today)
                .get();
            document.getElementById('admin-today').textContent = scoresSnapshot.size;
            
            // Count Masters and Legends
            let masters = 0;
            let legends = 0;
            usersSnapshot.forEach(doc => {
                const quizzes = doc.data().totalQuizzes || 0;
                if (quizzes >= 100) legends++;
                else if (quizzes >= 50) masters++;
            });
            document.getElementById('admin-masters').textContent = masters;
            document.getElementById('admin-legends').textContent = legends;
            
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    },

    // Load subjects management
    async loadSubjects() {
        const container = document.getElementById('admin-subjects-list');
        container.innerHTML = '';
        
        const subjects = ['mathematics', 'chemistry', 'physics', 'biology', 'agriculture', 'computer', 'furthermath'];
        
        for (const subject of subjects) {
            const doc = await collections.subjectSettings.doc(subject).get();
            const settings = doc.data() || {
                locked: false,
                questionsPerQuiz: 15,
                timeLimit: 30,
                difficultiesAvailable: ['Easy', 'Medium', 'Hard'],
                minimumLevel: 'Novice'
            };
            
            const card = document.createElement('div');
            card.className = 'subject-settings-card';
            card.innerHTML = `
                <h4>${utils.getSubjectName(subject)} ${settings.locked ? '🔒' : '🔓'}</h4>
                <div class="settings-row">
                    <span>Locked</span>
                    <input type="checkbox" ${settings.locked ? 'checked' : ''} 
                        onchange="admin.updateSubject('${subject}', 'locked', this.checked)">
                </div>
                <div class="settings-row">
                    <span>Questions per Quiz</span>
                    <input type="number" value="${settings.questionsPerQuiz}" min="5" max="50"
                        onchange="admin.updateSubject('${subject}', 'questionsPerQuiz', this.value)">
                </div>
                <div class="settings-row">
                    <span>Time Limit (minutes)</span>
                    <input type="number" value="${settings.timeLimit}" min="5" max="60"
                        onchange="admin.updateSubject('${subject}', 'timeLimit', this.value)">
                </div>
                <div class="settings-row">
                    <span>Minimum Level</span>
                    <select onchange="admin.updateSubject('${subject}', 'minimumLevel', this.value)">
                        <option value="Novice" ${settings.minimumLevel === 'Novice' ? 'selected' : ''}>Novice</option>
                        <option value="Explorer" ${settings.minimumLevel === 'Explorer' ? 'selected' : ''}>Explorer</option>
                        <option value="Scholar" ${settings.minimumLevel === 'Scholar' ? 'selected' : ''}>Scholar</option>
                        <option value="Expert" ${settings.minimumLevel === 'Expert' ? 'selected' : ''}>Expert</option>
                        <option value="Master" ${settings.minimumLevel === 'Master' ? 'selected' : ''}>Master</option>
                        <option value="Legend" ${settings.minimumLevel === 'Legend' ? 'selected' : ''}>Legend</option>
                    </select>
                </div>
            `;
            container.appendChild(card);
        }
    },

    // Update subject setting
    async updateSubject(subject, field, value) {
        try {
            const update = { [field]: value };
            await collections.subjectSettings.doc(subject).update(update);
            utils.showToast('Setting updated', 'success');
        } catch (error) {
            console.error('Error updating subject:', error);
            utils.showToast('Error updating setting', 'error');
        }
    },

    // Show add question modal
    showAddQuestion() {
        document.getElementById('question-modal-title').textContent = 'Add Question';
        document.getElementById('question-form').reset();
        modal.open('question-modal');
    },

    // Save question
    async saveQuestion(event) {
        event.preventDefault();
        
        const questionData = {
            subject: document.getElementById('q-subject').value,
            difficulty: document.getElementById('q-difficulty').value,
            question: document.getElementById('q-text').value,
            options: [
                document.getElementById('q-option1').value,
                document.getElementById('q-option2').value,
                document.getElementById('q-option3').value,
                document.getElementById('q-option4').value
            ],
            correctAnswer: parseInt(document.getElementById('q-correct').value),
            explanation: document.getElementById('q-explanation').value,
            active: true,
            addedAt: firebase.firestore.FieldValue.serverTimestamp(),
            usageCount: 0,
            correctRate: 0
        };
        
        try {
            await collections.questions.add(questionData);
            utils.showToast('Question added successfully', 'success');
            modal.close('question-modal');
        } catch (error) {
            console.error('Error adding question:', error);
            utils.showToast('Error adding question', 'error');
        }
    },

    // Search users
    async searchUsers() {
        const query = document.getElementById('user-search').value.trim();
        if (!query) return;
        
        const container = document.getElementById('admin-users-list');
        container.innerHTML = '';
        
        try {
            let snapshot;
            
            if (query.startsWith('SLQ-')) {
                snapshot = await collections.users.where('regId', '==', query).get();
            } else {
                snapshot = await collections.users.where('email', '==', query).get();
            }
            
            if (snapshot.empty) {
                container.innerHTML = '<p class="empty">No users found</p>';
                return;
            }
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const card = document.createElement('div');
                card.className = 'friend-card';
                card.innerHTML = `
                    <div class="friend-info">
                        <div class="friend-avatar">👤</div>
                        <div>
                            <strong>${data.name}</strong>
                            <span style="color: var(--text-secondary); display: block; font-size: 0.9rem;">
                                ${data.regId} • ${data.email}
                            </span>
                        </div>
                    </div>
                    <div class="friend-actions">
                        <button onclick="admin.viewUser('${doc.id}')" class="btn-secondary">View</button>
                        <button onclick="admin.suspendUser('${doc.id}')" class="btn-danger">Suspend</button>
                    </div>
                `;
                container.appendChild(card);
            });
            
        } catch (error) {
            console.error('Error searching users:', error);
        }
    },

    // Save admin settings
    async saveSettings() {
        const settings = {
            defaultQuestionsPerQuiz: parseInt(document.getElementById('setting-questions').value),
            defaultTimeLimit: parseInt(document.getElementById('setting-time').value),
            defaultPassPercentage: parseInt(document.getElementById('setting-pass').value),
            registrationOpen: document.getElementById('setting-registration').checked,
            emailVerificationRequired: document.getElementById('setting-verification').checked
        };
        
        try {
            await collections.adminSettings.doc('config').update(settings);
            utils.showToast('Settings saved', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            utils.showToast('Error saving settings', 'error');
        }
    },

    // Show admin tab
    showTab(tab) {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.admin-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        
        event.target.classList.add('active');
        document.getElementById(`admin-${tab}`).classList.add('active');
    },

    // View user details
    viewUser(userId) {
        utils.showToast('User detail view coming soon', 'info');
    },

    // Suspend user
    async suspendUser(userId) {
        if (!confirm('Are you sure you want to suspend this user?')) return;
        
        try {
            await collections.users.doc(userId).update({ suspended: true });
            utils.showToast('User suspended', 'success');
        } catch (error) {
            utils.showToast('Error suspending user', 'error');
        }
    }
};

window.admin = admin;

