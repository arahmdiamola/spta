import prisma from "@/lib/prisma";
import ParentIdCard, { IDCardSettings } from "@/components/ParentIdCard";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import PrintButton from "@/components/PrintButton";
import BatchDownloadZipButton from "@/components/BatchDownloadZipButton";

export default async function BatchExportIdsPage() {
  const session = await getSession();
  
  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const parents = await prisma.parent.findMany({
    include: { children: true },
    orderBy: { name: 'asc' }
  });

  const settingsRaw = await prisma.settings.findMany();
  const settings: IDCardSettings = {
    schoolName: "",
    schoolAddress: "",
    schoolLogo: "",
    principalName: "",
    principalSignature: "",
    ptaPresidentName: "",
    ptaPresidentSignature: "",
    idCardTemplate: "wave-blue",
    customTemplateFront: "",
    customTemplateBack: ""
  };

  settingsRaw.forEach(s => {
    if (s.key === "SCHOOL_NAME") settings.schoolName = s.value;
    if (s.key === "SCHOOL_ADDRESS") settings.schoolAddress = s.value;
    if (s.key === "SCHOOL_LOGO") settings.schoolLogo = s.value;
    if (s.key === "PRINCIPAL_NAME") settings.principalName = s.value;
    if (s.key === "PRINCIPAL_SIGNATURE") settings.principalSignature = s.value;
    if (s.key === "PTA_PRESIDENT_NAME") settings.ptaPresidentName = s.value;
    if (s.key === "PTA_PRESIDENT_SIGNATURE") settings.ptaPresidentSignature = s.value;
    if (s.key === "ID_CARD_TEMPLATE") settings.idCardTemplate = s.value;
    if (s.key === "CUSTOM_TEMPLATE_FRONT") settings.customTemplateFront = s.value;
    if (s.key === "CUSTOM_TEMPLATE_BACK") settings.customTemplateBack = s.value;
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
            <h1 className="text-xl font-bold text-slate-900">Batch Export IDs</h1>
            <p className="text-sm text-slate-500">{parents.length} total parents</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <BatchDownloadZipButton parentsCount={parents.length} />
          <PrintButton />
        </div>
      </div>

      {/* Grid of IDs */}
      {/* We use standard A4 grid for print. Tailwind grid handles this well. */}
      <div className="max-w-5xl mx-auto pb-10 print:pb-0 px-4 print:px-0">
        <div className="flex flex-wrap gap-[0.5in] justify-center print:justify-start print:gap-[0.2in]">
          {parents.map(parent => (
            <div key={parent.id} className="break-inside-avoid mb-4 print:mb-0" data-id-card-export="true" data-parent-name={parent.name}>
              <ParentIdCard parent={parent} settings={settings} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
