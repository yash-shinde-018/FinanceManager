'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  X,
  RefreshCw,
  Briefcase,
  Wallet,
  Building2,
  Gem,
  Package,
  Bitcoin,
  Landmark,
  AlertCircle,
  AlertTriangle,
  Edit2,
  ShoppingCart,
  TrendingUp as TrendingUpIcon,
  IndianRupee,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  listInvestments, 
  createInvestment, 
  updateInvestment, 
  deleteInvestment,
  updatePrices,
  calculatePortfolioMetrics,
  type InvestmentWithMetrics,
  type AssetType,
} from '@/lib/db/investments';
import { 
  fetchMultiplePrices, 
  getAssetTypeDisplay, 
  getAssetTypeColor,
  type PriceError,
} from '@/lib/alpha-vantage';

const ASSET_TYPES: { value: AssetType; label: string; icon: React.ElementType }[] = [
  { value: 'stocks', label: 'Stocks', icon: TrendingUp },
  { value: 'etfs', label: 'ETFs', icon: Briefcase },
  { value: 'mutual_funds', label: 'Mutual Funds', icon: Landmark },
  { value: 'crypto', label: 'Crypto', icon: Bitcoin },
  { value: 'fixed_deposits', label: 'Fixed Deposits', icon: Building2 },
  { value: 'gold', label: 'Gold', icon: Gem },
  { value: 'manual_assets', label: 'Manual Assets', icon: Package },
];

// Popular Indian Stocks (BSE) with mock data
const POPULAR_INDIAN_STOCKS = [
  { symbol: 'RELIANCE.BSE', name: 'Reliance Industries', price: 1073.01, change: 1.13, volume: '96,39,271', high: '1079.06', low: '1066.97' },
  { symbol: 'TCS.BSE', name: 'Tata Consultancy Services', price: 3476.58, change: 2.96, volume: '50,61,818', high: '3483.63', low: '3469.52' },
  { symbol: 'HDFCBANK.BSE', name: 'HDFC Bank', price: 1529.82, change: 0.21, volume: '70,02,121', high: '1530.79', low: '1528.85' },
  { symbol: 'INFY.BSE', name: 'Infosys', price: 1529.89, change: -4.00, volume: '25,77,196', high: '1540.49', low: '1519.30' },
  { symbol: 'ICICIBANK.BSE', name: 'ICICI Bank', price: 1045.32, change: -4.85, volume: '45,12,334', high: '1090.50', low: '1040.20' },
  { symbol: 'HINDUNILVR.BSE', name: 'Hindustan Unilever', price: 2456.78, change: 0.75, volume: '12,34,567', high: '2470.00', low: '2445.50' },
  { symbol: 'SBIN.BSE', name: 'State Bank of India', price: 765.45, change: 1.25, volume: '89,45,123', high: '772.00', low: '760.50' },
  { symbol: 'BHARTIARTL.BSE', name: 'Bharti Airtel', price: 1123.67, change: -0.45, volume: '34,56,789', high: '1130.50', low: '1118.00' },
];

