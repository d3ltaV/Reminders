'use strict';
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

class Tasks extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    // Define associations here, if needed
    // Example: Tasks.belongsTo(models.User);
  }
}
Tasks.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    taskName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    reminderTime: {
      type: DataTypes.INTEGER,
      defaultValue: 60,
    }
  },
  {
    sequelize, 
    modelName: 'Tasks',
    tableName: 'tasks',
  }
);
module.exports = Tasks; // Export the Tasks model directly
