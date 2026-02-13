"use server";

import { db } from "@/lib/db";
import { events, transactions, users } from "@/db/schema";
import { transactionSchema, eventSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { createSession, deleteSession, verifySession, getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import crypto from "crypto";

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

  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

  const user = db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .get();

  if (!user || user.passwordHash !== passwordHash) {
    return {
      status: "error",
      message: "Invalid username or password.",
      timestamp: Date.now(),
    };
  }

  await createSession(username);
  redirect("/events");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}

// --- Event Actions ---

function parseFormErrors(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = [];
    fieldErrors[key].push(issue.message);
  }
  return fieldErrors;
}

export async function createEvent(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    name: formData.get("name"),
    description: formData.get("description"),
  };

  const parsed = eventSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Validation failed. Please check the form.",
      errors: parseFormErrors(parsed.error),
      timestamp: Date.now(),
    };
  }

  try {
    db.insert(events).values(parsed.data).run();

    revalidatePath("/events");
    revalidatePath("/");

    return {
      status: "success",
      message: `Event created: ${parsed.data.name}`,
      timestamp: Date.now(),
    };
  } catch {
    return {
      status: "error",
      message: "Failed to create event. Please try again.",
      timestamp: Date.now(),
    };
  }
}

export async function updateEvent(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const denied = await requireSuperadmin();
  if (denied) return denied;

  const id = Number(formData.get("id"));
  if (!id || isNaN(id)) {
    return {
      status: "error",
      message: "Invalid event ID.",
      timestamp: Date.now(),
    };
  }

  const raw = {
    name: formData.get("name"),
    description: formData.get("description"),
  };

  const parsed = eventSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Validation failed. Please check the form.",
      errors: parseFormErrors(parsed.error),
      timestamp: Date.now(),
    };
  }

  try {
    db.update(events)
      .set(parsed.data)
      .where(eq(events.id, id))
      .run();

    revalidatePath("/events");
    revalidatePath("/");

    return {
      status: "success",
      message: `Event updated: ${parsed.data.name}`,
      timestamp: Date.now(),
    };
  } catch {
    return {
      status: "error",
      message: "Failed to update event. Please try again.",
      timestamp: Date.now(),
    };
  }
}

export async function deleteEvent(id: number): Promise<ActionState> {
  const denied = await requireSuperadmin();
  if (denied) return denied;

  try {
    db.delete(transactions).where(eq(transactions.eventId, id)).run();
    db.delete(events).where(eq(events.id, id)).run();

    revalidatePath("/events");
    revalidatePath("/");
    revalidatePath("/entry");
    revalidatePath("/reports");

    return {
      status: "success",
      message: "Event and its transactions deleted.",
      timestamp: Date.now(),
    };
  } catch {
    return {
      status: "error",
      message: "Failed to delete event. Please try again.",
      timestamp: Date.now(),
    };
  }
}

// --- Transaction Actions ---

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
    eventId: formData.get("eventId"),
  };

  const parsed = transactionSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Validation failed. Please check the form.",
      errors: parseFormErrors(parsed.error),
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
    eventId: formData.get("eventId"),
  };

  const parsed = transactionSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Validation failed. Please check the form.",
      errors: parseFormErrors(parsed.error),
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

// --- Superadmin Actions ---

async function requireSuperadmin(): Promise<ActionState | null> {
  const username = await getSessionUser();
  if (username !== "superadmin") {
    return {
      status: "error",
      message: "Only superadmin can perform this action.",
      timestamp: Date.now(),
    };
  }
  return null;
}

export async function deleteAllTransactions(eventId: number): Promise<ActionState> {
  const denied = await requireSuperadmin();
  if (denied) return denied;

  try {
    db.delete(transactions).where(eq(transactions.eventId, eventId)).run();

    revalidatePath("/entry");
    revalidatePath("/");
    revalidatePath("/reports");

    return {
      status: "success",
      message: "All transactions for this event deleted.",
      timestamp: Date.now(),
    };
  } catch {
    return {
      status: "error",
      message: "Failed to delete transactions. Please try again.",
      timestamp: Date.now(),
    };
  }
}

export async function resetUserPassword(targetUsername: string): Promise<ActionState> {
  const denied = await requireSuperadmin();
  if (denied) return denied;

  if (targetUsername === "superadmin") {
    return {
      status: "error",
      message: "Cannot reset superadmin password.",
      timestamp: Date.now(),
    };
  }

  const user = db
    .select()
    .from(users)
    .where(eq(users.username, targetUsername))
    .get();

  if (!user) {
    return {
      status: "error",
      message: `User "${targetUsername}" not found.`,
      timestamp: Date.now(),
    };
  }

  try {
    const newHash = crypto.createHash("sha256").update(targetUsername).digest("hex");
    db.update(users)
      .set({ passwordHash: newHash })
      .where(eq(users.username, targetUsername))
      .run();

    return {
      status: "success",
      message: `Password for "${targetUsername}" has been reset to their username.`,
      timestamp: Date.now(),
    };
  } catch {
    return {
      status: "error",
      message: "Failed to reset password. Please try again.",
      timestamp: Date.now(),
    };
  }
}

export async function getAllUsers(): Promise<{ username: string }[]> {
  const username = await getSessionUser();
  if (username !== "superadmin") return [];

  return db
    .select({ username: users.username })
    .from(users)
    .all()
    .filter((u) => u.username !== "superadmin");
}
