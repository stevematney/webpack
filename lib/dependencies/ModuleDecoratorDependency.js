/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

"use strict";

const InitFragment = require("../InitFragment");
const ModuleDependency = require("./ModuleDependency");

/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../DependencyTemplates")} DependencyTemplates */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../RuntimeTemplate")} RuntimeTemplate */
/** @typedef {import("../util/createHash").Hash} Hash */

class ModuleDecoratorDependency extends ModuleDependency {
	/**
	 * Update the hash
	 * @param {Hash} hash hash to be updated
	 * @param {ModuleGraph} moduleGraph module graph
	 * @returns {void}
	 */
	updateHash(hash, moduleGraph) {
		super.updateHash(hash, moduleGraph);
		hash.update("module decorator");
	}
}

ModuleDecoratorDependency.Template = class ModuleDecoratorDependencyTemplate extends ModuleDependency.Template {
	/**
	 * @param {Dependency} dependency the dependency for which the template should be applied
	 * @param {ReplaceSource} source the current replace source which can be modified
	 * @param {DependencyTemplateContext} templateContext the context object
	 * @returns {void}
	 */
	apply(dependency, source, templateContext) {}

	/**
	 * @param {Dependency} dependency the dependency for which the template should be applied
	 * @param {DependencyTemplateContext} templateContext the template context
	 * @returns {InitFragment[]|null} the init fragments
	 */
	getInitFragments(dependency, { runtimeTemplate, moduleGraph, chunkGraph }) {
		const dep = /** @type {ModuleDecoratorDependency} */ (dependency);
		const originModule = moduleGraph.getOrigin(dep);
		return [
			new InitFragment(
				`/* module decorator */ ${
					originModule.moduleArgument
				} = ${runtimeTemplate.moduleExports({
					module: moduleGraph.getModule(dep),
					request: dep.request
				})}(${originModule.moduleArgument});\n`,
				InitFragment.STAGE_PROVIDES,
				0,
				`module decorator ${chunkGraph.getModuleId(originModule)}`
			)
		];
	}
};

module.exports = ModuleDecoratorDependency;
