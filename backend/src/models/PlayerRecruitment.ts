import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayerRecruitment extends Document {
  title: string;
  category: string;
  region: string;
  dayOfWeek: string;
  time: string;
  location: string;
  description?: string;
  creatorId: mongoose.Types.ObjectId;
  creatorName: string;
  currentPlayers: number;
  neededPlayers: number;
  teamName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlayerRecruitmentSchema = new Schema<IPlayerRecruitment>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['籃球', '足球', '羽球', '桌球', '網球', '排球', '其他'],
    },
    region: {
      type: String,
      required: true,
      enum: ['北部', '中部', '南部'],
    },
    dayOfWeek: {
      type: String,
      required: true,
      enum: ['週一', '週二', '週三', '週四', '週五', '週六', '週日'],
    },
    time: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    creatorName: {
      type: String,
      required: true,
    },
    currentPlayers: {
      type: Number,
      default: 1,
      min: 1,
    },
    neededPlayers: {
      type: Number,
      required: true,
      min: 1,
    },
    teamName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPlayerRecruitment>('PlayerRecruitment', PlayerRecruitmentSchema);

