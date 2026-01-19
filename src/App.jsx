import { useState, useEffect, useRef } from 'react'
import SearchForm from './components/SearchForm'
import DataTable from './components/DataTable'
import { extractSocialHandles } from './utils/socialHandlesExtractor'
import { fetchAllComments } from './utils/commentFetcher'
import { fetchWithRetry, fetchBatchesInParallel } from './utils/apiClient'
import { saveChannels, getAllChannels, getChannelCount, clearStorage } from './utils/storage'
import './App.css'

function App() {
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [stats, setStats] = useState({ total: 0, processed: 0, rate: 0 })
  const [isExtracting, setIsExtracting] = useState(false)
  const [targetCount, setTargetCount] = useState(500)
  const shouldStopRef = useRef(false) // Ref to track if extraction should stop

  // Load stored data on mount
  useEffect(() => {
    loadStoredData()
  }, [])

  const loadStoredData = async () => {
    try {
      const count = await getChannelCount()
      setStats(prev => ({ ...prev, total: count }))
    } catch (err) {
      console.error('Error loading stored data:', err)
    }
  }

  const handleSearch = async (key, query) => {
    setError(null)
    setSearchQuery(query)
    setApiKey(key)
    setChannels([])
    setStats({ total: 0, processed: 0, rate: 0 })
    shouldStopRef.current = false // Reset stop flag
    
    // Clear old storage
    await clearStorage()
    
    // Start extraction
    startExtraction(key, query)
  }

  const handleStop = () => {
    shouldStopRef.current = true
    setIsExtracting(false)
    setLoading(false)
    console.log('Extraction stopped by user')
  }

  const startExtraction = async (key, query) => {
    setIsExtracting(true)
    setLoading(true)
    
    const startTime = Date.now()
    let processedCount = 0
    let allChannelIds = []
    let nextPageToken = null
    const processedIds = new Set()
    const SUBSCRIBER_LIMIT = 1000000
    const TARGET_COUNTRY = 'IN'
    const BATCH_SIZE = 100 // Larger batches for efficiency

    try {
      // Phase 1: Collect channel IDs from multiple search queries to get more results
      const searchQueries = [
        query,
        `${query} India`,
        `${query} channel`,
        `${query} Indian`,
        `India ${query}`
      ]

      console.log(`Starting extraction for ${targetCount.toLocaleString()} channels...`)
      
      // Collect channel IDs from multiple search variations
      for (const searchQuery of searchQueries) {
        if (shouldStopRef.current || allChannelIds.length >= targetCount * 3) break
        
        nextPageToken = null
        let searchCount = 0
        const MAX_SEARCHES_PER_QUERY = 200
        
        while (!shouldStopRef.current && allChannelIds.length < targetCount * 3 && searchCount < MAX_SEARCHES_PER_QUERY) {
          const searchUrl = nextPageToken
            ? `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(searchQuery)}&maxResults=50&pageToken=${nextPageToken}&key=${key}`
            : `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(searchQuery)}&maxResults=50&key=${key}`

          try {
            const searchData = await fetchWithRetry(searchUrl)
            const channelIds = searchData.items.map(item => item.id.channelId)
            
            // Add only new channel IDs
            channelIds.forEach(id => {
              if (!allChannelIds.includes(id)) {
                allChannelIds.push(id)
              }
            })
            
            nextPageToken = searchData.nextPageToken
            searchCount++
            
            // Update progress
            if (allChannelIds.length % 1000 === 0) {
              console.log(`Collected ${allChannelIds.length.toLocaleString()} channel IDs...`)
            }

            if (!nextPageToken) break
            
            // Delay to avoid quota issues (longer delay for large targets)
            const delay = targetCount > 50000 ? 2000 : 500
            await new Promise(resolve => setTimeout(resolve, delay))
          } catch (err) {
            if (err.message?.includes('quota') || err.message?.includes('exceeded')) {
              setError('API quota exceeded. Please wait or use a different API key.')
              shouldStopRef.current = true
              break
            }
            console.error(`Error in search query "${searchQuery}":`, err)
            break
          }
        }
        
        if (shouldStopRef.current) break
      }

      console.log(`Total channel IDs collected: ${allChannelIds.length.toLocaleString()}`)

      // Phase 2: Process channels in large parallel batches
      const unprocessedIds = allChannelIds.filter(id => !processedIds.has(id))
      console.log(`Processing ${unprocessedIds.length.toLocaleString()} unique channel IDs...`)

      // Process in batches with controlled concurrency
      const CONCURRENT_BATCHES = targetCount > 50000 ? 3 : 5 // Lower concurrency for large targets
      let batchIndex = 0
      
      while (!shouldStopRef.current && processedCount < targetCount && batchIndex * BATCH_SIZE < unprocessedIds.length) {
        const batchPromises = []
        
        // Create multiple concurrent batches
        for (let j = 0; j < CONCURRENT_BATCHES && processedCount < targetCount && !shouldStopRef.current; j++) {
          const batchStart = (batchIndex * CONCURRENT_BATCHES + j) * BATCH_SIZE
          if (batchStart >= unprocessedIds.length) break
          
          const batch = unprocessedIds.slice(batchStart, batchStart + BATCH_SIZE)
          if (batch.length > 0) {
            batchPromises.push(processChannelBatch(key, batch, processedIds, SUBSCRIBER_LIMIT, TARGET_COUNTRY))
          }
        }

        if (batchPromises.length === 0 || shouldStopRef.current) break

        try {
          const results = await Promise.all(batchPromises)
          const validChannels = results.flat().filter(Boolean)
          processedCount += validChannels.length
          
          // Save to IndexedDB in chunks to avoid memory issues
          if (validChannels.length > 0) {
            await saveChannels(validChannels)
          }
          
          // Update UI after EVERY batch (gradual updates)
          const newChannels = await getAllChannels()
          setChannels(newChannels.slice(-1000)) // Show last 1000 for UI
          const elapsed = (Date.now() - startTime) / 1000
          setStats({
            total: newChannels.length,
            processed: processedCount,
            rate: elapsed > 0 ? Math.round(processedCount / elapsed) : 0
          })
          
          // Log progress every 100 channels
          if (processedCount % 100 === 0) {
            console.log(`Processed: ${processedCount.toLocaleString()} / ${targetCount.toLocaleString()} (${Math.round((processedCount / targetCount) * 100)}%)`)
          }
        } catch (err) {
          if (err.message?.includes('quota') || err.message?.includes('exceeded')) {
            setError('API quota exceeded. Extraction stopped. You can download the data collected so far.')
            shouldStopRef.current = true
            break
          }
          console.error('Error processing batch:', err)
        }

        batchIndex++

        // Adaptive delay based on target size to avoid quota issues
        const delay = targetCount > 100000 ? 2000 : targetCount > 50000 ? 1000 : 200
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      // Final update
      const finalChannels = await getAllChannels()
      setChannels(finalChannels.slice(-1000))
      setStats({
        total: finalChannels.length,
        processed: processedCount,
        rate: Math.round(processedCount / ((Date.now() - startTime) / 1000))
      })
      
      if (shouldStopRef.current) {
        console.log(`Extraction stopped. Total channels collected: ${finalChannels.length.toLocaleString()}`)
        setError('Extraction stopped. You can download the data collected so far.')
      } else {
        console.log(`Extraction complete! Total channels: ${finalChannels.length.toLocaleString()}`)
      }
    } catch (err) {
      if (err.message?.includes('quota') || err.message?.includes('exceeded')) {
        setError('API quota exceeded. Extraction stopped. You can download the data collected so far.')
      } else {
        setError(err.message || 'Extraction failed')
      }
    } finally {
      setLoading(false)
      setIsExtracting(false)
      shouldStopRef.current = false
    }
  }

  async function processChannelBatch(apiKey, channelIds, processedIds, subscriberLimit, targetCountry) {
    if (channelIds.length === 0) return []

    // Fetch channel details in parallel
    const detailUrls = []
    for (let i = 0; i < channelIds.length; i += 50) {
      const batch = channelIds.slice(i, i + 50)
      detailUrls.push(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails,brandingSettings&id=${batch.join(',')}&key=${apiKey}`)
    }

    const detailResponses = await fetchBatchesInParallel(detailUrls, 5)
    const allChannelDetails = detailResponses.flatMap(res => res.items || [])

    // Filter and process
    const validChannels = []
    const processPromises = allChannelDetails.map(async (channel) => {
      const subscriberCount = parseInt(channel.statistics.subscriberCount || 0)
      const country = channel.snippet.country || ''

      if (country !== targetCountry || subscriberCount >= subscriberLimit) {
        return null
      }

      if (processedIds.has(channel.id)) return null
      processedIds.add(channel.id)

      // Process channel data
      const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads
      let videos = []

      if (uploadsPlaylistId) {
        try {
          const videosUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=5&key=${apiKey}`
          const videosData = await fetchWithRetry(videosUrl)

          if (videosData.items?.length > 0) {
            const videoIds = videosData.items.map(item => item.snippet.resourceId.videoId)
            const videoStatsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds.join(',')}&key=${apiKey}`
            const videoStatsData = await fetchWithRetry(videoStatsUrl)

            // Process videos (comments can be fetched in parallel too)
            const videoPromises = videoStatsData.items.map(async (video) => {
              let allComments = ''
              try {
                allComments = await fetchAllComments(apiKey, video.id, 1000)
              } catch (err) {
                console.error(`Error fetching comments: ${err}`)
              }

              return {
                id: video.id,
                title: video.snippet.title || '',
                views: parseInt(video.statistics.viewCount || 0),
                commentCount: parseInt(video.statistics.commentCount || 0),
                publishedAt: video.snippet.publishedAt,
                tags: video.snippet.tags || [],
                description: video.snippet.description || '',
                link: `https://www.youtube.com/watch?v=${video.id}`,
                allComments: allComments
              }
            })

            videos = await Promise.all(videoPromises)
          }
        } catch (err) {
          console.error(`Error processing channel ${channel.id}:`, err)
        }
      }

      const aboutText = channel.brandingSettings?.channel?.description || ''
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
      const emailMatches = aboutText.match(emailRegex)
      const email = emailMatches?.[0] || null

      return {
        id: channel.id,
        title: channel.snippet.title || '',
        description: channel.snippet.description || '',
        thumbnail: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.default?.url,
        subscriberCount: subscriberCount,
        videoCount: parseInt(channel.statistics.videoCount || 0),
        country: country,
        customUrl: channel.snippet.customUrl || null,
        about: aboutText,
        email: email,
        socialHandles: extractSocialHandles(aboutText),
        videos: videos
      }
    })

    const results = await Promise.all(processPromises)
    return results.filter(Boolean)
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>YouTube Data Extractor</h1>
          <p>High-performance data extraction (Target: 1 Lakh - 10 Lakh entries)</p>
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px' }}>
            Note: YouTube API key is required. For large extractions, use multiple API keys or increase quota limit.
            Data updates gradually as it's collected. You can stop extraction anytime and download collected data.
          </p>
        </header>

        <SearchForm 
          onSearch={handleSearch} 
          loading={loading}
          targetCount={targetCount}
          setTargetCount={setTargetCount}
        />

        {error && (
          <div className="error-message">
            <p>❌ {error}</p>
          </div>
        )}

        {isExtracting && (
          <div className="stats-panel">
            <div className="stat-item">
              <span className="stat-label">Total Extracted:</span>
              <span className="stat-value">{stats.total.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Processing Rate:</span>
              <span className="stat-value">{stats.rate} channels/sec</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Target:</span>
              <span className="stat-value">{targetCount.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Progress:</span>
              <span className="stat-value">
                {targetCount > 0 ? Math.round((stats.total / targetCount) * 100) : 0}%
              </span>
            </div>
            <div className="stat-item">
              <button 
                className="stop-button" 
                onClick={handleStop}
                title="Stop extraction and keep collected data"
              >
                ⏹ Stop Extraction
              </button>
            </div>
          </div>
        )}

        {channels.length > 0 && (
          <DataTable 
            channels={channels} 
            searchQuery={searchQuery}
            onLoadStored={loadStoredData}
          />
        )}
      </div>
    </div>
  )
}

export default App
