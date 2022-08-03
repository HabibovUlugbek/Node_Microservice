const express = require("express");

const service = express();
const ServiceRegistry = require("./lib/ServerRegistry");

module.exports = (config) => {
	const log = config.log();
	const serviceRegistery = new ServiceRegistry(log);
	// Add a request logging middleware in development mode
	if (service.get("env") === "development") {
		service.use((req, res, next) => {
			log.debug(`${req.method}: ${req.url}`);
			return next();
		});
	}

	service.put(
		"/register/:servicename/:serviceversion/:serviceport",
		(req, res) => {
			const { servicename, serviceversion, serviceport } = req.params;

			const serviceip = req.socket.remoteAddress.includes("::")
				? `[${req.socket.remoteAddress}]`
				: req.socket.remoteAddress;

			const serviceKey = serviceRegistery.register(
				servicename,
				serviceversion,
				serviceip,
				serviceport
			);

			return res.json({ result: serviceKey });
		}
	);

	service.delete(
		"/register/:servicename/:serviceversion/:serviceport",
		(req, res) => {
			const { servicename, serviceversion, serviceport } = req.params;

			const serviceip = req.socket.remoteAddress.includes("::")
				? `[${req.socket.remoteAddress}]`
				: req.socket.remoteAddress;

			const serviceKey = serviceRegistery.unregister(
				servicename,
				serviceversion,
				serviceip,
				serviceport
			);

			return res.json({ result: serviceKey });
		}
	);

	service.get("/find/:servicename/:serviceversion", (req, res) => {
		const { servicename, serviceversion } = req.params;
		const svc = serviceRegistery.get(servicename, serviceversion);

		if (!svc) return res.status(404).json({ result: "Service Not found" });

		return res.json(svc);
	});

	// eslint-disable-next-line no-unused-vars
	service.use((error, req, res, next) => {
		res.status(error.status || 500);
		// Log out the error to the console
		log.error(error);
		return res.json({
			error: {
				message: error.message,
			},
		});
	});
	return service;
};
