// /**
//  * FieldCaptureBus — Shared state between FormRunner and FormChangeDetector
//  *
//  * FormRunner already captures form fields during its normal execution (per step).
//  * This bus collects that data WITHOUT any extra browser navigation.
//  *
//  * Usage:
//  *  - FormRunner writes: FieldCaptureBus.addStepFields(formId, stepNumber, fields)
//  *  - FormChangeDetector reads: FieldCaptureBus.getAndClear(formId)
//  */

// export interface CapturedField {
//     name: string;
//     type: string;
//     step: number;
// }

// export interface CapturedStepData {
//     formId: string;
//     steps: { stepNumber: number; fields: CapturedField[] }[];
// }

// class FieldCaptureBusClass {
//     // Keyed by formId -> array of step data
//     private data: Record<string, { stepNumber: number; fields: CapturedField[] }[]> = {};

//     /**
//      * Called by FormRunner when it finishes gathering visibleElements for a step.
//      * field objects = Array of { name, type }
//      */
//     addStepFields(formId: string, stepNumber: number, fields: CapturedField[]): void {
//         if (!this.data[formId]) {
//             this.data[formId] = [];
//         }
//         // Avoid duplicate step entries (e.g. positive + negative run same step)
//         const existing = this.data[formId].find(s => s.stepNumber === stepNumber);
//         if (!existing) {
//             this.data[formId].push({ stepNumber, fields });
//         }
//     }

//     /**
//      * Get captured data for a form and clear it from memory.
//      * Returns null if nothing was captured.
//      */
//     getAndClear(formId: string): CapturedStepData | null {
//         const steps = this.data[formId];
//         if (!steps || steps.length === 0) return null;
//         delete this.data[formId];
//         return { formId, steps };
//     }

//     /**
//      * Check if any data exists for a form.
//      */
//     has(formId: string): boolean {
//         return !!(this.data[formId] && this.data[formId].length > 0);
//     }

//     /**
//      * Clear all data (e.g. between test runs)
//      */
//     clearAll(): void {
//         this.data = {};
//     }
// }

// // Singleton — shared across all imports in the same Node.js process
// export const FieldCaptureBus = new FieldCaptureBusClass();


/**
 * FieldCaptureBus — Shared state between FormRunner and FormChangeDetector
 *
 * FormRunner already captures form fields during its normal execution (per step).
 * This bus collects that data WITHOUT any extra browser navigation.
 *
 * Usage:
 * - FormRunner writes: FieldCaptureBus.addStepFields(formId, stepNumber, fields)
 * - FormChangeDetector reads: FieldCaptureBus.getAndClear(formId)
 */

export interface CapturedField {
    name: string;
    type: string;
    step: number;
}

export interface CapturedStepData {
    formId: string;
    steps: { stepNumber: number; fields: CapturedField[] }[];
}

class FieldCaptureBusClass {
    // Keyed by formId -> array of step data
    private data: Record<string, { stepNumber: number; fields: CapturedField[] }[]> = {};

    /**
     * Called by FormRunner when it finishes gathering visibleElements for a step.
     * field objects = Array of { name, type }
     */
    addStepFields(formId: string, stepNumber: number, fields: CapturedField[]): void {
        if (!this.data[formId]) {
            this.data[formId] = [];
        }
        // Avoid duplicate step entries (e.g. positive + negative run same step)
        const existing = this.data[formId].find(s => s.stepNumber === stepNumber);
        if (!existing) {
            this.data[formId].push({ stepNumber, fields });
        }
    }

    /**
     * Get captured data for a form and clear it from memory.
     * Returns null if nothing was captured.
     */
    getAndClear(formId: string): CapturedStepData | null {
        const steps = this.data[formId];
        if (!steps || steps.length === 0) return null;
        delete this.data[formId];
        return { formId, steps };
    }

    /**
     * Check if any data exists for a form.
     */
    has(formId: string): boolean {
        return !!(this.data[formId] && this.data[formId].length > 0);
    }

    /**
     * Clear all data (e.g. between test runs)
     */
    clearAll(): void {
        this.data = {};
    }
}

// Singleton — shared across all imports in the same Node.js process
export const FieldCaptureBus = new FieldCaptureBusClass();