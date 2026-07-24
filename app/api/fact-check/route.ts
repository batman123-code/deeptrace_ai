import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    
    if (!query) {
      return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
    }

    const apiKey = process.env.FACT_CHECK_API_KEY;
    if (!apiKey || apiKey === "dummy_fact_check_key") {
      console.warn("[Fact Check API] Using mock response due to missing or dummy API key");
      // Fallback response as requested by resilience audit
      return NextResponse.json({
        claims: [
          {
            text: `Mocked fact check result for: ${query}`,
            claimant: "Unknown",
            claimDate: new Date().toISOString(),
            claimReview: [
              {
                publisher: { name: "Mock Publisher", site: "mock.org" },
                url: "https://mock.org/fact-check",
                title: "Mock Fact Check",
                reviewDate: new Date().toISOString(),
                textualRating: "False",
                languageCode: "en"
              }
            ]
          }
        ]
      });
    }

    // Wrap external fetch in try/catch
    try {
      const response = await fetch(`https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(query)}&key=${apiKey}`);
      
      if (!response.ok) {
        throw new Error(`Google Fact Check API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError: any) {
      console.error("[Fact Check API] Fetch failed:", fetchError);
      // Gracefully return empty list or partial analysis on failure
      return NextResponse.json({ claims: [] }); 
    }
  } catch (error: any) {
    console.error("[Fact Check API] Route exception:", error);
    return NextResponse.json({ claims: [] }, { status: 200 }); // Graceful fallback
  }
}
