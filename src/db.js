import mongoose from 'mongoose';

export default callback => {
  mongoose.connect(process.env.MONGO_URI || "mongodb://localhost/venus");
  
  let db = mongoose.connection;
  callback(db);
}
