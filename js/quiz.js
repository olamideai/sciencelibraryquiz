// Quiz module
const quiz = {
    selectedSubject: null,
    selectedDifficulty: null,
    questions: [],
    currentQuestion: 0,
    answers: [],
    timeRemaining: 0,
    timerInterval: null,
    quizStartTime: null,
    subjectSettings: null,

    // Select subject
    async selectSubject(subject) {
        // Load subject settings
        const doc = await collections.subjectSettings.doc(subject).get();
        this.subjectSettings = doc.data();
        
        if (this.subjectSettings.locked) {
            utils.showToast('This subject is currently locked', 'error');
            return;
        }

        this.selectedSubject = subject;
        
        // Update UI
        document.querySelectorAll('.subject-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-subject="${subject}"]`)?.classList.add('selected');
        
        // Show difficulty step
        document.getElementById('difficulty-step').classList.remove('hidden');
        
        // Check if Expert mode should be locked
        const rank = utils.calculateRank(auth.userData?.totalQuizzes || 0);
        const expertBtn = document.getElementById('expert-btn');
        if (rank.name === 'Novice' || rank.name === 'Explorer') {
            expertBtn.classList.add('locked');
        } else {
            expertBtn.classList.remove('locked');
        }
        
        // Scroll to difficulty
        document.getElementById('difficulty-step').scrollIntoView({ behavior: 'smooth' });
    },

    // Select difficulty
    selectDifficulty(difficulty) {
        if (difficulty === 'Expert' && document.getElementById('expert-btn').classList.contains('locked')) {
            utils.showToast('Expert mode requires Scholar rank or higher', 'warning');
            return;
        }

        this.selectedDifficulty = difficulty;
        
        // Update UI
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.querySelector(`[data-difficulty="${difficulty}"]`)?.classList.add('selected');
        
        // Show start step
        document.getElementById('start-step').classList.remove('hidden');
        
        // Update summary
        const config = this.getDifficultyConfig(difficulty);
        document.getElementById('quiz-summary').innerHTML = `
            <p><strong>Subject:</strong> ${utils.getSubjectName(this.selectedSubject)}</p>
            <p><strong>Difficulty:</strong> ${difficulty}</p>
            <p><strong>Questions:</strong> ${config.questions}</p>
            <p><strong>Time:</strong> ${config.time} minutes</p>
            <p><strong>Bonus:</strong> ${config.bonus > 0 ? '+' + config.bonus + '%' : 'None'}</p>
        `;
        
        document.getElementById('start-step').scrollIntoView({ behavior: 'smooth' });
    },

    // Get difficulty configuration
    getDifficultyConfig(difficulty) {
        const configs = {
            'Easy': { questions: 15, time: 30, bonus: 0 },
            'Medium': { questions: 20, time: 25, bonus: 10 },
            'Hard': { questions: 25, time: 20, bonus: 25 },
            'Expert': { questions: 30, time: 15, bonus: 50 }
        };
        return configs[difficulty];
    },

    // Start quiz
    async start() {
        utils.showLoading(true);
        
        try {
            // Fetch questions
            const config = this.getDifficultyConfig(this.selectedDifficulty);
            const snapshot = await collections.questions
                .where('subject', '==', this.selectedSubject)
                .where('difficulty', '==', this.selectedDifficulty)
                .where('active', '==', true)
                .get();
            
            if (snapshot.empty) {
                utils.showToast('No questions available for this subject/difficulty', 'error');
                utils.showLoading(false);
                return;
            }

            // Randomly select questions
            const allQuestions = [];
            snapshot.forEach(doc => {
                allQuestions.push({ id: doc.id, ...doc.data() });
            });
            
            this.questions = utils.shuffle(allQuestions).slice(0, config.questions);
            this.answers = new Array(this.questions.length).fill(null);
            this.currentQuestion = 0;
            this.timeRemaining = config.time * 60;
            this.quizStartTime = Date.now();
            
            // Setup quiz UI
            document.getElementById('quiz-subject').textContent = utils.getSubjectName(this.selectedSubject);
            document.getElementById('quiz-difficulty').textContent = this.selectedDifficulty;
            document.getElementById('total-questions').textContent = this.questions.length;
            
            app.navigate('quiz');
            this.showQuestion();
            this.startTimer();
            
        } catch (error) {
            console.error('Error starting quiz:', error);
            utils.showToast('Error starting quiz', 'error');
        } finally {
            utils.showLoading(false);
        }
    },

    // Show current question
    showQuestion() {
        const question = this.questions[this.currentQuestion];
        const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
        
        document.getElementById('question-number').textContent = this.currentQuestion + 1;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('question-text').textContent = question.question;
        
        // Build options
        const optionsGrid = document.getElementById('options-grid');
        optionsGrid.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionEl = document.createElement('div');
            optionEl.className = 'option';
            if (this.answers[this.currentQuestion] === index) {
                optionEl.classList.add('selected');
            }
            optionEl.innerHTML = `
                <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                <span>${option}</span>
            `;
            optionEl.onclick = () => this.selectAnswer(index);
            optionsGrid.appendChild(optionEl);
        });
        
        // Update buttons
        document.getElementById('prev-btn').classList.toggle('hidden', this.currentQuestion === 0);
        document.getElementById('next-btn').classList.toggle('hidden', this.currentQuestion === this.questions.length - 1);
        document.getElementById('submit-btn').classList.toggle('hidden', this.currentQuestion !== this.questions.length - 1);
    },

    // Select answer
    selectAnswer(index) {
        this.answers[this.currentQuestion] = index;
        
        // Update UI
        document.querySelectorAll('.option').forEach((el, i) => {
            el.classList.toggle('selected', i === index);
        });
    },

    // Next question
    next() {
        if (this.currentQuestion < this.questions.length - 1) {
            this.currentQuestion++;
            this.showQuestion();
        }
    },

    // Previous question
    previous() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.showQuestion();
        }
    },

    // Start timer
    startTimer() {
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.timeRemaining <= 0) {
                this.submit();
            }
        }, 1000);
    },

    // Update timer display
    updateTimerDisplay() {
        const timerEl = document.getElementById('quiz-timer');
        timerEl.textContent = utils.formatTime(this.timeRemaining);
        
        // Add warning classes
        timerEl.classList.remove('warning', 'danger');
        if (this.timeRemaining < 60) {
            timerEl.classList.add('danger');
        } else if (this.timeRemaining < 180) {
            timerEl.classList.add('warning');
        }
    },

    // Confirm exit
    confirmExit() {
        modal.open('exit-modal');
    },

    // Exit quiz
    exit() {
        clearInterval(this.timerInterval);
        modal.close('exit-modal');
        this.reset();
        app.navigate('home');
    },

    // Reset quiz state
    reset() {
        clearInterval(this.timerInterval);
        this.selectedSubject = null;
        this.selectedDifficulty = null;
        this.questions = [];
        this.currentQuestion = 0;
        this.answers = [];
        this.timeRemaining = 0;
        this.quizStartTime = null;
    },

    // Reset setup
    resetSetup() {
        this.selectedSubject = null;
        this.selectedDifficulty = null;
        document.querySelectorAll('.subject-card, .difficulty-btn').forEach(el => {
            el.classList.remove('selected');
        });
        document.getElementById('difficulty-step').classList.add('hidden');
        document.getElementById('start-step').classList.add('hidden');
    },

    // Submit quiz
    async submit() {
        clearInterval(this.timerInterval);
        
        const timeTaken = Math.floor((Date.now() - this.quizStartTime) / 1000);
        let correct = 0;
        
        this.answers.forEach((answer, index) => {
            if (answer === this.questions[index].correctAnswer) {
                correct++;
            }
        });
        
        const baseScore = Math.round((correct / this.questions.length) * 100);
        const config = this.getDifficultyConfig(this.selectedDifficulty);
        
        // Calculate bonuses
        const difficultyBonus = Math.round(baseScore * (config.bonus / 100));
        
        // Streak bonus
        let streakBonus = 0;
        const streak = auth.userData?.currentStreak || 0;
        if (streak >= 30) streakBonus = Math.round(baseScore * 0.25);
        else if (streak >= 7) streakBonus = Math.round(baseScore * 0.10);
        
        const totalPoints = baseScore + difficultyBonus + streakBonus;
        
        // Save score
        const scoreData = {
            userId: auth.currentUser.uid,
            userName: auth.userData.name,
            userRegId: auth.userData.regId,
            userLevel: auth.userData.level,
            subject: this.selectedSubject,
            difficulty: this.selectedDifficulty,
            score: baseScore,
            correctAnswers: correct,
            totalQuestions: this.questions.length,
            timeTaken,
            completedAt: firebase.firestore.FieldValue.serverTimestamp(),
            streakAtCompletion: streak,
            bonusPointsEarned: difficultyBonus + streakBonus
        };
        
        try {
            await collections.scores.add(scoreData);
            
            // Update user stats
            const newTotalQuizzes = (auth.userData.totalQuizzes || 0) + 1;
            const newTotalPoints = (auth.userData.totalPoints || 0) + totalPoints;
            
            // Check streak
            const streakStatus = utils.checkStreak(auth.userData.lastQuizDate);
            let newStreak = streak;
            if (streakStatus.canExtend) {
                newStreak++;
            } else if (!streakStatus.active) {
                newStreak = 1;
            }
            
            const rank = utils.calculateRank(newTotalQuizzes);
            
            await auth.updateUserData({
                totalQuizzes: newTotalQuizzes,
                totalPoints: newTotalPoints,
                level: rank.name,
                currentStreak: newStreak,
                longestStreak: Math.max(newStreak, auth.userData.longestStreak || 0),
                lastQuizDate: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Show results
            this.showResults(baseScore, correct, timeTaken, baseScore, difficultyBonus, streakBonus, totalPoints);
            
        } catch (error) {
            console.error('Error saving score:', error);
            utils.showToast('Error saving results', 'error');
        }
    },

    // Show results
    showResults(score, correct, timeTaken, baseScore, diffBonus, streakBonus, totalPoints) {
        app.navigate('results');
        
        document.getElementById('score-percent').textContent = `${score}%`;
        document.getElementById('score-message').textContent = this.getScoreMessage(score);
        document.getElementById('correct-count').textContent = `${correct}/${this.questions.length}`;
        document.getElementById('time-taken').textContent = utils.formatTime(timeTaken);
        document.getElementById('base-score').textContent = baseScore;
        document.getElementById('difficulty-bonus').textContent = diffBonus > 0 ? `+${diffBonus}` : '0';
        document.getElementById('streak-bonus').textContent = streakBonus > 0 ? `+${streakBonus}` : '0';
        document.getElementById('total-earned').textContent = totalPoints;
        
        // Set CSS variable for score circle
        document.querySelector('.score-circle').style.setProperty('--score', score);
        
        // Check for new achievements
        this.checkNewAchievements();
        
        // Confetti for high scores
        if (score >= 90) {
            utils.createConfetti();
        }
        
        // Screen flash for 100%
        if (score === 100) {
            utils.screenFlash();
        }
    },

    // Get score message
    getScoreMessage(score) {
        if (score === 100) return 'Perfect! Absolutely incredible! 🌟';
        if (score >= 90) return 'Outstanding work! 🎉';
        if (score >= 80) return 'Great job! Keep it up! 👏';
        if (score >= 70) return 'Good effort! 📚';
        if (score >= 60) return 'You passed! Keep practicing! 💪';
        return 'Keep studying, you\'ll do better next time! 📖';
    },

    // Check for new achievements
    async checkNewAchievements() {
        // This would check against achievement criteria
        // For now, just a placeholder
        document.getElementById('new-achievements').classList.add('hidden');
    }
};

window.quiz = quiz;
