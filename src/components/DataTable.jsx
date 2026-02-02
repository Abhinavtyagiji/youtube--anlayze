import { useState } from 'react'
import { exportToCSV, exportToJSON, exportToExcel } from '../utils/exportFormats'
import './DataTable.css'

function DataTable({ channels, searchQuery, onLoadStored }) {
  const [downloading, setDownloading] = useState(false)
  const [exportFormat, setExportFormat] = useState('excel')

  const handleExport = async () => {
    if (!channels || channels.length === 0) {
      alert('No data to export. Please extract some channels first.')
      return
    }

    setDownloading(true)
    try {
      const query = searchQuery || 'search_results'

      switch (exportFormat) {
        case 'csv':
          exportToCSV(channels, query)
          break
        case 'json':
          exportToJSON(channels, query)
          break
        case 'excel':
          await exportToExcel(channels, query)
          break
        default:
          alert('Invalid export format selected')
          return
      }

      // Small delay to show success
      setTimeout(() => {
        setDownloading(false)
      }, 500)
    } catch (error) {
      console.error('Export error:', error)
      alert(`Export failed: ${error.message || 'Unknown error'}. Please try again.`)
      setDownloading(false)
    }
  }

  return (
    <div className="data-table-container">
      <div className="table-header">
        <h2>Extracted Data: {channels.length.toLocaleString()} Channels</h2>
        <div className="export-controls">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="format-select"
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
            <option value="excel">Excel</option>
          </select>
          <button
            className="export-button"
            onClick={handleExport}
            disabled={downloading || channels.length === 0}
            title={channels.length === 0 ? 'No data to export' : `Export ${channels.length.toLocaleString()} channels`}
          >
            {downloading ? 'Exporting...' : `Export ${exportFormat.toUpperCase()} (${channels.length.toLocaleString()})`}
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Channel Name</th>
              <th>Channel URL</th>
              <th>Subscribers</th>
              <th>Country</th>
              <th>Email</th>
              <th>Videos</th>
              <th>Social Links</th>
            </tr>
          </thead>
          <tbody>
            {channels.slice(0, 1000).map((channel, index) => (
              <tr key={channel.id}>
                <td>{index + 1}</td>
                <td className="channel-name">{channel.title}</td>
                <td><a href={channel.channelUrl} target="_blank" rel="noopener noreferrer">{channel.channelUrl}</a></td>
                <td>{channel.subscriberCount.toLocaleString()}</td>
                <td>{channel.country}</td>
                <td>{channel.email || '-'}</td>
                <td>{channel.videoCount}</td>
                <td className="social-links">
                  {channel.socialHandles?.instagram && <span>IG</span>}
                  {channel.socialHandles?.twitter && <span>TW</span>}
                  {channel.socialHandles?.facebook && <span>FB</span>}
                  {!channel.socialHandles?.instagram && !channel.socialHandles?.twitter && !channel.socialHandles?.facebook && '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {channels.length > 1000 && (
          <div className="table-note">
            Showing first 1,000 of {channels.length.toLocaleString()} channels. Export to see all data.
          </div>
        )}
      </div>
    </div>
  )
}

export default DataTable

