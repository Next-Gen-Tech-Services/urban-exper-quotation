import log from "../configs/logger.config.js";
import rateModel from "../models/rate.model.js";

class RateDao {
  async getRateByCity({ city }) {
    try {
      const normalizedCity = city.trim().toLowerCase();

      const result = await rateModel.findOne(
        { cities: normalizedCity },
        {
          region: 1,
          rates: 1,
          cities: { $elemMatch: { $eq: normalizedCity } },
        }
      );

      log.info("rate list --->\n" + JSON.stringify(result, null, 2));

      return result;
    } catch (error) {
      log.error("Error from [RATE DAO] " + error);
      throw error;
    }
  }
}

export default new RateDao();
