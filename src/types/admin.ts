export interface AdminPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AdminRecentActivity {
  type: string;
  userId: string;
  userName: string;
  userEmail: string;
  timestamp: string;
  description: string;
  details: Record<string, unknown>;
}

export interface AdminDashboardData {
  totalContent: number;
  underAnalysis: number;
  analysisComplete: number;
  memberCount: number;
  activeSubscriptions: number;
  searchesToday: number;
  revenueThisMonth: number;
  recentActivity: AdminRecentActivity[];
}

export interface AdminSubscriptionSummary {
  tier: string;
  status: string;
}

export interface AdminUserListItem {
  _id: string;
  name: string;
  email: string;
  status: string;
  subscription: AdminSubscriptionSummary | null;
  joiningDate: string;
  searchCount: number;
}

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface AdminUsersResponse {
  data: AdminUserListItem[];
  pagination: AdminPagination;
}

export interface AdminMemberSearch {
  _id: string;
  image: string;
  status: string;
  date: string;
}

export interface AdminMemberSubscription {
  planId: string;
  status: string;
  billingCycle: string;
}

export interface AdminMemberDetails {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  joiningDate: string;
  role: string;
  isActive: boolean;
  isApproved: boolean;
  credits: number;
  monitors: number;
  subscriptionId: string;
  subscription: AdminMemberSubscription | null;
  searchCount: number;
  searches: AdminMemberSearch[];
  referralCode: string;
  referralCount: number;
}

export interface AdminUserSearchesQuery {
  userId: string;
  page?: number;
  limit?: number;
}

export interface AdminUserSearchesResponse {
  userId: string;
  data: AdminMemberSearch[];
  pagination: AdminPagination;
}

export interface AdminDeactivateUserPayload {
  userId: string;
  reason?: string;
}

export interface AdminDeactivateUserResult {
  userId: string;
  email: string;
  isActive: boolean;
  message: string;
}

export interface AdminSearchListItem {
  _id: string;
  image: string;
  fileName: string;
  uploaderId: string;
  uploaderName: string;
  status: string;
  discoveryCount: number;
  uploadDate: string;
}

export interface AdminSearchesQuery {
  page?: number;
  limit?: number;
  status?: string;
  userName?: string;
}

export interface AdminSearchesResponse {
  data: AdminSearchListItem[];
  pagination: AdminPagination;
}

export interface AdminUsageStatusItem {
  status: string;
  count: number;
}

export interface AdminUsageTopUploader {
  name: string;
  uploads: number;
}

export interface AdminApiUsageSummary {
  generatedAt: string;
  sampleSize: number;
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  failedRequests: number;
  searchesToday: number;
  activeMembers: number;
  averageDiscoveries: number;
  successRate: number;
  topUploaders: AdminUsageTopUploader[];
  statusBreakdown: AdminUsageStatusItem[];
}