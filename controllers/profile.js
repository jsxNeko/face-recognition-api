const handleUpdate = (req, res, db, bcrypt) => {
	const {id, oldEmail, email, name, password, confirmPassword} = req.body;
	const hash = bcrypt.hashSync(password, 8)

	if(password === '' || password.length === 0) {
	 	db.select('*')
	 	.from('users')
	 	.where({'id':id})
	 	.update({
	 		email: email,
	 		name: name,
	 	})
	 	.then(update => {
	 		if(oldEmail !== email){
		 		db.select('*')
		 		.from('login')
		 		.where({'email': oldEmail})
		 		.update({email: email})
		 		.then(data => {
		 			return db.select('*')
		 			.from('users')
		 			.where({'id':id})
		 			.then(user => {
		 				res.json(user[0])
		 			})
		 			.catch(err => res.status(400).json({'error':'Unable to update profile completely. Please contact us for further support.'}))
		 		})
		 		.catch(err => res.status(400).json({'error':err}))
	 		} else {
	 			return db.select('*')
	 			.from('users')
	 			.where({'id':id})
	 			.then(user => {
	 				res.json(user[0])
	 			})
	 			.catch(err => res.status(400).json({'error':'Something went wrong.'}))
	 		}
	 	})
	 	.catch(err => res.status(400).json({'error':err.detail}))
  	} else {
  		if (password === confirmPassword){
			db.select('*')
			.from('login')
			.where({'email':oldEmail})
			.update({
				email: email,
				hash: hash
			})
			.then(data => {
				db.select('*')
				.from('users')
				.where({'id':id})
				.update({
					email: email,
					name: name
				})
				.then(data => {
					return db.select('*')
					.from('users')
					.where({'id':id})
					.then(user => {
						res.json(user[0])
					})
					.catch(err => res.status(400).json(err))
				})
				.catch(err => res.status(400).json({'error':err}))
			})
			.catch(err => res.status(400).json({'error':err.detail}))
		} else if(password.length < 6) { 
			return res.status(400).json({'error':'Password must be 6 characters or more'})
		} else {
			return res.status(400).json({'error':'Passwords must be matching in both fields.'})
		}
	}
}

const handleDeleteAccount = (req, res, db, bcrypt) => {
	const {id, email, password} = req.body;

	db.select('*')
	.from('login')
	.where({'email':email})
	.then(data => {
		const isValid = bcrypt.compareSync(password, data[0].hash);
		if(isValid) {
			db.select('*')
			.from('users')
			.where({'id':id})
			.del()
			.then(data => {
				db.select('*')
				.from('login')
				.where({'email':email})
				.del()
				.then(data => {
					return res.json(data)
				})
				.catch(err => res.json({'error':err}))
			})
			.catch(err => res.json({'error':'Unable to delete account.'}))
		} else {
			return res.status(400).json({'error':'Password is not correct. Please try again.'})
		}
	})
	.catch(err => res.status(400).json({'error':'Unable to retrieve user information.'}))
}

module.exports = {
	handleUpdate,
	handleDeleteAccount
}