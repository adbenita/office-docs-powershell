const shortId = require('shortid');
const of = require('await-of').default;

class ModuleController {
	constructor(
		config,
		moduleService,
		cmdletService,
		powerShellService,
		logStoreService,
		cmdletDependenciesService
	) {
		this.config = config;
		this.moduleService = moduleService;
		this.pss = powerShellService;
		this.logStoreService = logStoreService;
		this.cmdletService = cmdletService;
		this.cds = cmdletDependenciesService;

		this.installedDependencies = [];
	}

	async execute({ cliModuleName, cliCmdletName, isNeedPullRequest }) {
		const cmdlets = await this._getCmdletsAndInstallDependencies({
			cliModuleName,
			cliCmdletName
		});

		return this._getUpdateResult({ cmdlets, isNeedPullRequest });
	}

	async _installDependenciesForModules({ modules }) {
		for (let module of modules) {
			await this._installDependenceIfNeeded(module);
		}
	}

	async _installDependenceIfNeeded({ name }) {
		if (!this.installedDependencies.includes(name)) {
			this.installedDependencies.push(name);

			await this.cds.installDependencies({ cmdletName: name });
		}
	}

	async _getCmdletsAndInstallDependencies({ cliModuleName, cliCmdletName }) {
		let { docs: modules, ignoreFiles } = this.config.get('platyPS');

		modules = this.moduleService.filterModules({ cliModuleName, modules });

		await this._installDependenciesForModules({ modules });

		return this.cmdletService.getModulesCmdlets({
			cliCmdletName,
			ignoreFiles,
			modules
		});
	}

	async _getUpdateResult({ cmdlets, isNeedPullRequest }) {
		const { tempFolderPath } = this.config.get('platyPS');

		let logs = [],
			errors = [];

		for (let cmdletPath of cmdlets) {
			const logFilePath = `${tempFolderPath}\\${shortId()}.log`;

			if (!isNeedPullRequest) {
				const cmdletTempPath = `${tempFolderPath}\\${shortId()}`;

				cmdletPath = await this.cmdletService.copyMdInTempFolder(
					cmdletPath,
					cmdletTempPath
				);
			}

			const { logContent, err } = await this._updateCmdletMarkdown({
				cmdletPath,
				logFilePath
			});

			if (err) {
				console.log(err);

				errors = [...errors, err];
				continue;
			}

			console.log(logContent);

			logs = [...logs, logContent];
		}

		return {
			logs,
			errors
		};
	}

	async _updateCmdletMarkdown({ cmdletPath, logFilePath }) {
		const [, err] = await of(
			this.pss.updateMarkdown(cmdletPath, logFilePath)
		);

		if (err) {
			return { err };
		}

		const logContent = await this.logStoreService.getLogFileContent({
			logFilePath
		});

		return { logContent };
	}
}

module.exports = ModuleController;
