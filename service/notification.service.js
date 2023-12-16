const uuid = require('uuid');
const Notification = require("../models/Notification");



async function addNotification(id, body) {
    const externalId = uuid.v4();
    const notification = { ...body, modifiedBy: id, createdBy: id, externalId };

    await Notification.insertOne(notification);
    return notification;
}

async function getNotifications(id, agentId, query) {
    let filter = {
        $or: [{ staffId: id }, { agentId }, { isAnnouncement: true }],
    };

    if (query.type) {
        filter = { ...filter, type: query.type };
    }

    if (query.isRead) {
        filter = { ...filter, isRead: true };
    } else if (query.isUnread) {
        filter = { ...filter, isRead: { $in: [false, undefined] } };
    }

    const notifications = await Notification
        .find(filter)
        .skip(query.perPage * (query.pageNo - 1))
        .limit(query.perPage)
        .sort({ modifiedAt: 1 })
        .toArray();

    let retData = [];

    if (query.group) {
        const dates = Array.from(new Set(notifications.map(notification => notification.createdAt.toDateString())));

        retData = dates.map(date => ({
            date,
            notifications: notifications.filter(notification => notification.createdAt.toDateString() === date),
        }));

        const today = new Date().toDateString();
        if (retData.length && retData[0].date === today) {
            retData[0].date = 'Today';
        }
    } else {
        retData = notifications;
    }

    return {
        data: retData,
        meta: {
            perPage: query.perPage,
            pageNo: query.pageNo,
            total: notifications.length,
        },
    };
}

async function findById(id) {
    const notification = await Notification.findOne({ _id: id });

    if (!notification) {
        throw new Error(`No Notification found for id - ${id}`);
    }

    return notification;
}

async function dismiss(id) {
    const result = await Notification.updateOne({ _id: id }, { $set: { isRead: true } });

    if (result.matchedCount === 0) {
        throw new Error(`No Notification found for id - ${id}`);
    }

    return;
}


module.exports = {
    addNotification,
    getNotifications,
    getNotification: findById,
    dismissNotification: dismiss
};

// Usage example:

// const notificationService = new NotificationService();
// notificationService.addNotification('userId', { title: 'New Notification', description: 'This is a test notification' });
// notificationService.getNotifications('userId', 'agentId', { perPage: 10, pageNo: 1, type: 'info' });
// notificationService.findById('notificationId');
// notificationService.dismiss('notificationId');
