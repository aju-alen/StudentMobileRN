import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    subjectName: {
        type: String,
        required: true
    },
    subjectDescription: {
        type: String,
        required: true
    },
    subjectImage: {
        type: String,
        required: true
    },
    subjectPrice: {
        type: Number,
        required: true
    },
    subjectBoard: {
        type: String,
        required: true
    },
    subjectGrade: {
        type: String,
        enum: ['1', '2', '3', '4', '5'], // Add enum with options '1', '2', '3', '4', '5'
        required: true,
        default:'3',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }]
});

 const Subject = mongoose.model('Subject', subjectSchema);
 export default Subject;
