import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#f5f6fa', fontFamily: 'system-ui, sans-serif', padding: '24px',
        }}>
          <div style={{
            background: 'white', borderRadius: '12px', padding: '32px',
            maxWidth: '500px', width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <h2 style={{ color: '#e53935', marginBottom: '12px' }}>Something went wrong</h2>
            <pre style={{
              background: '#fff3e0', padding: '12px', borderRadius: '8px',
              fontSize: '13px', overflowX: 'auto', whiteSpace: 'pre-wrap',
            }}>
              {this.state.error?.message}
            </pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
