import dotenv from "dotenv";
dotenv.config();
import counterModel from "../models/counter.model.js";
import mongoose from "mongoose";
import { titleCase } from "../utils/common.util.js";
import { hashItem } from "../utils/bcrypt.util.js";
import log from "../configs/logger.config.js";
import userModel from "../models/user.model.js";
import { ROLES } from "../constants/common.constant.js";
const { MONGO_URI, ADMIN_NAME, ADMIN_CONTACT, ADMIN_EMAIL, ADMIN_PASSWORD } =
  process.env;

const adminsSeeding = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    log.info("Database connected");

    const isExistAdmin = await userModel.findOne({ role: ROLES.ADMIN });

    log.info("isExistAdmin" + isExistAdmin);

    if (isExistAdmin) {
      log.info("admin seeding already done");
      mongoose.connection.close();
      return;
    }

    const hashPassword = await hashItem(ADMIN_PASSWORD);

    let data = {
      name: titleCase(ADMIN_NAME),
      email: ADMIN_EMAIL,
      contact: ADMIN_CONTACT,
      role: ROLES.ADMIN,
      emailVerified: true,
      isActive: true,
      isVerified: true,
      password: hashPassword,
    };

    let user = {
      _id: "user",
      seq: 1,
    };
    const counterExist = await counterModel.findOne({ _id: "user" });
    if (!counterExist) {
      await new counterModel({ _id: "user", seq: 1 }).save();
      log.info("Counter seeding done.");
    }

    const adminInfo = new userModel(data);
    await adminInfo.save();
    log.info("Admins seeded successfully!");

    mongoose.connection.close();
  } catch (error) {
    log.error("Error seeding admins:", error);
    mongoose.connection.close();
  }
};

adminsSeeding();
