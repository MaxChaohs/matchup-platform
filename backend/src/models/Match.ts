import mongoose, { Document, Schema } from 'mongoose';

export interface IMatch extends Document {
  creatorId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: 'sport' | 'esport';
  category: string;
  location: string;
  startTime: Date;
  maxParticipants: number;
  currentParticipants: number;
  participants: mongoose.Types.ObjectId[];
  status: 'open' | 'full' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const matchSchema = new Schema<IMatch>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
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
    },
    type: {
      type: String,
      enum: ['sport', 'esport'],
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    maxParticipants: {
      type: Number,
      required: true,
      min: 1,
    },
    currentParticipants: {
      type: Number,
      default: 0,
      min: 0,
    },
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    status: {
      type: String,
      enum: ['open', 'full', 'completed', 'cancelled'],
      default: 'open',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMatch>('Match', matchSchema);

