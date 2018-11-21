const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');


router.get('/', (req, res, next) => {
	Order.find()
		.select('product quantity _id')
		.exec()
		.then(docs => {
			const response = {
				count: docs.length,
				orders: docs.map(doc => {
					return {
						product: doc.product,
						quantity: doc.quantity,
						_id: doc._id,
						request: {
							type: 'GET',
							url: `http://localhost:3000/orders/${doc._id}`
						}
					}
				})
			}
			res.status(200).json(response);
		})
		.catch(error => {
			console.log(error);
			res.status(500).json({
				error: error
			})
		})
});

router.post('/', (req, res, next) => {
	Product.findById(req.body.product)
		.then(product => {
			if (! product) {
				return res.status(404).json({
					message: "Product not found"
				})
			}
			const order = new Order({
				_id: mongoose.Types.ObjectId(),
				quantity: req.body.quantity,
				product: req.body.product
			});
			return order.save()
		})
		.then(result => {
			console.log(result);
			res.status(200).json({
				message: 'Order storder',
				createdOrder: {
					_id: result._id,
					product: result.product,
					quantity: result.quantity
				},
				request: {
					type: 'GET',
					url: `http://localhost:3000/orders/${result._id}`
				}
			});
		})
		.catch(error => {
			res.status(500).json({
				error: error
			})
		});
});

router.get('/:orderId', (req, res, next) => {
	Order.findById(req.params.orderId)
		.select('product quantity _id')
		.exec()
		.then(order => {
			if (! order) {
				return res.status(404).json({
					message: "Order not found"
				})
			}
			res.status(200).json({
				order: order,
				request: {
					type: 'POST',
					url: `http://localhost:3000/orders`,
					description: 'Creates a new order',
					body: {
						quantity: "Number",
						productId: "ID"
					}
				}
			});
		})
		.catch(error => {
			res.status(500).json({
				message: `Could not get order ${req.params.orderId}`,
				error: error
			})
		})
});

router.delete('/:orderId', (req, res, next) => {
	Order.remove({_id: req.params.orderId})
		.exec()
		.then(order => {
			res.status(200).json({
				message: "Order deleted",
				request: {
					type: 'GET',
					url: `http://localhost:3000/orders`,
					description: 'Gets all orders',
				}
			})
		})
		.catch(error => {
			res.status(500).json({
				message: `Could not delete order ${req.params.orderId}`,
				error: error
			})
		})
	
});

module.exports = router;