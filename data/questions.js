// Local Question Bank
const questionManager = {
    bank: {
        mathematics: {
            'Easy': [
                { question: 'What is 5 + 7?', options: ['10', '11', '12', '13'], correctAnswer: 2 },
                { question: 'Square root of 81?', options: ['7', '8', '9', '10'], correctAnswer: 2 }
            ],
            'Medium': [
                { question: 'What is 15 * 6?', options: ['80', '90', '100', '110'], correctAnswer: 1 }
            ]
        },
        chemistry: {
            'Easy': [
                { question: 'Symbol for Gold?', options: ['Ag', 'Au', 'Fe', 'Cu'], correctAnswer: 1 }
            ]
        },
        physics: {
            'Easy': [
                { question: 'Unit of Force?', options: ['Joule', 'Watt', 'Newton', 'Pascal'], correctAnswer: 2 }
            ]
        },
        biology: {
            'Easy': [
                { question: 'Powerhouse of the cell?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi'], correctAnswer: 1 }
            ]
        },
        astronomy: {
            'Easy': [
                { question: 'Largest planet?', options: ['Mars', 'Saturn', 'Jupiter', 'Neptune'], correctAnswer: 2 }
            ]
        }
    },

    getRandom(subject, difficulty, count) {
        const pool = this.bank[subject]?.[difficulty] || [];
        return utils.shuffle(pool).slice(0, count);
    }
};

window.questionManager = questionManager;
