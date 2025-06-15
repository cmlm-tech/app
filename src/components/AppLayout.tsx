
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="flex pt-14">
        <AppSidebar />
        <main className="flex-1 ml-60 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
