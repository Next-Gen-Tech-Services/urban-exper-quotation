import mongoose from "mongoose";
const { Schema } = mongoose;

const QuotationSchema = new Schema(
  {
    quotationMeta: {
      quotationDate: {
        type: Date,
        required: true,
      },
      crn: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
        lowercase: true,
      },
      region: {
        type: String,
      },
    },

    customer: {
      name: {
        type: String,
        required: true,
      },
      mobile: {
        type: String,
        required: true,
      },
      email: {
        type: String,
      },
      address: {
        type: String,
      },
    },
    areaPricingDetails: [
      {
        category: {
          type: String,
          required: true,
        },
        product: {
          type: String,
          required: true,
        },
        process: {
          type: String,
        },
        areaSqFt: {
          type: Number,
          required: true,
        },
        ratePerSqFt: {
          type: Number,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
      },
    ],

    pricingSummary: {
      subTotal: {
        type: Number,
        required: true,
      },
      promotionalDiscount: {
        type: Number,
        required: false,
      },
      additionalDiscount: {
        type: Number,
      },
      payableAmount: {
        type: Number,
        required: true,
      },
    },
    pdf: {
      filename: String,
      filepath: String,
      url: String,
    },
  },
  {
    timestamps: true,
  }
);

QuotationSchema.index({ "quotationMeta.crn": 1 }, { unique: true });
QuotationSchema.index({ "quotationMeta.city": 1 });
QuotationSchema.index({ createdAt: -1 });

export default mongoose.model("Quotation", QuotationSchema);
