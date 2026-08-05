import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';

export class CSVManager {
    
    /**
     * Resolves the path to your CSV files in the test_data directory
     */
    private static getFilePath(sheetTitle: string): string {
        return path.resolve(process.cwd(), 'test_data', `${sheetTitle}.csv`);
    }

    /**
     * Reads the CSV and returns the test configuration data (STRICTLY READ-ONLY)
     * Supports both headered and headerless CSV files.
     */
    static getTestData(sheetTitle: string): any[] {
        const filePath = this.getFilePath(sheetTitle);
        
        if (!fs.existsSync(filePath)) {
            throw new Error(`CSV file not found at ${filePath}. Please ensure it exists in the test_data folder.`);
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const parsed = Papa.parse(fileContent, { skipEmptyLines: true });

        if (!parsed.data || parsed.data.length === 0) {
            return [];
        }

        const firstRow = parsed.data[0] as any;
        const isHeaderRow = Array.isArray(firstRow) && firstRow.some((value: any) => {
            const text = String(value ?? '').trim().toLowerCase();
            return text.includes('form') || text.includes('group') || text.includes('url') || text.includes('run');
        });

        if (!isHeaderRow) {
            return (parsed.data as any[]).filter(Array.isArray).map((row: any[]) => {
                const values = row.map((value: any) => String(value ?? '').trim());
                return {
                    Form_ID: values[0] || '',
                    Group_Name: values[1] || '',
                    URL: values[2] || '',
                    Run_Flag: values[3] || '',
                    url: values[2] || '',
                    group_name: values[1] || '',
                    form_id: values[0] || '',
                    run_flag: values[3] || ''
                };
            });
        }

        const parsedWithHeader = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
        return parsedWithHeader.data;
    }
}