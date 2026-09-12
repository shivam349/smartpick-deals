import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { calculateDiscount } from "@/lib/utils";

export async function POST() {
  try {
    const { data: products } = await supabase.from("products").select("id, price, old_price");
    let updated = 0;

    if (products) {
      for (const p of products) {
        if (p.old_price && p.old_price !== p.price) {
          const discount = calculateDiscount(p.price, p.old_price);
          if (discount > 0) {
            await supabase.from("products").update({
              is_deal: true,
              discount_percent: discount,
              deal_badge: `${discount}% OFF`,
            }).eq("id", p.id);
            updated++;
          }
        }
      }
    }

    return NextResponse.json({ success: true, deals_synced: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
