// Get card details from Notion
async function getCardDetails(cardNumber) {
  try {
    const response = await fetch(
      `/.netlify/functions/get-card?cardNumber=${cardNumber}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch card details");
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getCardDetails:", error);
    throw error;
  }
}

// Verify key and update card status in Notion
async function verifyAndRedeem(cardId, key) {
  try {
    const response = await fetch("/.netlify/functions/update-notion", {
      // Use the same endpoint, but it now expects a key
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cardId,
        key, // Send the key for verification
        // No need to send status or date from frontend anymore
      }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "An unknown error occurred." }));
      // Throw an error with the message from the backend
      throw new Error(
        errorData.message || `Failed with status: ${response.status}`
      );
    }

    return await response.json(); // Return success message or data
  } catch (error) {
    console.error("Error in verifyAndRedeem:", error);
    throw error; // Re-throw the error to be caught by the calling function in app.js
  }
}

// Remove or comment out the old updateCardStatus function
// async function updateCardStatus(cardId, status) {
// The logic previously here is now handled by the verifyAndRedeem function.
//}
