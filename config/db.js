// config/db.js

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,     
  process.env.DB_USER,     
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST, 
    dialect: 'mysql',
    logging: false,      // optimization approach :  Sequelize prints every raw SQL query it sends to the database , Slightly affect performance if you log too many queries      
    
    pool: {
      max: 10,       // Good for limiting DB overload and memory usage.
      min: 0,
      acquire: 30000,
      idle: 10000  //Helps clean up unused connections and reduce memory/DB load
    },

    define: {
      timestamps: true,      //Indexed createdAt can be used for optimized queries like “last 3 months” donations. , Easily generate time-based reports: daily requests, weekly donations, etc.
      underscored: true     
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection to the database has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

module.exports = {
  sequelize,
  connectDB
};