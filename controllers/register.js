const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const handleRegister = (req, res, db, bcrypt) => {
	const { email, name, password } =  req.body;
	const hash = bcrypt.hashSync(password, 8)

	if(!email || !name || !password) {
		return res.status(400).json({'error':'None of the fields can be empty. Please enter something.'})
	} else if(password.length < 6) { 
		return res.status(400).json({'error':'Password must be 6 characters or more'})
	} else if(!validateEmail(email)) {
		return res.status(400).json({'error':'Email is not valid.'})
	} else {
		db.transaction(trx => {
			trx.insert({
				hash: hash,
				email: email
			})
			.into('login')
			.returning('email')
			.then(loginEmail => {
				return trx('users')
				.returning('*')
				.insert({
					email: loginEmail[0].email, 
					name: name,
					joined: new Date()
				})
				.then(user => res.json(user[0]))
			})
			.then(trx.commit)
			.catch(trx.rollback)
		})
		.catch(err => res.status(400).json({'error':err.detail}))
	}
}

module.exports = {
	handleRegister
};