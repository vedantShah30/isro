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
   coordinates: [
    {
      C0: {
        x: { type: Number, required: true, default: 10 },  // Dummy x value for C0
        y: { type: Number, required: true, default: 20 },  // Dummy y value for C0
      },
      C1: {
        x: { type: Number, required: true, default: 50 },  // Dummy x value for C1
        y: { type: Number, required: true, default: 50 },  // Dummy y value for C1
      },
      C2: {
        x: { type: Number, required: true, default: 100 },  // Dummy x value for C2
        y: { type: Number, required: true, default: 100 },  // Dummy y value for C2
      },
      C3: {
        x: { type: Number, required: true, default: 150 },  // Dummy x value for C3
        y: { type: Number, required: true, default: 150 },  // Dummy y value for C3
      },
    },
  ],
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
    croppedUrl: {
      type: String,
      default:null,
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

//Calculating total images count 
ChatSchema.pre('save', async function (next) {
  try {
    if (this.isNew) {
      // increment user's totalImages atomically
      await mongoose.model('User').updateOne({ _id: this.user }, { $inc: { totalImages: 1 } });
    }
    next();
  } catch (err) {
    console.log(err)
  }
});

ChatSchema.post('findOneAndDelete', async function (doc) {
  if (!doc) return;
  try {
    // decrement user's totalImages atomically
    await mongoose.model('User').updateOne({ _id: doc.user }, { $inc: { totalImages: -1 } });
  } catch (err) {
   console.error(err);
  }
});

// Indexes for faster queries
ChatSchema.index({ user: 1, createdAt: -1 });
ChatSchema.index({ routine: 1 });

export default mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
