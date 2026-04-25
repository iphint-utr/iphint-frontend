'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, ExternalLink, Trash2, X } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { AppDispatch, RootState } from '@/lib/store/store';
import { fetchDashboardData } from '@/lib/store/slices/userSlice';
import {
	bulkDeleteMonitoringResults,
	deleteMonitoringResult,
	fetchMonitoringSearchResults,
	ReviewStatus,
	updateMonitoringResultStatus,
} from '@/lib/store/slices/monitoringSlice';

type BulkAction = ReviewStatus | 'delete' | '__none';

type DeleteConfirmState =
	| {
		mode: 'single';
		resultId: string;
		count: 1;
	  }
	| {
		mode: 'bulk';
		count: number;
	  }
	| null;

const REVIEW_STATUS_OPTIONS: Array<{ value: ReviewStatus; label: string }> = [
	{ value: 'not_reviewed', label: 'Not Reviewed' },
	{ value: 'reviewed', label: 'Reviewed' },
	{ value: 'rights_given', label: 'Rights Given' },
	{ value: 'dispute', label: 'Dispute' },
	{ value: 'escalated', label: 'Escalated' },
];

const BULK_ACTION_OPTIONS: Array<{ value: BulkAction; label: string }> = [
	{ value: '__none', label: 'Bulk Action' },
	...REVIEW_STATUS_OPTIONS,
	{ value: 'delete', label: 'Delete' },
];

