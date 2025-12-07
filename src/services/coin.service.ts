import prisma from "../config/prisma";

export const getCoinBundles = async () => {
  const bundles = await prisma.coinBundle.findMany({
    orderBy: { amountINR: "asc" },
  });

  return bundles;
};

export const createOrder = async (userId: string, bundleId: number) => {
  // Fetch bundle
  const bundle = await prisma.coinBundle.findUnique({
    where: { id: bundleId },
  });

  if (!bundle) {
    throw new Error("Bundle not found");
  }

  // Create Razorpay order (dummy function for now)
  const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const orderDetails = {
    id: orderId,
    amount: bundle.amountINR * 100, // Convert to paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  // Save purchase record with status="pending"
  const purchase = await prisma.coinPurchase.create({
    data: {
      userId,
      bundleId,
      coins: bundle.coins,
      amountINR: bundle.amountINR,
      status: "pending",
      orderId: orderId,
    },
  });

  return {
    order: orderDetails,
    purchase,
  };
};

export const verifyPayment = async (
  orderId: string,
  paymentId: string,
  signature: string
) => {
  // Find purchase by orderId
  const purchase = await prisma.coinPurchase.findFirst({
    where: { orderId },
    include: { user: true, bundle: true },
  });

  if (!purchase) {
    throw new Error("Purchase not found");
  }

  // Verify Razorpay signature (dummy verification for now)
  // In production, use: crypto.createHmac('sha256', RAZORPAY_SECRET).update(orderId + "|" + paymentId).digest('hex')
  const isValidSignature = true; // TODO: Implement actual Razorpay signature verification

  if (!isValidSignature) {
    throw new Error("Invalid payment signature");
  }

  // If already processed, return
  if (purchase.status === "success") {
    return {
      message: "Payment already processed",
      purchase,
    };
  }

  // Update purchase status to success
  const updatedPurchase = await prisma.coinPurchase.update({
    where: { id: purchase.id },
    data: { status: "success" },
  });

  // Add coins to user
  await prisma.user.update({
    where: { id: purchase.userId },
    data: {
      coins: {
        increment: purchase.coins,
      },
    },
  });

  // Create CoinTransaction(type="purchase")
  await prisma.coinTransaction.create({
    data: {
      toUser: purchase.userId,
      coins: purchase.coins,
      type: "purchase",
    },
  });

  return {
    message: "Payment verified and coins added successfully",
    purchase: updatedPurchase,
  };
};

export const giftCoins = async (
  fromUserId: string,
  toUserId: string,
  coins: number
) => {
  // Check if recipient exists
  const recipient = await prisma.user.findUnique({
    where: { id: toUserId },
    select: { id: true },
  });

  if (!recipient) {
    throw new Error("Recipient user not found");
  }

  // Check sender has enough coins
  const sender = await prisma.user.findUnique({
    where: { id: fromUserId },
    select: { coins: true },
  });

  if (!sender) {
    throw new Error("Sender user not found");
  }

  if (sender.coins < coins) {
    throw new Error("Insufficient coins");
  }

  // Use transaction to ensure atomicity
  const result = await prisma.$transaction(async (tx) => {
    // Deduct coins from sender
    await tx.user.update({
      where: { id: fromUserId },
      data: {
        coins: {
          decrement: coins,
        },
      },
    });

    // Add coins to receiver
    await tx.user.update({
      where: { id: toUserId },
      data: {
        coins: {
          increment: coins,
        },
      },
    });

    // Create CoinTransaction(type="gift")
    const transaction = await tx.coinTransaction.create({
      data: {
        fromUser: fromUserId,
        toUser: toUserId,
        coins,
        type: "gift",
      },
    });

    return transaction;
  });

  return {
    message: "Coins gifted successfully",
    transaction: result,
  };
};

export const getTransactionHistory = async (userId: string) => {
  const transactions = await prisma.coinTransaction.findMany({
    where: {
      OR: [
        { fromUser: userId },
        { toUser: userId },
      ],
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      receiver: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return transactions;
};



