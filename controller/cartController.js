const { Order, OrderDetail, Servant } = require('../models');
const QRCode = require('qrcode');

class CartController {

    static async viewCart(req, res) {
        try {
        const userId = req.session.userId;
        if (!userId) return res.redirect('/login');

        let order = await Order.findOne({
            where: { UserId: userId, status: 'pending' },
            include: { model: Servant, through: { attributes: [] } }
        });

        if (!order) {
            order = await Order.create({ UserId: userId, status: 'pending', totalHarga: 0 });
        }

        
        let cartItems = {};
        let totalHarga = 0;

        if (order.Servants.length > 0) {
            order.Servants.forEach(s => {
            if (!cartItems[s.id]) cartItems[s.id] = { servant: s, qty: 1 };
            else cartItems[s.id].qty++;
            totalHarga += s.price;
            });
        }

        res.render('cart', {
            order,
            cartItems: Object.values(cartItems),
            totalHarga
        });
        } catch (err) {
        res.send(err);
        }
    }

    
    static async addToCart(req, res) {
        try {
        const userId = req.session.userId;
        if (!userId) return res.redirect('/login');

        const { servantId, buyNow } = req.params;
        const servant = await Servant.findByPk(servantId);

        if (!servant || servant.stock <= 0) {
            return res.send('Servant ini sudah habis stocknya!');
        }

        let order = await Order.findOne({ where: { UserId: userId, status: 'pending' } });
        if (!order) {
            order = await Order.create({ UserId: userId, status: 'pending', totalHarga: 0 });
        }

        await OrderDetail.create({ OrderId: order.id, ServantId: servantId });

        
        if (buyNow === 'true') {
            return res.redirect(`/cart/checkout/${order.id}`);
        }

        res.redirect('/cart');
        } catch (err) {
        res.send(err);
        }
    }

    
    static async removeFromCart(req, res) {
        try {
        const { servantId } = req.params;
        const userId = req.session.userId;
        if (!userId) return res.redirect('/login');

        const order = await Order.findOne({ where: { UserId: userId, status: 'pending' } });
        if (!order) return res.redirect('/cart');

        await OrderDetail.destroy({ where: { OrderId: order.id, ServantId: servantId }, limit: 1 });
        res.redirect('/cart');
        } catch (err) {
        res.send(err);
        }
    }

    
    static async checkoutPage(req, res) {
        try {
            const userId = req.session.userId;
            if (!userId) return res.redirect('/login');

            const { orderId } = req.params;
            let order;

            if (orderId) {
                order = await Order.findByPk(orderId, { include: Servant });
            } else {
                order = await Order.findOne({ where: { UserId: userId, status: 'pending' }, include: Servant });
            }

            if (!order) return res.redirect('/cart');

            const total = order.Servants.reduce((acc, s) => acc + s.price, 0);
            const payUrl = `http://localhost:3000/cart/pay?orderId=${order.id}`;
            const qrCodeDataUrl = await QRCode.toDataURL(payUrl);

            res.render('checkout', { total, orderId: order.id, qrCodeDataUrl });
        } catch (err) {
            res.send(err);
        }
    }

    
    static async payOrder(req, res) {
        try {
        const { orderId } = req.body;
        const order = await Order.findByPk(orderId, { include: Servant });
        if (!order) return res.redirect('/cart');

        let cartItems = {};
        order.Servants.forEach(s => {
            if (!cartItems[s.id]) cartItems[s.id] = 1;
            else cartItems[s.id]++;
        });

        
        for (let sId in cartItems) {
            const s = await Servant.findByPk(sId);
            if (s.stock < cartItems[sId]) {
            return res.send(`Servant ${s.name} stock tidak cukup!`);
            }
        }

        
        for (let sId in cartItems) {
            const s = await Servant.findByPk(sId);
            s.stock -= cartItems[sId];
            await s.save();
        }

        const total = order.Servants.reduce((acc, s) => acc + s.price, 0);
        order.totalHarga = total;
        order.status = 'completed';
        await order.save();

        res.render('success', { message: 'Pesanan berhasil dibayar!' });
        } catch (err) {
        res.send(err);
        }
    }
}

module.exports = CartController;
