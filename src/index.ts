import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';



const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));




app.get('/hello', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'node-craft API is running',
    timestamp: new Date().toISOString()
  });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Something went wrong!',
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
    timestamp: new Date().toISOString()
  });
});


app.listen(PORT, () => {
  console.log(`node-craft API running on port ${PORT}`);
});

export default app;