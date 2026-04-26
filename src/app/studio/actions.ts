"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { clearAdminSession, isAdminAuthenticated } from "@/lib/admin-auth";
import {
  deleteProduct,
  deleteSubmission,
  productFromFormData,
  updateSubmissionStatus,
  upsertProduct,
  type ContactSubmissionStatus,
} from "@/lib/managed-data";

async function requireAdminAction() {
  if (!(await isAdminAuthenticated())) {
    redirect("/studio/login");
  }
}

function redirectWithError(message: string) {
  redirect(`/studio?error=${encodeURIComponent(message)}`);
}

function revalidateManagedPages() {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/studio");
}

export async function saveProductAction(formData: FormData) {
  await requireAdminAction();

  const previousSlug = String(formData.get("previousSlug") ?? "") || undefined;
  const product = productFromFormData(formData);

  if (!product.name || !product.slug || !product.summary) {
    redirectWithError("Product name, slug and summary are required.");
  }

  try {
    await upsertProduct(product, previousSlug);
    revalidateManagedPages();
  } catch (error) {
    redirectWithError(error instanceof Error ? error.message : "Unable to save product.");
  }
}

export async function deleteProductAction(formData: FormData) {
  await requireAdminAction();

  try {
    const slug = String(formData.get("slug") ?? "");
    await deleteProduct(slug);
    revalidateManagedPages();
  } catch (error) {
    redirectWithError(error instanceof Error ? error.message : "Unable to delete product.");
  }
}

export async function updateSubmissionStatusAction(formData: FormData) {
  await requireAdminAction();

  try {
    const id = String(formData.get("id") ?? "");
    const status = String(formData.get("status") ?? "new") as ContactSubmissionStatus;
    await updateSubmissionStatus(id, status);
    revalidatePath("/studio");
  } catch (error) {
    redirectWithError(error instanceof Error ? error.message : "Unable to update submission.");
  }
}

export async function deleteSubmissionAction(formData: FormData) {
  await requireAdminAction();

  try {
    const id = String(formData.get("id") ?? "");
    await deleteSubmission(id);
    revalidatePath("/studio");
  } catch (error) {
    redirectWithError(error instanceof Error ? error.message : "Unable to delete submission.");
  }
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/studio/login");
}
