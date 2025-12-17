export const jobRegistry = new Map();
export const getJobName = (lectureId, label) => `${lectureId}_${label.replace(/\s/g, "_")}`;
