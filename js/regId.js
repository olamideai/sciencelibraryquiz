// RegID Generator Logic
const regId = {
    // Generate unique sequential RegID
    async generate() {
        const year = new Date().getFullYear();
        const counterRef = collections.counters.doc(`regId_${year}`);

        try {
            const result = await db.runTransaction(async (transaction) => {
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

            return result;
        } catch (error) {
            console.error('Error generating RegID:', error);
            throw error;
        }
    }
};

window.regId = regId;
