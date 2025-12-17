export const sanitizedData = async (userData) => {
  if (userData && typeof userData === "object") {
    const sanitizedData = { ...userData._doc };
    delete sanitizedData.__v;
    delete sanitizedData.password;
    return sanitizedData;
  }
  return userData;
};
