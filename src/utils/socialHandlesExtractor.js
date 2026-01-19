// Function to extract social media handles and links from text
export function extractSocialHandles(text) {
  if (!text) return {
    instagram: null,
    twitter: null,
    facebook: null,
    linkedin: null,
    telegram: null,
    website: null
  }

  const socialHandles = {
    instagram: null,
    twitter: null,
    facebook: null,
    linkedin: null,
    telegram: null,
    website: null
  }

  // Instagram patterns
  const instagramPatterns = [
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)/gi,
    /@([a-zA-Z0-9._]+)\s*(?:on\s+)?instagram/gi,
    /instagram[:\s]+@?([a-zA-Z0-9._]+)/gi
  ]
  for (const pattern of instagramPatterns) {
    const matches = [...text.matchAll(pattern)]
    if (matches.length > 0) {
      const match = matches[0]
      let handle = match[1] || match[0]
      handle = handle.replace(/https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').trim()
      if (handle) {
        socialHandles.instagram = handle.startsWith('http') ? handle : `https://instagram.com/${handle}`
        break
      }
    }
  }

  // Twitter/X patterns
  const twitterPatterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/gi,
    /@([a-zA-Z0-9_]+)\s*(?:on\s+)?(?:twitter|x)/gi,
    /(?:twitter|x)[:\s]+@?([a-zA-Z0-9_]+)/gi
  ]
  for (const pattern of twitterPatterns) {
    const matches = [...text.matchAll(pattern)]
    if (matches.length > 0) {
      const match = matches[0]
      let handle = match[1] || match[0]
      handle = handle.replace(/https?:\/\/(www\.)?(twitter\.com|x\.com)\//i, '').replace(/^@/, '').trim()
      if (handle) {
        socialHandles.twitter = handle.startsWith('http') ? handle : `https://twitter.com/${handle}`
        break
      }
    }
  }

  // Facebook patterns
  const facebookPatterns = [
    /(?:https?:\/\/)?(?:www\.)?facebook\.com\/([a-zA-Z0-9.]+)/gi,
    /(?:https?:\/\/)?(?:www\.)?fb\.com\/([a-zA-Z0-9.]+)/gi,
    /@([a-zA-Z0-9._]+)\s*(?:on\s+)?facebook/gi,
    /facebook[:\s]+@?([a-zA-Z0-9._]+)/gi
  ]
  for (const pattern of facebookPatterns) {
    const matches = [...text.matchAll(pattern)]
    if (matches.length > 0) {
      const match = matches[0]
      let handle = match[1] || match[0]
      handle = handle.replace(/https?:\/\/(www\.)?(facebook\.com|fb\.com)\//i, '').replace(/^@/, '').trim()
      if (handle) {
        socialHandles.facebook = handle.startsWith('http') ? handle : `https://facebook.com/${handle}`
        break
      }
    }
  }

  // LinkedIn patterns
  const linkedinPatterns = [
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|company)\/([a-zA-Z0-9-]+)/gi,
    /@([a-zA-Z0-9._]+)\s*(?:on\s+)?linkedin/gi,
    /linkedin[:\s]+@?([a-zA-Z0-9._]+)/gi
  ]
  for (const pattern of linkedinPatterns) {
    const matches = [...text.matchAll(pattern)]
    if (matches.length > 0) {
      const match = matches[0]
      let handle = match[1] || match[0]
      handle = handle.replace(/https?:\/\/(www\.)?linkedin\.com\/(in|company)\//i, '').replace(/^@/, '').trim()
      if (handle) {
        socialHandles.linkedin = handle.startsWith('http') ? handle : `https://linkedin.com/in/${handle}`
        break
      }
    }
  }

  // Telegram patterns
  const telegramPatterns = [
    /(?:https?:\/\/)?(?:www\.)?t\.me\/([a-zA-Z0-9_]+)/gi,
    /(?:https?:\/\/)?(?:www\.)?telegram\.me\/([a-zA-Z0-9_]+)/gi,
    /@([a-zA-Z0-9_]+)\s*(?:on\s+)?telegram/gi,
    /telegram[:\s]+@?([a-zA-Z0-9_]+)/gi
  ]
  for (const pattern of telegramPatterns) {
    const matches = [...text.matchAll(pattern)]
    if (matches.length > 0) {
      const match = matches[0]
      let handle = match[1] || match[0]
      handle = handle.replace(/https?:\/\/(www\.)?(t\.me|telegram\.me)\//i, '').replace(/^@/, '').trim()
      if (handle) {
        socialHandles.telegram = handle.startsWith('http') ? handle : `https://t.me/${handle}`
        break
      }
    }
  }

  // Website patterns (general URLs that aren't social media)
  const websitePattern = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.(?:com|net|org|in|co\.in|io|me|app|dev)(?:\/[^\s]*)?)/gi
  const websiteMatches = text.match(websitePattern)
  if (websiteMatches) {
    for (const match of websiteMatches) {
      const url = match.trim()
      // Skip if it's a social media URL we already captured
      if (!url.includes('instagram.com') && 
          !url.includes('twitter.com') && 
          !url.includes('x.com') &&
          !url.includes('facebook.com') && 
          !url.includes('fb.com') &&
          !url.includes('linkedin.com') &&
          !url.includes('t.me') &&
          !url.includes('telegram.me') &&
          !url.includes('youtube.com')) {
        socialHandles.website = url.startsWith('http') ? url : `https://${url}`
        break
      }
    }
  }

  return socialHandles
}

