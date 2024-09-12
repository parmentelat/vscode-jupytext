import { spawn } from 'child_process';
import { extensions, Uri } from 'vscode';
import * as path from 'path';
import { getExtensionDir } from './constants';
import { rejects } from 'assert';

type Resource = Uri | undefined;
type IPythonExtensionApi = {
    /**
     * Return internal settings within the extension which are stored in VSCode storage
     */
    settings: {
        /**
         * Returns all the details the consumer needs to execute code within the selected environment,
         * corresponding to the specified resource taking into account any workspace-specific settings
         * for the workspace to which this resource belongs.
         * @param {Resource} [resource] A resource for which the setting is asked for.
         * * When no resource is provided, the setting scoped to the first workspace folder is returned.
         * * If no folder is present, it returns the global setting.
         * @returns {({ execCommand: string[] | undefined })}
         */
        getExecutionDetails(resource?: Resource): {
            /**
             * E.g of execution commands returned could be,
             * * `['<path to the interpreter set in settings>']`
             * * `['<path to the interpreter selected by the extension when setting is not set>']`
             * * `['conda', 'run', 'python']` which is used to run from within Conda environments.
             * or something similar for some other Python environments.
             *
             * @type {(string[] | undefined)} When return value is `undefined`, it means no interpreter is set.
             * Otherwise, join the items returned using space to construct the full execution command.
             */
            execCommand: string[] | undefined;
        };
    };
};

// run locatePythonBinary to set this according to the context
let pythonBinary: string | boolean = false;
let hasJupytext: boolean;


export async function runPython(cmdArgs: string[]): Promise<string> {
    // not python-ready
    if (typeof pythonBinary === 'boolean') {
        console.log("Cannot run Python");
        return "";
    }
    const debug = [pythonBinary].concat(cmdArgs);
    console.log('runPython', debug);
    return runCommand([pythonBinary].concat(cmdArgs));
}

export async function runJupytext(cmdArgs: string[]): Promise<string> {
    console.log("triggering jupytext with args", cmdArgs);
    return runPython(["-m", "jupytext"].concat(cmdArgs));
}



export async function locatePythonAndJupytext(): Promise<boolean> {
    const step1 = await locatePythonBinary();
    if (! step1) { return false; }
    return await usePackagedLibraries();
}

async function locatePythonBinary(): Promise<boolean> {
    const pythonExtBinary = testPythonExtBinary().catch(() => false);
    const pythonSysBinary = testPythonSysBinary().catch(() => false);

    const [extSupported, sysSupported] = await Promise.all([
        pythonExtBinary,
        pythonSysBinary,
    ]);
    if (extSupported !== undefined) {
        pythonBinary = extSupported;
        console.debug(`using python as configured in Python-extension, i.e. in ${pythonBinary}`);
        return true;
    }
    if (sysSupported !== undefined) {
        pythonBinary = sysSupported;
        console.debug(`using system python in ${pythonBinary}`);
        return true;
    }
    return false;
}

async function usePackagedLibraries(): Promise<boolean> {
    const version = await runJupytext(["--version"]);
    hasJupytext = (version !== "");
    console.debug(`hasJupytext = ${hasJupytext}`);
    return hasJupytext;
}

// system python: try python, then python3
async function testPythonSysBinary(): Promise<string | boolean> {
    const pythonBinary = checkPythonBinary("python");
    const python3Binary = checkPythonBinary("python3");
    const [resolved, resolved3] = await Promise.all([
        pythonBinary, python3Binary
    ]);
    if (resolved !== false) {
        return resolved;
    }
    if (resolved3 !== false) {
        return resolved3;
    }
    return false;
}
// locate the binary configured in Python-extension
async function testPythonExtBinary(): Promise<string | boolean> {
    const pyExt =
        extensions.getExtension<IPythonExtensionApi>('ms-python.python');
    if (!pyExt) {
        return false;
    }
    if (!pyExt.isActive) {
        try {
            await pyExt.activate();
        } catch (ex) {
            console.error(`Failed to activate Python Extension`, ex);
            return false;
        }
    }
    const cli = pyExt.exports.settings.getExecutionDetails(undefined);
    if (!cli.execCommand) {
        return false;
    }
    // remove any trailing newline
    return checkPythonBinary(cli.execCommand);
}

// find the actual binary
async function checkPythonBinary(command: string | string[]): Promise<string | boolean> {
    let asArray = (command instanceof Array) ? command : [command];
    const cmdArgs = asArray.concat(
        '-c',
        'import sys;print(sys.executable)'
    );
    try {
        const output = await runCommand(cmdArgs);
        return (output.length === 0) ? false : output.replace(/\n+$/, "");
    } catch (ex) {
        console.error(`Failed to find python, running ${cmdArgs}`, ex);
        return false;
    }
}


function buildCmd(cmdArgs: string[]) {
    return cmdArgs.map((item) => item.replace(/\\/g, '/'));
}

// run a command, return stdout if all goes well, reject with stderr other wise
export async function runCommand(cmdArgs: string[]): Promise<string> {
    const [cmd, ...args] = buildCmd(cmdArgs);
    const env: NodeJS.ProcessEnv = {
        ...process.env,
        PYTHONUNBUFFERED: '1',
        PYTHONIOENCODING: process.env['PYTHONIOENCODING'] || 'utf-8',
    };
    let spawnEnv = {cwd: '.', env};
    // only use packagelibs if jupytedt was not pip-installed
    if (! hasJupytext) {
        spawnEnv.cwd = path.join(getExtensionDir().fsPath, 'python-libs');
    }

    const proc = spawn(cmd, args, spawnEnv);
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (data) => {
        stdout += data.toString('utf8');
    });
    proc.stderr.on('data', (data) => {
        stderr += data.toString('utf8');
    });
    return new Promise<string>((resolve, reject) => {
        proc.on('error', (_code: number) => {
            return reject(stderr);
        });
        proc.on('exit', (code: number) => {
            if (code > 0) {
                return reject(stderr);
            }
            resolve(stdout);
        });
        proc.on('close', () => resolve(stdout));
    });
}
