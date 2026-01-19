# YouTube Channel Data Extractor - Replication Prompt

## Project Overview
Create a React-based web application that extracts and analyzes YouTube channel data using the YouTube Data API v3. The application should be capable of processing large-scale data extraction (50,000 to 1,000,000+ channels) with real-time progress tracking, local storage using IndexedDB, and multi-format export capabilities.

## Technology Stack
- **Framework**: React 18.2.0 with Vite 5.0.8
- **Build Tool**: Vite with @vitejs/plugin-react
- **HTTP Client**: Native fetch API (no axios needed, but axios is in dependencies)
- **Excel Export**: xlsx library (v0.18.5)
- **Storage**: IndexedDB for large dataset persistence
- **Styling**: CSS modules/plain CSS

## Project Structure
```
project-root/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   ├── components/
│   │   ├── SearchForm.jsx
│   │   ├── SearchForm.css
│   │   ├── DataTable.jsx
│   │   └── DataTable.css
│   └── utils/
│       ├── apiClient.js
│       ├── storage.js
│       ├── commentFetcher.js
│       ├── socialHandlesExtractor.js
│       ├── excelExport.js
│       ├── largeFileExport.js
│       └── exportFormats.js
```

## Core Features

### 1. Search Form Component (SearchForm.jsx)
- **Input Fields**:
  - YouTube API Key (password type input)
  - Search Query (text input)
  - Target Count dropdown with options: 50, 100, 150, 200, 250, 500, 1,000, 2,500, 5,000, 10,000, 25,000, 50,000, 1,00,000 (1 Lakh), 2,00,000 (2 Lakh), 5,00,000 (5 Lakh), 10,00,000 (10 Lakh)
- **Submit Button**: "Start Extraction" (disabled during loading, shows "Extracting..." when active)
- **Layout**: 3-column grid (API Key, Search Query, Target Count) on desktop, single column on mobile
- **Validation**: Alert if API key or search query is empty

### 2. Main Application Logic (App.jsx)

#### State Management:
- `channels`: Array of extracted channel data
- `loading`: Boolean for extraction status
- `error`: Error message string
- `searchQuery`: Current search query
- `apiKey`: YouTube API key
- `stats`: Object with `{ total, processed, rate }` for progress tracking
- `isExtracting`: Boolean for extraction in progress
- `targetCount`: Number for target channel count (default: 500)
- `shouldStopRef`: useRef to track stop request

#### Extraction Process (Two-Phase Approach):

**Phase 1: Channel ID Collection**
- Use multiple search query variations:
  - Original query
  - `${query} India`
  - `${query} channel`
  - `${query} Indian`
  - `India ${query}`
- For each variation, paginate through search results (max 200 searches per query variation)
- Collect unique channel IDs (target: 3x the target count to ensure enough valid channels)
- Use pagination tokens (`nextPageToken`) to get all results
- Add delays between requests (500ms for small targets, 2000ms for large targets >50k)

**Phase 2: Channel Processing**
- Process channels in batches of 100
- Use controlled concurrency (3-5 parallel batches depending on target size)
- For each channel:
  - Fetch channel details (snippet, statistics, contentDetails, brandingSettings)
  - Filter by:
    - Country must be 'IN' (India)
    - Subscriber count must be < 1,000,000
  - Fetch uploads playlist
  - Get last 5 videos with:
    - Video details (title, views, comment count, published date, tags, description, link)
    - All comments (up to 1000 per video) - comments joined with " | " separator
  - Extract email from channel about section using regex
  - Extract social handles (Instagram, Twitter/X, Facebook, LinkedIn, Telegram, Website)
  - Store in IndexedDB after each batch

#### Progress Tracking:
- Real-time stats panel showing:
  - Total Extracted count
  - Processing Rate (channels/sec)
  - Target count
  - Progress percentage
- Update UI after every batch (show last 1000 channels in table)
- Stop button to halt extraction (keeps collected data)

#### Error Handling:
- Detect API quota exceeded errors (403 with quota message)
- Show user-friendly error messages
- Allow download of collected data even if extraction stops

### 3. Data Storage (storage.js)
- **IndexedDB Setup**:
  - Database name: 'YouTubeDataDB'
  - Version: 1
  - Object store: 'channels' with keyPath 'id'
  - Indexes: 'title', 'subscriberCount'
- **Functions**:
  - `initDB()`: Initialize/return database instance
  - `saveChannels(channels)`: Save array of channels (uses put to handle duplicates)
  - `getAllChannels()`: Retrieve all channels
  - `getChannelCount()`: Get total count
  - `clearStorage()`: Clear all data

### 4. API Client (apiClient.js)
- **fetchWithRetry(url, retries=3)**:
  - Retry logic with exponential backoff
  - Initial backoff: 1000ms, Max: 10000ms
  - Handle quota errors (403) and rate limit errors (429)
  - Return parsed JSON response
- **fetchBatchesInParallel(urls, maxConcurrent=5)**:
  - Process multiple URLs in parallel batches
  - 100ms delay between batches
  - Return array of results

### 5. Comment Fetcher (commentFetcher.js)
- **fetchAllComments(apiKey, videoId, maxComments=1000)**:
  - Fetch comments with pagination
  - Use commentThreads API with relevance order
  - Max 100 comments per request
  - Join all comments with " | " separator
  - Return empty string if comments disabled or error
  - 100ms delay between requests

