import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  phone?: string;
  passwordHash: string;
  avatar?: string;
  socialLogins?: {
    apple?: string;
    google?: string;
    facebook?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: function(this: IUser) {
        return !this.socialLogins?.apple && !this.socialLogins?.google && !this.socialLogins?.facebook;
      },
    },
    avatar: {
      type: String,
    },
    socialLogins: {
      apple: String,
      google: String,
      facebook: String,
    },
  },
  {
    timestamps: true,
  }
);

// 密碼比較方法
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export default mongoose.model<IUser>('User', userSchema);

