const Notification = require('../models/notification');

async function sendNotification(io, userId, message, type = 'info') {
  try {
    // Create notification in database
    const notification = await Notification.create({
      userId,
      message,
      type,
      read: false,
      createdAt: new Date()
    });

    // Emit to user's room
    io.to(userId.toString()).emit('new_notification', {
      id: notification._id,
      message,
      type,
      createdAt: notification.createdAt
    });

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

async function markNotificationAsRead(notificationId) {
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

async function getUserNotifications(userId) {
  try {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);
    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

module.exports = {
  sendNotification,
  markNotificationAsRead,
  getUserNotifications
}; 