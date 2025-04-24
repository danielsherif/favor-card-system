# Complete Guide to Building a Personalized Favor Card System

This guide walks you through creating a personalized favor card system with unique QR codes, a redemption mechanism, and tracking capabilities. We'll use Notion as our database, build a simple redemption webapp, and automate card generation.

## Table of Contents
1. [Setup Notion Database](#setup-notion-database)
2. [Get Notion API Key](#get-notion-api-key)
3. [Set Up Webapp Hosting](#set-up-webapp-hosting)
4. [Build the Redemption Webapp](#build-the-redemption-webapp)
5. [Automate Card Generation](#automate-card-generation)
6. [Integrate QR Code Generation](#integrate-qr-code-generation)
7. [Test the System](#test-the-system)
8. [Deployment](#deployment)

## Setup Notion Database
### Step 1: Create Your Notion Database

1. Log into your Notion account at [notion.so](https://www.notion.so)
2. Click "New Page" from the sidebar
3. Choose "Table - Database" from the options
4. Add the following properties to your database:
   - Card Number (Number)
   - Recipient Name (Text)
   - Status (Select: Available/Redeemed)
   - Redemption Date (Date)
   - QR Code URL (URL)
   - Card Image URL (URL) - To store the generated card image
   - Notes (Text)

5. Add an additional view (Gallery View) for a more visual representation of your cards

### Step 2: Get Notion API Key

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "Create new integration"
3. Name it "Favor Card System" and select the workspace you want to connect it to
4. Set appropriate capabilities (Read content, Update content, Insert content)
5. Click "Submit" to create your integration
6. Copy and securely store your "Internal Integration Token" - this is your API key
7. Go back to your database, click the "..." menu in the top right
8. Click "Add connections" and select your integration to give it access to this database
9. Copy your database ID (found in the URL when viewing your database: `https://www.notion.so/your-workspace/[database-id]?v=...`)

## Set Up Webapp Hosting

### Step 3: Choose a Hosting Platform

For simplicity and cost-effectiveness, we'll use [Netlify](https://www.netlify.com/) to host our redemption webapp:

1. Go to [Netlify](https://www.netlify.com/) and sign up/log in
2. Click "Add new site" → "Import an existing project"
3. We'll connect this to our project repository later

Alternatively, you could use:
- [Vercel](https://vercel.com)
- [GitHub Pages](https://pages.github.com/)
- [Render](https://render.com/)

## Build the Redemption Webapp

### Step 4: Create the Webapp Structure

We'll build a simple webapp with HTML, CSS, and JavaScript. Let's set up a basic project structure:

1. Create a folder for your project called `favor-card-system`
2. Create the following files:
   - `index.html` (Landing page)
   - `redeem.html` (Redemption page)
   - `styles.css` (Styling)
   - `app.js` (Main functionality)
   - `api.js` (API connection to Notion)
   - `netlify/functions/update-notion.js` (Serverless function for Notion updates)

3. Set up a GitHub repository and connect it to your local project

### Step 5: Implement the webapp

First, let's create the HTML structure:

**index.html**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Favor Card System</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>Favor Card System</h1>
        <p>Scan a QR code to access your favor card!</p>
        <p>Or enter your card number:</p>
        <div class="input-group">
            <input type="text" id="cardNumber" placeholder="Enter Card Number">
            <button onclick="redirectToCard()">Go</button>
        </div>
    </div>
    <script src="app.js"></script>
</body>
</html>
```

**redeem.html**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redeem Your Favor</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container redeem-container">
        <div class="card-display">
            <div class="card-image">
                <img id="cardImage" src="" alt="Favor Card">
            </div>
            <div class="card-details">
                <h2>Favor Card <span id="cardNumber"></span></h2>
                <p>For: <span id="recipientName"></span></p>
                <p>Status: <span id="cardStatus"></span></p>
            </div>
        </div>
        <div class="redeem-section">
            <button id="redeemButton" class="redeem-btn">Redeem This Favor</button>
            <div id="redeemMessage" class="hidden">
                <p>Favor has been redeemed! Someone will contact you soon.</p>
                <div class="celebration" id="celebration"></div>
            </div>
        </div>
    </div>
    <script src="api.js"></script>
    <script src="app.js"></script>
</body>
</html>
```

**styles.css**:
```css
body {
    font-family: 'Arial', sans-serif;
    background-color: #f5f5f5;
    margin: 0;
    padding: 0;
}

.container {
    max-width: 800px;
    margin: 50px auto;
    padding: 30px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    text-align: center;
}

.input-group {
    display: flex;
    margin: 20px auto;
    max-width: 400px;
}

input {
    flex-grow: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px 0 0 4px;
    font-size: 16px;
}

button {
    padding: 10px 20px;
    background-color: #4a4a6a;
    color: white;
    border: none;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    font-size: 16px;
}

.card-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 30px;
}

.card-image {
    max-width: 300px;
    margin-bottom: 20px;
}

.card-image img {
    width: 100%;
    border-radius: 10px;
}

.redeem-btn {
    padding: 15px 30px;
    background-color: #4a4a6a;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 18px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.redeem-btn:hover {
    background-color: #35354d;
}

.hidden {
    display: none;
}

.celebration {
    margin-top: 20px;
    height: 200px;
    background-image: url('https://media.giphy.com/media/26tOZ42Mg6pbTUPHW/giphy.gif');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
}

.card-details {
    margin-bottom: 20px;
}

@media (min-width: 768px) {
    .card-display {
        flex-direction: row;
        justify-content: space-around;
        align-items: flex-start;
    }
    
    .card-image {
        margin-right: 20px;
        margin-bottom: 0;
    }
}
```

**app.js**:
```javascript
// Check if we're on a card redeem page
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const cardNumber = urlParams.get('card');
    
    if (cardNumber && document.getElementById('cardNumber')) {
        loadCardDetails(cardNumber);
    }
});

// Redirect to specific card page
function redirectToCard() {
    const cardNumber = document.getElementById('cardNumber').value;
    if (cardNumber) {
        window.location.href = `redeem.html?card=${cardNumber}`;
    }
}

// Load card details from Notion database
async function loadCardDetails(cardNumber) {
    try {
        const card = await getCardDetails(cardNumber);
        
        if (!card) {
            alert('Card not found!');
            return;
        }
        
        // Update UI with card details
        document.getElementById('cardNumber').textContent = card.cardNumber;
        document.getElementById('recipientName').textContent = card.recipientName;
        document.getElementById('cardStatus').textContent = card.status;
        document.getElementById('cardImage').src = card.imageUrl;
        
        // Handle redeem button state
        const redeemButton = document.getElementById('redeemButton');
        if (card.status === 'Redeemed') {
            redeemButton.disabled = true;
            redeemButton.textContent = 'Already Redeemed';
            document.getElementById('redeemMessage').classList.remove('hidden');
        } else {
            redeemButton.addEventListener('click', function() {
                redeemCard(card.id);
            });
        }
    } catch (error) {
        console.error('Error loading card details:', error);
        alert('Error loading card details. Please try again.');
    }
}

// Redeem the card
async function redeemCard(cardId) {
    try {
        await updateCardStatus(cardId, 'Redeemed');
        
        // Update UI
        document.getElementById('cardStatus').textContent = 'Redeemed';
        document.getElementById('redeemButton').disabled = true;
        document.getElementById('redeemButton').textContent = 'Favor Redeemed!';
        document.getElementById('redeemMessage').classList.remove('hidden');
        
        // Show celebration animation
        document.getElementById('celebration').style.display = 'block';
    } catch (error) {
        console.error('Error redeeming card:', error);
        alert('Error redeeming card. Please try again.');
    }
}
```

**api.js**:
```javascript
// Get card details from Notion
async function getCardDetails(cardNumber) {
    try {
        const response = await fetch(`/.netlify/functions/get-card?cardNumber=${cardNumber}`);
        if (!response.ok) {
            throw new Error('Failed to fetch card details');
        }
        return await response.json();
    } catch (error) {
        console.error('Error in getCardDetails:', error);
        throw error;
    }
}

// Update card status in Notion
async function updateCardStatus(cardId, status) {
    try {
        const response = await fetch('/.netlify/functions/update-notion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cardId,
                status,
                redemptionDate: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update card status');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error in updateCardStatus:', error);
        throw error;
    }
}
```

### Step 6: Create Netlify Functions

Create the folder structure `netlify/functions/` in your project root, then add:

**netlify/functions/get-card.js**:
```javascript
const { Client } = require('@notionhq/client');

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});
const databaseId = process.env.NOTION_DATABASE_ID;

exports.handler = async function(event) {
  try {
    const cardNumber = event.queryStringParameters.cardNumber;
    
    // Query Notion database
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "Card Number",
        number: {
          equals: parseInt(cardNumber)
        }
      }
    });
    
    if (response.results.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Card not found" })
      };
    }
    
    // Extract card data from the first result
    const page = response.results[0];
    const cardData = {
      id: page.id,
      cardNumber: page.properties["Card Number"].number,
      recipientName: page.properties["Recipient Name"].title[0]?.plain_text || "Unknown",
      status: page.properties["Status"].select?.name || "Available",
      imageUrl: page.properties["Card Image URL"].url || "",
    };
    
    return {
      statusCode: 200,
      body: JSON.stringify(cardData)
    };
  } catch (error) {
    console.error("Error fetching card:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch card details" })
    };
  }
};
```

**netlify/functions/update-notion.js**:
```javascript
const { Client } = require('@notionhq/client');

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

exports.handler = async function(event) {
  try {
    const { cardId, status, redemptionDate } = JSON.parse(event.body);
    
    // Update the page in Notion
    await notion.pages.update({
      page_id: cardId,
      properties: {
        "Status": {
          select: {
            name: status
          }
        },
        "Redemption Date": {
          date: {
            start: redemptionDate
          }
        }
      }
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Card updated successfully" })
    };
  } catch (error) {
    console.error("Error updating card:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to update card" })
    };
  }
};
```

### Step 7: Set Up Netlify Config

Create a `netlify.toml` file in your project root:

```toml
[build]
  functions = "netlify/functions"
  publish = "."

[dev]
  functions = "netlify/functions"
  publish = "."

[functions]
  node_bundler = "esbuild"
```

## Automate Card Generation

### Step 8: Set Up Card Generation Script

Now, let's create a script that will generate 100 cards based on your template, with unique QR codes:

1. Create a new directory called `card-generator` in your project
2. Install necessary dependencies:
   ```
   npm init -y
   npm install jimp qrcode fs-extra dotenv @notionhq/client
   ```
3. Create a `.env` file with your Notion credentials:
   ```
   NOTION_API_KEY=your_api_key_here
   NOTION_DATABASE_ID=your_database_id_here
   ```

4. Create the script file `generate-cards.js`:

```javascript
const fs = require('fs-extra');
const Jimp = require('jimp');
const QRCode = require('qrcode');
const path = require('path');
const { Client } = require('@notionhq/client');
require('dotenv').config();

// Configure Notion
const notion = new Client({
  auth: process.env.NOTION_API_KEY
});
const databaseId = process.env.NOTION_DATABASE_ID;

// Configuration
const TOTAL_CARDS = 100;
const TEMPLATE_PATH = './template.png';
const OUTPUT_DIR = './generated-cards';
const BASE_URL = 'https://your-netlify-app.netlify.app/redeem.html?card=';
const QR_POSITION = { x: 520, y: 50 }; // Position for QR code on the template

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
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 200,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    // Load template and QR code
    const [template, qrCode] = await Promise.all([
      Jimp.read(TEMPLATE_PATH),
      Jimp.read(qrCodePath)
    ]);

    // Resize QR code if needed
    qrCode.resize(200, 200);

    // Create a font
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    
    // Add card number to corners
    template.print(font, 50, 50, `${cardNumber}`);
    template.print(font, template.getWidth() - 80, template.getHeight() - 80, `${cardNumber}`);
    
    // Add recipient name if provided
    if (recipientName) {
      const nameFont = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
      template.print(nameFont, 50, template.getHeight() - 30, `For: ${recipientName}`);
    }

    // Composite QR code onto template
    template.composite(qrCode, QR_POSITION.x, QR_POSITION.y);

    // Save the final card
    const outputPath = path.join(OUTPUT_DIR, `card-${cardNumber}.png`);
    await template.writeAsync(outputPath);
    
    // Clean up the temporary QR code file
    fs.removeSync(qrCodePath);
    
    return outputPath;
  } catch (error) {
    console.error(`Error generating card ${cardNumber}:`, error);
    throw error;
  }
}

// Add card to Notion database
async function addCardToNotion(cardNumber, recipientName, imageUrl) {
  try {
    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        "Card Number": {
          number: cardNumber
        },
        "Recipient Name": {
          title: [
            {
              text: {
                content: recipientName || `Recipient ${cardNumber}`
              }
            }
          ]
        },
        "Status": {
          select: {
            name: "Available"
          }
        },
        "QR Code URL": {
          url: `${BASE_URL}${cardNumber}`
        },
        "Card Image URL": {
          url: imageUrl
        }
      }
    });
    
    console.log(`Added card ${cardNumber} to Notion database`);
  } catch (error) {
    console.error(`Error adding card ${cardNumber} to Notion:`, error);
    throw error;
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
  
  console.log('All cards generated!');
}

// Run the main function
generateAllCards().catch(console.error);
```

### Step 9: Prepare the Card Template

1. Save your example card as `template.png` in the `card-generator` directory
2. Modify your template to include space for the QR code (you'll need to edit the template in an image editor like Photoshop or GIMP)
3. Make sure to position the QR code appropriately, considering the modified template

## Integrate QR Code Generation

### Step 10: Install Dependencies and Run the Card Generator

1. Navigate to your `card-generator` directory
2. Install dependencies:
   ```
   npm install
   ```
3. Run the script:
   ```
   node generate-cards.js
   ```

4. This will generate 100 cards with unique QR codes and add them to your Notion database

## Test the System

### Step 11: Test the webapp locally

1. Install Netlify CLI:
   ```
   npm install netlify-cli -g
   ```
2. Run locally:
   ```
   netlify dev
   ```
3. Open your browser to `http://localhost:8888`
4. Test the card lookup and redemption flow

### Step 12: Deploy the Webapp

1. Push your project to GitHub
2. Connect your Netlify account to your GitHub repository
3. Configure environment variables in Netlify:
   - Go to Site settings > Build & deploy > Environment
   - Add your Notion API key and database ID as environment variables
4. Deploy your site

## Deployment

### Step 13: Final Deployment Steps

1. Update the `BASE_URL` in your card generator script to reflect your Netlify app URL
2. Re-run the card generator if needed with the updated URL
3. Share your favor cards with recipients

## Additional Enhancements

- **Notification System**: Add email or SMS notifications using services like SendGrid or Twilio
- **Custom Animations**: Create custom redemption animations for a more personalized experience
- **Analytics**: Track redemption patterns and favor usage
- **Physical Cards**: Print the generated cards using a service like Moo.com or VistaPrint

## Troubleshooting

- **QR Code Issues**: Ensure QR codes are large enough and have enough contrast
- **API Limits**: Be aware of Notion API rate limits when generating lots of cards
- **Image Hosting**: For a production system, set up proper image hosting with Amazon S3 or similar

---

Good luck with your Favor Card System! This setup gives you a fully functional system that can be expanded with additional features as needed.
