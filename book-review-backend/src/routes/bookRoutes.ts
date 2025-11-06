import express from 'express';
import { createBook, getBookDetails, getBooks } from '../controllers/bookController';

const router = express.Router();

router.post('/createBook', createBook);
router.get('/getBooks', getBooks);
router.post('/getBookDetails', getBookDetails)

export default router;