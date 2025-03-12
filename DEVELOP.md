# develop

## one-time install

```console
npm install -f @vscode/vsce
```

## locally build a vsix file

```console
vsce package -o vscode-jupytext.vsix --no-yarn
```

from <https://code.visualstudio.com/api/working-with-extensions/publishing-extension#packaging-extensions>

## install the vsix file locally

```console
code --install-extension vscode-jupytext.vsix
```

from <https://code.visualstudio.com/docs/editor/extension-marketplace#_install-from-a-vsix>

## publish on vscode market place

had to

- create an organization with Azure DevOps (`thierryparmentelat`)
- that one has received a personal access token (could only make it valid for one year until 2026-03-11)
- create a publisher under that organiztion (`parmentelat`)


see https://code.visualstudio.com/api/working-with-extensions/publishing-extension
then

```bash
vsce publish
```

## publish on open-vsx.org (eclipse thingy)

see https://github.com/eclipse/openvsx/wiki/Publishing-Extensions

was our first successful publication, but it turns out it does no show up in
vscode without some tedious manual steps

```bash
npx ovsx publish vscode-jupytext.vsix -p <token>
```
