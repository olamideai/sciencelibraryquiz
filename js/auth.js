// Authentication module
const authModule = {
    currentUser: null,
    userData: null,

    // Initialize auth listener
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

    // Load user data from Firestore
    async loadUserData(uid) {
        try {
            const doc = await collections.users.doc(uid).get();
            if (doc.exists) {
                this.userData = doc.data();
                
                // Check if email is verified
                if (!this.currentUser.emailVerified && this.userData.emailVerified !== true) {
                    document.getElementById('verify-email').textContent = this.currentUser.email;
                    app.navigate('verify');
                    return;
                }
                
                // Check rank for legend entrance
                const rank = utils.calculateRank(this.userData.totalQuizzes || 0);
                if (rank.name === 'Legend' && !utils.storage.get('legend_seen')) {
                    app.navigate('legend-entrance');
                    return;
                }
                
                app.navigate('home');
                app.updateNav();
            } else {
                // New user, create profile
                await this.createUserProfile(uid);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            utils.showToast('Error loading profile', 'error');
        }
    },

    // Create new user profile
    async createUserProfile(uid) {
        try {
            // Generate RegID
            const year = new Date().getFullYear();
            const counterRef = collections.counters.doc(`regId_${year}`);
            
            const regId = await db.runTransaction(async (transaction) => {
                const counterDoc = await transaction.get(counterRef);
                let lastNumber = 0;
                if (counterDoc.exists) {
                    lastNumber = counterDoc.data().lastNumber || 0;
                }
                const newNumber = lastNumber + 1;
                const paddedNumber = newNumber.toString().padStart(3, '0');
                transaction.set(counterRef, { lastNumber: newNumber, year });
                return `SLQ-${year}-${paddedNumber}`;
            });

            const userData = {
                uid,
                email: this.currentUser.email,
                name: document.getElementById('signup-name').value || this.currentUser.email.split('@')[0],
                regId,
                emailVerified: false,
                totalQuizzes: 0,
                totalPoints: 0,
                level: 'Novice',
                currentStreak: 0,
                longestStreak: 0,
                lastQuizDate: null,
                joinedAt: firebase.firestore.FieldValue.serverTimestamp(),
                settings: {
                    theme: 'dark',
                    notifications: true
                },
                achievements: [],
                friends: [],
                blocked: [],
                isAdmin: false
            };

            await collections.users.doc(uid).set(userData);
            this.userData = userData;
            
            // Send email verification
            await this.currentUser.sendEmailVerification();
            document.getElementById('verify-email').textContent = this.currentUser.email;
            app.navigate('verify');
        } catch (error) {
            console.error('Error creating profile:', error);
            utils.showToast('Error creating profile: ' + error.message, 'error');
        }
    },

    // Toggle password visibility
    togglePassword(inputId, button) {
        const input = document.getElementById(inputId);
        const isPassword = input.type === 'password';
        
        input.type = isPassword ? 'text' : 'password';
        button.classList.toggle('active', isPassword);
        button.textContent = isPassword ? '🙈' : '👁️';
    },

    // Set button loading state
    setButtonLoading(buttonId, loading) {
        const btn = document.getElementById(buttonId);
        if (loading) {
            btn.classList.add('loading');
            btn.disabled = true;
        } else {
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    },

    // Shake form on error
    shakeForm(formId) {
        const form = document.getElementById(formId);
        form.classList.add('shake');
        setTimeout(() => form.classList.remove('shake'), 500);
    },

    // Login
    async login() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            utils.showToast('Please fill in all fields', 'error');
            this.shakeForm('login-form');
            return;
        }

        this.setButtonLoading('login-btn', true);
        
        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
            utils.showToast('Welcome back!', 'success');
        } catch (error) {
            console.error('Login error:', error);
            let message = 'Login failed';
            switch (error.code) {
                case 'auth/user-not-found':
                    message = 'No account found with this email';
                    break;
                case 'auth/wrong-password':
                    message = 'Incorrect password';
                    break;
                case 'auth/invalid-email':
                    message = 'Invalid email address';
                    break;
                case 'auth/too-many-requests':
                    message = 'Too many attempts. Please try again later';
                    break;
                case 'auth/invalid-credential':
                    message = 'Invalid email or password';
                    break;
            }
            utils.showToast(message, 'error');
            this.shakeForm('login-form');
        } finally {
            this.setButtonLoading('login-btn', false);
        }
    },

    // Signup
    async signup() {
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;

        if (!name || !email || !password || !confirm) {
            utils.showToast('Please fill in all fields', 'error');
            this.shakeForm('signup-form');
            return;
        }

        if (!utils.isValidEmail(email)) {
            utils.showToast('Please enter a valid email', 'error');
            this.shakeForm('signup-form');
            return;
        }

        if (password.length < 6) {
            utils.showToast('Password must be at least 6 characters', 'error');
            this.shakeForm('signup-form');
            return;
        }

        if (password !== confirm) {
            utils.showToast('Passwords do not match', 'error');
            this.shakeForm('signup-form');
            return;
        }

        this.setButtonLoading('signup-btn', true);
        
        try {
            await firebase.auth().createUserWithEmailAndPassword(email, password);
            // Profile creation handled in auth state listener
        } catch (error) {
            console.error('Signup error:', error);
            let message = 'Signup failed';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    message = 'An account already exists with this email';
                    break;
                case 'auth/invalid-email':
                    message = 'Invalid email address';
                    break;
                case 'auth/weak-password':
                    message = 'Password is too weak';
                    break;
            }
            utils.showToast(message, 'error');
            this.shakeForm('signup-form');
        } finally {
            this.setButtonLoading('signup-btn', false);
        }
    },

    // Logout
    async logout() {
        try {
            await firebase.auth().signOut();
            utils.storage.remove('legend_seen');
            utils.showToast('Logged out successfully', 'success');
        } catch (error) {
            console.error('Logout error:', error);
        }
    },

    // Reset password
    async resetPassword() {
        const email = document.getElementById('login-email').value;
        if (!email) {
            utils.showToast('Please enter your email first', 'error');
            return;
        }

        try {
            await firebase.auth().sendPasswordResetEmail(email);
            utils.showToast('Password reset email sent', 'success');
        } catch (error) {
            utils.showToast('Error sending reset email', 'error');
        }
    },

    // Resend verification email
    async resendVerification() {
        try {
            await this.currentUser.sendEmailVerification();
            utils.showToast('Verification email resent', 'success');
        } catch (error) {
            utils.showToast('Error sending email', 'error');
        }
    },

    // Check verification status
    async checkVerification() {
        utils.showLoading(true);
        try {
            await this.currentUser.reload();
            if (this.currentUser.emailVerified) {
                await collections.users.doc(this.currentUser.uid).update({
                    emailVerified: true
                });
                this.userData.emailVerified = true;
                utils.showToast('Email verified!', 'success');
                app.navigate('home');
            } else {
                utils.showToast('Email not verified yet. Please check your inbox.', 'warning');
            }
        } catch (error) {
            utils.showToast('Error checking verification', 'error');
        } finally {
            utils.showLoading(false);
        }
    },

    // Update user data locally and in Firestore
    async updateUserData(updates) {
        if (!this.currentUser) return;
        
        try {
            await collections.users.doc(this.currentUser.uid).update(updates);
            this.userData = { ...this.userData, ...updates };
        } catch (error) {
            console.error('Error updating user data:', error);
            throw error;
        }
    }
};

// Make auth globally available
window.auth = authModule;

