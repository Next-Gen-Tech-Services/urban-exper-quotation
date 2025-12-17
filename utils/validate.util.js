import log from "../configs/logger.config.js";
import { LECTURE_TYPES } from "../constants/commanconstant.js";
import ROLES from "../constants/constant.js";
import { RESPONSE_MESSAGES } from "../constants/responseMessages.js";
import { validateEmail } from "./common.util.js";

export const validateSignUpData = ({
  name,
  email,
  contact,
  role,
  password,
}) => {
  try {
    // Required fields for all roles
    const requiredFields = { name, email, contact, role };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        throw { status: 400, message: RESPONSE_MESSAGES[key.toUpperCase()] };
      }
    }

    // Role validation
    if (!Object.values(ROLES).includes(role)) {
      throw { status: 400, message: RESPONSE_MESSAGES.INVALID_ROLE };
    }

    // Email validation
    if (!validateEmail(email)) {
      throw { status: 400, message: RESPONSE_MESSAGES.INVALID_EMAIL };
    }

    // Password required only if role is NOT "student"
    if (role !== ROLES.STUDENT && !password) {
      throw { status: 400, message: RESPONSE_MESSAGES.PASSWORD_REQUIRED };
    }

    return true;
  } catch (error) {
    throw {
      status: error.status || 400,
      message: error.message || RESPONSE_MESSAGES.SERVER_ERROR,
    };
  }
};

export const validateVerifyOTPData = ({
  contact,
  otp,
  deviceId,
  countryCode,
}) => {
  try {
    const requiredFields = { contact, otp, deviceId, countryCode };

    for (const [key, value] of Object.entries(requiredFields)) {
      log.info("requiredFields", key, value);

      if (!value) {
        throw { status: 400, message: RESPONSE_MESSAGES[key.toUpperCase()] };
      }
    }

    return true;
  } catch (error) {
    throw {
      status: error.status || 400,
      message: error.message || RESPONSE_MESSAGES.SERVER_ERROR,
    };
  }
};

export const validateResentOTPData = ({ contact, countryCode }) => {
  try {
    const requiredFields = { contact, countryCode };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        throw { status: 400, message: RESPONSE_MESSAGES[key.toUpperCase()] };
      }
    }
    return true;
  } catch (error) {
    throw {
      status: error.status || 400,
      message: error.message || RESPONSE_MESSAGES.SERVER_ERROR,
    };
  }
};

export const validateLoginData = ({
  contact,
  countryCode,
  email,
  password,
  role,
}) => {
  try {
    if (!role) {
      throw { status: 400, message: RESPONSE_MESSAGES.ROLE };
    }

    // Student (OTP-based login)
    if (role === ROLES.STUDENT) {
      if (!contact || !countryCode) {
        throw {
          status: 400,
          message: RESPONSE_MESSAGES.CONTACT_REQUIRED,
        };
      }
    }
    // Non-student (email/password login)
    else {
      if (!email || !password) {
        throw {
          status: 400,
          message: RESPONSE_MESSAGES.EMAIL_PASSWORD_REQUIRED,
        };
      }

      if (!validateEmail(email)) {
        throw { status: 400, message: RESPONSE_MESSAGES.INVALID_EMAIL };
      }
    }

    return true;
  } catch (error) {
    throw {
      status: error.status || 400,
      message: error.message || RESPONSE_MESSAGES.SERVER_ERROR,
    };
  }
};

export const validateGoogleLoginData = ({ token, role, deviceId }) => {
  try {
    if (!token) {
      throw { status: 400, message: RESPONSE_MESSAGES.TOKEN_REQUIRED };
    }

    if (!role) {
      throw { status: 400, message: RESPONSE_MESSAGES.ROLE_REQUIRED };
    }

    if (role && !Object.values(ROLES).includes(role)) {
      throw { status: 400, message: RESPONSE_MESSAGES.INVALID_ROLE };
    }

    if (!deviceId) {
      throw { status: 400, message: RESPONSE_MESSAGES.DEVICEID_REQUIRED };
    }

    return true;
  } catch (error) {
    throw {
      status: error.status || 400,
      message: error.message || RESPONSE_MESSAGES.SERVER_ERROR,
    };
  }
};

export const validateSocialLoginData = ({
  email,
  password,
  providerId,
  provider,
  role,
}) => {
  try {
    const requiredFields = { email, password, providerId, provider, role };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        throw { status: 400, message: RESPONSE_MESSAGES[key.toUpperCase()] };
      }
    }

    if (!validateEmail(email)) {
      throw { status: 400, message: RESPONSE_MESSAGES.INVALID_EMAIL };
    }

    if (!Object.values(ROLES).includes(role)) {
      throw { status: 400, message: RESPONSE_MESSAGES.INVALID_ROLE };
    }

    return true;
  } catch (error) {
    throw {
      status: error.status || 400,
      message: error.message || RESPONSE_MESSAGES.SERVER_ERROR,
    };
  }
};

