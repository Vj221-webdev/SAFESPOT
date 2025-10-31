import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";

// Create a notification in Firebase
export const createNotification = async (userId, type, title, message, reportId = null) => {
  try {
    await addDoc(collection(db, "notifications"), {
      userId,
      type,
      title,
      message,
      reportId,
      read: false,
      createdAt: serverTimestamp(),
    });
    console.log("Notification created successfully");
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

// Send browser push notification (if user has enabled it)
export const sendPushNotification = async (title, message) => {
  // Check if notifications are supported
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return;
  }

  // Check permission
  if (Notification.permission === "granted") {
    new Notification(title, {
      body: message,
      icon: "/logo192.png", // Your app logo
      badge: "/logo192.png",
      tag: "community-safety",
      requireInteraction: false,
    });
  }
};

// Request notification permission from user
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

// Notification event handlers - call these when events happen

// 1. When admin approves a report
export const notifyReportApproved = async (reportId, userId) => {
  try {
    const reportDoc = await getDoc(doc(db, "reports", reportId));
    const reportData = reportDoc.data();

    await createNotification(
      userId,
      "report_approved",
      "Report Approved! ✅",
      `Your report "${reportData?.title || 'Untitled'}" has been approved by an administrator.`,
      reportId
    );

    // Send push notification
    await sendPushNotification(
      "Report Approved!",
      `Your report "${reportData?.title || 'Untitled'}" has been approved.`
    );
  } catch (error) {
    console.error("Error sending approval notification:", error);
  }
};

// 2. When admin rejects a report
export const notifyReportRejected = async (reportId, userId, reason = "") => {
  try {
    const reportDoc = await getDoc(doc(db, "reports", reportId));
    const reportData = reportDoc.data();

    await createNotification(
      userId,
      "report_rejected",
      "Report Status Update",
      `Your report "${reportData?.title || 'Untitled'}" was not approved. ${reason}`,
      reportId
    );

    await sendPushNotification(
      "Report Status Update",
      `Your report "${reportData?.title || 'Untitled'}" was not approved.`
    );
  } catch (error) {
    console.error("Error sending rejection notification:", error);
  }
};

// 3. When admin adds notes to a report
export const notifyAdminNote = async (reportId, userId) => {
  try {
    const reportDoc = await getDoc(doc(db, "reports", reportId));
    const reportData = reportDoc.data();

    await createNotification(
      userId,
      "admin_note",
      "Admin Added a Note 📝",
      `An administrator added a note to your report: "${reportData?.title || 'Untitled'}"`,
      reportId
    );

    await sendPushNotification(
      "Admin Added a Note",
      `Check your report: "${reportData?.title || 'Untitled'}"`
    );
  } catch (error) {
    console.error("Error sending admin note notification:", error);
  }
};

// 4. When a report is resolved
export const notifyReportResolved = async (reportId, userId) => {
  try {
    const reportDoc = await getDoc(doc(db, "reports", reportId));
    const reportData = reportDoc.data();

    await createNotification(
      userId,
      "report_resolved",
      "Issue Resolved! 🎉",
      `Great news! Your report "${reportData?.title || 'Untitled'}" has been resolved.`,
      reportId
    );

    await sendPushNotification(
      "Issue Resolved!",
      `Your report "${reportData?.title || 'Untitled'}" has been resolved.`
    );
  } catch (error) {
    console.error("Error sending resolved notification:", error);
  }
};

// 5. When status changes to "In Progress"
export const notifyReportInProgress = async (reportId, userId) => {
  try {
    const reportDoc = await getDoc(doc(db, "reports", reportId));
    const reportData = reportDoc.data();

    await createNotification(
      userId,
      "report_in_progress",
      "Report In Progress 🔄",
      `Your report "${reportData?.title || 'Untitled'}" is now being worked on!`,
      reportId
    );

    await sendPushNotification(
      "Report In Progress",
      `Your report is now being worked on!`
    );
  } catch (error) {
    console.error("Error sending in-progress notification:", error);
  }
};

// 6. When an urgent report is submitted nearby (optional - needs geolocation)
export const notifyNearbyUrgent = async (userIds, reportId) => {
  try {
    const reportDoc = await getDoc(doc(db, "reports", reportId));
    const reportData = reportDoc.data();

    // Send to multiple users
    const promises = userIds.map(userId =>
      createNotification(
        userId,
        "nearby_urgent",
        "⚠️ Urgent Report Nearby",
        `An urgent ${reportData?.category || 'safety'} issue was reported near you: "${reportData?.title || 'Untitled'}"`,
        reportId
      )
    );

    await Promise.all(promises);

    await sendPushNotification(
      "⚠️ Urgent Report Nearby",
      `An urgent ${reportData?.category || 'safety'} issue was reported near you.`
    );
  } catch (error) {
    console.error("Error sending nearby urgent notification:", error);
  }
};

// Test notification (for debugging)
export const sendTestNotification = async (userId) => {
  await createNotification(
    userId,
    "test",
    "Test Notification 🔔",
    "This is a test notification. Your notification system is working!",
    null
  );

  await sendPushNotification(
    "Test Notification",
    "Your notification system is working!"
  );
};