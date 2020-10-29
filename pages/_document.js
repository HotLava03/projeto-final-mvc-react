import React from 'react'
import Document, { Head, Main, NextScript } from 'next/document'

class MythicPanelDocument extends Document {
  render () {
    return (
      <html lang='en' dir='ltr'>
        <Head>
          <meta charSet='utf-8' />
          <meta
            name='viewport'
            content='user-scalable=0, initial-scale=1,
            minimum-scale=1, width=device-width, height=device-height'
          />
          <meta name='description' content='Projeto Final MVC - React.' />
          <title>Mythic Panel</title>
          <meta name='theme-color' content='#ff8c00' />
          <meta property='og:type' content='website' />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}

export default MythicPanelDocument