"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-16">
      <h1 className="font-heading text-2xl font-semibold">Đã có lỗi xảy ra</h1>
      <p className="text-muted-foreground">Vui lòng thử lại sau ít phút.</p>
      <Button className="self-start" onClick={reset}>
        Thử lại
      </Button>
    </main>
  );
}
