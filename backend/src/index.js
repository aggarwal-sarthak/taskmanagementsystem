const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const connectDB = require('../db/mongo.js');
const User = require('../models/user.js');
const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

connectDB();
let logged = '';

app.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
    });
    await newUser.save();
    
    res.json({ message: 'Signup successful' });
    } catch (error) {
    res.status(500).json({ error: 'Failed to sign up' });
  }
})

app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
    User.findOne({ email: email, password: password })
    .then(user =>{
      if(user){
        logged = user.email;
        res.json(user);
      }
      else{
        res.status(500).json({ error: 'couldnt signin' });
      }
    })
    .catch(err => console.error(err));
})

app.post('/tasks', async (req, res) => {
  const { id, name } = req.body;
  User.findOne({ email : logged})
  .then(async user => {
    if(!user.tasks.find(task => task.id === id)){
      user.tasks.push({
        id: id,
        name: name
      })
    }
    else{
      user.tasks.find(task => task.id === id).name = name;
    }
    user.save();
  })
  res.json("ok");
})

app.post('/delete', async (req, res) => {
  const { id } = req.body;
  User.findOneAndUpdate(
  { email: logged },
  { $pull: { tasks: {id: id} } },
  { new: true }
)
.catch(err => {
  console.error('Error:', err);
});
  res.json("ok");
})

app.get('/usertask', async(req, res) =>{
  const user = User.findOne({email: logged})
  .then(async user => {
    res.json(user.tasks);
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})