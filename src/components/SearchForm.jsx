import { useState } from 'react'
import './SearchForm.css'

function SearchForm({ onSearch, loading, targetCount, setTargetCount }) {
  const [apiKey, setApiKey] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!apiKey.trim() || !searchQuery.trim()) {
      alert('Please enter both API key and search query')
      return
    }
    onSearch(apiKey.trim(), searchQuery.trim())
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="apiKey">YouTube API Key</label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your YouTube Data API v3 key"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="searchQuery">Search Query</label>
          <input
            type="text"
            id="searchQuery"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g., Indian stock market"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="targetCount">Target Count</label>
          <select
            id="targetCount"
            value={targetCount}
            onChange={(e) => setTargetCount(Number(e.target.value))}
            disabled={loading}
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={150}>150</option>
            <option value={200}>200</option>
            <option value={250}>250</option>
            <option value={500}>500</option>
            <option value={1000}>1,000</option>
            <option value={2500}>2,500</option>
            <option value={5000}>5,000</option>
            <option value={10000}>10,000</option>
            <option value={25000}>25,000</option>
            <option value={50000}>50,000 (50K)</option>
            <option value={100000}>1,00,000 (1 Lakh)</option>
            <option value={200000}>2,00,000 (2 Lakh)</option>
            <option value={500000}>5,00,000 (5 Lakh)</option>
            <option value={1000000}>10,00,000 (10 Lakh)</option>
          </select>
        </div>
      </div>

      <button type="submit" className="search-button" disabled={loading}>
        {loading ? 'Extracting...' : 'Start Extraction'}
      </button>
    </form>
  )
}

export default SearchForm
