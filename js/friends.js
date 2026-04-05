// Friends and Challenges Module
const friends = {
    // Load friends list
    async load() {
        const container = document.getElementById('friends-list');
        container.innerHTML = '<p>Loading friends...</p>';
        
        try {
            const snapshot = await collections.friends
                .where('requesterId', '==', authModule.currentUser.uid)
                .get();
            
            container.innerHTML = '';
            if (snapshot.empty) {
                container.innerHTML = '<p>No friends yet.</p>';
            }

            snapshot.forEach(async doc => {
                const data = doc.data();
                const userDoc = await collections.users.doc(data.recipientId).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    const el = document.createElement('div');
                    el.className = 'friend-card';
                    el.innerHTML = `
                        <span>${userData.name} (${userData.regId})</span>
                        <button onclick="friends.challenge('${userData.uid}')">Challenge</button>
                    `;
                    container.appendChild(el);
                }
            });
        } catch (error) {
            console.error('Error loading friends:', error);
        }
    },

    // Search and Add Friend
    async search() {
        const query = document.getElementById('friend-search').value;
        if (!query) return;

        try {
            const snapshot = await collections.users.where('regId', '==', query).get();
            if (snapshot.empty) {
                utils.showToast('User not found', 'error');
                return;
            }

            const targetUser = snapshot.docs[0].data();
            await collections.friends.add({
                requesterId: authModule.currentUser.uid,
                recipientId: targetUser.uid,
                status: 'pending',
                requestedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            utils.showToast('Friend request sent', 'success');
        } catch (error) {
            utils.showToast('Error adding friend', 'error');
        }
    },

    // Send Challenge
    async challenge(userId) {
        modal.open('challenge-modal');
        // Set target user in modal
    }
};

window.friends = friends;
