const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  createdRewards: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Reward'
    }
  ],
  createdCategories: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Category'
    }
  ]
});

module.exports = mongoose.model('User', userSchema);