import { warn } from "../../helpers/console.mjs";
import { toSingleLine } from "../../helpers/templateLiteralTag.mjs";
/**
 * Warn users about problems when using `columnSorting` and `multiColumnSorting` plugins simultaneously.
 */
export function warnAboutPluginsConflict() {
  warn(toSingleLine`Plugins \`columnSorting\` and \`multiColumnSorting\` should not be enabled simultaneously. 
    Only \`multiColumnSorting\` will work. The \`columnSorting\` plugin will be disabled.`);
}