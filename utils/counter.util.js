import log from "../configs/logger.config.js";
import counterModel from "../models/counter.model.js";

export const getNextSequenceValue = async (key) => {
  const counter = await counterModel.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 50 } },
    { new: true, upsert: true }
  );

  return counter.seq;
};
