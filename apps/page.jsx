import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { CurrencyProvider } from './context/CurrencyContext'
import { Toaster } from 'react-hot-toast'
import { cn } from './lib/utils'

// Import role-based route protection
import ProtectedRoute, { AdminRoute, ResellerRoute, DealerRoute, ClientRoute, PublicUserRoute } from './components/auth/ProtectedRoute'
import { USER_ROLES } from './utils/auth'

// Import the real pages
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import ResellersPage from './pages/resellers/ResellersPage'
import BalanceTopupManagementPage from './pages/balance/BalanceTopupManagementPage'
import UsersPageSimple from './pages/users/UsersPageSimple'
import OrdersPage from './pages/orders/OrdersPage'
import TransactionsPage from './pages/payments/TransactionsPage'
import ReportsPage from './pages/reports/ReportsPage'
import SettingsPage from './pages/settings/SettingsPageClean'
import BannerManagementPage from './pages/banners/BannerManagementPage'
import ConversionTrackingPage from './pages/admin_dashboard/ConversionTrackingPage'
import CreditManagementPage from './pages/credits/CreditManagementPage'
import DockSidebar from './components/common/DockSidebar/DockSidebar'

// Import reseller dashboard pages
import {
  ResellerDashboard,
  EditClientPage,
  AssignEsimPage,
  EsimCardPlansPage,
  AirHubPlansPage,
  ClientManagementPage,
  DealerManagementPage,
  EsimHistoryPage
} from './pages/resellers_dashboard'
// Flexnet disabled — client not using (re-enable import + routes below to restore)
// import FlexnetPlansPage from './pages/resellers_dashboard/FlexnetPlansPage'
import TgtPlansPage from './pages/resellers_dashboard/TgtPlansPage'
import ResellerLayout from './components/resellers_dashboard/ResellerLayout'
import SimConverterPage from './pages/resellers_dashboard/SimConverterPage'

// Import dealer dashboard pages
import {
  DealerDashboard,
  DealerBalance,
  DealerBrowse,
  DealerESIMs,
  DealerClientsPage,
  DealerOrders,
  DealerEsimCardPlansPage,
  DealerAirHubPlansPage,
} from './pages/dealer_dashboard'
// import DealerFlexnetPlansPage from './pages/dealer_dashboard/DealerFlexnetPlansPage'
import DealerTgtPlansPage from './pages/dealer_dashboard/DealerTgtPlansPage'
import DealerLayout from './components/dealer_dashboard/DealerLayout'
import DealerSimConverterPage from './pages/dealer_dashboard/DealerSimConverterPage'

// Import client dashboard pages
import {
  ClientDashboard
} from './pages/client_dashboard'

// Import test pages
import ApiTestPage from './pages/test/ApiTestPage'
import ClientManagementTest from './pages/test/ClientManagementTest'
import ResellerWorkflowTest from './pages/test/ResellerWorkflowTest'
import UserManagementTest from './pages/test/UserManagementTest'
import ComprehensiveIntegrationTest from './pages/test/ComprehensiveIntegrationTest'
import RoleBasedAuthTest from './pages/test/RoleBasedAuthTest'

// Import public pages
import EnhancedLandingPage from './pages/public/EnhancedLandingPage'
import RootHandler from './components/common/RootHandler'
import PackagesPage from './pages/public/PackagesPage'
import CheckoutPage from './pages/public/CheckoutPage'
import CheckoutSuccessPage from './pages/public/CheckoutSuccessPage'
import ContactPage from './pages/public/ContactPage'
import OurStoryPage from './pages/public/OurStoryPage'
import PaymentSuccess from './pages/payment/PaymentSuccess'

// Import public user dashboard pages
import {
  PublicUserDashboard,
  PublicUserEsims,
  PublicUserOrders,
  PublicUserProfile,
  PublicUserPurchase,
  PublicUserPurchaseSuccess,
  PublicUserPurchaseCancel,
  PublicUserSettings,
  PublicUserPayments,
  PublicUserBrowse
} from './pages/public_dashboard'
import PublicUserLayout from './components/public_dashboard/PublicUserLayout'

// Auto-redirect component
function AutoRedirect() {
  const { isAuthenticated, isLoading, defaultDashboard } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={defaultDashboard} replace />
  }

  return <Navigate to="/" replace />
}

