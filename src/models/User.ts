import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  role: 'user' | 'admin';
  googleId?: string;
  createdAt: Date;
  profileImageId?: Types.ObjectId; // GridFS file id
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  googleId: { type: String },
  createdAt: { type: Date, default: Date.now },
  profileImageId: { type: Schema.Types.ObjectId, ref: 'fs.files', default: null },
});

export default mongoose.model<IUser>('User', UserSchema); 