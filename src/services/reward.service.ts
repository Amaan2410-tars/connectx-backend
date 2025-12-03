import prisma from "../config/prisma";

export const getRewards = async () => {
  const rewards = await prisma.reward.findMany({
    orderBy: { pointsRequired: "asc" },
  });

  return rewards;
};

export const getRewardById = async (rewardId: string) => {
  const reward = await prisma.reward.findUnique({
    where: { id: rewardId },
  });

  if (!reward) {
    throw new Error("Reward not found");
  }

  return reward;
};

export const redeemReward = async (userId: string, rewardId: string) => {
  // Get user and reward
  const [user, reward] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    }),
    prisma.reward.findUnique({
      where: { id: rewardId },
    }),
  ]);

  if (!user) {
    throw new Error("User not found");
  }

  if (!reward) {
    throw new Error("Reward not found");
  }

  // Check if user has enough points
  if (user.points < reward.pointsRequired) {
    throw new Error("Insufficient points to redeem this reward");
  }

  // Deduct points
  await prisma.user.update({
    where: { id: userId },
    data: {
      points: {
        decrement: reward.pointsRequired,
      },
    },
  });

  return {
    message: "Reward redeemed successfully",
    remainingPoints: user.points - reward.pointsRequired,
  };
};

export const getCoupons = async (userId?: string) => {
  const where = userId
    ? {
        OR: [
          { usedBy: null },
          { usedBy: userId },
        ],
      }
    : { usedBy: null };

  const coupons = await prisma.coupon.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return coupons;
};

export const getCouponById = async (couponId: string) => {
  const coupon = await prisma.coupon.findUnique({
    where: { id: couponId },
  });

  if (!coupon) {
    throw new Error("Coupon not found");
  }

  return coupon;
};

export const redeemCoupon = async (userId: string, couponId: string) => {
  // Get coupon
  const coupon = await prisma.coupon.findUnique({
    where: { id: couponId },
  });

  if (!coupon) {
    throw new Error("Coupon not found");
  }

  // Check if already used
  if (coupon.usedBy) {
    throw new Error("Coupon has already been used");
  }

  // Check if expired
  if (new Date(coupon.expiry) < new Date()) {
    throw new Error("Coupon has expired");
  }

  // Mark as used
  await prisma.coupon.update({
    where: { id: couponId },
    data: {
      usedBy: userId,
      usedAt: new Date(),
    },
  });

  return {
    message: "Coupon redeemed successfully",
    coupon: {
      vendor: coupon.vendor,
      value: coupon.value,
      qrCode: coupon.qrCode,
    },
  };
};

