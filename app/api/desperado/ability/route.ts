import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const jobLevel = Number(params.get("jobLevel") ?? "120");

  if (!Number.isFinite(jobLevel) || jobLevel < 1) {
    return NextResponse.json(
      { message: "jobLevel must be a valid positive number." },
      { status: 400 },
    );
  }

  const { data, error } = await supabaseServer
    .from("ability_desperado")
    .select("*")
    .lte("lv_range_min", jobLevel)
    .gte("lv_range_max", jobLevel)
    .order("lv_range_min", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { message: "Failed to load ability.", details: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ability: data });
}
