import log from "../configs/logger.config.js";
import quotationModel from "../models/quotation.model.js";
class QuotationDao {
  async generateCRN({ city }) {
    try {
      const year = new Date().getFullYear();
      const cityCode = city.trim().substring(0, 3).toUpperCase();
      const count = await quotationModel.countDocuments({
        "quotationMeta.city": city.toLowerCase(),
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      });

      const sequence = String(count + 1).padStart(3, "0");

      return `CRN-${cityCode}-${year}-${sequence}`;
    } catch (error) {
      log.error("Error from [USER DAO]" + error);
      throw error;
    }
  }

  //createQuotation
  async createQuotation(data) {
    try {
      const quotationData = new quotationModel(data);
      const result = await quotationData.save();
      return result;
    } catch (error) {
      log.error("Error from [quotation DAO]" + error);
      throw error;
    }
  }
}
export default new QuotationDao();
