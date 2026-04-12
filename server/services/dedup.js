const { db } = require('./firebase');

// Check if a similar need exists in last 24 hours at same location + category
async function findDuplicate(location, category) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const snapshot = await db.collection('needs')
        .where('category', '==', category)
        .where('location', '==', location)
        .where('createdAt', '>=', twentyFourHoursAgo)
        .limit(1)
        .get();

    if (!snapshot.empty) {
        return snapshot.docs[0];
    }
    return null;
}

// Merge by incrementing report count
async function mergeDuplicate(existingDoc, newData) {
    const existing = existingDoc.data();
    await existingDoc.ref.update({
        reportCount: (existing.reportCount || 1) + 1,
        lastReportedAt: new Date(),
        // Keep highest urgency score
        urgencyScore: Math.max(existing.urgencyScore || 1, newData.urgencyScore || 1),
    });
    return existingDoc.id;
}

module.exports = { findDuplicate, mergeDuplicate };