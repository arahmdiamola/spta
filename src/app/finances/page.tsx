import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { calculateFeeDue, getApplicableChildrenCount } from "@/lib/fee-utils";
import { Receipt } from "lucide-react";
import Link from "next/link";
import ExportFinancesButton from "@/components/ExportFinancesButton";
import Pagination from "../parents/Pagination";
import clsx from "clsx";

const PAGE_SIZE = 10;

export default async function FinancesPage({ searchParams }: { searchParams: Promise<{ tab?: string, page?: string }> }) {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (session?.user?.role === "TEACHER") {
    redirect("/");
  }


  const resolvedParams = await searchParams;
  
  const [totalParents, allChildren] = await Promise.all([
    prisma.parent.count(),
    prisma.child.findMany({ select: { grade: true } })
  ]);

  const feeCategories = await prisma.feeCategory.findMany({
    orderBy: { name: 'asc' }
  });

  const reports = await Promise.all(feeCategories.map(async (fee) => {
    const expected = fee.type === 'PER_PARENT' ? fee.amount * totalParents : fee.amount * getApplicableChildrenCount(fee, allChildren);
    const agg = await prisma.contribution.aggregate({
      where: { feeCategoryId: fee.id },
      _sum: { amountPaid: true }
    });
    const collected = agg._sum.amountPaid || 0;
    
    return {
      fee,
      expected,
      collected,
      balance: expected - collected,
    };
  }));

  const uncategorizedAgg = await prisma.contribution.aggregate({
    where: { feeCategoryId: null },
    _sum: { amountPaid: true }
  });
  const uncategorizedPaid = uncategorizedAgg._sum.amountPaid || 0;

  const currentTabId = resolvedParams?.tab || (reports.length > 0 ? reports[0].fee.id : "");
  const activeReport = reports.find(r => r.fee.id === currentTabId);
  const currentPage = parseInt(resolvedParams?.page || "1", 10);

  let activeReportDetails: any[] = [];
  let totalPages = 0;

  if (activeReport) {
    const [totalActiveParents, paginatedParents] = await prisma.$transaction([
      prisma.parent.count(),
      prisma.parent.findMany({
        skip: (currentPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          children: { select: { grade: true } },
          contributions: {
            where: { feeCategoryId: currentTabId }
          }
        },
        orderBy: { name: 'asc' }
      })
    ]);

    totalPages = Math.ceil(totalActiveParents / PAGE_SIZE);

    activeReportDetails = paginatedParents.map(p => {
      const childCount = getApplicableChildrenCount(activeReport.fee, p.children);
      const due = activeReport.fee.type === 'PER_PARENT' 
        ? activeReport.fee.amount 
        : activeReport.fee.amount * childCount;
        
      const paid = p.contributions.reduce((sum, c) => sum + c.amountPaid, 0);
      
      return {
        parent: p,
        childCount,
        due,
        paid,
        balance: due - paid
      };
    });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Finances & Reports</h1>
          <p className="text-slate-500 mt-1">Track fee collections and remittances</p>
        </div>
        <div>
          <ExportFinancesButton />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Expected</p>
          <p className="text-3xl font-bold text-slate-900">
            ₱{reports.reduce((sum, r) => sum + r.expected, 0)}
          </p>
        </div>
        <div className="bg-emerald-50 rounded-3xl p-6 shadow-sm border border-emerald-100">
          <p className="text-sm font-medium text-emerald-700 mb-1">Total Collected</p>
          <p className="text-3xl font-bold text-emerald-600">
            ₱{reports.reduce((sum, r) => sum + r.collected, 0) + uncategorizedPaid}
          </p>
        </div>
        <div className="bg-rose-50 rounded-3xl p-6 shadow-sm border border-rose-100">
          <p className="text-sm font-medium text-rose-700 mb-1">Total Outstanding</p>
          <p className="text-3xl font-bold text-rose-600">
            ₱{reports.reduce((sum, r) => sum + r.balance, 0)}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {reports.length > 0 && (
          <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto pb-px">
            {reports.map((report) => {
              const isActive = report.fee.id === currentTabId;
              return (
                <Link
                  key={report.fee.id}
                  href={`?tab=${report.fee.id}`}
                  className={clsx(
                    "whitespace-nowrap py-3 px-5 border-b-2 font-medium text-sm transition-colors",
                    isActive
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  )}
                >
                  {report.fee.name}
                </Link>
              );
            })}
          </div>
        )}

        {activeReport && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{activeReport.fee.name}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {activeReport.fee.type === 'PER_PARENT' ? 'Per Parent' : 'Per Student'} • ₱{activeReport.fee.amount}
                </p>
              </div>
              <div className="flex gap-6 sm:text-right">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Collected</p>
                  <p className="font-bold text-emerald-600">₱{activeReport.collected}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expected</p>
                  <p className="font-bold text-slate-900">₱{activeReport.expected}</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Parent Name</th>
                    <th className="px-6 py-4 font-semibold text-right">Due</th>
                    <th className="px-6 py-4 font-semibold text-right">Paid</th>
                    <th className="px-6 py-4 font-semibold text-right">Balance</th>
                    <th className="px-6 py-4 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeReportDetails.map((detail) => (
                    <tr key={detail.parent.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/parents/${detail.parent.id}`} className="font-medium text-indigo-600 hover:underline">
                          {detail.parent.name}
                        </Link>
                        {activeReport.fee.type === 'PER_STUDENT' && (
                          <span className="ml-2 text-xs text-slate-400">({detail.childCount} kids)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-600">₱{detail.due}</td>
                      <td className="px-6 py-4 text-right font-medium text-emerald-600">₱{detail.paid}</td>
                      <td className="px-6 py-4 text-right font-medium text-slate-900">₱{detail.balance}</td>
                      <td className="px-6 py-4 text-center">
                        {detail.balance <= 0 ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            Settled
                          </span>
                        ) : detail.paid > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Partial
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                            Unpaid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <Pagination totalPages={totalPages} currentPage={currentPage} />
          </div>
        )}

        {uncategorizedPaid > 0 && (
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Legacy / Uncategorized Payments</h2>
            <p className="text-slate-600 mt-2">
              Total collected: <strong>₱{uncategorizedPaid}</strong>
            </p>
            <p className="text-sm text-slate-500 mt-1">These are payments recorded before specific fee tracking was enabled.</p>
          </div>
        )}
        
        {reports.length === 0 && (
          <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 text-center">
            <Receipt className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No Fee Categories</h3>
            <p className="text-slate-500 mt-1">Define fee categories in Settings to see detailed reports.</p>
            <Link href="/settings" className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700">
              Go to Settings
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
