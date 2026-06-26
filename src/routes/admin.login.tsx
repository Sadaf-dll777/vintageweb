import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/admin/login")({
  component: LoginRedirect,
});

function LoginRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/auth", search: { redirect: "/admin" } });
  }, [navigate]);
  return (
    <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
      Redirecting to sign in…
    </div>
  );
}
