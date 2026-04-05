// Admin Panel Module
const admin = {
    isAuthenticated: false,

    // Access control
    async login() {
        const pin = document.getElementById('admin-pin').value;
        if (pin === ADMIN_PIN) {
            this.isAuthenticated = true;
            document.getElementById('admin-login').classList.add('hidden');
            document.getElementById('admin-dashboard').classList.remove('hidden');
            this.loadStats();
        } else {
            utils.showToast('Invalid PIN', 'error');
        }
    },

    // Load admin panel
    async load() {
        if (!this.isAuthenticated) {
            document.getElementById('admin-login').classList.remove('hidden');
            document.getElementById('admin-dashboard').classList.add('hidden');
        } else {
            this.loadStats();
        }
    },

    // Load Stats
    async loadStats() {
        try {
            const users = await collections.users.get();
            document.getElementById('admin-users').textContent = users.size;
            
            // Other stats
        } catch (error) {
            console.error('Admin stats error:', error);
        }
    },

    // Subjects management
    async updateSubject(subject, field, value) {
        try {
            await collections.subjectSettings.doc(subject).update({ [field]: value });
            utils.showToast('Updated successfully', 'success');
        } catch (error) {
            utils.showToast('Update failed', 'error');
        }
    }
};

window.admin = admin;
