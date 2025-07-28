// Utility functions for USPs and notes
import type { College } from "../types/college";

/**
 * Helper to get the current USP list for a college (reordered or default)
 * @param college The college object
 * @param usps The USPs object (collegeId -> string)
 * @param reorderedUSPs The reordered USPs object (collegeId -> string[])
 * @returns string[]
 */
export function getCurrentUSPs(college: College, usps: Record<string, string>, reorderedUSPs: Record<string, string[]>): string[] {
  const originalUspLines = usps[college.id] || "";
  const uspLines = originalUspLines
    .split(/\n|\r/)
    .map(line => line.trim())
    .filter(line => line.startsWith('-'))
    .map(line => line.replace(/^[-•]\s*/, ''));
  if (reorderedUSPs && reorderedUSPs[college.id]) return reorderedUSPs[college.id];
  return uspLines;
}

/**
 * Helper to get the combined list of USPs and notes for a college
 * @param college The college object
 * @param usps The USPs object (collegeId -> string)
 * @param reorderedUSPs The reordered USPs object (collegeId -> string[])
 * @param savedNotes The saved notes object (collegeId -> string[])
 * @returns Array<{ type: 'usp' | 'note', value: string, idx: number }>
 */
export function getAllUSPsAndNotes(
  college: College,
  usps: Record<string, string>,
  reorderedUSPs: Record<string, string[]>,
  savedNotes: Record<string, string[]>
): Array<{ type: 'usp' | 'note', value: string, idx: number }> {
  const uspList = getCurrentUSPs(college, usps, reorderedUSPs);
  const notes = savedNotes[college.id] || [];
  return [
    ...uspList.map((usp, idx) => ({ type: 'usp' as const, value: usp, idx })),
    ...notes.map((note, idx) => ({ type: 'note' as const, value: note, idx }))
  ];
}import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
