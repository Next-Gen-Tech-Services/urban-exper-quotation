import quotationService from "../services/quotation.service.js";
import paymentService from "../hook/payment.hook.js";

class QuotationController {
  //createQuotation
  async createQuotation(req, res) {
    try {
      const result = await quotationService.createQuotationService(req, res);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getPricing(req, res) {
    try {
      const result = await quotationService.getPricingService(req, res);
      return result;
    } catch (error) {
      throw error;
    }
  }

  //generateCRN
  async generateCRN(req, res) {
    try {
      const result = await quotationService.generateCRNService(req, res);
      return result;
    } catch (error) {
      throw error;
    }
  }

  //paymentLinkHook
  async paymentLinkHook(req, res) {
    try {
      const result = await paymentService.paymentLinkHook(req, res);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

export default new QuotationController();