export const validateForgetPasswordData = ({ email }) => {
  try {
    const requiredFields = { email };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        throw { status: 400, message: RESPONSE_MESSAGES[key.toUpperCase()] };
      }
    }

    if (!validateEmail(email)) {
      throw { status: 400, message: RESPONSE_MESSAGES.INVALID_EMAIL };
    }

    return true;
  } catch (error) {
    throw {
      status: error.status || 400,
      message: error.message || RESPONSE_MESSAGES.SERVER_ERROR,
    };
  }
};

export const validateResetPasswordData = ({ token, newPassword }) => {
  try {
    const requiredFields = { token, newPassword };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        throw { status: 400, message: RESPONSE_MESSAGES[key.toUpperCase()] };
      }
    }

    return true;
  } catch (error) {
    throw {
      status: error.status || 400,
      message: error.message || RESPONSE_MESSAGES.SERVER_ERROR,
    };
  }
};

export const validateCreateCategoryData = ({ name }) => {
  try {
    const requiredFields = { name };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        throw { status: 400, message: RESPONSE_MESSAGES[key.toUpperCase()] };
      }
    }

    return true;
  } catch (error) {
    throw {
      status: error.status || 400,
      message: error.message || RESPONSE_MESSAGES.SERVER_ERROR,
    };
  }
};

export const validateCreateSubCategoryData = ({
  name,
  description,
  categoryId,
}) => {
  try {
    const requiredFields = { name, description, categoryId };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        throw { status: 400, message: RESPONSE_MESSAGES[key.toUpperCase()] };
      }
    }

    return true;
  } catch (error) {
    throw {
      status: error.status || 400,
      message: error.message || RESPONSE_MESSAGES.SERVER_ERROR,
    };
  }
};

export const validateCreateCourseData = ({
  title,
  description,
  thumbnail,
  categoryId,
  subject,
  classYear,
  examType,
  tags,
  price,
  isPaid,
  isPublic,
  visibility,
}) => {
  try {
    const requiredFields = {
      title,
      description,
      thumbnail,
      categoryId,
      subject,
      classYear,
      examType,
      tags,
      price,
      isPaid,
      isPublic,
      visibility,
    };
    log.info("hello");

    for (const [key, value] of Object.entries(requiredFields)) {
      log.info(`key: ${key}, value: ${JSON.stringify(value, null, 2)}`);

      if (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "")
      ) {
        const errorMessage =
          RESPONSE_MESSAGES[key.toUpperCase()] || `${key} is required`;
        throw { status: 400, message: errorMessage };
      }
    }

    log.info("hello brother");

    return true;
  } catch (error) {
    throw {
      status: error.status || 400,
      message: error.message || RESPONSE_MESSAGES.SERVER_ERROR,
    };
  }
};

export const validateCreateQuizData = ({
  title,
  description,
  courseId,
  unitId,
  duration,
  questions,
}) => {
  try {
    const requiredFields = {
      title,
      description,
      courseId,
      unitId,
      duration,
      questions,
    };

    log.info("quiz : validator : validating create quiz data => start");

    for (const [key, value] of Object.entries(requiredFields)) {
      log.info(
        `quiz : validator : checking field => ${key}: ${JSON.stringify(value)}`
      );

      if (
        value === undefined ||
        value === null ||
        (typeof value === "string" && !value.trim()) ||
        (Array.isArray(value) && value.length === 0)
      ) {
        const errorMessage =
          RESPONSE_MESSAGES.QUIZ?.[`${key.toUpperCase()}_REQUIRED`] ||
          `${key} is required`;
        throw { status: 400, message: errorMessage };
      }
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw { status: 400, message: "At least one question is required" };
    }

    questions.forEach((question, qIndex) => {
      if (!question.questionText || !question.questionText.trim()) {
        throw {
          status: 400,
          message: `Question ${qIndex + 1} text is required`,
        };
      }

      if (!Array.isArray(question.options) || question.options.length < 2) {
        throw {
          status: 400,
          message: `Question ${qIndex + 1} must have at least two options`,
        };
      }

      const hasCorrectOption = question.options.some((opt) => opt.isCorrect);
      if (!hasCorrectOption) {
        throw {
          status: 400,
          message: `Question ${
            qIndex + 1
          } must have at least one correct option`,
        };
      }
    });

    log.info("quiz : validator : validation success");
    return true;
  } catch (error) {
    log.error("quiz : validator : validation failed => ", error);
    throw {
      status: error.status || 400,
      message: error.message || RESPONSE_MESSAGES.SERVER_ERROR,
    };
  }
};

