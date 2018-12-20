const awilix = require('awilix');
const config = require('../services/config.service')();
const PowerShellService = require('../services/power.shell.service');
const LogStoreService = require('../services/log.store.service');
const LogParseService = require('../services/log.parse.service');
const MailNotificationService = require('../services/mail.notification.service');
const db = require('../db')();
const CmdletDependenciesService = require('../services/cmdlet.dependencies.service');
const FsService = require('../services/fs.service');
const CliService = require('../services/cli.service');
const CliController = require('../controllers/cli.controller');
const CmdletService = require('../services/cmdlet.service');
const GitService = require('../services/git.service');
const GithubService = require('../services/github.service');
const GithubController = require('../controllers/github.controller');
const ModuleController = require('../controllers/module.controller');
const ModuleService = require('../services/module.service');

module.exports = () => {
	const container = awilix.createContainer({
		injectionMode: awilix.InjectionMode.CLASSIC,
		lifetime: awilix.Lifetime.SINGLETON
	});

	container.register({
		config: awilix.asValue(config),
		db: awilix.asValue(db)
	});

	container.register({
		cliService: awilix.asClass(CliService).singleton(),
		mailNotificationService: awilix
			.asClass(MailNotificationService)
			.singleton(),
		logStoreService: awilix.asClass(LogStoreService).singleton(),
		logParseService: awilix.asClass(LogParseService).singleton(),
		powerShellService: awilix.asClass(PowerShellService).singleton(),
		cmdletDependenciesService: awilix
			.asClass(CmdletDependenciesService)
			.singleton(),
		fsService: awilix.asClass(FsService).singleton(),
		cmdletService: awilix.asClass(CmdletService).singleton(),
		gitService: awilix.asClass(GitService).singleton(),
		githubService: awilix.asClass(GithubService).singleton(),
		moduleService: awilix.asClass(ModuleService)
	});

	container.register({
		moduleController: awilix.asClass(ModuleController),
		cliController: awilix.asClass(CliController).singleton(),
		githubController: awilix.asClass(GithubController).singleton()
	});

	return container;
};
