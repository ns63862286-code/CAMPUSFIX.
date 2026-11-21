/**
 * CampusFix - Main React Application
 */
function App() {
  const [user, setUser] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('feed'); // 'feed', 'analytics', 'admin', 'my-tickets'
  const [complaints, setComplaints] = React.useState([]);
  const [overviewStats, setOverviewStats] = React.useState(null);
  const [loadingComplaints, setLoadingComplaints] = React.useState(true);

  // Filters
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [priorityFilter, setPriorityFilter] = React.useState('all');
  const [sortOrder, setSortOrder] = React.useState('newest');

  // Modals & Drawers
  const [isReportOpen, setIsReportOpen] = React.useState(false);
  const [isAuthOpen, setIsAuthOpen] = React.useState(false);
  const [selectedTicketId, setSelectedTicketId] = React.useState(null);

  // Toasts
  const [toasts, setToasts] = React.useState([]);

  const addToast = (title, message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initialize Auth & Data
  React.useEffect(() => {
    const init = async () => {
      // 1. Check existing user
      try {
        const u = await window.cfApi.getMe();
        if (u) setUser(u);
      } catch (e) {}

      // 2. Fetch complaints and stats
      fetchComplaints();
      fetchOverview();
    };

    init();

    // Listen for custom trigger from unauthenticated upvotes
    const handleOpenAuth = () => {
      setIsAuthOpen(true);
      addToast('Sign In Required', 'Please sign in or use a 1-click Demo Role to upvote issues.', 'warning');
    };
    window.addEventListener('cf_open_auth', handleOpenAuth);
    return () => window.removeEventListener('cf_open_auth', handleOpenAuth);
  }, []);

  // Fetch complaints with filters
  const fetchComplaints = async () => {
    setLoadingComplaints(true);
    try {
      const params = {
        search,
        status: statusFilter,
        category: categoryFilter,
        priority: priorityFilter,
        sort: sortOrder,
        mine: activeTab === 'my-tickets' ? 'true' : undefined
      };
      const res = await window.cfApi.getComplaints(params);
      if (res && res.complaints) {
        setComplaints(res.complaints);
      }
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
      addToast('Sync Error', 'Failed to retrieve tickets.', 'error');
    } finally {
      setLoadingComplaints(false);
    }
  };

  // Fetch overview KPI
  const fetchOverview = async () => {
    try {
      const stats = await window.cfApi.getAnalyticsOverview();
      if (stats) setOverviewStats(stats);
    } catch (err) {
      console.error('Failed to fetch overview stats:', err);
    }
  };

  // Refresh when filters or tab change
  React.useEffect(() => {
    if (activeTab === 'feed' || activeTab === 'my-tickets') {
      fetchComplaints();
    }
  }, [search, statusFilter, categoryFilter, priorityFilter, sortOrder, activeTab]);

  // Auth Handlers
  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    addToast('Welcome to CampusFix!', `Signed in as ${authenticatedUser.name} (${authenticatedUser.role.toUpperCase()})`, 'success');
    fetchComplaints();
    fetchOverview();
  };

  const handleLogout = () => {
    window.cfApi.logout();
    setUser(null);
    if (activeTab === 'my-tickets' || activeTab === 'admin') {
      setActiveTab('feed');
    }
    addToast('Logged Out', 'You have been signed out successfully.', 'info');
    fetchComplaints();
  };

  const handleQuickDemoLogin = async (demoEmail, demoPass) => {
    try {
      const res = await window.cfApi.login(demoEmail, demoPass);
      setUser(res.user);
      addToast('Demo Activated', `Switched role to ${res.user.name} (${res.user.role.toUpperCase()})`, 'success');
      fetchComplaints();
      fetchOverview();
    } catch (err) {
      addToast('Demo Login Error', err.message, 'error');
    }
  };

  // Complaint Submission Callback
  const handleComplaintSubmitted = (newTicket) => {
    addToast(
      'Issue Reported Successfully!',
      `Ticket ${newTicket.ticket_number} logged and queued for campus maintenance dispatch.`,
      'success'
    );
    fetchComplaints();
    fetchOverview();
  };

  // Status Updated Callback
  const handleStatusUpdated = (updatedTicket) => {
    addToast('Ticket Updated', `Ticket ${updatedTicket.ticket_number} is now "${updatedTicket.status}".`, 'info');
    fetchComplaints();
    fetchOverview();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenReport={() => {
          if (!user) {
            setIsAuthOpen(true);
            addToast('Sign In Required', 'Please sign in or use a 1-click Demo Role to report an issue.', 'warning');
          } else {
            setIsReportOpen(true);
          }
        }}
        onLogout={handleLogout}
        onQuickDemoLogin={handleQuickDemoLogin}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Feed & My Tickets View */}
        {(activeTab === 'feed' || activeTab === 'my-tickets') && (
          <div>
            {/* Hero Banner only on Feed */}
            {activeTab === 'feed' && (
              <HeroBanner
                overviewStats={overviewStats}
                onOpenReport={() => {
                  if (!user) {
                    setIsAuthOpen(true);
                    addToast('Sign In Required', 'Please sign in or use a 1-click Demo Role to report an issue.', 'warning');
                  } else {
                    setIsReportOpen(true);
                  }
                }}
                activeCategory={categoryFilter}
                onCategorySelect={(catId) => setCategoryFilter(catId)}
              />
            )}

            {/* My Tickets Header */}
            {activeTab === 'my-tickets' && (
              <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-8 px-4 text-white">
                <div className="max-w-7xl mx-auto">
                  <h1 className="text-2xl sm:text-3xl font-extrabold">My Reported Campus Issues</h1>
                  <p className="text-xs sm:text-sm text-blue-200 mt-1">
                    Track real-time status and technician updates for tickets submitted by your account.
                  </p>
                </div>
              </div>
            )}

            {/* Filter & Tickets Grid Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Filter Bar */}
              <FilterBar
                search={search}
                onSearchChange={setSearch}
                status={statusFilter}
                onStatusChange={setStatusFilter}
                category={categoryFilter}
                onCategoryChange={setCategoryFilter}
                priority={priorityFilter}
                onPriorityChange={setPriorityFilter}
                sort={sortOrder}
                onSortChange={setSortOrder}
                totalResults={complaints.length}
              />

              {/* Complaints Card Grid */}
              {loadingComplaints ? (
                <div className="py-20 text-center space-y-3">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-sm font-semibold text-slate-500">Loading campus problem tickets...</p>
                </div>
              ) : complaints.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mx-auto">
                    🔍
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">No Campus Issues Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    There are no reported problems matching your filter criteria. Try resetting your search or filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearch('');
                      setStatusFilter('all');
                      setCategoryFilter('all');
                      setPriorityFilter('all');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {complaints.map((c) => (
                    <ComplaintCard
                      key={c.id}
                      complaint={c}
                      user={user}
                      onClick={(ticket) => setSelectedTicketId(ticket.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && <AnalyticsView />}

        {/* Admin Portal Tab */}
        {activeTab === 'admin' && (
          <AdminDashboard
            user={user}
            onSelectComplaint={(ticket) => setSelectedTicketId(ticket.id)}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 sm:px-6 lg:px-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs">
              CF
            </div>
            <span className="font-bold text-slate-900">CampusFix</span>
            <span>• University Campus Problem Reporting & Resolution System</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">⚡ Powered by AI Categorization & Prioritization Engine</span>
            <span>•</span>
            <span>Local SQLite DB</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ComplaintForm
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSubmitSuccess={handleComplaintSubmitted}
        user={user}
      />

      <ComplaintDetailModal
        complaintId={selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
        user={user}
        onStatusUpdated={handleStatusUpdated}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Global Toast Alerts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

// Render root
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
