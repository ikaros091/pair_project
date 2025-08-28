const { User, Profile, Servant, Order, OrderDetail, Category } = require('../models');
const { Op } = require("sequelize");

class Controller {
  
  static async Home(req, res) {
    try {
      res.render('home');
    } catch (error) {
      res.send(error);
    }
  }

  
  static async store(req, res) {
    try {
      const { search, classes } = req.query;

      const category = await Category.findAll()

      let options = { include: [Category] };

      if (search) {
        options.where = { name: { [Op.iLike]: `%${search}%` } };
      }

      if (classes) {
        options.include = [{
          model: Category,
          where: { name: classes }
        }];
      }

      const servants = await Servant.findAll(options);

      res.render("store", {
        servants,
        category,
        search: search || "",
        classes: classes ? [classes] : []
      });
    } catch (error) {
      res.send(error);
    }
  }

  
  static async servantDetail(req, res) {
    try {
      const { id } = req.params;
      const servant = await Servant.findByPk(id, { include: Category });
      res.render('servantDetail', { servant });
    } catch (error) {
      res.send(error);
    }
  }


  static async addForm(req, res) {
    try {
      const clas = await Category.findAll();
      res.render('add', { clas, errors: [] });
    } catch (error) {
      res.send(error);
    }
  }

 
  static async add(req, res) {
    try {
      const { name, price, stock, imageUrl, CategoryId } = req.body;

      const stockNum = parseInt(stock);
      if (isNaN(stockNum) || stockNum < 0) return res.send("Stock harus 0 atau lebih");

      await Servant.create({ name, price, stock: stockNum, imageUrl, CategoryId });

      res.redirect('/store');
    } catch (error) {
        const clas = await Category.findAll();
        if (error.name === "SequelizeValidationError") {
            const messages = error.errors.map(e => e.message);

            return res.render("add", { clas, errors: messages });
        } else {
            res.send(error);
        }
    }
  }


  static async editForm(req, res) {
    try {
      const { id } = req.params;
      const servant = await Servant.findByPk(id);
      const clas = await Category.findAll();
      res.render('edit', { clas, servant, errors: [] });
    } catch (error) {
      res.send(error);
    }
  }

  
  static async edit(req, res) {
    try {
      const { id } = req.params;
      const { name, price, stock, imageUrl, CategoryId } = req.body;

      const stockNum = parseInt(stock);
      if (isNaN(stockNum) || stockNum < 0) return res.send("Stock harus 0 atau lebih");

      await Servant.update(
        { name, price, stock: stockNum, imageUrl, CategoryId },
        { where: { id } }
      );

      res.redirect('/store');
    } catch (error) {
        const { id } = req.params;
        const clas = await Category.findAll();
        const servant = await Servant.findByPk(id);
        if (error.name === "SequelizeValidationError") {
            const messages = error.errors.map(e => e.message);
            return res.render("edit", { servant, clas, errors: messages });
        } else {
            res.send(error);
        }
    }
  }

  
  static async delete(req, res) {
    try {
      const { id } = req.params;
      await Servant.destroy({ where: { id } });
      res.redirect('/store');
    } catch (error) {
      res.send(error);
    }
  }

  
  static async profile(req, res) {
    try {
      const userId = req.session.userId;
      if (!userId) return res.redirect('/login');

      const profile = await Profile.findOne({
        where: { userId },
        include: User
      });

      res.render('profile', { profile });
    } catch (err) {
      res.send(err);
    }
  }
}

module.exports = Controller;
