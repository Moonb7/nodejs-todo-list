import mongoose from 'mongoose';
import dotenv from 'dotenv';

// .env 파일의 내용을 불러옵니다.
dotenv.config();

const connect = () => {
  mongoose
    .connect(
      'mongodb+srv://sparta-user:aaaa4321@express-mongo.3wiab.mongodb.net/?retryWrites=true&w=majority&appName=express-mongo',
      {
        dbName: 'todo_memo', // todo_memo 데이터베이스명을 사용합니다.
      }
    )
    .then(() => console.log('MongoDB 연결에 성공하였습니다.'))
    .catch((err) => console.log(`MongoDB 연결에 실패하였습니다. ${err}`));
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB 연결 에러', err);
});

export default connect;
