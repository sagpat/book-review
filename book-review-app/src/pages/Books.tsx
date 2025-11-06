import React from "react";
// import { BookProvider } from "../context/BookContext";
import BookList from "../components/books/BookList";

const BooksPage = () => {
  return (
    <>
            <BookList />
            {/* To add in seperate page <BookDetails /> 
                    {/* TODO:
        To add -
          1. Search bar
        */}
    </>
  );
};

export default BooksPage;
