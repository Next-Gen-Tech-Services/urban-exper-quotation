import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
  },
  contact: {
    type: String,
  },
  countryCode: {
    type: String,
  },
});

userSchema.index({ email: 1, contact: 1 });
export default mongoose.model("User", userSchema);
