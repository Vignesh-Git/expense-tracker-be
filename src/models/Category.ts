import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 50 
  },
  color: { 
    type: String, 
    required: true,
    default: '#2196f3',
    validate: {
      validator: function(v: string) {
        return /^#[0-9A-F]{6}$/i.test(v);
      },
      message: 'Color must be a valid hex color code'
    }
  },
  icon: { 
    type: String, 
    required: true,
    default: 'pi pi-tag',
    maxlength: 100 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

// Indexes for better query performance
CategorySchema.index({ isActive: 1 });
CategorySchema.index(
  { name: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

// Pre-save middleware to ensure unique category names
CategorySchema.pre('save', async function(next) {
  if (this.isModified('name')) {
    const existingCategory = await mongoose.model('Category').findOne({
      name: this.name,
      _id: { $ne: this._id }
    });
    
    if (existingCategory) {
      return next(new Error('Category name already exists'));
    }
  }
  next();
});

export default mongoose.model<ICategory>('Category', CategorySchema); 