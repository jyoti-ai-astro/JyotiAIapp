/**
 * Knowledge Graph
 * 
 * Phase 3 — Section 35: PAGES PHASE 20 (F35)
 * 
 * In-memory graph database for spiritual entities and relationships
 */

export type EntityType = 
  | 'planet' 
  | 'house' 
  | 'nakshatra' 
  | 'number' 
  | 'aura' 
  | 'emotion' 
  | 'chakra' 
  | 'remedy'
  | 'user-kundali'
  | 'user-numerology'
  | 'user-aura'
  | 'user-emotion';

export type EdgeType = 
  | 'strengthens' 
  | 'weakens' 
  | 'influences' 
  | 'opposes' 
  | 'harmonizes';

export interface GraphNode {
  id: string;
  type: EntityType;
  label: string;
  properties: { [key: string]: any };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  weight: number; // 0-1
  properties: { [key: string]: any };
}

export interface UserGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  synergyScore: number;
}

export class KnowledgeGraph {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge[]> = new Map(); // source -> edges

  constructor() {
    this.initializeBaseGraph();
  }

  /**
   * Initialize base graph with spiritual entities
   */
  private initializeBaseGraph(): void {
    // Planets
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    planets.forEach(planet => {
      this.addNode({
        id: `planet-${planet.toLowerCase()}`,
        type: 'planet',
        label: planet,
        properties: { name: planet },
      });
    });

    // Houses (1-12)
    for (let i = 1; i <= 12; i++) {
      this.addNode({
        id: `house-${i}`,
        type: 'house',
        label: `House ${i}`,
        properties: { number: i },
      });
    }

    // Nakshatras (27 major ones)
    const nakshatras = [
      'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
      'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
      'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshta',
      'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
      'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
    ];
    nakshatras.forEach(nakshatra => {
      this.addNode({
        id: `nakshatra-${nakshatra.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'nakshatra',
        label: nakshatra,
        properties: { name: nakshatra },
      });
    });

    // Numbers (1-9)
    for (let i = 1; i <= 9; i++) {
      this.addNode({
        id: `number-${i}`,
        type: 'number',
        label: `Number ${i}`,
        properties: { value: i },
      });
    }

    // Aura colors
    const auraColors = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet'];
    auraColors.forEach(color => {
      this.addNode({
        id: `aura-${color.toLowerCase()}`,
        type: 'aura',
        label: color,
        properties: { color },
      });
    });

    // Chakras (7)
    const chakras = ['Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown'];
    chakras.forEach(chakra => {
      this.addNode({
        id: `chakra-${chakra.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'chakra',
        label: chakra,
        properties: { name: chakra },
      });
    });

    // Add relationships
    this.addRelationships();
  }

  /**
   * Add relationships between entities
   */
  private addRelationships(): void {
    // Sun strengthens Solar Plexus chakra
    this.addEdge('planet-sun', 'chakra-solar-plexus', 'strengthens', 0.8);
    
    // Moon influences Heart chakra
    this.addEdge('planet-moon', 'chakra-heart', 'influences', 0.7);
    
    // Jupiter harmonizes with Crown chakra
    this.addEdge('planet-jupiter', 'chakra-crown', 'harmonizes', 0.9);
    
    // Venus influences Heart chakra
    this.addEdge('planet-venus', 'chakra-heart', 'influences', 0.8);
    
    // Mars strengthens Root chakra
    this.addEdge('planet-mars', 'chakra-root', 'strengthens', 0.7);
    
    // Mercury influences Throat chakra
    this.addEdge('planet-mercury', 'chakra-throat', 'influences', 0.8);
    
    // Saturn weakens Root chakra (karmic lessons)
    this.addEdge('planet-saturn', 'chakra-root', 'weakens', 0.6);
    
    // Aura colors harmonize with chakras
    this.addEdge('aura-red', 'chakra-root', 'harmonizes', 0.9);
    this.addEdge('aura-orange', 'chakra-sacral', 'harmonizes', 0.9);
    this.addEdge('aura-yellow', 'chakra-solar-plexus', 'harmonizes', 0.9);
    this.addEdge('aura-green', 'chakra-heart', 'harmonizes', 0.9);
    this.addEdge('aura-blue', 'chakra-throat', 'harmonizes', 0.9);
    this.addEdge('aura-indigo', 'chakra-third-eye', 'harmonizes', 0.9);
    this.addEdge('aura-violet', 'chakra-crown', 'harmonizes', 0.9);
    
    // Numbers influence planets
    this.addEdge('number-1', 'planet-sun', 'influences', 0.7);
    this.addEdge('number-2', 'planet-moon', 'influences', 0.7);
    this.addEdge('number-3', 'planet-jupiter', 'influences', 0.7);
    this.addEdge('number-4', 'planet-rahu', 'influences', 0.6);
    this.addEdge('number-5', 'planet-mercury', 'influences', 0.7);
    this.addEdge('number-6', 'planet-venus', 'influences', 0.7);
    this.addEdge('number-7', 'planet-ketu', 'influences', 0.6);
    this.addEdge('number-8', 'planet-saturn', 'influences', 0.7);
    this.addEdge('number-9', 'planet-mars', 'influences', 0.7);
  }

  /**
   * Add node to graph
   */
  addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
    if (!this.edges.has(node.id)) {
      this.edges.set(node.id, []);
    }
  }

