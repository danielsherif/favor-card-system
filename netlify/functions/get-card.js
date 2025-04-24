const { Client } = require("@notionhq/client");
require('dotenv').config({ path: '.env.development' });

// Initialize Notion client with environment variables
const notionApiKey = process.env.NOTION_API_KEY;
const databaseId = process.env.NOTION_DATABASE_ID;

if (!notionApiKey || !databaseId) {
  console.error('Required environment variables are missing');
  throw new Error('Missing required environment variables');
}

const notion = new Client({
  auth: notionApiKey,
});

exports.handler = async function (event) {
  try {
    const cardNumber = event.queryStringParameters.cardNumber;
    console.log(`Looking up card: ${cardNumber}`);

    // Query Notion database
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "Card Number",
        number: {
          equals: parseInt(cardNumber),
        },
      },
    });

    if (response.results.length === 0) {
      console.log("Card not found");
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Card not found" }),
      };
    }

    // Extract card data from the first result
    const page = response.results[0];

    // Safely extract data with fallbacks for each property
    const cardData = {
      id: page.id,
      cardNumber:
        page.properties["Card Number"]?.number || parseInt(cardNumber),
      recipientName:
        page.properties["Recipient Name"]?.rich_text?.[0]?.text?.content ||
        page.properties["Recipient Name"]?.title?.[0]?.plain_text ||
        "Unknown",
      status: page.properties["Status"]?.select?.name || "Available",
      imageUrl: page.properties["Card Image URL"]?.url || "",
    };

    console.log("Card data extracted:", cardData);

    return {
      statusCode: 200,
      body: JSON.stringify(cardData),
    };
  } catch (error) {
    console.error("Error fetching card:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to fetch card details",
        details: error.message,
      }),
    };
  }
};
