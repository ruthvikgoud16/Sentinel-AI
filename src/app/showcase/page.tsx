import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, BarChart2, Share2, Cpu, CheckCircle, AlertTriangle, Wrench, Activity } from 'lucide-react';

export default function ShowcasePage() {
  return (
    <main className="min-h-screen w-screen overflow-x-hidden bg-[#F4EFE6] text-[#1C1E1E] font-mono antialiased p-8 bg-paper-grain bg-watermark">
      {/* Header */}
      <header className="max-w-5xl mx-auto flex items-center justify-between border-b-2 border-[#1C1E1E] pb-4 mb-8">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 border-2 border-[#991B1B] text-[#991B1B] rounded flex items-center justify-center bg-white shadow-sm transform -rotate-3">
            <Shield className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Technical Showcase</h1>
            <p className="text-xs text-[#666258] uppercase tracking-widest font-bold">Model Validation & Architecture</p>
          </div>
        </div>
        <Link href="/" className="px-4 py-2 border-2 border-[#1C1E1E] hover:bg-[#1C1E1E] hover:text-white transition-colors rounded text-xs font-bold uppercase flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Demo</span>
        </Link>
      </header>

      <div className="max-w-5xl mx-auto grid grid-cols-1 gap-12">
        {/* Section 0: The Investigation Journey */}
        <section className="bg-[#FDFBF7] border-2 border-[#D2C9B9] p-8 rounded shadow-sm relative bg-paper-grain hover:-translate-y-[2px] transition-transform duration-300">
          <div className="absolute -top-3 -left-3 bg-[#1C1E1E] text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest transform -rotate-1 border border-[#000] shadow-sm">
            Case File
          </div>
          <h2 className="text-xl font-bold border-b border-[#D2C9B9] pb-2 mb-8 uppercase flex items-center space-x-2">
            <Activity className="h-5 w-5 text-[#991B1B]" />
            <span>The ML Investigation Journey</span>
          </h2>

          <div className="relative pl-6 md:pl-8 border-l-2 border-[#D2C9B9] ml-4 md:ml-6 space-y-10">
            {/* Stage 1 */}
            <div className="relative">
              <div className="absolute -left-[37px] md:-left-[45px] top-1 bg-white border-2 border-[#166534] rounded-full p-1.5 text-[#166534] shadow-sm">
                <CheckCircle className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#666258] font-mono">Stage 01: Inception</span>
                  <h3 className="font-extrabold text-sm uppercase text-[#1C1E1E]">We built a synthetic dataset</h3>
                </div>
                <p className="text-xs text-[#666258] leading-relaxed max-w-3xl">
                  We engineered a custom graph generator modeling 5,000 customer accounts and 20,000+ transaction relationships. It simulated structured money-mule behaviors—including victims sending money to intermediaries, who then consolidated funds into hub accounts for final cash-out. This established a labeled ground truth dataset to train our GNN against.
                </p>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="relative">
              <div className="absolute -left-[37px] md:-left-[45px] top-1 bg-white border-2 border-[#B45309] rounded-full p-1.5 text-[#B45309] shadow-sm">
                <AlertTriangle className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#B45309] font-mono">Stage 02: Auditing</span>
                  <h3 className="font-extrabold text-sm uppercase text-[#B45309]">First result: 100% accuracy — and we didn't trust it</h3>
                </div>
                <p className="text-xs text-[#666258] leading-relaxed max-w-3xl">
                  Our initial GraphSAGE model scored a perfect 100.0% accuracy on the test set. In machine learning, a perfect score is usually a warning sign that the model is cheating rather than learning. We paused the project to conduct a thorough code audit, treating this perfect number with scientific skepticism rather than celebrating.
                </p>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="relative">
              <div className="absolute -left-[37px] md:-left-[45px] top-1 bg-white border-2 border-[#B45309] rounded-full p-1.5 text-[#B45309] shadow-sm">
                <AlertTriangle className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#B45309] font-mono">Stage 03: Discovery</span>
                  <h3 className="font-extrabold text-sm uppercase text-[#B45309]">We found two real leaks</h3>
                </div>
                <p className="text-xs text-[#666258] leading-relaxed max-w-3xl font-mono">
                  Our audit revealed two structural leaks: first, standard random splitting placed some transactions from the same mule ring in the training set and others in the test set, allowing the model to peek at connected answers. Second, our synthetic data generator accidentally linked mules to shared devices, giving the model an unrealistic shortcut to flag fraud without learning transaction graph structures.
                </p>
              </div>
            </div>

            {/* Stage 4 */}
            <div className="relative">
              <div className="absolute -left-[37px] md:-left-[45px] top-1 bg-white border-2 border-[#1C1E1E] rounded-full p-1.5 text-[#1C1E1E] shadow-sm">
                <Wrench className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#666258] font-mono">Stage 04: Engineering</span>
                  <h3 className="font-extrabold text-sm uppercase text-[#1C1E1E]">We fixed both, properly</h3>
                </div>
                <p className="text-xs text-[#666258] leading-relaxed max-w-3xl">
                  We refactored the split logic to use component-disjoint splits, holding entire mule rings out together in the test set. We also injected realistic noise, such as legitimate families sharing devices and natural multi-hop transaction patterns. This forced the GNN to learn real transaction topologies instead of relying on metadata shortcuts.
                </p>
              </div>
            </div>

            {/* Stage 5 */}
            <div className="relative">
              <div className="absolute -left-[37px] md:-left-[45px] top-1 bg-white border-2 border-[#166534] rounded-full p-1.5 text-[#166534] shadow-sm">
                <CheckCircle className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#666258] font-mono">Stage 05: Evaluation</span>
                  <h3 className="font-extrabold text-sm uppercase text-[#1C1E1E]">Honest numbers emerged</h3>
                </div>
                <p className="text-xs text-[#666258] leading-relaxed max-w-3xl">
                  With the leaks fixed, our tabular baseline (Isolation Forest) scored a weak 64.7% AUC, proving tabular data is insufficient. GraphSAGE scored 99.9% AUC on the clean full graph, and 96.7% AUC under a 35%-edge-masked robustness test. This edge-masked score simulates real-world conditions where transaction visibility is incomplete.
                </p>
              </div>
            </div>

            {/* Stage 6 */}
            <div className="relative">
              <div className="absolute -left-[37px] md:-left-[45px] top-1 bg-white border-2 border-[#1C1E1E] rounded-full p-1.5 text-[#1C1E1E] shadow-sm">
                <Wrench className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#666258] font-mono">Stage 06: Validation</span>
                  <h3 className="font-extrabold text-sm uppercase text-[#1C1E1E]">Independent real-world benchmark validation</h3>
                </div>
                <p className="text-xs text-[#666258] leading-relaxed max-w-3xl">
                  We didn't stop at our own synthetic graphs. We validated the GNN on the public IBM AMLSim (HI-Small) benchmark—a NeurIPS 2023 dataset with 56,000 accounts and 6,357 labeled laundering profiles across 8 distinct typologies. The model was evaluated on structure it had never seen before.
                </p>
              </div>
            </div>

            {/* Stage 7 */}
            <div className="relative">
              <div className="absolute -left-[37px] md:-left-[45px] top-1 bg-white border-2 border-[#166534] rounded-full p-1.5 text-[#166534] shadow-sm">
                <CheckCircle className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#666258] font-mono">Stage 07: Benchmark</span>
                  <h3 className="font-extrabold text-sm uppercase text-[#1C1E1E]">Result: 85.5% AUC on unseen laundering patterns</h3>
                </div>
                <p className="text-xs text-[#666258] leading-relaxed max-w-3xl">
                  GraphSAGE achieved a strong, believable 85.49% AUC on the IBM AMLSim benchmark. This lower performance on real-world simulated topologies is expected—real-world data has higher complexity and less obvious tells, validating the model's capacity to generalize without overfitting to synthetic patterns.
                </p>
              </div>
            </div>

            {/* Stage 8 */}
            <div className="relative">
              <div className="absolute -left-[37px] md:-left-[45px] top-1 bg-white border-2 border-[#B45309] rounded-full p-1.5 text-[#B45309] shadow-sm">
                <AlertTriangle className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#B45309] font-mono">Stage 08: Determinism</span>
                  <h3 className="font-extrabold text-sm uppercase text-[#B45309]">We caught ourselves again — nondeterminism</h3>
                </div>
                <p className="text-xs text-[#666258] leading-relaxed max-w-3xl font-mono">
                  During a recalibration run, the evaluation scores shifted slightly. Rather than ignoring the variation, we tracked it down to unseeded randomness in PyTorch's execution and Python's default hash ordering. We fixed the random seeds and dictionary sorting across the entire training pipeline to guarantee exact results.
                </p>
              </div>
            </div>

            {/* Stage 9 */}
            <div className="relative">
              <div className="absolute -left-[37px] md:-left-[45px] top-1 bg-white border-2 border-[#166534] rounded-full p-1.5 text-[#166534] shadow-sm">
                <CheckCircle className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#666258] font-mono">Stage 09: Locked</span>
                  <h3 className="font-extrabold text-sm uppercase text-[#1C1E1E]">Final, locked, reproducible result</h3>
                </div>
                <p className="text-xs text-[#666258] leading-relaxed max-w-3xl font-mono">
                  The model was frozen and verified across three independent training runs. The resulting split hashes and accuracy metrics matched exactly to six decimal places, locking in 85.4943% AUC and 30.7471% F1-score (F1-optimal threshold). These locked parameters represent a fully reproducible, robust, and empirically validated GNN detection engine.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: Model Validation Story */}
        <section className="bg-[#FDFBF7] border-2 border-[#D2C9B9] p-8 rounded shadow-sm relative bg-paper-grain hover:-translate-y-[2px] transition-transform duration-300">
          <div className="absolute -top-3 -left-3 bg-[#991B1B] text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest transform -rotate-2 border border-[#7f1d1d] shadow-sm">
            Validation Log
          </div>
          <h2 className="text-xl font-bold border-b border-[#D2C9B9] pb-2 mb-6 uppercase flex items-center space-x-2">
            <BarChart2 className="h-5 w-5 text-[#991B1B]" />
            <span>Model Validation Story</span>
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white border border-[#D2C9B9] p-4 rounded text-sm space-y-3">
              <h3 className="font-bold uppercase text-[#1D4ED8]">Investigation Log: "Catching our own 100% AUC"</h3>
              <ul className="list-disc list-inside space-y-2 text-[#666258] ml-2">
                <li><strong className="text-[#1C1E1E]">Initial finding:</strong> GraphSAGE model achieved 100% AUC on initial validation.</li>
                <li><strong className="text-[#1C1E1E]">The Leak:</strong> We discovered standard random splitting allowed train/test edges to leak structural data between connected nodes.</li>
                <li><strong className="text-[#1C1E1E]">The Fix:</strong> Implemented a "ring-based split" using connected components to completely isolate subgraphs.</li>
                <li><strong className="text-[#1C1E1E]">Result:</strong> Model maintained robustness, proving it wasn't just memorizing edges.</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-[#D2C9B9] p-4 rounded bg-white">
                <h4 className="text-xs font-bold uppercase text-[#666258] mb-3 text-center">Baseline vs GraphSAGE (Synthetic)</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Isolation Forest (Baseline)</span>
                      <span className="font-bold">64.7% AUC</span>
                    </div>
                    <div className="w-full bg-[#E8E2D5] h-3 rounded"><div className="bg-[#666258] h-3 rounded" style={{ width: '64.7%' }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>GraphSAGE (Full Graph)</span>
                      <span className="font-bold text-[#166534]">99.9% AUC</span>
                    </div>
                    <div className="w-full bg-[#E8E2D5] h-3 rounded"><div className="bg-[#166534] h-3 rounded" style={{ width: '99.9%' }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>GraphSAGE (35% Edge-Masked)</span>
                      <span className="font-bold text-[#b45309]">96.7% AUC</span>
                    </div>
                    <div className="w-full bg-[#E8E2D5] h-3 rounded"><div className="bg-[#b45309] h-3 rounded" style={{ width: '96.7%' }}></div></div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-dashed border-[#166534] p-4 rounded bg-[#f0fdf4] relative">
                <div className="absolute top-2 right-2 text-[#166534] opacity-20">
                  <CheckCircle className="h-12 w-12" />
                </div>
                <h4 className="text-xs font-bold uppercase text-[#166534] mb-2">Independent Real-World Validation</h4>
                <p className="text-[10px] text-[#14532d] mb-4 uppercase tracking-wider">IBM AMLSim (HI-Small) - NeurIPS 2023 Benchmark<br/>56K nodes, 6,357 labeled laundering accounts</p>
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#166534]/30 text-[#14532d]">
                      <th className="py-2">Metric</th>
                      <th className="py-2">Full Graph</th>
                      <th className="py-2">Edge-Masked</th>
                    </tr>
                  </thead>
                  <tbody className="text-[#166534] font-bold">
                    <tr className="border-b border-[#166534]/10">
                      <td className="py-2">AUC (ROC)</td>
                      <td>85.49%</td>
                      <td>84.13%</td>
                    </tr>
                    <tr className="border-b border-[#166534]/10">
                      <td className="py-2 text-[10px] uppercase font-normal">F1 (Youden's J)</td>
                      <td>27.39%</td>
                      <td>27.71%</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-[10px] uppercase font-normal">F1 (Optimal Sweep)</td>
                      <td>30.75%</td>
                      <td>30.34%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-[10px] border-l-4 border-[#1D4ED8] bg-[#eff6ff] p-3 text-[#1e3a8a] flex items-start space-x-2">
              <Share2 className="h-4 w-4 shrink-0 mt-0.5" />
              <p><strong>HONEST DISCLOSURE:</strong> The interactive live demo runs on a synthetic transaction subgraph to ensure instantaneous responsiveness. The IBM AMLSim validation numbers reported above were run independently offline on the real 5M-edge dataset.</p>
            </div>
          </div>
        </section>

        {/* Section 2: Architecture & Roadmap */}
        <section className="bg-[#FDFBF7] border-2 border-[#D2C9B9] p-8 rounded shadow-sm relative bg-paper-grain hover:-translate-y-[2px] transition-transform duration-300">
          <div className="absolute -top-3 -left-3 bg-[#1C1E1E] text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest transform -rotate-1 border border-[#000] shadow-sm">
            Architecture Map
          </div>
          <h2 className="text-xl font-bold border-b border-[#D2C9B9] pb-2 mb-6 uppercase flex items-center space-x-2">
            <Cpu className="h-5 w-5 text-[#1C1E1E]" />
            <span>Architecture & Roadmap</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase text-[#1C1E1E]">Current Demo Stack</h3>
              <div className="border border-[#D2C9B9] rounded p-4 bg-white flex flex-col space-y-3 text-xs text-center font-bold">
                <div className="bg-[#1D4ED8] text-white p-2 rounded">Next.js UI (React + Tailwind)</div>
                <div className="text-[#666258]">↓ HTTP REST / JSON ↓</div>
                <div className="bg-[#166534] text-white p-2 rounded">FastAPI ML Service (Python)</div>
                <div className="text-[#666258]">↓ Local Inference ↓</div>
                <div className="bg-[#991B1B] text-white p-2 rounded">PyTorch GraphSAGE Model</div>
              </div>
            </div>

            <div className="space-y-4 opacity-70">
              <h3 className="text-sm font-bold uppercase text-[#1C1E1E] flex items-center justify-between">
                <span>Production Architecture</span>
                <span className="text-[9px] bg-[#666258] text-white px-2 py-0.5 rounded">NOT IN DEMO</span>
              </h3>
              <div className="border border-dashed border-[#666258] rounded p-4 bg-[#E8E2D5] flex flex-col space-y-2 text-[10px] text-center font-bold text-[#1C1E1E]">
                <div className="flex justify-center space-x-2">
                  <div className="border border-[#1C1E1E] p-1.5 rounded flex-1 bg-white/50">Google Pub/Sub</div>
                  <div className="border border-[#1C1E1E] p-1.5 rounded flex-1 bg-white/50">Cloud Storage</div>
                </div>
                <div>↓</div>
                <div className="border border-[#1C1E1E] p-2 rounded bg-white">BigQuery (Feature Store)</div>
                <div>↓</div>
                <div className="border border-[#1C1E1E] p-2 rounded bg-white">Vertex AI (GraphSAGE Inference)</div>
                <div>↓</div>
                <div className="flex justify-center space-x-2">
                  <div className="border border-[#1C1E1E] p-1.5 rounded flex-1 bg-white">Cloud Run (UI)</div>
                  <div className="border border-[#1C1E1E] p-1.5 rounded flex-1 bg-white">Gemini API (Forensics)</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-[#D2C9B9] pt-6">
            <h3 className="text-sm font-bold uppercase text-[#1C1E1E] mb-3">Future Roadmap</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="border border-[#D2C9B9] p-3 rounded bg-white">
                <strong className="text-[#991B1B] block mb-1">1. Temporal Graph Support</strong>
                <span className="text-[#666258]">Migrate from static GraphSAGE to TGN (Temporal Graph Networks) for sequence-aware evasion detection.</span>
              </div>
              <div className="border border-[#D2C9B9] p-3 rounded bg-white">
                <strong className="text-[#1D4ED8] block mb-1">2. Vertex AI Migration</strong>
                <span className="text-[#666258]">Deploy the model endpoints to Vertex AI for elastic scaling instead of local FastAPI processes.</span>
              </div>
              <div className="border border-[#D2C9B9] p-3 rounded bg-white">
                <strong className="text-[#166534] block mb-1">3. Automated SAR Filing</strong>
                <span className="text-[#666258]">Integrate directly with FinCEN's BSA E-Filing batch API via secure Cloud Functions.</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
