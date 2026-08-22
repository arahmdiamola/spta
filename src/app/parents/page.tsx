import { Users, Plus, Search, Printer } from "lucide-react";
import { calculateFeeDue } from "@/lib/fee-utils";
import prisma from "@/lib/prisma";
import Link from "next/link";
import BatchUploadButton from "./BatchUploadButton";
import { getSession } from "@/lib/auth";
import ParentSearch from "./ParentSearch";
import Pagination from "./Pagination";
import DeleteParentButton from "@/components/DeleteParentButton";

const PAGE_SIZE = 10;

export default async function ParentsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; sort?: string }> }) {
  const session = await getSession();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const isTeacher = session?.user?.role === "TEACHER";


  const resolvedParams = await searchParams;
  const q = resolvedParams?.q || "";
  const currentPage = parseInt(resolvedParams?.page || "1", 10);
  const sort = resolvedParams?.sort === "desc" ? "desc" : "asc";
  
  const where = q ? { name: { contains: q, mode: "insensitive" as const } } : {};

  // Fetch parents from database with pagination and search
  const [totalCount, parents] = await prisma.$transaction([
    prisma.parent.count({ where }),
    prisma.parent.findMany({
      where,
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        children: true,
        penalties: true,
        contributions: true,
      },
      orderBy: { name: sort }
    })
  ]);

  const feeCategories = await prisma.feeCategory.findMany();

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Parents</h1>
          <p className="text-slate-500 text-lg mt-1">Manage parent profiles, children, and contributions.</p>
        </div>
        <div className="flex items-center space-x-3">
          {isSuperAdmin && (
            <Link href="/parents/ids" className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 shadow-sm">
              <Printer size={20} className="text-slate-500" />
              <span>Export All IDs</span>
            </Link>
          )}
          {!isTeacher && (
            <>
              <BatchUploadButton />
              <Link href="/parents/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 shadow-sm">
                <Plus size={20} />
                <span>Add Parent</span>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Filters/Search */}
      <ParentSearch />

      {/* Parents List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Parent Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Children</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {parents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="p-4 bg-slate-50 rounded-full">
                        <Users size={32} className="text-slate-400" />
                      </div>
                      <p className="text-lg font-medium text-slate-900">No parents found</p>
                      <p className="text-sm">Get started by adding a new parent profile.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                parents.map((parent) => {
                  const unpaidPenalties = parent.penalties.filter(p => !p.isPaid).reduce((sum, p) => sum + p.amount, 0);
                  const totalDue = feeCategories.reduce((sum, fee) => sum + calculateFeeDue(fee, parent.children), 0);
                  const totalPaid = parent.contributions.reduce((sum, c) => sum + c.amountPaid, 0);
                  const unpaidContributions = Math.max(0, totalDue - totalPaid);
                  
                  return (
                    <tr key={parent.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{parent.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-1 flex-wrap gap-1">
                          {parent.children.map(child => (
                            <span key={child.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {child.name} ({child.grade})
                            </span>
                          ))}
                          {parent.children.length === 0 && <span className="text-slate-400 text-sm">None</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {parent.contactInfo || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1.5">
                          {unpaidPenalties > 0 && (
                            <span className="inline-flex w-max items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
                              ₱{unpaidPenalties} Penalty Unpaid
                            </span>
                          )}
                          
                          {totalDue > 0 && (
                            unpaidContributions === 0 ? (
                              <span className="inline-flex w-max items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                Contribs Settled
                              </span>
                            ) : totalPaid > 0 ? (
                              <span className="inline-flex w-max items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                                Partial (₱{unpaidContributions} Left)
                              </span>
                            ) : (
                              <span className="inline-flex w-max items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
                                ₱{unpaidContributions} Contrib Unpaid
                              </span>
                            )
                          )}

                          {unpaidPenalties === 0 && totalDue === 0 && (
                            <span className="inline-flex w-max items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                              Clear
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/parents/${parent.id}`} className="inline-block text-sm text-indigo-600 font-medium hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">View</Link>
                          {isSuperAdmin && (
                            <DeleteParentButton parentId={parent.id} parentName={parent.name} />
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <Pagination totalPages={Math.ceil(totalCount / PAGE_SIZE)} currentPage={currentPage} />
    </div>
  );
}
