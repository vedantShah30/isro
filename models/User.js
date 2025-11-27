import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    googleProviderId: {
      type: String,
      required: true,
      unique: true,
    },
    isTooltip: {
      type: Boolean,
      default: true, // Show tooltips for new users
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for faster queries
// UserSchema.index({ email: 1 });
// UserSchema.index({ googleProviderId: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);
