const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const itemRoute = require('./routes/ritem');
const item = require('./model/item');
const User = require('./model/user');
const Bookmark = require('./model/bookmark');
const cookieParser = require('cookie-parser');
const authRoute = require('./routes/auth')
const { log } = require('console');

dotenv.config();
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Database connected successfully!'))
  .catch(err => console.error('Error connecting to the database:', err));


// Routes fetch item 
app.get('/items', async (req, res) => {
  try {
    const {catogory} = req.query;
    let items;

    if(catogory){
      items = await item.find({catogory: catogory}).sort({createdAt:-1});
    }else{
      items = await item.find().sort({createdAt:-1});
    }
    res.json(items);
  } catch (err) {
    res.status(500).send(`Error fetching items: ${err.message}`);
  }
});

// Route item for a store in db
app.use('/item', itemRoute);

app.get('/item-form', (req, res) => {
  res.render('item');
});

// Route for home page
app.get('/', (req, res) => {
  const userName = req.cookies.name || 'name';
  res.render('index',{userName,currentPage: 'Home'});
});


// route for a register form 

app.use('/',authRoute);

// Route for a login 
app.get('/login',(req,res) => {
  const userName = 'name'
  res.render('login',{userName,currentPage: ''})
})

app.post('/login',async(req,res) => {
    const {email,password} = req.body;

    try{
      const user = await User.findOne({email})

      if(!user){
        return res.status(400).json({message:'there user not exist'})
      }

      if(user.password !== password){
        return res.status(400).json({message:'there password is a wrong'})
      }

      res.cookie('name',user.firstName,{maxAge:2*365*24*60*60*1000});
      res.cookie('userId',user._id.toString(),{maxAge:2*365*24*60*60*1000});
      
      res.redirect('/')
    }catch(error){
      console.log('there is a error in login',error);
    }
});

// Bookmark Routes
app.get('/bookmark', async (req, res) => {
  const userId = req.cookies.userId;
  const userName = req.cookies.name;

  if (!userId) {
    return res.redirect('/login'); // Redirect to login if not authenticated
  }

  try {
    const bookmarks = await Bookmark.find({ userId }).populate('itemId');
    res.render('bookmark', { bookmarks,userName,currentPage:'Bookmark'});
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).send('Error fetching bookmarks');
  }
});

app.get('/api/bookm', async(req,res) => {
  const userId = req.cookies.userId;
  try{
    const bookm = await Bookmark.find({ userId }).populate('itemId');
    res.json(bookm);
  }catch(err){
    res.status(500).json({message:'there is a error in get bookmark api'})
  }
})

app.post('/bookmark', async(req,res) => {
  const userId = req.cookies.userId;
  const {itemId} = req.body;

  if(!userId){
    return res.status(400).json({message:'please a Login or register first'});
  }

  try{
    const existingBookmarks = await Bookmark.findOne({userId,itemId});
    if(existingBookmarks){
      return res.status(400).json({message:'that item already bookmarked'});
    }
  
    const newBookmark = new Bookmark({userId,itemId});
    await newBookmark.save();
    res.status(200).json({message:'new bookmark is a saved'})
  }catch(error){
    console.error('there is a error in save a bookmark', error);
  }
})

app.delete('/bookmark/:id', async(req,res) => {
  const userId = req.cookies.userId;
  const itemId = req.params.id;

  if(!userId){
    return res.redirect('/login')
  }

  try{
    const deleteBookmark = await Bookmark.findOneAndDelete({userId,itemId});

    if(!deleteBookmark){
      return res.status(400).json({message:'there is a no longer that item, that already deleted'});
    }

    res.status(200).json({message:'That bookmark is a removed'})
  }catch(error){
    res.status(500).json({message:'there is a some error for a remove a bookmark'})
  }
})


// Logout routes 

app.get('/logout', (req,res) => {
  res.clearCookie('name');
  res.clearCookie('userId');

  res.redirect('/login')
})

app.get('/contact',async(req,res) =>{
  res.render('contact',{currentPage: 'Contact'})
})

app.get('/user/profile',async (req,res) => {
  const userId = req.cookies.userId;

  if(!userId){
    return res.redirect('/login')
  }

  const user = await User.findById(userId);

  if(user){

    const hiddenpass = '*'.repeat(user.password.length);
    res.render('profilePage',{
      name:user.firstName+' '+user.lastName,
      email:user.email,
      password:hiddenpass,
      phone:user.phoneNumber,
      address:user.address,
    })
  }else{
    res.status(400).send('User not found')
  }
})

// Listen port
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
