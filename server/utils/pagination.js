/**
 * Cursor-based pagination helper for Firestore.
 *
 * Why cursor-based instead of page numbers:
 * - Page numbers break when new records are inserted (page 2 shifts)
 * - Cursors always point to a specific document — stable across inserts
 * - Firestore's startAfter() is built for this pattern
 *
 * Usage in a route:
 *   const { query, limit } = buildPaginatedQuery(
 *     db.collection('needs').where('orgId', '==', orgId),
 *     req.query,
 *     'createdAt'
 *   );
 *   const snap = await query.get();
 *   const { data, meta } = formatPaginatedResponse(snap, limit, 'createdAt');
 *   return paginated(res, data, meta);
 */

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Applies pagination params to a Firestore query.
 * Returns { query, limit } ready to call .get() on.
 */
async function buildPaginatedQuery(baseQuery, queryParams, orderField = 'createdAt', orderDir = 'desc') {
    const limit = Math.min(
        parseInt(queryParams.limit) || DEFAULT_LIMIT,
        MAX_LIMIT
    );

    let query = baseQuery.orderBy(orderField, orderDir).limit(limit + 1); // fetch +1 to detect hasMore

    // If cursor provided, start after that document
    if (queryParams.cursor) {
        try {
            const { db } = require('../services/firebase');

            // cursor is the document ID of the last item from previous page
            // We need to fetch that doc to use as startAfter
            const cursorDoc = await db.collection(
                // Extract collection from query — we pass it explicitly
                queryParams._collection
            ).doc(queryParams.cursor).get();

            if (cursorDoc.exists) {
                query = query.startAfter(cursorDoc);
            }
        } catch (err) {
            console.warn('Invalid pagination cursor:', err.message);
        }
    }

    return { query, limit };
}

/**
 * Formats Firestore snapshot into paginated response.
 * Detects hasMore by checking if we got limit+1 results.
 */
function formatPaginatedResponse(snap, limit, idField = 'id') {
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const hasMore = docs.length > limit;

    if (hasMore) docs.pop(); // remove the extra doc we fetched

    const nextCursor = hasMore ? docs[docs.length - 1]?.id : null;

    return {
        data: docs,
        meta: {
            count: docs.length,
            hasMore,
            nextCursor,
            limit,
        },
    };
}

module.exports = { buildPaginatedQuery, formatPaginatedResponse, DEFAULT_LIMIT, MAX_LIMIT };