export const validateCreateLessonData = ({
  unitId,
  title,
  description,
  videoUrl,
  resources,
  order,
  duration,
  visibility,
  lectureType,
  lectureDate,
  lectureStartTime,
  lectureEndTime,
}) => {
  try {
    const requiredFields = {
      unitId,
      title,
      description,
      resources,
      order,
      visibility,
      lectureType,
    };
    for (const [key, value] of Object.entries(requiredFields)) {
      console.log("key ==>", key);
      console.log("value ==>", value);

      if (!value) {
        throw { status: 400, message: RESPONSE_MESSAGES[key.toUpperCase()] };
      }
    }

    if (lectureType === LECTURE_TYPES.RECORDING) {
      const recordingRequired = { videoUrl, duration };
      for (const [key, value] of Object.entries(recordingRequired)) {
        if (!value) {
          throw {
            status: 400,
            message: `${key} is required`,
          };
        }
      }

      if (order && order <= 0) {
        throw {
          status: 400,
          message: `Order should be positive value only`,
        };
      }
    }

    if (lectureType === LECTURE_TYPES.LIVE) {
      const liveRequired = { lectureDate, lectureStartTime, lectureEndTime };
      for (const [key, value] of Object.entries(liveRequired)) {
        if (!value) {
          throw {
            status: 400,
            message: `${key} is required`,
          };
        }
      }
    }

    return true;
  } catch (error) {
    throw {
      status: error.status || 400,
      message: error.message || RESPONSE_MESSAGES.SERVER_ERROR,
    };
  }
};

//validateAddToCartData
export const validateAddToCartData = ({ studentId, courseId }) => {
  try {
    const requiredFields = { studentId, courseId };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        throw { status: 400, message: RESPONSE_MESSAGES[key.toUpperCase()] };
      }
    }

    return true;
  } catch (error) {
    throw {
      status: error.status || 400,
      message: error.message || RESPONSE_MESSAGES.SERVER_ERROR,
    };
  }
};

export const validateAddToWishlistData = ({ studentId, courseId }) => {
  try {
    const requiredFields = { studentId, courseId };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        throw { status: 400, message: RESPONSE_MESSAGES[key.toUpperCase()] };
      }
    }

    return true;
  } catch (error) {
    throw {
      status: error.status || 400,
      message: error.message || RESPONSE_MESSAGES.SERVER_ERROR,
    };
  }
};

export const validateCreateUnitData = ({
  courseId,
  title,
  description,
  order,
  visibility,
}) => {
  try {
    const requiredFields = {
      courseId,
      title,
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (value === undefined || value === null || value === "") {
        throw {
          status: 400,
          message:
            RESPONSE_MESSAGES.UNIT[key.toUpperCase()] || `${key} is required`,
        };
      }
    }

    if (order && order <= 0) {
      throw {
        status: 400,
        message: `Order should be positive value only`,
      };
    }

    if (visibility) {
      const allowedVisibilities = ["published", "draft", "archived"];

      if (!allowedVisibilities.includes(visibility)) {
        throw {
          status: 400,
          message: `Invalid visibility value. Allowed: published, draft, archived`,
        };
      }
    }

    return true;
  } catch (error) {
    throw {
      status: error.status || 400,
      message: error.message || RESPONSE_MESSAGES.SERVER_ERROR,
    };
  }
};

export const validateCreateReviewData = ({ courseId, rating, description }) => {
  try {
    const requiredFields = {
      courseId,
      rating,
      description,
    };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        throw { status: 400, message: RESPONSE_MESSAGES[key.toUpperCase()] };
      }
    }

    return true;
  } catch (error) {
    throw {
      status: error.status || 400,
      message: error.message || RESPONSE_MESSAGES.SERVER_ERROR,
    };
  }
};

export const validateQuizSubmissionData = ({
  quizId,
  courseId,
  unitId,
  answers,
}) => {
  try {
    const requiredFields = {
      quizId,
      courseId,
      unitId,
      answers,
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "")
      ) {
        throw {
          status: 400,
          message: `${key} is required.`,
        };
      }
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      throw { status: 400, message: "answers must be a non-empty array." };
    }

    for (const [index, ans] of answers.entries()) {
      if (!ans.questionId)
        throw {
          status: 400,
          message: `answers[${index}].questionId is required.`,
        };
      if (!ans.selectedOptionId)
        throw {
          status: 400,
          message: `answers[${index}].selectedOptionId is required.`,
        };
    }

    // if (isNaN(Date.parse(startedAt)))
    //   throw { status: 400, message: "Invalid startedAt timestamp." };
    // if (isNaN(Date.parse(completedAt)))
    //   throw { status: 400, message: "Invalid completedAt timestamp." };

    return true;
  } catch (error) {
    throw {
      status: error.status || 400,
      message: error.message || RESPONSE_MESSAGES.SERVER_ERROR,
    };
  }
};

