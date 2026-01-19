import * as XLSX from 'xlsx'

// Excel has a limit of ~1,048,576 rows, so we need to split large datasets
const MAX_EXCEL_ROWS = 1000000 // Leave some margin

export async function exportLargeDatasetToExcel(channels, searchQuery) {
  if (!channels || channels.length === 0) {
    alert('No data to export')
    return
  }

  try {
    const totalChannels = channels.length
    const numFiles = Math.ceil(totalChannels / MAX_EXCEL_ROWS)
    
    console.log(`Exporting ${totalChannels.toLocaleString()} channels in ${numFiles} file(s)...`)

    for (let fileIndex = 0; fileIndex < numFiles; fileIndex++) {
      const startIndex = fileIndex * MAX_EXCEL_ROWS
      const endIndex = Math.min(startIndex + MAX_EXCEL_ROWS, totalChannels)
      const fileChannels = channels.slice(startIndex, endIndex)

      const excelData = []

      // Header row
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
      fileChannels.forEach((channel) => {
        const socialHandles = channel.socialHandles || {}
        
        const row = [
          channel.title || 'N/A',
          channel.description || 'N/A',
          channel.about || 'N/A',
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

        // Add video data
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

      // Create workbook
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(excelData)

      // Set column widths
      const colWidths = [
        { wch: 30 }, { wch: 50 }, { wch: 80 }, { wch: 15 }, { wch: 12 },
        { wch: 25 }, { wch: 35 }, { wch: 35 }, { wch: 35 }, { wch: 35 },
        { wch: 35 }, { wch: 40 }, { wch: 12 },
        ...Array(30).fill(null).map((_, i) => {
          if (i % 6 === 0) return { wch: 40 } // Title
          if (i % 6 === 1) return { wch: 50 } // Link
          if (i % 6 === 2) return { wch: 12 } // Views
          if (i % 6 === 3) return { wch: 12 } // Comment Count
          if (i % 6 === 4) return { wch: 80 } // All Comments
          return { wch: 30 } // Topics
        })
      ]
      ws['!cols'] = colWidths

      XLSX.utils.book_append_sheet(wb, ws, 'YouTube Channels')

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      const safeQuery = (searchQuery || 'search_results').replace(/[^a-zA-Z0-9]/g, '_')
      const filename = numFiles > 1
        ? `YouTube_Channels_${safeQuery}_Part${fileIndex + 1}_of_${numFiles}_${timestamp}.xlsx`
        : `YouTube_Channels_${safeQuery}_${timestamp}.xlsx`

      // Download file with a small delay between files
      if (fileIndex > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      XLSX.writeFile(wb, filename)
      console.log(`Exported file ${fileIndex + 1}/${numFiles}: ${filename}`)
    }

    if (numFiles > 1) {
      alert(`Exported ${totalChannels.toLocaleString()} channels in ${numFiles} Excel files due to file size limits.`)
    } else {
      alert(`Successfully exported ${totalChannels.toLocaleString()} channels to Excel!`)
    }
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    alert(`Error exporting to Excel: ${error.message}. Please try again.`)
    throw error
  }
}

