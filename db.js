const mongoose = require('mongoose');
const dotenv =require("dotenv");
dotenv.config();

const mongoURL = process.env.REACT_APP_MONGODB_URL;
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  };

const connectMongos = () => {
    mongoose.connect(mongoURL, options)
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((error) => {
      console.error('Error connecting to MongoDB:', error);
    });
}

module.exports = connectMongos;
