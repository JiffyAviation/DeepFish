<div style={{
  minHeight: '100vh',
  background: '#000',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: '20px'
}}>
  <h1 style={{ fontSize: '48px', color: '#00d4ff' }}>🚧 AI Studio Coming Soon</h1>
  <p style={{ color: '#888' }}>The DeepFish AI Studio is under construction</p>
  <a href="/" style={{ color: '#00d4ff', textDecoration: 'none' }}>← Back to Home</a>
</div>
          }
        />

{/* Catch all - redirect to home */ }
<Route
  path="*"
  element={<Navigate to="/" replace />}
/>
      </Routes >
    </Router >
  );
}

export default App;
