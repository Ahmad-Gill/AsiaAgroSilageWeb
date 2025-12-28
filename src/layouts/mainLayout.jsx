import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar/navbar";

function MainLayout() {
  return (
    <>
      <Navbar />
      <main style={{ padding: "24px" }}>
        <Outlet /> {/* 👈 THIS IS REQUIRED */}
      </main>
    </>
  );
}

export default MainLayout;
