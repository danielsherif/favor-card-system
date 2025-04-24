// Get modal and sound elements globally or ensure they are accessible
const successModal = document.getElementById('successModal');
const celebrationSound = document.getElementById('celebrationSound');
const closeButton = document.querySelector('#successModal .close-button'); // More specific selector

// Function to close the modal
function closeModal() {
    if (successModal) {
        successModal.classList.add('hidden');
    }
    if (celebrationSound) {
        celebrationSound.pause();
        celebrationSound.currentTime = 0; // Reset sound playback
    }
}

// Check if we're on a card redeem page
document.addEventListener("DOMContentLoaded", function () {
    // Add event listener for the close button inside DOMContentLoaded
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }
  const urlParams = new URLSearchParams(window.location.search);
  const cardNumber = urlParams.get("card");

  if (cardNumber && document.getElementById("cardNumber")) {
    loadCardDetails(cardNumber);
  }
});

// Redirect to specific card page
function redirectToCard() {
  const cardNumber = document.getElementById("cardNumber").value;
  if (cardNumber) {
    window.location.href = `redeem.html?card=${cardNumber}`;
  }
}

// Load card details from Notion database
async function loadCardDetails(cardNumber) {
  try {
    // We still fetch basic details first to show *something*
    // Note: getCardDetails might need adjustment if it now requires a key
    // For now, assume getCardDetails only gets public info or we adapt it later.
    // Let's assume getCardDetails remains as is for initial display.
    const card = await getCardDetails(cardNumber); // Fetches basic info

    if (!card) {
      alert("Card not found!");
      window.location.href = "index.html"; // Redirect if card doesn't exist
      return;
    }

    // Update UI with basic card details
    document.getElementById("cardNumber").textContent = card.cardNumber;
    // We might hide the recipient name initially or show a placeholder
    document.getElementById("recipientName").textContent = card.recipientName; // Maybe hide this until verified?
    const statusElement = document.getElementById("cardStatus");
    statusElement.textContent = card.status;
    // Add class based on status
    if (card.status === "Available") {
      statusElement.classList.add("status-available");
    } else {
      statusElement.classList.remove("status-available"); // Ensure class is removed if not available
    }
    // document.getElementById("cardImage").src = card.imageUrl; // Image element removed

    const redeemButton = document.getElementById("redeemButton");
    const redeemForm = document.getElementById("redeemForm");
    const redeemMessage = document.getElementById("redeemMessage");
    const errorMessage = document.getElementById("errorMessage");

    if (card.status === "Redeemed") {
      redeemForm.classList.add("hidden"); // Hide input form
      redeemMessage.classList.remove("hidden"); // Show redeemed message
      document.getElementById("celebration").style.display = "block"; // Show celebration
    } else {
      // Add event listener ONLY if the card is available
      redeemButton.addEventListener("click", async function () {
        const key = document.getElementById("recipientKey").value.trim();
        if (!key) {
          errorMessage.textContent = "Please enter your key.";
          errorMessage.classList.remove("hidden");
          return;
        }
        errorMessage.classList.add("hidden"); // Hide error message
        redeemButton.disabled = true; // Disable button during processing
        redeemButton.textContent = "Verifying...";

        try {
          // Call the backend to verify the key and redeem
          await verifyAndRedeem(card.id, key);

          // Update UI on success
          const statusElement = document.getElementById("cardStatus");
          statusElement.textContent = "Redeemed";
          statusElement.classList.remove("status-available"); // Remove available class
          redeemForm.classList.add("hidden");
          // Keep original success message hidden or remove if modal replaces it entirely
          // redeemMessage.classList.remove("hidden"); 
          // document.getElementById("celebration").style.display = "block";

          // Show the modal and play sound
          if (successModal) {
              successModal.classList.remove('hidden');
          }
          if (celebrationSound) {
              celebrationSound.play().catch(error => console.error("Error playing sound:", error)); // Play sound with error handling
          }
        } catch (error) {
          console.error("Error redeeming card:", error);
          errorMessage.textContent =
            error.message ||
            "Failed to redeem. Invalid key or card already redeemed.";
          errorMessage.classList.remove("hidden");
          redeemButton.disabled = false; // Re-enable button on failure
          redeemButton.textContent = "Verify & Redeem";
        }
      });
    }
  } catch (error) {
    console.error("Error loading card details:", error);
    alert("Error loading card details. Please try again.");
    // Maybe redirect to index page if loading fails fundamentally
    // window.location.href = 'index.html';
  }
}

// Remove the old redeemCard function as its logic is now in the event listener
// async function redeemCard(cardId) {
// The logic previously here is now integrated into the loadCardDetails function's event listener.
//}
