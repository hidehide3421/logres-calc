import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

const NONE_LABEL = "(なし)";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = params.get("q")?.trim() ?? "";
  const category = params.get("category")?.trim() ?? "";
  const series = params.get("series")?.trim() ?? "";
  const element = params.get("element")?.trim() ?? "";
  const rarity = params.get("rarity")?.trim() ?? "";
  const limit = Number(params.get("limit") ?? "10");

  if (!q) {
    return NextResponse.json({ items: [] });
  }

  let query = supabaseServer
    .from("item_desperado")
    .select("*")
    .ilike("item_name", `%${q}%`)
    .order("item_name", { ascending: true })
    .limit(Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 20) : 10);

  if (category && category !== NONE_LABEL) {
    query = query.eq("item_category", category);
  }
  if (series && series !== NONE_LABEL) {
    query = query.eq("item_series", series);
  }
  if (element && element !== NONE_LABEL) {
    query = query.eq("item_element", element);
  }
  if (rarity && rarity !== NONE_LABEL) {
    query = query.eq("item_rarity", rarity);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { message: "Failed to load items.", details: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ items: data ?? [] });
}
