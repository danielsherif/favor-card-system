const { Client } = require("@notionhq/client");
require("dotenv").config({ path: ".env.development" });

// Initialize Notion client with environment variables
const notionApiKey = process.env.NOTION_API_KEY;

if (!notionApiKey) {
  console.error("Required environment variables are missing");
  throw new Error("Missing required environment variables");
}

const notion = new Client({
  auth: notionApiKey,
});
// No need for databaseId here if we only use pageId

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  try {
    const { cardId, key } = JSON.parse(event.body);

    if (!cardId || !key) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing cardId or key" }),
      };
    }

    // 1. Retrieve the page (card) from Notion using cardId (which is the page_id)
    let page;
    try {
      page = await notion.pages.retrieve({ page_id: cardId });
    } catch (error) {
      if (error.code === "object_not_found") {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Card not found" }),
        };
      }
      // Log other retrieval errors
      console.error("Error retrieving page:", error);
      throw new Error("Failed to retrieve card details"); // Throw generic error for other issues
    }

    // 2. Perform Checks
    const currentStatus = page.properties["Status"]?.select?.name;
    // Safely access the key, checking if rich_text array exists and has elements
    // Assuming 'Key' is a Rich Text property. Adjust if it's a different type (e.g., 'text').
    const keyProperty = page.properties["Key"]?.rich_text;
    const storedKey =
      keyProperty && keyProperty.length > 0
        ? keyProperty[0]?.plain_text
        : undefined;

    // Check if already redeemed
    if (currentStatus !== "Available") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Card has already been redeemed or is not available",
        }),
      };
    }

    // Check if the provided key matches the stored key (case-insensitive comparison)
    if (!storedKey || key.toLowerCase() !== storedKey.toLowerCase()) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: "Invalid key provided" }),
      };
    }

    // 3. Update the page in Notion if all checks pass
    await notion.pages.update({
      page_id: cardId,
      properties: {
        Status: {
          select: {
            name: "Redeemed", // Set status to Redeemed
          },
        },
        "Redemption Date": {
          date: {
            start: new Date().toISOString(), // Set redemption date
          },
        },
        // You could add a property to log who redeemed it if needed
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Card redeemed successfully!" }),
    };
  } catch (error) {
    console.error("Error processing redemption:", error);
    // Ensure sensitive details aren't leaked in the error message
    const message =
      error.message.includes("retrieve card details") ||
      error.message.includes("update card")
        ? "An internal error occurred while processing the redemption."
        : error.message; // Use specific messages for known safe errors if needed

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: message || "Failed to process redemption",
      }),
    };
  }
};
