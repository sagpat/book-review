import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

class Book extends Model {
  public id!: number;
  public title!: string;
  public author!: string;
  public description!: string;
  public publishedYear!: number;
  public thumbnail!: string;
  public genre!: string;
  public overallRating!: number;
}

Book.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  publishedYear: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  thumbnail: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  genre: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  overallRating: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
}, {
  sequelize,
  modelName: 'Book',
});

export default Book;
