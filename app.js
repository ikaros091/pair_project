const express = require('express');
const session = require('express-session');
const Controller = require('./controller');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// 🟢 Session middleware
app.use(session({
  secret: 'secretKeyServantStore', 
  resave: false,
  saveUninitialized: false
}));


// 🟢 Routes Auth (login, register, logout)
app.use('/', authRoutes);

// 🟢 Routes Cart
app.use('/cart', cartRoutes);

app.use((req, res, next) => {
  res.locals.userId = req.session.userId; // bisa dipakai di semua ejs
  next();
});

app.use((req, res, next) => {
  res.locals.currentUser = {
    id: req.session.userId,
    role: req.session.role
  };
  next();
});

// 🟢 Routes Store
app.get('/', Controller.Home);
app.get('/store', Controller.store);
app.get('/store/servant/:id', Controller.servantDetail);
app.get('/store/add', Controller.addForm);
app.post('/store/add', Controller.add);
app.get('/store/edit/:id', Controller.editForm);
app.post('/store/edit/:id', Controller.edit);
app.get('/store/delete/:id', Controller.delete);

// 🟢 Profile
app.get('/profile', Controller.profile);

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
