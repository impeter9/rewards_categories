const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const rewardSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  creator: {
      type: Schema.Types.ObjectId,
      ref: 'User'
  }
});

module.exports = mongoose.model('Reward', rewardSchema);