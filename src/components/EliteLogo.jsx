export default function EliteLogo({ size = 40, className = "" }) {
  return (
    <div 
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.25,
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(79, 70, 229, 0.3)',
        overflow: 'hidden'
      }}
    >
      <div style={{
        position: 'absolute',
        inset: 2,
        borderRadius: (size - 4) * 0.25,
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #f472b6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <span style={{
          color: 'white',
          fontSize: size * 0.4,
          fontWeight: 900,
          letterSpacing: '-0.05em',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          E
        </span>
      </div>
    </div>
  )
}