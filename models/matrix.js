const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const matrixSchema = new Schema({
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    matrix: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Matrix', matrixSchema);