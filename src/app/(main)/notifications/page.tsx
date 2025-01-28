import { Metadata } from "next";
import TrendingTopics from "@/components/TrendingTopics";
import Notifications from "./Notifications";

export const metadata: Metadata = {
  title: "Pissing Bells 🛎️",
};

export default function NotificationsHome() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h1 className="text-center text-2xl font-bold">Pissing Bells 🛎️</h1>
        </div>
        <Notifications />
      </div>
      <TrendingTopics />
    </main>
  );
}
