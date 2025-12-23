import log from "../configs/logger.config.js";
import quotationModel from "../models/quotation.model.js";
class QuotationDao {
  async generateCRN({ city }) {
    try {
      const normalizedCity = city.trim().toLowerCase();

      const cityCount = await quotationModel.countDocuments({
        "quotationMeta.city": normalizedCity,
      });

      const base = 2512500;
      const sequence = base + cityCount;

      return `${sequence}`;
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
