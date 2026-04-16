/**
 * Standardized API response helpers.
 * Every route uses these instead of res.json() directly.
 *
 * Success shape: { success: true, data, meta }
 * Error shape:   { success: false, error, status }
 *
 * Ishu can write ONE response handler on the frontend that works everywhere.
 */

function ok(res, data, meta = {}) {
    return res.json({
        success: true,
        data,
        meta: {
            timestamp: new Date().toISOString(),
            ...meta,
        },
    });
}

function paginated(res, data, { total, page, limit, hasMore, nextCursor }) {
    return res.json({
        success: true,
        data,
        meta: {
            timestamp: new Date().toISOString(),
            total,
            page,
            limit,
            hasMore,
            nextCursor: nextCursor || null,
        },
    });
}

function fail(res, status, error) {
    return res.status(status).json({
        success: false,
        error,
        status,
        meta: {
            timestamp: new Date().toISOString(),
        },
    });
}

function notFound(res, resource = 'Resource') {
    return fail(res, 404, `${resource} not found`);
}

function unauthorized(res, message = 'Not authenticated') {
    return fail(res, 401, message);
}

function forbidden(res, message = 'Access denied') {
    return fail(res, 403, message);
}

function serverError(res, err) {
    console.error('Server error:', err);
    return fail(res, 500, err?.message || 'Internal server error');
}

module.exports = { ok, paginated, fail, notFound, unauthorized, forbidden, serverError };