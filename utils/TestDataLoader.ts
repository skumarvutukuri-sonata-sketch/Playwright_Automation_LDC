import fs from 'fs';
import path from 'path';

export function loadFormsFromSpec(specFile: string) {

    // Example:
    // specFile = tests/degree/AU-LAW/FORM_3026.spec.ts

    const specDirectory = path.dirname(specFile);

    // AU-LAW
    const group = path.basename(specDirectory);

    // degree
    const category = path.basename(path.dirname(specDirectory));

    // AU_LAW_testdata.json
    const jsonFile =
        `${group.replace(/-/g, '_')}_testdata.json`;

    const jsonPath = path.resolve(
        process.cwd(),
        'testdata',
        category,
        group,
        jsonFile
    );

    console.log(`Loading Test Data : ${jsonPath}`);

    return JSON.parse(
        fs.readFileSync(jsonPath, 'utf8')
    );

}