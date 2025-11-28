const User = require("./User");
const Payment = require("./Payment");

User.hasOne(Payment, { foreignKey: "userId", as: "payment" });
Payment.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = {
  User,
  Payment
};