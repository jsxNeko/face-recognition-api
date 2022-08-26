const Clarifai = require('clarifai');

const handleApiCall = (req,res, secret_api) => {
	const app = new Clarifai.App({
    apiKey: secret_api,
  	});
	app.models
	.predict(
		Clarifai.FACE_DETECT_MODEL,
		req.body.input 
	)
	.then(data => res.json(data))
	.catch(err => res.status(400).json('Unable to process image'))
}

const handleEntries = (req, res, db) => {
	const { id } = req.body;

	db('users')
	.where({'id':id})
	.increment('entries', 1)
	.returning('entries')
	.then(entries => res.json(entries[0].entries))
	.catch(err => res.status(400).json('Unable to get entries'))
}

module.exports = {
	handleEntries,
	handleApiCall
}