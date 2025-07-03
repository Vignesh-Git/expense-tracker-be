import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMessage {
  sender: 'user' | 'admin';
  message: string;
  timestamp: Date;
}

export interface INotification extends Document {
  user: Types.ObjectId;
  type: 'category' | 'expense';
  status: 'requested' | 'approved' | 'denied';
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  sender: { 
    type: String, 
    required: true,
    enum: ['user', 'admin']
  },
  message: { 
    type: String, 
    required: true,
    maxlength: 1000 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

const NotificationSchema = new Schema<INotification>({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    required: true,
    enum: ['category', 'expense']
  },
  status: { 
    type: String, 
    required: true,
    enum: ['requested', 'approved', 'denied'],
    default: 'requested'
  },
  messages: [MessageSchema]
}, {
  timestamps: true
});

// Indexes for better query performance
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema); 