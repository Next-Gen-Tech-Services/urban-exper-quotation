import { titleCase } from "../utils/common.util.js";
import { hashItem } from "../utils/bcrypt.util.js";

export const createUserPayload = async ({
  name,
  email,
  contact,
  countryCode,
  password,
  role,
}) => ({
  name: titleCase(name),
  email: email.toLowerCase(),
  contact,
  countryCode,
  password: await hashItem(password),
  role,
});

export const mapUserResponse = (user) => ({
  _id: user._id,
  name: user?.name,
  email: user?.email,
  contact: user?.contact,
  countryCode: user?.countryCode,
  role: user.role,
  avatarUrl: user?.avatarUrl ? user?.avatarUrl : "",
});
