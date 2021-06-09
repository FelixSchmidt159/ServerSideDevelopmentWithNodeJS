const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tourSchema = new Schema({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle'
    },
    mileageBegin: {
        type: Number
    },
    mileageEnd: {
        type: Number
    },
    distance: {
        type: Number
    },
    tourBegin: {
        type: String,
    },
    tourEnd: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    },
    time: {
        type: Date,
        default: Date.now    
    },
}, {
    timestamps: true
});


var Tours = mongoose.model('Tour', tourSchema);

module.exports = Tours;