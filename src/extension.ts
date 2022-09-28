import path = require("path");
import { commands, ExtensionContext, window, workspace } from "vscode";

/**
 * Checks for `.code-workspace` files and opens a quick-pick to
 * select one to open in the current window.
 */
async function openWorkspaceFile() {
	// Find all `.code-workspace` files
	const uris = await workspace.findFiles('**/*.code-workspace');
	if (!uris?.length) {
		console.log("No workspace-files found.");
		window.showInformationMessage('No workspace-files found in active directory.');
		return;
	}
	console.log(`${uris.length} workspace-file(s) found. Open Quick Pick…`);

	// Open Quick Pick
	const quickPick = window.createQuickPick();
	quickPick.title = `${uris.length} workspace-file(s) found! Select to open…`;
	quickPick.ignoreFocusOut = true;
	quickPick.items = uris.map((uri, idx) => {
		const isOpen = workspace.workspaceFile && workspace.workspaceFile.path === uri.path;
		return {
			uri,
			label: `${isOpen ? '$(folder-active)' : '$(folder)'} ${path.basename(uri.path)} ${isOpen ? '(open)' : ''}`,
			detail: uri.path,
			picked: idx === 0,
		};
	});

	// Open workspace-file when selected
	quickPick.onDidChangeSelection(selection => {
		console.log("Open selected workspace-file:", selection[0]);
		commands.executeCommand('vscode.openFolder', (selection[0] as any).uri);
		quickPick.hide();
	});

	quickPick.onDidHide(() => quickPick.dispose());
	quickPick.show();
}

/**
 * This method is called when an `activationEvent` occurs which, in this case,
 * is the existence of a `.code-workspace` file in the opened directory.
 */
export async function activate(context: ExtensionContext) {
	if (!workspace.workspaceFile) {
		openWorkspaceFile();
	}

	let disposable = commands.registerCommand('auto-open-workspace.open-workspace-file', () => {
		openWorkspaceFile();
	});
	context.subscriptions.push(disposable);
}

