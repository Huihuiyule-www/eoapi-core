import fs from 'fs';
import path from 'path';

export const writeJson = (file: string, data: object): boolean => {
  try {
    fs.writeFileSync(file, JSON.stringify(data));
    return true;
  } catch (e) {
    return false;
  }
}

export const readJson = (file: string): (object | null) => {
  try {
    const data: string = fs.readFileSync(file).toString();
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

export const readFile = (file: string): string => {
  try {
    return fs.readFileSync(file).toString();
  } catch (e) {
    return '';
  }
}

export const fileExists = (file: string): boolean => {
  return fs.existsSync(file);
}

export const ensureDir = (name: string) => {
  if (fs.existsSync(name)) {
    return true;
  } else {
    if (ensureDir(path.dirname(name))) {
      fs.mkdirSync(name);
      return true;
    }
  }
}

export const ensureFile = (file: string) => {
  try {
    if (!fileExists(file)) {
      fs.closeSync(fs.openSync(file, 'w'));
    }
  } catch (e) {
    throw e;
  }
}

export const appendFile = (file: string, data: string) => {
  try {
    fs.appendFileSync(file, data);
  } catch (e) {
    throw e;
  }
}
