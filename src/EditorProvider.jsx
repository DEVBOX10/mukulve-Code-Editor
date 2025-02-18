import EditorContext from "./EditorContext";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";

function EditorProvider({ children }) {
  const [openFiles, setOpenFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [currentDirectory, setCurrentDirectory] = useState(null);

  async function openFile(file) {
    for (let i = 0; i < openFiles.length; i++) {
      if (openFiles[i].path == file.path) {
        setCurrentFile(i);
        return;
      }
    }
    let content = await invoke("read_file", { path: file.path });

    setOpenFiles((openFiles) => [
      ...openFiles,
      { path: file.path, name: file.name, content: content },
    ]);
    setCurrentFile(openFiles.length);
  }

  function closeFile(index) {
    let newOpenFiles = [...openFiles];
    newOpenFiles.splice(index, 1);

    if (newOpenFiles.length == 0) {
      setCurrentFile(null);
      setOpenFiles(newOpenFiles);
    } else {
      setOpenFiles(newOpenFiles);
      setCurrentFile(0);
    }
  }

  async function OpenFolder() {
    const selected = await open({
      directory: true,
      multiple: false,
    });
    if (Array.isArray(selected) || selected === null) {
      return;
    } else {
      setCurrentDirectory(selected);
    }
  }

  function isFileOpen(file) {
    for (let i = 0; i < openFiles.length; i++) {
      if (openFiles[i].path == file.path && i == currentFile) {
        return true;
      }
    }
    return false;
  }

  return (
    <EditorContext.Provider
      value={{
        openFile,
        openFiles,
        setCurrentFile,
        currentFile,
        closeFile,
        setOpenFiles,
        OpenFolder,
        currentDirectory,
        isFileOpen,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export default EditorProvider;
