// Function to fetch all comments for a video with pagination
export async function fetchAllComments(apiKey, videoId, maxComments = 1000) {
  try {
    let allComments = []
    let nextPageToken = null
    let totalFetched = 0

    do {
      let commentsUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&key=${apiKey}&order=relevance`
      
      if (nextPageToken) {
        commentsUrl += `&pageToken=${nextPageToken}`
      }

      const commentsResponse = await fetch(commentsUrl)
      const commentsData = await commentsResponse.json()

      if (commentsData.error) {
        // If comments are disabled or error, return empty string
        if (commentsData.error.code === 403 || commentsData.error.message?.includes('disabled')) {
          return ''
        }
        console.error(`Error fetching comments for video ${videoId}:`, commentsData.error)
        return ''
      }

      if (commentsData.items && commentsData.items.length > 0) {
        const comments = commentsData.items.map(item => {
          const commentText = item.snippet.topLevelComment.snippet.textDisplay || 
                            item.snippet.topLevelComment.snippet.textOriginal || ''
          return commentText.trim()
        }).filter(comment => comment.length > 0)

        allComments = allComments.concat(comments)
        totalFetched += comments.length
        nextPageToken = commentsData.nextPageToken

        // Stop if we've fetched enough or no more pages
        if (totalFetched >= maxComments || !nextPageToken) {
          break
        }
      } else {
        break
      }

      // Small delay to avoid rate limiting (100ms between requests)
      await new Promise(resolve => setTimeout(resolve, 100))
    } while (totalFetched < maxComments && nextPageToken)

    // Join all comments into a single string
    return allComments.join(' | ')
  } catch (error) {
    console.error(`Error fetching comments for video ${videoId}:`, error)
    return ''
  }
}

