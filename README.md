# YouTube Channel Analyzer

A React application that analyzes YouTube channels based on search queries. It fetches recommended channels and displays comprehensive information including subscriber counts, country of origin, last 5 videos with view counts, video topics, and email addresses (if available in the channel's about section).

## Features

- 🔍 Search YouTube channels by query
- 📊 View channel statistics (subscribers, country, total videos)
- 📹 Display last 5 videos with view counts
- 🏷️ Show video topics/tags
- 📧 Extract email addresses from channel about section
- 🎨 Modern, responsive UI

## Prerequisites

- Node.js (v16 or higher)
- YouTube Data API v3 key ([Get one here](https://console.cloud.google.com/apis/credentials))

## Installation

1. Clone or download this project
2. Install dependencies:
```bash
npm install
```

## Usage

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

3. Enter your YouTube Data API v3 key in the form

4. Enter a search query (e.g., "Indian stock market")

5. Click "Search Channels" to see the results

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## How to Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Go to "Credentials" and create an API key
5. (Optional) Restrict the API key to YouTube Data API v3 for security

## API Quota

Note: The YouTube Data API has a default quota of 10,000 units per day. Each API call consumes different amounts:
- Search: 100 units
- Channel details: 1 unit per channel
- Playlist items: 1 unit per call
- Video details: 1 unit per video

## Technologies Used

- React 18
- Vite
- YouTube Data API v3
- Axios (for HTTP requests)

## License

MIT

