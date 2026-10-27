import type { ReactNode } from "react";

export default function ExploreLayout({ children, detail }: { children: ReactNode; detail: ReactNode }) {
  return <>{children}{detail}</>;
}
