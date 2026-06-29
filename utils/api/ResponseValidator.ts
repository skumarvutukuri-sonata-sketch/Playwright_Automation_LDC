export class ResponseValidator {

    static validate(response: any) {

        if (!response) {
            throw new Error("Empty API response");
        }

        if (response.success === false) {
            throw new Error("API returned success=false");
        }

        console.log("✅ API Response Valid");
    }

}