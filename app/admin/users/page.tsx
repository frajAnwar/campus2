import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/shared/Avatar";
import { RankBadge } from "@/components/gamification/RankBadge";
import { Search, Shield, Ban, MoreHorizontal } from "lucide-react";

type SearchParams = Promise<{
  search?: string;
  role?: string;
  page?: string;
}>;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const params = await searchParams;
  const search = params.search || "";
  const role = params.role || "";
  const page = parseInt(params.page || "1");
  const pageSize = 25;

  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            {
              username: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(role ? { role: role as any } : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        role: true,
        rank: true,
        xp: true,
        university: { select: { name: true } },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">User Management</h1>

      <div className="flex flex-wrap gap-2">
        <form className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="search"
              placeholder="Search users..."
              defaultValue={search}
              className="pl-9 w-64"
            />
          </div>
        </form>
        <div className="flex flex-wrap gap-1">
          {[
            "",
            "STUDENT",
            "EDUCATOR",
            "MODERATOR",
            "PLATFORM_ADMIN",
          ].map((r) => (
            <a
              key={r}
              href={`/admin/users?${r ? `role=${r}` : ""}${search ? `&search=${search}` : ""}`}
              className={`rounded-md px-2 py-1 text-xs font-medium ${
                role === r
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {r || "All"}
            </a>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No users found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-4">User</th>
                    <th className="pb-2 pr-4">Role</th>
                    <th className="pb-2 pr-4">Rank</th>
                    <th className="pb-2 pr-4">XP</th>
                    <th className="pb-2 pr-4">University</th>
                    <th className="pb-2 pr-4">Joined</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b last:border-0 hover:bg-accent/50"
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={user.image}
                            name={user.name}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="secondary" className="text-xs">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <RankBadge rank={user.rank} />
                      </td>
                      <td className="py-3 pr-4">
                        {user.xp.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-xs text-muted-foreground">
                        {user.university?.name || "—"}
                      </td>
                      <td className="py-3 pr-4 text-xs text-muted-foreground">
                        {user.createdAt.toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <form
                          action={async (formData) => {
                            "use server";
                            const { adminUpdateUserRole } = await import("@/actions/admin");
                            const newRole = formData.get("role") as any;
                            await adminUpdateUserRole({ userId: user.id, role: newRole });
                          }}
                          className="flex items-center gap-2"
                        >
                          <select 
                            name="role" 
                            defaultValue={user.role}
                            className="text-xs rounded border border-border/50 bg-transparent px-1 py-1"
                          >
                            <option value="STUDENT">Student</option>
                            <option value="EDUCATOR">Educator</option>
                            <option value="MODERATOR">Moderator</option>
                            <option value="PLATFORM_ADMIN">Admin</option>
                          </select>
                          <Button variant="ghost" size="sm" type="submit" title="Update Role">
                            <Shield className="h-4 w-4" />
                          </Button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {total > pageSize && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <a
              href={`/admin/users?page=${page - 1}${search ? `&search=${search}` : ""}${role ? `&role=${role}` : ""}`}
            >
              <Badge variant="secondary" className="cursor-pointer">
                Previous
              </Badge>
            </a>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {Math.ceil(total / pageSize)}
          </span>
          {page * pageSize < total && (
            <a
              href={`/admin/users?page=${page + 1}${search ? `&search=${search}` : ""}${role ? `&role=${role}` : ""}`}
            >
              <Badge variant="secondary" className="cursor-pointer">
                Next
              </Badge>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
