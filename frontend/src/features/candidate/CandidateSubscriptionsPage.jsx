import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Zap,
  CheckCircle2,
  Clock,
  History,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  Coins,
  Sliders,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  RefreshCw,
  XCircle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

export default function CandidateSubscriptionsPage() {
  const { user, checkAuth } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  // State Management
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('ALL'); // ALL | PURCHASE | USAGE | BONUS | REFUND
  const [openFaq, setOpenFaq] = useState(null);

  // Custom Credit Slider State (20 to 500 Credits)
  const [customCredits, setCustomCredits] = useState(50);

  // Payment Failure & Recovery State
  const [failedPaymentRecovery, setFailedPaymentRecovery] = useState(null);

  // Pricing Calculation: <50 credits = ₹2.50/cr, >=50 credits = ₹1.80/cr (28% volume discount)
  const parsedCustomCredits = Math.max(20, parseInt(customCredits, 10) || 20);
  const isVolumeDiscountActive = parsedCustomCredits >= 50;
  const customRate = isVolumeDiscountActive ? 1.8 : 2.5;
  const customTotalPrice = Math.round(parsedCustomCredits * customRate);
  const savingsPercent = isVolumeDiscountActive
    ? Math.round(((2.5 - 1.8) / 2.5) * 100)
    : 0;

  // User Wallet Statistics
  const availableCredits = user?.credits?.availableCredits ?? 15;
  const totalPurchasedCredits = user?.credits?.totalPurchasedCredits ?? 0;
  const totalBonusCredits = user?.credits?.totalBonusCredits ?? 15;
  const totalUsedCredits =
    user?.credits?.totalUsedCredits ??
    Math.max(0, totalPurchasedCredits + totalBonusCredits - availableCredits);
  const interviewsRemainingEstimate = Math.floor(availableCredits / 15);

  // Fetch real transaction history
  const fetchCreditHistory = async () => {
    setLoadingHistory(true);
    setHistoryError(false);
    try {
      const { data } = await api.get('/payments/history');
      if (data?.success && Array.isArray(data?.history)) {
        setHistory(data.history);
      } else {
        setHistory([]);
      }
    } catch {
      setHistoryError(true);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchCreditHistory();
  }, []);

  // Dynamically load Razorpay SDK
  const loadRazorpaySDK = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Generic purchase flow for both custom slider and curated bundles
  const handlePurchase = async ({ id, credits, price, title }) => {
    setLoadingPlan(id);
    setFailedPaymentRecovery(null);

    try {
      const sdkLoaded = await loadRazorpaySDK();
      if (!sdkLoaded) {
        toast.error('Razorpay SDK failed to load. Please check your internet connection.');
        setLoadingPlan(null);
        return;
      }

      // 1. Create Order on Backend
      const { data: orderData } = await api.post('/payments/create-order', {
        credits,
        amount: price
      });

      if (!orderData?.success || !orderData?.orderId) {
        toast.error(orderData?.message || 'Failed to initiate purchase. Try again.');
        setLoadingPlan(null);
        return;
      }

      // 2. Launch Razorpay Checkout Modal
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'ForkTalent',
        description: `${credits} AI Interview Credits (${title || 'Credit Pack'})`,
        order_id: orderData.orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: {
          color: '#5B3AF2'
        },
        handler: async (response) => {
          const verifyToast = toast.loading('Verifying transaction...');
          try {
            const { data: verifyData } = await api.post('/payments/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyData?.success) {
              toast.success(`🎉 ${credits} Credits added successfully!`, { id: verifyToast });
              if (checkAuth) await checkAuth();
              fetchCreditHistory();
              setFailedPaymentRecovery(null);
            } else {
              toast.error(verifyData?.message || 'Payment verification failed.', { id: verifyToast });
              setFailedPaymentRecovery({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                credits,
                signature: response.razorpay_signature
              });
            }
          } catch (verifyErr) {
            toast.error('Network drop during verification. Please click Retry below.', { id: verifyToast });
            setFailedPaymentRecovery({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              credits,
              signature: response.razorpay_signature
            });
          }
        },
        modal: {
          ondismiss: async () => {
            toast('Payment cancelled.', { icon: 'ℹ️' });
            try {
              await api.post('/payments/fail-order', {
                orderId: orderData.orderId,
                reason: 'Dismissed by User'
              });
              fetchCreditHistory();
            } catch {
              // Ignore background fail order error
            }
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', async (response) => {
        toast.error(`Payment Failed: ${response.error?.description || 'Transaction was declined.'}`);
        try {
          await api.post('/payments/fail-order', {
            orderId: orderData.orderId,
            reason: response.error?.description || 'Payment Failed'
          });
          fetchCreditHistory();
        } catch {
          // Ignore background fail order error
        }
      });
      razorpayInstance.open();
    } catch {
      toast.error('Could not connect to payment gateway.');
    } finally {
      setLoadingPlan(null);
    }
  };

  // Retry Verification for failed transactions
  const handleRetryVerification = async () => {
    if (!failedPaymentRecovery) return;
    const retryToast = toast.loading('Retrying transaction verification...');
    try {
      const { data: verifyData } = await api.post('/payments/verify-payment', {
        razorpay_order_id: failedPaymentRecovery.orderId,
        razorpay_payment_id: failedPaymentRecovery.paymentId,
        razorpay_signature: failedPaymentRecovery.signature
      });

      if (verifyData?.success) {
        toast.success(`🎉 ${failedPaymentRecovery.credits} Credits added to wallet!`, { id: retryToast });
        if (checkAuth) await checkAuth();
        fetchCreditHistory();
        setFailedPaymentRecovery(null);
      } else {
        toast.error(verifyData?.message || 'Verification could not be confirmed.', { id: retryToast });
      }
    } catch {
      toast.error('Verification request failed. Please reach out to support.', { id: retryToast });
    }
  };

  // Curated Tier Packs Specification
  const bundles = [
    {
      id: 'bundle_starter',
      title: 'Starter Practice Pack',
      price: 99,
      credits: 45,
      ratePerCredit: '₹2.20/cr',
      description: 'Ideal for rapid diagnostic checks & 2-3 standard interviews.',
      features: [
        '45 AI Interview Credits',
        'Real-Time STAR Voice Scoring',
        'Radar Competency Breakdown',
        'Never Expires'
      ],
      recommended: false
    },
    {
      id: 'bundle_pro',
      title: 'Pro Placement Pack',
      price: 199,
      credits: 150,
      ratePerCredit: '₹1.33/cr',
      description: 'Our most popular tier for serious prep across 5-7 deep-dive sessions.',
      features: [
        '150 AI Interview Credits',
        'Adaptive Sub-Questioning Probing',
        'STAR Method Detailed Scoring',
        'Downloadable PDF Candidate Reports',
        'Never Expires'
      ],
      recommended: true
    },
    {
      id: 'bundle_master',
      title: 'Master Placement Pack',
      price: 399,
      credits: 400,
      ratePerCredit: '₹1.00/cr',
      description: 'Maximum volume value for company-specific interview mastery.',
      features: [
        '400 AI Interview Credits',
        'Unlimited Mock Interview Retakes',
        'STAR Behavioral & Coding Sandbox',
        'Audio Transcripts & Skill Matrix',
        'Never Expires'
      ],
      recommended: false
    }
  ];

  // Filtered Transaction History
  const filteredHistory = useMemo(() => {
    if (historyFilter === 'ALL') return history;
    return history.filter((item) => item.type?.toUpperCase() === historyFilter);
  }, [history, historyFilter]);

  // FAQs
  const faqs = [
    {
      question: 'How do Interview Credits work in ForkTalent?',
      answer: 'Credits correspond to session time: 1 minute of AI mock interview consumes exactly 1 Credit. Real-time speech synthesis, STAR response scoring, and PDF report generation are all included.'
    },
    {
      question: 'Do my purchased credits ever expire?',
      answer: 'No. Purchased credits remain in your wallet indefinitely until you use them for interview practice.'
    },
    {
      question: 'What happens if my connection drops during a live session?',
      answer: 'Our state coordinator saves your question turns automatically. Unused minutes from any interrupted session remain safely protected in your wallet balance.'
    },
    {
      question: 'Which payment methods are supported via Razorpay?',
      answer: 'Razorpay supports UPI (Google Pay, PhonePe, Paytm, BHIM), all major Credit & Debit Cards (Visa, Mastercard, RuPay), Netbanking across 50+ banks, and Digital Wallets.'
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[var(--background)] font-['Inter'] pb-20 text-[var(--text-primary)]">
      <div className="w-full px-4 sm:px-6 md:px-8 xl:px-10 py-6 sm:py-8 space-y-8 max-w-7xl mx-auto">

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] text-[11px] font-medium">
                <CreditCard className="w-3 h-3" /> Wallet & Subscriptions
              </span>
              <span className="text-xs text-[var(--text-muted)]">•</span>
              <span className="text-xs text-[var(--text-secondary)] font-normal">Transparent Credit Packs</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-[var(--text-primary)]">
              Subscription & Credit Management
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-bit Encrypted Checkout • Credits Never Expire</span>
          </div>
        </div>

        {/* Section 6: Persistent Payment Failure & Recovery State */}
        <AnimatePresence>
          {failedPaymentRecovery && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-medium text-amber-300">
                    Payment Verification Pending
                  </h2>
                  <p className="text-xs text-amber-200/80 mt-0.5 font-normal leading-relaxed">
                    We detected a connection interruption following Razorpay checkout for Order <code className="font-mono px-1 py-0.5 rounded bg-amber-500/20">{failedPaymentRecovery.orderId}</code>. Your payment was initiated.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={handleRetryVerification}
                  className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Verify Wallet Now</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section 1: WALLET HERO (Flat Surface + Accent Border) */}
        <div className="bg-[var(--card)] border border-[var(--color-border-active,#6338F6)]/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

            {/* Left Col: Main Available Balance */}
            <div className="md:col-span-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-secondary)] font-normal">Current Wallet Balance</span>
                {totalBonusCredits > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    +{totalBonusCredits} Starter Bonus
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-medium tracking-tight text-[var(--text-primary)]">
                  {availableCredits}
                </span>
                <span className="text-sm font-normal text-[var(--color-text-accent,#C4B5FD)]">
                  Credits Available
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-normal">
                1 Credit = 1 Minute of AI technical questioning, real-time voice feedback, and STAR scoring.
              </p>
            </div>

            {/* Middle Col: Derived Interview Metric */}
            <div className="md:col-span-4 p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <Clock className="w-3.5 h-3.5 text-[var(--color-text-accent,#C4B5FD)]" />
                <span>Estimated Interview Runway</span>
              </div>
              <div className="text-xl font-medium text-[var(--text-primary)]">
                ≈ {interviewsRemainingEstimate} Mock {interviewsRemainingEstimate === 1 ? 'Interview' : 'Interviews'}
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Based on standard 15-minute diagnostic & technical interviews.
              </p>
            </div>

            {/* Right Col: Lifetime Usage Summary */}
            <div className="md:col-span-3 p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Total Practice Used</span>
              </div>
              <div className="text-xl font-medium text-[var(--text-primary)]">
                {totalUsedCredits} <span className="text-xs font-normal text-[var(--text-secondary)]">Credits ({totalUsedCredits} mins)</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Purchased: {totalPurchasedCredits} cr
              </p>
            </div>

          </div>
        </div>

        {/* Section 2: BUNDLE CARDS (Unified Surface, Single Elevation on Recommended) */}
        <div className="space-y-4">
          <div>
            <h2 className="text-base sm:text-lg font-medium text-[var(--text-primary)]">
              Curated Practice Packs
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Select a pre-configured credit pack for structured company and role preparation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {bundles.map((bundle) => {
              const isRecommended = bundle.recommended;
              const isLoading = loadingPlan === bundle.id;

              return (
                <div
                  key={bundle.id}
                  className={`bg-[var(--card)] rounded-3xl p-6 flex flex-col justify-between space-y-6 transition-all duration-150 relative ${
                    isRecommended
                      ? "border border-[var(--color-border-active,#6338F6)] shadow-md"
                      : "border border-[var(--border)]"
                  }`}
                >
                  {/* Card Header & Badge */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        {bundle.title}
                      </span>
                      {isRecommended && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/40">
                          Recommended
                        </span>
                      )}
                    </div>

                    {/* Price and Price-Per-Credit */}
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl sm:text-4xl font-medium text-[var(--text-primary)]">
                          ₹{bundle.price}
                        </span>
                        <span className="text-xs text-[var(--text-secondary)] font-normal">
                          for {bundle.credits} Credits
                        </span>
                      </div>
                      <div className="inline-block text-[11px] font-medium text-[var(--color-text-accent,#C4B5FD)]">
                        Effective rate: {bundle.ratePerCredit}
                      </div>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] font-normal leading-relaxed pt-1">
                      {bundle.description}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 pt-2 border-t border-[var(--border)]">
                    {bundle.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Buy Action Button (Tint Fill per Single Primary CTA rule) */}
                  <div className="pt-2">
                    <button
                      onClick={() => handlePurchase(bundle)}
                      disabled={Boolean(loadingPlan)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[var(--primary-tint,rgba(99,56,246,0.15))] hover:bg-[var(--primary-tint)]/80 text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/40 text-xs font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[var(--color-border-active,#6338F6)] focus-visible:outline-none"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Connecting Gateway...</span>
                        </>
                      ) : (
                        <>
                          <span>Buy {bundle.credits} Credits</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: CUSTOM SLIDER & Single Primary High-Intent Checkout */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[var(--color-text-accent,#C4B5FD)]" />
                <h2 className="text-base sm:text-lg font-medium text-[var(--text-primary)]">
                  Custom Credit Amount
                </h2>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Drag the slider to pick your exact preparation credit requirement (20 to 500 Credits).
              </p>
            </div>

            {/* Volume Savings Callout */}
            {isVolumeDiscountActive && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>You save {savingsPercent}% vs. standard rate</span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Slider Controls */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--text-secondary)]">20 Credits (Min)</span>
                <span className="font-medium text-base text-[var(--text-primary)]">
                  {parsedCustomCredits} Credits
                </span>
                <span className="text-[var(--text-secondary)]">500 Credits (Max)</span>
              </div>

              <input
                type="range"
                min="20"
                max="500"
                step="5"
                value={parsedCustomCredits}
                onChange={(e) => setCustomCredits(Number(e.target.value))}
                className="w-full h-2 bg-[var(--background)] rounded-lg appearance-none cursor-pointer accent-[var(--primary,#5B3AF2)] focus-visible:ring-2 focus-visible:ring-[var(--color-border-active,#6338F6)] focus-visible:outline-none"
                aria-label="Select custom credit amount"
              />

              <div className="flex justify-between items-center text-[11px] text-[var(--text-muted)]">
                <span>Base tier (20-49 cr): ₹2.50/cr</span>
                <span className="text-emerald-400 font-medium">Volume tier (50-500 cr): ₹1.80/cr</span>
              </div>
            </div>

            {/* Price Preview & The Single Solid Primary CTA on Screen */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-medium text-[var(--text-primary)]">
                    ₹{customTotalPrice}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)] font-normal">
                    (₹{customRate.toFixed(2)} / Credit)
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Provides ≈ {Math.floor(parsedCustomCredits / 15)} full 15-minute diagnostic sessions.
                </p>
              </div>

              {/* Single Solid Primary Action on the Screen */}
              <button
                onClick={() =>
                  handlePurchase({
                    id: 'custom_slider',
                    credits: parsedCustomCredits,
                    price: customTotalPrice,
                    title: `Custom Pack (${parsedCustomCredits} Credits)`
                  })
                }
                disabled={Boolean(loadingPlan)}
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-[var(--primary,#5B3AF2)] hover:bg-[var(--primary-hover,#472CD7)] text-white text-xs font-medium transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--color-border-active,#6338F6)] focus-visible:outline-none"
              >
                {loadingPlan === 'custom_slider' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Purchase Custom Pack (₹{customTotalPrice})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: TRANSACTION HISTORY (Filterable & Semantic Badges) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[var(--color-text-accent,#C4B5FD)]" />
                <h2 className="text-base sm:text-lg font-medium text-[var(--text-primary)]">
                  Transaction & Usage History
                </h2>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Audit trail of credit purchases, session deductions, and refunds.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { key: 'ALL', label: 'All Activity' },
                { key: 'PURCHASE', label: 'Purchases' },
                { key: 'USAGE', label: 'Deductions' },
                { key: 'BONUS', label: 'Bonuses' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setHistoryFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[var(--color-border-active,#6338F6)] focus-visible:outline-none ${
                    historyFilter === tab.key
                      ? "bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border-[var(--color-border-active,#6338F6)]"
                      : "bg-[var(--card)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* History Content */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
            {loadingHistory ? (
              <div className="p-8 space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-12 bg-[var(--background)] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : historyError ? (
              <div className="p-10 text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
                  <XCircle className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-[var(--text-primary)]">
                  Failed to load transaction history
                </h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                  We could not retrieve your account history from the server.
                </p>
                <button
                  onClick={fetchCreditHistory}
                  className="px-4 py-2 bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/40 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 hover:bg-[var(--primary-tint)]/80 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Fetch</span>
                </button>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] flex items-center justify-center mx-auto">
                  <Coins className="w-5 h-5" />
                </div>
                <h3 className="text-base font-medium text-[var(--text-primary)]">
                  No transactions found
                </h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto font-normal">
                  {historyFilter === 'ALL'
                    ? 'You have not made any credit purchases yet. Choose a practice pack above to power your interviews.'
                    : `No records found under filter "${historyFilter}".`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--background)] text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                      <th className="py-3.5 px-6 font-medium">Type / Description</th>
                      <th className="py-3.5 px-6 font-medium">Status</th>
                      <th className="py-3.5 px-6 font-medium">Date</th>
                      <th className="py-3.5 px-6 font-medium text-right">Credits Delta</th>
                      <th className="py-3.5 px-6 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {filteredHistory.map((item) => {
                      const isAddition = item.type === 'PURCHASE' || item.type === 'BONUS';
                      const statusColor =
                        item.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : item.status === 'failed'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20';

                      return (
                        <tr key={item._id} className="hover:bg-[var(--surface-hover,#1E1E2A)] transition-colors">
                          <td className="py-3.5 px-6">
                            <div className="font-medium text-[var(--text-primary)]">
                              {item.description || item.type}
                            </div>
                            {item.razorpayPaymentId && (
                              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                                ID: {item.razorpayPaymentId}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-6">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border uppercase tracking-wider ${statusColor}`}>
                              {item.status || 'completed'}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-[var(--text-secondary)]">
                            {new Date(item.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>
                          <td className={`py-3.5 px-6 text-right font-medium ${isAddition ? 'text-emerald-400' : 'text-[var(--text-secondary)]'}`}>
                            {isAddition ? `+${item.credits}` : `-${item.credits}`} cr
                          </td>
                          <td className="py-3.5 px-6 text-right font-medium text-[var(--text-primary)]">
                            {item.amount > 0 ? `₹${item.amount}` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Section 5: FAQs */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[var(--color-text-accent,#C4B5FD)]" />
            <h2 className="text-base sm:text-lg font-medium text-[var(--text-primary)]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-3.5">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-medium text-[var(--text-primary)] hover:text-[var(--color-text-accent,#C4B5FD)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-border-active,#6338F6)] focus-visible:outline-none py-1"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-[var(--text-secondary)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />}
                  </button>
                  {isOpen && (
                    <p className="text-xs text-[var(--text-secondary)] mt-2 font-normal leading-relaxed">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
