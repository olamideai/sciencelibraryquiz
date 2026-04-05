// Quiz Engine Module
const quiz = {
    selectedSubject: null,
    selectedDifficulty: null,
    questions: [],
    currentQuestion: 0,
    answers: [],
    timeRemaining: 0,
    timerInterval: null,
    quizStartTime: null,

    // Difficulty Settings
    difficultyConfigs: {
        'Easy': { questions: 15, time: 30, bonus: 0 },
        'Medium': { questions: 20, time: 25, bonus: 10 },
        'Hard': { questions: 25, time: 20, bonus: 25 },
        'Expert': { questions: 30, time: 15, bonus: 50 }
    },

    // Select subject
    selectSubject(subject) {
        this.selectedSubject = subject;
        document.getElementById('difficulty-step').classList.remove('hidden');
    },

    // Select difficulty
    selectDifficulty(difficulty) {
        this.selectedDifficulty = difficulty;
        document.getElementById('start-step').classList.remove('hidden');
        
        const config = this.difficultyConfigs[difficulty];
        document.getElementById('quiz-summary').innerHTML = `
            <p><strong>Subject:</strong> ${this.selectedSubject}</p>
            <p><strong>Questions:</strong> ${config.questions}</p>
            <p><strong>Time:</strong> ${config.time} minutes</p>
        `;
    },

    // Start Quiz
    async start() {
        utils.showLoading(true);
        const config = this.difficultyConfigs[this.selectedDifficulty];
        
        try {
            const snapshot = await collections.questions
                .where('subject', '==', this.selectedSubject)
                .where('difficulty', '==', this.selectedDifficulty)
                .get();

            let pool = [];
            snapshot.forEach(doc => pool.push({ id: doc.id, ...doc.data() }));

            // Fallback to local bank if empty
            if (pool.length === 0 && window.questionManager) {
                pool = questionManager.getRandom(this.selectedSubject, this.selectedDifficulty, config.questions);
            }

            this.questions = utils.shuffle(pool).slice(0, config.questions);
            this.answers = new Array(this.questions.length).fill(null);
            this.currentQuestion = 0;
            this.timeRemaining = config.time * 60;
            this.quizStartTime = Date.now();

            app.navigate('quiz');
            this.showQuestion();
            this.startTimer();
        } catch (error) {
            console.error('Quiz start error:', error);
            utils.showToast('Failed to load questions', 'error');
        } finally {
            utils.showLoading(false);
        }
    },

    // Show Question
    showQuestion() {
        const q = this.questions[this.currentQuestion];
        const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
        
        document.getElementById('question-number').textContent = this.currentQuestion + 1;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('question-text').textContent = q.question;
        
        const container = document.getElementById('options-grid');
        container.innerHTML = '';
        
        q.options.forEach((opt, idx) => {
            const el = document.createElement('div');
            el.className = `option ${this.answers[this.currentQuestion] === idx ? 'selected' : ''}`;
            el.innerHTML = `<span>${String.fromCharCode(65 + idx)}.</span> <span>${opt}</span>`;
            el.onclick = () => this.selectAnswer(idx);
            container.appendChild(el);
        });

        // Nav Buttons
        document.getElementById('prev-btn').classList.toggle('hidden', this.currentQuestion === 0);
        document.getElementById('next-btn').classList.toggle('hidden', this.currentQuestion === this.questions.length - 1);
        document.getElementById('submit-btn').classList.toggle('hidden', this.currentQuestion !== this.questions.length - 1);
    },

    // Answer Selection
    selectAnswer(idx) {
        this.answers[this.currentQuestion] = idx;
        this.showQuestion();
    },

    // Quiz Control
    next() { if (this.currentQuestion < this.questions.length - 1) { this.currentQuestion++; this.showQuestion(); } },
    previous() { if (this.currentQuestion > 0) { this.currentQuestion--; this.showQuestion(); } },

    // Timer Logic
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            document.getElementById('quiz-timer').textContent = utils.formatTime(this.timeRemaining);
            if (this.timeRemaining <= 0) this.submit();
        }, 1000);
    },

    // Submit Logic
    async submit() {
        clearInterval(this.timerInterval);
        utils.showLoading(true);
        
        let correctCount = 0;
        this.questions.forEach((q, idx) => {
            if (this.answers[idx] === q.correctAnswer) correctCount++;
        });

        const score = Math.round((correctCount / this.questions.length) * 100);
        const timeTaken = Math.floor((Date.now() - this.quizStartTime) / 1000);
        
        const scoreData = {
            userId: authModule.currentUser.uid,
            userName: authModule.userData.name,
            subject: this.selectedSubject,
            difficulty: this.selectedDifficulty,
            score,
            correctAnswers: correctCount,
            totalQuestions: this.questions.length,
            timeTaken,
            completedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            await collections.scores.add(scoreData);
            
            // Update User Stats
            const updates = {
                totalQuizzes: firebase.firestore.FieldValue.increment(1),
                totalPoints: firebase.firestore.FieldValue.increment(score)
            };
            await collections.users.doc(authModule.currentUser.uid).update(updates);
            
            this.showResults(score, correctCount, timeTaken);
        } catch (error) {
            console.error('Submit error:', error);
            utils.showToast('Failed to save score', 'error');
        } finally {
            utils.showLoading(false);
        }
    },

    // Results Display
    showResults(score, correct, time) {
        app.navigate('results');
        document.getElementById('score-percent').textContent = `${score}%`;
        document.getElementById('correct-count').textContent = `${correct}/${this.questions.length}`;
        document.getElementById('time-taken').textContent = utils.formatTime(time);
        
        if (score >= 90) utils.createConfetti();
    },

    confirmExit() { if (confirm('Exit quiz? Progress will be lost.')) app.navigate('home'); },
    resetSetup() {
        this.selectedSubject = null;
        this.selectedDifficulty = null;
        document.getElementById('difficulty-step').classList.add('hidden');
        document.getElementById('start-step').classList.add('hidden');
    }
};

window.quiz = quiz;
