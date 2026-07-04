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
      let bg = '#78716c'; // Stone grey
      let border = '#44403c';
      let text = '#1c1e1e'; // Dark charcoal text
      
      // Determine colors based on status/roles
      if (isFrozen) {
        // Under isolation, mule hub stays red; others fade to grey
        if (node.type === 'target') {
          bg = '#991b1b'; // Distressed red stamp
          border = '#7f1d1d';
        } else {
          bg = '#a8a29e'; // Faded charcoal
          border = '#78716c';
        }
      } else {
        switch (node.type) {
          case 'victim':
            bg = '#166534'; // Safe Ledger Green
            border = '#14532d';
            break;
          case 'intermediary':
            bg = '#d97706'; // Brighter Amber
            border = '#78350f';
            break;
          case 'target':
            bg = '#991b1b'; // Stamp Red
            border = '#7f1d1d';
            break;
          case 'cash_out':
            bg = '#1d4ed8'; // Signature Pen Blue
            border = '#1e40af';
            break;
        }
      }

      let roleLabel = '';
      switch (node.type) {
        case 'victim': roleLabel = 'VICTIM'; break;
        case 'intermediary': roleLabel = 'MULE INT'; break;
        case 'target': roleLabel = 'MULE HUB'; break;
        case 'cash_out': roleLabel = 'CASH OUT'; break;
      }
      const nodeLabel = `${node.label}\n[${roleLabel}]\n(${node.id})`;

      return {
        id: node.id,
        label: nodeLabel,
        color: {
          background: bg,
          border: border,
          highlight: {
            background: '#1d4ed8', // Ballpoint blue highlight
            border: '#1e40af',
          },
          hover: {
            background: bg,
            border: '#1d4ed8',
          }
        },
        font: { color: text, size: 10, face: 'Courier New, Courier, monospace', bold: true },
        borderWidth: 2.5,
        shape: 'dot',
        size: 15,
        shadow: {
          enabled: true,
          color: 'rgba(28, 30, 30, 0.15)',
          size: 6,
          x: 2,
          y: 2
        }
      };
    });

    // 2. Map Mock Edges to vis.js Edges
    const visEdges = edges.map((edge) => {
      let edgeColor = '#78716c'; // default charcoal-stone
      if (isFrozen) {
        edgeColor = '#b91c1c'; // Isolated Red links
      } else {
        switch (edge.channel) {
          case 'ZELLE':
            edgeColor = '#1d4ed8'; // Pen blue
            break;
          case 'ACH':
            edgeColor = '#166534'; // Ledger green
            break;
          case 'WIRE':
            edgeColor = '#991b1b'; // Stamp red
            break;
        }
      }

      return {
        id: edge.id,
        from: edge.from,
        to: edge.to,
        label: edge.label,
        font: {
          color: '#1c1e1e', // Dark charcoal labels
          size: 9,
          face: 'Courier New, Courier, monospace',
          strokeWidth: 3,
          strokeColor: '#fdfbf7' // Outlined with white paper back
        },
        arrows: {
          to: { enabled: true, scaleFactor: 0.75 }
        },
        color: {
          color: edgeColor,
          highlight: '#1d4ed8',
          hover: '#1d4ed8'
        },
        width: isFrozen ? 2.5 : 1.5,
        dashes: true,
        smooth: {
          type: 'cubicBezier',
          forceDirection: 'none',
          roundness: 0.25
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

    // Add node hover lift effect
    network.on('hoverNode', (params) => {
      const net = network as any;
      if (net.body.nodes[params.node]) {
        net.body.nodes[params.node].setOptions({ 
          shadow: { size: 12, color: 'rgba(28, 30, 30, 0.3)', y: 4, x: 0 },
          size: 16 
        });
      }
    });

    network.on('blurNode', (params) => {
      const net = network as any;
      if (net.body.nodes[params.node]) {
        net.body.nodes[params.node].setOptions({ 
          shadow: { size: 6, color: 'rgba(28, 30, 30, 0.15)', y: 2, x: 2 },
          size: 15 
        });
      }
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
