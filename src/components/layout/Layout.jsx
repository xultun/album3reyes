import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import WelcomePopup from './WelcomePopup'

export default function Layout() {
  return (
    <div className="app-layout">
      <Header />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
      <WelcomePopup />
    </div>
  )
}
