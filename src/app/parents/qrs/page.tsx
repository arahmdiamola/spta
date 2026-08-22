import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import PrintButton from "@/components/PrintButton";
import BatchDownloadQrZipButton from "@/components/BatchDownloadQrZipButton";
import { QRCodeSVG } from "qrcode.react";

export default async function BatchExportQrsPage() {
  const session = await getSession();
  
  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const parents = await prisma.parent.findMany({
    orderBy: { name: 'asc' }
  });

  const settingsRaw = await prisma.settings.findMany();
  let schoolName = "School Name";

  settingsRaw.forEach(s => {
    if (s.key === "SCHOOL_NAME") schoolName = s.value;
  });

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Non-printable header */}
      <div className="bg-white p-4 shadow-sm border-b border-slate-200 flex justify-between items-center print:hidden mb-8 sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <Link href="/parents" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Batch Export QR Passes</h1>
            <p className="text-sm text-slate-500">{parents.length} total parents</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <BatchDownloadQrZipButton parentsCount={parents.length} />
          <PrintButton />
        </div>
      </div>

      {/* Grid of QRs */}
      <div className="max-w-5xl mx-auto pb-10 print:pb-0 px-4 print:px-0">
        <div className="flex flex-wrap gap-[0.5in] justify-center print:justify-start print:gap-[0.2in]">
          {parents.map(parent => (
            <div 
              key={parent.id} 
              className="break-inside-avoid mb-4 print:mb-0 bg-white border border-slate-200 flex flex-col items-center justify-center shrink-0 p-4 shadow-sm"
              style={{ width: "2.5in", height: "3.5in" }}
              data-qr-card-export="true" 
              data-parent-name={parent.name}
            >
              <h2 className="text-sm font-black text-slate-800 text-center uppercase tracking-wide leading-tight mb-6">
                {schoolName}
              </h2>
              
              <div className="p-3 bg-white border-2 border-slate-100 rounded-xl shadow-sm mb-6">
                <QRCodeSVG value={parent.qrCodeId} size={140} />
              </div>
              
              <h1 className="text-lg font-black text-slate-900 text-center leading-tight uppercase">
                {parent.name}
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                Scan to Record Attendance
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
