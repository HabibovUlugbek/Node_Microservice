const semver = require("semver");

class ServiceRegistry {
	constructor(log) {
		this.log = log;
		this.services = {};
		this.timeout = 30;
	}

	get(name, version) {
		this.cleanup();
		const candidates = Object.values(this.services).filter(
			(service) =>
				service.name === name && semver.satisfies(service.version, version)
		);

		return candidates[Math.floor(Math.random() * candidates.length)];
	}

	register(name, version, ip, port) {
		this.cleanup();
		const key = name + version + ip + port;

		if (!this.services[key]) {
			this.services[key] = {};
			this.services[key].timestamp = Math.floor(new Date() / 1000);
			this.services[key].ip = ip;
			this.services[key].port = port;
			this.services[key].name = name;
			this.services[key].version = version;
			this.log.debug(`Added new service ${name} , version ${version}`);
		}

		this.services[key].timestamp = Math.floor(new Date() / 1000);
		this.log.debug(`Uptadet new service ${name} , version ${version}`);

		return key;
	}

	unregister(name, version, ip, port) {
		const key = name + version + ip + port;
		delete this.services[key];
		this.log.debug(`Deleted new service ${name} , version ${version}`);
		return key;
	}

	cleanup() {
		const now = Math.floor(new Date() / 1000);
		Object.keys(this.services).forEach((key) => {
			if (this.services[key].timestamp + this.timeout < now) {
				delete this.services[key];
				this.log.debug("Removed service expire");
			}
		});
	}
}

module.exports = ServiceRegistry;
