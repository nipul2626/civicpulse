const Sentry = require('@sentry/node');

let isInitialized = false; // ✅ track state

function initSentry() {
    if (!process.env.SENTRY_DSN) {
        console.log('ℹ️  Sentry not configured — add SENTRY_DSN to enable error tracking');
        return;
    }

    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: 0.2,
        beforeSend(event) {
            // Strip any PII from events before sending to Sentry
            if (event.request?.data) {
                const data = event.request.data;
                if (data.phone)    data.phone    = '[REDACTED]';
                if (data.email)    data.email    = '[REDACTED]';
                if (data.location) data.location = '[REDACTED]';
            }
            return event;
        },
    });

    isInitialized = true; // ✅ mark initialized
    console.log('✅ Sentry error tracking initialized');
}

function captureError(err, context = {}) {
    if (!isInitialized) return; // ✅ prevent crash

    Sentry.withScope((scope) => {
        Object.entries(context).forEach(([k, v]) => scope.setExtra(k, v));
        Sentry.captureException(err);
    });
}

function captureMessage(message, context = {}) {
    if (!isInitialized) return; // ✅ prevent crash

    Sentry.withScope((scope) => {
        Object.entries(context).forEach(([k, v]) => scope.setExtra(k, v));
        Sentry.captureMessage(message);
    });
}

module.exports = {
    initSentry,
    captureError,
    captureMessage,
    Sentry,
    isInitialized // ✅ export this
};