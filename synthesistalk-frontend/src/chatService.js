export const sendMessageToLLM = async (message) => {
  try {
    const response = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error('Failed to send message:', error);
    return "Sorry, something went wrong.";
  }
};
