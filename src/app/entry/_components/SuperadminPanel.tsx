"use client";

import { useState } from "react";
import { deleteAllTransactions, resetUserPassword } from "@/lib/actions";
import { toast } from "sonner";

type SuperadminPanelProps = {
  users: { username: string }[];
  eventId: number;
};

export function SuperadminPanel({ users, eventId }: SuperadminPanelProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDeleteAll() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    const result = await deleteAllTransactions(eventId);
    if (result.status === "success") {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    setConfirmDelete(false);
  }

  async function handleResetPassword(username: string) {
    const result = await resetUserPassword(username);
    if (result.status === "success") {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  }

  return (
    <div className="mt-10 rounded-xl border border-red-200 bg-red-50 p-6">
      <h2 className="mb-4 text-lg font-semibold text-red-800">
        Superadmin Actions
      </h2>

      <div className="space-y-4">
        {/* Delete All Transactions */}
        <div className="flex items-center justify-between rounded-lg bg-surface p-4 shadow-sm">
          <div>
            <p className="font-medium text-text-primary">Delete All Transactions</p>
            <p className="text-sm text-text-muted">
              Permanently remove all transaction entries
            </p>
          </div>
          <button
            onClick={handleDeleteAll}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
              confirmDelete
                ? "bg-red-700 hover:bg-red-800"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {confirmDelete ? "Confirm Delete All" : "Delete All"}
          </button>
        </div>

        {/* Reset User Passwords */}
        <div className="rounded-lg bg-surface p-4 shadow-sm">
          <p className="mb-3 font-medium text-text-primary">Reset User Password</p>
          <p className="mb-3 text-sm text-text-muted">
            Reset password to the user&apos;s username
          </p>
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.username}
                className="flex items-center justify-between rounded-lg border border-border-light px-4 py-2"
              >
                <span className="text-sm font-medium text-text-secondary">
                  {user.username}
                </span>
                <button
                  onClick={() => handleResetPassword(user.username)}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-hover"
                >
                  Reset Password
                </button>
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-sm text-text-faint">No other users found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
