var fs = require('fs');
var nconf = require('nconf');
var async = require('async');
var Auth0 = require('auth0');
var Logdown = require('logdown')

var logger = new Logdown({
	prefix: 'Auth0'
})

// Load configuration.
nconf.argv()
	.env()
	.file({
		file: 'config.json'
	});

// Initialize client.
var api = new Auth0({
	domain: nconf.get('AUTH0_DOMAIN'),
	clientID: nconf.get('AUTH0_GLOBAL_CLIENT_ID'),
	clientSecret: nconf.get('AUTH0_GLOBAL_CLIENT_SECRET')
});

logger.info('Loading client "*' + nconf.get('AUTH0_CLIENT_ID') + '*" for *' + nconf.get('AUTH0_DOMAIN') + '*');

// Load the client.
api.getClients(nconf.get('AUTH0_CLIENT_ID'), function(err, client) {
	if (err) {
		logger.error('Error loading clients: *' + err.message + '*');
		return;
	}

	logger.log("Current signing key:");
	logger.log(client.signingKey);

	var files = [nconf.get('AUTH0_SIGNINGKEY_KEY'), nconf.get('AUTH0_SIGNINGKEY_CERT'), nconf.get('AUTH0_SIGNINGKEY_PKCS7')];
	async.every(files, fs.exists, function(result) {
		if (!result) {
			logger.error('Not all required files exist. Make sure the `key`, `certificate` and `pkcs7` files exist.');
			return;
		}

		// Read all files.
		async.concatSeries(files, fs.readFile, function(err, files) {
			if (err) {
				logger.error('Error reading files: *' + err.message + '*');
				return;
			}

			client.signingKey.key = files[0].toString("utf8");
			client.signingKey.cert = files[1].toString("utf8");
			client.signingKey.pkcs7 = files[2].toString("utf8");
			client.signingKey.subject = nconf.get('AUTH0_SIGNINGKEY_SUBJECT');

			// New signing key.
			logger.log("New signing key:");
			logger.log(client.signingKey);

			logger.info('Updating client...');

			// Send updated client to auth0.
			api.updateClient(client, function(err) {
				if (err) {
					logger.error('Error updating client: *' + err.message + '*');
					return;
				}

				logger.info('Client updated!');
			});
		});
	});
});