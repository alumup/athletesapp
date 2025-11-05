import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const email = String(formData.get("email"));

  const supabase = await createClient();

  const domain =
    process.env.NODE_ENV === "production"
      ? "https://app.athletes.app"
      : "http://app.localhost:3000";

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${domain}/update-password`,
  });

  if (error) {
    console.log("ERROR - reset token", error);

    return NextResponse.json(
      {
        error: "Could not sent reset password email",
        ok: false,
      },
      {
        status: 400,
      },
    );
  }

  return NextResponse.json(
    {
      ok: true,
    },
    {
      // a 301 status is required to redirect from a POST to a GET route
      status: 200,
    },
  );
  // return NextResponse.redirect(`${domain}`, {
  //   // a 301 status is required to redirect from a POST to a GET route
  //   status: 301,
  // });
}
