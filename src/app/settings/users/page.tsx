import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import UserManagementTable from "@/components/UserManagementTable";

export default async function UsersPage() {
  const session = await getSession();

  // Only SUPER_ADMIN can access user management
  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" }
  });

  // Convert dates to string for serialization
  const serializedUsers = users.map(user => ({
    ...user,
    createdAt: user.createdAt.toISOString()
  }));

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <UserManagementTable initialUsers={serializedUsers} currentUserId={session.user.id} />
    </div>
  );
}
