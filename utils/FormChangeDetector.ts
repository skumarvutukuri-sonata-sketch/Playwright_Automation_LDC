// import * as fs from 'fs';
// import * as path from 'path';
// import { FieldCaptureBus, CapturedStepData } from './FieldCaptureBus';

// // ============================================================================
// // INTERFACES
// // ============================================================================

// export interface FormField {
//     name: string;
//     type: string;
//     step: number;
// }

// export interface FormSnapshot {
//     formId: string;
//     capturedAt: string;
//     totalSteps: number;
//     totalFieldCount: number;
//     steps: { stepNumber: number; fieldCount: number; fields: FormField[] }[];
//     allFields: FormField[];
// }

// export interface FieldChange {
//     fieldName: string;
//     changeType: 'ADDED' | 'REMOVED' | 'MODIFIED' | 'MOVED';
//     oldValue?: string;
//     newValue?: string;
// }

// // Category baseline file structure:
// // { category, updatedAt, forms: { [formId]: FormSnapshot } }
// interface CategoryBaseline {
//     category: string;
//     updatedAt: string;
//     forms: Record<string, FormSnapshot>;
// }

// // ============================================================================
// // CLASS
// // ============================================================================

// export class FormChangeDetector {
//     private snapshotDir: string;

//     constructor(snapshotDir: string = 'utils/form-snapshots') {
//         this.snapshotDir = snapshotDir;
//         if (!fs.existsSync(this.snapshotDir)) {
//             fs.mkdirSync(this.snapshotDir, { recursive: true });
//         }
//     }

//     // ----------------------------------------------------------------
//     // Build snapshot from FieldCaptureBus (no extra browser navigation)
//     // ----------------------------------------------------------------
//     public buildSnapshotFromBus(formId: string): FormSnapshot | null {
//         const busData: CapturedStepData | null = FieldCaptureBus.getAndClear(formId);
//         if (!busData || busData.steps.length === 0) return null;

//         const sortedSteps = busData.steps.sort((a, b) => a.stepNumber - b.stepNumber);
//         const allFields: FormField[] = sortedSteps.flatMap(s =>
//             s.fields.map(f => ({ name: f.name, type: f.type, step: s.stepNumber }))
//         );

//         return {
//             formId,
//             capturedAt: new Date().toISOString(),
//             totalSteps: sortedSteps.length,
//             totalFieldCount: allFields.length,
//             steps: sortedSteps.map(s => ({
//                 stepNumber: s.stepNumber,
//                 fieldCount: s.fields.length,
//                 fields: s.fields.map(f => ({ name: f.name, type: f.type, step: s.stepNumber }))
//             })),
//             allFields
//         };
//     }

//     // ----------------------------------------------------------------
//     // Category file helpers: one JSON per category (Degree / Short_Courses)
//     // ----------------------------------------------------------------
//     private categoryFilePath(category: string): string {
//         // Sanitise: "Short Courses" → "Short_Courses"
//         const safe = category.replace(/\s+/g, '_');
//         return path.join(this.snapshotDir, `${safe}_baseline.json`);
//     }

//     private loadCategoryBaseline(category: string): CategoryBaseline {
//         const filePath = this.categoryFilePath(category);
//         if (fs.existsSync(filePath)) {
//             try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch (_) {}
//         }
//         return { category, updatedAt: new Date().toISOString(), forms: {} };
//     }

//     private saveCategoryBaseline(data: CategoryBaseline): void {
//         data.updatedAt = new Date().toISOString();
//         fs.writeFileSync(this.categoryFilePath(data.category), JSON.stringify(data, null, 2));
//     }

//     // ----------------------------------------------------------------
//     // Public API
//     // ----------------------------------------------------------------

//     /** Save / update a form entry inside the category baseline file. */
//     public saveBaseline(snapshot: FormSnapshot, category: string): void {
//         const data = this.loadCategoryBaseline(category);
//         data.forms[snapshot.formId] = snapshot;
//         this.saveCategoryBaseline(data);

