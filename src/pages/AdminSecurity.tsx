
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SecuritySettings } from "@/components/admin/SecuritySettings";

const AdminSecurity = () => {
  return (
    <ProtectedRoute requireAdminOnly={true}>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="madrid-container py-8">
          <SecuritySettings />
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  );
};

export default AdminSecurity;
