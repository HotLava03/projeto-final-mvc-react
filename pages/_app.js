import React from 'react'
import App from 'next/app'
import '../imports/style.css'

class ProjetoFinalApp extends App {
  render() {
    const { Component, pageProps } = this.props
    return (
      <>
        <React.StrictMode>
          <Component {...pageProps} />
        </React.StrictMode>
      </>
    )
  }
}

export default ProjetoFinalApp