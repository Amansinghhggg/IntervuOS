# IntervuOS - Capacity & Concurrency Analysis

This document provides a comprehensive capacity breakdown for running **IntervuOS** on a **100% Free Stack**:
- **Frontend:** Vercel (Hobby / Free Plan)
- **Backend:** Render (Free Web Service - 512 MB RAM, 0.1 vCPU)
- **Database:** MongoDB Atlas (M0 Sandbox - 512 MB Storage)
- **AI & Speech Provider:** Groq Free Tier (`whisper-large-v3`, `llama-3.3-70b-versatile` / `openai/gpt-oss-120b` / `llama-3.1-8b-instant`) & Google Gemini Free Tier (`gemini-1.5-flash`)

---

## 1. Quick Summary Table

| Metric | Safe Limit (Smooth UX) | Maximum Stress Limit (May see delays/429) | Primary Limiting Bottleneck |
| :--- | :--- | :--- | :--- |
| **Simultaneous Active Interviews (Same second/minute)** | **3 – 5 users** | **8 – 10 users** | Groq TPM/RPM limits + Render 512 MB RAM audio buffering |
| **Concurrent Browsing / Dashboard Users** | **50 – 100 users** | **200+ users** | Render 0.1 vCPU single-instance concurrency |
| **Daily Completed Voice Interviews** | **70 – 120 interviews/day** | **~200 interviews/day** | Groq Whisper free daily audio quota & rate limits |
| **Daily Completed Text-Only Interviews** | **200 – 350 interviews/day** | **~500 interviews/day** | Groq LLM Requests Per Day (RPD) & TPM |
| **Total Lifetime Saved Interviews (Free DB)** | **~5,000 – 8,000 interviews** | **~10,000 interviews** | MongoDB Atlas M0 512 MB storage limit |
| **Monthly Bandwidth Capacity** | **~10,000 – 15,000 interviews** | **20,000+ interviews** | 100 GB Render free outbound bandwidth limit |

---

## 2. Infrastructure Layer Breakdown

### A. Frontend: Vercel (Hobby Free Tier)
* **Status:** 🟢 **Virtually Zero Bottleneck**
* **Bandwidth:** 100 GB / month
* **Edge / CDN Requests:** Unlimited fast global CDN distribution for static Vite/React assets.
* **Impact:** Can handle **thousands of visitors per day** browsing the landing page and candidate dashboards without breaking a sweat.

---

### B. Backend: Render (Free Web Service Tier)
* **Status:** 🟡 **Moderate Concurrency & Memory Bottleneck**
* **Specs:** 0.1 vCPU (shared CPU), 512 MB RAM.
* **Cold Starts:** Spins down after **15 minutes of inactivity**. The first user after idle will wait **~50 seconds** for the server to wake up.
* **Monthly Active Hours:** 750 free instance hours/month (enough to run 1 single backend 24/7 if no other free services exist on the account).
* **Bandwidth:** 100 GB free outbound bandwidth / month.
* **Why it limits concurrent interviews:**
  - In voice mode, candidates record audio chunks (2 MB – 8 MB per question response).
  - Multer buffers these audio uploads in Node.js server memory before piping them to Groq's Whisper API.
  - If **5 to 8 candidates upload audio simultaneously**, memory spikes near the 512 MB limit, risking an out-of-memory restart (`SIGKILL / Error 137`).

---

