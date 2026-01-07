import { createContext, useContext, useState, useEffect } from 'react'

const SidebarContext = createContext()

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

export const SidebarProvider = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Apply body class for sidebar state
  useEffect(() => {
    if (window.innerWidth > 768) {
      document.body.classList.toggle('sidebar-collapsed', sidebarCollapsed)
    }
  }, [sidebarCollapsed])

  const value = {
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebar: () => setSidebarCollapsed(prev => !prev)
  }

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  )
}