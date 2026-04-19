import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <p className="text-6xl font-display font-bold text-muted-foreground/30">
        404
      </p>
      <h2 className="text-xl font-semibold">Page not found</h2>
      <p className="text-muted-foreground text-sm">
        This page doesn&apos;t exist or you don&apos;t have access.
      </p>
      <Link href="/dashboard">
        <Button>Go home</Button>
      </Link>
    </div>
  );
}
