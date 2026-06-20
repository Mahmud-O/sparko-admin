'use client';

interface ReviewsStatsProps {
  traineeCount: number;
  orgCount: number;
  programCount: number;
}

export default function ReviewsStats({
  traineeCount,
  orgCount,
  programCount,
}: ReviewsStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-3xl">
      {/* Purple Card - Trainees */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-4 h-31 flex flex-col gap-3 justify-between transition-all ">
        <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] border border-[#F3E8FF] flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#8B5CF6]">
            <path d="M12.75 15H2.25C1.84 15 1.4625 14.9 1.1175 14.7C0.7725 14.5 0.5 14.2275 0.3 13.8825C0.1 13.5375 0 13.16 0 12.75V0.75C0 0.54 0.0725 0.3625 0.2175 0.217501C0.3625 0.0725002 0.54 0 0.75 0H11.25C11.46 0 11.6375 0.0725002 11.7825 0.217501C11.9275 0.3625 12 0.54 12 0.75V9.75H15V12.75C15 13.16 14.9 13.5375 14.7 13.8825C14.5 14.2275 14.2275 14.5 13.8825 14.7C13.5375 14.9 13.16 15 12.75 15ZM12 11.25V12.75C12 12.96 12.0725 13.1375 12.2175 13.2825C12.3625 13.4275 12.54 13.5 12.75 13.5C12.96 13.5 13.1375 13.4275 13.2825 13.2825C13.4275 13.1375 13.5 12.96 13.5 12.75V11.25H12ZM10.5 13.5V1.5H1.5V12.75C1.5 12.96 1.5725 13.1375 1.7175 13.2825C1.8625 13.4275 2.04 13.5 2.25 13.5H10.5ZM3 3.75H9V5.25H3V3.75ZM3 6.75H9V8.25H3V6.75ZM3 9.75H6.75V11.25H3V9.75Z" fill="currentColor"/>
          </svg>
        </div>
        <div className="flex items-center justify-between w-full">
          <span className="text-[14px] font-bold text-[#1E293B]">تسجيل مستفيد</span>
          <span className="text-[26px] font-bold text-[#1E293B]">{traineeCount}</span>
        </div>
      </div>

      {/* Teal Card - Organizations */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-4 h-31 flex flex-col gap-3 justify-between transition-all ">
        <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] border border-[#D1FAE5] flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#10B981]">
            <path d="M12.75 15H2.25C1.84 15 1.4625 14.9 1.1175 14.7C0.7725 14.5 0.5 14.2275 0.3 13.8825C0.1 13.5375 0 13.16 0 12.75V0.75C0 0.54 0.0725 0.3625 0.2175 0.217501C0.3625 0.0725002 0.54 0 0.75 0H11.25C11.46 0 11.6375 0.0725002 11.7825 0.217501C11.9275 0.3625 12 0.54 12 0.75V9.75H15V12.75C15 13.16 14.9 13.5375 14.7 13.8825C14.5 14.2275 14.2275 14.5 13.8825 14.7C13.5375 14.9 13.16 15 12.75 15ZM12 11.25V12.75C12 12.96 12.0725 13.1375 12.2175 13.2825C12.3625 13.4275 12.54 13.5 12.75 13.5C12.96 13.5 13.1375 13.4275 13.2825 13.2825C13.4275 13.1375 13.5 12.96 13.5 12.75V11.25H12ZM10.5 13.5V1.5H1.5V12.75C1.5 12.96 1.5725 13.1375 1.7175 13.2825C1.8625 13.4275 2.04 13.5 2.25 13.5H10.5ZM3 3.75H9V5.25H3V3.75ZM3 6.75H9V8.25H3V6.75ZM3 9.75H6.75V11.25H3V9.75Z" fill="currentColor"/>
          </svg>
        </div>
        <div className="flex items-center justify-between w-full">
          <span className="text-[14px] font-bold text-[#1E293B]">تسجيل جهة</span>
          <span className="text-[26px] font-bold text-[#1E293B]">{orgCount}</span>
        </div>
      </div>

      {/* Yellow Card - Programs */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-4 h-31 flex flex-col gap-3 justify-between transition-all ">
        <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] border border-[#FEF08A] flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#F59E0B]">
            <path d="M12.75 15H2.25C1.84 15 1.4625 14.9 1.1175 14.7C0.7725 14.5 0.5 14.2275 0.3 13.8825C0.1 13.5375 0 13.16 0 12.75V0.75C0 0.54 0.0725 0.3625 0.2175 0.217501C0.3625 0.0725002 0.54 0 0.75 0H11.25C11.46 0 11.6375 0.0725002 11.7825 0.217501C11.9275 0.3625 12 0.54 12 0.75V9.75H15V12.75C15 13.16 14.9 13.5375 14.7 13.8825C14.5 14.2275 14.2275 14.5 13.8825 14.7C13.5375 14.9 13.16 15 12.75 15ZM12 11.25V12.75C12 12.96 12.0725 13.1375 12.2175 13.2825C12.3625 13.4275 12.54 13.5 12.75 13.5C12.96 13.5 13.1375 13.4275 13.2825 13.2825C13.4275 13.1375 13.5 12.96 13.5 12.75V11.25H12ZM10.5 13.5V1.5H1.5V12.75C1.5 12.96 1.5725 13.1375 1.7175 13.2825C1.8625 13.4275 2.04 13.5 2.25 13.5H10.5ZM3 3.75H9V5.25H3V3.75ZM3 6.75H9V8.25H3V6.75ZM3 9.75H6.75V11.25H3V9.75Z" fill="currentColor"/>
          </svg>
        </div>
        <div className="flex w-full items-center justify-between">
          <div className="text-[14px] font-bold text-[#1E293B]">نشر برنامج</div>
          <div className="text-[26px] font-bold text-[#1E293B]">{programCount}</div>
        </div>
      </div>
    </div>
  );
}
