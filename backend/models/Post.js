const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Post = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true,
        default: "Anonymous"
    },
    createdDate: {
        type: String,
        required: true,
    },
    updatedDate: {
        type: String,
    },
    email: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model('Post', Post);;