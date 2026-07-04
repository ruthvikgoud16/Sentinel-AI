'use client';

import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { Node as MockNode, Edge as MockEdge } from '@/lib/mockData';

interface MoneyFlowGraphProps {
  nodes: MockNode[];
  edges: MockEdge[];
  isFrozen: boolean;
  onSelectNode: (nodeId: string | null) => void;
}

export default function MoneyFlowGraph({ nodes, edges, isFrozen, onSelectNode }: MoneyFlowGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Map Mock Nodes to vis.js Nodes
    const visNodes = nodes.map((node) => {
      let bg = '#1e293b'; // Slate
      let border = '#475569';
      let text = '#f8fafc';
      
      // Determine colors based on status/roles
      if (isFrozen) {
        bg = '#7f1d1d'; // Crimson red for frozen state
        border = '#ef4444';
      } else {
        switch (node.type) {
          case 'victim':
            bg = '#064e3b'; // Green
            border = '#10b981';
            break;
          case 'intermediary':
            bg = '#7c2d12'; // Orange
            border = '#f97316';
            break;
          case 'target':
            bg = '#881337'; // Rose/Red for target
            border = '#f43f5e';
            break;
          case 'cash_out':
            bg = '#1e1b4b'; // Deep Indigo/Blue
            border = '#6366f1';
            break;
        }
      }

      return {
        id: node.id,
        label: `${node.label}\n(${node.id})`,
        color: {
          background: bg,
          border: border,
          highlight: {
            background: isFrozen ? '#991b1b' : '#312e81',
            border: isFrozen ? '#f87171' : '#818cf8',
          },
          hover: {
            background: isFrozen ? '#991b1b' : '#1e1b4b',
            border: isFrozen ? '#f87171' : '#6366f1',
          }
        },
        font: { color: text, size: 11, face: 'monospace' },
        borderWidth: 3,
        shape: 'dot',
        size: 16,
        shadow: {
          enabled: true,
          color: border,
          size: 12,
          x: 0,
          y: 0
        }
      };
    });

    // 2. Map Mock Edges to vis.js Edges
    const visEdges = edges.map((edge) => {
      let edgeColor = '#475569'; // default slate
      if (isFrozen) {
        edgeColor = '#ef4444'; // Red
      } else {
        switch (edge.channel) {
          case 'ZELLE':
            edgeColor = '#8b5cf6'; // Violet
            break;
          case 'ACH':
            edgeColor = '#f59e0b'; // Amber
            break;
          case 'WIRE':
            edgeColor = '#06b6d4'; // Cyan
            break;
        }
      }

      return {
        id: edge.id,
        from: edge.from,
        to: edge.to,
        label: edge.label,
        font: {
          color: '#e2e8f0',
          size: 11,
          face: 'monospace',
          strokeWidth: 2,
          strokeColor: '#0f172a'
        },
        arrows: {
          to: { enabled: true, scaleFactor: 0.8 }
        },
        color: {
          color: edgeColor,
          highlight: '#ffffff',
          hover: '#94a3b8'
        },
        width: isFrozen ? 3 : 2,
        dashes: true,
        smooth: {
          type: 'cubicBezier',
          forceDirection: 'none',
          roundness: 0.3
        }
      };
    });

    const data: any = {
      nodes: visNodes,
      edges: visEdges
    };

    // 3. Network options
    const options = {
      physics: {
        enabled: true,
        solver: 'barnesHut',
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.3,
          springLength: 150,
          springConstant: 0.04,
          damping: 0.09,
          avoidOverlap: 0.5
        }
      },
      interaction: {
        hover: true,
        tooltipDelay: 100,
        selectable: true,
        selectConnectedEdges: true
      },
      layout: {
        randomSeed: 42 // Constant seed for stable demo positions
      }
    };

    // 4. Initialize Network
    const network = new Network(containerRef.current, data, options);
    networkRef.current = network;

    // Connect node selection event handler
    network.on('selectNode', (params) => {
      if (params.nodes && params.nodes.length > 0) {
        onSelectNode(params.nodes[0]);
      }
    });

    network.on('deselectNode', () => {
      onSelectNode(null);
    });

    // Clean up
    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [nodes, edges, isFrozen]); // Re-render when nodes, edges, or freeze state changes

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
