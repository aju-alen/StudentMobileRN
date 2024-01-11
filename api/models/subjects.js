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
    subjectLanguage: {
        type: String,
        required: true
    },
    subjectTags: {
        type: [String],
        required: true
    },
    subjectGrade: {
        type: Number,
        required: true,
        default: 10,
    },
    subjectVerification: {
        type: Boolean,
        default: false
    },
    teacherVerification: {
        type: [String], 
        default: [],
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
});

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;
