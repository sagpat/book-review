-- Database initialization script for book review app
USE mydb;

-- Create tables if they don't exist
-- This is a basic initialization script
-- Your actual schema should be applied through your backend migrations

-- Users table
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Books table  
CREATE TABLE IF NOT EXISTS Books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail VARCHAR(500),
    genre VARCHAR(100),
    publishedYear INT,
    overallRating DECIMAL(3,2) DEFAULT 0.00,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE IF NOT EXISTS Reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bookId INT NOT NULL,
    userId INT NOT NULL,
    rating DECIMAL(3,2) NOT NULL,
    reviewText TEXT,
    reviewDate DATE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bookId) REFERENCES Books(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

-- Insert a default admin user (password: admin123)
INSERT IGNORE INTO Users (username, email, password, role) 
VALUES ('admin', 'admin@bookrevue.com', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8kJEf8F8pJRlgdz8SsCL8h8mGCIv0y', 'admin');

-- Insert some sample books
INSERT IGNORE INTO Books (title, author, description, genre, publishedYear, overallRating) VALUES 
('The Great Gatsby', 'F. Scott Fitzgerald', 'A classic American novel set in the 1920s.', 'Fiction', 1925, 4.2),
('To Kill a Mockingbird', 'Harper Lee', 'A gripping tale of racial injustice and childhood innocence.', 'Fiction', 1960, 4.5),
('1984', 'George Orwell', 'A dystopian social science fiction novel.', 'Science Fiction', 1949, 4.4),
('Pride and Prejudice', 'Jane Austen', 'A romantic novel of manners.', 'Romance', 1813, 4.3),
('The Catcher in the Rye', 'J.D. Salinger', 'A controversial novel about teenage rebellion.', 'Fiction', 1951, 3.8);

COMMIT;