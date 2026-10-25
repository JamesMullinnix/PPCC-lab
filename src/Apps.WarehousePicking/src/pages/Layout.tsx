import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { Subtitle1, Tab, TabList, mergeClasses } from "@fluentui/react-components"
import { BoxRegular, ArrowSwapRegular, HomeRegular, LocationRegular } from "@fluentui/react-icons"
import type { ReactElement } from "react"
import { useStyles } from "@/styles/Layout.styles"

function selectedTab(pathname: string) {
  if (pathname === "/") return "/"
  if (pathname.startsWith("/items")) return "/items"
  if (pathname.startsWith("/transactions")) return "/transactions"
  if (pathname.startsWith("/locations")) return "/locations"
  return "/"
}

type NavEntry = { path: string; label: string; icon: ReactElement }

const NAV: NavEntry[] = [
  { path: "/", label: "Home", icon: <HomeRegular /> },
  { path: "/items", label: "Items", icon: <BoxRegular /> },
  { path: "/transactions", label: "Transactions", icon: <ArrowSwapRegular /> },
  { path: "/locations", label: "Locations", icon: <LocationRegular /> },
]

type LayoutProps = { showHeader?: boolean }

export default function Layout({ showHeader = true }: LayoutProps) {
  const styles = useStyles()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const selected = selectedTab(pathname)

  return (
    <div className={styles.root}>
      {showHeader && (
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Subtitle1>Warehouse Picking</Subtitle1>
            <TabList
              className={styles.topTabs}
              selectedValue={selected}
              onTabSelect={(_, data) => navigate(String(data.value))}
            >
              {NAV.map((entry) => (
                <Tab
                  key={entry.path}
                  value={entry.path}
                  icon={entry.icon}
                  className={entry.path === "/items" ? styles.afterHome : undefined}
                >
                  {entry.label}
                </Tab>
              ))}
            </TabList>
          </div>
        </header>
      )}

      <main className={mergeClasses(styles.main, showHeader && styles.mainWithBottomNav)}>
        <Outlet />
      </main>

      {showHeader && (
        <nav className={styles.bottomNav} aria-label="Main">
          {NAV.map((entry) => (
            <button
              key={entry.path}
              type="button"
              className={mergeClasses(
                styles.bottomItem,
                entry.path === "/items" && styles.bottomAfterHome,
                selected === entry.path && styles.bottomItemSelected
              )}
              aria-current={selected === entry.path ? "page" : undefined}
              onClick={() => navigate(entry.path)}
            >
              <span className={styles.bottomIcon}>{entry.icon}</span>
              <span>{entry.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}

