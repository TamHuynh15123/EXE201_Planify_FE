export type BillingCycle = 'monthly' | 'yearly' | 'lifetime';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending';
export type TransactionStatus = 'success' | 'failed' | 'pending';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: BillingCycle;
  aiRequestsLimit: number;
  aiRefineLimit?: number | null;
  storageLimitMb: number;
  maxPlans: number;
  features: string; // JSON string or comma separated
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSubscription {
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startedAt: string;
  expiresAt: string | null;
  aiRequestsUsed: number;
  cancelledAt: string | null;
  plan?: SubscriptionPlan;
  
  planName?: string;
  PlanName?: string;
  aiRequestsLimit?: number;
  AiRequestsLimit?: number;
  storageLimitMb?: number;
  StorageLimitMb?: number;
  maxPlans?: number;
  MaxPlans?: number;
  aiRefineUsed?: number;
  AiRefineUsed?: number;
  aiRefineLimit?: number | null;
  AiRefineLimit?: number | null;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  amount: number;
  status: TransactionStatus;
  paymentMethod: string;
  paidAt: string;
}

export interface CreateSubscriptionPlanDto {
  name: string;
  price: number;
  billingCycle: BillingCycle;
  aiRequestsLimit: number;
  storageLimitMb: number;
  maxPlans: number;
  features: string;
}

export interface UpgradeSubscriptionDto {
  planId: string;
  paymentMethod: string;
  returnUrl?: string;
  cancelUrl?: string;
}
