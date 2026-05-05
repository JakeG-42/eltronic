import Link from "next/link";
import { Code2, Eye, FileCode2, Lock, Save } from "lucide-react";

import { saveTemplateFileAction } from "@/app/studio/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getTemplateFiles, readTemplateFile, type TemplateFile, type TemplateFileGroup } from "@/lib/template-editor";

type TemplateEditorPageProps = {
  searchParams?: Promise<{
    error?: string;
    file?: string;
    saved?: string;
  }>;
};

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Template Editor | Eltronic Studio",
};

export default async function TemplateEditorPage({ searchParams }: TemplateEditorPageProps) {
  const params = await searchParams;
  const files = getTemplateFiles();
  const groupedFiles = groupFiles(files);
  const { canWrite, content, file } = await readTemplateFile(params?.file);
  const lineCount = content.split("\n").length;

  return (
    <div className="template-editor-shell">
      <section className="studio-page-header template-editor-header">
        <p>
          Whitelisted template file browser for the current Next.js site. You can inspect pages, theme components,
          content modules and styles without exposing secrets.
        </p>
        <div className="flex flex-wrap gap-3">
          {file.publicRoute ? (
            <Button asChild variant="outline">
              <Link href={file.publicRoute} target="_blank">
                <Eye className="size-4" />
                View route
              </Link>
            </Button>
          ) : null}
          <Button form="template-editor-form" type="submit" disabled={!canWrite}>
            <Save className="size-4" />
            Save file
          </Button>
        </div>
      </section>

      {params?.saved ? <div className="studio-storage-alert builder-success">Template file saved locally.</div> : null}
      {params?.error ? <div className="studio-storage-alert">{params.error}</div> : null}
      {!canWrite ? (
        <div className="studio-storage-alert">
          <strong>Read-only on this environment.</strong> Vercel deployments should not edit source files live. Use this
          screen to inspect templates, then make code changes locally so they are versioned in GitHub.
        </div>
      ) : null}

      <div className="template-editor-grid">
        <aside className="template-file-tree">
          {Array.from(groupedFiles.entries()).map(([group, groupFiles]) => (
            <section key={group}>
              <h2>{group}</h2>
              <div>
                {groupFiles.map((templateFile) => (
                  <Link
                    className={templateFile.path === file.path ? "active" : undefined}
                    href={`/studio/templates?file=${encodeURIComponent(templateFile.path)}`}
                    key={templateFile.path}
                  >
                    <FileCode2 className="size-4" />
                    <span>
                      <strong>{templateFile.label}</strong>
                      <small>{templateFile.path}</small>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </aside>

        <main className="template-editor-main">
          <Card>
            <CardHeader>
              <div className="template-file-meta">
                <div>
                  <CardTitle>{file.label}</CardTitle>
                  <CardDescription>{file.description}</CardDescription>
                </div>
                <div className="template-file-badges">
                  <span>
                    <Code2 className="size-3" />
                    {file.language}
                  </span>
                  <span>{lineCount} lines</span>
                  <span>{formatBytes(content.length)}</span>
                  {!canWrite ? (
                    <span>
                      <Lock className="size-3" />
                      Read-only
                    </span>
                  ) : null}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form action={saveTemplateFileAction} className="template-editor-form" id="template-editor-form">
                <input name="file" type="hidden" value={file.path} />
                <input name="returnTo" type="hidden" value={`/studio/templates?file=${encodeURIComponent(file.path)}`} />
                <div className="template-path-bar">
                  <span>{file.path}</span>
                </div>
                <Textarea
                  className="template-code-editor"
                  name="content"
                  readOnly={!canWrite}
                  spellCheck={false}
                  defaultValue={content}
                />
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

function groupFiles(files: TemplateFile[]) {
  return files.reduce((groups, file) => {
    const group = groups.get(file.group) ?? [];
    group.push(file);
    groups.set(file.group, group);
    return groups;
  }, new Map<TemplateFileGroup, TemplateFile[]>());
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  return `${(bytes / 1024).toFixed(1)} KB`;
}
