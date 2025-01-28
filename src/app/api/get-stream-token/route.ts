import { validateRequest } from "@/auth";
import streamServerClient from "@/lib/stream";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Attempting to generate stream token for user", user.id);

    /**
     * Expiry time for the token.
     *
     * Date.now() / 1000 gives the current time in seconds. Adding 60 * 60 to it
     * gives the time after 1 hour. So we are setting the expiry time to be 1 hour.
     */
    const EXPIRY_TIME = Math.floor(Date.now() / 1000) + 60 * 60;

    /**
     * https://dashboard.getstream.io/app/1362310/chat/overview
     * Stream manages the timestamps in it's server. So there can be some delays with
     * our timestamp and the Stream's timestamp. So we are subtracting 60 seconds (1 minute)
     * from current time, so that it would be like the token is issued 1 minute early.
     */
    const ISSUED_AT = Math.floor(Date.now() / 1000) - 60;

    // ! Ref: https://getstream.io/chat/docs/react/tokens_and_authentication/
    const token = streamServerClient.createToken(
      user.id,
      EXPIRY_TIME,
      ISSUED_AT
    );

    return Response.json({ token });
  } catch (error) {
    console.error("Error while generating stream token", error);
    // TODO: Try having a common error handler
    return Response.json(
      { error: "Error while generating stream token" },
      { status: 500 }
    );
  }
}
