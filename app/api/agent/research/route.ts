import { NextResponse } from "next/server";
import { analyzeProductWithGemini } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, productName, specs, category } = body;

    if (!productName) {
      return NextResponse.json({ error: "productName is required" }, { status: 400 });
    }

    // Run Gemini analysis without inventing specs
    const analysis = await analyzeProductWithGemini(productName, specs || [], category || "General");

    // Upsert to Supabase research table if productId provided
    if (productId) {
      await supabase.from("research").upsert({
        product_id: productId,
        pros: analysis.pros,
        cons: analysis.cons,
        best_for: analysis.best_for,
        not_for: analysis.not_for,
        comparison: analysis.comparison,
        review_summary: analysis.review_summary,
        recommendation: analysis.recommendation,
        source_data: { specs, category },
      }, { onConflict: "product_id" });
    }

    return NextResponse.json({ success: true, analysis });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
