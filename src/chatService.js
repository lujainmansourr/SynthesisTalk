export const sendMessageToLLM = async (message) => {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.reply || "No reply received.";
  } catch (error) {
    console.error("Error sending message to backend:", error);
    return `AI error: ${error.message || "Unexpected error"}`;
  }
};