// Popular US Stocks with mock data
const POPULAR_US_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 189.52, change: 1.25, volume: '45.2M', high: '190.50', low: '187.20' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.91, change: 0.85, volume: '28.1M', high: '380.00', low: '375.50' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.80, change: -0.45, volume: '22.3M', high: '143.20', low: '140.80' },
  { symbol: 'AMZN', name: 'Amazon.com', price: 155.32, change: 2.10, volume: '38.5M', high: '157.00', low: '152.80' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 202.64, change: -3.20, volume: '98.2M', high: '210.00', low: '198.50' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 495.22, change: 4.50, volume: '52.1M', high: '502.00', low: '488.00' },
];

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<InvestmentWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBuyStocksModal, setShowBuyStocksModal] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<InvestmentWithMetrics | null>(null);
  const [priceErrors, setPriceErrors] = useState<PriceError[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeStockTab, setActiveStockTab] = useState<'indian' | 'us'>('indian');
  
  const [newInvestment, setNewInvestment] = useState({
    asset_type: 'stocks' as AssetType,
    asset_name: '',
    symbol: '',
    quantity: 1,
    buy_price: 0,
    purchase_date: new Date().toISOString().split('T')[0],
    platform: '',
  });

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = async () => {
    try {
      setLoading(true);
      const data = await listInvestments();
      setInvestments(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading investments:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshPrices = async () => {
    try {
      setRefreshing(true);
      setPriceErrors([]);

      const marketInvestments = investments.filter(
        inv => inv.symbol && ['stocks', 'etfs', 'mutual_funds'].includes(inv.asset_type)
      );

      if (marketInvestments.length === 0) {
        setRefreshing(false);
        return;
      }

      const symbols = marketInvestments.map(inv => inv.symbol!);
      const { prices, errors } = await fetchMultiplePrices(symbols);

      if (Object.keys(prices).length > 0) {
        await updatePrices(marketInvestments, prices);
        await loadInvestments();
      }

      setPriceErrors(errors);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing prices:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddInvestment = async () => {
    if (!newInvestment.asset_name || newInvestment.buy_price <= 0) {
      alert('Please fill all required fields');
      return;
    }

    try {
      let currentPrice = null;
      if (newInvestment.symbol && ['stocks', 'etfs', 'mutual_funds'].includes(newInvestment.asset_type)) {
        const { prices } = await fetchMultiplePrices([newInvestment.symbol]);
        currentPrice = prices[newInvestment.symbol.toUpperCase()] || null;
      }

      await createInvestment({
        ...newInvestment,
        current_price: currentPrice,
      });

      await loadInvestments();
      setShowAddModal(false);
      setNewInvestment({
        asset_type: 'stocks',
        asset_name: '',
        symbol: '',
        quantity: 1,
        buy_price: 0,
        purchase_date: new Date().toISOString().split('T')[0],
        platform: '',
      });
    } catch (error) {
      console.error('Error adding investment:', error);
      alert('Failed to add investment');
    }
  };

  const handleQuickBuyStock = (stock: typeof POPULAR_INDIAN_STOCKS[0]) => {
    setNewInvestment({
      asset_type: 'stocks',
      asset_name: stock.name,
      symbol: stock.symbol,
      quantity: 1,
      buy_price: stock.price,
      purchase_date: new Date().toISOString().split('T')[0],
      platform: '',
    });
    setShowBuyStocksModal(false);
    setShowAddModal(true);
  };

  const handleEditInvestment = async () => {
    if (!editingInvestment) return;

    try {
      await updateInvestment(editingInvestment.id, {
        asset_type: editingInvestment.asset_type,
        asset_name: editingInvestment.asset_name,
        symbol: editingInvestment.symbol,
        quantity: editingInvestment.quantity,
        buy_price: editingInvestment.buy_price,
        purchase_date: editingInvestment.purchase_date,
        platform: editingInvestment.platform,
      });

      await loadInvestments();
      setShowEditModal(false);
      setEditingInvestment(null);
    } catch (error) {
      console.error('Error updating investment:', error);
      alert('Failed to update investment');
    }
  };

  const handleDeleteInvestment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this investment?')) return;

    try {
      await deleteInvestment(id);
      await loadInvestments();
    } catch (error) {
      console.error('Error deleting investment:', error);
      alert('Failed to delete investment');
    }
  };

  const portfolioMetrics = calculatePortfolioMetrics(investments);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const summaryCards = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-glass p-5"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm text-[var(--muted-text)]">Total Invested</p>
            <p className="text-xl font-bold">{formatCurrency(portfolioMetrics.total_invested)}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-glass p-5"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-[var(--muted-text)]">Current Value</p>
            <p className="text-xl font-bold">{formatCurrency(portfolioMetrics.total_current_value)}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-glass p-5"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            portfolioMetrics.total_profit_loss >= 0 ? "bg-emerald-500/20" : "bg-rose-500/20"
          )}>
            {portfolioMetrics.total_profit_loss >= 0 ? (
              <ArrowUpRight className="w-5 h-5 text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-5 h-5 text-rose-400" />
            )}
          </div>
          <div>
            <p className="text-sm text-[var(--muted-text)]">Profit/Loss</p>
            <p className={cn(
              "text-xl font-bold",
              portfolioMetrics.total_profit_loss >= 0 ? "text-emerald-400" : "text-rose-400"
            )}>
              {formatCurrency(portfolioMetrics.total_profit_loss)}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Empty State
  if (!loading && investments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Investment Portfolio</h1>
            <p className="text-[var(--muted-text)]">Start building your investment portfolio</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-glass p-8"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-10 h-10 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Start Investing Today</h2>
            <p className="text-[var(--muted-text)] max-w-md mx-auto">
              Build your wealth by investing in top Indian and US stocks. Track your portfolio performance in real-time.
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setShowBuyStocksModal(true)}
              className="btn-primary flex items-center gap-2 px-8 py-3 text-lg"
            >
              <ShoppingCart className="w-5 h-5" />
              Buy Stocks
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-secondary flex items-center gap-2 px-8 py-3 text-lg"
            >
              <Plus className="w-5 h-5" />
              Add Manually
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="text-center p-4 rounded-lg bg-[var(--glass-bg)]">
              <TrendingUpIcon className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">₹0</p>
              <p className="text-sm text-[var(--muted-text)]">Total Invested</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-[var(--glass-bg)]">
              <Wallet className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">₹0</p>
              <p className="text-sm text-[var(--muted-text)]">Current Value</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-[var(--glass-bg)]">
              <IndianRupee className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">₹0</p>
              <p className="text-sm text-[var(--muted-text)]">Profit/Loss</p>
            </div>
          </div>
        </motion.div>

        {/* Buy Stocks Modal */}
        <StockSelectionModal 
          show={showBuyStocksModal}
          onClose={() => setShowBuyStocksModal(false)}
          activeTab={activeStockTab}
          setActiveTab={setActiveStockTab}
          onSelectStock={handleQuickBuyStock}
          formatCurrency={formatCurrency}
          onManualAdd={() => {
            setShowBuyStocksModal(false);
            setShowAddModal(true);
          }}
        />

        {/* Add Investment Modal */}
        <AddInvestmentModal 
          show={showAddModal}
          onClose={() => setShowAddModal(false)}
          newInvestment={newInvestment}
          setNewInvestment={setNewInvestment}
          onAdd={handleAddInvestment}
          formatCurrency={formatCurrency}
        />
      </div>
    );
  }

  // Normal view with investments
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Investment Portfolio</h1>
          <p className="text-[var(--muted-text)]">
            Track and manage your investments
            {lastUpdated && (
              <span className="ml-2 text-xs">
                • Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBuyStocksModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Buy Stocks
          </button>
          <button
            onClick={refreshPrices}
            disabled={refreshing}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={cn("w-5 h-5", refreshing && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {priceErrors.length > 0 && (
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-400 font-medium">Price Update Issues</p>
              <p className="text-sm text-[var(--muted-text)]">
                Alpha Vantage free tier is limited to 25 requests/day. Consider upgrading for more frequent updates.
              </p>
            </div>
          </div>
        </div>
      )}

      {summaryCards}

      <div className="card-glass p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Your Investments ({investments.length})</h3>
          <div className="text-sm text-[var(--muted-text)]">
            Return: <span className={portfolioMetrics.overall_return_percentage >= 0 ? "text-emerald-400" : "text-rose-400"}>
              {portfolioMetrics.overall_return_percentage >= 0 ? '+' : ''}{portfolioMetrics.overall_return_percentage.toFixed(2)}%
            </span>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-[var(--muted-text)] mx-auto mb-4 animate-spin" />
            <p className="text-[var(--muted-text)]">Loading investments...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {investments.map((inv) => {
              const AssetIcon = ASSET_TYPES.find(t => t.value === inv.asset_type)?.icon || Package;
              return (
                <motion.div key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-indigo-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${getAssetTypeColor(inv.asset_type)}20` }}>
                        <AssetIcon className="w-5 h-5" style={{ color: getAssetTypeColor(inv.asset_type) }} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{inv.asset_name}</h4>
                        <p className="text-sm text-[var(--muted-text)]">
                          {getAssetTypeDisplay(inv.asset_type)}{inv.symbol && ` • ${inv.symbol}`}{inv.platform && ` • ${inv.platform}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-[var(--muted-text)]">{inv.quantity} × {formatCurrency(inv.buy_price)}</p>
                        <p className="text-xs text-[var(--muted-text)]">Current: {formatCurrency(inv.current_price || inv.buy_price)}</p>
                      </div>
                      <div className="text-right min-w-[140px]">
                        <p className="font-semibold">{formatCurrency(inv.current_value)}</p>
                        <p className={cn("text-sm", inv.profit_loss >= 0 ? "text-emerald-400" : "text-rose-400")}>
                          {inv.profit_loss >= 0 ? '+' : ''}{formatCurrency(inv.profit_loss)} ({inv.return_percentage >= 0 ? '+' : ''}{inv.return_percentage.toFixed(2)}%)
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingInvestment(inv); setShowEditModal(true); }} className="p-2 rounded-lg hover:bg-indigo-500/10 text-indigo-400 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteInvestment(inv.id)} className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <StockSelectionModal 
        show={showBuyStocksModal}
        onClose={() => setShowBuyStocksModal(false)}
        activeTab={activeStockTab}
        setActiveTab={setActiveStockTab}
        onSelectStock={handleQuickBuyStock}
        formatCurrency={formatCurrency}
        onManualAdd={() => {
          setShowBuyStocksModal(false);
          setShowAddModal(true);
        }}
      />

      <AddInvestmentModal 
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        newInvestment={newInvestment}
        setNewInvestment={setNewInvestment}
        onAdd={handleAddInvestment}
        formatCurrency={formatCurrency}
      />

      <AnimatePresence>
        {showEditModal && editingInvestment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card-glass p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Edit Investment</h3>
                <button onClick={() => { setShowEditModal(false); setEditingInvestment(null); }} className="p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Asset Name</label>
                  <input type="text" value={editingInvestment.asset_name} onChange={(e) => setEditingInvestment({ ...editingInvestment, asset_name: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Symbol/Ticker</label>
                  <input type="text" value={editingInvestment.symbol || ''} onChange={(e) => setEditingInvestment({ ...editingInvestment, symbol: e.target.value.toUpperCase() })} className="w-full px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-indigo-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Quantity</label>
                    <input type="number" step="0.0001" value={editingInvestment.quantity} onChange={(e) => setEditingInvestment({ ...editingInvestment, quantity: Number(e.target.value) })} className="w-full px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Buy Price (₹)</label>
                    <input type="number" step="0.01" value={editingInvestment.buy_price} onChange={(e) => setEditingInvestment({ ...editingInvestment, buy_price: Number(e.target.value) })} className="w-full px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-indigo-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Purchase Date</label>
                    <input type="date" value={editingInvestment.purchase_date} onChange={(e) => setEditingInvestment({ ...editingInvestment, purchase_date: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Platform/Broker</label>
                    <input type="text" value={editingInvestment.platform || ''} onChange={(e) => setEditingInvestment({ ...editingInvestment, platform: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-indigo-500 outline-none" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => { setShowEditModal(false); setEditingInvestment(null); }} className="flex-1 px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-indigo-500/30 transition-all">Cancel</button>
                  <button onClick={handleEditInvestment} className="flex-1 btn-primary">Save Changes</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Stock Selection Modal with Search
function StockSelectionModal({ 
  show, 
  onClose, 
  activeTab, 
  setActiveTab, 
  onSelectStock,
  formatCurrency,
  onManualAdd
}: { 
  show: boolean;
  onClose: () => void;
  activeTab: 'indian' | 'us';
  setActiveTab: (tab: 'indian' | 'us') => void;
  onSelectStock: (stock: any) => void;
  formatCurrency: (val: number) => string;
  onManualAdd: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!show) return null;

  const allStocks = activeTab === 'indian' ? POPULAR_INDIAN_STOCKS : POPULAR_US_STOCKS;
  
  // Filter stocks based on search
  const filteredStocks = searchQuery.trim() 
    ? allStocks.filter(stock => 
        stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allStocks;

  const hasSearchResults = filteredStocks.length > 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card-glass p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6 text-indigo-400" />
              <h3 className="text-xl font-bold">Buy Stocks</h3>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button onClick={() => { setActiveTab('indian'); setSearchQuery(''); }} className={cn("flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2", activeTab === 'indian' ? "bg-indigo-500 text-white" : "bg-[var(--glass-bg)] text-[var(--muted-text)] hover:bg-indigo-500/20")}>
              🇮🇳 Indian Stocks (BSE)
            </button>
            <button onClick={() => { setActiveTab('us'); setSearchQuery(''); }} className={cn("flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2", activeTab === 'us' ? "bg-indigo-500 text-white" : "bg-[var(--glass-bg)] text-[var(--muted-text)] hover:bg-indigo-500/20")}>
              🇺🇸 US Stocks (NYSE/NASDAQ)
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab === 'indian' ? 'Indian' : 'US'} stocks... (e.g., RELIANCE, TCS, AAPL)`}
                className="w-full px-4 py-3 pl-10 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-indigo-500 outline-none"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-text)] hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="mb-4">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUpIcon className="w-5 h-5 text-amber-400" />
              {searchQuery ? 'Search Results' : 'Popular Stocks'}
            </h4>

            {hasSearchResults ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredStocks.map((stock) => (
                  <motion.div key={stock.symbol} whileHover={{ scale: 1.02 }} className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-indigo-500/50 transition-all cursor-pointer" onClick={() => onSelectStock(stock)}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="font-semibold text-lg">{stock.name}</h5>
                        <p className="text-sm text-[var(--muted-text)]">{stock.symbol}</p>
                      </div>
                      <div className={cn("flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium", stock.change >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400")}>
                        {stock.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold">{formatCurrency(stock.price)}</p>
                        <p className={cn("text-sm", stock.change >= 0 ? "text-emerald-400" : "text-rose-400")}>
                          {stock.change >= 0 ? '+' : ''}₹{(stock.price * stock.change / 100).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right text-xs text-[var(--muted-text)]">
                        <p>Vol: {stock.volume}</p>
                        <p>H: ₹{stock.high}</p>
                        <p>L: ₹{stock.low}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-[var(--glass-bg)] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[var(--muted-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-[var(--muted-text)] mb-2">No stocks found for &quot;{searchQuery}&quot;</p>
                <p className="text-sm text-[var(--muted-text)] mb-4">The stock you&apos;re looking for isn&apos;t in our popular list.</p>
                <button onClick={onManualAdd} className="btn-primary flex items-center gap-2 mx-auto">
                  <Plus className="w-4 h-4" />
                  Add Stock Manually
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-[var(--muted-text)] text-center mt-4">
            * Prices shown are indicative. Click on a stock to add it to your portfolio.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Add Investment Modal
function AddInvestmentModal({ 
  show, 
  onClose, 
  newInvestment, 
  setNewInvestment, 
  onAdd,
  formatCurrency 
}: { 
  show: boolean;
  onClose: () => void;
  newInvestment: any;
  setNewInvestment: (val: any) => void;
  onAdd: () => void;
  formatCurrency: (val: number) => string;
}) {
  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card-glass p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Add Investment</h3>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Asset Type *</label>
              <div className="grid grid-cols-2 gap-2">
                {ASSET_TYPES.map((type) => (
                  <button key={type.value} onClick={() => setNewInvestment({ ...newInvestment, asset_type: type.value })} className={cn("flex items-center gap-2 p-3 rounded-lg border transition-all", newInvestment.asset_type === type.value ? "border-indigo-500 bg-indigo-500/10" : "border-[var(--glass-border)] hover:border-indigo-500/30")}>
                    <type.icon className="w-4 h-4" />
                    <span className="text-sm">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Asset Name *</label>
              <input type="text" value={newInvestment.asset_name} onChange={(e) => setNewInvestment({ ...newInvestment, asset_name: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-indigo-500 outline-none" placeholder="e.g., Apple Inc." />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Symbol/Ticker
                {['stocks', 'etfs', 'mutual_funds'].includes(newInvestment.asset_type) && <span className="text-xs text-[var(--muted-text)] ml-1">(Required for price updates)</span>}
              </label>
              <input type="text" value={newInvestment.symbol} onChange={(e) => setNewInvestment({ ...newInvestment, symbol: e.target.value.toUpperCase() })} className="w-full px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-indigo-500 outline-none" placeholder="e.g., AAPL" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Quantity *</label>
                <input type="number" step="0.0001" value={newInvestment.quantity || ''} onChange={(e) => setNewInvestment({ ...newInvestment, quantity: Number(e.target.value) })} className="w-full px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-indigo-500 outline-none" placeholder="1" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Buy Price (₹) *</label>
                <input type="number" step="0.01" value={newInvestment.buy_price || ''} onChange={(e) => setNewInvestment({ ...newInvestment, buy_price: Number(e.target.value) })} className="w-full px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-indigo-500 outline-none" placeholder="1000" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Purchase Date *</label>
                <input type="date" value={newInvestment.purchase_date} onChange={(e) => setNewInvestment({ ...newInvestment, purchase_date: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Platform/Broker</label>
                <input type="text" value={newInvestment.platform} onChange={(e) => setNewInvestment({ ...newInvestment, platform: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-indigo-500 outline-none" placeholder="e.g., Zerodha" />
              </div>
            </div>

            {newInvestment.quantity > 0 && newInvestment.buy_price > 0 && (
              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-sm text-indigo-400">Total Investment: {formatCurrency(newInvestment.quantity * newInvestment.buy_price)}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-indigo-500/30 transition-all">Cancel</button>
              <button onClick={onAdd} disabled={!newInvestment.asset_name || newInvestment.buy_price <= 0} className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed">Add Investment</button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
