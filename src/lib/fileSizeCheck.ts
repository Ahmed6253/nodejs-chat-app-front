const MAX_SIZE = 2 * 1024 * 1024;

export const fileSizeCheck = (file: File) => file.size < MAX_SIZE;
