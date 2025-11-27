import mongoose from 'mongoose';

const ResponseSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['vqa', 'grounding', 'captioning'],
    required: true,
  },
  prompt: {
    type: String,
    required: true,
    trim: true,
  },
  response: {
    type: mongoose.Schema.Types.Mixed, // Can be string, object, or array depending on type
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ChatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true, // Satellite image URL for this chat session
    },
    routine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Routine',
      default: null, // Optional: Link to routine if this chat was created from a routine
    },
    isFirst: {
      type: Boolean,
      default: true, // First chat session for this user
    },
    responses: [ResponseSchema], // Array of analysis responses
    metadata: {
      imageSize: String, // e.g., "1024x1024"
      uploadedAt: Date,
      processingTime: Number, // Total processing time in milliseconds
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
ChatSchema.index({ user: 1, createdAt: -1 });
ChatSchema.index({ routine: 1 });

export default mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
