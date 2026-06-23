import fs from 'fs';
import path from 'path';
import { FormsFile } from './types';

export class FormLoader {

  static load(groupPath: string): FormsFile {

    const filePath = path.resolve(
      __dirname,
      `../testdata/${groupPath}/forms.json`
    );

    const data = fs.readFileSync(filePath, 'utf8');

    return JSON.parse(data) as FormsFile;
  }

}