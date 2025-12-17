import { sendFail, sendSuccess } from "../response/response.js";
import { STATUS_CODES } from "../constants/common.constant.js";
import log from "../configs/logger.config.js";

import { RESPONSE_MESSAGES } from "../response/response.message.js";
import { generateQuotationPdf } from "./../utils/pdfgenerate.util.js";
import rateDao from "../daos/rate.dao.js";
import quotationDao from "../daos/quotation.dao.js";
import rateModel from "../models/rate.model.js";
import paymentService from "../hook/payment.hook.js";

class QuotationService {
  async createQuotationService(req, res) {
    try {
      const {
        city,
        region,
        crn,
        customerName,
        customerContact,
        customerAddress,
        items,
        discountPercent = 0,
      } = req.body;

      if (!city || !crn || !items?.length) {
        return res.status(400).json({
          ok: false,
          message: "Missing required fields",
        });
      }

      const rateDoc = await rateModel
        .findOne({
          region: region.toLowerCase(),
          cities: city.toLowerCase(),
        })
        .lean();

      if (!rateDoc) {
        return res.status(404).json({
          ok: false,
          message: "Rate not found for this city",
        });
      }

      console.log("rateDoc--------->", rateDoc);

      let subTotal = 0;

      const computedItems = items.map((item) => {
        const categoryRates = rateDoc.rates[item.category];
        if (!categoryRates) {
          throw new Error(`Category rate not found: ${item.category}`);
        }

        console.log("categoryRates--------->", categoryRates);

        const productRate = categoryRates.find(
          (r) => r.product === item.product
        );

        if (!productRate) {
          throw new Error(`Rate not found for product: ${item.product}`);
        }

        console.log("productRate--------->", productRate);

        const rate =
          item.process === "fresh" ? productRate.fresh : productRate.re;

        if (!rate) {
          throw new Error(`Rate missing for ${item.product} (${item.process})`);
        }

        console.log("rate--------->", rate);

        const amount = +(rate * item.areaSqFt).toFixed(2);
        subTotal += amount;

        console.log("amount--------->", amount);

        return {
          category: item.category,
          process: item.process === "fresh" ? "Fresh Paint" : "Re-Paint",
          area: item.area,
          product: item.product,
          areaSqFt: item.areaSqFt,
          ratePerSqFt: rate,
          amount,
        };
      });

      console.log("computedItems====>", computedItems);

      const discountAmount = +((subTotal * discountPercent) / 100).toFixed(2);

      const payableAmount = +(subTotal - discountAmount).toFixed(2);

      const quotationData = {
        city,
        customer: {
          crn,
          name: customerName,
          contact: customerContact,
          address: customerAddress,
        },
        items: computedItems,
        subTotal,
        discountAmount,
        payableAmount,
        discountPercent,
      };

      console.log("quotationData ====>", quotationData);

      /*==================== generate payment link ====*/
      const paymentLinkResult = await paymentService.generatePaymentLink(
        payableAmount,
        customerName,
        customerContact,
        crn
      );

      console.log("paymentLinkResult===>", paymentLinkResult);
      quotationData.paymentLink = paymentLinkResult.paymentLink;

      console.log("quotationData===>", quotationData);
      /* ================= PDF ================= */
      const result = await generateQuotationPdf(quotationData);

      const pdfUrl = `${req.protocol}://${req.get("host")}/uploads/quotations/${
        result.filename
      }`;

      let data = {
        quotationMeta: {
          quotationDate: new Date(),
          crn,
          city,
          region,
        },
        customer: {
          name: customerName,
          mobile: customerContact,
          address: customerAddress,
        },
        areaPricingDetails: computedItems,
        pricingSummary: {
          subTotal,
          promotionalDiscount: discountAmount,
          payableAmount,
        },
        pdf: {
          filename: result.filename,
          filepath: result.filepath,
          url: pdfUrl,
        },
      };
      const quotation = await quotationDao.createQuotation(data);

      return res.json({
        success: true,
        message: "Quotation PDF generated successfully",
        data: { url: result?.filepath, quoteId: result?.quoteId },
      });
    } catch (error) {
      console.error("Quotation Service Error:", error);
      return res.status(500).json({
        ok: false,
        message: error.message || "Server error",
      });
    }
  }

  //getPricingService
  async getPricingService(req, res) {
    try {
      const { city } = req.query;
      log.info(
        "quotation : pricing request =>\n" + JSON.stringify(req.body, null, 2)
      );
      const result = await rateDao.getRateByCity({ city: city.trim() });

      if (result) {
        return sendSuccess(
          res,
          RESPONSE_MESSAGES.RATE_LIST_FOUND,
          STATUS_CODES.SUCCESS,
          result
        );
      } else {
        return sendFail(
          res,
          RESPONSE_MESSAGES.NOT_FOUND("Rate"),
          STATUS_CODES.NOT_FOUND
        );
      }
    } catch (error) {
      log.error("error from [SIGNUP SERVICE]: ", error);
      return sendFail(
        res,
        error.message || RESPONSE_MESSAGES.SERVER_ERROR,
        error.status || STATUS_CODES.SERVER_ERROR
      );
    }
  }

  //generateCRNService
  async generateCRNService(req, res) {
    try {
      const { city } = req.body;
      log.info(
        "quotation : Generate CRN request =>\n" +
          JSON.stringify(req.body, null, 2)
      );

      const result = await quotationDao.generateCRN({ city });

      if (result) {
        return sendSuccess(
          res,
          RESPONSE_MESSAGES.CRN_GENERATED,
          STATUS_CODES.SUCCESS,
          result
        );
      } else {
        return sendFail(
          res,
          RESPONSE_MESSAGES.ERROR_OCCURED,
          STATUS_CODES.NOT_IMPLEMENTED
        );
      }
    } catch (error) {
      log.error("error from [GENERATE CRN SERVICE]: ", error);
      return sendFail(
        res,
        error.message || RESPONSE_MESSAGES.SERVER_ERROR,
        error.status || STATUS_CODES.SERVER_ERROR
      );
    }
  }
}

export default new QuotationService();
