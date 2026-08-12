"use client";

import { useCallback, useEffect, useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import { ApiClientError } from "@/lib/api/client";
import { listUsersAdmin } from "@/lib/api/users";
import type { UserProfile } from "@/types/user";
import AdminSection from "./AdminSection";

type UsersAdminSectionProps = {
  canView: boolean;
};

const UsersAdminSection = ({ canView }: UsersAdminSectionProps) => {
  const [items, setItems] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!canView) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setItems(await listUsersAdmin({ limit: 50 }));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không tải được users.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [canView]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminSection
      id="users"
      title="Người dùng"
      description="Danh sách user - chỉ ADMIN."
    >
      {!canView ? (
        <EmptyState
          title="Forbidden"
          description="Chỉ tài khoản ADMIN mới xem được danh sách users."
        />
      ) : loading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : items.length === 0 ? (
        <EmptyState title="Không có user" />
      ) : (
        <div className="overflow-x-auto rounded-[12px] border border-border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-border bg-secondary/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5 font-medium">Username</th>
                <th className="px-3 py-2.5 font-medium">Email</th>
                <th className="px-3 py-2.5 font-medium">Role</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((user) => (
                <tr key={user.id}>
                  <td className="px-3 py-2.5 font-medium">{user.username}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{user.email}</td>
                  <td className="px-3 py-2.5">{user.role}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{user.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminSection>
  );
};

export default UsersAdminSection;
