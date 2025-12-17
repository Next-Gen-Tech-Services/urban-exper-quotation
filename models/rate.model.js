import mongoose from "mongoose";

const RateSchema = new mongoose.Schema(
  {
    region: {
      type: String,
      required: true,
    },
    cities: {
      type: [String],
      required: true,
    },
    rates: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
);

RateSchema.index({ cities: 1 });

export default mongoose.model("Rate", RateSchema);
