import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import { ArrowLeft, Key, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const JoinInterviewPage = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Please enter an interview code");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await api.post("/interviews/join", {
        interviewCode: code.trim(),
      });
      if (data.success) {
        if (data.interview?.status === "Requested") {
          toast.success(data.interview.message || "Join request sent! Awaiting employer approval.");
          navigate("/candidate/dashboard");
        } else {
          toast.success("Successfully joined the interview!");
          navigate(`/candidate/interviews/${data.interview._id}`);
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to join interview. Please check your code."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent w-full font-['Inter'] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-variant)]/50 hover:bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] rounded-xl text-xs font-black uppercase tracking-widest transition-colors border border-[var(--color-outline-variant)]/30 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 rounded-3xl p-10 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Accent Gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-primary-md3)]"></div>
          
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-md3)]/10 flex items-center justify-center mb-8 border border-[var(--color-primary-md3)]/20 shadow-lg shadow-[var(--color-primary-md3)]/10">
            <Key className="w-8 h-8 text-[var(--color-primary-md3)]" />
          </div>
          
          <h1 className="text-3xl font-black text-[var(--color-on-surface)] mb-2 uppercase tracking-tight">Join an Interview</h1>
          <p className="text-sm text-[var(--color-on-surface-variant)] mb-10 font-bold tracking-wider">
            Enter the unique interview code provided by your employer.
          </p>

          <form onSubmit={handleJoin} className="space-y-8">
            <div>
              <label className="block text-[10px] font-black tracking-[0.2em] text-[var(--color-on-surface-variant)] uppercase mb-2">
                Interview Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="E.g. XYZ-123"
                className="w-full px-6 py-5 bg-[var(--color-surface-container-highest)] border border-[var(--color-outline-variant)]/50 rounded-2xl text-center text-xl font-mono tracking-[0.3em] uppercase text-[var(--color-on-surface)] focus:border-[var(--color-primary-md3)] focus:ring-1 focus:ring-[var(--color-primary-md3)] transition-all outline-none"
                autoComplete="off"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !code.trim()}
              className="w-full py-5 bg-[var(--color-primary-md3)] text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-[var(--color-primary-md3)]/90 transition-all shadow-lg shadow-[var(--color-primary-md3)]/30 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Join Campaign
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default JoinInterviewPage;