### C. Database: MongoDB Atlas (M0 Free Sandbox)
* **Status:** 🟢 **High Concurrency, Long-Term Storage Bottleneck**
* **Storage:** 512 MB permanent storage.
* **Max Connections:** 500 simultaneous TCP connections (Node.js connection pool uses ~5–10 connections per instance, so connections won't bottleneck).
* **Throughput:** 100 IOPS (shared).
* **Storage Math per Interview:**
  - 1 Interview record (config + 10 questions + 10 transcripts + comprehensive evaluation feedback + scores): **~50 KB – 80 KB**.
  - **512 MB ÷ 70 KB ≈ 7,300 full interview sessions**.
  - *Recommendation:* Add an automatic retention policy (e.g., delete practice sessions older than 60 days) to keep it permanently free.

---

### D. AI & Voice: Groq Free Tier (The Hardest Bottleneck)
* **Status:** 🔴 **Primary Real-Time Concurrency Bottleneck**

Groq enforces distinct free tier rate limits depending on the model:

| Model / Service | Purpose in App | Free Tier RPM (Req/Min) | Free Tier TPM (Tokens/Min) | Free Tier RPD (Req/Day) |
| :--- | :--- | :--- | :--- | :--- |
| **`whisper-large-v3`** | Voice Speech-to-Text (STT) | **20 RPM** | N/A (~2,000–7,200 audio sec/day) | ~2,000 req/day |
| **`llama-3.3-70b-versatile`** | Question Generation & Final Evaluation | **30 RPM** | **6,000 – 12,000 TPM** | 14,400 RPD |
| **`llama-3.1-8b-instant`** | Fast Question Generation / Parsing | **30 RPM** | **20,000 – 30,000 TPM** | 14,400 RPD |
| **`gemini-1.5-flash`** *(if enabled)* | Adaptive Question Generation | **15 RPM** | **1,000,000 TPM** | 1,500 RPD |

---

## 3. Resource Cost of a Single 10-Question Interview

Here is what happens during **1 complete 10-question AI interview**:

```
Candidate starts interview
 ├─ 1x Start Session DB write (~5 KB)
 ├─ 1x Initial Question Generation (Gemini / Groq LLM: ~500 tokens)
 │
 ├─ [Loop x 10 Questions]:
 │   ├─ 1x Audio Upload & Whisper STT (Voice Mode: ~3-5 MB audio, 1 Groq Whisper request)
 │   ├─ 1x Intermediate DB update (~10 KB)
 │   └─ 1x Adaptive Next-Question Generation (LLM: ~800 tokens prompt + output)
 │
 └─ Interview Finish:
     ├─ 1x Comprehensive Evaluation (Groq LLM: ~2,500 prompt tokens + ~1,000 output tokens = 3,500 tokens)
     └─ 1x Final Result DB write (~50 KB)
```

### Total Consumption per 1 Voice Interview:
* **Groq Whisper Requests:** 10 requests (approx. 3–5 minutes of total speech).
* **Groq / Gemini LLM Requests:** 11 requests.
* **Total LLM Tokens:** ~11,000 – 14,000 tokens across the whole session.
* **Evaluation Spike:** **~3,500 tokens in a single request** when the interview ends.
* **Network Data:** ~20 – 40 MB audio data transfer.

---

## 4. Realistic Usage Scenarios

### Scenario 1: "At the Exact Same Time" (Concurrent Users)

| Activity | Safe Concurrent Users | Stress Limit | What Fails if Exceeded? |
| :--- | :--- | :--- | :--- |
| **Active Speaking / Answering (Voice Mode)** | **3 – 5 users** | **8 users** | Groq Whisper 20 RPM limit will throw HTTP 429 errors; Render 512 MB memory spikes. |
| **Simultaneous Evaluation Submissions** | **2 – 3 users** | **4 users** | If 3+ users finish at the exact same second, evaluation prompt tokens (3x 3.5k = 10.5k tokens) exceed Groq's 6,000–12,000 TPM limit. |
| **Text-Only Active Interviews** | **6 – 10 users** | **15 users** | Gemini/Groq RPM limit (15–30 RPM). |
| **Viewing Dashboard / Past Results** | **50 – 100 users** | **200+ users** | Render CPU saturation (page response becomes slow). |

---

### Scenario 2: "Per Day" (Daily Traffic)

| Mode | Daily User / Interview Capacity | Bottleneck Factor |
| :--- | :--- | :--- |
| **Full Voice Interviews** | **70 – 120 completed interviews / day** | Groq Whisper audio seconds & hourly token distribution. |
| **Text-Only Interviews** | **200 – 350 completed interviews / day** | Gemini 1,500 RPD or Groq TPM limits. |
| **Hybrid (50% Voice, 50% Text)** | **~150 completed interviews / day** | Balanced usage across LLM and Whisper. |

---

## 5. What Breaks First & How It Behaves

1. **Groq HTTP 429 (Too Many Requests / Rate Limit Reached)**
   - *When it happens:* More than 4-5 candidates submit answers or finish their interview simultaneously.
   - *User Experience:* Candidate sees a red retry toast or evaluation delay.
   
2. **Render Backend Cold Start (50s Sleep)**
   - *When it happens:* If nobody used the app for 15 minutes.
   - *User Experience:* The very first visitor experiences a 40–50 second delay on initial login or landing page API calls.

3. **Render Free RAM Crash (512 MB Out of Memory)**
   - *When it happens:* 6+ users record large uncompressed audio files (.wav) and upload them concurrently.

4. **MongoDB 512 MB Storage Cap**
   - *When it happens:* After accumulating ~7,000+ completed interview logs with full JSON evaluations.

---

## 6. Pro Tips to 3x Your Free Tier Capacity (Zero Cost)

1. **Prevent Render Cold Starts (100% Free):**
   - Setup a free uptime ping (e.g., [Cron-Job.org](https://cron-job.org) or [UptimeRobot](https://uptimerobot.com)) to ping your backend health endpoint `GET /api/v1/voice/health` every **10 minutes**. This keeps Render warm 24/7.

2. **Use Lighter Groq Models for Evaluation & Question Gen:**
   - Use `llama-3.1-8b-instant` for next-question generation (30,000 TPM limit, 10x faster) and reserve `llama-3.3-70b-versatile` only for the final evaluation.

3. **Client-Side Audio Compression:**
   - Ensure the frontend records audio in `audio/webm;codecs=opus` with 32kbps–48kbps bitrate instead of uncompressed audio. A 60-second answer will be only ~300 KB instead of 5 MB, drastically reducing Render memory usage.

4. **Dual Provider Fallback:**
   - In `backend/src/modules/interview/providers/AIProvider`, fallback to Gemini 1.5 Flash if Groq hits 429, and vice versa. This immediately doubles your daily interview limit.

---

## 7. Paid API Cost Breakdown per Single Interview (10 Questions)

When moving beyond free tiers, here is the exact cost per single 10-question interview across different AI and Speech providers.

### Token & Audio Consumption Assumptions (1 Full 10-Question Interview):
* **Input Tokens (Prompts + Q&A History + Evaluation Transcript):** ~9,000 tokens
* **Output Tokens (10 Question JSONs + 1 Evaluation Report):** ~3,000 tokens
* **Total LLM Tokens:** ~12,000 tokens
* **Speech-to-Text (STT) Audio:** 10 answers × ~35 sec = **~5.8 minutes of audio (~0.1 hr)**
* **Text-to-Speech (TTS):** Edge-TTS is currently integrated (100% Free / $0.00).

---

### A. Large Language Model (LLM) Cost per Interview

| Provider & Model | Pricing per 1M Input Tokens | Pricing per 1M Output Tokens | LLM Cost per 1 Interview (12k tokens) | Cost for 1,000 Interviews (USD) | Cost for 1,000 Interviews (INR @ ₹83/$) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Google Gemini 2.0 / 1.5 Flash** | $0.075 | $0.30 | **$0.0016 (~₹0.13)** | **$1.58** | **₹131** |
| **Groq (Llama 3.1 8B Instant)** | $0.050 | $0.08 | **$0.0007 (~₹0.06)** | **$0.69** | **₹57** |
| **DeepSeek-V3** | $0.140 | $0.28 | **$0.0021 (~₹0.17)** | **$2.10** | **₹174** |
| **OpenAI GPT-4o-mini** | $0.150 | $0.60 | **$0.0032 (~₹0.26)** | **$3.15** | **₹261** |
| **Groq (Llama 3.3 70B Versatile)** | $0.590 | $0.79 | **$0.0077 (~₹0.64)** | **$7.68** | **₹637** |
| **DeepSeek-R1 (Full Reasoning)** | $0.550 | $2.19 | **$0.0115 (~₹0.95)** | **$11.52** | **₹956** |
| **Google Gemini 1.5 Pro** | $1.250 | $5.00 | **$0.0263 (~₹2.18)** | **$26.25** | **₹2,178** |
| **OpenAI GPT-4o (Flagship)** | $2.500 | $10.00 | **$0.0525 (~₹4.35)** | **$52.50** | **₹4,357** |

---

### B. Speech-to-Text (STT) Cost per Interview (~5.8 mins audio)

| Speech Provider & Model | Pricing Model | STT Cost per 1 Interview (5.8 mins) | Cost for 1,000 Interviews (USD) | Cost for 1,000 Interviews (INR @ ₹83/$) |
| :--- | :--- | :--- | :--- | :--- |
| **Groq Whisper Large V3 Turbo** | $0.04 / hour ($0.00067/min) | **$0.0039 (~₹0.32)** | **$3.87** | **₹321** |
| **Groq Whisper Large V3** | $0.111 / hour ($0.00185/min) | **$0.0107 (~₹0.89)** | **$10.73** | **₹890** |
| **Deepgram Nova-2** | $0.0043 / min | **$0.0249 (~₹2.07)** | **$24.94** | **₹2,070** |
| **OpenAI Whisper API** | $0.0060 / min | **$0.0348 (~₹2.89)** | **$34.80** | **₹2,888** |

---

### C. Total Cost per Complete Voice Interview (End-to-End Combos)

Combining LLM + STT + TTS (Edge-TTS @ $0) gives the total real-world cost:

| Full Architecture Stack | STT Cost | LLM Cost | Total Cost per 1 Voice Interview | Total Cost for 1,000 Voice Interviews |
| :--- | :--- | :--- | :--- | :--- |
| **Combo 1: Ultra Budget High Speed**<br>*(Groq Whisper Turbo + Gemini 2.0 Flash)* | $0.0039 | $0.0016 | **$0.0055 (~₹0.45 / half a rupee)** | **$5.45 (₹452 INR)** |
| **Combo 2: Super Fast Open Source**<br>*(Groq Whisper + Groq Llama 3.3 70B)* | $0.0107 | $0.0077 | **$0.0184 (~₹1.53)** | **$18.41 (₹1,528 INR)** |
| **Combo 3: OpenAI Standard Stack**<br>*(OpenAI Whisper + GPT-4o-mini)* | $0.0348 | $0.0032 | **$0.0380 (~₹3.15)** | **$37.95 (₹3,149 INR)** |
| **Combo 4: Deep Reasoning Stack**<br>*(Groq Whisper Turbo + DeepSeek-R1 Evaluation)* | $0.0039 | $0.0115 | **$0.0154 (~₹1.28)** | **$15.39 (₹1,277 INR)** |
| **Combo 5: Flagship Premium Stack**<br>*(OpenAI Whisper + GPT-4o Full)* | $0.0348 | $0.0525 | **$0.0873 (~₹7.25)** | **$87.30 (₹7,245 INR)** |

---

### D. Text-Only Interview Cost (Zero Audio / STT)

If candidates type their answers (no voice transcription):

| Text-Only Provider | Cost per 1 Interview | Cost for 1,000 Interviews | Cost for 10,000 Interviews |
| :--- | :--- | :--- | :--- |
| **Llama 3.1 8B (Groq)** | **$0.0007 (~₹0.06)** | $0.69 (₹57) | $6.90 (₹570) |
| **Gemini 2.0 / 1.5 Flash** | **$0.0016 (~₹0.13)** | $1.58 (₹131) | $15.75 (₹1,307) |
| **DeepSeek-V3** | **$0.0021 (~₹0.17)** | $2.10 (₹174) | $21.00 (₹1,743) |
| **GPT-4o-mini** | **$0.0032 (~₹0.26)** | $3.15 (₹261) | $31.50 (₹2,615) |
| **Llama 3.3 70B (Groq)** | **$0.0077 (~₹0.64)** | $7.68 (₹637) | $76.80 (₹6,374) |
| **GPT-4o Full** | **$0.0525 (~₹4.35)** | $52.50 (₹4,357) | $525.00 (₹43,575) |

---

## 8. Summary Verdict & Financial Takeaways

1. **Voice Interviews are ~10x Cheaper with Groq Whisper than OpenAI Whisper:**
   - Groq Whisper Turbo is **~$0.0039 per interview**, whereas OpenAI Whisper is **~$0.0348 per interview**.
2. **Best Quality/Price Sweet Spot:**
   - **Groq Whisper Turbo (STT) + Gemini 2.0 Flash / GPT-4o-mini (LLM):** Gives near-instant sub-second latency and costs only **~₹0.45 to ₹0.70 INR per full voice interview**.
3. **Margin with Paid Candidate Credits:**
   - If you charge a user ₹49 or ₹99 per interview, your API cost is **< ₹1.50**, giving you a **97%+ gross profit margin**.

---

## 9. Free Stack Capacity Recap

On your **100% free stack** (Vercel + Render 512MB + MongoDB Atlas M0 + Groq Free):
* **3 to 5 candidates taking live voice interviews simultaneously.**
* **70 to 120 completed voice interviews per day.**
* **50 to 100 concurrent dashboard/results viewers.**
* **~7,000 lifetime stored interviews** before needing a database cleanup.

