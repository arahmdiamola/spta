import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, User, QrCode, CreditCard, AlertTriangle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import AddChildButton from "./AddChildButton";
import AddContributionButton from "./AddContributionButton";
import ParentPhotoUpload from "@/components/ParentPhotoUpload";
import IdCardPreview from "@/components/IdCardPreview";
import SettlePenaltyButton from "./SettlePenaltyButton";
import { getSession } from "@/lib/auth";

export default async function ParentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;
  const parent = await prisma.parent.findUnique({
    where: { id },
    include: {
      children: true,
      penalties: { include: { event: true } },
      contributions: true,
      attendances: { include: { event: true }, orderBy: { timeIn: 'desc' }, take: 5 }
    }
  });

  if (!parent) {
    return <div className="p-8 text-center text-slate-500">Parent not found.</div>;
  }

  const unpaidPenalties = parent.penalties.filter(p => !p.isPaid);
  const totalUnpaid = unpaidPenalties.reduce((sum, p) => sum + p.amount, 0);

  const settingsRaw = await prisma.settings.findMany();
  let parentFee = 0;
  let studentFeeSum = 0;

  const idCardSettings = {
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
    if (s.key === "PER_PARENT_MEMBERSHIP_FEE") parentFee = parseFloat(s.value) || 0;
    if (s.key === "PER_STUDENT_CONTRIBUTIONS") {
      try {
        const fees = JSON.parse(s.value);
        studentFeeSum = fees.reduce((sum: number, f: any) => sum + (parseFloat(f.amount) || 0), 0);
      } catch (e) {}
    }
    
    // ID Card Settings
    if (s.key === "SCHOOL_NAME") idCardSettings.schoolName = s.value;
    if (s.key === "SCHOOL_ADDRESS") idCardSettings.schoolAddress = s.value;
    if (s.key === "SCHOOL_LOGO") idCardSettings.schoolLogo = s.value;
    if (s.key === "PRINCIPAL_NAME") idCardSettings.principalName = s.value;
    if (s.key === "PRINCIPAL_SIGNATURE") idCardSettings.principalSignature = s.value;
    if (s.key === "PTA_PRESIDENT_NAME") idCardSettings.ptaPresidentName = s.value;
    if (s.key === "PTA_PRESIDENT_SIGNATURE") idCardSettings.ptaPresidentSignature = s.value;
    if (s.key === "ID_CARD_TEMPLATE") idCardSettings.idCardTemplate = s.value;
    if (s.key === "CUSTOM_TEMPLATE_FRONT") idCardSettings.customTemplateFront = s.value;
    if (s.key === "CUSTOM_TEMPLATE_BACK") idCardSettings.customTemplateBack = s.value;
  });

  const totalDue = parentFee + (studentFeeSum * parent.children.length);
  const totalPaid = parent.contributions.reduce((sum, c) => sum + c.amountPaid, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center space-x-4">
        <Link href="/parents" className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{parent.name}</h1>
          <p className="text-slate-500">Parent / Guardian Profile</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Info & QR */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-4">
            <ParentPhotoUpload parentId={parent.id} initialPhoto={parent.photo} />
            <div>
              <h2 className="text-xl font-bold text-slate-900">{parent.name}</h2>
              <p className="text-slate-500">{parent.contactInfo || "No contact info"}</p>
            </div>
          </div>

          {/* ID Card Preview */}
          <IdCardPreview parent={parent} settings={idCardSettings} userRole={session?.user?.role} />
        </div>

        {/* Middle/Right Column: Children & Penalties */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Children */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Children</h3>
              <AddChildButton parentId={parent.id} />
            </div>
            
            <div className="space-y-3">
              {parent.children.length === 0 ? (
                <p className="text-slate-500 text-sm">No children added yet.</p>
              ) : (
                parent.children.map(child => (
                  <div key={child.id} className="p-4 rounded-2xl border border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                      <p className="font-semibold text-slate-900">{child.name}</p>
                      <p className="text-sm text-slate-500">Grade: {child.grade}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Absences & Penalties */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
              <AlertTriangle size={20} className="text-slate-500" />
              <span>Absences & Penalties</span>
            </h3>

            <div className="mb-6 bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-rose-700 text-sm font-medium">Total Unpaid Amount</p>
                <p className="font-bold text-2xl text-rose-900">₱{totalUnpaid}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-600 text-sm font-medium">Total Absences</p>
                <p className="font-bold text-xl text-slate-800">{parent.penalties.length}</p>
              </div>
            </div>

            {parent.penalties.length === 0 ? (
              <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 font-medium flex items-center space-x-2">
                <span>Perfect attendance. No penalties!</span>
              </div>
            ) : (
              <div className="space-y-3">
                {parent.penalties.map(penalty => (
                  <div key={penalty.id} className={`text-sm flex justify-between items-center p-3 rounded-xl border ${penalty.isPaid ? 'bg-slate-50 border-slate-100' : 'bg-white border-rose-200'}`}>
                    <div>
                      <span className={`font-semibold ${penalty.isPaid ? 'text-slate-700' : 'text-rose-800'}`}>{penalty.event.name}</span>
                      <p className="text-xs text-slate-500 mt-0.5">Absent - ₱{penalty.amount} • {format(new Date(penalty.event.date), "MMM d, yyyy")}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {penalty.isPaid ? (
                        <span className="text-emerald-600 font-medium text-xs px-2 py-1 bg-emerald-50 rounded-lg">Settled</span>
                      ) : (
                        <SettlePenaltyButton penaltyId={penalty.id} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Voluntary Contributions */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <CreditCard size={20} className="text-slate-500" />
                <span>Voluntary Contributions</span>
              </h3>
              <AddContributionButton parentId={parent.id} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-slate-500 text-sm font-medium">Total Due</p>
                <p className="font-bold text-xl text-slate-900">₱{totalDue}</p>
                <div className="mt-1 text-xs text-slate-400 space-y-0.5">
                  <p>Parent Fee: ₱{parentFee}</p>
                  <p>Student Fees: ₱{studentFeeSum} × {parent.children.length}</p>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-slate-500 text-sm font-medium">Total Paid</p>
                <p className="font-bold text-xl text-emerald-600">₱{totalPaid}</p>
                <p className="mt-1 text-xs text-slate-400">Balance: ₱{totalDue - totalPaid}</p>
              </div>
            </div>

            <div className="space-y-3">
              {parent.contributions.length === 0 ? (
                <p className="text-slate-500 text-sm">No payments recorded yet.</p>
              ) : (
                parent.contributions.map((c) => (
                  <div key={c.id} className="text-sm flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <div>
                      <span className="font-semibold text-slate-700">Payment</span>
                      <p className="text-xs text-slate-500 mt-0.5">{format(new Date(c.datePaid), "MMM d, yyyy h:mm a")}</p>
                    </div>
                    <span className="font-bold text-emerald-600">+ ₱{c.amountPaid}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
