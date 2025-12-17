import log from "../configs/logger.config.js";
import userModel from "../models/user.model.js";
class UserDao {
  async getUserById({ userId }) {
    try {
      const result = await userModel.findOne({ _id: userId });

      return result;
    } catch (error) {
      log.error("Error from [USER DAO]" + error);
      throw error;
    }
  }

  async getUserByEmail({ email }) {
    try {
      const result = await userModel.findOne({ email: email?.toLowerCase() });

      return result;
    } catch (error) {
      log.error("Error from [USER DAO]" + error);
      throw error;
    }
  }
}
export default new UserDao();