// Layout component for pages with navigation
function DashboardLayout({ children }) {
  const { logout, user, roleDisplay } = useAuth()
  const { resolvedTheme } = useTheme()

  const handleLogout = async () => {
    await logout()
  }
  return (
    <div className="min-h-screen bg-background transition-colors duration-300 relative max-lg:[--mobile-nav-offset:4.25rem]">
      {/* Header - Fixed Position */}
      <header className={cn(
        'bg-card shadow-sm border-b border-border transition-colors duration-300 sticky top-0 z-40 backdrop-blur-lg',
        resolvedTheme === 'dark' ? 'bg-slate-800/80' : 'bg-white/80'
      )}>
        <div className="flex items-center justify-between px-2 xs:px-4 sm:px-6 py-3 xs:py-4">
          <div className="flex items-center space-x-2 xs:space-x-3 min-w-0 flex-1">
            <img 
              src="/roam2world-logo.svg" 
              alt="Roam2World" 
              className={`h-6 w-6 xs:h-8 xs:w-8 flex-shrink-0 ${resolvedTheme === 'dark' ? 'filter brightness-0 invert' : ''}`}
            />
            <h1 className="text-sm xs:text-base sm:text-xl font-semibold text-foreground truncate">
              <span className="xs:hidden">R2W</span>
              <span className="hidden xs:inline sm:hidden">Roam2World</span>
              <span className="hidden sm:inline">Roam2World Panel</span>
            </h1>
            <span className="hidden xs:inline px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20">
              {roleDisplay}
            </span>
          </div>
          <div className="flex items-center space-x-2 xs:space-x-4 flex-shrink-0">
            <span className="hidden sm:inline text-sm text-muted-foreground">
              Welcome, {user?.first_name || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground px-4 py-2 rounded hover:bg-destructive/90 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content — left inset on mobile for vertical nav rail */}
      <main className="relative z-10 max-lg:pl-16 p-6 pb-4 max-lg:pb-[max(1rem,env(safe-area-inset-bottom))] lg:pb-24">
        {children}
      </main>

      {/* Dock Sidebar */}
      <DockSidebar />
    </div>
  )
}

// Simple test components for remaining pages
const TestLogin = () => (
  <div className="min-h-screen bg-background flex items-center justify-center transition-colors duration-300">
    <div className="bg-card p-8 rounded-lg shadow-soft dark:shadow-dark-soft max-w-md w-full border border-border">
      <h1 className="text-2xl font-bold text-foreground mb-4">Login Page</h1>
      <p className="text-muted-foreground mb-4">This is the login page test.</p>
      <button
        onClick={() => window.location.href = '/dashboard'}
        className="w-full bg-primary text-primary-foreground py-2 px-4 rounded hover:bg-primary/90 transition-colors"
      >
        Go to Dashboard (Test)
      </button>
    </div>
  </div>
)

const TestDashboard = () => (
  <div className="min-h-screen bg-background p-6 transition-colors duration-300">
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg shadow-soft dark:shadow-dark-soft border border-border">
          <h3 className="text-lg font-semibold text-foreground">Total Users</h3>
          <p className="text-3xl font-bold text-primary">1,234</p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-soft dark:shadow-dark-soft border border-border">
          <h3 className="text-lg font-semibold text-foreground">Active Orders</h3>
          <p className="text-3xl font-bold text-success">567</p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-soft dark:shadow-dark-soft border border-border">
          <h3 className="text-lg font-semibold text-foreground">Revenue</h3>
          <p className="text-3xl font-bold text-primary">$89,012</p>
        </div>
      </div>
      <div className="mt-6">
        <nav className="flex space-x-4">
          <a href="/resellers" className="text-primary hover:text-primary/80 transition-colors">Resellers</a>
          <a href="/users" className="text-primary hover:text-primary/80 transition-colors">Users</a>
          <a href="/orders" className="text-primary hover:text-primary/80 transition-colors">Orders</a>
          <a href="/" className="text-destructive hover:text-destructive/80 transition-colors">Back to Login</a>
        </nav>
      </div>
    </div>
  </div>
)

