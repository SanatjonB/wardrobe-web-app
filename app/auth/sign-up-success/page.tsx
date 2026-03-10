import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Back to ClosetIQ
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Check your inbox</CardTitle>
            <CardDescription>One last step to get started</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              We sent a confirmation link to your email. Click it to activate
              your account and you&apos;ll be taken straight to your wardrobe.
            </p>
            <p className="text-sm text-muted-foreground">
              Didn&apos;t get it? Check your spam folder or{" "}
              <Link
                href="/auth/sign-up"
                className="underline underline-offset-4 text-foreground"
              >
                try signing up again
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
