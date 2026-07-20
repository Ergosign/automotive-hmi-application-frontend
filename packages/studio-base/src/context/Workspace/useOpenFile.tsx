// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import path from "path";
import { useCallback, useMemo } from "react";

import { useCurrentLayoutActions } from "@foxglove/studio-base/context/CurrentLayoutContext";
import {
  IDataSourceFactory,
  usePlayerSelection,
} from "@foxglove/studio-base/context/PlayerSelectionContext";
import { View } from "@foxglove/studio-base/providers/CurrentLayoutProvider/defaultLayout";
import { useNavigationStore } from "@foxglove/studio-base/stores/useNavigationStore";
import { useSettingsStore } from "@foxglove/studio-base/stores/useSettingsStore";
import showOpenFilePicker from "@foxglove/studio-base/util/showOpenFilePicker";

export function useOpenFile(sources: IDataSourceFactory[]): () => Promise<void> {
  const { selectSource } = usePlayerSelection();
  const { setLocalFileName, setLocalFileSize } = useNavigationStore();
  const { changePanelLayout } = useCurrentLayoutActions();
  const { isUnsaved, setIsUnsavedDialogOpen, setUnsavedResolver, setIsUnsaved } =
    useSettingsStore();

  const allExtensions = useMemo(() => {
    return sources.reduce<string[]>((all, source) => {
      if (!source.supportedFileTypes) {
        return all;
      }

      return [...all, ...source.supportedFileTypes];
    }, []);
  }, [sources]);

  return useCallback(async () => {
    if (isUnsaved) {
      setIsUnsavedDialogOpen(true);
      await new Promise<void>((resolve) => {
        setUnsavedResolver(resolve);
      });
      setIsUnsavedDialogOpen(false);
      setIsUnsaved(false);
    }

    const [fileHandle] = await showOpenFilePicker({
      types: [
        {
          description: allExtensions.join(", "),
          accept: { "application/octet-stream": allExtensions },
        },
      ],
    });

    if (!fileHandle) {
      return;
    }

    const file = await fileHandle.getFile();

    const matchingSources = sources.filter((source) => {
      if (!source.supportedFileTypes || source.type !== "file") {
        return false;
      }
      const extension = path.extname(file.name);
      return source.supportedFileTypes.includes(extension);
    });

    if (matchingSources.length > 1) {
      throw new Error(`Multiple source matched ${file.name}. This is not supported.`);
    }

    const foundSource = matchingSources[0];
    if (!foundSource) {
      throw new Error(`Cannot find source to handle ${file.name}`);
    }

    const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
    setLocalFileName(nameWithoutExtension);
    setLocalFileSize(BigInt(file.size));
    selectSource(foundSource.id, { type: "file", handle: fileHandle });
    changePanelLayout({ layout: View.LIVE });
  }, [
    allExtensions,
    selectSource,
    sources,
    setLocalFileName,
    setLocalFileSize,
    changePanelLayout,
    isUnsaved,
    setIsUnsavedDialogOpen,
    setUnsavedResolver,
    setIsUnsaved,
  ]);
}
