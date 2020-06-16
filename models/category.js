const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const categorySchema = new Schema({
    title: {
        type: String,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    rewards: [
    {
        type: Schema.Types.ObjectId,
        ref: 'Reward'
    }
    ]
});

module.exports = mongoose.model('Category', categorySchema);