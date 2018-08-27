/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Florent Cailhol @ooflorent
*/

"use strict";

const DependencyTemplate = require("../DependencyTemplate");
const InitFragment = require("../InitFragment");
const NullDependency = require("./NullDependency");

/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../DependencyTemplates")} DependencyTemplates */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../RuntimeTemplate")} RuntimeTemplate */
/** @typedef {import("../util/createHash").Hash} Hash */

class CachedConstDependency extends NullDependency {
	constructor(expression, range, identifier) {
		super();
		this.expression = expression;
		this.range = range;
		this.identifier = identifier;
	}

	/**
	 * Update the hash
	 * @param {Hash} hash hash to be updated
	 * @param {ModuleGraph} moduleGraph module graph
	 * @returns {void}
	 */
	updateHash(hash, chunkGraph) {
		hash.update(this.identifier + "");
		hash.update(this.range + "");
		hash.update(this.expression + "");
	}
}

CachedConstDependency.Template = class CachedConstDependencyTemplate extends DependencyTemplate {
	/**
	 * @param {Dependency} dependency the dependency for which the template should be applied
	 * @param {ReplaceSource} source the current replace source which can be modified
	 * @param {DependencyTemplateContext} templateContext the context object
	 * @returns {void}
	 */
	apply(dependency, source, { runtimeTemplate, dependencyTemplates }) {
		const dep = /** @type {CachedConstDependency} */ (dependency);
		if (typeof dep.range === "number") {
			source.insert(dep.range, dep.identifier);
			return;
		}

		source.replace(dep.range[0], dep.range[1] - 1, dep.identifier);
	}

	/**
	 * @param {Dependency} dependency the dependency for which the template should be applied
	 * @param {DependencyTemplateContext} templateContext the template context
	 * @returns {InitFragment[]|null} the init fragments
	 */
	getInitFragments(dependency, { runtimeTemplate, dependencyTemplates }) {
		const dep = /** @type {CachedConstDependency} */ (dependency);
		return [
			new InitFragment(
				`var ${dep.identifier} = ${dep.expression};\n`,
				InitFragment.STAGE_CONSTANTS,
				0,
				`const ${dep.identifier}`
			)
		];
	}
};

module.exports = CachedConstDependency;
