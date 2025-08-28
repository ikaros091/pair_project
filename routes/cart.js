const express = require('express');
const router = express.Router();
const CartController = require('../controller/cartController');

// Lihat cart
router.get('/', CartController.viewCart);

// Tambah servant ke cart
router.get('/add/:servantId', CartController.addToCart);

// Buy now → pakai query ?buyNow=true
router.get('/buy/:servantId', (req, res) => {
  req.params.buyNow = 'true';
  return CartController.addToCart(req, res);
});

// Hapus servant dari cart (satu qty)
router.get('/remove/:servantId', CartController.removeFromCart);

// Checkout page
router.get('/checkout', CartController.checkoutPage);
router.get('/checkout/:orderId', CartController.checkoutPage);

// Proses bayar
router.post('/pay', CartController.payOrder);

module.exports = router;
