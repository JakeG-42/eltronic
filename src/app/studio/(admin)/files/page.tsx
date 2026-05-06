import { UploadCloud } from "lucide-react";

import { uploadStudioFilesAction } from "@/app/studio/actions";
import { FileLibraryManager } from "@/components/studio/file-library-manager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStudioFiles } from "@/lib/studio-files";

type StudioFilesPageProps = {
  searchParams?: Promise<{
    deleted?: string;
    error?: string;
    skipped?: string;
    uploaded?: string;
  }>;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Files | Eltronic Studio",
};

export default async function StudioFilesPage({ searchParams }: StudioFilesPageProps) {
  const [params, files] = await Promise.all([searchParams, getStudioFiles()]);
  const uploadedCount = Number(params?.uploaded ?? 0);
  const deletedCount = Number(params?.deleted ?? 0);

  return (
    <div className="grid gap-6">
      <section className="studio-page-header">
        <p>
          Files live under <strong>public/media</strong>. Use this for local product images, PDFs, documents and
          manually uploaded assets that should be served by the site.
        </p>
      </section>

      {params?.uploaded ? (
        <div className="studio-storage-alert builder-success">
          Uploaded {uploadedCount} file{uploadedCount === 1 ? "" : "s"}.
          {params.skipped ? ` ${params.skipped} empty file${params.skipped === "1" ? "" : "s"} skipped.` : ""}
        </div>
      ) : null}
      {params?.deleted ? (
        <div className="studio-storage-alert builder-success">
          Deleted {deletedCount} file{deletedCount === 1 ? "" : "s"}.
          {params.skipped ? ` ${params.skipped} file${params.skipped === "1" ? "" : "s"} could not be removed.` : ""}
        </div>
      ) : null}
      {params?.error ? <div className="studio-storage-alert">{params.error}</div> : null}

      <Card>
        <CardHeader>
          <CardTitle>Upload files</CardTitle>
          <CardDescription>Images, PDFs and supporting documents are stored locally under the media folder.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={uploadStudioFilesAction} className="studio-file-upload-form">
            <input name="returnTo" type="hidden" value="/studio/files" />
            <label className="studio-file-upload-zone">
              <UploadCloud className="size-6" />
              <span>
                <strong>Add local files</strong>
                <small>Images, PDFs, documents, spreadsheets and archives up to 40MB each.</small>
              </span>
              <input
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.md,.zip"
                multiple
                name="files"
                required
                type="file"
              />
            </label>
            <div className="studio-file-upload-controls">
              <div className="grid gap-2">
                <Label htmlFor="studio-file-folder">Folder</Label>
                <Input id="studio-file-folder" name="folder" placeholder="uploads" defaultValue="uploads" />
              </div>
              <Button type="submit">
                <UploadCloud className="size-4" />
                Upload files
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>File manager</CardTitle>
          <CardDescription>Compact grid view with table mode for paths, size, type and modified date.</CardDescription>
        </CardHeader>
        <CardContent>
          <FileLibraryManager items={files} />
        </CardContent>
      </Card>
    </div>
  );
}
