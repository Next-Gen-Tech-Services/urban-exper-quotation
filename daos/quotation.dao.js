import log from "../configs/logger.config.js";
import quotationModel from "../models/quotation.model.js";
class QuotationDao {
  // async generateCRN({ city }) {
  //   try {
  //     const normalizedCity = city.trim().toLowerCase();

  //     const cityCount = await quotationModel.countDocuments({
  //       "quotationMeta.city": normalizedCity,
  //     });

  //     const base = 2512500;
  //     const sequence = base + cityCount;

  //     return `${sequence}`;
  //   } catch (error) {
  //     log.error("Error from [USER DAO]" + error);
  //     throw error;
  //   }
  // }

  //createQuotation

  // async generateCRN() {
  //   try {
  //     const totalCount = await quotationModel.countDocuments({});

  //     const base = 2512500;
  //     const sequence = base + totalCount;
  //     console.log("Generated CRN sequence:", sequence);

  //     return `${sequence}`;
  //   } catch (error) {
  //     log.error("Error from [USER DAO]" + error);
  //     throw error;
  //   }
  // }

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

      return `${cityCode}-${year}-${sequence}`;
    } catch (error) {
      log.error("Error from [USER DAO]" + error);
      throw error;
    }
  }

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
