// Export Functionality
const exportModule = {
    // Export Scores as CSV
    async toCSV() {
        try {
            const snapshot = await collections.scores
                .where('userId', '==', authModule.currentUser.uid)
                .get();

            let csv = 'Subject,Difficulty,Score,Correct,Total,Date\n';
            snapshot.forEach(doc => {
                const data = doc.data();
                csv += `${data.subject},${data.difficulty},${data.score},${data.correctAnswers},${data.totalQuestions},${utils.formatDate(data.completedAt)}\n`;
            });

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `scores_${authModule.userData.regId}.csv`;
            a.click();
        } catch (error) {
            console.error('Export error:', error);
        }
    }
};

window.exportModule = exportModule;
