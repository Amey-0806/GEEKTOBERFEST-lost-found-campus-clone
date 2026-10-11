const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            maxlength:100,
        },
        description: {
            type: String,
            required: true,
            maxlength:1000,
        },
        type: {
            type: String,
            enum: ['lost', 'found'],
            required: true
        },
        category: {
            type: String,
            enum: ['Electronics', 'Documents', 'Clothing', 'Accessories', 'Books', 'Keys', 'Bags', 'Other'],
            required: true
        },
        location: {
            type: String,
            enum: ['Library', 'Canteen', 'Hostel', 'Main Gate', 'Academic Block', 'Sports Complex', 'Parking', 'Other'],
            required: true
        },
        date: {
            type: Date,
            required: true,
        },
        image: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            enum: ['active', 'claimed', 'recovered'],
            default: 'active'
        },
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        }
    },
    { timestamps: true }
)

itemSchema.index({ category: 1, location: 1, type: 1, status: 1, date: -1 });

module.exports = mongoose.model('Item',itemSchema)