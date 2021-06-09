const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vehicleSchema = new Schema({
    name: {
        type: String
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    licensePlate: {
        type: String
    }
}, {
    timestamps: true
});


var Vehicles = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicles;