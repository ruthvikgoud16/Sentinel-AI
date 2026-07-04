# API Contract - Hackathon Edition

## Sentinel AI API Endpoints

This document establishes the streamlined API contract for Sentinel AI, focusing on client-side state with a single Gemini-powered API route.

---

## 1. Gemini Copilot Route

### Post Prompt / Request Copilot Explanation
* **Endpoint:** `POST /api/chat`
* **Request Body:**
```json
{
  "alertId": "alert-1042",
  "prompt": "Analyze risk for this account and draft a SAR narrative.",
  "context": {
    "targetAccount": "Robert Chen (acc-9981)",
    "graphNodes": [
      { "id": "acc-5541", "label": "Alice Smith (Victim)", "type": "victim" },
      { "id": "acc-1102", "label": "Intermediary 1", "type": "intermediary" },
      { "id": "acc-9981", "label": "Robert Chen (Mule Hub)", "type": "target" },
      { "id": "acc-7712", "label": "CryptoExchange LLC", "type": "cash_out" }
    ],
    "timelineEvents": [
      "2026-07-04T11:45:00Z: Victim Alice Smith sent $9,500 via Zelle to Intermediary 1",
      "2026-07-04T11:45:45Z: Intermediary 1 and Mule Hub both accessed from device ID dev-android-82",
      "2026-07-04T11:46:00Z: Intermediary 1 sent $9,450 to Robert Chen",
      "2026-07-04T11:47:15Z: NCIB Cyber Tip: Victim reported scam Zelle transfer",
      "2026-07-04T11:48:00Z: Robert Chen wired $9,400 to CryptoExchange LLC"
    ]
  }
}
```
* **Response Status:** `200 OK`
* **Response Body:** (Text stream or JSON response)
```json
{
  "response": "### Suspicious Activity Summary\nThe subject account (acc-9981) received $9,500.00 indirectly from a reported fraud victim via an intermediary, and transferred $9,400.00 to a cryptocurrency cash-out point within 3 minutes. The quick turnaround (layering) and correlation of device IDs (dev-android-82) are highly indicative of money mule operations.\n\n### Draft SAR Narrative\nOn July 4, 2026, Robert Chen's account (acc-9981) received $9,450 from Intermediary 1. This transfer closely followed a Zelle transfer of $9,500 from victim Alice Smith. The funds were then wired to CryptoExchange LLC. Immediate freeze action has been executed."
}
```
