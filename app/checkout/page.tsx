import React from "react";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CheckoutFlow } from "@/components/CheckoutFlow";

interface CheckoutPageProps {
  searchParams: {
    unitId?: string;
    coupon?: string;
  };
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  let targetUnitId = searchParams.unitId;

  // Fallback if accessed directly: grab first available unit
  if (!targetUnitId) {
    const fallback = await prisma.unit.findFirst({
      where: { status: "AVAILABLE" },
    });
    if (fallback) {
      targetUnitId = fallback.id;
    }
  }

  if (!targetUnitId) {
    redirect("/");
  }

  const unit = await prisma.unit.findUnique({
    where: { id: targetUnitId },
    include: {
      product: true,
    },
  });

  if (!unit) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <CheckoutFlow unit={unit} initialCoupon={searchParams.coupon} />
    </div>
  );
}
