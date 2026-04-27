import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function ClassicStudioPage() {
  redirect("/studio/classic/products");
}
