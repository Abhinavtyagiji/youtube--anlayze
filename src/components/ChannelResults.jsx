import { useState, useEffect, useRef } from 'react'
import ChannelCard from './ChannelCard'
import { exportChannelsToExcel } from '../utils/excelExport'
import './ChannelResults.css'

function ChannelResults({ channels, searchQuery, onLoadMore, loadingMore, hasMore }) {
  const [downloading, setDownloading] = useState(false)
  const observerTarget = useRef(null)

  // Infinite scroll: detect when user scrolls near bottom
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, loadingMore, onLoadMore])

  const handleDownload = () => {
    setDownloading(true)
    try {
      // Export only the channels that have been loaded so far
      exportChannelsToExcel(channels, searchQuery || 'search_results')
      // Small delay to show loading state
      setTimeout(() => {
        setDownloading(false)
      }, 500)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      alert('Error exporting to Excel. Please try again.')
      setDownloading(false)
    }
  }

  return (
    <div className="channel-results">
      <div className="results-header-container">
        <h2 className="results-header">
          {channels.length} Channel{channels.length !== 1 ? 's' : ''} Loaded
          {hasMore && <span className="more-indicator"> (Scroll for more)</span>}
        </h2>
        <button 
          className="download-button" 
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? (
            <>
              <span className="download-spinner"></span>
              Downloading...
            </>
          ) : (
            <>
              <span className="download-icon">📥</span>
              Download Excel ({channels.length} channels)
            </>
          )}
        </button>
      </div>
      <div className="channels-grid">
        {channels.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} />
        ))}
      </div>
      
      {/* Loading indicator and scroll trigger */}
      <div ref={observerTarget} className="scroll-trigger">
        {loadingMore && (
          <div className="loading-more">
            <div className="spinner-small"></div>
            <p>Loading more channels...</p>
          </div>
        )}
        {!hasMore && channels.length > 0 && (
          <div className="no-more-results">
            <p>No more channels to load</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChannelResults

