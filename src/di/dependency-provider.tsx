"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createAppDependencies, type AppDependencies } from "@/di/app-dependencies";

const DependenciesContext = createContext<AppDependencies | null>(null);

export function DependencyProvider({
  children,
  dependencies: injectedDependencies,
}: {
  children: ReactNode;
  dependencies?: AppDependencies;
}) {
  const dependencies = useMemo(
    () => injectedDependencies ?? createAppDependencies(),
    [injectedDependencies],
  );
  return (
    <DependenciesContext.Provider value={dependencies}>
      {children}
    </DependenciesContext.Provider>
  );
}

export function useDependencies(): AppDependencies {
  const dependencies = useContext(DependenciesContext);
  if (!dependencies) {
    throw new Error("DependencyProvider is missing from the app tree.");
  }
  return dependencies;
}