//         console.log(`\n✅ BASELINE SAVED: ${snapshot.formId} → ${category.replace(/\s+/g, '_')}_baseline.json`);
//         console.log(`   Steps: ${snapshot.totalSteps} | Fields: ${snapshot.totalFieldCount}`);
//         snapshot.steps.forEach(s =>
//             console.log(`   Step ${s.stepNumber}: ${s.fields.map(f => f.name).join(', ')}`)
//         );
//     }

//     /** Load the saved baseline snapshot for a specific form inside a category. */
//     public loadBaseline(formId: string, category: string): FormSnapshot | null {
//         const data = this.loadCategoryBaseline(category);
//         return data.forms[formId] ?? null;
//     }

//     /** Compare current snapshot against saved baseline. */
//     public detectChanges(current: FormSnapshot, baseline: FormSnapshot): FieldChange[] {
//         const changes: FieldChange[] = [];
//         const baselineMap = new Map(baseline.allFields.map(f => [f.name, f]));
//         const currentMap  = new Map(current.allFields.map(f => [f.name, f]));

//         baselineMap.forEach((bf, name) => {
//             const cf = currentMap.get(name);
//             if (!cf) {
//                 changes.push({ fieldName: name, changeType: 'REMOVED', oldValue: `${bf.type} on step ${bf.step}` });
//             } else if (bf.type !== cf.type) {
//                 changes.push({ fieldName: name, changeType: 'MODIFIED', oldValue: bf.type, newValue: cf.type });
//             } else if (bf.step !== cf.step) {
//                 changes.push({ fieldName: name, changeType: 'MOVED', oldValue: `step ${bf.step}`, newValue: `step ${cf.step}` });
//             }
//         });

//         currentMap.forEach((cf, name) => {
//             if (!baselineMap.has(name)) {
//                 changes.push({ fieldName: name, changeType: 'ADDED', newValue: `${cf.type} on step ${cf.step}` });
//             }
//         });

//         return changes;
//     }

//     /** Print changes to console. */
//     public displayChanges(formId: string, changes: FieldChange[]): void {
//         if (changes.length === 0) {
//             console.log(`✅ ${formId}: No form structure changes.`);
//             return;
//         }
//         console.log(`\n🚨 FORM CHANGES DETECTED: ${formId}`);
//         changes.forEach(c => {
//             if (c.changeType === 'ADDED')    console.log(`  ➕ ADDED:    ${c.fieldName} (${c.newValue})`);
//             if (c.changeType === 'REMOVED')  console.log(`  ➖ REMOVED:  ${c.fieldName} (was ${c.oldValue})`);
//             if (c.changeType === 'MODIFIED') console.log(`  🔄 MODIFIED: ${c.fieldName}  ${c.oldValue} → ${c.newValue}`);
//             if (c.changeType === 'MOVED')    console.log(`  🔀 MOVED:    ${c.fieldName}  ${c.oldValue} → ${c.newValue}`);
//         });
//     }
// }



import * as fs from 'fs';
import * as path from 'path';
import { FieldCaptureBus, CapturedStepData } from './FieldCaptureBus';

export interface FormField { name: string; type: string; step: number; }
export interface FormSnapshot { formId: string; capturedAt: string; totalSteps: number; totalFieldCount: number; steps: { stepNumber: number; fieldCount: number; fields: FormField[] }[]; allFields: FormField[]; }
export interface FieldChange { fieldName: string; changeType: 'ADDED' | 'REMOVED' | 'MODIFIED' | 'MOVED'; oldValue?: string; newValue?: string; }
interface CategoryBaseline { category: string; updatedAt: string; forms: Record<string, FormSnapshot>; }

export class FormChangeDetector {
    private snapshotDir: string;

    constructor(snapshotDir: string = 'utils/form-snapshots') {
        this.snapshotDir = snapshotDir;
        if (!fs.existsSync(this.snapshotDir)) {
            fs.mkdirSync(this.snapshotDir, { recursive: true });
        }
    }

