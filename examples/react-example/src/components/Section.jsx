import React from 'react'

function Section({ title, description, children }) {
  return (
    <div className="section">
      <h2 className="section-title">{title}</h2>
      {description && <p className="section-description">{description}</p>}
      <div className="section-content">
        {children}
      </div>
    </div>
  )
}

export default Section

