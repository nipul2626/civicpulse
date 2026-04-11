const { auth, db } = require('../services/firebase');
const { COLLECTIONS } = require('../config/schema');

// Verify Firebase ID token
async function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided', status: 401 });
    }

    try {
        const token = authHeader.split('Bearer ')[1];
        req.user = await auth.verifyIdToken(token);
        next();
    } catch {
        return res.status(403).json({ error: 'Invalid or expired token', status: 403 });
    }
}

// Role-based access — usage: requireRole('coordinator', 'admin')
function requireRole(...roles) {
    return async (req, res, next) => {
        if (!req.user) return res.status(401).json({ error: 'Not authenticated', status: 401 });

        try {
            const userDoc = await db.collection(COLLECTIONS.USERS).doc(req.user.uid).get();
            if (!userDoc.exists) return res.status(403).json({ error: 'User not found', status: 403 });

            const userData = userDoc.data();
            if (!roles.includes(userData.role)) {
                return res.status(403).json({ error: `Requires role: ${roles.join(' or ')}`, status: 403 });
            }

            req.userDoc = userData;
            next();
        } catch (err) {
            return res.status(500).json({ error: err.message, status: 500 });
        }
    };
}

// Org isolation — prevents coordinators from accessing other NGOs' data
async function requireSameOrg(req, res, next) {
    const orgId = req.params.orgId || req.body.orgId;
    if (!orgId) return next(); // no orgId in request, skip check

    if (!req.userDoc) {
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(req.user.uid).get();
        req.userDoc = userDoc.data();
    }

    if (req.userDoc.orgId !== orgId) {
        return res.status(403).json({ error: 'Access denied: different organization', status: 403 });
    }
    next();
}

module.exports = { verifyToken, requireRole, requireSameOrg };