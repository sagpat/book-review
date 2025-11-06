import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';
import User from './user';
import Book from './book';

class Review extends Model {
  public id!: number;
  public rating!: number;
  public reviewText!: string;
  public reviewDate!: Date;
  public bookId!: number;
  public userId!: number;
}

Review.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reviewText: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reviewDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'Review',
});

Review.belongsTo(User, { foreignKey: 'userId' });
Review.belongsTo(Book, { foreignKey: 'bookId' });

export default Review;