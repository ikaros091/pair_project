'use strict';
const {
  Model
} = require('sequelize');
const { formatIDR } = require('../helpers/formatter');
module.exports = (sequelize, DataTypes) => {
  class Servant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Servant.belongsTo(models.Category, { foreignKey: 'CategoryId' });

      Servant.belongsToMany(models.Order, {
        through: models.OrderDetail,
        foreignKey: 'ServantId',
        otherKey: 'OrderId'
      });
    }
    get formatPrize(){
      return formatIDR(this.price)
    }
  }
  Servant.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Nama servant tidak boleh kosong" },
        len: { args: [3, 50], msg: "Nama minimal 3 huruf" }
      }
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [1000], msg: "Harga minimal Rp 1000" }
      }
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    imageUrl:{
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Image servant tidak boleh kosong" },
      }
    },
    CategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate:{
        notEmpty: { msg: "CategoryId tidak boleh kosong" },
      }
    }
  }, {
    sequelize,
    modelName: 'Servant',
  });
  return Servant;
};