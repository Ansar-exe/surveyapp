export default function BSOD({ error, onRestart }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#000080',
      color: '#fff',
      fontFamily: 'monospace',
      fontSize: 14,
      padding: '40px 60px',
      zIndex: 99998,
      overflow: 'auto',
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{
          background: '#aaaaaa', color: '#000080',
          padding: '4px 12px', display: 'inline-block',
          fontWeight: 'bold', marginBottom: 24, fontSize: 15,
        }}>
          Windows
        </div>

        <p style={{ marginBottom: 20, lineHeight: 1.7 }}>
          A fatal exception <span style={{ background: '#fff', color: '#000080', padding: '0 4px' }}>0E</span> has
          occurred at <span style={{ background: '#fff', color: '#000080', padding: '0 4px' }}>0028:C0534A4F</span>.
          The current application will be terminated.
        </p>

        <p style={{ marginBottom: 8 }}>
          * Press any key to terminate the current application.
        </p>
        <p style={{ marginBottom: 24 }}>
          * Press CTRL+ALT+DELETE again to restart your computer. You will lose any unsaved information in all applications.
        </p>

        {error && (
          <p style={{ marginBottom: 24, color: '#ffff00', fontSize: 12 }}>
            Error details: {error}
          </p>
        )}

        <div style={{
          border: '1px solid #aaa', padding: '8px 12px',
          marginBottom: 24, fontSize: 12, color: '#ccc',
        }}>
          SURVEYPRO98 caused a General Protection Fault in module BACKEND.DLL<br />
          Error: 0x0000500 SERVER_UNAVAILABLE
        </div>

        <button
          onClick={onRestart}
          style={{
            background: '#aaa', color: '#000', border: '2px solid',
            borderColor: '#fff #555 #555 #fff',
            padding: '6px 24px', fontFamily: 'monospace',
            fontSize: 13, cursor: 'pointer', fontWeight: 'bold',
          }}
        >
          Press any key to continue _
        </button>
      </div>
    </div>
  );
}
