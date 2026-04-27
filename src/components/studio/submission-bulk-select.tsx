"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type SubmissionBulkSelectProps = {
  checkboxSelector?: string;
};

export function SubmissionBulkSelect({ checkboxSelector = ".submission-bulk-checkbox" }: SubmissionBulkSelectProps) {
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    const checkboxes = getCheckboxes(checkboxSelector);

    function updateSelectedCount() {
      setSelectedCount(getCheckboxes(checkboxSelector).filter((checkbox) => checkbox.checked).length);
    }

    updateSelectedCount();
    checkboxes.forEach((checkbox) => checkbox.addEventListener("change", updateSelectedCount));

    return () => checkboxes.forEach((checkbox) => checkbox.removeEventListener("change", updateSelectedCount));
  }, [checkboxSelector]);

  function setAllSelected(checked: boolean) {
    getCheckboxes(checkboxSelector).forEach((checkbox) => {
      checkbox.checked = checked;
      checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  return (
    <div className="submission-bulk-select">
      <Button type="button" size="sm" variant="outline" onClick={() => setAllSelected(true)}>
        Select all visible
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={() => setAllSelected(false)}>
        Clear
      </Button>
      <span>{selectedCount} selected</span>
    </div>
  );
}

function getCheckboxes(selector: string) {
  return Array.from(document.querySelectorAll<HTMLInputElement>(selector));
}
