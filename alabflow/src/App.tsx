import { useAuth } from "./_hooks/auth";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/login";
import { ProtectRoutes } from "./_hooks/protectRoutes";
import Home from "./pages/home";
import FlowNew from "./pages/flow/new";
import AddUserForm from "./pages/admin/addUser";
import Profile from "./pages/profile";
import ResetPassword from "./pages/login/resetPassword";
import ProcessList from "./globalComponents/processList";
import ActiveApplicationList from "./pages/activeApplication";
import FAQPage from "./pages/faq";
import ApplicationStatistics from "./pages/applicationStatistics";

export default function App() {
  const { authData, loading } = useAuth();

  if (loading || !authData) {
    return <div style={{ textAlign: "center", padding: 40 }}>Ładowanie aplikacji...</div>;
  }

  const isOnlyAdministrator = () =>
    authData?.roles?.length === 1 && authData?.roles?.includes("ROLE_ADMINISTRATOR");

  if (isOnlyAdministrator()) {
    return (
      <Routes>
        <Route path="/pages/addUser" element={<AddUserForm />} />
        <Route path="*" element={<Navigate to="/pages/addUser" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="home" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password/:ticket" element={<ResetPassword />} />

      <Route element={<ProtectRoutes />}>
        <Route path="/home" element={<Home />} />
        <Route path="/flow/create/" element={<FlowNew />} />
        <Route path="/flow/continue/:flowID/:stageId?" element={<FlowNew />} />
        <Route path="/pages/addUser" element={<AddUserForm />} />
        <Route path="/pages/profile" element={<Profile />} />
        <Route path="/pages/processList" element={<ProcessList />} />
        <Route path="/pages/activeApplicationList" element={<ActiveApplicationList />} />
        <Route path="/pages/faq" element={<FAQPage />} />
        <Route path="/pages/applicationStatistics" element={<ApplicationStatistics />} />
      </Route>
    </Routes>
  );
}