export const validateCreateQuestionData = ({
  subject,
  chapter,
  topic,
  difficulty,
  type,
  questionText,
  questionImages,
  options,
  correctAnswers,
  tags,
}) => {
  try {
    const requiredFields = { subject, type, questionText, correctAnswers };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "") ||
        (Array.isArray(value) && value.length === 0)
      ) {
        throw { status: 400, message: `${key} is required.` };
      }
    }

    const validSubjects = ["Physics", "Chemistry", "Mathematics", "Biology"];
    const validDifficulties = ["easy", "medium", "hard"];
    const validTypes = ["single", "multiple", "numeric"];

    if (!validSubjects.includes(subject))
      throw { status: 400, message: "Invalid subject value." };

    if (difficulty && !validDifficulties.includes(difficulty))
      throw { status: 400, message: "Invalid difficulty value." };

    if (!validTypes.includes(type))
      throw { status: 400, message: "Invalid question type." };

    if (type === "single" || type === "multiple") {
      if (!Array.isArray(options) || options.length < 2) {
        throw {
          status: 400,
          message: "At least 2 options are required for single/multiple type.",
        };
      }

      for (const [index, opt] of options.entries()) {
        if (!opt.text && !opt.image)
          throw {
            status: 400,
            message: `options[${index}] must have either text or image.`,
          };
      }

      if (type === "single" && correctAnswers.length !== 1)
        throw {
          status: 400,
          message: "Single type question must have exactly one correct answer.",
        };

      if (type === "multiple" && correctAnswers.length < 2)
        throw {
          status: 400,
          message:
            "Multiple type question must have at least two correct answers.",
        };
    }

    if (type === "numeric") {
      if (!Array.isArray(correctAnswers) || correctAnswers.length !== 1) {
        throw {
          status: 400,
          message:
            "Numeric type question must have exactly one correct numeric answer.",
        };
      }

      const numericValue = correctAnswers[0];
      if (isNaN(Number(numericValue))) {
        throw {
          status: 400,
          message: "Numeric question's correct answer must be a valid number.",
        };
      }
    }

    if (tags && !Array.isArray(tags)) {
      throw { status: 400, message: "Tags must be an array." };
    }

    if (chapter && typeof chapter !== "string") {
      throw { status: 400, message: "Chapter must be a string." };
    }
    if (topic && typeof topic !== "string") {
      throw { status: 400, message: "Topic must be a string." };
    }

    return true;
  } catch (error) {
    throw {
      status: error.status || 400,
      message: error.message || "Invalid question data.",
    };
  }
};

export const validateCreateTestData = ({
  title,
  examType,
  description,
  totalDuration,
  sections,
  startTime,
  endTime,
  instructions,
}) => {
  try {
    const requiredFields = {
      title,
      examType,
      totalDuration,
      sections,
      startTime,
      endTime,
      instructions,
    };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "") ||
        (Array.isArray(value) && value.length === 0)
      ) {
        throw { status: 400, message: `${key} is required.` };
      }
    }

    const validExamTypes = ["JEE", "NEET"];
    if (!validExamTypes.includes(examType))
      throw { status: 400, message: "Invalid examType. Allowed: JEE, NEET." };

    if (typeof totalDuration !== "number" || totalDuration <= 0)
      throw {
        status: 400,
        message: "totalDuration must be a positive number (in minutes).",
      };

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime()))
      throw { status: 400, message: "Invalid startTime or endTime format." };
    if (end <= start)
      throw { status: 400, message: "endTime must be greater than startTime." };

    if (!Array.isArray(sections) || sections.length === 0)
      throw { status: 400, message: "At least one section is required." };

    for (const [index, section] of sections.entries()) {
      const {
        name,
        questionIds,
        marksPerQuestion,
        negativePerQuestion,
        duration,
      } = section;

      if (!name || typeof name !== "string")
        throw { status: 400, message: `sections[${index}].name is required.` };

      if (!Array.isArray(questionIds) || questionIds.length === 0)
        throw {
          status: 400,
          message: `sections[${index}].questionIds must be a non-empty array.`,
        };

      if (typeof marksPerQuestion !== "number" || marksPerQuestion <= 0)
        throw {
          status: 400,
          message: `sections[${index}].marksPerQuestion must be a positive number.`,
        };

      if (typeof negativePerQuestion !== "number" || negativePerQuestion < 0)
        throw {
          status: 400,
          message: `sections[${index}].negativePerQuestion must be a non-negative number.`,
        };

      if (duration && (typeof duration !== "number" || duration <= 0)) {
        throw {
          status: 400,
          message: `sections[${index}].duration must be a positive number (in minutes).`,
        };
      }
    }

    if (description && typeof description !== "string")
      throw { status: 400, message: "description must be a string." };

    return true;
  } catch (error) {
    throw {
      status: error.status || 400,
      message: error.message || "Invalid test data.",
    };
  }
};