const TestPage = ({ title }) => (
  <div className="min-h-screen bg-background p-6 transition-colors duration-300">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-6">{title}</h1>
      <div className="bg-card p-6 rounded-lg shadow-soft dark:shadow-dark-soft border border-border">
        <p className="text-muted-foreground mb-4">This is the {title.toLowerCase()} page.</p>
        <nav className="flex space-x-4">
          <a href="/dashboard" className="text-primary hover:text-primary/80 transition-colors">Dashboard</a>
          <a href="/resellers" className="text-primary hover:text-primary/80 transition-colors">Resellers</a>
          <a href="/users" className="text-primary hover:text-primary/80 transition-colors">Users</a>
          <a href="/orders" className="text-primary hover:text-primary/80 transition-colors">Orders</a>
          <a href="/" className="text-destructive hover:text-destructive/80 transition-colors">Back to Login</a>
        </nav>
      </div>
    </div>
  </div>
)

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <AuthProvider>
            <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<RootHandler />} />
            <Route path="/home" element={<EnhancedLandingPage />} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="/packages/:countryCode" element={<PackagesPage />} />
            <Route path="/checkout/:countryCode" element={<CheckoutPage />} />
            <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
            <Route path="/checkout/cancel" element={<CheckoutPage />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/our-story" element={<OurStoryPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Forgot Password Route */}
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            {/* Admin Dashboard Routes - Protected for Admin users only */}
            <Route path="/dashboard" element={
              <AdminRoute>
                <DashboardLayout><DashboardPage /></DashboardLayout>
              </AdminRoute>
            } />
            <Route path="/resellers" element={
              <AdminRoute>
                <DashboardLayout><ResellersPage /></DashboardLayout>
              </AdminRoute>
            } />
            <Route path="/balance-topups" element={
              <AdminRoute>
                <DashboardLayout><BalanceTopupManagementPage /></DashboardLayout>
              </AdminRoute>
            } />
            <Route path="/users" element={
              <AdminRoute>
                <DashboardLayout><UsersPageSimple /></DashboardLayout>
              </AdminRoute>
            } />
            <Route path="/orders" element={
              <AdminRoute>
                <DashboardLayout><OrdersPage /></DashboardLayout>
              </AdminRoute>
            } />
            <Route path="/transactions" element={
              <AdminRoute>
                <DashboardLayout><TransactionsPage /></DashboardLayout>
              </AdminRoute>
            } />
            <Route path="/reports" element={
              <AdminRoute>
                <DashboardLayout><ReportsPage /></DashboardLayout>
              </AdminRoute>
            } />
            <Route path="/conversion-tracking" element={
              <AdminRoute>
                <DashboardLayout><ConversionTrackingPage /></DashboardLayout>
              </AdminRoute>
            } />
            <Route path="/banners" element={
              <AdminRoute>
                <DashboardLayout><BannerManagementPage /></DashboardLayout>
              </AdminRoute>
            } />
            <Route path="/credits" element={
              <AdminRoute>
                <DashboardLayout><CreditManagementPage /></DashboardLayout>
              </AdminRoute>
            } />
            <Route path="/settings" element={
              <AdminRoute>
                <DashboardLayout><SettingsPage /></DashboardLayout>
              </AdminRoute>
            } />
            
            {/* Reseller Dashboard Routes - Protected for Reseller users only */}
            <Route path="/reseller-dashboard" element={
              <ResellerRoute>
                <ResellerLayout><ResellerDashboard /></ResellerLayout>
              </ResellerRoute>
            } />

            <Route path="/reseller-dashboard/assign-esim" element={
              <ResellerRoute>
                <ResellerLayout><AssignEsimPage /></ResellerLayout>
              </ResellerRoute>
            } />
            <Route path="/reseller-dashboard/esimcard-plans" element={
              <ResellerRoute>
                <ResellerLayout><EsimCardPlansPage /></ResellerLayout>
              </ResellerRoute>
            } />
            <Route path="/reseller-dashboard/airhub-plans" element={
              <ResellerRoute>
                <ResellerLayout><AirHubPlansPage /></ResellerLayout>
              </ResellerRoute>
            } />
            {/* Flexnet plans — disabled
            <Route path="/reseller-dashboard/flexnet-plans" element={
              <ResellerRoute>
                <ResellerLayout><FlexnetPlansPage /></ResellerLayout>
              </ResellerRoute>
            } />
            */}
            <Route path="/reseller-dashboard/tgt-plans" element={
              <ResellerRoute>
                <ResellerLayout><TgtPlansPage /></ResellerLayout>
              </ResellerRoute>
            } />
            <Route path="/reseller-dashboard/clients" element={
              <ResellerRoute>
                <ResellerLayout><ClientManagementPage /></ResellerLayout>
              </ResellerRoute>
            } />
            <Route path="/reseller-dashboard/dealers" element={
              <ResellerRoute>
                <ResellerLayout><DealerManagementPage /></ResellerLayout>
              </ResellerRoute>
            } />
            <Route path="/reseller-dashboard/edit-client/:id" element={
              <ResellerRoute>
                <ResellerLayout><EditClientPage /></ResellerLayout>
              </ResellerRoute>
            } />
            <Route path="/reseller-dashboard/history" element={
              <ResellerRoute>
                <ResellerLayout><EsimHistoryPage /></ResellerLayout>
              </ResellerRoute>
            } />
            <Route path="/reseller-dashboard/sim-converter" element={
              <ResellerRoute>
                <ResellerLayout><SimConverterPage /></ResellerLayout>
              </ResellerRoute>
            } />
            <Route path="/reseller-dashboard/reports" element={
              <ResellerRoute>
                <ResellerLayout>
                  <ReportsPage isResellerView={true} />
                </ResellerLayout>
              </ResellerRoute>
            } />
            
            {/* Dealer Dashboard Routes - Protected for Dealer users only */}
            <Route path="/dealer-dashboard" element={
              <DealerRoute>
                <DealerLayout><DealerDashboard /></DealerLayout>
              </DealerRoute>
            } />

            <Route path="/dealer-dashboard/balance" element={
              <DealerRoute>
                <DealerLayout><DealerBalance /></DealerLayout>
              </DealerRoute>
            } />

            <Route path="/dealer-dashboard/browse" element={
              <DealerRoute>
                <DealerLayout><DealerBrowse /></DealerLayout>
              </DealerRoute>
            } />

            <Route path="/dealer-dashboard/esimcard-plans" element={
              <DealerRoute>
                <DealerLayout><DealerEsimCardPlansPage /></DealerLayout>
              </DealerRoute>
            } />

            <Route path="/dealer-dashboard/airhub-plans" element={
              <DealerRoute>
                <DealerLayout><DealerAirHubPlansPage /></DealerLayout>
              </DealerRoute>
            } />
            {/* Flexnet plans — disabled
            <Route path="/dealer-dashboard/flexnet-plans" element={
              <DealerRoute>
                <DealerLayout><DealerFlexnetPlansPage /></DealerLayout>
              </DealerRoute>
            } />
            */}
            <Route path="/dealer-dashboard/tgt-plans" element={
              <DealerRoute>
                <DealerLayout><DealerTgtPlansPage /></DealerLayout>
              </DealerRoute>
            } />

            <Route path="/dealer-dashboard/esims" element={
              <DealerRoute>
                <DealerLayout><DealerESIMs /></DealerLayout>
              </DealerRoute>
            } />

            <Route path="/dealer-dashboard/orders" element={
              <DealerRoute>
                <DealerLayout><DealerOrders /></DealerLayout>
              </DealerRoute>
            } />
            <Route path="/dealer-dashboard/clients" element={
              <DealerRoute>
                <DealerLayout><DealerClientsPage /></DealerLayout>
              </DealerRoute>
            } />
            <Route path="/dealer-dashboard/profile" element={
              <DealerRoute>
                <DealerLayout>
                  <PublicUserProfile isDealerView={true} />
                </DealerLayout>
              </DealerRoute>
            } />

            <Route path="/dealer-dashboard/settings" element={
              <DealerRoute>
                <DealerLayout>
                  <PublicUserSettings isDealerView={true} />
                </DealerLayout>
              </DealerRoute>
            } />
            <Route path="/dealer-dashboard/sim-converter" element={
              <DealerRoute>
                <DealerLayout><DealerSimConverterPage /></DealerLayout>
              </DealerRoute>
            } />
            <Route path="/dealer-dashboard/reports" element={
              <DealerRoute>
                <DealerLayout>
                  <ReportsPage isDealerView={true} />
                </DealerLayout>
              </DealerRoute>
            } />
            
            {/* Client Dashboard Routes - Protected for Client users only */}
            <Route path="/client-dashboard" element={
              <ClientRoute>
                <DashboardLayout><ClientDashboard /></DashboardLayout>
              </ClientRoute>
            } />

            <Route path="/client-dashboard/esims" element={
              <ClientRoute>
                <DashboardLayout>
                  <PublicUserEsims isClientView={true} />
                </DashboardLayout>
              </ClientRoute>
            } />

            <Route path="/client-dashboard/orders" element={
              <ClientRoute>
                <DashboardLayout>
                  <PublicUserOrders isClientView={true} />
                </DashboardLayout>
              </ClientRoute>
            } />
            <Route path="/client-dashboard/reports" element={
              <ClientRoute>
                <DashboardLayout>
                  <ReportsPage isClientView={true} />
                </DashboardLayout>
              </ClientRoute>
            } />
            
            {/* Test Pages - Protected for Admin users only */}
            <Route path="/test/api" element={
              <AdminRoute>
                <DashboardLayout><ApiTestPage /></DashboardLayout>
              </AdminRoute>
            } />
            <Route path="/test/client-management" element={
              <AdminRoute>
                <DashboardLayout><ClientManagementTest /></DashboardLayout>
              </AdminRoute>
            } />
            <Route path="/test/reseller-workflow" element={
              <AdminRoute>
                <DashboardLayout><ResellerWorkflowTest /></DashboardLayout>
              </AdminRoute>
            } />
            <Route path="/test/user-management" element={
              <AdminRoute>
                <DashboardLayout><UserManagementTest /></DashboardLayout>
              </AdminRoute>
            } />
            <Route path="/test/comprehensive" element={
              <AdminRoute>
                <DashboardLayout><ComprehensiveIntegrationTest /></DashboardLayout>
              </AdminRoute>
            } />
            <Route path="/test/role-auth" element={
              <ProtectedRoute>
                <DashboardLayout><RoleBasedAuthTest /></DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Public User Dashboard Routes - Protected for Public User role only */}
            <Route path="/public-dashboard" element={
              <PublicUserRoute>
                <PublicUserLayout><PublicUserDashboard /></PublicUserLayout>
              </PublicUserRoute>
            } />
            <Route path="/public-dashboard/esims" element={
              <PublicUserRoute>
                <PublicUserLayout><PublicUserEsims /></PublicUserLayout>
              </PublicUserRoute>
            } />
            <Route path="/public-dashboard/orders" element={
              <PublicUserRoute>
                <PublicUserLayout><PublicUserOrders /></PublicUserLayout>
              </PublicUserRoute>
            } />
            <Route path="/public-dashboard/profile" element={
              <PublicUserRoute>
                <PublicUserLayout><PublicUserProfile /></PublicUserLayout>
              </PublicUserRoute>
            } />
            <Route path="/public-dashboard/purchase" element={
              <PublicUserRoute>
                <PublicUserLayout><PublicUserPurchase /></PublicUserLayout>
              </PublicUserRoute>
            } />
            <Route path="/public-dashboard/purchase-success" element={
              <ProtectedRoute requireAuth={false}>
                <PublicUserLayout><PublicUserPurchaseSuccess /></PublicUserLayout>
              </ProtectedRoute>
            } />
            <Route path="/public-dashboard/purchase-cancel" element={
              <PublicUserRoute>
                <PublicUserLayout><PublicUserPurchaseCancel /></PublicUserLayout>
              </PublicUserRoute>
            } />
            <Route path="/public-dashboard/settings" element={
              <PublicUserRoute>
                <PublicUserLayout><PublicUserSettings /></PublicUserLayout>
              </PublicUserRoute>
            } />
            <Route path="/public-dashboard/payments" element={
              <PublicUserRoute>
                <PublicUserLayout><PublicUserPayments /></PublicUserLayout>
              </PublicUserRoute>
            } />
            <Route path="/public-dashboard/reports" element={
              <PublicUserRoute>
                <PublicUserLayout>
                  <ReportsPage isClientView={true} />
                </PublicUserLayout>
              </PublicUserRoute>
            } />
            <Route path="/public-dashboard/browse" element={
              <PublicUserRoute>
                <PublicUserLayout><PublicUserBrowse /></PublicUserLayout>
              </PublicUserRoute>
            } />

            {/* Auto-redirect to appropriate dashboard for authenticated users */}
            <Route path="/dashboard-redirect" element={<AutoRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'bg-card text-card-foreground border border-border shadow-soft dark:shadow-dark-soft',
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                borderColor: 'hsl(var(--border))',
              },
            }}
          />
            </Router>
          </AuthProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}



export default App
