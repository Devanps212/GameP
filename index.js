const express = require('express')
const mongoose = require('mongoose')
const app = express()
const nocache = require('nocache')

require('dotenv').config()
const PORT = process.env.PORT || 3000
const helpers = require('./HBS_helpers/admin');
app.locals.helpers = helpers; 



app.use(nocache())

//mongodb connection

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

const userroute = require('./routes/user_router')
const adminrouter = require('./routes/admin_router')

// user

 
app.use('/', userroute)


//admin


app.use('/admin',adminrouter)
app.use('*', (req, res)=>
{
    res.send('404 File not found')
})


  
app.listen(PORT,()=>
{
    console.log(`server is running at PORT ${PORT} `)
})

