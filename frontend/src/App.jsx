import { useState } from 'react'
import Wizard from './components/Wizard/Wizard'
import Header from './components/Layout/Header'
import Footer from './components/Layout/Footer'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Wizard />
      </main>
      
      <Footer />
    </div>
  )
}

export default App
