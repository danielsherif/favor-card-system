# Favor Card System

## Overview

The Favor Card System is a digital solution designed to manage and redeem "favor cards" - I have built it to help my friends redeem their favor cards which I send them occassionally and they get to redeem it whenever they want. The whole point of the system is to provide a fun, structured way to redeem these cards and track their redemption status.

## Key Features

- **QR Code Generation:** Each favor card is associated with a unique QR code.
- **Digital Redemption:** Users scan the QR code to view the favor details and redeem it.
- **Notion Integration:** Favor card data (details, status) is stored and managed in a Notion database.
- **Serverless Backend:** Netlify Functions handle the logic for fetching data from Notion and updating redemption status.
- **Simple Frontend:** A basic HTML/CSS/JavaScript interface allows users to interact with the system.
- **Redemption Status:** Clearly indicates if a favor card has already been redeemed.

## Technology Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Netlify Functions (Serverless JavaScript)
- **Database:** Notion
- **Deployment:** Netlify

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    ```
2.  **Set up Notion:**
    - Create a Notion database with columns for Favor Details, Unique ID, Status (e.g., "Not Redeemed", "Redeemed"), etc.
    - Obtain a Notion API key and the Database ID.
3.  **Configure Netlify Functions:**
    - Place your Notion API key and Database ID in environment variables for your Netlify site.
    - Update the Netlify Function code (`netlify/functions/`) to match your Notion database structure if necessary.
4.  **Update Frontend:**
    - Ensure the frontend JavaScript correctly calls the Netlify Function endpoint.
    - Modify the URL parameters in the HTML/JS if needed to pass the unique ID from the QR code.
5.  **Install Dependencies (if any):**
    - If using frontend build tools or specific libraries, run `npm install` or equivalent.
6.  **Deploy to Netlify:**
    - Connect your repository to Netlify for continuous deployment.

## How to Use

1.  **Create a Favor:** Add a new entry in your Notion database for the favor.
2.  **Generate QR Code:** Create a QR code that links to the frontend URL, appending the unique ID of the favor as a URL parameter (e.g., `https://your-netlify-site.netlify.app/?id=UNIQUE_ID`).
3.  **Share:** Give the QR code (or the link) to the recipient.
4.  **Redeem:** The recipient scans the QR code or opens the link. The frontend fetches the favor details via the Netlify Function.
5.  **Confirm Redemption:** The recipient clicks a button to redeem the favor. The Netlify Function updates the status in the Notion database.

## Future Enhancements

- Refine URL parameter handling.
- Improve UI/UX design.
- Enhance the loading state for user names/details.
- Add visual feedback/animation upon successful redemption.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
