import { FeeCategory, Child } from "@prisma/client";

/**
 * Determines if a given fee is applicable to a specific child based on their grade.
 * Uses the `applicableGrades` field if present (comma-separated string).
 */
export function isFeeApplicableToChild(fee: Pick<FeeCategory, "type" | "applicableGrades">, child: Pick<Child, "grade">): boolean {
  if (fee.type === "PER_PARENT") return false;
  
  if (fee.applicableGrades && fee.applicableGrades.trim() !== "") {
    const applicableGradesList = fee.applicableGrades.split(",").map(g => g.trim().toLowerCase());
    const childGrade = child.grade.trim().toLowerCase();
    
    // Check if any of the applicable grades matches the child's grade
    return applicableGradesList.some(ag => childGrade.includes(ag));
  }
  
  return true;
}

/**
 * Returns the number of children in the provided array that are applicable for the given fee.
 */
export function getApplicableChildrenCount(fee: Pick<FeeCategory, "type" | "applicableGrades">, children: Pick<Child, "grade">[]): number {
  return children.filter(c => isFeeApplicableToChild(fee, c)).length;
}

/**
 * Calculates the total due amount for a parent based on the fee type and their children.
 */
export function calculateFeeDue(fee: Pick<FeeCategory, "type" | "amount" | "applicableGrades">, children: Pick<Child, "grade">[]): number {
  if (fee.type === "PER_PARENT") {
    return fee.amount;
  }
  return fee.amount * getApplicableChildrenCount(fee, children);
}
