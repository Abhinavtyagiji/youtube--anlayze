import './ChannelCard.css'

function ChannelCard({ channel }) {
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="channel-card">
      <div className="channel-header">
        <img 
          src={channel.thumbnail} 
          alt={channel.title}
          className="channel-thumbnail"
        />
        <div className="channel-info">
          <h3 className="channel-title">{channel.title}</h3>
          {channel.customUrl && (
            <a 
              href={`https://youtube.com/${channel.customUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="channel-link"
            >
              {channel.customUrl}
            </a>
          )}
        </div>
      </div>

      <div className="channel-stats">
        <div className="stat-item">
          <span className="stat-label">Subscribers:</span>
          <span className="stat-value">{formatNumber(channel.subscriberCount)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Country:</span>
          <span className="stat-value">{channel.country}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Videos:</span>
          <span className="stat-value">{formatNumber(channel.videoCount)}</span>
        </div>
      </div>

      {channel.email && (
        <div className="channel-email">
          <span className="email-label">📧 Email:</span>
          <a href={`mailto:${channel.email}`} className="email-link">
            {channel.email}
          </a>
        </div>
      )}

      {channel.description && (
        <div className="channel-description">
          <p>{channel.description.substring(0, 150)}...</p>
        </div>
      )}

      {channel.videos && channel.videos.length > 0 && (
        <div className="channel-videos">
          <h4 className="videos-header">Last 5 Videos</h4>
          <div className="videos-list">
            {channel.videos.map((video, index) => (
              <div key={video.id} className="video-item">
                <div className="video-number">{index + 1}</div>
                <div className="video-details">
                  <h5 className="video-title">{video.title}</h5>
                  <div className="video-meta">
                    <span className="video-views">👁️ {formatNumber(video.views)} views</span>
                    <span className="video-date">📅 {formatDate(video.publishedAt)}</span>
                  </div>
                  {video.tags && video.tags.length > 0 && (
                    <div className="video-tags">
                      <span className="tags-label">Topics:</span>
                      <div className="tags-list">
                        {video.tags.slice(0, 5).map((tag, i) => (
                          <span key={i} className="tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!channel.videos || channel.videos.length === 0) && (
        <div className="no-videos">
          <p>No videos found for this channel</p>
        </div>
      )}
    </div>
  )
}

export default ChannelCard

