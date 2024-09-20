# a soft fork of the "Jupytext for notebooks" extension

this extension <https://github.com/parmentelat/vscode-jupytext> is a soft fork of <https://github.com/notebookPowerTools/vscode-jupytext> with some fixes; it does contain fixes [from congyiwu's fork](https://github.com/congyiwu/vscode-jupytext) as well.

in particular it fixes the following issues:

- ability to save the text source after a change has been made in the ipynb notebook:
  do not always blindly use subformat 'percent', it is 'myst' for markdown files
- replace the intrusive 'Open as a Jupyter Notebook' context menu item with a more discrete pen icon
- use Python as set in the Python extension settings if found  
  use package-libs only if jupytext not installed

caveats:

- MyST markdown in notebook cells is not rendered properly
- if vs-code is closed while an open .ipynb file is opened, upon re-opening the file,  
  the notebook will be not be found

---

A [Visual Studio Code](https://code.visualstudio.com/) [extension](https://marketplace.visualstudio.com/items?itemName=donjayamanne.vscode-jupytext) that provides ability to open and execute script files as Jupyter Notebooks.

## Like the UI of Jupyter Notebooks, but prefer to use plain text files, this is the extension for you.

<img src=https://raw.githubusercontent.com/notebookPowerTools/vscode-jupytext/main/images/main.gif>

# Features

* Open and execute script files as Jupyter Notebooks
* Editing/Updating notebooks will result in the corresponding source script file getting updated
* Notebook file doesn't exist on disc (hence no need to manage two files and manage syncing the two).

# Requirements

* Jupyter Extension
* VS Code Insiders (VS Code Stable is not yet supported)
* Python (temporary, see `Roadmap`)

# Getting Started

* This extension requires VS Code 1.60.1 or newer
* Run the `Open as a Jupyter Notebook` from the context menu or editor title menu bar for a `*.py` file
* Start executing code against Jupyter Kernels, save changes to notebook will result in the corresponding script file getting updated.

### Based on the [Jupytext](https://github.com/mwouts/jupytext)

* This extension merely atttempts to provide the same functionality as Jupytext, but in  VSCode.
* The Jupytext package is bundled with the extension and used where `Python` is avaialble.
* Opening `Python` and some files such as `rmd` or `markdown` will require `Python` runtime for now

### Roadmap

* Remove dependency on `Python` runtime for script files such as `TypeScript, JavaScript, Rust, C#, F#, etc`
* Seemless editing of both script file and notebook together
* Support metadata in script files (currently metadata might not be saved)
* Configuration of formats (metdata)
