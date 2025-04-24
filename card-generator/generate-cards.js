const fs = require("fs-extra");
const sharp = require("sharp");
const QRCode = require("qrcode");
const path = require("path");
const { Client } = require("@notionhq/client");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// Configure Notion
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});
console.log("Notion API Key:", process.env.NOTION_API_KEY); // Verify API Key
const databaseId = process.env.NOTION_DATABASE_ID;
console.log("Notion Database ID:", databaseId); // Verify Database ID

// Configuration
const TOTAL_CARDS = 100;
const TEMPLATE_PATH = "./template.png";
const OUTPUT_DIR = "./generated-cards";
const BASE_URL = "https://danyfavors.netlify.app/redeem.html?card=";
const QR_POSITION = { x: 225, y: 950 }; // Position for QR code on the template

// Ensure output directory exists
fs.ensureDirSync(OUTPUT_DIR);

// Generate a single card
async function generateCard(cardNumber, recipientName) {
  try {
    // Generate QR code
    const cardUrl = `${BASE_URL}${cardNumber}`;
    const qrCodePath = path.join(OUTPUT_DIR, `qr-${cardNumber}.png`);

    // Create QR code as an image file
    await QRCode.toFile(qrCodePath, cardUrl, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 400, // Doubled the size
      color: {
        dark: "#342b4a", // Card text color
        light: "#fcf6ea", // Card background color
      },
    });

    // Load template image dimensions
    const templateMetadata = await sharp(TEMPLATE_PATH).metadata();

    // Calculate QR code position for centering
    const qrWidth = 400;
    const qrXPosition = (templateMetadata.width - qrWidth) / 2;
    const qrYPosition = 850; // Adjusted Y position slightly

    // Create a text SVG for the card number
    const cardNumberSVG = `
    <svg width="${templateMetadata.width}" height="${templateMetadata.height}">
      <style>
        .cardNumber {
          font-family: Arial, sans-serif; /* Specify fallback fonts */
          font-size: 80px; /* Adjusted font size */
          fill: #fcf6ea; /* Use dark text color */
          font-weight: bold; /* Make it bolder if needed */
          text-anchor: middle; /* Helps with centering */
        }
      </style>
      <text x="120" y="180" class="cardNumber">${cardNumber}</text> <!-- Adjusted top-left position -->
      <text x="${templateMetadata.width - 140}" y="${
      templateMetadata.height - 150
    }" class="cardNumber">${cardNumber}</text> <!-- Adjusted bottom-right position -->
      <!-- Removed recipient name text -->
    </svg>`;

    // Read the QR code image
    const qrCodeBuffer = await fs.readFile(qrCodePath);

    // Composite images: template + card number text + QR code
    const outputPath = path.join(OUTPUT_DIR, `card-${cardNumber}.png`);

    await sharp(TEMPLATE_PATH)
      // Add card number text
      .composite([
        {
          input: Buffer.from(cardNumberSVG),
          top: 0,
          left: 0,
        },
        {
          input: qrCodeBuffer,
          top: qrYPosition, // Use calculated Y
          left: Math.round(qrXPosition), // Use calculated X
        },
      ])
      .toFile(outputPath);

    // Clean up the temporary QR code file
    fs.removeSync(qrCodePath);

    console.log(`Card ${cardNumber} generated successfully!`);
    return outputPath;
  } catch (error) {
    console.error(`Error generating card ${cardNumber}:`, error);
    throw error;
  }
}

// Add card to Notion database
async function addCardToNotion(cardNumber, recipientName, imageUrl) {
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds delay

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          "Card Number": {
            number: cardNumber,
          },
          "Recipient Name": {
            rich_text: [
              {
                text: {
                  content: recipientName || `Friend ${cardNumber}`,
                },
              },
            ],
          },
          Status: {
            select: {
              name: "Available",
            },
          },
          "QR Code URL": {
            url: `${BASE_URL}${cardNumber}`,
          },
          "Card Image URL": {
            url: imageUrl,
          },
        },
      });

      console.log(`Added card ${cardNumber} to Notion database`);
      return; // Success, exit the function
    } catch (error) {
      console.error(
        `Attempt ${attempt}: Error adding card ${cardNumber} to Notion:`,
        error.message
      );
      if (attempt < maxRetries && error.code === "ETIMEDOUT") {
        console.log(`Retrying in ${retryDelay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        console.error(
          `Failed to add card ${cardNumber} to Notion after ${maxRetries} attempts.`
        );
        throw error; // Re-throw the error after final attempt or for non-timeout errors
      }
    }
  }
}

// Upload image to a hosting service
// For simplicity, we'll mock this function - in a real implementation,
// you would upload to a service like AWS S3, Cloudinary, or Imgur
async function uploadImage(imagePath, cardNumber) {
  console.log(`[Mock] Uploading image for card ${cardNumber}...`);
  // In a real implementation, this would return the URL of the uploaded image
  return `https://example.com/favor-cards/card-${cardNumber}.png`;
}

// Main function to generate all cards
async function generateAllCards() {
  console.log(`Generating ${TOTAL_CARDS} cards...`);

  // Sample recipients (you would replace this with your actual list)
  const recipients = [
    "John Doe",
    "Jane Smith",
    "Alex Johnson",
    // Add more recipients or leave empty for default naming
  ];

  for (let i = 1; i <= TOTAL_CARDS; i++) {
    const cardNumber = i;
    const recipientName = recipients[i - 1] || `Friend ${i}`;

    try {
      console.log(`Generating card ${cardNumber} for ${recipientName}...`);

      // Generate the card image
      const cardPath = await generateCard(cardNumber, recipientName);

      // In a real implementation, upload the image to a hosting service
      const imageUrl = await uploadImage(cardPath, cardNumber);

      // Add the card to Notion
      await addCardToNotion(cardNumber, recipientName, imageUrl);

      console.log(`Card ${cardNumber} completed!`);
    } catch (error) {
      console.error(`Failed to process card ${cardNumber}:`, error);
    }
  }

  console.log("All cards generated!");
}

// Run the main function
generateAllCards().catch(console.error);
