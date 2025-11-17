import mongoose, { Schema, Document } from 'mongoose';

export interface ITeamMatch extends Document {
  title: string;
  category: string;
  region: string;
  dayOfWeek: string;
  time: string;
  location: string;
  description?: string;
  creatorId: mongoose.Types.ObjectId;
  creatorName: string;
  teamSize: number;
  maxTeams?: number;
  currentTeams: number;
  teamName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMatchSchema = new Schema<ITeamMatch>(
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
    teamSize: {
      type: Number,
      required: true,
      min: 1,
    },
    maxTeams: {
      type: Number,
      default: 2, // 一對一，所以預設2隊
      min: 2,
    },
    currentTeams: {
      type: Number,
      default: 1,
      min: 0,
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

export default mongoose.model<ITeamMatch>('TeamMatch', TeamMatchSchema);

