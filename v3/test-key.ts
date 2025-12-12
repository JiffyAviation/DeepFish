
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function test() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) { console.error("No key!"); return; }

    const genAI = new GoogleGenerativeAI(key.trim());

    // Models to test
    const models = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-2.0-flash-exp",
        "gemini-pro"
    ];

    console.log(`Testing key: ${key.substring(0, 8)}...`);

    for (const modelName of models) {
        console.log(`\n--- Testing ${modelName} ---`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            const response = await result.response;
            console.log(`✅ SUCCESS! Response: ${response.text().substring(0, 20)}...`);
            // If we found a working one, we could stop, but let's see which ones work
        } catch (error: any) {
            console.log(`❌ FAILED. Status: ${error.status || error.message}`);
            if (error.status === 404) console.log("   -> Model not found or not available for this key.");
            if (error.status === 429) console.log("   -> Rate limit / Quota exceeded.");
            if (error.message.includes("quota")) console.log("   -> Quota error.");
        }
    }
}

test();
