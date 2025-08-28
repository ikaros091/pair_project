const { User, Profile } = require('../models');

class AuthController {
    
    static loginForm(req, res) {
      res.render('login');
    }

    static async login(req, res) {
      try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
          return res.send("Email tidak terdaftar");
        }

        const valid = user.checkPassword(password);
        if (!valid) {
          return res.send("Password salah");
        }

        req.session.userId = user.id;
        req.session.role = user.role;

        res.redirect('/store');
      } catch (error) {
        res.send(error);
      }
    }

    static registerForm(req, res) {
      res.render('register');
    }

    // Proses register
    static async register(req, res) {
      try {
        const { username, email, password, address, number, adminPassword } = req.body;

        let role = 'customer'; // default role

        const ADMIN_SECRET = 'ADMIN123'; // pass khusus admin
        if (adminPassword) {
          if (adminPassword === ADMIN_SECRET) {
            role = 'admin';
          } else {
            return res.send("Password khusus admin salah");
          }
        }

        const newUser = await User.create({
          username,
          email,
          password,
          role
        });

        await Profile.create({
          userId: newUser.id,
          address,
          number
        });

        res.redirect('/login');
      } catch (err) {
        console.log(err);
        res.send(err);
      }
    }

    // Logout
    static logout(req, res) {
      req.session.destroy((err) => {
        if (err) return res.send(err);
        res.redirect('/login');
      });
    }
}

module.exports = AuthController;
