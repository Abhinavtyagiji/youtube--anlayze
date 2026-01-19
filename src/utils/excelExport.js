import * as XLSX from 'xlsx'

export function exportChannelsToExcel(channels, searchQuery) {
  // Prepare data for Excel
  const excelData = []

  // Header row with all new columns including comment strings
  excelData.push([
    'Channel Name',
    'Channel Description',
    'Subscriber Count',
    'Country',
    'Email',
    'Instagram',
    'Twitter/X',
    'Facebook',
    'LinkedIn',
    'Telegram',
    'Website',
    'Total Videos',
    'Video 1 Title',
    'Video 1 Link',
    'Video 1 Views',
    'Video 1 Comment Count',
    'Video 1 All Comments',
    'Video 1 Topics',
    'Video 2 Title',
    'Video 2 Link',
    'Video 2 Views',
    'Video 2 Comment Count',
    'Video 2 All Comments',
    'Video 2 Topics',
    'Video 3 Title',
    'Video 3 Link',
    'Video 3 Views',
    'Video 3 Comment Count',
    'Video 3 All Comments',
    'Video 3 Topics',
    'Video 4 Title',
    'Video 4 Link',
    'Video 4 Views',
    'Video 4 Comment Count',
    'Video 4 All Comments',
    'Video 4 Topics',
    'Video 5 Title',
    'Video 5 Link',
    'Video 5 Views',
    'Video 5 Comment Count',
    'Video 5 All Comments',
    'Video 5 Topics'
  ])

  // Add channel data
  channels.forEach((channel) => {
    const socialHandles = channel.socialHandles || {}
    
    const row = [
      channel.title,
      channel.description || 'N/A',
      channel.subscriberCount,
      channel.country,
      channel.email || 'N/A',
      socialHandles.instagram || 'N/A',
      socialHandles.twitter || 'N/A',
      socialHandles.facebook || 'N/A',
      socialHandles.linkedin || 'N/A',
      socialHandles.telegram || 'N/A',
      socialHandles.website || 'N/A',
      channel.videoCount
    ]

    // Add video data (up to 5 videos) - now includes link, comment count, and all comments as string
    for (let i = 0; i < 5; i++) {
      if (channel.videos && channel.videos[i]) {
        const video = channel.videos[i]
        row.push(
          video.title,
          video.link || 'N/A',
          video.views || 0,
          video.commentCount || 0,
          video.allComments || 'N/A', // All comments as a string
          video.tags && video.tags.length > 0 ? video.tags.join(', ') : 'N/A'
        )
      } else {
        row.push('N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A')
      }
    }

    excelData.push(row)
  })

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(excelData)

  // Set column widths
  const colWidths = [
    { wch: 30 }, // Channel Name
    { wch: 50 }, // Channel Description
    { wch: 15 }, // Subscriber Count
    { wch: 12 }, // Country
    { wch: 25 }, // Email
    { wch: 30 }, // Instagram
    { wch: 30 }, // Twitter/X
    { wch: 30 }, // Facebook
    { wch: 30 }, // LinkedIn
    { wch: 30 }, // Telegram
    { wch: 35 }, // Website
    { wch: 12 }, // Total Videos
    { wch: 40 }, // Video 1 Title
    { wch: 50 }, // Video 1 Link
    { wch: 12 }, // Video 1 Views
    { wch: 12 }, // Video 1 Comment Count
    { wch: 80 }, // Video 1 All Comments (wide for long text)
    { wch: 30 }, // Video 1 Topics
    { wch: 40 }, // Video 2 Title
    { wch: 50 }, // Video 2 Link
    { wch: 12 }, // Video 2 Views
    { wch: 12 }, // Video 2 Comment Count
    { wch: 80 }, // Video 2 All Comments
    { wch: 30 }, // Video 2 Topics
    { wch: 40 }, // Video 3 Title
    { wch: 50 }, // Video 3 Link
    { wch: 12 }, // Video 3 Views
    { wch: 12 }, // Video 3 Comment Count
    { wch: 80 }, // Video 3 All Comments
    { wch: 30 }, // Video 3 Topics
    { wch: 40 }, // Video 4 Title
    { wch: 50 }, // Video 4 Link
    { wch: 12 }, // Video 4 Views
    { wch: 12 }, // Video 4 Comment Count
    { wch: 80 }, // Video 4 All Comments
    { wch: 30 }, // Video 4 Topics
    { wch: 40 }, // Video 5 Title
    { wch: 50 }, // Video 5 Link
    { wch: 12 }, // Video 5 Views
    { wch: 12 }, // Video 5 Comment Count
    { wch: 80 }, // Video 5 All Comments
    { wch: 30 }  // Video 5 Topics
  ]
  ws['!cols'] = colWidths

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'YouTube Channels')

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const filename = `YouTube_Channels_${searchQuery.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.xlsx`

  // Download file
  XLSX.writeFile(wb, filename)
}

