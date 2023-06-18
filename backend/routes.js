const express = require('express');
const router = express.Router();
const Post = require('./models/Post');
const User = require('./models/User');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

var jsonParser = bodyParser.json()

// Route to get all users
router.post('/users', jsonParser, async (req, res) => {
    const users = await User.findOne({
        email: req.body.email
    });
    if (users) {
        users.password = undefined;
    }
    res.json(users);
});

// Route to get all users by username
router.post('/user', jsonParser, async (req, res) => {
    const users = await User.findOne({
        userName: req.body.userName
    });
    if (users) {
        users.password = undefined;
    }
    res.json(users);
});

// Route for removing liked posts ID
router.post('/unlike-posts/:userEmail', jsonParser, async (req, res) => {
    const email = req.params.userEmail;
    const postID = req.body.postID;

    const user = await User.findOne({
        email: email,
    });

    if (!user) {
        return res.json({
            success: false,
            message: 'User not found'
        });
    }

    user.likedPosts.remove({
        postID: postID,
    });

    await user.save();

    res.json({
        success: true,
        message: 'Unliked post saved successfully'
    });
});

// Route for saving liked posts ID
router.post('/like-posts/:userEmail', jsonParser, async (req, res) => {
    const email = req.params.userEmail;
    const postID = req.body.postID;

    const user = await User.findOne({
        email: email,
    });

    if (!user) {
        return res.json({
            success: false,
            message: 'User not found'
        });
    }

    user.likedPosts.push({
        postID: postID,
    });

    await user.save();

    res.json({
        success: true,
        message: 'Liked post saved successfully'
    });
});

// Route to get the user's liked posts ID
router.get('/liked-posts/:userEmail', async (req, res) => {
    const email = req.params.userEmail;

    const user = await User.findOne({
        email: email,
    });

    if (!user) {
        return res.json({
            success: false,
            message: 'User not found'
        });
    }

    const likedPosts = user.likedPosts;

    const posts = [];

    for (let i = 0; i < likedPosts.length; i++) {
        const post = await Post.findOne({
            _id: likedPosts[i].postID
        });
        if (!post) {
            continue;
        }

        posts.push(post);
    }

    res.json({
        success: true,
        postsObjs: posts,
        likedPostsID: likedPosts,
    });
});

//Get Post's liked users
router.post('/post/:postID/liked-users', jsonParser, async (req, res) => {
    const postID = req.params.postID;
    const postsLikedUsers = await User.find({ "likedPosts.postID": postID });
    for (let i = 0; i < postsLikedUsers.length; i++) {
        postsLikedUsers[i].password = undefined;
    }
    res.json(postsLikedUsers);
});

// Route to create a new user
router.post('/signup', jsonParser, async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    console.log(req.body);
    const userEmailAcc = await User.findOne({
        email: req.body.email
    });

    const userNameAcc = await User.findOne({
        userName: req.body.userName
    });

    if (userEmailAcc) {
        return res.json({
            success: false,
            message: 'User already exists with that email!'
        });
    } else if (userNameAcc) {
        return res.json({
            success: false,
            message: 'User already exists with that username!'
        });
    }
    else {
        const newUser = new User({
            userName: req.body.userName,
            email: req.body.email,
            password: hashedPassword,
            likedPosts: []
        });
        await newUser.save();
        res.json({
            success: true,
            message: 'User signed up successfully'
        });
    }
});

// Route to login a user
router.post('/login', jsonParser, async (req, res) => {
    const user = await User.findOne({
        email: req.body.email
    });

    if (!user) {
        return res.json({
            success: false,
            message: 'User not found'
        });
    }

    const password = req.body.password;

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        return res.json({
            success: false,
            message: 'Invalid password'
        });
    } else {
        res.json({
            success: true,
            message: 'User logged in successfully'
        });
    }

});

// Route to get all posts
router.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find();
        res.json(posts);
    } catch (error) {
        console.log(error);
    }
});

// Route to add a new post
router.post('/post', jsonParser, async (req, res) => {
    const newPost = new Post({
        title: req.body.title,
        content: req.body.content,
        userName: req.body.userName,
        createdDate: req.body.createdDate,
        email: req.body.email,
    })
    await newPost.save();
    res.json(newPost);
})

// Route to delete a post
router.delete('/post/:id', async (req, res) => {
    const id = req.params.id;

    const post = await Post.findById(id);

    await post.deleteOne();

    res.json({
        success: true,
        message: 'Post deleted successfully'
    });
})

// Route to replace a post content and title
router.put('/post/:id', jsonParser, async (req, res) => {
    const id = req.params.id;

    const post = await Post.findById(id);

    post.title = req.body.title;
    post.content = req.body.content;

    await post.save();

    res.json({
        success: true,
        message: 'Post updated successfully'
    });
});

// Route to update username
router.put('/user/:id', jsonParser, async (req, res) => {
    // Get the ID of the post to be updated
    const id = req.params.id;

    // Find the post by ID
    const user = await User.findById(id);

    const newUser = await User.findOne({ userName: req.body.userName })

    if (newUser) {
        return res.json({
            success: false,
            message: 'User already exists with that username!'
        });
    }

    user.userName = req.body.userName;
    await user.save();

    res.json({
        success: true,
        message: 'Username updated successfully'
    });
});

// Route to get posts of a user
router.get('/:email/posts', async (req, res) => {
    try {
        const posts = await Post.find({
            email: req.params.email
        });
        res.json(posts);
    } catch (error) {
        console.log(error);
    }

})

// Route to update usernames of old posts
router.put('/posts/update-usernames', jsonParser, async (req, res) => {
    const oldUsername = req.body.oldUsername;
    const newUsername = req.body.newUsername;

    const posts = await Post.find({
        userName: oldUsername
    });

    posts.forEach(async (post) => {
        post.userName = newUsername;
        await post.save();
        console.log(post.title);
    });

    res.json({
        success: true,
        message: 'Usernames updated successfully'
    });
});


// Export the router
module.exports = router;
