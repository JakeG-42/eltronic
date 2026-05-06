"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  clearAdminSession,
  getCurrentAdminUser,
  userCanManageSiteContent,
  userCanManageSubmissions,
  userCanManageUsers,
} from "@/lib/admin-auth";
import {
  contactNotificationSettingsFromFormData,
  deleteAdminUser,
  deleteProduct,
  deleteProductMediaReferences,
  deleteSubmission,
  deleteSubmissions,
  productFromFormData,
  saveAdminUser,
  siteBuilderFromFormData,
  updateOwnAdminAccount,
  updateContactNotificationSettings,
  updateSubmissionStatus,
  updateSubmissionStatuses,
  updateSiteBuilderSettings,
  upsertProduct,
  type ContactSubmissionStatus,
} from "@/lib/managed-data";
import { normalizeAdminRole, normalizeAdminStatus } from "@/lib/admin-user-model";
import { deleteStudioFiles, saveStudioUploadedFiles } from "@/lib/studio-files";
import { writeTemplateFile } from "@/lib/template-editor";

async function requireAdminAction() {
  const user = await getCurrentAdminUser();

  if (!user) {
    redirect("/studio/login");
  }

  return user;
}

function getReturnTo(formData: FormData, fallback = "/studio/products") {
  const returnTo = String(formData.get("returnTo") ?? "").trim();

  return returnTo.startsWith("/studio") ? returnTo : fallback;
}

function redirectWithError(message: string, returnTo = "/studio/products"): never {
  const separator = returnTo.includes("?") ? "&" : "?";
  redirect(`${returnTo}${separator}error=${encodeURIComponent(message)}`);
}

function revalidateManagedPages() {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/studio");
  revalidatePath("/studio/files");
  revalidatePath("/studio/media");
  revalidatePath("/studio/products");
  revalidatePath("/studio/builder");
  revalidatePath("/studio/submissions");
}

export async function saveProductAction(formData: FormData) {
  const user = await requireAdminAction();

  const returnTo = getReturnTo(formData);

  if (!userCanManageSiteContent(user)) {
    redirectWithError("This account cannot manage product content.", returnTo);
  }

  const previousSlug = String(formData.get("previousSlug") ?? "") || undefined;
  const product = productFromFormData(formData);

  if (!product.name || !product.slug || !product.summary) {
    redirectWithError("Product name, slug and summary are required.", returnTo);
  }

  if (!product.image.src) {
    redirectWithError("At least one product image URL is required.", returnTo);
  }

  try {
    await upsertProduct(product, previousSlug);
    revalidateManagedPages();
  } catch (error) {
    redirectWithError(error instanceof Error ? error.message : "Unable to save product.", returnTo);
  }

  redirect(returnTo);
}

export async function deleteProductAction(formData: FormData) {
  const user = await requireAdminAction();
  const returnTo = getReturnTo(formData);

  if (!userCanManageSiteContent(user)) {
    redirectWithError("This account cannot delete products.", returnTo);
  }

  try {
    const slug = String(formData.get("slug") ?? "");
    await deleteProduct(slug);
    revalidateManagedPages();
  } catch (error) {
    redirectWithError(error instanceof Error ? error.message : "Unable to delete product.", returnTo);
  }

  redirect(returnTo);
}

export async function deleteProductMediaAction(formData: FormData) {
  const user = await requireAdminAction();
  const returnTo = getReturnTo(formData, "/studio/media");

  if (!userCanManageSiteContent(user)) {
    redirectWithError("This account cannot delete product media.", returnTo);
  }

  const mediaIds = formData
    .getAll("mediaIds")
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (mediaIds.length === 0) {
    redirectWithError("Select at least one image first.", returnTo);
  }

  let result: Awaited<ReturnType<typeof deleteProductMediaReferences>>;

  try {
    result = await deleteProductMediaReferences(mediaIds);
    revalidateManagedPages();
  } catch (error) {
    redirectWithError(error instanceof Error ? error.message : "Unable to delete selected media.", returnTo);
  }

  if (result.deleted === 0 && result.skipped === 0) {
    redirectWithError("No matching product media was found.", returnTo);
  }

  const params = new URLSearchParams({ deleted: result.deleted.toString() });

  if (result.skipped > 0) {
    params.set("skipped", result.skipped.toString());
  }

  const separator = returnTo.includes("?") ? "&" : "?";
  redirect(`${returnTo}${separator}${params.toString()}`);
}

export async function uploadStudioFilesAction(formData: FormData) {
  const user = await requireAdminAction();
  const returnTo = getReturnTo(formData, "/studio/files");

  if (!userCanManageSiteContent(user)) {
    redirectWithError("This account cannot upload files.", returnTo);
  }

  const files = formData
    .getAll("files")
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (files.length === 0) {
    redirectWithError("Choose at least one file to upload.", returnTo);
  }

  let result: Awaited<ReturnType<typeof saveStudioUploadedFiles>>;

  try {
    result = await saveStudioUploadedFiles(files, String(formData.get("folder") ?? "uploads"));
    revalidateManagedPages();
    revalidatePath("/data-specification");
  } catch (error) {
    redirectWithError(error instanceof Error ? error.message : "Unable to upload files.", returnTo);
  }

  const params = new URLSearchParams({ uploaded: result.files.length.toString() });

  if (result.skipped > 0) {
    params.set("skipped", result.skipped.toString());
  }

  const separator = returnTo.includes("?") ? "&" : "?";
  redirect(`${returnTo}${separator}${params.toString()}`);
}

