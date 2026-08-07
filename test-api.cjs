const { GoogleGenAI } = require('@google/genai');

async function test() {
  const keys = ['AIzaSyD83D12AJAJ1Luv7RpRzV1xBV0bNC4SBik', 'AIzaSyC8qFZjMvcd3hXQTaArcWXkZn0eLGbUKQQ'];
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];

  for (const key of keys) {
    console.log(`\nTesting key: ${key.substring(0, 10)}...`);
    const ai = new GoogleGenAI({ apiKey: key });
    for (const model of models) {
      try {
        const res = await ai.models.generateContent({ model: model, contents: 'hi' });
        console.log(`[SUCCESS] ${model}: ${res.text}`);
      } catch (e) {
        console.error(`[ERROR] ${model}: ${e.message}`);
      }
    }
  }
}

test();
