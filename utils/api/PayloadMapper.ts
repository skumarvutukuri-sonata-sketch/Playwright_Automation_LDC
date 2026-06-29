// export class PayloadMapper {

//     /**
//      * Converts UI labels into API field names.
//      */
//     static map(formData: Record<string, any>): Record<string, any> {

//         const payload: Record<string, any> = {};

//         const mappings: Record<string, string> = {

//             "First Name": "first_name",
//             "Last Name": "last_name",
//             "Email": "email",
//             "Phone": "phone",
//             "Zip Code": "zip",
//             "State": "state",
//             "Country": "country"

//         };

//         for (const [label, value] of Object.entries(formData)) {

//             const apiKey = mappings[label] ?? label;

//             payload[apiKey] = value;
//         }

//         return payload;
//     }

// }




export class PayloadMapper {

    /**
     * Convert UI entered values into expected API payload
     */
    static map(enteredValues: Record<string, any>): Record<string, any> {

        const payload: Record<string, any> = {};

        for (const [label, value] of Object.entries(enteredValues)) {

            const apiKey = this.toApiKey(label);

            payload[apiKey] = value;
        }

        return payload;
    }

    /**
     * Convert label to API key
     * Example:
     * First Name -> firstName
     * Last Name -> lastName
     * Phone Number -> phoneNumber
     */
    private static toApiKey(label: string): string {

        const words = label
            .replace(/[^a-zA-Z0-9 ]/g, '')
            .trim()
            .split(/\s+/);

        return words
            .map((word, index) =>
                index === 0
                    ? word.toLowerCase()
                    : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join('');
    }
}