export async function deleteStudioFilesAction(formData: FormData) {
  const user = await requireAdminAction();
  const returnTo = getReturnTo(formData, "/studio/files");

  if (!userCanManageSiteContent(user)) {
    redirectWithError("This account cannot delete files.", returnTo);
  }

  const fileIds = formData
    .getAll("fileIds")
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (fileIds.length === 0) {
    redirectWithError("Select at least one file first.", returnTo);
  }

  let result: Awaited<ReturnType<typeof deleteStudioFiles>>;

  try {
    result = await deleteStudioFiles(fileIds);
    revalidateManagedPages();
    revalidatePath("/data-specification");
  } catch (error) {
    redirectWithError(error instanceof Error ? error.message : "Unable to delete selected files.", returnTo);
  }

  const params = new URLSearchParams({ deleted: result.deleted.toString() });

  if (result.skipped > 0) {
    params.set("skipped", result.skipped.toString());
  }

  const separator = returnTo.includes("?") ? "&" : "?";
  redirect(`${returnTo}${separator}${params.toString()}`);
}

export async function saveSiteBuilderAction(formData: FormData) {
  const user = await requireAdminAction();

  const returnTo = getReturnTo(formData, "/studio/builder");

  if (!userCanManageSiteContent(user)) {
    redirectWithError("This account cannot manage the website builder.", returnTo);
  }

  const settings = siteBuilderFromFormData(formData);

  try {
    await updateSiteBuilderSettings(settings);
    revalidateManagedPages();
    revalidatePath("/solutions");
    revalidatePath("/about");
    revalidatePath("/software-it");
    revalidatePath("/sectors");
  } catch (error) {
    redirectWithError(error instanceof Error ? error.message : "Unable to save website builder settings.", returnTo);
  }

  const separator = returnTo.includes("?") ? "&" : "?";
  redirect(`${returnTo}${separator}saved=1`);
}

export async function saveTemplateFileAction(formData: FormData) {
  const user = await requireAdminAction();

  const file = String(formData.get("file") ?? "");
  const returnTo = getReturnTo(formData, `/studio/templates?file=${encodeURIComponent(file)}`);

  if (!userCanManageSiteContent(user)) {
    redirectWithError("This account cannot edit templates.", returnTo);
  }

  const content = String(formData.get("content") ?? "");

  try {
    await writeTemplateFile(file, content);
    revalidatePath("/studio/templates");
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/products/[slug]", "page");
    revalidatePath("/solutions");
    revalidatePath("/about");
    revalidatePath("/software-it");
    revalidatePath("/contact");
    revalidatePath("/sectors");
  } catch (error) {
    redirectWithError(error instanceof Error ? error.message : "Unable to save template file.", returnTo);
  }

  const separator = returnTo.includes("?") ? "&" : "?";
  redirect(`${returnTo}${separator}saved=1`);
}

export async function saveContactNotificationSettingsAction(formData: FormData) {
  const user = await requireAdminAction();

  const returnTo = getReturnTo(formData, "/studio/settings");

  if (!userCanManageUsers(user)) {
    redirectWithError("This account cannot manage Studio settings.", returnTo);
  }

  const settings = contactNotificationSettingsFromFormData(formData);
  const invalidRecipients = settings.recipients.filter((recipient) => !isEmailAddress(recipient));

  if (invalidRecipients.length > 0) {
    redirectWithError(`Invalid notification recipient: ${invalidRecipients[0]}`, returnTo);
  }

  try {
    await updateContactNotificationSettings(settings);
    revalidatePath("/studio/settings");
  } catch (error) {
    redirectWithError(error instanceof Error ? error.message : "Unable to save notification settings.", returnTo);
  }

  const separator = returnTo.includes("?") ? "&" : "?";
  redirect(`${returnTo}${separator}saved=notifications`);
}

