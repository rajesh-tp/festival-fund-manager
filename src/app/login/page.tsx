import { verifySession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./_components/LoginForm";

export default async function LoginPage() {
  const isAuthenticated = await verifySession();
  if (isAuthenticated) {
    redirect("/entry");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <svg
              className="h-6 w-6 text-amber-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-stone-800">Admin Login</h1>
          <p className="mt-1 text-sm text-stone-500">
            Sign in to manage transactions
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
