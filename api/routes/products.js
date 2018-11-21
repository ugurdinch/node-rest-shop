const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Product = require('../models/product');

router.get('/', (req, res, next) => {
	Product.find()
		.select('name price _id')
		.exec()
		.then(docs => {
			const response = {
				count: docs.length,
				products: docs.map(doc => {
					return {
						name: doc.name,
						price: doc.price,
						_id: doc._id,
						request: {
							type: 'GET',
							url: `http://localhost:3000/products/${doc._id}`
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
	const product = new Product({
		_id: new mongoose.Types.ObjectId(),
		name: req.body.name,
		price: req.body.price
	})

	product
		.save()
		.then(result => {
			console.log(result);
			
			res.status(200).json({
				message: "post request",
				createdProduct: {
					name: result.name,
					price: result.price,
						_id: result._id,
						request: {
							type: 'GET',
							url: `http://localhost:3000/products/${result._id}`
						}
				}
			});
		})
		.catch(error => {
			console.log(error);

			res.status(500).json({
				error: error
			})
		})
});

router.get('/:productId', (req, res, next) => {
	const productId = req.params.productId;

	Product.findById(productId)
		.select('name price _id')
		.exec()
		.then(doc => {
			console.log(doc);
			res.status(200).json(doc);
		})
		.catch(error => {
			console.log(error);
			res.status(500).json({error: error});
		}); 
});

router.patch('/:productId', (req, res, next) => {
	const productId = req.params.productId;
	const updatedOps = {};
	for (const ops of req.body) {
		updatedOps[ops.propName] = ops.value;
	}

	Product.update({_id: productId}, { $set: updatedOps})
		.exec()
		.then(result => {
			console.log(result);
			res.status(200).json(result);
		})
		.catch(error => {
			console.log(error);
			res.status(500).body({
				error: error
			});
		})

});

router.delete('/:productId', (req, res, next) => {
	const productId = req.params.productId;

	Product.remove({_id: productId})
		.exec()
		.then(result => {
			res.status(200).json(result);
		})
		.catch(error => {
			console.log(error);
			res.status(500).json({error: error});
		});
});

module.exports = router;