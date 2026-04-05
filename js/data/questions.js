// Local Question Bank and Manager
const questionManager = {
    // Local questions bank (for offline use or when Firestore is slow)
    // Structure: subject -> difficulty -> questions[]
    bank: {
        mathematics: {
            'Easy': [
                {
                    id: 'm1',
                    question: 'What is the square root of 144?',
                    options: ['10', '12', '14', '16'],
                    correctAnswer: 1,
                    explanation: '12 x 12 = 144, so the square root of 144 is 12.'
                },
                {
                    id: 'm2',
                    question: 'Solve for x: 2x + 5 = 15',
                    options: ['5', '10', '15', '20'],
                    correctAnswer: 0,
                    explanation: '2x = 15 - 5 => 2x = 10 => x = 5.'
                }
            ],
            'Medium': [
                {
                    id: 'm3',
                    question: 'What is the derivative of x^2?',
                    options: ['x', '2x', '2', 'x^2'],
                    correctAnswer: 1,
                    explanation: 'Using the power rule, the derivative of x^n is nx^(n-1). So, (x^2)\' = 2x.'
                }
            ],
            'Hard': [
                {
                    id: 'm4',
                    question: 'Find the integral of sin(x) dx.',
                    options: ['cos(x) + C', '-cos(x) + C', 'sin(x) + C', '-sin(x) + C'],
                    correctAnswer: 1,
                    explanation: 'The integral of sin(x) is -cos(x) plus a constant C.'
                }
            ],
            'Expert': []
        },
        chemistry: {
            'Easy': [
                {
                    id: 'c1',
                    question: 'What is the chemical symbol for Gold?',
                    options: ['Ag', 'Au', 'Fe', 'Cu'],
                    correctAnswer: 1,
                    explanation: 'The chemical symbol for Gold is Au, from the Latin word Aurum.'
                }
            ],
            'Medium': [
                {
                    id: 'c2',
                    question: 'Which of these is a noble gas?',
                    options: ['Nitrogen', 'Oxygen', 'Helium', 'Chlorine'],
                    correctAnswer: 2,
                    explanation: 'Helium is a noble gas, found in group 18 of the periodic table.'
                }
            ],
            'Hard': [],
            'Expert': []
        },
        physics: {
            'Easy': [
                {
                    id: 'p1',
                    question: 'What is the unit of force in the SI system?',
                    options: ['Joule', 'Watt', 'Newton', 'Pascal'],
                    correctAnswer: 2,
                    explanation: 'The Newton (N) is the SI unit of force.'
                }
            ],
            'Medium': [],
            'Hard': [],
            'Expert': []
        },
        biology: {
            'Easy': [
                {
                    id: 'b1',
                    question: 'What is the powerhouse of the cell?',
                    options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi apparatus'],
                    correctAnswer: 1,
                    explanation: 'Mitochondria are often referred to as the powerhouse of the cell because they generate ATP.'
                }
            ],
            'Medium': [],
            'Hard': [],
            'Expert': []
        },
        agriculture: {
            'Easy': [
                {
                    id: 'a1',
                    question: 'Which of these is a cereal crop?',
                    options: ['Yam', 'Cassava', 'Maize', 'Tomato'],
                    correctAnswer: 2,
                    explanation: 'Maize is a cereal crop.'
                }
            ],
            'Medium': [],
            'Hard': [],
            'Expert': []
        },
        computer: {
            'Easy': [
                {
                    id: 'co1',
                    question: 'What does CPU stand for?',
                    options: ['Central Process Unit', 'Central Processing Unit', 'Computer Processing Unit', 'Control Process Unit'],
                    correctAnswer: 1,
                    explanation: 'CPU stands for Central Processing Unit.'
                }
            ],
            'Medium': [],
            'Hard': [],
            'Expert': []
        },
        furthermath: {
            'Easy': [
                {
                    id: 'fm1',
                    question: 'What is the value of i^2 in complex numbers?',
                    options: ['1', '-1', '0', 'i'],
                    correctAnswer: 1,
                    explanation: 'The imaginary unit i is defined as the square root of -1, so i^2 = -1.'
                }
            ],
            'Medium': [],
            'Hard': [],
            'Expert': []
        }
    },

    // Get count of questions for a subject
    countBySubject(subject) {
        if (!this.bank[subject]) return 0;
        let count = 0;
        for (const difficulty in this.bank[subject]) {
            count += this.bank[subject][difficulty].length;
        }
        return count;
    },

    // Get count of questions for subject and difficulty
    countBySubjectAndDifficulty(subject, difficulty) {
        if (!this.bank[subject] || !this.bank[subject][difficulty]) return 0;
        return this.bank[subject][difficulty].length;
    },

    // Get random questions
    getRandom(subject, difficulty, count) {
        if (!this.bank[subject] || !this.bank[subject][difficulty]) return [];

        const questions = [...this.bank[subject][difficulty]];
        const shuffled = utils.shuffle(questions);
        return shuffled.slice(0, count);
    }
};

// Make it globally available
window.questionManager = questionManager;
