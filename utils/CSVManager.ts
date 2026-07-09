import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';

export class CSVManager {
    
    /**
     * Resolves the path to your CSV files in the test_data directory
     */
    private static getFilePath(sheetTitle: 'Short_Courses' | 'Degree') {
        return path.resolve(process.cwd(), 'test_data', `${sheetTitle}.csv`);
    }

    /**
     * Reads the CSV and returns the test configuration data (STRICTLY READ-ONLY)
     */
    static getTestData(sheetTitle: 'Short_Courses' | 'Degree'): any[] {
        const filePath = this.getFilePath(sheetTitle);
        
        if (!fs.existsSync(filePath)) {
            throw new Error(`CSV file not found at ${filePath}. Please ensure it exists in the test_data folder.`);
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Parse the raw data cleanly
        const parsed = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
        
        // We removed all the old file-writing and column-injecting logic here!
        return parsed.data;
    }
}