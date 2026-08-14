import Link from "next/link";
import { Users, Calendar, AlertTriangle, ArrowRight, Wallet, ReceiptText } from "lucide-react";
import prisma from "@/lib/prisma";
import AddExpenseButton from "./AddExpenseButton";
import { format } from "date-fns";

import { getSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getSession();
  const isTeacher = session?.user?.role === "TEACHER";

  const [totalParents, upcomingEvents, unpaidPenaltiesList, contributions, paidPenalties, expenses] = await Promise.all([
    prisma.parent.count(),
    prisma.event.count({ where: { date: { gte: new Date() } } }),
    prisma.penalty.findMany({ where: { isPaid: false } }),
    prisma.contribution.findMany(),
    prisma.penalty.findMany({ where: { isPaid: true } }),
    prisma.expense.findMany({ orderBy: { date: 'desc' } })
  ]);

  const unpaidPenalties = unpaidPenaltiesList.reduce((sum, p) => sum + p.amount, 0);
  const totalContributions = contributions.reduce((sum, c) => sum + c.amountPaid, 0);
  const totalPaidPenalties = paidPenalties.reduce((sum, p) => sum + p.amount, 0);
  const totalExpensesAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const ptaFunds = totalContributions + totalPaidPenalties - totalExpensesAmount;

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <header className="space-y-2">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 text-lg">Overview of SPTA activities and metrics.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Total Parents</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{totalParents}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Calendar size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Upcoming Events</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{upcomingEvents}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl">
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Unpaid Penalties</p>
            <p className="text-3xl font-black text-slate-900 mt-1">₱{unpaidPenalties}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
            <Wallet size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase">PTA Funds</p>
            <p className="text-3xl font-black text-slate-900 mt-1">₱{ptaFunds}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Expenses Log */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
                  <ReceiptText size={24} className="text-rose-500" />
                  <span>Expenses Log</span>
                </h2>
                <p className="text-slate-500 text-sm mt-1">Track funds spent by the PTA.</p>
              </div>
              {!isTeacher && <AddExpenseButton />}
            </div>

            <div className="space-y-4">
              {expenses.length === 0 ? (
                <div className="p-8 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                  <p className="text-slate-500 font-medium">No expenses recorded yet.</p>
                </div>
              ) : (
                expenses.map(expense => (
                  <div key={expense.id} className="p-4 rounded-2xl border border-slate-100 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-bold text-slate-900">{expense.description}</p>
                      <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                        <span>Requested by: {expense.requestedBy}</span>
                        <span>•</span>
                        <span>{format(new Date(expense.date), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                    <div className="font-bold text-rose-600 text-lg">
                      - ₱{expense.amount}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div>
          {/* Quick Actions */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">Quick Actions</h2>
            <div className="flex flex-col space-y-4">
              <Link href="/scanner" className="p-5 border-2 border-slate-100 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50/50 transition-all flex items-center justify-between group">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-700 transition-colors">Scan QR Code</h3>
                  <p className="text-slate-500 text-sm mt-1">Record attendance</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                   <ArrowRight size={20} />
                </div>
              </Link>
              <Link href="/events" className="p-5 border-2 border-slate-100 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50/50 transition-all flex items-center justify-between group">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-700 transition-colors">Manage Events</h3>
                  <p className="text-slate-500 text-sm mt-1">Meetings & clean-ups</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                   <ArrowRight size={20} />
                </div>
              </Link>
              {!isTeacher && (
                <Link href="/settings" className="p-5 border-2 border-slate-100 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50/50 transition-all flex items-center justify-between group">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-700 transition-colors">Settings</h3>
                    <p className="text-slate-500 text-sm mt-1">Configure PTA fees</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                     <ArrowRight size={20} />
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
