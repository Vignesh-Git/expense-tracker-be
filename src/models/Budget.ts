import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBudget extends Document {
  user: Types.ObjectId;
  name: string;
  amount: number;
  spent: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  category?: Types.ObjectId; // Optional: if null, it's a general budget
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  notifications: {
    enabled: boolean;
    threshold: number; // Percentage threshold for notifications
  };
  createdAt: Date;
  updatedAt: Date;
  updateSpent(spentAmount: number): Promise<IBudget>;
  reset(): Promise<IBudget>;
}

const BudgetSchema = new Schema<IBudget>({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100 
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0 
  },
  spent: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  period: { 
    type: String, 
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true 
  },
  category: { 
    type: Schema.Types.ObjectId, 
    ref: 'Category' 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  notifications: {
    enabled: { 
      type: Boolean, 
      default: true 
    },
    threshold: { 
      type: Number, 
      default: 80,
      min: 0,
      max: 100 
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
BudgetSchema.index({ user: 1, isActive: 1 });
BudgetSchema.index({ user: 1, startDate: 1, endDate: 1 });
BudgetSchema.index({ user: 1, category: 1 });

// Virtual for remaining budget
BudgetSchema.virtual('remaining').get(function() {
  return Math.max(0, this.amount - this.spent);
});

// Virtual for spending percentage
BudgetSchema.virtual('spentPercentage').get(function() {
  return this.amount > 0 ? (this.spent / this.amount) * 100 : 0;
});

// Virtual for budget status
BudgetSchema.virtual('status').get(function(this: IBudget) {
  const percentage = (this.amount > 0 ? (this.spent / this.amount) * 100 : 0);
  if (percentage >= 100) return 'exceeded';
  if (percentage >= 80) return 'warning';
  return 'good';
});

// Pre-save middleware to calculate end date based on period
BudgetSchema.pre('save', function(next) {
  if (this.isModified('startDate') || this.isModified('period')) {
    const startDate = new Date(this.startDate);
    let endDate = new Date(startDate);
    
    switch (this.period) {
      case 'daily':
        endDate.setDate(startDate.getDate() + 1);
        break;
      case 'weekly':
        endDate.setDate(startDate.getDate() + 7);
        break;
      case 'monthly':
        endDate.setMonth(startDate.getMonth() + 1);
        break;
      case 'yearly':
        endDate.setFullYear(startDate.getFullYear() + 1);
        break;
    }
    
    this.endDate = endDate;
  }
  next();
});

// Method to update spent amount
BudgetSchema.methods.updateSpent = async function(this: IBudget, spentAmount: number) {
  this.spent = spentAmount;
  return await this.save();
};

// Method to reset budget
BudgetSchema.methods.reset = async function(this: IBudget) {
  this.spent = 0;
  this.startDate = new Date();
  return await this.save();
};

export default mongoose.model<IBudget>('Budget', BudgetSchema); 