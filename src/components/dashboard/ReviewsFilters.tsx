'use client';

import { Icon } from '@iconify/react';

interface ReviewsFiltersProps {
  searchVal: string;
  setSearchVal: (val: string) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  onReset: () => void;
  setPage: (page: number) => void;
}

export default function ReviewsFilters({
  searchVal,
  setSearchVal,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  onReset,
  setPage,
}: ReviewsFiltersProps) {
  return (
    <div className="bg-white border border-border rounded-2xl p-4  flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative w-full md:max-w-xs">
        <span className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none">
          <Icon icon="lucide:search" className="w-4 h-4 text-text-muted" />
        </span>
        <input
          type="text"
          value={searchVal}
          onChange={(e) => {
            setSearchVal(e.target.value);
            setPage(1);
          }}
          placeholder="البحث عن..."
          className="w-full pl-3 pr-10 py-2.5 bg-white border border-border rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-primary/50 text-right font-medium"
        />
      </div>

      {/* Action Selectors */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        {/* Dropdown: عرض الجميع */}
        <div className="relative">
          <select
            className="appearance-none bg-white border border-border rounded-xl pl-8 pr-4 py-2 text-xs font-bold text-[#64748B] focus:outline-none text-right cursor-pointer"
            disabled
            defaultValue="عرض الجميع"
          >
            <option>عرض الجميع</option>
          </select>
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Icon icon="lucide:chevron-down" className="w-3.5 h-3.5 text-[#94A3B8]" />
          </span>
        </div>

        {/* Dropdown: تخصيص */}
        <div className="relative">
          <select
            className="appearance-none bg-white border border-border rounded-xl pl-8 pr-4 py-2 text-xs font-bold text-[#64748B] focus:outline-none text-right cursor-pointer"
            disabled
            defaultValue="تخصيص"
          >
            <option>تخصيص</option>
          </select>
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Icon icon="lucide:chevron-down" className="w-3.5 h-3.5 text-[#94A3B8]" />
          </span>
        </div>

        {/* Button: تصفية */}
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 bg-white border border-border px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-surface transition-all"
        >
          <span>تصفية</span>
          <Icon icon="lucide:sliders-horizontal" className="w-3.5 h-3.5 text-[#94A3B8]" />
        </button>

        {/* Dropdown: النوع */}
        <div className="relative flex items-center bg-white border border-border rounded-xl pl-8 pr-4 py-2 text-xs font-bold text-[#1E293B]">
          <span className="text-[#94A3B8] ml-1">النوع</span>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="appearance-none bg-transparent outline-none text-left cursor-pointer font-bold"
          >
            <option value="All">الكل</option>
            <option value="Organization">تسجيل جهة</option>
            <option value="User">تسجيل مستفيد</option>
            <option value="Program">نشر برنامج</option>
            <option value="Enrollment">انضمام</option>
            <option value="EditOrg">تعديل بيانات جهة</option>
            <option value="EditUser">تعديل بيانات مستفيد</option>
          </select>
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Icon icon="lucide:chevron-down" className="w-3.5 h-3.5 text-[#94A3B8]" />
          </span>
        </div>

        {/* Dropdown: الحالة */}
        <div className="relative flex items-center bg-white border border-border rounded-xl pl-8 pr-4 py-2 text-xs font-bold text-[#1E293B]">
          <span className="text-[#94A3B8] ml-1">الحالة</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="appearance-none bg-transparent outline-none text-left cursor-pointer font-bold"
          >
            <option value="All">الكل</option>
            <option value="PendingReview">تحت المراجعة</option>
            <option value="PendingApproval">تحت الموافقة</option>
            <option value="PendingPublish">تحت النشر</option>
            <option value="Approved">تمت الموافقة</option>
            <option value="Rejected">مرفوض</option>
          </select>
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Icon icon="lucide:chevron-down" className="w-3.5 h-3.5 text-[#94A3B8]" />
          </span>
        </div>
      </div>
    </div>
  );
}