export default function SearchDetailsPage() {
	const dispatch = useDispatch<AppDispatch>();
	const router = useRouter();
	const params = useParams();
	const id = params?.id as string;
	const [selectedResultIds, setSelectedResultIds] = useState<string[]>([]);
	const [bulkAction, setBulkAction] = useState<BulkAction>('__none');
	const [isBulkUpdating, setIsBulkUpdating] = useState(false);
	const [previewResultId, setPreviewResultId] = useState<string | null>(null);
	const [deleteConfirmState, setDeleteConfirmState] = useState<DeleteConfirmState>(null);
	const { selectedSearch, results, planLimits, resultsLoading, updatingResultId, deletingResultId, bulkDeleting, error } = useSelector(
		(state: RootState) => state.monitoring,
	);

	useEffect(() => {
		if (id) {
			dispatch(fetchMonitoringSearchResults(id));
		}
	}, [dispatch, id]);

	useEffect(() => {
		setSelectedResultIds([]);
	}, [id]);

	const reviewedCount = useMemo(
		() =>
			results.filter((result) =>
				['reviewed', 'rights_given', 'dispute', 'escalated'].includes(result.reviewStatus),
			).length,
		[results],
	);

	const previewResult = useMemo(
		() => results.find((result) => result._id === previewResultId) || null,
		[results, previewResultId],
	);

	const handleStatusChange = (resultId: string, reviewStatus: ReviewStatus) => {
		dispatch(updateMonitoringResultStatus({ resultId, reviewStatus })).then(() => {
			dispatch(fetchMonitoringSearchResults(id));
			dispatch(fetchDashboardData());
		});
	};

	const allSelected = results.length > 0 && selectedResultIds.length === results.length;

	const toggleAll = () => {
		if (allSelected) {
			setSelectedResultIds([]);
			return;
		}
		setSelectedResultIds(results.map((result) => result._id));
	};

	const toggleOne = (resultId: string) => {
		setSelectedResultIds((prev) =>
			prev.includes(resultId) ? prev.filter((entry) => entry !== resultId) : [...prev, resultId],
		);
	};

	const applyBulkAction = async () => {
		if (!selectedResultIds.length || !id || bulkAction === '__none') return;

		if (bulkAction === 'delete') {
			setDeleteConfirmState({ mode: 'bulk', count: selectedResultIds.length });
			return;
		}

		try {
			setIsBulkUpdating(true);
			await Promise.all(
				selectedResultIds.map((resultId) =>
					dispatch(updateMonitoringResultStatus({ resultId, reviewStatus: bulkAction })).unwrap(),
				),
			);

			await dispatch(fetchMonitoringSearchResults(id));
			await dispatch(fetchDashboardData());
			setSelectedResultIds([]);
		} finally {
			setIsBulkUpdating(false);
		}
	};

	const requestDeleteResult = (resultId: string) => {
		setDeleteConfirmState({ mode: 'single', resultId, count: 1 });
	};

	const confirmDelete = async () => {
		if (!deleteConfirmState) return;

		if (deleteConfirmState.mode === 'single') {
			await dispatch(deleteMonitoringResult(deleteConfirmState.resultId)).unwrap();
			setSelectedResultIds((prev) => prev.filter((entry) => entry !== deleteConfirmState.resultId));
		} else {
			await dispatch(bulkDeleteMonitoringResults(selectedResultIds)).unwrap();
			setSelectedResultIds([]);
		}

		await dispatch(fetchMonitoringSearchResults(id));
		await dispatch(fetchDashboardData());
		setDeleteConfirmState(null);
	};

	const closePreview = () => setPreviewResultId(null);

	useEffect(() => {
		if (!previewResultId) return;

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				closePreview();
			}
		};

		window.addEventListener('keydown', handleEscape);
		return () => window.removeEventListener('keydown', handleEscape);
	}, [previewResultId]);

	useEffect(() => {
		if (!deleteConfirmState) return;

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setDeleteConfirmState(null);
			}
		};

		window.addEventListener('keydown', handleEscape);
		return () => window.removeEventListener('keydown', handleEscape);
	}, [deleteConfirmState]);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-gray-900">Search Results Review</h1>
					<p className="mt-1 text-sm text-gray-500">
						Update status per found image to move this search from monitoring to analysis complete.
					</p>
				</div>
				<button
					onClick={() => router.push('/dashboard/monitoring')}
					className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
				>
					Back to Monitoring
				</button>
			</div>

			<div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<div>
						<p className="text-xs uppercase tracking-wide text-gray-500">Search ID</p>
						<p className="mt-1 text-sm font-medium text-gray-900 break-all">{id}</p>
					</div>
					<div>
						<p className="text-xs uppercase tracking-wide text-gray-500">File</p>
						<p className="mt-1 text-sm font-medium text-gray-900">{selectedSearch?.fileName || '-'}</p>
					</div>
					<div>
						<p className="text-xs uppercase tracking-wide text-gray-500">Progress</p>
						<p className="mt-1 text-sm font-medium text-gray-900">
							{reviewedCount}/{results.length} reviewed
						</p>
					</div>
				</div>
			</div>

			<div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
				{(planLimits?.lockedCount || 0) > 0 && (
					<div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
						{planLimits?.lockedCount} result{planLimits?.lockedCount === 1 ? '' : 's'} hidden by plan limit. Upgrade to unlock full thumbnails and source links.
						<button
							type="button"
							onClick={() => router.push('/dashboard/billing')}
							className="ml-2 cursor-pointer font-semibold underline"
						>
							Upgrade plan
						</button>
					</div>
				)}

				<div className="border-b border-gray-200 bg-white p-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={allSelected}
								onChange={toggleAll}
								disabled={resultsLoading || results.length === 0 || isBulkUpdating}
								aria-label="Select all result images"
								className="h-4 w-4 cursor-pointer rounded border-gray-300 text-gray-900 focus:ring-gray-400"
							/>
							<p className="text-sm text-gray-600">
								{selectedResultIds.length > 0
									? `${selectedResultIds.length} image${selectedResultIds.length > 1 ? 's' : ''} selected`
									: 'Select all'}
							</p>
						</div>
						<div className="flex items-center gap-2">
							<div className="relative inline-block">
									<select
										value={bulkAction}
										onChange={(event) => setBulkAction(event.target.value as BulkAction)}
										disabled={isBulkUpdating || resultsLoading || selectedResultIds.length === 0}
										className="w-40 sm:w-44 cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3.5 pr-9 text-sm text-gray-900 shadow-sm outline-none transition-colors focus:border-gray-400 focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
									>
										{BULK_ACTION_OPTIONS.map((option) => (
											<option key={option.value} value={option.value} className="bg-white text-gray-900">
												{option.label}
											</option>
										))}
									</select>
									<ChevronDown
										size={14}
										className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500"
									/>
							</div>

							<button
								onClick={applyBulkAction}
								disabled={isBulkUpdating || resultsLoading || bulkDeleting || selectedResultIds.length === 0 || bulkAction === '__none'}
								className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
							>
								{isBulkUpdating || bulkDeleting ? 'Working...' : 'Apply'}
							</button>
						</div>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full border-collapse text-left">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-4 py-3 w-12" />
								<th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Image</th>
								<th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Details</th>
								<th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
								<th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Source</th>
								<th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 text-right">Action</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{resultsLoading ? (
								<tr>
									<td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">
										Loading results...
									</td>
								</tr>
							) : results.length === 0 ? (
								<tr>
									<td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">
										No result images found for this search.
									</td>
								</tr>
							) : (
								results.map((result) => (
									<tr key={result._id}>
										<td className="px-4 py-3">
											<input
												type="checkbox"
												checked={selectedResultIds.includes(result._id)}
												onChange={() => toggleOne(result._id)}
												disabled={isBulkUpdating}
												aria-label="Select result image"
												className="h-4 w-4 cursor-pointer rounded border-gray-300 text-gray-900 focus:ring-gray-400 disabled:cursor-not-allowed"
											/>
										</td>
										<td className="px-4 py-3">
											<button
												type="button"
												onClick={() => setPreviewResultId(result._id)}
												disabled={result.isLocked}
												className="cursor-pointer rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
												aria-label="Open image preview"
											>
												<img
													src={result.image}
													alt={result.details?.title || 'result image'}
													className={[
														'h-16 w-16 rounded-lg border border-gray-200 object-cover',
														result.isLocked ? 'blur-sm opacity-70' : '',
													].join(' ')}
												/>
											</button>
										</td>
										<td className="px-4 py-3 min-w-65">
											<p className="text-sm font-medium text-gray-900 line-clamp-2">
												{result.isLocked ? 'Upgrade plan to view this result' : (result.details?.title || 'Untitled result')}
											</p>
											<p className="mt-1 text-xs text-gray-500">{result.details?.source || 'Unknown source'}</p>
										</td>
										<td className="px-4 py-3">
											<div className="relative inline-block">
												<select
													value={result.reviewStatus || 'not_reviewed'}
													disabled={updatingResultId === result._id || isBulkUpdating}
													onChange={(event) =>
														handleStatusChange(result._id, event.target.value as ReviewStatus)
													}
													className="w-40 sm:w-44 cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3.5 pr-9 text-sm text-gray-900 shadow-sm outline-none transition-colors focus:border-gray-400 focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
												>
													{REVIEW_STATUS_OPTIONS.map((option) => (
														<option key={option.value} value={option.value} className="bg-white text-gray-900">
															{option.label}
														</option>
													))}
												</select>
												<ChevronDown
													size={14}
													className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500"
												/>
											</div>
										</td>
										<td className="px-4 py-3">
											{result.details?.link && !result.isLocked ? (
												<a
													href={result.details.link}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
												>
													Visit <ExternalLink className="h-3.5 w-3.5" />
												</a>
											) : result.isLocked ? (
												<span className="text-sm text-amber-700">Upgrade required</span>
											) : (
												<span className="text-sm text-gray-400">No link</span>
											)}
										</td>
										<td className="px-4 py-3 text-right">
											<button
												onClick={() => requestDeleteResult(result._id)}
												disabled={deletingResultId === result._id || isBulkUpdating || bulkDeleting}
												className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
												aria-label="Delete result"
												title="Delete result"
											>
												<Trash2
													size={15}
													strokeWidth={2}
													className={deletingResultId === result._id ? 'animate-pulse' : ''}
												/>
											</button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{error && <p className="text-sm text-red-600">{error}</p>}

			{previewResult && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
					onClick={closePreview}
				>
					<div
						className="relative w-full max-w-xl rounded-xl bg-white shadow-xl"
						onClick={(event) => event.stopPropagation()}
					>
						<button
							type="button"
							onClick={closePreview}
							className="absolute right-3 top-3 cursor-pointer rounded-md border border-gray-200 bg-white p-1 text-gray-600 hover:bg-gray-50"
							aria-label="Close preview"
						>
							<X className="h-4 w-4" />
						</button>

						<div className="p-5">
							<img
								src={previewResult.image}
								alt={previewResult.details?.title || 'result image preview'}
								className="max-h-[65vh] w-full rounded-lg border border-gray-200 object-contain"
							/>

							<div className="mt-4 space-y-1">
								<p className="text-sm font-semibold text-gray-900">
									{previewResult.details?.title || 'Untitled result'}
								</p>
								<p className="text-xs text-gray-600">
									Source: {previewResult.details?.source || 'Unknown source'}
								</p>
								<p className="text-xs text-gray-600">
									Status: {(previewResult.reviewStatus || 'not_reviewed').replace('_', ' ')}
								</p>
							</div>
						</div>
					</div>
				</div>
			)}

			{deleteConfirmState && (
				<div
					className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
					onClick={() => setDeleteConfirmState(null)}
				>
					<div
						className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-xl"
						onClick={(event) => event.stopPropagation()}
					>
						<div className="border-b border-gray-100 px-5 py-4">
							<h3 className="text-base font-semibold text-gray-900">Confirm Deletion</h3>
							<p className="mt-1 text-sm text-gray-600">
								{deleteConfirmState.mode === 'single'
									? 'This will permanently remove the selected result image from this review.'
									: `This will permanently remove ${deleteConfirmState.count} selected result image(s) from this review.`}
							</p>
						</div>

						<div className="px-5 py-4">
							<p className="text-xs text-gray-500">
								This action cannot be undone.
							</p>
						</div>

						<div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
							<button
								type="button"
								onClick={() => setDeleteConfirmState(null)}
								className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={confirmDelete}
								disabled={bulkDeleting || !!deletingResultId}
								className="cursor-pointer rounded-lg border border-red-200 bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
							>
								{bulkDeleting || deletingResultId ? 'Deleting...' : 'Delete'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
