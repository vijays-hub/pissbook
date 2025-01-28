import { Metadata } from "next";
import ChatInit from "./Chat";

export const metadata: Metadata = {
  title: "Pisser's bay 💌",
};

export default function Messages() {
  return <ChatInit />;
}
