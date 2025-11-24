import mongoose from 'mongoose';

const PromptItemSchema = new mongoose.Schema({
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
  order: {
    type: Number,
    required: true, // To maintain the sequence of prompts
  },
});

const RoutineSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    prompts: [PromptItemSchema], // Array of prompts with their types and order
    isActive: {
      type: Boolean,
      default: true, // User can archive/deactivate routines
    },
    usageCount: {
      type: Number,
      default: 0, // Track how many times this routine has been used
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
RoutineSchema.index({ user: 1, isActive: 1 });
RoutineSchema.index({ user: 1, lastUsedAt: -1 });

// Method to increment usage count
RoutineSchema.methods.recordUsage = function() {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  return this.save();
};

export default mongoose.models.Routine || mongoose.model('Routine', RoutineSchema);
