# locally build and install

## build a vsix file

one-time install
```console
npm install -f @vscode/vsce
```

```console
cd ~/git/vscode-jupytext/
vsce package -o vscode-jupytext.vsix --no-yarn
```

from <https://code.visualstudio.com/api/working-with-extensions/publishing-extension#packaging-extensions>

## install the vsix file locally

```console
code --install-extension vscode-jupytext.vsix
```

from <https://code.visualstudio.com/docs/editor/extension-marketplace#_install-from-a-vsix>

# publish

NOT using the azure devops pipeline, but publishing on open-vsx.org instead
see https://github.com/eclipse/openvsx/wiki/Publishing-Extensions

## the command publish

```bash
npx ovsx publish vscode-jupytext.vsix -p <token>
```

