import { Uri, window } from "vscode";
// import { isConversionSupportedWithoutPython } from "./languages";
// import { isPythonAvailable } from "./python";

// export async function openFileAsPairedNotebook(uri: Uri){
//     console.log("openFileAsPairedNotebook")
//     const hasPython = await isPythonAvailable();
//     if (!hasPython && !isConversionSupportedWithoutPython(uri)){
//         window.showErrorMessage('Unable to open file as a paired notebook with Python installed');
//         return;
//     }
// }