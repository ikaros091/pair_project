'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require('bcryptjs');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasOne(models.Profile, { foreignKey: 'userId' });
      User.hasMany(models.Order, { foreignKey: 'UserId' });
    }

    checkPassword(password) {
      return bcrypt.compareSync(password, this.password);
    }
  }
  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Username tidak boleh kosong" }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "Email tidak boleh kosong" },
        isEmail: { msg: "Format email salah" }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Password tidak boleh kosong" },
        len: {
          args: [5, 100],
          msg: "Password minimal 5 karakter"
        }
      }
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "customer"
    }
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate(user) {
        
        user.password = bcrypt.hashSync(user.password, 10);
      }
    }
  });
  return User;
};