"use server";

import { db } from "@/lib/db";
import { transactions } from "@/db/schema";
import { transactionSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { createSession, deleteSession, verifySession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

export type ActionState = {
  status: "idle" | "success" | "error";
  message: string;
  errors?: Record<string, string[] | undefined>;
  timestamp?: number;
};

// --- Auth Actions ---

export async function login(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const validUser = process.env.ADMIN_USER || "admin";
  const validPass = process.env.ADMIN_PASSWORD || "admin";

  if (username !== validUser || password !== validPass) {
    return {
      status: "error",
      message: "Invalid username or password.",
      timestamp: Date.now(),
    };
  }

  await createSession();
  redirect("/entry");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}

// --- Transaction Actions ---

function parseTransactionErrors(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = [];
    fieldErrors[key].push(issue.message);
  }
  return fieldErrors;
}

export async function addTransaction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    date: formData.get("date"),
    name: formData.get("name"),
    amount: formData.get("amount"),
    type: formData.get("type"),
    description: formData.get("description"),
  };

  const parsed = transactionSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Validation failed. Please check the form.",
      errors: parseTransactionErrors(parsed.error),
      timestamp: Date.now(),
    };
  }

  try {
    db.insert(transactions).values(parsed.data).run();

    revalidatePath("/entry");
    revalidatePath("/");
    revalidatePath("/reports");

    return {
      status: "success",
      message: `Transaction added: ${parsed.data.name} - Rs. ${parsed.data.amount}`,
      timestamp: Date.now(),
    };
  } catch {
    return {
      status: "error",
      message: "Failed to save transaction. Please try again.",
      timestamp: Date.now(),
    };
  }
}

export async function updateTransaction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const isAuth = await verifySession();
  if (!isAuth) {
    return {
      status: "error",
      message: "Unauthorized. Please log in.",
      timestamp: Date.now(),
    };
  }

  const id = Number(formData.get("id"));
  if (!id || isNaN(id)) {
    return {
      status: "error",
      message: "Invalid transaction ID.",
      timestamp: Date.now(),
    };
  }

  const raw = {
    date: formData.get("date"),
    name: formData.get("name"),
    amount: formData.get("amount"),
    type: formData.get("type"),
    description: formData.get("description"),
  };

  const parsed = transactionSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Validation failed. Please check the form.",
      errors: parseTransactionErrors(parsed.error),
      timestamp: Date.now(),
    };
  }

  try {
    db.update(transactions)
      .set(parsed.data)
      .where(eq(transactions.id, id))
      .run();

    revalidatePath("/entry");
    revalidatePath("/");
    revalidatePath("/reports");

    return {
      status: "success",
      message: `Transaction updated: ${parsed.data.name} - Rs. ${parsed.data.amount}`,
      timestamp: Date.now(),
    };
  } catch {
    return {
      status: "error",
      message: "Failed to update transaction. Please try again.",
      timestamp: Date.now(),
    };
  }
}

export async function deleteTransaction(id: number): Promise<ActionState> {
  const isAuth = await verifySession();
  if (!isAuth) {
    return {
      status: "error",
      message: "Unauthorized. Please log in.",
      timestamp: Date.now(),
    };
  }

  try {
    db.delete(transactions).where(eq(transactions.id, id)).run();

    revalidatePath("/entry");
    revalidatePath("/");
    revalidatePath("/reports");

    return {
      status: "success",
      message: "Transaction deleted successfully.",
      timestamp: Date.now(),
    };
  } catch {
    return {
      status: "error",
      message: "Failed to delete transaction. Please try again.",
      timestamp: Date.now(),
    };
  }
}
