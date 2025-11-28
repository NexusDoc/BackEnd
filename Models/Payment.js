const { DataTypes } = require("sequelize");
const sequelize = require("../Config/db");

const Payment = sequelize.define("Payment", {
  id: {
     type: DataTypes.INTEGER,
     primaryKey: true,
      autoIncrement: true
     },
  userId: {
     type: DataTypes.INTEGER,
     allowNull: false,
      unique: true
     },
  valor: {
     type: DataTypes.DECIMAL(10, 2),
     allowNull: false
     },
  status:   {
     type: DataTypes.STRING,
     defaultValue: "pending"
     },
  pago: {
     type: DataTypes.BOOLEAN,
      defaultValue: false
     }
}, {
  tableName: "payments",
  timestamps: true
});

module.exports = Payment;