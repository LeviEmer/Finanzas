export type CategoryKind = "fixed" | "variable" | "ant" | "income";

export interface Category {
  id: string;
  name: string;
  kind: CategoryKind;
  color: string;
  icon?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
