'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Order.belongsTo(models.User, { foreignKey: 'UserId' });
       Order.belongsToMany(models.Servant, {
        through: models.OrderDetail,
        foreignKey: 'OrderId',
        otherKey: 'ServantId'
      });
    }
  }
  Order.init({
    UserId: DataTypes.INTEGER,
    orderDate: DataTypes.DATE,
    totalHarga: DataTypes.INTEGER,
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending'
    }
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};