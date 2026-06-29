export class PayloadValidator {

    static validate(
        payload: any,
        expected: Record<string, any>
    ): void {

        console.log('\n========== PAYLOAD VALIDATION ==========');

        for (const [key, expectedValue] of Object.entries(expected)) {

            const actualValue = payload[key];

            if (actualValue === expectedValue) {

                console.log(`✅ ${key}`);
            } else {

                console.error(
                    `❌ ${key}\n` +
                    `   Expected: ${expectedValue}\n` +
                    `   Actual  : ${actualValue}`
                );

                throw new Error(
                    `Payload validation failed for '${key}'`
                );
            }
        }

        console.log('✅ Payload validation passed');
        console.log('========================================\n');
    }
}