function isEmailAddress(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function updateSubmissionStatusAction(formData: FormData) {
  const user = await requireAdminAction();
  const returnTo = getReturnTo(formData, "/studio/submissions");

  if (!userCanManageSubmissions(user)) {
    redirectWithError("This account cannot manage enquiries.", returnTo);
  }

  try {
    const id = String(formData.get("id") ?? "");
    const status = String(formData.get("status") ?? "new") as ContactSubmissionStatus;
    await updateSubmissionStatus(id, status);
    revalidatePath("/studio/submissions");
  } catch (error) {
    redirectWithError(error instanceof Error ? error.message : "Unable to update submission.", returnTo);
  }

  redirect(returnTo);
}

export async function deleteSubmissionAction(formData: FormData) {
  const user = await requireAdminAction();
  const returnTo = getReturnTo(formData, "/studio/submissions");

  if (!userCanManageSubmissions(user)) {
    redirectWithError("This account cannot delete enquiries.", returnTo);
  }

  try {
    const id = String(formData.get("id") ?? "");
    await deleteSubmission(id);
    revalidatePath("/studio/submissions");
  } catch (error) {
    redirectWithError(error instanceof Error ? error.message : "Unable to delete submission.", returnTo);
  }

  redirect(returnTo);
}

export async function bulkSubmissionAction(formData: FormData) {
  const user = await requireAdminAction();
  const returnTo = getReturnTo(formData, "/studio/submissions");

  if (!userCanManageSubmissions(user)) {
    redirectWithError("This account cannot manage enquiries.", returnTo);
  }

  const ids = Array.from(
    new Set(
      formData
        .getAll("ids")
        .flatMap((value) => String(value).split(","))
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  );

  if (ids.length === 0) {
    redirectWithError("Select at least one submission first.", returnTo);
  }

  const action = String(formData.get("bulkAction") ?? "");
  const status = action.startsWith("status:")
    ? (action.replace("status:", "") as ContactSubmissionStatus)
    : undefined;

  if (action !== "delete" && (!status || !isSubmissionStatus(status))) {
    redirectWithError("Choose a valid bulk action.", returnTo);
  }

  try {
    if (action === "delete") {
      await deleteSubmissions(ids);
    } else {
      await updateSubmissionStatuses(ids, status as ContactSubmissionStatus);
    }

    revalidatePath("/studio");
    revalidatePath("/studio/submissions");
  } catch (error) {
    redirectWithError(error instanceof Error ? error.message : "Unable to apply bulk action.", returnTo);
  }

  redirect(returnTo);
}

function isSubmissionStatus(value: string): value is ContactSubmissionStatus {
  return ["new", "reviewed", "replied", "archived", "blocked"].includes(value);
}

export async function saveAdminUserAction(formData: FormData) {
  const user = await requireAdminAction();
  const returnTo = getReturnTo(formData, "/studio/users");

  if (!userCanManageUsers(user)) {
    redirectWithError("This account cannot manage users.", returnTo);
  }

  const password = String(formData.get("password") ?? "").trim();

  try {
    await saveAdminUser({
      displayName: String(formData.get("displayName") ?? ""),
      email: String(formData.get("email") ?? ""),
      id: String(formData.get("userId") ?? "") || undefined,
      password: password || undefined,
      role: normalizeAdminRole(String(formData.get("role") ?? "moderator")),
      status: normalizeAdminStatus(String(formData.get("status") ?? "active")),
      username: String(formData.get("username") ?? ""),
    });
    revalidatePath("/studio/users");
  } catch (error) {
    redirectWithError(error instanceof Error ? error.message : "Unable to save user.", returnTo);
  }

  const separator = returnTo.includes("?") ? "&" : "?";
  redirect(`${returnTo}${separator}saved=users`);
}

export async function deleteAdminUserAction(formData: FormData) {
  const user = await requireAdminAction();
  const returnTo = getReturnTo(formData, "/studio/users");

  if (!userCanManageUsers(user)) {
    redirectWithError("This account cannot delete users.", returnTo);
  }

  const userId = String(formData.get("userId") ?? "");

  if (userId === user.id) {
    redirectWithError("You cannot delete your own active account.", returnTo);
  }

  try {
    await deleteAdminUser(userId);
    revalidatePath("/studio/users");
  } catch (error) {
    redirectWithError(error instanceof Error ? error.message : "Unable to delete user.", returnTo);
  }

  const separator = returnTo.includes("?") ? "&" : "?";
  redirect(`${returnTo}${separator}saved=users`);
}

export async function saveOwnAccountAction(formData: FormData) {
  const user = await requireAdminAction();
  const returnTo = getReturnTo(formData, "/studio/account");
  const newPassword = String(formData.get("newPassword") ?? "").trim();
  const confirmPassword = String(formData.get("confirmPassword") ?? "").trim();

  if (newPassword && newPassword !== confirmPassword) {
    redirectWithError("New passwords do not match.", returnTo);
  }

  try {
    await updateOwnAdminAccount({
      currentPassword: String(formData.get("currentPassword") ?? ""),
      displayName: String(formData.get("displayName") ?? ""),
      email: String(formData.get("email") ?? ""),
      id: user.id,
      newPassword: newPassword || undefined,
      username: String(formData.get("username") ?? ""),
    });
    revalidatePath("/studio/account");
    revalidatePath("/studio/users");
  } catch (error) {
    redirectWithError(error instanceof Error ? error.message : "Unable to update your account.", returnTo);
  }

  const separator = returnTo.includes("?") ? "&" : "?";
  redirect(`${returnTo}${separator}saved=account`);
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/studio/login");
}
