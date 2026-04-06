const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Razorpay = require("razorpay");

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Initialize Google Gemini API
if (!process.env.GEMINI_API_KEY) {
  console.warn("No GEMINI_API_KEY found in .env");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Helper: sleep for ms milliseconds
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

app.post('/api/generate', async (req, res) => {
  const { messages, system } = req.body;

  // Try models in order: 1.5-flash first (higher free quota), then fallback
  const MODELS = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.0-pro"];
  const MAX_RETRIES = 2;

  for (const modelName of MODELS) {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: system || undefined,
    });

    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const lastMsg = contents.pop();

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const chat = model.startChat({ history: contents });
        const result = await chat.sendMessage(lastMsg.parts[0].text);
        const text = result.response.text();
        console.log(`✅ Success with model: ${modelName}`);
        return res.json({ content: [{ text }] });
      } catch (error) {
        const errMsg = error.message || "";
        const isRateLimit =
          errMsg.includes("429") ||
          errMsg.includes("RESOURCE_EXHAUSTED") ||
          errMsg.includes("quota") ||
          errMsg.includes("rate");

        console.warn(`⚠️ Model ${modelName} attempt ${attempt + 1}: ${errMsg.split("\n")[0]}`);

        if (isRateLimit && attempt < MAX_RETRIES) {
          // Exponential backoff: 2s, 4s
          const delay = Math.pow(2, attempt + 1) * 1000;
          console.log(`   Retrying in ${delay / 1000}s...`);
          await sleep(delay);
          continue;
        }

        if (isRateLimit) {
          // All retries exhausted for this model — try next model
          console.warn(`   Switching to next model...`);
          break;
        }

        // Non-rate-limit error — return immediately
        console.error("AI Generation Error:", error);
        return res.status(500).json({ error: errMsg });
      }
    }
  }

  // All models exhausted
  return res.status(429).json({
    error:
      "All AI models are currently rate-limited or quota-exhausted. Please wait a few minutes and try again, or get a new API key from https://aistudio.google.com/app/apikey",
  });
});

// Razorpay API Setup
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourKeyIdHere',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret',
});

app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { amount, planId, planLabel } = req.body;
    const options = {
      amount: amount * 100, // amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };
    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/payment/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Auto-verify for demonstration purposes
    if (razorpay_payment_id) {
        res.json({ verified: true });
    } else {
        res.status(400).json({ verified: false });
    }
  } catch (error) {
    console.error("Razorpay Verify Error:", error);
    res.status(500).json({ verified: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
