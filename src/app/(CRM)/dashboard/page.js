import Image from "next/image";
import Link from "next/link";
import SideBar from "../components/SideBar";

export default function Dashboard() {
  return (
    <>
      <div className="leftSidebar">
        <SideBar />
      </div>
      <div>
        <main className="crm"></main>
      </div>
    </>
  );
}
