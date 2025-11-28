const { DataTypes } = require("sequelize");
const sequelize = require("../Config/db");

const User = sequelize.define("User", {
  id: {                     // minúsculo
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {                   // minúsculo
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {                  // minúsculo
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: "user"
  },
  payments: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: "users",
  timestamps: true
});

module.exports = User;