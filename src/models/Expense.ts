import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IExpense extends Document {
  user: Types.ObjectId;
  category: Types.ObjectId;
  amount: number;
  description: string;
  date: Date;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'digital_wallet' | 'other';
  location?: string;
  tags?: string[];
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  attachments?: string[]; // URLs to uploaded files
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  category: { 
    type: Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0 
  },
  description: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 500 
  },
  date: { 
    type: Date, 
    required: true,
    default: Date.now 
  },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'card', 'bank_transfer', 'digital_wallet', 'other'],
    default: 'cash' 
  },
  location: { 
    type: String, 
    trim: true,
    maxlength: 200 
  },
  tags: [{ 
    type: String, 
    trim: true,
    maxlength: 50 
  }],
  isRecurring: { 
    type: Boolean, 
    default: false 
  },
  recurringFrequency: { 
    type: String, 
    enum: ['daily', 'weekly', 'monthly', 'yearly'] 
  },
  attachments: [{ 
    type: String 
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
ExpenseSchema.index({ user: 1, date: -1 });
ExpenseSchema.index({ user: 1, category: 1 });
ExpenseSchema.index({ user: 1, amount: -1 });
ExpenseSchema.index({ date: -1 });

// Virtual for formatted amount
ExpenseSchema.virtual('formattedAmount').get(function() {
  return this.amount.toFixed(2);
});

// Pre-save middleware to ensure amount is positive
ExpenseSchema.pre('save', function(next) {
  if (this.amount < 0) {
    return next(new Error('Amount cannot be negative'));
  }
  next();
});

export default mongoose.model<IExpense>('Expense', ExpenseSchema); 