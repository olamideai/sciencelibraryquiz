// Authentication Module
const authModule = {
    currentUser: null,
    userData: null,

    // Initialize Auth Listener
    init() {
        firebase.auth().onAuthStateChanged(user => {
            this.currentUser = user;
            if (user) {
                this.loadUserData(user.uid);
            } else {
                this.userData = null;
                app.navigate('auth');
            }
        });
    },

    // Load User Profile
    async loadUserData(uid) {
        try {
            const doc = await collections.users.doc(uid).get();
            if (doc.exists) {
                this.userData = doc.data();
                
                // Email Verification Check
                if (!this.currentUser.emailVerified && this.userData.emailVerified !== true) {
                    document.getElementById('verify-email').textContent = this.currentUser.email;
                    app.navigate('verify');
                    return;
                }
                
                // Rank Check for Legend Entrance
                const rank = utils.calculateRank(this.userData.totalQuizzes || 0);
                if (rank.name === 'Legend' && !utils.storage.get('legend_seen')) {
                    app.navigate('legend-entrance');
                    return;
                }
                
                app.navigate('home');
                app.updateNav();
            } else {
                // New User: Profile creation
                await this.createUserProfile(uid);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            utils.showToast('Error loading profile', 'error');
        }
    },

    // Create New Profile
    async createUserProfile(uid) {
        try {
            const userRegId = await regId.generate();
            const email = this.currentUser.email;
            
            const userData = {
                uid,
                email,
                name: document.getElementById('signup-name').value || email.split('@')[0],
                regId: userRegId,
                emailVerified: false,
                totalQuizzes: 0,
                totalPoints: 0,
                level: 'Novice',
                currentStreak: 0,
                longestStreak: 0,
                lastQuizDate: null,
                joinedAt: firebase.firestore.FieldValue.serverTimestamp(),
                settings: { theme: 'dark', notifications: true },
                achievements: [],
                friends: [],
                blocked: [],
                isAdmin: false,
                status: 'online'
            };

            await collections.users.doc(uid).set(userData);
            this.userData = userData;
            
            // Email Verification
            await this.currentUser.sendEmailVerification();
            document.getElementById('verify-email').textContent = email;
            app.navigate('verify');
        } catch (error) {
            console.error('Error creating profile:', error);
            utils.showToast('Profile creation failed', 'error');
        }
    },

    // Login logic
    async login() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            utils.showToast('Please fill in all fields', 'error');
            return;
        }

        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
            utils.showToast('Welcome back!', 'success');
        } catch (error) {
            console.error('Login error:', error);
            utils.showToast('Invalid credentials', 'error');
        }
    },

    // Signup logic
    async signup() {
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;

        if (!name || !email || !password || !confirm) {
            utils.showToast('Please fill in all fields', 'error');
            return;
        }

        if (password !== confirm) {
            utils.showToast('Passwords do not match', 'error');
            return;
        }

        try {
            await firebase.auth().createUserWithEmailAndPassword(email, password);
        } catch (error) {
            console.error('Signup error:', error);
            utils.showToast('Signup failed: ' + error.message, 'error');
        }
    },

    // Logout
    async logout() {
        try {
            await firebase.auth().signOut();
            utils.storage.remove('legend_seen');
            utils.showToast('Logged out', 'success');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
};

window.auth = authModule;
