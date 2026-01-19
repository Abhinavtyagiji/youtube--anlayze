import * as XLSX from 'xlsx'
import { exportLargeDatasetToExcel } from './largeFileExport'

// Convert channels to CSV format
export function exportToCSV(channels, searchQuery) {
  if (channels.length === 0) return

  // Header row with About section
  const headers = [
    'Channel Name', 'Channel Description', 'About Section', 'Subscriber Count', 'Country', 'Email',
    'Instagram', 'Twitter/X', 'Facebook', 'LinkedIn', 'Telegram', 'Website',
    'Total Videos',
    'Video 1 Title', 'Video 1 Link', 'Video 1 Views', 'Video 1 Comment Count', 'Video 1 All Comments', 'Video 1 Topics',
    'Video 2 Title', 'Video 2 Link', 'Video 2 Views', 'Video 2 Comment Count', 'Video 2 All Comments', 'Video 2 Topics',
    'Video 3 Title', 'Video 3 Link', 'Video 3 Views', 'Video 3 Comment Count', 'Video 3 All Comments', 'Video 3 Topics',
    'Video 4 Title', 'Video 4 Link', 'Video 4 Views', 'Video 4 Comment Count', 'Video 4 All Comments', 'Video 4 Topics',
    'Video 5 Title', 'Video 5 Link', 'Video 5 Views', 'Video 5 Comment Count', 'Video 5 All Comments', 'Video 5 Topics'
  ]

  // Escape CSV values
  const escapeCSV = (value) => {
    if (value === null || value === undefined) return ''
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  // Build CSV content
  let csvContent = headers.map(escapeCSV).join(',') + '\n'

  channels.forEach((channel) => {
    const socialHandles = channel.socialHandles || {}
    const row = [
      channel.title || '',
      channel.description || '',
      channel.about || '', // About section
      channel.subscriberCount || 0,
      channel.country || '',
      channel.email || '',
      socialHandles.instagram || '',
      socialHandles.twitter || '',
      socialHandles.facebook || '',
      socialHandles.linkedin || '',
      socialHandles.telegram || '',
      socialHandles.website || '',
      channel.videoCount || 0
    ]

    // Add video data
    for (let i = 0; i < 5; i++) {
      if (channel.videos && channel.videos[i]) {
        const video = channel.videos[i]
        row.push(
          video.title,
          video.link || '',
          video.views || 0,
          video.commentCount || 0,
          video.allComments || '',
          video.tags && video.tags.length > 0 ? video.tags.join('; ') : ''
        )
      } else {
        row.push('', '', '', '', '', '')
      }
    }

    csvContent += row.map(escapeCSV).join(',') + '\n'
  })

  // Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `YouTube_Channels_${searchQuery.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Export to JSON
export function exportToJSON(channels, searchQuery) {
  const data = {
    searchQuery,
    exportDate: new Date().toISOString(),
    totalChannels: channels.length,
    channels: channels
  }

  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `YouTube_Channels_${searchQuery.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.json`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Export to Excel with all data including About section
// For large datasets (>100k), uses split file export
export async function exportToExcel(channels, searchQuery) {
  if (!channels || channels.length === 0) {
    alert('No data to export')
    return
  }

  // For very large datasets, use the split file export
  if (channels.length > 50000) {
    await exportLargeDatasetToExcel(channels, searchQuery)
    return
  }

  try {
    const excelData = []

    // Header row with About section
    excelData.push([
      'Channel Name',
      'Channel Description',
      'About Section',
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
        channel.title || 'N/A',
        channel.description || 'N/A',
        channel.about || 'N/A', // About section from channel
        channel.subscriberCount || 0,
        channel.country || 'N/A',
        channel.email || 'N/A',
        socialHandles.instagram || 'N/A',
        socialHandles.twitter || 'N/A',
        socialHandles.facebook || 'N/A',
        socialHandles.linkedin || 'N/A',
        socialHandles.telegram || 'N/A',
        socialHandles.website || 'N/A',
        channel.videoCount || 0
      ]

      // Add video data (up to 5 videos)
      for (let i = 0; i < 5; i++) {
        if (channel.videos && channel.videos[i]) {
          const video = channel.videos[i]
          row.push(
            video.title || 'N/A',
            video.link || 'N/A',
            video.views || 0,
            video.commentCount || 0,
            video.allComments || 'N/A',
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

    // Set column widths for better readability
    const colWidths = [
      { wch: 30 }, // Channel Name
      { wch: 50 }, // Channel Description
      { wch: 80 }, // About Section (wide for long text)
      { wch: 15 }, // Subscriber Count
      { wch: 12 }, // Country
      { wch: 25 }, // Email
      { wch: 35 }, // Instagram
      { wch: 35 }, // Twitter/X
      { wch: 35 }, // Facebook
      { wch: 35 }, // LinkedIn
      { wch: 35 }, // Telegram
      { wch: 40 }, // Website
      { wch: 12 }, // Total Videos
      { wch: 40 }, // Video 1 Title
      { wch: 50 }, // Video 1 Link
      { wch: 12 }, // Video 1 Views
      { wch: 12 }, // Video 1 Comment Count
      { wch: 80 }, // Video 1 All Comments
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
    const safeQuery = (searchQuery || 'search_results').replace(/[^a-zA-Z0-9]/g, '_')
    const filename = `YouTube_Channels_${safeQuery}_${timestamp}.xlsx`

    // Download file
    XLSX.writeFile(wb, filename)
    
    console.log(`Excel file exported successfully: ${filename}`)
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    alert(`Error exporting to Excel: ${error.message}. Please try again.`)
    throw error
  }
}

