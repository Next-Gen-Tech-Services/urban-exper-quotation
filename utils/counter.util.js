import counter from "../models/counter.model.js";
import log from "../configs/logger.config.js";

export const getNextSequenceValue = async (role) => {
  try {
    const counterData = await counter.findOne({ _id: role });

    if (!counterData) {
      const newCounter = new counter({ _id: role, seq: 1 });
      await newCounter.save();
      return 1;
    }

    const updatedCounter = await counter.findByIdAndUpdate(
      role,
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    return updatedCounter.seq;
  } catch (error) {
    log.error("Error from [COUNTER HELPER]:", error);
    throw error;
  }
};
