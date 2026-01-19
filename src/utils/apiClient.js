// Optimized API client with retry logic and backoff strategies
const MAX_RETRIES = 3
const INITIAL_BACKOFF = 1000 // 1 second
const MAX_BACKOFF = 10000 // 10 seconds

export async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url)
      const data = await response.json()

      if (data.error) {
        // Check for rate limit errors
        if (data.error.code === 403 && data.error.message?.includes('quota')) {
          throw new Error('API quota exceeded. Please try again later.')
        }
        if (data.error.code === 429 || data.error.message?.includes('rate')) {
          // Rate limited - exponential backoff
          if (attempt < retries) {
            const backoff = Math.min(INITIAL_BACKOFF * Math.pow(2, attempt), MAX_BACKOFF)
            await new Promise(resolve => setTimeout(resolve, backoff))
            continue
          }
        }
        throw new Error(data.error.message || 'API Error')
      }

      return data
    } catch (error) {
      if (attempt === retries) {
        throw error
      }
      // Exponential backoff
      const backoff = Math.min(INITIAL_BACKOFF * Math.pow(2, attempt), MAX_BACKOFF)
      await new Promise(resolve => setTimeout(resolve, backoff))
    }
  }
}

// Parallel batch fetching
export async function fetchBatchesInParallel(urls, maxConcurrent = 5) {
  const results = []
  
  for (let i = 0; i < urls.length; i += maxConcurrent) {
    const batch = urls.slice(i, i + maxConcurrent)
    const batchPromises = batch.map(url => fetchWithRetry(url))
    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)
    
    // Small delay between batches to avoid overwhelming the API
    if (i + maxConcurrent < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  return results
}

