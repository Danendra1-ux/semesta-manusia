import { redirect } from "next/navigation";

export default function AdminPage() {
  redirect("/user/login?redirect=/admin/dashboard");
}