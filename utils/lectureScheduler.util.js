import schedule from "node-schedule";
import {
  saveNotification,
  sendNotification,
} from "./sendnotification.utils.js";
import log from "../configs/logger.config.js";
import ROLES from "../constants/constant.js";
import { jobRegistry, getJobName } from "./jobRegistry.util.js";
import unitDao from "../daos/unit.dao.js";
import courseDao from "../daos/course.dao.js";
import enrollmentModel from "../models/enrollment.model.js";

/**
 * Utility: Create Date object for lecture datetime
 */
const getLectureDateTime = (lectureDate, lectureStartTime) => {
  const [year, month, day] = lectureDate.split("-").map(Number);
  const [hours, minutes] = lectureStartTime.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
};

/**
 * Cancel existing scheduled jobs for a given lecture
 */
export const cancelLectureNotifications = (lectureId) => {
  for (const [jobName, job] of jobRegistry.entries()) {
    if (jobName.startsWith(lectureId.toString())) {
      try {
        job.cancel();
        log.info(`Canceled scheduled job: ${jobName}`);
      } catch (e) {
        log.error(`Failed to cancel job ${jobName}:`, e);
      }
      jobRegistry.delete(jobName);
    }
  }
};

const scheduleNotification = async (
  lecture,
  minutesBefore,
  recipients,
  role
) => {
  const lectureTime = getLectureDateTime(
    lecture.lectureDate,
    lecture.lectureStartTime
  );
  const sendTime = new Date(lectureTime.getTime() - minutesBefore * 60000);

  if (sendTime <= new Date()) {
    log.warn(
      `Skipping ${minutesBefore}m reminder for ${lecture.title} (past time)`
    );
    return;
  }

  // Title
  const title =
    role === ROLES.ADMIN
      ? `Your class "${lecture.title}" starts soon`
      : `Upcoming class: ${lecture.title}`;

  // Body
  let body;
  if (minutesBefore === 60) body = "Your class will begin in 1 hours.";
  else if (minutesBefore === 30) body = "Your class will begin in 30 minutes.";
  else if (minutesBefore === 10) body = "Your class will begin in 10 minutes.";
  else
    return log.warn(`No message body defined for ${minutesBefore}m reminder`);

  // Unique job name
  const jobName = getJobName(lecture._id, role, minutesBefore);

  // Prevent duplicates
  if (jobRegistry.has(jobName)) {
    log.info(`Job ${jobName} already exists — skipping duplicate schedule.`);
    return;
  }

  // Schedule the job
  const job = schedule.scheduleJob(sendTime, async () => {
    try {
      log.info(
        `[JOB START] Sending ${role} notifications for "${lecture.title}" (${minutesBefore}m before)`
      );

      for (const userId of recipients) {
        await sendNotification(userId, title, body, {
          lectureId: lecture._id,
          courseId: lecture.courseId,
        });

        await saveNotification(userId, title, body, {
          type: "reminder",
          link: lecture?.guestUrl || "",
        });
      }

      log.info(
        `[JOB DONE] ${role} ${minutesBefore}m reminder executed for "${lecture.title}"`
      );
    } catch (err) {
      log.error(`[JOB ERROR] Failed to send scheduled notification:`, err);
    } finally {
      jobRegistry.delete(jobName); // cleanup
    }
  });

  jobRegistry.set(jobName, job);
  log.info(
    `Scheduled ${role} ${minutesBefore}m reminder for "${
      lecture.title
    }" at ${sendTime?.toISOString()}`
  );
};

export const scheduleLectureNotifications = async (lecture) => {
  try {
    if (!lecture?.lectureDate || !lecture?.lectureStartTime) return;

    // Remove old schedules
    cancelLectureNotifications(lecture._id);

    const unit = await unitDao.getUnitById(lecture.unitId);
    if (!unit) throw new Error("Unit not found");

    const course = await courseDao.getCourseById(unit.courseId);
    if (!course) throw new Error("Course not found");

    // Get enrolled students
    const enrollments = await enrollmentModel
      .find({ courseId: course._id })
      .lean();
    const studentIds = enrollments.map((e) => e.studentId).filter(Boolean);
    const teacherId = lecture.adminId;

    const reminderTimes = [60, 30, 10];

    for (const minutes of reminderTimes) {
      await scheduleNotification(lecture, minutes, studentIds, ROLES.STUDENT);
      if (teacherId) {
        await scheduleNotification(lecture, minutes, [teacherId], ROLES.ADMIN);
      }
    }

    log.info(
      `Lecture "${lecture.title}" notifications scheduled successfully.`
    );
  } catch (error) {
    log.error("Error scheduling lecture notifications:", error);
  }
};
