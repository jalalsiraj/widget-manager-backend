const mongoose = require('mongoose');

const WidgetsSchema = new mongoose.Schema({
    name: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: [true, "Name of the widget must be unique"]
    },
    description: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    components: {
        type: [mongoose.SchemaTypes.ObjectId],
        ref: "components",
        required: true
    },
    count: {
        type: mongoose.SchemaTypes.Number,
        required: true
    }
}, { timestamps: true });

WidgetsSchema.post("save", function (error, doc, next) {
    if (error.name === "MongoServerError" && error.code === 11000) {
        next(new Error("Name of the widget must be unique"));
    } else {
        next(error);
    }
});

const Widgets = mongoose.model('widgets', WidgetsSchema);

module.exports = Widgets;