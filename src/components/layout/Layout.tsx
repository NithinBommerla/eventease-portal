
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ProfilePrompt } from "../profile/ProfilePrompt";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 w-full">
      <Header />
      <main className="pt-16 pb-8 w-full flex-grow">
        {children}
      </main>
      <ProfilePrompt />
      <Footer />
    </div>
  );
};
