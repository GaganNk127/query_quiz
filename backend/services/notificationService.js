import * as emailService from './emailService.js';

// In-memory notification storage (in production, use Redis or database)
const notifications = new Map();

// Create notification for quiz assignment
export const createQuizNotification = (candidateId, candidateName, candidateEmail, jobTitle, quizId) => {
  const notification = {
    id: new Date().getTime().toString(),
    type: 'quiz_assigned',
    recipient: candidateId,
    recipientName: candidateName,
    recipientEmail: candidateEmail,
    title: 'New Quiz Assignment',
    message: `You have been assigned a quiz for the position: ${jobTitle}`,
    details: {
      jobTitle,
      quizId,
      assignedAt: new Date(),
      actionRequired: true
    },
    read: false,
    createdAt: new Date()
  };

  // Store notification
  notifications.set(candidateId, notification);

  // Send real email notification
  const frontendUrl = process.env.ALLOWED_ORIGINS || 'http://localhost:5173';
  const quizLink = `${frontendUrl}/candidate/quiz`;
  const expiryDate = notification.details.assignedAt.getTime() + 7 * 24 * 60 * 60 * 1000;

  emailService.sendQuizAssignedEmail(
    candidateEmail,
    candidateName,
    jobTitle,
    quizLink,
    expiryDate
  ).catch(err => console.error('Failed to send quiz assignment email:', err));

  return notification;
};


// Get notifications for a user
export const getUserNotifications = (userId) => {
  const userNotifications = Array.from(notifications.values())
    .filter(notification => notification.recipient === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return userNotifications;
};

// Mark notification as read
export const markNotificationAsRead = (notificationId) => {
  for (let [userId, notification] of notifications.entries()) {
    if (notification.id === notificationId) {
      notification.read = true;
      notifications.set(userId, notification);
      return true;
    }
  }
  return false;
};

// Clear all notifications for a user
export const clearUserNotifications = (userId) => {
  const userNotifications = Array.from(notifications.entries())
    .filter(([_, notification]) => notification.recipient === userId);

  userNotifications.forEach(([key, _]) => {
    notifications.delete(key);
  });

  return userNotifications.length;
};

// Get unread notification count
export const getUnreadNotificationCount = (userId) => {
  return Array.from(notifications.values())
    .filter(notification =>
      notification.recipient === userId && !notification.read
    ).length;
};

// Create notification for quiz results
export const createQuizResultNotification = (candidateId, candidateName, candidateEmail, jobTitle, score, maxScore) => {
  const percentage = Math.round((score / maxScore) * 100);
  const status = percentage >= 70 ? 'Passed' : 'Needs Improvement';

  const notification = {
    id: new Date().getTime().toString(),
    type: 'quiz_completed',
    recipient: candidateId,
    recipientName: candidateName,
    recipientEmail: candidateEmail,
    title: 'Quiz Results Available',
    message: `Your quiz for ${jobTitle} has been graded. Score: ${score}/${maxScore} (${percentage}%) - ${status}`,
    details: {
      jobTitle,
      score,
      maxScore,
      percentage,
      status,
      completedAt: new Date()
    },
    read: false,
    createdAt: new Date()
  };

  // Store notification
  notifications.set(candidateId, notification);

  // Log notification
  console.log(`📧 QUIZ RESULT NOTIFICATION:`);
  console.log(`   To: ${candidateName} (${candidateEmail})`);
  console.log(`   Subject: ${notification.title}`);
  console.log(`   Message: ${notification.message}`);
  console.log(`   Score: ${score}/${maxScore} (${percentage}%)`);
  console.log(`---`);

  return notification;
};

// Create notification for quiz reminder (24 hours before expiry)
export const createQuizReminderNotification = (candidateId, candidateName, candidateEmail, jobTitle, quizId, expiresAt) => {
  const hoursUntilExpiry = Math.floor((new Date(expiresAt) - new Date()) / (1000 * 60 * 60));

  const notification = {
    id: new Date().getTime().toString(),
    type: 'quiz_reminder',
    recipient: candidateId,
    recipientName: candidateName,
    recipientEmail: candidateEmail,
    title: 'Quiz Deadline Reminder',
    message: `Your quiz for ${jobTitle} expires in ${hoursUntilExpiry} hours. Please complete it soon!`,
    details: {
      jobTitle,
      quizId,
      expiresAt,
      hoursUntilExpiry,
      urgent: hoursUntilExpiry <= 24
    },
    read: false,
    createdAt: new Date()
  };

  // Store notification
  notifications.set(candidateId, notification);

  // Log notification
  console.log(`⏰ REMINDER NOTIFICATION:`);
  console.log(`   To: ${candidateName} (${candidateEmail})`);
  console.log(`   Subject: ${notification.title}`);
  console.log(`   Message: ${notification.message}`);
  console.log(`   Expires in: ${hoursUntilExpiry} hours`);
  console.log(`---`);

  return notification;
};

export default {
  createQuizNotification,
  createQuizResultNotification,
  createQuizReminderNotification,
  getUserNotifications,
  markNotificationAsRead,
  clearUserNotifications,
  getUnreadNotificationCount
};
