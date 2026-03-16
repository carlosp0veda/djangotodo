import { cookies } from "next/headers";
import AuthTemplate from "@/templates/AuthTemplate";
import TodoApp from "@/components/TodoApp/TodoApp";

export default async function Home() {
  const cookieStore = await cookies();
  const isAuthenticated = !!cookieStore.get("access_token")?.value;

  if (isAuthenticated) {
    return <TodoApp />;
  }

  return <AuthTemplate />;
}
