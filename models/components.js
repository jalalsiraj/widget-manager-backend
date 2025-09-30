const mongoose = require('mongoose');

const ComponentsSchema = new mongoose.Schema({
    name: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    description: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    optional: {
        type: mongoose.SchemaTypes.Boolean,
        required: true
    }
}, { timestamps: true });

const Components = mongoose.model('components', ComponentsSchema);

module.exports = Components;