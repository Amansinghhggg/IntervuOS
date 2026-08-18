import crypto from "crypto";
import Razorpay from "razorpay";
import User from "../users/user.model.js";
import Transaction from "./models/Transaction.js";

// Initialize Razorpay SDK instance safely
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (
    !key_id ||
    !key_secret ||
    key_id.includes("your_razorpay_key") ||
    key_secret.includes("your_razorpay_key")
  ) {
    return null;
  }

  return new Razorpay({ key_id, key_secret });
};

// Curated Practice Packs Specification (Source of Truth)
export const CURATED_BUNDLES = {
  bundle_starter: {
    id: "bundle_starter",
    title: "Starter Practice Pack",
    credits: 45,
    price: 99,
  },
  bundle_pro: {
    id: "bundle_pro",
    title: "Pro Placement Pack",
    credits: 150,
    price: 259, // Increased by 30% from ₹199 (₹258.7 -> ₹259)
  },
  bundle_master: {
    id: "bundle_master",
    title: "Master Placement Pack",
    credits: 400,
    price: 599, // Increased by 50% from ₹399 (₹598.5 -> ₹599)
  },
};

// @desc    Create Razorpay Order for Custom Credits or Curated Packs
// @route   POST /api/payments/create-order
// @access  Private (Candidate)
export const createOrder = async (req, res, next) => {
  try {
    const { credits, bundleId, planId } = req.body;
    const targetBundleId = bundleId || planId;

    let finalCredits;
    let amountInRupees;
    let description;

    if (targetBundleId && CURATED_BUNDLES[targetBundleId]) {
      const bundle = CURATED_BUNDLES[targetBundleId];
      finalCredits = bundle.credits;
      amountInRupees = bundle.price;
      description = `Purchased ${bundle.title} (${finalCredits} Credits)`;
    } else {
      finalCredits = parseInt(credits, 10) || 0;

      if (!finalCredits || finalCredits < 20) {
        return res.status(400).json({
          success: false,
          message: "Minimum custom credit purchase is 20 credits (₹50).",
        });
      }

      // Server-side dynamic rate calculation (<50 credits = ₹2.5, >=50 credits = ₹1.8)
      const rate = finalCredits < 50 ? 2.5 : 1.8;
      amountInRupees = Math.round(finalCredits * rate);
      description = `Purchased ${finalCredits} Custom Credits`;
    }

    const amountInPaise = amountInRupees * 100;

    const razorpay = getRazorpayInstance();

    // Fallback if Razorpay API keys are not configured or are placeholder values
    if (!razorpay) {
      const mockOrderId = `order_demo_${Date.now()}_${req.user._id.toString().slice(-4)}`;

      await Transaction.create({
        userId: req.user._id,
        type: "PURCHASE",
        credits: finalCredits,
        amount: amountInRupees,
        razorpayOrderId: mockOrderId,
        status: "created",
        description,
      });

      return res.status(200).json({
        success: true,
        orderId: mockOrderId,
        amount: amountInPaise,
        currency: "INR",
        key: "rzp_test_demoKey123",
        demoMode: true,
      });
    }

    // Live Razorpay Order Creation
    try {
      const orderOptions = {
        amount: amountInPaise,
        currency: "INR",
        receipt: `rec_${Date.now()}_${req.user._id.toString().slice(-4)}`,
      };

      const order = await razorpay.orders.create(orderOptions);

      // Save pending transaction record
      await Transaction.create({
        userId: req.user._id,
        type: "PURCHASE",
        credits: finalCredits,
        amount: amountInRupees,
        razorpayOrderId: order.id,
        status: "created",
        description,
      });

      return res.status(200).json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
      });
    } catch (razorpayError) {
      console.warn("Razorpay API order creation failed, switching to demo test mode:", razorpayError?.error?.description || razorpayError?.message);
      
      const mockOrderId = `order_demo_${Date.now()}_${req.user._id.toString().slice(-4)}`;
      await Transaction.create({
        userId: req.user._id,
        type: "PURCHASE",
        credits: finalCredits,
        amount: amountInRupees,
        razorpayOrderId: mockOrderId,
        status: "created",
        description,
      });

      return res.status(200).json({
        success: true,
        orderId: mockOrderId,
        amount: amountInPaise,
        currency: "INR",
        key: "rzp_test_demoKey123",
        demoMode: true,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay Payment HMAC Signature & Credit User Wallet
// @route   POST /api/payments/verify
// @access  Private (Candidate)
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, demoMode } = req.body;

    if (!razorpay_order_id) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    const transaction = await Transaction.findOne({ razorpayOrderId: razorpay_order_id });

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction record not found" });
    }

    // Handle demo / test environment verification fallback
    if (demoMode || !process.env.RAZORPAY_KEY_SECRET) {
      if (transaction.status !== "paid") {
        transaction.status = "paid";
        transaction.razorpayPaymentId = razorpay_payment_id || `pay_demo_${Date.now()}`;
        transaction.razorpaySignature = razorpay_signature || "demo_sig";
        await transaction.save();

        const updatedUser = await User.findByIdAndUpdate(
          transaction.userId,
          {
            $inc: {
              "credits.availableCredits": transaction.credits,
              "credits.totalPurchasedCredits": transaction.credits,
            },
            "credits.lastTopUpAt": new Date(),
          },
          { new: true }
        );

        return res.status(200).json({
          success: true,
          message: `Successfully credited ${transaction.credits} credits to your account!`,
          user: updatedUser,
        });
      }

      return res.status(200).json({ success: true, message: "Payment already verified" });
    }

    // Production Cryptographic Signature Verification
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Idempotency Check: Avoid duplicate crediting
      if (transaction.status !== "paid") {
        transaction.status = "paid";
        transaction.razorpayPaymentId = razorpay_payment_id;
        transaction.razorpaySignature = razorpay_signature;
        await transaction.save();

        // Atomic Wallet Credit
        const updatedUser = await User.findByIdAndUpdate(
          transaction.userId,
          {
            $inc: {
              "credits.availableCredits": transaction.credits,
              "credits.totalPurchasedCredits": transaction.credits,
            },
            "credits.lastTopUpAt": new Date(),
          },
          { new: true }
        );

        return res.status(200).json({
          success: true,
          message: `Payment verified! Added ${transaction.credits} credits.`,
          user: updatedUser,
        });
      }

      return res.status(200).json({ success: true, message: "Payment already processed" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Mark Razorpay Order as Failed / Cancelled
// @route   POST /api/payments/fail-order or POST /api/payments/cancel-order
// @access  Private (Candidate)
export const failOrder = async (req, res, next) => {
  try {
    const { orderId, reason } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    const transaction = await Transaction.findOne({
      razorpayOrderId: orderId,
      userId: req.user._id,
    });

    if (transaction && transaction.status === "created") {
      transaction.status = "failed";
      if (reason) {
        transaction.description = `${transaction.description} (${reason})`;
      }
      await transaction.save();
    }

    res.status(200).json({
      success: true,
      message: "Order marked as cancelled/failed",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Candidate Credit Transaction History
// @route   GET /api/payments/history
// @access  Private (Candidate)
export const getCreditHistory = async (req, res, next) => {
  try {
    // Auto-mark stale "created" transactions older than 10 minutes as "failed"
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    await Transaction.updateMany(
      {
        userId: req.user._id,
        status: "created",
        createdAt: { $lt: tenMinutesAgo },
      },
      {
        $set: { status: "failed" },
      }
    );

    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const formattedHistory = transactions.map((tx) => ({
      _id: tx._id,
      id: tx._id,
      type: tx.type,
      description: tx.description,
      credits: tx.credits,
      amount: tx.amount,
      createdAt: tx.createdAt,
      date: new Date(tx.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      status: tx.status === "paid" ? "completed" : tx.status,
      razorpayPaymentId: tx.razorpayPaymentId,
    }));

    res.status(200).json({
      success: true,
      history: formattedHistory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Razorpay Webhook Handler (Fallback for browser tab closure)
// @route   POST /api/payments/webhook
// @access  Public (Razorpay Signature Encrypted)
export const handleWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return res.status(200).send("Webhook secret not configured");
    }

    const signature = req.headers["x-razorpay-signature"];
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (expectedSignature === signature) {
      const event = req.body.event;

      if (event === "payment.captured") {
        const paymentEntity = req.body.payload.payment.entity;
        const orderId = paymentEntity.order_id;

        const transaction = await Transaction.findOne({ razorpayOrderId: orderId });
        if (transaction && transaction.status !== "paid") {
          transaction.status = "paid";
          transaction.razorpayPaymentId = paymentEntity.id;
          await transaction.save();

          await User.findByIdAndUpdate(transaction.userId, {
            $inc: {
              "credits.availableCredits": transaction.credits,
              "credits.totalPurchasedCredits": transaction.credits,
            },
            "credits.lastTopUpAt": new Date(),
          });
        }
      }
      return res.status(200).json({ status: "ok" });
    }

    res.status(400).send("Invalid webhook signature");
  } catch (error) {
    next(error);
  }
};
