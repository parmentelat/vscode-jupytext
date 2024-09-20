import { Uri, window, workspace } from 'vscode';
import * as path from 'path';
import { getGlobalCache, getGlobalTempDir, jupytextScheme } from './constants';
import * as fs from 'fs-extra';
import { locatePythonAndJupytext, runPython, runJupytext } from './python';
import { tempFile } from './utils';

export type FileMapping = {
    virtualIpynb: string;
    tempIpynb: string;
    sourceScript: string;
};

export function getMappingFor(
    option: { script: Uri } | { virtualIpynb: Uri }
): FileMapping | undefined {
    const cache = getGlobalCache();
    const mappings = cache.get<FileMapping[]>('FileMapping', []);
    if ('script' in option) {
        return mappings.find(
            (item) => item.sourceScript === option.script.fsPath
        );
    }
    return mappings.find(
        (item) => item.virtualIpynb === option.virtualIpynb.fsPath
    );
}
export async function addMapping(
    map: FileMapping
) {
    const cache = getGlobalCache();
    let mappings = cache.get<FileMapping[]>('FileMapping', []);
    mappings = mappings.filter(item => item.sourceScript === map.sourceScript || item.virtualIpynb === map.virtualIpynb);
    mappings.push(map);
    await cache.update('FileMapping', mappings);
}
export async function convertToNotebook(
    uri: Uri
): Promise<FileMapping | undefined> {
    // If we already have a notebook opened for this, use that.
    let existingMapping = getMappingFor({ script: uri });
    if (
        existingMapping &&
        workspace.notebookDocuments.find(
            (item) => item.uri.fsPath === existingMapping!.virtualIpynb
        )
    ) {
        return existingMapping;
    }

    const fname = path.basename(uri.fsPath, path.extname(uri.fsPath));
    const targetIpynbName = path.basename(
        await tempFile({ extension: '.ipynb' })
    );
    const targetIpynb = existingMapping ? Uri.file(existingMapping.tempIpynb) : Uri.joinPath(getGlobalTempDir(), targetIpynbName);

    // const cache = getGlobalCache();
    // it makes sense to re-run this each time, so that changes in the Python extension
    // get takes into account
    const prepare = await locatePythonAndJupytext();
    const pythonVersion = await runPython(['--version']);
    console.debug(`vscode-jupytext: using Python version ${pythonVersion}`);
    const jupytextVersion = await runJupytext(['--version']);
    console.debug(`vscode-jupytext: using jupytext version ${jupytextVersion}`);
    await runPython([
        '-m',
        'jupytext',
        '--to',
        'notebook',
        uri.fsPath,
        '--output',
        targetIpynb.fsPath,
    ]);

    // Create a virtual file (exact same file paths, but a different scheme).
    const virtualIpynb = Uri.file(
        path.join(path.dirname(uri.fsPath), fname + '.ipynb')
    ).with({ scheme: 'jupytext' });
    existingMapping = existingMapping || {sourceScript: uri.fsPath, tempIpynb: targetIpynb.fsPath, virtualIpynb: virtualIpynb.fsPath };

    if (await fs.pathExists(targetIpynb.fsPath)) {
        await addMapping(existingMapping);
        return existingMapping;
    }

    window.showErrorMessage(
        'Failed to convert the file to ipynb, see output for details'
    );
}
export async function convertFromNotebookToRawContent(
    uri: Uri,
    targetUri: Uri
): Promise<Buffer> {
    const extension = path.extname(targetUri.fsPath);
    const convertedFile = await runJupytext([
        '--to',
        `${extension.substring(1)}:percent`,
        '--opt',
        'custom_cell_magics=kql',
        uri.fsPath,
        '--output',
        '-',
    ]);

    return Buffer.from(convertedFile, 'utf8');
}
