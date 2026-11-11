import OmniFlowMark from './OmniFlowMark';

export default function EncabezadoPrincipal() {
  return (
    <header
      style={{
        padding: '20px',
        background: '#fff',
        borderBottom: '1px solid #eee',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <OmniFlowMark style={{ width: '38px', height: '38px' }} />
        <h1
          style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: 800,
            letterSpacing: '-0.06em',
          }}
        >
          <span style={{ color: '#1e3a8a' }}>Omni</span>
          <span style={{ color: '#3b82f6' }}>Flow</span>
        </h1>
      </div>
    </header>
  );
}
