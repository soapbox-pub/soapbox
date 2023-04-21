import React, { useCallback, useEffect, useState } from 'react';

/** Controls the state of files being dragged over a node. */
function useDraggedFiles<R extends HTMLElement>(node: React.RefObject<R>, onDrop?: (files: FileList) => void) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDocumentDragEnter = useCallback((e: DragEvent) => {
    if (isDraggingFiles(e)) {
      setIsDragging(true);
    }
  }, [setIsDragging]);

  const handleDocumentDragLeave = useCallback((e: DragEvent) => {
    if (isOffscreen(e)) {
      setIsDragging(false);
    }
  }, [setIsDragging]);

  const handleDocumentDrop = useCallback((e: DragEvent) => {
    setIsDragging(false);
  }, [setIsDragging]);

  const handleDrop = useCallback((e: DragEvent) => {
    if (isDraggingFiles(e) && onDrop) {
      onDrop(e.dataTransfer.files);
    }
    setIsDragging(false);
    e.preventDefault();
  }, [onDrop]);

  useEffect(() => {
    document.addEventListener('dragenter', handleDocumentDragEnter);
    document.addEventListener('dragleave', handleDocumentDragLeave);
    document.addEventListener('drop', handleDocumentDrop);
    return () => {
      document.removeEventListener('dragenter', handleDocumentDragEnter);
      document.removeEventListener('dragleave', handleDocumentDragLeave);
      document.removeEventListener('drop', handleDocumentDrop);
    };
  }, []);

  useEffect(() => {
    node.current?.addEventListener('drop', handleDrop);
    return () => {
      node.current?.removeEventListener('drop', handleDrop);
    };
  }, [node.current]);

  return {
    /** Whether the document is being dragged over. */
    isDragging,
  };
}

/** Ensure only files are being dragged, and not eg highlighted text. */
function isDraggingFiles(e: DragEvent): e is DragEvent & { dataTransfer: DataTransfer } {
  if (e.dataTransfer) {
    const { types } = e.dataTransfer;
    return types.length === 1 && types[0] === 'Files';
  } else {
    return false;
  }
}

/** Check whether the cursor is in the screen. Mostly useful for dragleave events. */
function isOffscreen(e: DragEvent): boolean {
  return e.screenX === 0 && e.screenY === 0;
}

export { useDraggedFiles };