  /**
   * Add edge to graph
   */
  addEdge(sourceId: string, targetId: string, type: EdgeType, weight: number = 0.5): void {
    if (!this.nodes.has(sourceId) || !this.nodes.has(targetId)) {
      return; // Skip if nodes don't exist
    }

    const edge: GraphEdge = {
      id: `${sourceId}-${type}-${targetId}`,
      source: sourceId,
      target: targetId,
      type,
      weight,
      properties: {},
    };

    if (!this.edges.has(sourceId)) {
      this.edges.set(sourceId, []);
    }
    this.edges.get(sourceId)!.push(edge);
  }

  /**
   * Find paths between nodes
   */
  findPaths(sourceId: string, targetId: string, maxDepth: number = 3): GraphEdge[][] {
    const paths: GraphEdge[][] = [];
    const visited = new Set<string>();

    const dfs = (current: string, path: GraphEdge[], depth: number) => {
      if (depth > maxDepth) return;
      if (current === targetId) {
        paths.push([...path]);
        return;
      }

      visited.add(current);
      const edges = this.edges.get(current) || [];
      
      for (const edge of edges) {
        if (!visited.has(edge.target)) {
          path.push(edge);
          dfs(edge.target, path, depth + 1);
          path.pop();
        }
      }

      visited.delete(current);
    };

    dfs(sourceId, [], 0);
    return paths;
  }

  /**
   * Find all influences on a node
   */
  findInfluences(nodeId: string): GraphEdge[] {
    const influences: GraphEdge[] = [];
    
    // Find all edges pointing to this node
    for (const [sourceId, edges] of this.edges.entries()) {
      for (const edge of edges) {
        if (edge.target === nodeId) {
          influences.push(edge);
        }
      }
    }

    return influences;
  }

  /**
   * Build user-specific graph from context
   */
  buildUserGraph(context: {
    kundali?: { majorPlanets?: Array<{ name: string; position: string }> };
    numerology?: { lifePath?: number; destiny?: number; personality?: number };
    aura?: { dominantColor?: string; chakraStrengths?: Array<{ name: string; strength: number }> };
  }): UserGraph {
    const userNodes: GraphNode[] = [];
    const userEdges: GraphEdge[] = [];

    // Add user kundali nodes
    if (context.kundali?.majorPlanets) {
      context.kundali.majorPlanets.forEach(planet => {
        const planetId = `planet-${planet.name.toLowerCase()}`;
        const userNodeId = `user-kundali-${planet.name.toLowerCase()}`;
        
        userNodes.push({
          id: userNodeId,
          type: 'user-kundali',
          label: `Your ${planet.name}`,
          properties: { planet: planet.name, position: planet.position },
        });

        // Connect to base planet node
        userEdges.push({
          id: `${userNodeId}-connects-${planetId}`,
          source: userNodeId,
          target: planetId,
          type: 'influences',
          weight: 1.0,
          properties: {},
        });
      });
    }

    // Add user numerology nodes
    if (context.numerology) {
      ['lifePath', 'destiny', 'personality'].forEach(key => {
        const value = context.numerology?.[key as keyof typeof context.numerology];
        if (value) {
          const numberId = `number-${value}`;
          const userNodeId = `user-numerology-${key}`;
          
          userNodes.push({
            id: userNodeId,
            type: 'user-numerology',
            label: `Your ${key}`,
            properties: { number: value, type: key },
          });

          userEdges.push({
            id: `${userNodeId}-connects-${numberId}`,
            source: userNodeId,
            target: numberId,
            type: 'influences',
            weight: 1.0,
            properties: {},
          });
        }
      });
    }

    // Add user aura node
    if (context.aura?.dominantColor) {
      const auraId = `aura-${context.aura.dominantColor.toLowerCase()}`;
      const userNodeId = 'user-aura';
      
      userNodes.push({
        id: userNodeId,
        type: 'user-aura',
        label: 'Your Aura',
        properties: { color: context.aura.dominantColor },
      });

      userEdges.push({
        id: `${userNodeId}-connects-${auraId}`,
        source: userNodeId,
        target: auraId,
        type: 'influences',
        weight: 1.0,
        properties: {},
      });
    }

    // Compute synergy score
    const synergyScore = this.computeSynergyScore(userNodes, userEdges);

    return {
      nodes: userNodes,
      edges: userEdges,
      synergyScore,
    };
  }

  /**
   * Compute synergy score based on graph connections
   */
  computeSynergyScore(userNodes: GraphNode[], userEdges: GraphEdge[]): number {
    if (userNodes.length === 0) return 0.5;

    let totalWeight = 0;
    let count = 0;

    // Calculate average edge weight
    for (const edge of userEdges) {
      totalWeight += edge.weight;
      count++;
    }

    const avgWeight = count > 0 ? totalWeight / count : 0.5;

    // Calculate node connectivity
    const nodeCount = userNodes.length;
    const connectivity = Math.min(1.0, nodeCount / 10); // Normalize to 0-1

    // Synergy = weighted average of connectivity and edge strength
    return (connectivity * 0.4 + avgWeight * 0.6);
  }

  /**
   * Get all nodes
   */
  getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get all edges
   */
  getAllEdges(): GraphEdge[] {
    const allEdges: GraphEdge[] = [];
    for (const edges of this.edges.values()) {
      allEdges.push(...edges);
    }
    return allEdges;
  }
}

