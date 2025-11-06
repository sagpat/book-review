import { Request, Response } from 'express';
import Book from '../models/book';

// Create a new book
export const createBook = async (req: any, res: any) => {
  try {
    const { title, author, description, publicationDate, rating, bookCover } = req.body;

    if (!bookCover) {
      return res.status(400).json({ error: 'Cover image is required' });
    }

    // Save book data
    await Book.create({
      title,
      author,
      description,
      publicationDate,
      overallRating: Number(rating),
      bookCover,
    });

    res.status(201).json({status: "success"});
  } catch (error) {
    res.status(500).json({ error: 'Failed to create the book' });
  }
};


export const getBooks = async (_req: Request, res: Response) => {
  try {
    const books = await Book.findAll();
    res.json(books);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};


export const getBookDetails = async (req: Request, res: Response) => {
  const id = req.body.bookId;
  try {
    const books = await Book.findOne({ where: { id }});
    res.json(books);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
