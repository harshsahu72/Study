export async function callAI(messages, system = "", retryCount = 0) {
  const body = { messages };
  if (system) body.system = system;

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      // Retry once on 503 (overload) before showing error
      if ((res.status === 503 || res.status === 429) && retryCount < 1) {
        console.warn("AI busy, retrying in 3s…");
        await new Promise((r) => setTimeout(r, 3000));
        return callAI(messages, system, retryCount + 1);
      }
      const errMsg = data.error || "Something went wrong";
      console.error("API Error:", errMsg);
      if (
        typeof errMsg === "string" &&
        (errMsg.includes("high demand") ||
          errMsg.includes("overloaded") ||
          errMsg.includes("busy"))
      ) {
        return "⚠️ The AI is currently experiencing high demand. Please wait a moment and try again.";
      }
      return `⚠️ API Error: ${errMsg}`;
    }

    return data.content?.[0]?.text || "";
  } catch (error) {
    console.error("Failed to fetch:", error);
    return "⚠️ Cannot connect to server. Please make sure the backend is running on port 5000 (run: node backend/server.js).";
  }
}
