import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import { TRPCProvider } from "@/providers/trpc"
import { IconContext } from "@phosphor-icons/react"
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TRPCProvider>
        <IconContext.Provider value={{ weight: "bold", size: 20 }}>
          <App />
        </IconContext.Provider>
      </TRPCProvider>
    </BrowserRouter>
  </StrictMode>,
)
