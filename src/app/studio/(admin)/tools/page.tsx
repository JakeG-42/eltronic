import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function StudioToolsPage() {
  redirect("/studio/tools/qr-code");
}
