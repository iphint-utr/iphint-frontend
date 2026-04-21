'use client';

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Menu, Bell, Check, Search, Trash2 } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/routing';
import LocaleSwitcher from '@/components/layout/LocaleSwitcher';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

const apiClient = axios.create({ baseURL: `${BASE_URL}/api/v1` });
apiClient.interceptors.request.use((config) => {
	const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

interface NotificationItem {
	_id: string;
	title: string;
	message?: string;
	isRead?: boolean;
	actionUrl?: string;
	timestamp: string;
}

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
	const router = useRouter();
	const pathname = usePathname();
	const [notificationOpen, setNotificationOpen] = useState(false);
	const [notificationQuery, setNotificationQuery] = useState('');
	const [notifications, setNotifications] = useState<NotificationItem[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const menuRef = useRef<HTMLDivElement | null>(null);

	const pageTitle = (() => {
		if (!pathname) return 'Dashboard';
		if (pathname === '/dashboard') return 'Dashboard';
		if (pathname.startsWith('/dashboard/monitoring')) return 'Monitoring';
		if (pathname.startsWith('/dashboard/billing')) return 'Billing';
		if (pathname.startsWith('/dashboard/settings')) return 'Settings';
		if (pathname.startsWith('/dashboard/searches/')) return 'Details';
		if (pathname.startsWith('/dashboard/searches')) return 'Searches';
		return 'Dashboard';
	})();

	const loadNotifications = async (q = '') => {
		const { data } = await apiClient.get('/user-details/notifications', {
			params: { status: 'all', page: 1, limit: 8, q },
		});
		setNotifications(data?.notifications || []);
		setUnreadCount(data?.unreadCount || 0);
	};

	useEffect(() => {
		if (!notificationOpen) return;

		loadNotifications(notificationQuery).catch(() => {
			setNotifications([]);
		});
	}, [notificationOpen]);

	useEffect(() => {
		if (!notificationOpen) return;

		const timeout = window.setTimeout(() => {
			loadNotifications(notificationQuery).catch(() => {
				setNotifications([]);
			});
		}, 240);

		return () => window.clearTimeout(timeout);
	}, [notificationQuery, notificationOpen]);

	useEffect(() => {
		const closeOnOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setNotificationOpen(false);
			}
		};

		document.addEventListener('mousedown', closeOnOutside);
		return () => document.removeEventListener('mousedown', closeOnOutside);
	}, []);

	const markRead = async (id: string) => {
		await apiClient.patch(`/user-details/notifications/${id}/read`);
		setNotifications((prev) => prev.map((entry) => (entry._id === id ? { ...entry, isRead: true } : entry)));
		setUnreadCount((prev) => Math.max(0, prev - 1));
	};

	const removeNotification = async (id: string) => {
		await apiClient.delete(`/user-details/notifications/${id}`);
		setNotifications((prev) => prev.filter((entry) => entry._id !== id));
	};

	const markAllRead = async () => {
		await apiClient.patch('/user-details/notifications/read-all');
		setNotifications((prev) => prev.map((entry) => ({ ...entry, isRead: true })));
		setUnreadCount(0);
	};

	const goToNotification = async (item: NotificationItem) => {
		if (!item.isRead) {
			await markRead(item._id);
		}
		if (item.actionUrl) {
			router.push(item.actionUrl);
			setNotificationOpen(false);
		}
	};

	return (
		<header className="sticky top-0 z-20 h-16 border-b border-gray-200 bg-white shadow-sm">
			<div className="h-full px-6 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<button
						aria-label="Open sidebar"
						onClick={onMenuClick}
						className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
					>
						<Menu size={18} />
					</button>
					<h1 className="text-lg leading-6 font-semibold text-gray-900">{pageTitle}</h1>
				</div>

				<div className="flex items-center gap-2">
					<div ref={menuRef} className="relative">
						<button
							type="button"
							onClick={() => setNotificationOpen((prev) => !prev)}
							className="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
							aria-label="Open notifications"
						>
							<Bell size={16} />
							{unreadCount > 0 && (
								<span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
									{unreadCount > 9 ? '9+' : unreadCount}
								</span>
							)}
						</button>

						{notificationOpen && (
							<div className="absolute right-0 top-11 z-30 w-96 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
								<div className="mb-2 flex items-center justify-between">
									<p className="text-sm font-semibold text-gray-900">Notifications</p>
									<button
										type="button"
										onClick={markAllRead}
										className="text-xs text-gray-600 hover:text-gray-900"
									>
										Mark all read
									</button>
								</div>

								<div className="relative mb-2">
									<Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
									<input
										value={notificationQuery}
										onChange={(e) => setNotificationQuery(e.target.value)}
										placeholder="Search notifications"
										className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-3 text-xs text-gray-800 outline-none focus:border-gray-400"
									/>
								</div>

								<div className="max-h-80 space-y-2 overflow-y-auto pr-1">
									{notifications.length === 0 ? (
										<p className="rounded-lg border border-dashed border-gray-200 px-3 py-6 text-center text-xs text-gray-500">
											No notifications found.
										</p>
									) : (
										notifications.map((item) => (
											<div
												key={item._id}
												className={[
													'rounded-lg border px-2.5 py-2',
													item.isRead ? 'border-gray-200 bg-white' : 'border-emerald-200 bg-emerald-50/40',
												].join(' ')}
											>
												<div className="flex items-start gap-2">
													<button
														type="button"
														onClick={() => goToNotification(item)}
														className="min-w-0 flex-1 text-left"
													>
														<p className="line-clamp-1 text-xs font-semibold text-gray-900">{item.title}</p>
														{item.message && <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">{item.message}</p>}
														<p className="mt-1 text-[10px] text-gray-400">{new Date(item.timestamp).toLocaleString()}</p>
													</button>

													<div className="flex items-center gap-1">
														{!item.isRead && (
															<button
																type="button"
																onClick={() => markRead(item._id)}
																className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
																aria-label="Mark as read"
															>
																<Check className="h-3.5 w-3.5" />
															</button>
														)}
														<button
															type="button"
															onClick={() => removeNotification(item._id)}
															className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-red-200 bg-white text-red-600 hover:bg-red-50"
															aria-label="Delete notification"
														>
															<Trash2 className="h-3.5 w-3.5" />
														</button>
													</div>
												</div>
											</div>
										))
									)}
								</div>
							</div>
						)}
					</div>

					<LocaleSwitcher />
				</div>
			</div>
		</header>
	);
}
