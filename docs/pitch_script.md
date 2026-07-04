# Sentinel AI: 2-Minute Spoken Script

This script is written to be spoken out loud. Numbers are written out phonetically to aid pacing.

*   **Word Count**: 271 words
*   **Estimated Speaking Time**: 2 minutes, 5 seconds (at a moderate pace of ~130 words per minute)

---

## The Script

Legacy Anti-Money Laundering detection is fundamentally broken. Financial institutions are overwhelmed by ninety-five percent false positive rates, while complex, multi-hop money laundering networks slip past rule-based systems completely undetected. Most AI hackathon submissions try to solve this by simply wrapping an LLM around basic logs, which completely misses the structural flow of the crime.

We built Sentinel AI to solve this structurally. Sentinel AI maps financial ledgers as graph neural networks, using a GraphSAGE model to evaluate topological relationships and flow patterns rather than transactions in isolation. This allows compliance officers to instantly identify money mule hubs and cash-out points.

Our findings are anchored in strict engineering integrity. First, during development, our model hit a suspicious one hundred percent accuracy. Instead of running with it, we audited our pipeline and caught a structural data leakage. We corrected this using component-level disjoint splits. Next, we proved our model's robustness under incomplete real-world data by running a thirty-five percent edge-masked test, maintaining a ninety-six point seven percent AUC and eighty-seven point four percent F-one score. Finally, we validated our model against the public IBM AMLSim benchmark, achieving an eighty-five point four-nine percent AUC and a thirty point seven-four percent F-one score.

To be fully transparent, our live Vercel deployment relies on a client-side mock scoring fallback, and our production Google Cloud architecture is documented, not deployed. On real-world data, the model yields a thirty point seven-four percent F-one score, meaning human-in-the-loop investigation remains necessary. We would rather share these honest engineering realities than hide them.

Let’s transition into the live dashboard to show how an investigator triages these graph alerts in real time.
