'use client';

import { Icon } from '@iconify/react';
import type { ReviewLogItem } from '@/lib/types';
import { STATUS_CONFIG, TYPE_CONFIG } from '@/lib/constants';

interface ReviewsTableProps {
  logs: ReviewLogItem[];
  loading: boolean;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onOpenPreview: (item: ReviewLogItem) => void;
}

export default function ReviewsTable({
  logs,
  loading,
  page,
  setPage,
  totalPages,
  totalCount,
  pageSize,
  onOpenPreview,
}: ReviewsTableProps) {
  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden ">
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-white text-right border-b border-gray-50 text-xs text-[#94A3B8]">
              <th className="py-4 px-6 whitespace-nowrap">نوع الطلب</th>
              <th className="py-4 px-6 whitespace-nowrap">الاسم</th>
              <th className="py-4 px-6 whitespace-nowrap text-center">تاريخ الطلب</th>
              <th className="py-4 px-6 whitespace-nowrap text-center">الحالة</th>
              <th className="py-4 px-6 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-xs text-text-primary">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-text-muted">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-primary" />
                    <span>جاري تحميل سجلات المراجعة...</span>
                  </div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-text-muted">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Icon icon="lucide:inbox" className="w-10 h-10 text-text-muted/60" />
                    <span>لا توجد طلبات مراجعة مطابقة للفلاتر المحددة</span>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((item) => {
                let status = STATUS_CONFIG[item.status];
                if (!status) {
                  const statusLower = (item.status || '').toLowerCase();
                  if (statusLower.includes('pending')) {
                    status = {
                      label: 'تحت المراجعة',
                      textClass: 'text-[#FF5500]',
                      bgClass: 'bg-[#FFF7ED]',
                      borderClass: 'border-[#FEDBB2]',
                    };
                  } else if (statusLower.includes('approve')) {
                    status = {
                      label: 'تم القبول',
                      textClass: 'text-[#34DEA7]',
                      bgClass: 'bg-[#E6FAF4]',
                      borderClass: 'border-[#A7F3D0]',
                    };
                  } else if (statusLower.includes('reject')) {
                    status = {
                      label: 'مرفوض',
                      textClass: 'text-[#EF4444]',
                      bgClass: 'bg-[#FEF2F2]',
                      borderClass: 'border-[#FECFCF]',
                    };
                  } else {
                    status = {
                      label: item.status || '—',
                      textClass: 'text-[#FF5500]',
                      bgClass: 'bg-[#FFF0E8]',
                      borderClass: 'border-[#FFD5C2]',
                    };
                  }
                }
                const dateStr = item.requestDate
                  ? new Date(item.requestDate)
                      .toLocaleDateString('zh-Hans-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })
                      .replace(/\//g, '/')
                  : '—';

                return (
                  <tr key={`${item.requestType}-${item.targetId}`} className="hover:bg-surface/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-[#64748B]">
                      {TYPE_CONFIG[item.requestType] || item.requestType}
                    </td>
                    <td className="py-4 px-6 text-[#1E293B]">{item.name || '—'}</td>
                    <td className="py-4 px-6 text-[#94A3B8] text-center font-sans">{dateStr}</td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-4 py-2 rounded-full font-bold text-[10px] w-[80%] whitespace-nowrap ${status.textClass} ${status.bgClass} ${status.borderClass} border`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="py-4 px-6 flex items-center justify-center">
                      <button
                        onClick={() => onOpenPreview(item)}
                        className="text-xs font-bold text-[#0107FF] hover:text-[#004099] hover:underline transition-colors px-3.5 pl-3 py-1.5 rounded-lg hover:bg-[#0056CC]/5 cursor-pointer"
                      >
                        معاينة
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Table Pagination Footer ── */}
      {!loading && logs.length > 0 && (
        <div className="p-4 border-t border-border flex items-center justify-between text-xs text-text-secondary bg-white">
          <span>
            عرض {Math.min((page - 1) * pageSize + 1, totalCount)}-{Math.min(page * pageSize, totalCount)} من أصل{' '}
            {totalCount} سجلات
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-2 border border-border bg-white rounded-xl hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="الصفحة السابقة"
            >
              <Icon icon="lucide:chevron-right" className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const pIndex = i + 1;
              const isSelected = page === pIndex;
              return (
                <button
                  key={pIndex}
                  onClick={() => setPage(pIndex)}
                  className={`px-3 py-1.5 border rounded-xl font-bold transition-all ${
                    isSelected
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-white text-text-secondary hover:bg-surface'
                  }`}
                >
                  {pIndex}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-2 border border-border bg-white rounded-xl hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="الصفحة التالية"
            >
              <Icon icon="lucide:chevron-left" className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
