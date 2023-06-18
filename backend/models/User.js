const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create a model for your data
const User = new Schema({
    userName: String,
    email: String,
    password: String,
    likedPosts: [
        {
            postID: String,
        }
    ]
});


module.exports = mongoose.model('User', User);;