### 6. Social Handles Extractor (socialHandlesExtractor.js)
- **extractSocialHandles(text)**:
  - Extract from channel about section:
    - Instagram: patterns for instagram.com, @handle on instagram
    - Twitter/X: patterns for twitter.com, x.com, @handle on twitter
    - Facebook: patterns for facebook.com, fb.com
    - LinkedIn: patterns for linkedin.com/in/, linkedin.com/company/
    - Telegram: patterns for t.me, telegram.me
    - Website: general URLs (excluding social media and YouTube)
  - Return object: `{ instagram, twitter, facebook, linkedin, telegram, website }`
  - All handles should be full URLs (add https:// if missing)

### 7. Export Functionality (exportFormats.js)

#### CSV Export:
- Headers: Channel Name, Channel Description, About Section, Subscriber Count, Country, Email, Instagram, Twitter/X, Facebook, LinkedIn, Telegram, Website, Total Videos, then for each of 5 videos: Title, Link, Views, Comment Count, All Comments, Topics
- Proper CSV escaping (quotes, commas, newlines)
- Download as `.csv` file with timestamp

#### JSON Export:
- Structure: `{ searchQuery, exportDate, totalChannels, channels }`
- Pretty-printed JSON
- Download as `.json` file with timestamp

#### Excel Export:
- Same headers as CSV
- Use xlsx library
- Column widths:
  - Channel Name: 30, Description: 50, About: 80
  - Subscriber Count: 15, Country: 12, Email: 25
  - Social handles: 30-40 each
  - Video titles: 40, Links: 50, Views/Comment Count: 12, All Comments: 80, Topics: 30
- For datasets >50,000 channels, use `largeFileExport.js` to split into multiple files (max 1M rows per file)
- Filename format: `YouTube_Channels_{query}_{timestamp}.xlsx`

### 8. Data Table Component (DataTable.jsx)
- **Display**:
  - Table with columns: #, Channel Name, Subscribers, Country, Email, Videos, Social Links
  - Show only first 1000 channels in UI (note displayed if more)
  - Social links shown as badges (IG, TW, FB)
- **Export Controls**:
  - Format selector: CSV, JSON, Excel
  - Export button showing channel count
  - Disabled when no data or exporting
- **Styling**: Sticky header, hover effects, responsive design

## Channel Data Structure
Each channel object should contain:
```javascript
{
  id: string,
  title: string,
  description: string,
  thumbnail: string,
  subscriberCount: number,
  videoCount: number,
  country: string,
  customUrl: string | null,
  about: string,
  email: string | null,
  socialHandles: {
    instagram: string | null,
    twitter: string | null,
    facebook: string | null,
    linkedin: string | null,
    telegram: string | null,
    website: string | null
  },
  videos: [
    {
      id: string,
      title: string,
      views: number,
      commentCount: number,
      publishedAt: string,
      tags: string[],
      description: string,
      link: string,
      allComments: string // All comments joined with " | "
    }
  ] // Max 5 videos
}
```

## API Endpoints Used
1. **Search**: `GET https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q={query}&maxResults=50&key={key}&pageToken={token}`
2. **Channel Details**: `GET https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails,brandingSettings&id={ids}&key={key}` (up to 50 IDs per request)
3. **Playlist Items**: `GET https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId={id}&maxResults=5&key={key}`
4. **Video Details**: `GET https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id={ids}&key={key}`
5. **Comments**: `GET https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId={id}&maxResults=100&key={key}&order=relevance&pageToken={token}`

## Styling Requirements

### App.css:
- Modern, clean design with white cards on light gray background (#f5f5f5)
- Header with title and description
- Stats panel with flex layout
- Error messages with red background and left border
- Stop button: red (#dc3545) with hover effects

### SearchForm.css:
- White card with padding and shadow
- 3-column grid on desktop, single column on mobile
- Input fields with focus states (blue border #4a90e2)
- Full-width submit button (blue #4a90e2)

### DataTable.css:
- White card container
- Sticky table header
- Export controls in header
- Scrollable table wrapper (max-height: 600px)
- Hover effects on rows
- Social link badges (gray background, small text)

### index.css:
- System font stack
- Reset styles
- Light gray background

## Performance Optimizations
1. **Batch Processing**: Process channels in batches of 100
2. **Parallel Requests**: 3-5 concurrent batches for large targets
3. **IndexedDB**: Store data incrementally to avoid memory issues
4. **UI Updates**: Only show last 1000 channels in table, update after each batch
5. **Adaptive Delays**: Longer delays for larger target counts
6. **Stop Functionality**: Use ref to allow graceful stopping

## Error Handling
- API quota exceeded: Show error, allow data download
- Rate limiting: Exponential backoff with retries
- Network errors: Retry with backoff
- Comments disabled: Return empty string, continue processing
- Invalid channels: Filter out, continue processing

## User Experience
- Real-time progress updates
- Can stop extraction anytime and download collected data
- Clear error messages
- Loading states on buttons
- Responsive design for mobile
- Export in multiple formats
- Large file handling (split Excel files if >50k channels)

## Package.json Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  }
}
```

## Build Configuration
- Vite config with React plugin
- Development server on port 5173 (default)
- Production build to `dist` directory

## Important Notes
1. The application filters channels to only include those from India (country code 'IN')
2. Subscriber limit is set to 1,000,000 (channels with >= 1M subscribers are excluded)
3. Only the last 5 videos per channel are fetched
4. Comments are fetched up to 1000 per video
5. Data persists in IndexedDB, so it survives page refreshes
6. The UI shows a maximum of 1000 channels in the table, but all data is stored and exported
7. For very large datasets (>50k), Excel export splits into multiple files
8. The application handles API quota limits gracefully and allows partial data export

## Testing Considerations
- Test with small targets first (50-100 channels)
- Test stop functionality mid-extraction
- Test export with various data sizes
- Test error handling (invalid API key, quota exceeded)
- Test IndexedDB persistence across page refreshes
- Test mobile responsiveness

---

**This prompt contains all the information needed to create an exact replica of the YouTube Channel Data Extractor application. Follow the structure, features, and implementation details precisely.**


