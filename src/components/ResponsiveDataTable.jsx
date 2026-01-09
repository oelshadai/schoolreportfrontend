import React, { useState, useEffect } from 'react'
import { FaChevronDown, FaEllipsisV } from 'react-icons/fa'

/**
 * ResponsiveDataTable Component
 * Mobile-First Data Display
 * 
 * Features:
 * - Desktop: Full table with sorting/filtering
 * - Mobile: Card-based layout with collapsible details
 * - Touch-optimized actions
 * - Fully responsive
 */
export function ResponsiveDataTable({
  columns = [],
  data = [],
  onEdit = () => {},
  onDelete = () => {},
  onAction = () => {},
  searchable = false,
  sortable = true,
  actions = []
}) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640)
  const [expandedRows, setExpandedRows] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: columns[0]?.key, direction: 'asc' })
  const [filteredData, setFilteredData] = useState(data)
  const [showActionMenu, setShowActionMenu] = useState({})

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 640)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Filter and sort data
  useEffect(() => {
    let processed = [...data]

    // Search filter
    if (searchTerm && searchable) {
      processed = processed.filter(row =>
        columns.some(col =>
          String(row[col.key]).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Sorting
    if (sortConfig.key && sortable) {
      processed.sort((a, b) => {
        const aVal = a[sortConfig.key]
        const bVal = b[sortConfig.key]
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    setFilteredData(processed)
  }, [data, searchTerm, sortConfig, searchable, sortable, columns])

  const toggleRowExpand = (rowId) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }))
  }

  const formatValue = (value, columnType) => {
    if (!value) return '-'
    if (columnType === 'date') {
      return new Date(value).toLocaleDateString()
    }
    if (columnType === 'number') {
      return parseFloat(value).toFixed(2)
    }
    return value
  }

  // MOBILE VIEW - Card Layout
  if (isMobile) {
    return (
      <div style={{ padding: 'var(--space-2)' }}>
        {/* Search bar */}
        {searchable && (
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
              style={{
                width: '100%',
                padding: 'var(--space-2) var(--space-3)',
                fontSize: 'var(--text-sm)',
                minHeight: '44px'
              }}
            />
          </div>
        )}

        {/* Card List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {filteredData.length === 0 ? (
            <div style={{
              padding: 'var(--space-6) var(--space-4)',
              textAlign: 'center',
              color: 'var(--text-tertiary)',
              backgroundColor: 'var(--surface-bg)',
              borderRadius: 'var(--radius-lg)'
            }}>
              No data found
            </div>
          ) : (
            filteredData.map((row, idx) => {
              const rowId = `row-${idx}`
              const isExpanded = expandedRows[rowId]

              return (
                <div
                  key={rowId}
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Card Header - Main Info */}
                  <div
                    onClick={() => toggleRowExpand(rowId)}
                    style={{
                      padding: 'var(--space-3) var(--space-4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      backgroundColor: 'var(--surface-bg)',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-bg)'}
                  >
                    <div style={{ flex: 1 }}>
                      {columns.slice(0, 2).map(col => (
                        <div key={col.key} style={{ marginBottom: '4px' }}>
                          <div style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--text-tertiary)',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            {col.label}
                          </div>
                          <div style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--text-primary)',
                            fontWeight: 500
                          }}>
                            {formatValue(row[col.key], col.type)}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Expand indicator */}
                    <FaChevronDown
                      size={16}
                      style={{
                        color: 'var(--text-tertiary)',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        marginLeft: 'var(--space-2)'
                      }}
                    />
                  </div>

                  {/* Card Body - Expandable Details */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: 'var(--space-4)',
                        borderTop: '1px solid var(--border-color)',
                        backgroundColor: 'var(--card-bg)',
                        animation: 'slideDown 0.2s ease-out'
                      }}
                    >
                      {/* All Fields */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                        {columns.map(col => (
                          <div key={col.key}>
                            <div style={{
                              fontSize: 'var(--text-xs)',
                              color: 'var(--text-tertiary)',
                              fontWeight: 600,
                              marginBottom: '4px'
                            }}>
                              {col.label}
                            </div>
                            <div style={{
                              fontSize: 'var(--text-sm)',
                              color: 'var(--text-primary)',
                              wordBreak: 'break-word'
                            }}>
                              {formatValue(row[col.key], col.type)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      {(actions.length > 0) && (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                          gap: 'var(--space-2)',
                          paddingTop: 'var(--space-3)',
                          borderTop: '1px solid var(--border-color)'
                        }}>
                          {actions.map(action => (
                            <button
                              key={action.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                action.onClick(row, idx)
                              }}
                              style={{
                                padding: 'var(--space-2) var(--space-3)',
                                backgroundColor: action.color === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(17, 94, 61, 0.1)',
                                color: action.color === 'danger' ? '#ef4444' : '#115e3d',
                                border: 'none',
                                borderRadius: 'var(--radius)',
                                cursor: 'pointer',
                                fontSize: 'var(--text-xs)',
                                fontWeight: 600,
                                transition: 'all 0.2s ease',
                                minHeight: '44px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = action.color === 'danger' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(17, 94, 61, 0.2)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = action.color === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(17, 94, 61, 0.1)'
                              }}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }

  // DESKTOP VIEW - Table Layout
  return (
    <div style={{ padding: 'var(--space-4)' }}>
      {/* Search bar */}
      {searchable && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
            style={{
              width: '100%',
              padding: 'var(--space-2) var(--space-3)',
              fontSize: 'var(--text-sm)',
              minHeight: '44px'
            }}
          />
        </div>
      )}

      {/* Table */}
      <div style={{
        overflowX: 'auto',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <table className="table" style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-bg)' }}>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => {
                    if (sortable) {
                      setSortConfig({
                        key: col.key,
                        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
                      })
                    }
                  }}
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    textAlign: 'left',
                    fontWeight: 700,
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: sortable ? 'pointer' : 'default',
                    backgroundColor: sortConfig.key === col.key ? 'var(--bg-tertiary)' : 'transparent',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (sortable) e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
                  }}
                  onMouseLeave={(e) => {
                    if (sortable) e.currentTarget.style.backgroundColor = sortConfig.key === col.key ? 'var(--bg-tertiary)' : 'transparent'
                  }}
                >
                  {col.label} {sortConfig.key === col.key && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                </th>
              ))}
              {actions.length > 0 && (
                <th style={{
                  padding: 'var(--space-3) var(--space-4)',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase'
                }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  style={{
                    padding: 'var(--space-6) var(--space-4)',
                    textAlign: 'center',
                    color: 'var(--text-tertiary)',
                    backgroundColor: 'var(--surface-bg)'
                  }}
                >
                  No data found
                </td>
              </tr>
            ) : (
              filteredData.map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      style={{
                        padding: 'var(--space-3) var(--space-4)',
                        color: 'var(--text-primary)',
                        fontSize: 'var(--text-sm)',
                        maxWidth: col.maxWidth || 'auto',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={String(row[col.key])}
                    >
                      {formatValue(row[col.key], col.type)}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td style={{
                      padding: 'var(--space-3) var(--space-4)',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        position: 'relative',
                        display: 'flex',
                        gap: 'var(--space-2)',
                        justifyContent: 'center'
                      }}>
                        {actions.map(action => (
                          <button
                            key={action.id}
                            onClick={() => action.onClick(row, idx)}
                            style={{
                              padding: 'var(--space-2) var(--space-3)',
                              backgroundColor: action.color === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(17, 94, 61, 0.1)',
                              color: action.color === 'danger' ? '#ef4444' : '#115e3d',
                              border: 'none',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              fontSize: 'var(--text-xs)',
                              fontWeight: 600,
                              transition: 'all 0.2s ease',
                              minHeight: '36px',
                              minWidth: '60px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = action.color === 'danger' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(17, 94, 61, 0.2)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = action.color === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(17, 94, 61, 0.1)'
                            }}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 1000px;
          }
        }
      `}</style>
    </div>
  )
}

export default ResponsiveDataTable
