/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Florent Cailhol @ooflorent
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

/**
 * @param {string[]|null} path the property path array
 * @returns {string} the converted path
 */
const pathToString = path =>
	path !== null && path.length > 0
		? path.map(part => `[${JSON.stringify(part)}]`).join("")
		: "";

class ProvidedDependency extends ModuleDependency {
	constructor(request, identifier, path, range) {
		super(request);
		this.identifier = identifier;
		this.path = path;
		this.range = range;
	}

	/**
	 * Update the hash
	 * @param {Hash} hash hash to be updated
	 * @param {ModuleGraph} moduleGraph module graph
	 * @returns {void}
	 */
	updateHash(hash, chunkGraph) {
		super.updateHash(hash, chunkGraph);
		hash.update(this.identifier);
		hash.update(this.path ? this.path.join(",") : "null");
	}
}

class ProvidedDependencyTemplate extends ModuleDependency.Template {
	/**
	 * @param {Dependency} dependency the dependency for which the template should be applied
	 * @param {ReplaceSource} source the current replace source which can be modified
	 * @param {DependencyTemplateContext} templateContext the context object
	 * @returns {void}
	 */
	apply(dependency, source, templateContext) {
		const dep = /** @type {ProvidedDependency} */ (dependency);
		source.replace(dep.range[0], dep.range[1] - 1, dep.identifier);
	}

	/**
	 * @param {Dependency} dependency the dependency for which the template should be applied
	 * @param {DependencyTemplateContext} templateContext the template context
	 * @returns {InitFragment[]|null} the init fragments
	 */
	getInitFragments(dependency, { runtimeTemplate, moduleGraph, chunkGraph }) {
		const dep = /** @type {ProvidedDependency} */ (dependency);
		return [
			new InitFragment(
				`/* provided dependency */ var ${
					dep.identifier
				} = ${runtimeTemplate.moduleExports({
					module: moduleGraph.getModule(dep),
				chunkGraph,
				request: dep.request
				})}${pathToString(dep.path)};\n`,
				InitFragment.STAGE_PROVIDES,
				1,
				`provided ${dep.identifier}`
			)
		];
	}
}

ProvidedDependency.Template = ProvidedDependencyTemplate;

module.exports = ProvidedDependency;
