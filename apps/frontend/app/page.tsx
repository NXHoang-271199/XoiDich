import { Suspense } from "react";
import { ApiError } from "@/lib/api/api-error";
import { apiServer } from "@/lib/api/server";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-16">
      <h1 className="font-heading text-3xl font-semibold">Xôi Đích</h1>
      <Suspense fallback={<p className="text-muted-foreground">Đang kiểm tra API…</p>}>
        <ApiStatus />
      </Suspense>
    </main>
  );
}

async function ApiStatus() {
  const ok = await apiServer<{ status: string }>("/health")
    .then((res) => res.status === "ok")
    .catch((error: unknown) => {
      if (error instanceof ApiError || error instanceof TypeError) return false;
      throw error;
    });
  return <p className="text-muted-foreground">API: {ok ? "đang chạy" : "không kết nối được"}</p>;
}
