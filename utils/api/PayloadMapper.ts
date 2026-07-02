import { expect } from '@playwright/test';

export class PayloadMapper {
    /**
     * Convert UI entered values into expected API payload
     */
    static map(enteredValues: Record<string, any>): Record<string, any> {
        const payload: Record<string, any> = {};

        // 🚀 HARDCODED TARGET FIELDS
        const exactMappings: Record<string, string> = {
            "please enter your first name": "first_name",
            "please enter your last name": "last_name",
            "please enter your email": "email",
            "first name": "first_name",
            "last name": "last_name",
            "email": "email",
            
            // Radios / Checkboxes
            "email_opt_out": "email_opt_in",
            "do_not_call": "call_opt_in",
            "gdprprospect2uoptin": "lead_share_opt_in",
            "gdpr_prospectpartner_opt_in": "gdpr_prospectpartner_opt_in",
            "b2b_interest": "b2b_interest" 
        };

        for (const [label, rawValue] of Object.entries(enteredValues)) {
            const cleanLabel = label.toLowerCase().trim();
            
            let apiKey = exactMappings[cleanLabel];

            if (!apiKey && label.includes('_')) {
                apiKey = label; 
            }

            if (!apiKey) {
                continue; 
            }

            let finalValue = rawValue;
            
            // ==========================================
            // 🚀 THE FIX: Safely handle booleans & nulls!
            // ==========================================
            const strVal = String(finalValue ?? '').toLowerCase();

            // ==========================================
            // FORMAT API VALUES
            // ==========================================
            
            // 1. Fields that strictly expect "Opt In" / "Opt Out" (Strings)
            if (['email_opt_in', 'call_opt_in'].includes(apiKey)) {
                if (strVal === 'yes' || strVal === 'true') {
                    finalValue = 'Opt In';
                } else if (strVal === 'no' || strVal === 'false') {
                    finalValue = 'Opt Out'; 
                }
            } 
            // 2. Dynamic Brand Strings
            else if (['lead_share_opt_in'].includes(apiKey)) {
                if (strVal === 'yes' || strVal === 'true') {
                    finalValue = expect.any(String); 
                } else if (strVal === 'no' || strVal === 'false') {
                    finalValue = 'Opt Out';
                }
            }
            // 3. Fields that strictly expect "true" / "false" (Strings)
            else if (['b2b_interest'].includes(apiKey)) {
                if (strVal === 'yes' || strVal === 'true') {
                    finalValue = 'true'; 
                } else if (strVal === 'no' || strVal === 'false') {
                    finalValue = 'false';
                }
            }
            // 4. Fields that strictly expect true / false (Booleans)
            else if (['gdpr_prospectpartner_opt_in'].includes(apiKey) || label.includes('_')) {
                if (strVal === 'yes' || strVal === 'true') {
                    finalValue = true; 
                } else if (strVal === 'no' || strVal === 'false') {
                    finalValue = false;
                }
            }

            payload[apiKey] = finalValue;
        }

        return payload;
    }
}