// Friends module
const friends = {
    friendsList: [],
    requests: [],
    challenges: [],

    // Load friends data
    async load() {
        await Promise.all([
            this.loadFriends(),
            this.loadRequests(),
            this.loadChallenges()
        ]);
    },

    // Load friends list
    async loadFriends() {
        const container = document.getElementById('friends-list');
        container.innerHTML = '';
        
        try {
            // Get friendships where user is requester or recipient
            const [sentSnapshot, receivedSnapshot] = await Promise.all([
                collections.friends.where('requesterId', '==', auth.currentUser.uid).get(),
                collections.friends.where('recipientId', '==', auth.currentUser.uid).get()
            ]);
            
            const friendIds = [];
            const friendships = [];
            
            sentSnapshot.forEach(doc => {
                if (doc.data().status === 'accepted') {
                    friendIds.push(doc.data().recipientId);
                    friendships.push({ id: doc.id, ...doc.data() });
                }
            });
            
            receivedSnapshot.forEach(doc => {
                if (doc.data().status === 'accepted') {
                    friendIds.push(doc.data().requesterId);
                    friendships.push({ id: doc.id, ...doc.data() });
                }
            });
            
            if (friendIds.length === 0) {
                container.innerHTML = '<p class="empty">No friends yet. Add some!</p>';
                return;
            }
            
            // Load friend details
            for (const friendId of friendIds) {
                const userDoc = await collections.users.doc(friendId).get();
                if (userDoc.exists) {
                    const data = userDoc.data();
                    const card = document.createElement('div');
                    card.className = 'friend-card';
                    card.innerHTML = `
                        <div class="friend-info">
                            <div style="position: relative;">
                                <div class="friend-avatar">👤</div>
                                <span class="friend-status"></span>
                            </div>
                            <div>
                                <strong>${data.name}</strong>
                                <span style="color: var(--text-secondary); display: block; font-size: 0.9rem;">
                                    ${data.regId} • ${data.level}
                                </span>
                            </div>
                        </div>
                        <div class="friend-actions">
                            <button onclick="friends.compareStats('${friendId}')" class="btn-secondary">Compare</button>
                            <button onclick="friends.challengeFriend('${friendId}')" class="btn-primary">Challenge</button>
                        </div>
                    `;
                    container.appendChild(card);
                }
            }
            
        } catch (error) {
            console.error('Error loading friends:', error);
        }
    },

    // Load pending requests
    async loadRequests() {
        const container = document.getElementById('requests-list');
        container.innerHTML = '';
        
        try {
            const snapshot = await collections.friends
                .where('recipientId', '==', auth.currentUser.uid)
                .where('status', '==', 'pending')
                .get();
            
            document.getElementById('request-count').textContent = snapshot.size;
            
            if (snapshot.empty) {
                container.innerHTML = '<p class="empty">No pending requests</p>';
                return;
            }
            
            snapshot.forEach(doc => {
                const data = doc.data();
                // Load requester info
                collections.users.doc(data.requesterId).get().then(userDoc => {
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        const card = document.createElement('div');
                        card.className = 'request-card';
                        card.innerHTML = `
                            <div class="friend-info">
                                <div class="friend-avatar">👤</div>
                                <div>
                                    <strong>${userData.name}</strong>
                                    <span style="color: var(--text-secondary); display: block; font-size: 0.9rem;">
                                        ${userData.regId}
                                    </span>
                                </div>
                            </div>
                            <div class="friend-actions">
                                <button onclick="friends.acceptRequest('${doc.id}')" class="btn-success">Accept</button>
                                <button onclick="friends.declineRequest('${doc.id}')" class="btn-danger">Decline</button>
                            </div>
                        `;
                        container.appendChild(card);
                    }
                });
            });
            
        } catch (error) {
            console.error('Error loading requests:', error);
        }
    },

    // Load challenges
    async loadChallenges() {
        const container = document.getElementById('challenges-list');
        container.innerHTML = '';
        
        try {
            const snapshot = await collections.challenges
                .where('challengedId', '==', auth.currentUser.uid)
                .where('status', '==', 'pending')
                .get();
            
            document.getElementById('challenge-count').textContent = snapshot.size;
            
            if (snapshot.empty) {
                container.innerHTML = '<p class="empty">No active challenges</p>';
                return;
            }
            
            snapshot.forEach(doc => {
                const data = doc.data();
                // Load challenger info
                collections.users.doc(data.challengerId).get().then(userDoc => {
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        const card = document.createElement('div');
                        card.className = 'request-card';
                        card.innerHTML = `
                            <div class="friend-info">
                                <div class="friend-avatar">🏆</div>
                                <div>
                                    <strong>Challenge from ${userData.name}</strong>
                                    <span style="color: var(--text-secondary); display: block; font-size: 0.9rem;">
                                        ${data.subject} • ${data.difficulty}
                                    </span>
                                </div>
                            </div>
                            <div class="friend-actions">
                                <button onclick="friends.acceptChallenge('${doc.id}')" class="btn-success">Accept</button>
                                <button onclick="friends.declineChallenge('${doc.id}')" class="btn-danger">Decline</button>
                            </div>
                        `;
                        container.appendChild(card);
                    }
                });
            });
            
        } catch (error) {
            console.error('Error loading challenges:', error);
        }
    },

    // Search for friend
    async search() {
        const query = document.getElementById('friend-search').value.trim();
        if (!query) return;
        
        utils.showLoading(true);
        
        try {
            let userDoc = null;
            
            // Search by RegID
            if (query.startsWith('SLQ-')) {
                const snapshot = await collections.users.where('regId', '==', query).get();
                if (!snapshot.empty) {
                    userDoc = snapshot.docs[0];
                }
            } else {
                // Search by email
                const snapshot = await collections.users.where('email', '==', query).get();
                if (!snapshot.empty) {
                    userDoc = snapshot.docs[0];
                }
            }
            
            if (!userDoc) {
                utils.showToast('User not found', 'error');
                return;
            }
            
            if (userDoc.id === auth.currentUser.uid) {
                utils.showToast('You cannot add yourself', 'error');
                return;
            }
            
            // Check if already friends
            const existing = await collections.friends
                .where('requesterId', 'in', [auth.currentUser.uid, userDoc.id])
                .where('recipientId', 'in', [auth.currentUser.uid, userDoc.id])
                .get();
            
            if (!existing.empty) {
                utils.showToast('Friend request already exists or you are already friends', 'warning');
                return;
            }
            
            // Send friend request
            await collections.friends.add({
                requesterId: auth.currentUser.uid,
                recipientId: userDoc.id,
                status: 'pending',
                requestedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            utils.showToast('Friend request sent!', 'success');
            document.getElementById('friend-search').value = '';
            
        } catch (error) {
            console.error('Error sending request:', error);
            utils.showToast('Error sending request', 'error');
        } finally {
            utils.showLoading(false);
        }
    },

    // Accept friend request
    async acceptRequest(requestId) {
        try {
            await collections.friends.doc(requestId).update({
                status: 'accepted',
                acceptedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            utils.showToast('Friend request accepted!', 'success');
            this.load();
        } catch (error) {
            utils.showToast('Error accepting request', 'error');
        }
    },

    // Decline friend request
    async declineRequest(requestId) {
        try {
            await collections.friends.doc(requestId).delete();
            utils.showToast('Friend request declined', 'success');
            this.load();
        } catch (error) {
            utils.showToast('Error declining request', 'error');
        }
    },

    // Show challenge modal
    challengeFriend(friendId) {
        // Populate friend select
        const select = document.getElementById('challenge-friend');
        select.innerHTML = `<option value="${friendId}">Selected Friend</option>`;
        modal.open('challenge-modal');
    },

    // Create challenge (from modal)
    createChallenge() {
        modal.open('challenge-modal');
        // Populate with all friends
        const select = document.getElementById('challenge-friend');
        select.innerHTML = '';
        // Would populate from friends list
    },

    // Send challenge
    async sendChallenge() {
        const subject = document.getElementById('challenge-subject').value;
        const difficulty = document.getElementById('challenge-difficulty').value;
        const friendId = document.getElementById('challenge-friend').value;
        
        try {
            await collections.challenges.add({
                challengerId: auth.currentUser.uid,
                challengedId: friendId,
                subject,
                difficulty,
                questionCount: 15,
                timeLimit: 30,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            utils.showToast('Challenge sent!', 'success');
            modal.close('challenge-modal');
            
        } catch (error) {
            utils.showToast('Error sending challenge', 'error');
        }
    },

    // Accept challenge
    async acceptChallenge(challengeId) {
        // Would start quiz with challenge parameters
        utils.showToast('Starting challenge...', 'success');
    },

    // Decline challenge
    async declineChallenge(challengeId) {
        try {
            await collections.challenges.doc(challengeId).update({
                status: 'declined'
            });
            utils.showToast('Challenge declined', 'success');
            this.load();
        } catch (error) {
            utils.showToast('Error declining challenge', 'error');
        }
    },

    // Compare stats with friend
    compareStats(friendId) {
        // Would show side-by-side comparison
        utils.showToast('Stats comparison coming soon!', 'info');
    },

    // Show tab
    showTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        event.target.classList.add('active');
        document.getElementById(`${tab}-tab`).classList.add('active');
    }
};

window.friends = friends;