    public buildSnapshotFromBus(formId: string): FormSnapshot | null {
        const busData: CapturedStepData | null = FieldCaptureBus.getAndClear(formId);
        if (!busData || busData.steps.length === 0) return null;

        const sortedSteps = busData.steps.sort((a, b) => a.stepNumber - b.stepNumber);
        const allFields: FormField[] = sortedSteps.flatMap(s =>
            s.fields.map(f => ({ name: f.name, type: f.type, step: s.stepNumber }))
        );

        return {
            formId, capturedAt: new Date().toISOString(), totalSteps: sortedSteps.length, totalFieldCount: allFields.length,
            steps: sortedSteps.map(s => ({
                stepNumber: s.stepNumber, fieldCount: s.fields.length,
                fields: s.fields.map(f => ({ name: f.name, type: f.type, step: s.stepNumber }))
            })),
            allFields
        };
    }

    private categoryFilePath(category: string): string {
        const safe = category.replace(/\s+/g, '_');
        return path.join(this.snapshotDir, `${safe}_baseline.json`);
    }

    private loadCategoryBaseline(category: string): CategoryBaseline {
        const filePath = this.categoryFilePath(category);
        if (fs.existsSync(filePath)) {
            try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch (_) {}
        }
        return { category, updatedAt: new Date().toISOString(), forms: {} };
    }

    private saveCategoryBaseline(data: CategoryBaseline): void {
        data.updatedAt = new Date().toISOString();
        fs.writeFileSync(this.categoryFilePath(data.category), JSON.stringify(data, null, 2));
    }

    public saveBaseline(snapshot: FormSnapshot, category: string): void {
        const data = this.loadCategoryBaseline(category);
        data.forms[snapshot.formId] = snapshot;
        this.saveCategoryBaseline(data);
    }

    public loadBaseline(formId: string, category: string): FormSnapshot | null {
        const data = this.loadCategoryBaseline(category);
        return data.forms[formId] ?? null;
    }

    public detectChanges(current: FormSnapshot, baseline: FormSnapshot): FieldChange[] {
        const changes: FieldChange[] = [];
        const baselineMap = new Map(baseline.allFields.map(f => [f.name, f]));
        const currentMap  = new Map(current.allFields.map(f => [f.name, f]));

        baselineMap.forEach((bf, name) => {
            const cf = currentMap.get(name);
            if (!cf) {
                changes.push({ fieldName: name, changeType: 'REMOVED', oldValue: `${bf.type} on step ${bf.step}` });
            } else if (bf.type !== cf.type) {
                changes.push({ fieldName: name, changeType: 'MODIFIED', oldValue: bf.type, newValue: cf.type });
            } else if (bf.step !== cf.step) {
                changes.push({ fieldName: name, changeType: 'MOVED', oldValue: `step ${bf.step}`, newValue: `step ${cf.step}` });
            }
        });

        currentMap.forEach((cf, name) => {
            if (!baselineMap.has(name)) {
                changes.push({ fieldName: name, changeType: 'ADDED', newValue: `${cf.type} on step ${cf.step}` });
            }
        });

        return changes;
    }

    public displayChanges(formId: string, changes: FieldChange[]): void {
        if (changes.length === 0) return;
        console.log(`\n🚨 FORM CHANGES DETECTED: ${formId}`);
        changes.forEach(c => {
            if (c.changeType === 'ADDED')    console.log(`  ➕ ADDED:    ${c.fieldName} (${c.newValue})`);
            if (c.changeType === 'REMOVED')  console.log(`  ➖ REMOVED:  ${c.fieldName} (was ${c.oldValue})`);
            if (c.changeType === 'MODIFIED') console.log(`  🔄 MODIFIED: ${c.fieldName}  ${c.oldValue} → ${c.newValue}`);
            if (c.changeType === 'MOVED')    console.log(`  🔀 MOVED:    ${c.fieldName}  ${c.oldValue} → ${c.newValue}`);
        });
    }
}
