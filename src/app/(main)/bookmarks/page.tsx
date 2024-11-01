import { Metadata } from "next";
import Bookmarks from "./Bookmarks";
import TrendingTopics from "@/components/TrendingTopics";

export const metadata: Metadata = {
  title: "Shelf",
};

export default function BookmarksHome() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h1 className="text-center text-2xl font-bold">
            Pissing Experiences Shelf
          </h1>
        </div>
        <Bookmarks />
      </div>
      <TrendingTopics />
    </main>
  );
}
