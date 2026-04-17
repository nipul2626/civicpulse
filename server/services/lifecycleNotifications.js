const { sendSMS, sendWhatsApp } = require('./twilioService');
const { sendPushNotification } = require('./notificationService');
const { db } = require('./firebase');
const { COLLECTIONS } = require('../config/schema');

async function notifyOnNeedStatusChange(needId, newStatus) {
    try {
        const needDoc = await db.collection(COLLECTIONS.NEEDS).doc(needId).get();
        if (!needDoc.exists) return;
        const need = needDoc.data();

        const MESSAGES = {
            assigned: {
                English: `🙌 Good news! A volunteer has been assigned to your report "${need.title?.substring(0, 40)}". Help is on the way.`,
                Hindi:   `🙌 अच्छी खबर! आपकी रिपोर्ट के लिए एक स्वयंसेवक नियुक्त हुआ है। मदद आ रही है।`,
                Marathi: `🙌 चांगली बातमी! तुमच्या तक्रारीसाठी स्वयंसेवक नियुक्त झाला आहे.`,
            },
            resolved: {
                English: `✅ Your report "${need.title?.substring(0, 40)}" has been resolved. Thank you for reaching out!`,
                Hindi:   `✅ आपकी रिपोर्ट हल हो गई है। हमसे संपर्क करने के लिए धन्यवाद!`,
                Marathi: `✅ तुमची तक्रार सोडवली गेली आहे. आमच्याशी संपर्क केल्याबद्दल धन्यवाद!`,
            },
        };

        const lang = need.detectedLanguage || 'English';
        const messageSet = MESSAGES[newStatus];
        if (!messageSet) return;

        const message = messageSet[lang] || messageSet.English;

        // SMS/WhatsApp notification
        if (need.submitterPhone) {
            if (need.submittedVia === 'whatsapp') {
                await sendWhatsApp(`whatsapp:${need.submitterPhone}`, message);
            } else {
                await sendSMS(need.submitterPhone, message);
            }
        }

        // FCM push if they have an account
        if (need.reportedBy && !need.reportedBy.includes(':')) {
            await sendPushNotification(need.reportedBy, {
                title: newStatus === 'assigned' ? '🙌 Help is coming!' : '✅ Issue Resolved',
                body: message,
                data: { needId, status: newStatus, type: 'need_status_change' },
            });
        }
    } catch (err) {
        console.warn('Lifecycle notification failed:', err.message);
    }
}

module.exports = { notifyOnNeedStatusChange };