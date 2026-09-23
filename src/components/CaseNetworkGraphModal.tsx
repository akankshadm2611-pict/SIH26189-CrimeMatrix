import React, { Component, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Case, Suspect } from '../types';
import { initialSuspects } from '../data/mockData';
import { NetworkingIcon } from './icons/NetworkingIcon';
import {
  X,
  Plus,
  Move,
  RotateCcw,
  Check,
  MapPin,
  FileText,
  DollarSign,
  Phone,
  User,
  Trash2,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Sliders,
  Link2,
  ArrowRight,
  Shield,
  Layers,
  FolderLock,
  AlertCircle,
  AlertTriangle,
  Edit3,
  CheckSquare,
  Square,
  Filter,
  RefreshCw,
} from 'lucide-react';

export type TemplateType = 'EVIDENCE' | 'LOCATION' | 'TRANSACTION' | 'PHONE_CALL';
export type NodeType = 'SUSPECT' | TemplateType;

export type LinkType = 'financial' | 'phone' | 'location';

export interface GraphNode {
  id: string;
  type: NodeType;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  photoUrl?: string;
  caseId?: string;
  caseName?: string;
  crimeDetails?: string;
  locationDetails?: string;
  x: number;
  y: number;
  width?: number;
  isCustom?: boolean;
}

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  sourcePort?: 'left' | 'right';
  targetPort?: 'left' | 'right';
  linkType: LinkType;
  label?: string;
  details?: string;
}

export interface ConnectionChoice {
  id: string;
  targetId: string;
  linkType: LinkType;
  label?: string;
}

interface CaseNetworkGraphModalProps {
  c: Case;
  isOpen: boolean;
  onClose: () => void;
  themeMode?: 'dark' | 'bright';
  suspects?: Suspect[];
}

/**
 * Retrieves or builds realistic suspects assigned to the given case
 */
export const getCaseSuspects = (caseObj: Case, suspectsList?: Suspect[]): Suspect[] => {
  let allSuspects: Suspect[] = [];

  if (Array.isArray(suspectsList) && suspectsList.length > 0) {
    allSuspects = suspectsList;
  } else {
    try {
      const saved = localStorage.getItem('portal_suspects');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          allSuspects = parsed;
        }
      }
    } catch {
      // ignore
    }

    if (allSuspects.length === 0) {
      allSuspects = initialSuspects;
    }
  }

  // Find suspects explicitly linked to this case
  let matched = allSuspects.filter(
    (s) => s.linkedCaseIds && s.linkedCaseIds.includes(caseObj.id)
  );

  // If none linked in storage or initialSuspects, provide case-specific assigned suspects
  if (matched.length === 0) {
    if (caseObj.id === 'CR-2026-8942') {
      matched = [
        {
          id: 'SUS-5501',
          fullName: 'Pandurang "Gavthi" Jadhav',
          age: 41,
          gender: 'Male',
          crime: 'Highway Robbery & Armed Freight Hijacking',
          address: 'Near Karmala Bypass Junction, Karmala Taluka, Solapur',
          status: 'Wanted',
          photoUrl:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
          linkedCaseIds: ['CR-2026-8942', 'CR-2026-5521'],
          connectedSuspects: [
            {
              targetSuspectId: 'SUS-5502',
              targetSuspectName: 'Dadaso "Chhatrapati" Shinde',
              relationship: 'Co-accused',
              caseId: 'CR-2026-8942',
            },
          ],
          notes: 'Armed and dangerous. Prime suspect in Karmala bank heist and highway freight hijacking.',
        },
        {
          id: 'SUS-5502',
          fullName: 'Dadaso "Chhatrapati" Shinde',
          age: 39,
          gender: 'Male',
          crime: 'Rural Credit Society Forgery & Embezzlement',
          address: 'Main Bazaar Road, Near Shivaji Chowk, Karmala Taluka, Solapur',
          status: 'Under Arrest',
          photoUrl:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
          linkedCaseIds: ['CR-2026-8942', 'CR-2026-5524'],
          connectedSuspects: [
            {
              targetSuspectId: 'SUS-5501',
              targetSuspectName: 'Pandurang "Gavthi" Jadhav',
              relationship: 'Co-accused',
              caseId: 'CR-2026-8942',
            },
          ],
          notes: 'Arrested by Karmala Sub-Division police in connection with cooperative bank fraud.',
        },
      ];
    } else if (caseObj.id === 'CR-2026-9104') {
      matched = [
        {
          id: 'SUS-5601',
          fullName: 'Sachin "Viper" Gaikwad',
          age: 36,
          gender: 'Male',
          crime: 'Industrial Chemical Sabotage & APMC Mandi Extortion',
          address: 'Plot 44, MIDC Industrial Area Phase 2, Barshi Taluka, Solapur',
          status: 'Under Arrest',
          photoUrl:
            'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
          linkedCaseIds: ['CR-2026-9104', 'CR-2026-5522'],
          connectedSuspects: [],
          notes: 'Under arrest at Barshi Town Police Station lockup for sabotage.',
        },
        {
          id: 'SUS-5602',
          fullName: 'Dhananjay "Don" Salunkhe',
          age: 44,
          gender: 'Male',
          crime: 'Organized APMC Commission Trader Extortion',
          address: 'APMC Market Yard Area, Barshi Taluka, Solapur',
          status: 'Wanted',
          photoUrl:
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
          linkedCaseIds: ['CR-2026-9104', 'CR-2026-5522'],
          connectedSuspects: [],
          notes: 'Ring leader of Barshi market yard extortion racket.',
        },
      ];
    } else if (caseObj.id === 'CR-2026-7731') {
      matched = [
        {
          id: 'SUS-5701',
          fullName: 'Ganesh "Bhaiya" Kale',
          age: 31,
          gender: 'Male',
          crime: 'Railway Goods Yard Cable Theft & Syndicate Smuggling',
          address: 'Kurduvadi Railway Settlement, Madha Taluka, Solapur',
          status: 'Missing',
          photoUrl:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
          linkedCaseIds: ['CR-2026-7731'],
          connectedSuspects: [],
          notes: 'Absconding suspect in Kurduvadi railway freight contraband and copper theft cases.',
        },
        {
          id: 'SUS-5702',
          fullName: 'Mahesh "Kabari" Pawar',
          age: 37,
          gender: 'Male',
          crime: 'Illegal Scrap Yard & Stolen Railway Transformer Fencing',
          address: 'Old Solapur Road, Kurduvadi, Madha Taluka, Solapur',
          status: 'Wanted',
          photoUrl:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
          linkedCaseIds: ['CR-2026-7731'],
          connectedSuspects: [],
          notes: 'Operates illegal salvage yard in Madha.',
        },
      ];
    } else if (caseObj.id === 'CR-2026-6119') {
      matched = [
        {
          id: 'SUS-5704',
          fullName: 'Laxman "Driver" Waghmare',
          age: 40,
          gender: 'Male',
          crime: 'Canal Pump Equipment Larceny & Transport',
          address: 'Bhimanagar Colony, Madha Taluka, Solapur',
          status: 'On Bail',
          photoUrl:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
          linkedCaseIds: ['CR-2026-6119'],
          connectedSuspects: [],
          notes: 'Granted conditional bail by Kurduvadi court.',
        },
      ];
    } else {
      // Case-tailored assigned suspect
      const titleName = caseObj.crimeType.toLowerCase().includes('cyber')
        ? 'Sameer "Ghost" Nair'
        : caseObj.crimeType.toLowerCase().includes('robbery')
        ? 'Arjun "Viper" Singh'
        : caseObj.crimeType.toLowerCase().includes('narcotics')
        ? 'Kabir "Smuggler" Khan'
        : caseObj.crimeType.toLowerCase().includes('murder') || caseObj.crimeType.toLowerCase().includes('homicide')
        ? 'Karan "Blade" Verma'
        : 'Rohan "Phantom" Desai';

      matched = [
        {
          id: `SUS-${caseObj.id.replace(/\D/g, '').slice(-4) || '801'}`,
          fullName: titleName,
          age: 35,
          gender: 'Male',
          crime: `${caseObj.crimeType} - ${caseObj.caseName}`,
          address: caseObj.location || 'Metro City Jurisdiction',
          status: 'Wanted',
          photoUrl:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
          linkedCaseIds: [caseObj.id],
          connectedSuspects: [],
          notes: `Principal person of interest assigned to investigation ${caseObj.id}.`,
        },
      ];
    }
  }

  return matched;
};

/**
 * Generates initial nodes at graph start: ONLY the suspects assigned to that particular case!
 */
export const getDefaultNodesForCase = (caseObj: Case, passedSuspects?: Suspect[]): GraphNode[] => {
  const caseSuspects = getCaseSuspects(caseObj, passedSuspects);
  const total = caseSuspects.length;

  return caseSuspects.map((s, idx) => {
    let x = 600;
    let y = 260;

    if (total === 1) {
      x = 560;
    } else if (total === 2) {
      x = idx === 0 ? 380 : 780;
    } else if (total === 3) {
      x = idx === 0 ? 240 : idx === 1 ? 580 : 920;
    } else {
      const spacing = Math.min(320, 1000 / Math.max(1, total - 1));
      x = Math.round(200 + (idx % 4) * spacing);
      if (idx >= 4) {
        y = 480;
      }
    }

    const badge = s.status?.toUpperCase() || 'WANTED';
    let badgeColor =
      'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800';
    if (s.status === 'On Bail') {
      badgeColor =
        'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800';
    } else if (s.status === 'Under Investigation') {
      badgeColor =
        'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800';
    } else if (s.status === 'Wanted' || s.status === 'Missing') {
      badgeColor =
        'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800';
    }

    return {
      id: `node-suspect-${s.id}`,
      type: 'SUSPECT',
      title: s.fullName,
      subtitle: s.crime || s.notes || 'Primary Suspect',
      badge,
      badgeColor,
      photoUrl: s.photoUrl,
      caseId: caseObj.id,
      caseName: caseObj.caseName,
      crimeDetails: s.crime || caseObj.crimeType,
      locationDetails: s.address || caseObj.location,
      x,
      y,
      isCustom: false,
    };
  });
};

/**
 * Merges existing / cached graph nodes with the active suspects linked to this case.
 * Ensures that if a suspect is added to this case, their suspect template card is displayed on the networking graph!
 */
export const mergeNodesWithCaseSuspects = (
  existingNodes: GraphNode[] | null,
  caseObj: Case,
  suspectsList?: Suspect[]
): GraphNode[] => {
  const caseSuspects = getCaseSuspects(caseObj, suspectsList);
  if (!existingNodes || existingNodes.length === 0) {
    return getDefaultNodesForCase(caseObj, suspectsList);
  }

  const updatedNodes = [...existingNodes];

  // Map of suspect IDs for this case
  const currentSuspectMap = new Map<string, Suspect>();
  caseSuspects.forEach((s) => {
    currentSuspectMap.set(s.id, s);
  });

  // 1. Update any existing SUSPECT nodes with latest suspect details
  updatedNodes.forEach((node, idx) => {
    if (node.type === 'SUSPECT') {
      const sId = node.id.replace('node-suspect-', '');
      const matchedSuspect =
        currentSuspectMap.get(sId) ||
        caseSuspects.find((s) => s.fullName.toLowerCase() === node.title.toLowerCase());

      if (matchedSuspect) {
        const badge = matchedSuspect.status?.toUpperCase() || 'WANTED';
        let badgeColor =
          'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800';
        if (matchedSuspect.status === 'On Bail') {
          badgeColor =
            'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800';
        } else if (matchedSuspect.status === 'Under Investigation') {
          badgeColor =
            'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800';
        } else if (matchedSuspect.status === 'Wanted' || matchedSuspect.status === 'Missing') {
          badgeColor =
            'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800';
        }

        updatedNodes[idx] = {
          ...node,
          id: `node-suspect-${matchedSuspect.id}`,
          title: matchedSuspect.fullName,
          subtitle: matchedSuspect.crime || matchedSuspect.notes || node.subtitle || 'Primary Suspect',
          badge,
          badgeColor,
          photoUrl: matchedSuspect.photoUrl || node.photoUrl,
          caseId: caseObj.id,
          caseName: caseObj.caseName,
          crimeDetails: matchedSuspect.crime || caseObj.crimeType,
          locationDetails: matchedSuspect.address || caseObj.location,
        };
      }
    }
  });

  // 2. Add any suspect linked to this case that does not have a node yet
  caseSuspects.forEach((suspect) => {
    const suspectNodeId = `node-suspect-${suspect.id}`;
    const exists = updatedNodes.some(
      (n) =>
        n.id === suspectNodeId ||
        (n.type === 'SUSPECT' && n.title.toLowerCase() === suspect.fullName.toLowerCase())
    );

    if (!exists) {
      // Create new template node for this suspect!
      const existingSuspects = updatedNodes.filter((n) => n.type === 'SUSPECT');
      let newX = 560;
      let newY = 260;

      if (existingSuspects.length > 0) {
        const maxX = Math.max(...existingSuspects.map((n) => n.x));
        newX = maxX + 340;
        if (newX > 1200) {
          newX = 200 + (existingSuspects.length % 3) * 340;
          newY = 480;
        }
      }

      const badge = suspect.status?.toUpperCase() || 'WANTED';
      let badgeColor =
        'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800';
      if (suspect.status === 'On Bail') {
        badgeColor =
          'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800';
      } else if (suspect.status === 'Under Investigation') {
        badgeColor =
          'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800';
      } else if (suspect.status === 'Wanted' || suspect.status === 'Missing') {
        badgeColor =
          'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800';
      }

      updatedNodes.push({
        id: suspectNodeId,
        type: 'SUSPECT',
        title: suspect.fullName,
        subtitle: suspect.crime || suspect.notes || 'Assigned Suspect',
        badge,
        badgeColor,
        photoUrl: suspect.photoUrl,
        caseId: caseObj.id,
        caseName: caseObj.caseName,
        crimeDetails: suspect.crime || caseObj.crimeType,
        locationDetails: suspect.address || caseObj.location,
        x: newX,
        y: newY,
        isCustom: false,
      });
    }
  });

  // 3. Remove suspects that are no longer linked to this case (unless custom node)
  const activeSuspectIdSet = new Set(caseSuspects.map((s) => `node-suspect-${s.id}`));
  const activeSuspectNames = new Set(caseSuspects.map((s) => s.fullName.toLowerCase()));

  const finalNodes = updatedNodes.filter((n) => {
    if (n.type === 'SUSPECT' && !n.isCustom) {
      return activeSuspectIdSet.has(n.id) || activeSuspectNames.has(n.title.toLowerCase());
    }
    return true;
  });

  return finalNodes;
};

/**
 * At the start, edges are empty so members can manually make connections!
 */
export const getDefaultEdgesForCase = (): GraphEdge[] => {
  return [];
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
  isBright: boolean;
  onRecover?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class NetworkGraphErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('Case Network Graph caught rendering error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className={`w-full h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center select-none ${
            this.props.isBright ? 'bg-slate-50 text-slate-800' : 'bg-slate-900 text-slate-100'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-3">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm mb-1">Graph Workspace Restored</h3>
          <p className="text-xs text-slate-500 mb-4 max-w-sm">
            A temporary display event occurred. Click below to continue working on your network graph smoothly.
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false });
              if (this.props.onRecover) this.props.onRecover();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs"
          >
            Resume Graph Workspace
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const CaseNetworkGraphModal: React.FC<CaseNetworkGraphModalProps> = ({
  c,
  isOpen,
  onClose,
  themeMode = 'bright',
  suspects,
}) => {
  const isBright = themeMode === 'bright';
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom & Pan state for visible scaling
  const [zoom, setZoom] = useState<number>(0.85);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ mouseX: number; mouseY: number; startPanX: number; startPanY: number } | null>(
    null
  );
  const pinchStartRef = useRef<{ dist: number; startZoom: number } | null>(null);

  // Link Filter Checkboxes (default: all active)
  const [filterFinancial, setFilterFinancial] = useState<boolean>(true);
  const [filterPhone, setFilterPhone] = useState<boolean>(true);
  const [filterLocation, setFilterLocation] = useState<boolean>(true);

  // Entity Template Multi-Check Filters (Evidence, Co-location, Transaction, Phone)
  const [filterEntityEvidence, setFilterEntityEvidence] = useState<boolean>(false);
  const [filterEntityColocation, setFilterEntityColocation] = useState<boolean>(false);
  const [filterEntityTransaction, setFilterEntityTransaction] = useState<boolean>(false);
  const [filterEntityPhone, setFilterEntityPhone] = useState<boolean>(false);

  // Selected / focused subject node
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  // Filter dropdown state (opens right at heading button)
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // Fullscreen toggle
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Add Template Modal State
  const [showAddTemplateModal, setShowAddTemplateModal] = useState<boolean>(false);
  const [newTemplateType, setNewTemplateType] = useState<TemplateType>('EVIDENCE');
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [newTemplateSubtitle, setNewTemplateSubtitle] = useState('');
  const [newTemplateBadge, setNewTemplateBadge] = useState('HIGH RISK');
  const [newTemplatePhotoUrl, setNewTemplatePhotoUrl] = useState('');
  const [selectedNodeToConnect, setSelectedNodeToConnect] = useState<string>('');
  const [newConnections, setNewConnections] = useState<ConnectionChoice[]>([]);

  // Manual Connect Modal State
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);
  const [manualSourceId, setManualSourceId] = useState<string>('');
  const [manualTargetId, setManualTargetId] = useState<string>('');
  const [manualLinkType, setManualLinkType] = useState<LinkType>('phone');
  const [manualLinkLabel, setManualLinkLabel] = useState<string>('');

  // Pending connection state when connecting two templates (opens dialog to fill custom text)
  interface PendingConnection {
    sourceId: string;
    targetId: string;
    sourcePort: 'left' | 'right';
    targetPort: 'left' | 'right';
  }
  const [pendingConnection, setPendingConnection] = useState<PendingConnection | null>(null);
  const [connectionInputText, setConnectionInputText] = useState<string>('');
  const [connectionLinkType, setConnectionLinkType] = useState<LinkType>('phone');

  // Edit existing connection state
  const [editingEdge, setEditingEdge] = useState<GraphEdge | null>(null);
  const [editEdgeText, setEditEdgeText] = useState<string>('');
  const [editEdgeType, setEditEdgeType] = useState<LinkType>('phone');

  // Reset graph confirmation modal
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);

  // Drag-to-Connect state: user clicks a dot and drags line to another template's dot
  interface ConnectingState {
    sourceNodeId: string;
    sourceSide: 'left' | 'right';
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  }
  const [connectingState, setConnectingState] = useState<ConnectingState | null>(null);
  const dragConnectStartRef = useRef<{
    startX: number;
    startY: number;
    mouseX: number;
    mouseY: number;
  } | null>(null);

  // Dragging state for nodes
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; nodeX: number; nodeY: number } | null>(null);

  // Storage keys versioned to ensure clean initial suspect state per case
  const storageKeyNodes = `case_network_nodes_v12_${c.id}`;
  const storageKeyEdges = `case_network_edges_v12_${c.id}`;

  const [nodes, setNodes] = useState<GraphNode[]>(() => {
    let savedNodes: GraphNode[] | null = null;
    try {
      const saved = localStorage.getItem(storageKeyNodes);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          savedNodes = parsed;
        }
      }
    } catch {
      // ignore
    }
    return mergeNodesWithCaseSuspects(savedNodes, c, suspects);
  });

<<<<<<< HEAD
=======
  // Keep a stable ref to current nodes so handleFitView never forces re-renders or shifts other templates
  const nodesRef = useRef<GraphNode[]>(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

>>>>>>> aa42170 (CrimeMtrix1)
  const [edges, setEdges] = useState<GraphEdge[]>(() => {
    try {
      const saved = localStorage.getItem(storageKeyEdges);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return getDefaultEdgesForCase();
  });

  // Re-sync when case, modal open state, or suspects change
  useEffect(() => {
    let savedNodes: GraphNode[] | null = null;
    try {
      const saved = localStorage.getItem(`case_network_nodes_v12_${c.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          savedNodes = parsed;
        }
      }
    } catch {
      // ignore
    }

    const mergedNodes = mergeNodesWithCaseSuspects(savedNodes, c, suspects);
    setNodes(mergedNodes);
    try {
      localStorage.setItem(`case_network_nodes_v12_${c.id}`, JSON.stringify(mergedNodes));
    } catch {
      // ignore
    }

    try {
      const savedEdges = localStorage.getItem(`case_network_edges_v12_${c.id}`);
      if (savedEdges) {
        const parsed = JSON.parse(savedEdges);
        if (Array.isArray(parsed)) {
          const validIds = new Set(mergedNodes.map((n) => n.id));
          const cleanedEdges = parsed.filter((e) => validIds.has(e.sourceId) && validIds.has(e.targetId));
          setEdges(cleanedEdges);
        } else {
          setEdges(getDefaultEdgesForCase());
        }
      } else {
        setEdges(getDefaultEdgesForCase());
      }
    } catch {
      setEdges(getDefaultEdgesForCase());
    }
    setSelectedSubjectId(null);
  }, [c.id, isOpen, suspects]);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKeyNodes, JSON.stringify(nodes));
      localStorage.setItem(storageKeyEdges, JSON.stringify(edges));
    } catch {
      // ignore
    }
  }, [nodes, edges, storageKeyNodes, storageKeyEdges]);

  // Reset to original layout: only the suspects assigned to that particular case!
  const handleResetLayout = () => {
    setShowResetConfirmModal(true);
  };

  // Node Drag Handlers
  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    setDraggingNodeId(nodeId);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      nodeX: node.x,
      nodeY: node.y,
    };
  };

  const handleTouchStart = (e: React.TouchEvent, nodeId: string) => {
    e.stopPropagation();
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    setDraggingNodeId(nodeId);
    dragStartRef.current = {
      mouseX: touch.clientX,
      mouseY: touch.clientY,
      nodeX: node.x,
      nodeY: node.y,
    };
  };

  // Helper to get Node dimensions for anchor points
  const getNodeDimensions = (type: NodeType) => {
    switch (type) {
      case 'SUSPECT':
        return { w: 288, h: 185 };
      case 'EVIDENCE':
        return { w: 272, h: 120 };
      case 'LOCATION':
        return { w: 272, h: 120 };
      case 'TRANSACTION':
        return { w: 272, h: 130 };
      case 'PHONE_CALL':
        return { w: 272, h: 120 };
      default:
        return { w: 272, h: 120 };
    }
  };

  // Initiate connection between two templates (opens dialog to capture user-entered label)
  const handleInitiateConnection = (
    sourceId: string,
    targetId: string,
    sourcePort: 'left' | 'right' = 'right',
    targetPort: 'left' | 'right' = 'left'
  ) => {
    if (!sourceId || !targetId || sourceId === targetId) return;

    const sourceNode = nodes.find((n) => n.id === sourceId);
    const targetNode = nodes.find((n) => n.id === targetId);
    if (!sourceNode || !targetNode) return;

    // Default suggested category type based on node types
    let suggestedType: LinkType = 'phone';
    if (sourceNode.type === 'TRANSACTION' || targetNode.type === 'TRANSACTION') {
      suggestedType = 'financial';
    } else if (
      sourceNode.type === 'LOCATION' ||
      targetNode.type === 'LOCATION' ||
      sourceNode.type === 'EVIDENCE' ||
      targetNode.type === 'EVIDENCE'
    ) {
      suggestedType = 'location';
    }

    setConnectionLinkType(suggestedType);
    setConnectionInputText(''); // Strictly NOT given by default, must be filled by the user
    setPendingConnection({
      sourceId,
      targetId,
      sourcePort,
      targetPort,
    });
  };

  // Submit confirmed connection with user-filled text
  const handleConfirmConnection = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pendingConnection) return;
    const labelText = connectionInputText.trim();
    if (!labelText) return;

    const newEdge: GraphEdge = {
      id: `edge-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      sourceId: pendingConnection.sourceId,
      targetId: pendingConnection.targetId,
      sourcePort: pendingConnection.sourcePort,
      targetPort: pendingConnection.targetPort,
      linkType: connectionLinkType,
      label: labelText,
    };

    setEdges((prev) => [...prev, newEdge]);
    setPendingConnection(null);
    setConnectionInputText('');
  };

  // Helper to calculate exact coordinates for an edge connecting two nodes and their points
  const getEdgeEndpoints = (
    edge: GraphEdge,
    src: GraphNode,
    tgt: GraphNode,
    indexInPair: number,
    totalInPair: number
  ) => {
    const srcDim = getNodeDimensions(src.type);
    const tgtDim = getNodeDimensions(tgt.type);

    const sx = Number.isFinite(src.x) ? src.x : 200;
    const sy = Number.isFinite(src.y) ? src.y : 200;
    const tx = Number.isFinite(tgt.x) ? tgt.x : 600;
    const ty = Number.isFinite(tgt.y) ? tgt.y : 200;

    let srcPort = edge.sourcePort;
    let tgtPort = edge.targetPort;

    if (!srcPort) {
      srcPort = sx < tx ? 'right' : 'left';
    }
    if (!tgtPort) {
      tgtPort = sx < tx ? 'left' : 'right';
    }

    const x1 = srcPort === 'left' ? sx : sx + srcDim.w;
    const y1 = sy + srcDim.h / 2;
    const x2 = tgtPort === 'left' ? tx : tx + tgtDim.w;
    const y2 = ty + tgtDim.h / 2;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const normX = -dy / dist;
    const normY = dx / dist;

    let curveOffset = 0;
    if (totalInPair > 1) {
      curveOffset = (indexInPair - (totalInPair - 1) / 2) * 36;
    } else {
      curveOffset = dx > 0 ? 14 : -14;
    }

    const ctrlX = Math.round((x1 + x2) / 2 + normX * curveOffset);
    const ctrlY = Math.round((y1 + y2) / 2 + normY * curveOffset);
    // For quadratic bezier B(0.5) = 0.25*x1 + 0.5*ctrlX + 0.25*x2
    const midX = Math.round(0.25 * x1 + 0.5 * ctrlX + 0.25 * x2);
    const midY = Math.round(0.25 * y1 + 0.5 * ctrlY + 0.25 * y2);

    return { x1, y1, x2, y2, ctrlX, ctrlY, midX, midY, srcPort, tgtPort };
  };

  // Start dragging connection line from a template dot
  const handleStartConnecting = (
    e: React.MouseEvent | React.TouchEvent,
    nodeId: string,
    side: 'left' | 'right'
  ) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    const dim = getNodeDimensions(node.type);
    const nx = Number.isFinite(node.x) ? node.x : 200;
    const ny = Number.isFinite(node.y) ? node.y : 200;
    const startX = side === 'left' ? nx : nx + dim.w;
    const startY = ny + dim.h / 2;

    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    dragConnectStartRef.current = {
      startX,
      startY,
      mouseX: clientX,
      mouseY: clientY,
    };

    setConnectingState({
      sourceNodeId: nodeId,
      sourceSide: side,
      startX,
      startY,
      currentX: startX,
      currentY: startY,
    });
  };

  // Releasing over a template's dot (left or right port)
  const handlePortMouseUp = (
    e: React.MouseEvent,
    targetNodeId: string,
    targetSide: 'left' | 'right'
  ) => {
    e.stopPropagation();
    if (connectingState && connectingState.sourceNodeId !== targetNodeId) {
      handleInitiateConnection(
        connectingState.sourceNodeId,
        targetNodeId,
        connectingState.sourceSide,
        targetSide
      );
    }
    setConnectingState(null);
    dragConnectStartRef.current = null;
  };

  // Releasing over a template's card body
  const handleCardMouseUp = (e: React.MouseEvent, targetNodeId: string) => {
    if (connectingState && connectingState.sourceNodeId !== targetNodeId) {
      e.stopPropagation();
      const sourceNode = nodes.find((n) => n.id === connectingState.sourceNodeId);
      const targetNode = nodes.find((n) => n.id === targetNodeId);
      const sx = sourceNode && Number.isFinite(sourceNode.x) ? sourceNode.x : 0;
      const tx = targetNode && Number.isFinite(targetNode.x) ? targetNode.x : 0;
      const targetSide: 'left' | 'right' = sx < tx ? 'left' : 'right';

      handleInitiateConnection(
        connectingState.sourceNodeId,
        targetNodeId,
        connectingState.sourceSide,
        targetSide
      );
      setConnectingState(null);
      dragConnectStartRef.current = null;
    }
  };

  // Global window listeners for drag-to-connect to avoid dropped events or stuck states
  useEffect(() => {
    if (!connectingState) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const connectStart = dragConnectStartRef.current;
      if (!connectStart) return;
      const currentZoom = Number.isFinite(zoom) && zoom > 0.1 ? zoom : 0.85;
      const dx = (e.clientX - connectStart.mouseX) / currentZoom;
      const dy = (e.clientY - connectStart.mouseY) / currentZoom;
      if (Number.isFinite(dx) && Number.isFinite(dy)) {
        const nextX = Math.round(connectStart.startX + dx);
        const nextY = Math.round(connectStart.startY + dy);
        setConnectingState((prev) =>
          prev
            ? {
                ...prev,
                currentX: nextX,
                currentY: nextY,
              }
            : null
        );
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      const targetEl = document.elementFromPoint(e.clientX, e.clientY);
      const portEl = targetEl?.closest('[id^="port-"]');
      const cardEl = targetEl?.closest('[id^="network-node-"]');

      if (connectingState) {
        if (portEl) {
          const portId = portEl.id;
          const side: 'left' | 'right' = portId.includes('left') ? 'left' : 'right';
          const targetNodeId = portId.replace(`port-${side}-`, '');
          if (targetNodeId && targetNodeId !== connectingState.sourceNodeId) {
            handleInitiateConnection(
              connectingState.sourceNodeId,
              targetNodeId,
              connectingState.sourceSide,
              side
            );
          }
        } else if (cardEl) {
          const targetNodeId = cardEl.id.replace('network-node-', '');
          if (targetNodeId && targetNodeId !== connectingState.sourceNodeId) {
            const sourceNode = nodes.find((n) => n.id === connectingState.sourceNodeId);
            const targetNode = nodes.find((n) => n.id === targetNodeId);
            const sx = sourceNode && Number.isFinite(sourceNode.x) ? sourceNode.x : 0;
            const tx = targetNode && Number.isFinite(targetNode.x) ? targetNode.x : 0;
            const targetSide: 'left' | 'right' = sx < tx ? 'left' : 'right';
            handleInitiateConnection(
              connectingState.sourceNodeId,
              targetNodeId,
              connectingState.sourceSide,
              targetSide
            );
          }
        }
      }

      setConnectingState(null);
      dragConnectStartRef.current = null;
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [connectingState, zoom, nodes]);

  // Window listeners for node dragging and canvas panning to prevent stuck states or runaway movements
  useEffect(() => {
    if (!isPanning && !draggingNodeId) return;

    const handleGlobalMove = (e: MouseEvent) => {
      const currentZoom = Number.isFinite(zoom) && zoom > 0.1 ? zoom : 0.85;
      const nodeStart = dragStartRef.current;
      const panStart = panStartRef.current;

      if (draggingNodeId && nodeStart) {
        const dx = (e.clientX - nodeStart.mouseX) / currentZoom;
        const dy = (e.clientY - nodeStart.mouseY) / currentZoom;
        if (Number.isFinite(dx) && Number.isFinite(dy)) {
          const nextX = Math.max(10, Math.min(1350, Math.round(nodeStart.nodeX + dx)));
          const nextY = Math.max(10, Math.min(750, Math.round(nodeStart.nodeY + dy)));
          setNodes((prev) =>
            prev.map((n) =>
              n.id === draggingNodeId
                ? {
                    ...n,
                    x: nextX,
                    y: nextY,
                  }
                : n
            )
          );
        }
      } else if (isPanning && panStart) {
        const dx = e.clientX - panStart.mouseX;
        const dy = e.clientY - panStart.mouseY;
        if (Number.isFinite(dx) && Number.isFinite(dy)) {
          const nextPanX = Math.max(-700, Math.min(700, Math.round(panStart.startPanX + dx)));
          const nextPanY = Math.max(-450, Math.min(450, Math.round(panStart.startPanY + dy)));
          setPan({
            x: nextPanX,
            y: nextPanY,
          });
        }
      }
    };

<<<<<<< HEAD
=======
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      const currentZoom = Number.isFinite(zoom) && zoom > 0.1 ? zoom : 0.85;
      const nodeStart = dragStartRef.current;
      const panStart = panStartRef.current;

      if (draggingNodeId && nodeStart) {
        const dx = (touch.clientX - nodeStart.mouseX) / currentZoom;
        const dy = (touch.clientY - nodeStart.mouseY) / currentZoom;
        if (Number.isFinite(dx) && Number.isFinite(dy)) {
          const nextX = Math.max(10, Math.min(1350, Math.round(nodeStart.nodeX + dx)));
          const nextY = Math.max(10, Math.min(750, Math.round(nodeStart.nodeY + dy)));
          setNodes((prev) =>
            prev.map((n) =>
              n.id === draggingNodeId
                ? {
                    ...n,
                    x: nextX,
                    y: nextY,
                  }
                : n
            )
          );
        }
      } else if (isPanning && panStart) {
        const dx = touch.clientX - panStart.mouseX;
        const dy = touch.clientY - panStart.mouseY;
        if (Number.isFinite(dx) && Number.isFinite(dy)) {
          const nextPanX = Math.max(-700, Math.min(700, Math.round(panStart.startPanX + dx)));
          const nextPanY = Math.max(-450, Math.min(450, Math.round(panStart.startPanY + dy)));
          setPan({
            x: nextPanX,
            y: nextPanY,
          });
        }
      }
    };

>>>>>>> aa42170 (CrimeMtrix1)
    const handleGlobalUp = () => {
      setIsPanning(false);
      panStartRef.current = null;
      setDraggingNodeId(null);
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('mouseup', handleGlobalUp);
<<<<<<< HEAD
    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
=======
    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    window.addEventListener('touchend', handleGlobalUp);
    window.addEventListener('touchcancel', handleGlobalUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalUp);
      window.removeEventListener('touchcancel', handleGlobalUp);
>>>>>>> aa42170 (CrimeMtrix1)
    };
  }, [isPanning, draggingNodeId, zoom]);

  // Helper to render interactive connection dots for any template (Both Left and Right points)
  const renderConnectionPorts = (nodeId: string, dotColor: string) => {
    const isTarget = connectingState && connectingState.sourceNodeId !== nodeId;
    return (
      <>
        {/* Left Connection Port Dot */}
        <div
          id={`port-left-${nodeId}`}
          onMouseDown={(e) => handleStartConnecting(e, nodeId, 'left')}
          onTouchStart={(e) => handleStartConnecting(e, nodeId, 'left')}
          onMouseUp={(e) => handlePortMouseUp(e, nodeId, 'left')}
          title="Left Point: Click and drag to connect"
          className={`w-4 h-4 rounded-full ${dotColor} border-2 border-white dark:border-slate-900 absolute -left-2 top-1/2 -translate-y-1/2 shadow-xs cursor-crosshair z-30 transition-all duration-150 hover:scale-150 hover:ring-4 hover:ring-blue-400/80 ${
            isTarget ? 'ring-4 ring-blue-500 scale-125 animate-pulse' : ''
          }`}
        />
        {/* Right Connection Port Dot */}
        <div
          id={`port-right-${nodeId}`}
          onMouseDown={(e) => handleStartConnecting(e, nodeId, 'right')}
          onTouchStart={(e) => handleStartConnecting(e, nodeId, 'right')}
          onMouseUp={(e) => handlePortMouseUp(e, nodeId, 'right')}
          title="Right Point: Click and drag to connect"
          className={`w-4 h-4 rounded-full ${dotColor} border-2 border-white dark:border-slate-900 absolute -right-2 top-1/2 -translate-y-1/2 shadow-xs cursor-crosshair z-30 transition-all duration-150 hover:scale-150 hover:ring-4 hover:ring-blue-400/80 ${
            isTarget ? 'ring-4 ring-blue-500 scale-125 animate-pulse' : ''
          }`}
        />
      </>
    );
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const currentZoom = Number.isFinite(zoom) && zoom > 0.1 ? zoom : 0.85;
    const connectStart = dragConnectStartRef.current;
    const nodeStart = dragStartRef.current;
    const panStart = panStartRef.current;

    if (connectingState && connectStart) {
      const dx = (e.clientX - connectStart.mouseX) / currentZoom;
      const dy = (e.clientY - connectStart.mouseY) / currentZoom;
      if (Number.isFinite(dx) && Number.isFinite(dy)) {
        const nextX = Math.round(connectStart.startX + dx);
        const nextY = Math.round(connectStart.startY + dy);
        setConnectingState((prev) =>
          prev
            ? {
                ...prev,
                currentX: nextX,
                currentY: nextY,
              }
            : null
        );
      }
      return;
    }

<<<<<<< HEAD
    if (draggingNodeId && nodeStart) {
      const dx = (e.clientX - nodeStart.mouseX) / currentZoom;
      const dy = (e.clientY - nodeStart.mouseY) / currentZoom;
      if (Number.isFinite(dx) && Number.isFinite(dy)) {
        const nextX = Math.max(10, Math.min(1350, Math.round(nodeStart.nodeX + dx)));
        const nextY = Math.max(10, Math.min(750, Math.round(nodeStart.nodeY + dy)));
        setNodes((prev) =>
          prev.map((n) =>
            n.id === draggingNodeId
              ? {
                  ...n,
                  x: nextX,
                  y: nextY,
                }
              : n
          )
        );
      }
    } else if (isPanning && panStart) {
      const dx = e.clientX - panStart.mouseX;
      const dy = e.clientY - panStart.mouseY;
      if (Number.isFinite(dx) && Number.isFinite(dy)) {
        const nextPanX = Math.max(-700, Math.min(700, Math.round(panStart.startPanX + dx)));
        const nextPanY = Math.max(-450, Math.min(450, Math.round(panStart.startPanY + dy)));
        setPan({
          x: nextPanX,
          y: nextPanY,
        });
      }
=======
    if (draggingNodeId || isPanning) {
      return;
>>>>>>> aa42170 (CrimeMtrix1)
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Two-finger pinch-to-zoom for mobile phones and touch displays
    if (e.touches.length === 2 && pinchStartRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      if (pinchStartRef.current.dist > 10) {
        const factor = currentDist / pinchStartRef.current.dist;
        const newZoom = Math.max(0.2, Math.min(1.6, Number((pinchStartRef.current.startZoom * factor).toFixed(2))));
        setZoom(newZoom);
      }
      return;
    }

    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const currentZoom = Number.isFinite(zoom) && zoom > 0.1 ? zoom : 0.85;
    const connectStart = dragConnectStartRef.current;
    const nodeStart = dragStartRef.current;
    const panStart = panStartRef.current;

    if (connectingState && connectStart) {
      const dx = (touch.clientX - connectStart.mouseX) / currentZoom;
      const dy = (touch.clientY - connectStart.mouseY) / currentZoom;
      if (Number.isFinite(dx) && Number.isFinite(dy)) {
        const nextX = Math.round(connectStart.startX + dx);
        const nextY = Math.round(connectStart.startY + dy);
        setConnectingState((prev) =>
          prev
            ? {
                ...prev,
                currentX: nextX,
                currentY: nextY,
              }
            : null
        );
      }
      return;
    }

<<<<<<< HEAD
    if (draggingNodeId && nodeStart) {
      const dx = (touch.clientX - nodeStart.mouseX) / currentZoom;
      const dy = (touch.clientY - nodeStart.mouseY) / currentZoom;
      if (Number.isFinite(dx) && Number.isFinite(dy)) {
        const nextX = Math.max(10, Math.min(1350, Math.round(nodeStart.nodeX + dx)));
        const nextY = Math.max(10, Math.min(750, Math.round(nodeStart.nodeY + dy)));
        setNodes((prev) =>
          prev.map((n) =>
            n.id === draggingNodeId
              ? {
                  ...n,
                  x: nextX,
                  y: nextY,
                }
              : n
          )
        );
      }
    } else if (isPanning && panStart) {
      const dx = touch.clientX - panStart.mouseX;
      const dy = touch.clientY - panStart.mouseY;
      if (Number.isFinite(dx) && Number.isFinite(dy)) {
        const nextPanX = Math.max(-950, Math.min(950, Math.round(panStart.startPanX + dx)));
        const nextPanY = Math.max(-650, Math.min(650, Math.round(panStart.startPanY + dy)));
        setPan({
          x: nextPanX,
          y: nextPanY,
        });
      }
=======
    if (draggingNodeId || isPanning) {
      return;
>>>>>>> aa42170 (CrimeMtrix1)
    }
  };

  const handleMouseUp = (e?: React.MouseEvent) => {
    if (connectingState) {
      setConnectingState(null);
      dragConnectStartRef.current = null;
    }
    setDraggingNodeId(null);
    dragStartRef.current = null;
    if (isPanning && panStartRef.current && e) {
      const dist = Math.hypot(e.clientX - panStartRef.current.mouseX, e.clientY - panStartRef.current.mouseY);
      if (dist < 4) {
        setSelectedSubjectId(null);
      }
    }
    setIsPanning(false);
    panStartRef.current = null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    pinchStartRef.current = null;
    if (connectingState) {
      if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        const targetNodeEl = el?.closest('[id^="network-node-"]');
        if (targetNodeEl) {
          const targetId = targetNodeEl.getAttribute('id')?.replace('network-node-', '');
          if (targetId && targetId !== connectingState.sourceNodeId) {
            const portEl = el?.closest('[id^="port-"]');
            const targetSide: 'left' | 'right' = portEl?.id.includes('right') ? 'right' : 'left';
            handleInitiateConnection(
              connectingState.sourceNodeId,
              targetId,
              connectingState.sourceSide,
              targetSide
            );
          }
        }
      }
      setConnectingState(null);
      dragConnectStartRef.current = null;
    }
    setDraggingNodeId(null);
    dragStartRef.current = null;
    setIsPanning(false);
    panStartRef.current = null;
  };

  // Canvas Mouse Pan Handler
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('[id^="network-node-"]')) return;
    if ((e.target as HTMLElement).closest('[id^="port-"]')) return;
    if ((e.target as HTMLElement).closest('#panel-link-filters')) return;
    if ((e.target as HTMLElement).closest('button')) return;

    setIsPanning(true);
    panStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
    };
  };

  // Canvas Touch Pan & Pinch Start Handler (essential for mobile devices)
  const handleCanvasTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('[id^="network-node-"]')) return;
    if ((e.target as HTMLElement).closest('[id^="port-"]')) return;
    if ((e.target as HTMLElement).closest('#panel-link-filters')) return;
    if ((e.target as HTMLElement).closest('button')) return;

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsPanning(true);
      panStartRef.current = {
        mouseX: touch.clientX,
        mouseY: touch.clientY,
        startPanX: pan.x,
        startPanY: pan.y,
      };
      pinchStartRef.current = null;
    } else if (e.touches.length === 2) {
      setIsPanning(false);
      panStartRef.current = null;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const initialDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      pinchStartRef.current = {
        dist: Math.max(10, initialDist),
        startZoom: zoom,
      };
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(1.4, Number((prev + 0.1).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.4, Number((prev - 0.1).toFixed(2))));
  };

  // Fits all nodes into the current view, scaling and centering appropriately for any device (including mobile phones)
<<<<<<< HEAD
  const handleFitView = useCallback(() => {
    if (!containerRef.current || nodes.length === 0) {
=======
  // Uses nodesRef so dragging a template does not alter function identity or trigger canvas jumping
  const handleFitView = useCallback(() => {
    const currentNodes = nodesRef.current;
    if (!containerRef.current || currentNodes.length === 0) {
>>>>>>> aa42170 (CrimeMtrix1)
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
      setZoom(isMobile ? 0.42 : 0.75);
      setPan({ x: 0, y: 0 });
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const cWidth = containerRect.width || (typeof window !== 'undefined' ? window.innerWidth : 800);
    const cHeight = containerRect.height || (typeof window !== 'undefined' ? window.innerHeight - 120 : 600);

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

<<<<<<< HEAD
    nodes.forEach((n) => {
=======
    currentNodes.forEach((n) => {
>>>>>>> aa42170 (CrimeMtrix1)
      const { w: width, h: height } = getNodeDimensions(n.type);
      minX = Math.min(minX, n.x);
      maxX = Math.max(maxX, n.x + width);
      minY = Math.min(minY, n.y);
      maxY = Math.max(maxY, n.y + height);
    });

    if (!Number.isFinite(minX) || !Number.isFinite(maxX)) {
      minX = 200;
      maxX = 1000;
      minY = 200;
      maxY = 600;
    }

    const padding = cWidth < 640 ? 32 : 64;
    const boxW = Math.max(220, maxX - minX + padding * 2);
    const boxH = Math.max(200, maxY - minY + padding * 2);

    const fitZoom = Math.min(
      cWidth < 640 ? 0.72 : 1.1,
      Math.max(0.25, Math.min(cWidth / boxW, cHeight / boxH))
    );

    const planeCenterX = 770;
    const planeCenterY = 430;
    const boxCenterX = (minX + maxX) / 2;
    const boxCenterY = (minY + maxY) / 2;

    const nextPanX = Math.round((planeCenterX - boxCenterX) * fitZoom);
    const nextPanY = Math.round((planeCenterY - boxCenterY) * fitZoom);

    setZoom(Number(fitZoom.toFixed(2)));
    setPan({ x: nextPanX, y: nextPanY });
<<<<<<< HEAD
  }, [nodes]);

  // Automatically fit network to screen on open or resize (makes mobile immediately workable)
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        handleFitView();
      }, 70);
      return () => clearTimeout(timer);
=======
  }, []);

  // Track initial auto-fit so it only runs once upon modal opening for each case session,
  // preventing other templates from shifting or camera jumping when any template is moved
  const hasFittedOnOpenRef = useRef<boolean>(false);

  useEffect(() => {
    hasFittedOnOpenRef.current = false;
  }, [c.id]);

  useEffect(() => {
    if (isOpen) {
      if (!hasFittedOnOpenRef.current) {
        hasFittedOnOpenRef.current = true;
        const timer = setTimeout(() => {
          handleFitView();
        }, 70);
        return () => clearTimeout(timer);
      }
    } else {
      hasFittedOnOpenRef.current = false;
>>>>>>> aa42170 (CrimeMtrix1)
    }
  }, [isOpen, handleFitView]);

  useEffect(() => {
    const onResize = () => {
      if (isOpen && window.innerWidth < 768) {
        handleFitView();
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isOpen, handleFitView]);

  // Filter Active Count for link types
  const activeFiltersCount = (filterFinancial ? 1 : 0) + (filterPhone ? 1 : 0) + (filterLocation ? 1 : 0);

  // Active entity template filters count
  const activeEntityFilterCount =
    (filterEntityEvidence ? 1 : 0) +
    (filterEntityColocation ? 1 : 0) +
    (filterEntityTransaction ? 1 : 0) +
    (filterEntityPhone ? 1 : 0);

  // Counts of each edge type
  const countFinancial = edges.filter((e) => e.linkType === 'financial').length;
  const countPhone = edges.filter((e) => e.linkType === 'phone').length;
  const countLocation = edges.filter((e) => e.linkType === 'location').length;

  // 1. Base edges filtered strictly by active link type checkboxes
  const baseEdges = useMemo(() => {
    return edges.filter((edge) => {
      if (edge.linkType === 'financial' && !filterFinancial) return false;
      if (edge.linkType === 'phone' && !filterPhone) return false;
      if (edge.linkType === 'location' && !filterLocation) return false;
      return true;
    });
  }, [edges, filterFinancial, filterPhone, filterLocation]);

  // 2. Visible Edges and Nodes strictly computed from:
  //    - Node click isolation (selectedSubjectId)
  //    - Entity template multi-check buttons (Evidence, Co-location, Transaction, Phone)
  const { visibleEdges, visibleNodes } = useMemo(() => {
    // SCENARIO A: A specific template is clicked on the canvas
    // "if i clicks any of the template then all the line connected to that template should only be visible
    // and other non-connected lines and the non-connected templates should be disappeared and not visible there"
    if (selectedSubjectId) {
      const subjectNode = nodes.find((n) => n.id === selectedSubjectId);
      if (subjectNode) {
        // Only lines connected to this template
        const connectedEdges = baseEdges.filter(
          (e) => e.sourceId === selectedSubjectId || e.targetId === selectedSubjectId
        );
        // Only this template and templates directly connected to it
        const connectedNodeIds = new Set<string>([selectedSubjectId]);
        connectedEdges.forEach((e) => {
          connectedNodeIds.add(e.sourceId);
          connectedNodeIds.add(e.targetId);
        });

        return {
          visibleEdges: connectedEdges,
          visibleNodes: nodes.filter((n) => connectedNodeIds.has(n.id)),
        };
      }
    }

    // SCENARIO B: Entity filter buttons are checked (Multi-check option)
    // "suppose the user clicks on the Evidence then all the Evidence template should be visible
    // with the linked connect(with the evidence only if it is there) and other all should be disappeared
    // and that buttons should have multi check option for choosing that and as per the checked option
    // there should be visibility of the lines and the templates"
    if (activeEntityFilterCount > 0) {
      const activeTypeSet = new Set<TemplateType>();
      if (filterEntityEvidence) activeTypeSet.add('EVIDENCE');
      if (filterEntityColocation) activeTypeSet.add('LOCATION');
      if (filterEntityTransaction) activeTypeSet.add('TRANSACTION');
      if (filterEntityPhone) activeTypeSet.add('PHONE_CALL');

      const matchedEntityNodes = nodes.filter((n) => activeTypeSet.has(n.type as TemplateType));
      const matchedEntityNodeIds = new Set<string>(matchedEntityNodes.map((n) => n.id));

      // Connected lines (with the matched entity templates only)
      const linkedEdges = baseEdges.filter(
        (e) => matchedEntityNodeIds.has(e.sourceId) || matchedEntityNodeIds.has(e.targetId)
      );

      // Visible nodes: all matched entity templates, PLUS any connected templates linked to them
      const visibleNodeIdSet = new Set<string>(matchedEntityNodeIds);
      linkedEdges.forEach((e) => {
        visibleNodeIdSet.add(e.sourceId);
        visibleNodeIdSet.add(e.targetId);
      });

      return {
        visibleEdges: linkedEdges,
        visibleNodes: nodes.filter((n) => visibleNodeIdSet.has(n.id)),
      };
    }

    // SCENARIO C: Default view - all nodes and base edges visible
    return {
      visibleEdges: baseEdges,
      visibleNodes: nodes,
    };
  }, [
    nodes,
    baseEdges,
    selectedSubjectId,
    activeEntityFilterCount,
    filterEntityEvidence,
    filterEntityColocation,
    filterEntityTransaction,
    filterEntityPhone,
  ]);

  // Add a connection target to the newConnections list in Add Template modal
  const handleAddConnectionTarget = (targetId: string) => {
    if (!targetId) return;
    if (newConnections.some((c) => c.targetId === targetId)) return;

    const targetNode = nodes.find((n) => n.id === targetId);
    let defaultLinkType: LinkType = 'financial';
    let defaultLabel = '$10,000 Wire';

    if (targetNode?.type === 'LOCATION') {
      defaultLinkType = 'location';
      defaultLabel = 'CCTV / Geo Link';
    } else if (targetNode?.type === 'PHONE_CALL') {
      defaultLinkType = 'phone';
      defaultLabel = 'Call Intercept';
    } else if (targetNode?.type === 'EVIDENCE') {
      defaultLinkType = 'location';
      defaultLabel = 'Forensic Match';
    }

    setNewConnections((prev) => [
      ...prev,
      {
        id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        targetId,
        linkType: defaultLinkType,
        label: defaultLabel,
      },
    ]);
    setSelectedNodeToConnect('');
  };

  const handleToggleConnectionTarget = (targetId: string) => {
    if (newConnections.some((c) => c.targetId === targetId)) {
      setNewConnections((prev) => prev.filter((c) => c.targetId !== targetId));
    } else {
      handleAddConnectionTarget(targetId);
    }
  };

  const handleSelectAllExistingNodes = () => {
    const allConns = nodes.map((node) => {
      const existing = newConnections.find((c) => c.targetId === node.id);
      if (existing) return existing;
      const defaultLinkType: LinkType =
        node.type === 'TRANSACTION'
          ? 'financial'
          : node.type === 'PHONE_CALL'
          ? 'phone'
          : 'location';
      return {
        id: `temp-conn-${Date.now()}-${node.id}`,
        targetId: node.id,
        linkType: defaultLinkType,
        label: defaultLinkType === 'financial' ? 'Financial Wire' : defaultLinkType === 'phone' ? 'Call Link' : 'Location Co-Presence',
      };
    });
    setNewConnections(allConns);
  };

  const handleClearAllConnections = () => {
    setNewConnections([]);
  };

  const handleRemoveConnectionTarget = (targetId: string) => {
    setNewConnections((prev) => prev.filter((c) => c.targetId !== targetId));
  };

  const handleUpdateConnectionLinkType = (targetId: string, linkType: LinkType) => {
    setNewConnections((prev) =>
      prev.map((c) =>
        c.targetId === targetId
          ? {
              ...c,
              linkType,
              label:
                linkType === 'financial'
                  ? 'Financial Wire'
                  : linkType === 'phone'
                  ? 'Call Intercept'
                  : 'Location Match',
            }
          : c
      )
    );
  };

  const handleUpdateConnectionLabel = (targetId: string, label: string) => {
    setNewConnections((prev) =>
      prev.map((c) => (c.targetId === targetId ? { ...c, label } : c))
    );
  };

  // Create new custom template with multiple connections
  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateTitle.trim()) return;

    const newId = `node-custom-${Date.now()}`;
    const isSuspectType = (newTemplateType as string) === 'SUSPECT';
    const defaultBadge =
      isSuspectType
        ? newTemplateBadge || 'HIGH RISK'
        : newTemplateType === 'TRANSACTION'
        ? 'LEDGER'
        : newTemplateType === 'PHONE_CALL'
        ? 'CALL RECORD'
        : undefined;

    // Place near center of workspace with slight random offset
    const newX = 560 + Math.floor(Math.random() * 80) - 40;
    const newY = 220 + Math.floor(Math.random() * 80) - 40;

    const newNode: GraphNode = {
      id: newId,
      type: newTemplateType,
      title: newTemplateTitle.toUpperCase(),
      subtitle: newTemplateSubtitle || (isSuspectType ? 'Person of Interest' : 'Investigation Exhibit'),
      badge: defaultBadge,
      badgeColor:
        isSuspectType
          ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800'
          : undefined,
      photoUrl:
        isSuspectType
          ? newTemplatePhotoUrl.trim() ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'
          : undefined,
      caseId: c.id,
      x: newX,
      y: newY,
      isCustom: true,
    };

    setNodes((prev) => [...prev, newNode]);

    // Create edges for ALL selected connections
    if (newConnections.length > 0) {
      const createdEdges: GraphEdge[] = newConnections.map((conn, idx) => ({
        id: `edge-custom-${Date.now()}-${idx}`,
        sourceId: newId,
        targetId: conn.targetId,
        linkType: conn.linkType,
        label: conn.label || (conn.linkType === 'financial' ? 'Financial Trace' : conn.linkType === 'phone' ? 'Call Link' : 'Location Match'),
      }));
      setEdges((prev) => [...prev, ...createdEdges]);
    }

    // Reset modal form
    setNewTemplateTitle('');
    setNewTemplateSubtitle('');
    setNewTemplateBadge('HIGH RISK');
    setNewTemplatePhotoUrl('');
    setNewConnections([]);
    setSelectedNodeToConnect('');
    setShowAddTemplateModal(false);
  };

  // Remove node
  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.sourceId !== nodeId && e.targetId !== nodeId));
    if (selectedSubjectId === nodeId) setSelectedSubjectId(null);
  };

  // Remove edge
  const handleDeleteEdge = (edgeId: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
    if (editingEdge && editingEdge.id === edgeId) {
      setEditingEdge(null);
    }
  };

  // Manual Node Connection handler (label text is filled by user, not default)
  const handleCreateManualConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSourceId || !manualTargetId || manualSourceId === manualTargetId) return;

    const labelText = manualLinkLabel.trim();
    if (!labelText) return;

    const sourceNode = nodes.find((n) => n.id === manualSourceId);
    const targetNode = nodes.find((n) => n.id === manualTargetId);
    const sourceSide: 'left' | 'right' =
      sourceNode && targetNode && sourceNode.x < targetNode.x ? 'right' : 'left';
    const targetSide: 'left' | 'right' = sourceSide === 'right' ? 'left' : 'right';

    const newEdge: GraphEdge = {
      id: `edge-manual-${Date.now()}`,
      sourceId: manualSourceId,
      targetId: manualTargetId,
      sourcePort: sourceSide,
      targetPort: targetSide,
      linkType: manualLinkType,
      label: labelText,
    };

    setEdges((prev) => [...prev, newEdge]);
    setManualLinkLabel('');
    setShowConnectModal(false);
  };

  if (!isOpen) return null;

  return (
    <div
      id="modal-case-network-graph-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="modal-case-network-graph"
        className={`w-full ${
          isFullscreen ? 'h-full max-h-none rounded-none' : 'max-w-7xl h-full sm:h-[92vh] max-h-none sm:max-h-[920px] rounded-none sm:rounded-2xl'
        } border shadow-2xl flex flex-col overflow-hidden relative ${
          isBright
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-950 border-slate-800 text-slate-100'
        }`}
      >
        {/* Top Header Bar - Matches Website Theme */}
        <div
          className={`px-3 sm:px-5 py-2.5 sm:py-3 border-b flex items-center justify-between shrink-0 select-none ${
            isBright
              ? 'bg-white border-slate-200 text-slate-800'
              : 'bg-slate-900 border-slate-800 text-white'
          }`}
        >
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 mr-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-slate-700 shadow-xs shrink-0">
              <NetworkingIcon className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <h2 className="font-black text-xs sm:text-sm tracking-tight truncate">
                  Investigative Entity Network
                </h2>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                  {c.id}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate hidden xs:block sm:block">
                {c.caseName} • Assigned Suspects & Manual Investigation Links
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Zoom Controls */}
            <div
              className={`flex items-center rounded-lg border p-0.5 shrink-0 ${
                isBright
                  ? 'border-slate-200 bg-slate-100/80 text-slate-700'
                  : 'border-slate-700 bg-slate-800/80 text-slate-300'
              }`}
            >
              <button
                type="button"
                id="btn-zoom-out"
                onClick={handleZoomOut}
                className="p-1 sm:p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                id="btn-zoom-fit"
                onClick={handleFitView}
                className="px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-mono font-bold hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                title="Reset Zoom & Center View"
              >
                {Math.round(zoom * 100)}%
              </button>

              <button
                type="button"
                id="btn-zoom-in"
                onClick={handleZoomIn}
                className="p-1 sm:p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add New Template Button */}
            <button
              type="button"
              id="btn-add-new-template"
              onClick={() => {
                setNewTemplateType('EVIDENCE');
                setNewTemplateTitle('');
                setNewTemplateSubtitle('');
                setShowAddTemplateModal(true);
              }}
              className="px-2.5 sm:px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center space-x-1 sm:space-x-1.5 shadow-xs border border-blue-600 hover:border-blue-700 active:scale-95 transition-all cursor-pointer shrink-0"
              title="Add New Template Node"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Node</span>
            </button>

            {/* Filter Button with In-Place Dropdown Box */}
            <div className="relative shrink-0">
              <button
                type="button"
                id="btn-network-filter-toggle"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center space-x-1 sm:space-x-1.5 shadow-xs transition-all cursor-pointer shrink-0 ${
                  isFilterOpen
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : isBright
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title="Toggle Link & Entity Filters"
              >
                <Filter className={`w-3.5 h-3.5 ${isFilterOpen ? 'text-white' : 'text-blue-500'}`} />
                <span className="hidden sm:inline">Filter</span>
                <span
                  className={`text-[10px] font-mono px-1 sm:px-1.5 py-0.2 rounded-full font-bold ${
                    isFilterOpen
                      ? 'bg-blue-800 text-white'
                      : activeEntityFilterCount > 0
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  }`}
                >
                  {activeEntityFilterCount > 0 ? `${activeEntityFilterCount}` : `${activeFiltersCount}/3`}
                </span>
              </button>

              {/* Filter Dropdown Box right there under the button */}
              {isFilterOpen && (
                <div
                  id="panel-link-filters"
                  className={`absolute top-full right-0 mt-2 z-50 w-72 sm:w-80 rounded-xl border shadow-2xl overflow-hidden transition-all duration-150 animate-in fade-in slide-in-from-top-2 ${
                    isBright
                      ? 'bg-white/98 backdrop-blur-md border-slate-200 text-slate-900'
                      : 'bg-slate-900/98 backdrop-blur-md border-slate-700 text-white'
                  }`}
                >
                  <div
                    className={`px-3.5 py-2.5 flex items-center justify-between font-mono text-xs font-bold border-b ${
                      isBright
                        ? 'bg-slate-50 text-slate-900 border-slate-200'
                        : 'bg-slate-800/80 text-white border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Link Filters</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsFilterOpen(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3.5 space-y-3 font-mono text-xs">
                    {/* 1. FINANCIAL TRANSACTIONS Filter Checkbox */}
                    <div
                      onClick={() => setFilterFinancial(!filterFinancial)}
                      className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer select-none transition-all ${
                        filterFinancial
                          ? isBright
                            ? 'bg-rose-50/80 border-rose-200 shadow-xs'
                            : 'bg-rose-950/40 border-rose-800'
                          : isBright
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : 'bg-slate-800/50 border-slate-700 opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-4.5 h-4.5 rounded border flex items-center justify-center ${
                            filterFinancial
                              ? 'bg-rose-600 text-white border-rose-600'
                              : isBright
                              ? 'bg-white border-slate-300'
                              : 'bg-slate-800 border-slate-600'
                          }`}
                        >
                          {filterFinancial && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="w-3 h-3 rounded-xs bg-red-600 inline-block shrink-0 shadow-xs" />
                        <span className="font-bold text-xs tracking-tight">
                          FINANCIAL TRANSACTIONS ({countFinancial})
                        </span>
                      </div>
                    </div>

                    {/* 2. PHONE CALLS Filter Checkbox */}
                    <div
                      onClick={() => setFilterPhone(!filterPhone)}
                      className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer select-none transition-all ${
                        filterPhone
                          ? isBright
                            ? 'bg-blue-50/80 border-blue-200 shadow-xs'
                            : 'bg-blue-950/40 border-blue-800'
                          : isBright
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : 'bg-slate-800/50 border-slate-700 opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-4.5 h-4.5 rounded border flex items-center justify-center ${
                            filterPhone
                              ? 'bg-blue-600 text-white border-blue-600'
                              : isBright
                              ? 'bg-white border-slate-300'
                              : 'bg-slate-800 border-slate-600'
                          }`}
                        >
                          {filterPhone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="w-3 h-3 rounded-xs bg-blue-600 inline-block shrink-0 shadow-xs" />
                        <span className="font-bold text-xs tracking-tight">
                          PHONE CALLS ({countPhone})
                        </span>
                      </div>
                    </div>

                    {/* 3. LOCATION MATCH Filter Checkbox */}
                    <div
                      onClick={() => setFilterLocation(!filterLocation)}
                      className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer select-none transition-all ${
                        filterLocation
                          ? isBright
                            ? 'bg-amber-50/80 border-amber-200 shadow-xs'
                            : 'bg-amber-950/40 border-amber-800'
                          : isBright
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : 'bg-slate-800/50 border-slate-700 opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-4.5 h-4.5 rounded border flex items-center justify-center ${
                            filterLocation
                              ? 'bg-amber-500 text-white border-amber-500'
                              : isBright
                              ? 'bg-white border-slate-300'
                              : 'bg-slate-800 border-slate-600'
                          }`}
                        >
                          {filterLocation && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block shrink-0 shadow-xs" />
                        <span className="font-bold text-xs tracking-tight">
                          LOCATION MATCH ({countLocation})
                        </span>
                      </div>
                    </div>

                    {/* ENTITY TEMPLATE MULTI-CHECK FILTERS (Replaces HOPS FROM SUBJECT) */}
                    <div
                      className={`p-2.5 rounded-lg border ${
                        isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/80 border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Template Filters
                        </span>
                        {activeEntityFilterCount > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setFilterEntityEvidence(false);
                              setFilterEntityColocation(false);
                              setFilterEntityTransaction(false);
                              setFilterEntityPhone(false);
                            }}
                            className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {/* 1. Evidence Button */}
                        <button
                          type="button"
                          id="btn-filter-entity-evidence"
                          onClick={() => {
                            setSelectedSubjectId(null);
                            setFilterEntityEvidence((prev) => !prev);
                          }}
                          title="Evidence"
                          aria-label="Evidence"
                          className={`relative h-11 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 ${
                            filterEntityEvidence
                              ? isBright
                                ? 'bg-emerald-100/90 border-emerald-500 text-emerald-800 ring-1 ring-emerald-400'
                                : 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                              : isBright
                              ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900'
                              : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <FileText className="w-5 h-5 stroke-[2.2]" />
                          {filterEntityEvidence && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </button>

                        {/* 2. Co-location Button */}
                        <button
                          type="button"
                          id="btn-filter-entity-colocation"
                          onClick={() => {
                            setSelectedSubjectId(null);
                            setFilterEntityColocation((prev) => !prev);
                          }}
                          title="Co-location"
                          aria-label="Co-location"
                          className={`relative h-11 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 ${
                            filterEntityColocation
                              ? isBright
                                ? 'bg-amber-100/90 border-amber-500 text-amber-800 ring-1 ring-amber-400'
                                : 'bg-amber-950/80 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                              : isBright
                              ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900'
                              : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <MapPin className="w-5 h-5 stroke-[2.2]" />
                          {filterEntityColocation && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </button>

                        {/* 3. Transaction Button */}
                        <button
                          type="button"
                          id="btn-filter-entity-transaction"
                          onClick={() => {
                            setSelectedSubjectId(null);
                            setFilterEntityTransaction((prev) => !prev);
                          }}
                          title="Transaction"
                          aria-label="Transaction"
                          className={`relative h-11 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 ${
                            filterEntityTransaction
                              ? isBright
                                ? 'bg-rose-100/90 border-rose-500 text-rose-800 ring-1 ring-rose-400'
                                : 'bg-rose-950/80 border-rose-500 text-rose-300 ring-1 ring-rose-500'
                              : isBright
                              ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900'
                              : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <DollarSign className="w-5 h-5 stroke-[2.5]" />
                          {filterEntityTransaction && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </button>

                        {/* 4. Phone Button */}
                        <button
                          type="button"
                          id="btn-filter-entity-phone"
                          onClick={() => {
                            setSelectedSubjectId(null);
                            setFilterEntityPhone((prev) => !prev);
                          }}
                          title="Phone"
                          aria-label="Phone"
                          className={`relative h-11 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 ${
                            filterEntityPhone
                              ? isBright
                                ? 'bg-blue-100/90 border-blue-500 text-blue-800 ring-1 ring-blue-400'
                                : 'bg-blue-950/80 border-blue-500 text-blue-300 ring-1 ring-blue-500'
                              : isBright
                              ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900'
                              : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Phone className="w-5 h-5 stroke-[2.2]" />
                          {filterEntityPhone && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* EDGES Counter & Clear Subject */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div
                        className={`p-2 rounded-lg border flex items-center justify-center font-bold text-xs ${
                          isBright
                            ? 'bg-slate-50 border-slate-200 text-slate-800'
                            : 'bg-slate-800 border-slate-700 text-slate-200'
                        }`}
                      >
                        <span>EDGES: {visibleEdges.length}</span>
                      </div>

                      <button
                        type="button"
                        id="btn-clear-network-subject"
                        onClick={() => setSelectedSubjectId(null)}
                        disabled={!selectedSubjectId}
                        className={`p-2 rounded-lg border font-bold text-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs active:scale-95 transition-all text-xs ${
                          isBright
                            ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                        }`}
                      >
                        Clear Subject
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Reset Layout */}
            <button
              type="button"
              id="btn-reset-network-layout"
              onClick={handleResetLayout}
              className={`p-1.5 sm:p-2 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                isBright
                  ? 'border-slate-200 hover:bg-slate-100 text-slate-600'
                  : 'border-slate-700 hover:bg-slate-800 text-slate-300'
              }`}
              title="Reset Graph to Assigned Case Suspects"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              id="btn-fullscreen-network-graph"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`hidden sm:flex p-1.5 sm:p-2 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                isBright
                  ? 'border-slate-200 hover:bg-slate-100 text-slate-600'
                  : 'border-slate-700 hover:bg-slate-800 text-slate-300'
              }`}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              id="btn-close-network-graph"
              onClick={onClose}
              className={`p-1.5 sm:p-2 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                isBright
                  ? 'border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600'
                  : 'border-slate-700 hover:bg-rose-950/50 hover:text-rose-400 text-slate-300'
              }`}
              title="Close Network Graph"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Graph Workspace Canvas Container */}
        <div
          ref={containerRef}
          id="network-graph-canvas-container"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleCanvasTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex-1 relative overflow-hidden select-none cursor-grab active:cursor-grabbing"
          style={{
            backgroundImage: isBright
              ? 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px)'
              : 'radial-gradient(#334155 1.2px, transparent 1.2px)',
            backgroundSize: '24px 24px',
            backgroundColor: isBright ? '#f8fafc' : '#0b1120',
            touchAction: 'none',
          }}
        >
          <NetworkGraphErrorBoundary isBright={isBright} onRecover={handleFitView}>
            {/* Zoomable & Pannable Plane containing all Nodes and Links */}
            <div
              id="network-graph-plane"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '50% 50%',
              width: '1540px',
              height: '860px',
              position: 'relative',
              transition: isPanning || draggingNodeId ? 'none' : 'transform 0.15s ease-out',
            }}
          >
            {/* SVG Connecting Links Layer */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
              style={{ overflow: 'visible' }}
            >
              <defs>
                <marker
                  id="arrow-financial"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#e11d48" />
                </marker>
                <marker
                  id="arrow-phone"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#2563eb" />
                </marker>
                <marker
                  id="arrow-location"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#d97706" />
                </marker>
              </defs>

              {visibleEdges.map((edge) => {
                const src = nodes.find((n) => n.id === edge.sourceId);
                const tgt = nodes.find((n) => n.id === edge.targetId);
                if (!src || !tgt) return null;

                // Find pair group to give distinct curves to multiple connections between same nodes
                const pairEdges = visibleEdges.filter(
                  (e) =>
                    (e.sourceId === edge.sourceId && e.targetId === edge.targetId) ||
                    (e.sourceId === edge.targetId && e.targetId === edge.sourceId)
                );
                const indexInPair = pairEdges.findIndex((e) => e.id === edge.id);
                const totalInPair = pairEdges.length;

                const { x1, y1, x2, y2, ctrlX, ctrlY } = getEdgeEndpoints(
                  edge,
                  src,
                  tgt,
                  indexInPair,
                  totalInPair
                );

                let strokeColor = '#dc2626';
                let strokeDash = '6, 4';
                let strokeWidth = 2.5;

                if (edge.linkType === 'financial') {
                  strokeColor = '#e11d48';
                  strokeDash = '6, 4';
                  strokeWidth = 2.5;
                } else if (edge.linkType === 'phone') {
                  strokeColor = '#2563eb';
                  strokeDash = '5, 4';
                  strokeWidth = 2.5;
                } else if (edge.linkType === 'location') {
                  strokeColor = '#d97706';
                  strokeDash = '7, 4';
                  strokeWidth = 2.5;
                }

                const isSubjectEdge =
                  selectedSubjectId &&
                  (edge.sourceId === selectedSubjectId || edge.targetId === selectedSubjectId);

                return (
                  <g key={edge.id} className="transition-all duration-75">
                    {/* Shadow line */}
                    <path
                      d={`M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`}
                      fill="none"
                      stroke={isBright ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.4)'}
                      strokeWidth={strokeWidth + 3}
                    />

                    {/* Main connecting path */}
                    <path
                      d={`M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isSubjectEdge ? strokeWidth + 1.5 : strokeWidth}
                      strokeDasharray={strokeDash}
                      markerEnd={`url(#arrow-${edge.linkType})`}
                      className="transition-all"
                    />

                    {/* Interactive hover line */}
                    <path
                      d={`M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={18}
                      className="cursor-pointer pointer-events-auto"
                      onClick={() => {
                        setEditingEdge(edge);
                        setEditEdgeText(edge.label || '');
                        setEditEdgeType(edge.linkType);
                      }}
                    >
                      <title>{`Connection: ${edge.label || edge.linkType} (Click to edit or remove)`}</title>
                    </path>
                  </g>
                );
              })}

              {/* Drag-to-Connect Interactive Active Line */}
              {connectingState && (
                <g className="animate-in fade-in pointer-events-none">
                  <line
                    x1={connectingState.startX}
                    y1={connectingState.startY}
                    x2={connectingState.currentX}
                    y2={connectingState.currentY}
                    stroke="#2563eb"
                    strokeWidth={3}
                    strokeDasharray="6, 4"
                    className="drop-shadow-md"
                  />
                  <circle
                    cx={connectingState.currentX}
                    cy={connectingState.currentY}
                    r={6}
                    fill="#2563eb"
                    stroke="#ffffff"
                    strokeWidth={2}
                    className="animate-pulse"
                  />
                </g>
              )}
            </svg>

            {/* Edge Floating Badge Labels (Displayed in the mid of the connecting line) */}
            {visibleEdges.map((edge) => {
              const src = nodes.find((n) => n.id === edge.sourceId);
              const tgt = nodes.find((n) => n.id === edge.targetId);
              if (!src || !tgt || !edge.label) return null;

              const pairEdges = visibleEdges.filter(
                (e) =>
                  (e.sourceId === edge.sourceId && e.targetId === edge.targetId) ||
                  (e.sourceId === edge.targetId && e.targetId === edge.sourceId)
              );
              const indexInPair = pairEdges.findIndex((e) => e.id === edge.id);
              const totalInPair = pairEdges.length;

              const { midX, midY } = getEdgeEndpoints(
                edge,
                src,
                tgt,
                indexInPair,
                totalInPair
              );

              const isSubjectEdge =
                selectedSubjectId &&
                (edge.sourceId === selectedSubjectId || edge.targetId === selectedSubjectId);

              return (
                <div
                  key={`label-${edge.id}`}
                  style={{
                    position: 'absolute',
                    left: `${midX}px`,
                    top: `${midY}px`,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'auto',
                  }}
                  className="z-20 select-none"
                  onClick={() => {
                    setEditingEdge(edge);
                    setEditEdgeText(edge.label || '');
                    setEditEdgeType(edge.linkType);
                  }}
                >
                  <div
                    title="Click to edit or remove this connection"
                    className={`px-2.5 py-1 rounded-full border text-[11px] font-medium tracking-tight shadow-xs flex items-center space-x-1.5 cursor-pointer transition-all hover:scale-105 ${
                      edge.linkType === 'financial'
                        ? isBright
                          ? 'bg-rose-50 border-rose-300 text-rose-950 hover:bg-rose-100 shadow-rose-100'
                          : 'bg-rose-950/90 border-rose-600/80 text-rose-200 hover:bg-rose-900/90'
                        : edge.linkType === 'phone'
                        ? isBright
                          ? 'bg-blue-50 border-blue-300 text-blue-950 hover:bg-blue-100 shadow-blue-100'
                          : 'bg-blue-950/90 border-blue-600/80 text-blue-200 hover:bg-blue-900/90'
                        : isBright
                        ? 'bg-amber-50 border-amber-300 text-amber-950 hover:bg-amber-100 shadow-amber-100'
                        : 'bg-amber-950/90 border-amber-600/80 text-amber-200 hover:bg-amber-900/90'
                    } ${isSubjectEdge ? 'ring-2 ring-blue-500 scale-105 font-bold' : ''}`}
                  >
                    {edge.linkType === 'financial' && (
                      <DollarSign className="w-3 h-3 stroke-[2.5] shrink-0" />
                    )}
                    {edge.linkType === 'phone' && (
                      <Phone className="w-3 h-3 stroke-[2.5] shrink-0" />
                    )}
                    {edge.linkType === 'location' && (
                      <MapPin className="w-3 h-3 stroke-[2.5] shrink-0" />
                    )}
                    <span className="max-w-[160px] truncate font-semibold">{edge.label}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEdge(edge.id);
                      }}
                      className={`ml-1 text-xs leading-none font-bold rounded p-0.5 transition-colors ${
                        isBright
                          ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-100'
                          : 'text-slate-400 hover:text-rose-400 hover:bg-rose-950'
                      }`}
                      title="Delete connection"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Canvas Node Templates */}
            {visibleNodes.map((node) => {
              const isSelected = selectedSubjectId === node.id;
              const isDragging = draggingNodeId === node.id;

              return (
                <div
                  key={node.id}
                  id={`network-node-${node.id}`}
                  style={{
                    transform: `translate(${node.x}px, ${node.y}px)`,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  }}
                  onClick={() => setSelectedSubjectId((prev) => (prev === node.id ? null : node.id))}
                  onMouseUp={(e) => handleCardMouseUp(e, node.id)}
                  className={`transition-shadow duration-100 z-10 select-none ${
                    isDragging ? 'cursor-grabbing z-40 scale-105' : 'cursor-pointer'
                  } ${
                    connectingState && connectingState.sourceNodeId !== node.id
                      ? 'ring-2 ring-blue-500/80 rounded-xl'
                      : ''
                  }`}
                >
                  {/* 1. SUSPECT Template Card - Replaced with Suspect Icon with Photo and then Name + Case Details */}
                  {node.type === 'SUSPECT' && (
                    <div
                      className={`w-72 p-3.5 rounded-xl border-2 transition-all relative ${
                        isBright
                          ? 'bg-white border-slate-300 shadow-md text-slate-900 hover:border-slate-400'
                          : 'bg-slate-900 border-slate-700 shadow-xl text-white hover:border-slate-600'
                      } ${
                        isSelected
                          ? 'ring-2 ring-blue-600 border-blue-600 shadow-2xl scale-[1.02]'
                          : ''
                      }`}
                    >
                      {/* Top Bar: Suspect Category Badge with Suspect Icon & Canvas Controls */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1.5">
                          <div
                            className={`w-5.5 h-5.5 rounded-md flex items-center justify-center border shadow-xs ${
                              isBright
                                ? 'bg-rose-100 text-rose-700 border-rose-300'
                                : 'bg-rose-950/80 text-rose-300 border-rose-800'
                            }`}
                          >
                            <User className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                          <span
                            className={`text-[10px] font-mono font-black uppercase tracking-wider ${
                              isBright ? 'text-rose-700' : 'text-rose-400'
                            }`}
                          >
                            SUSPECT
                          </span>
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border tracking-tight ${
                              node.badgeColor ||
                              (isBright
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-rose-950/60 text-rose-300 border-rose-800')
                            }`}
                          >
                            {node.badge || 'WANTED'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <div
                            onMouseDown={(e) => handleMouseDown(e, node.id)}
                            onTouchStart={(e) => handleTouchStart(e, node.id)}
                            className={`p-1 rounded-md cursor-grab active:cursor-grabbing transition-colors ${
                              isBright
                                ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-800'
                                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                            title="Drag node across canvas"
                          >
                            <Move className="w-3.5 h-3.5" />
                          </div>

                          {node.isCustom && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNode(node.id);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                              title="Remove Node"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Primary Identity: Suspect Icon with Photo and then Name */}
                      <div className="flex items-center space-x-3 mb-2.5">
                        <div className="relative shrink-0">
                          <img
                            src={
                              node.photoUrl ||
                              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                            }
                            alt={node.title}
                            className={`w-14 h-14 rounded-lg object-cover border-2 shadow-xs ${
                              isBright ? 'border-slate-300 bg-slate-100' : 'border-slate-700 bg-slate-800'
                            }`}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div
                            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-rose-600 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-xs"
                            title="Suspect Icon"
                          >
                            <User className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-black text-xs sm:text-sm tracking-tight uppercase leading-snug truncate ${
                              isBright ? 'text-slate-900' : 'text-white'
                            }`}
                            title={node.title}
                          >
                            {node.title}
                          </h3>
                          <p
                            className={`text-[11px] font-medium leading-tight line-clamp-2 mt-0.5 ${
                              isBright ? 'text-slate-600' : 'text-slate-300'
                            }`}
                            title={node.subtitle}
                          >
                            {node.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Details Related to That Particular Case */}
                      <div
                        className={`p-2 rounded-lg border text-[10px] space-y-1 ${
                          isBright
                            ? 'bg-slate-50 border-slate-200 text-slate-700'
                            : 'bg-slate-800/80 border-slate-700/80 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-bold flex items-center space-x-1 truncate text-blue-600 dark:text-blue-400">
                            <FolderLock className="w-3 h-3 shrink-0" />
                            <span className="truncate">{node.caseId || c.id}</span>
                          </span>
                          <span className="truncate text-slate-500 max-w-[130px] text-right font-medium">
                            {node.caseName || c.caseName}
                          </span>
                        </div>

                        {(node.crimeDetails || c.crimeType) && (
                          <div className="flex items-center space-x-1 truncate">
                            <Shield className="w-3 h-3 shrink-0 text-amber-500" />
                            <span className="truncate font-medium">{node.crimeDetails || c.crimeType}</span>
                          </div>
                        )}

                        {(node.locationDetails || c.location) && (
                          <div className="flex items-center space-x-1 truncate">
                            <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                            <span className="truncate text-slate-500 dark:text-slate-400 font-medium">
                              {node.locationDetails || c.location}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Interactive Drag Connection Ports */}
                      {renderConnectionPorts(node.id, 'bg-rose-500')}
                    </div>
                  )}

                  {/* 2. EVIDENCE Template Card */}
                  {node.type === 'EVIDENCE' && (
                    <div
                      className={`w-68 p-3 rounded-xl border-2 transition-all relative ${
                        isBright
                          ? 'bg-white border-emerald-300 shadow-md text-slate-900 hover:border-emerald-400'
                          : 'bg-slate-900 border-emerald-700 text-white shadow-xl hover:border-emerald-600'
                      } ${
                        isSelected
                          ? 'ring-2 ring-blue-600 border-blue-600 shadow-2xl scale-[1.02]'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-1.5">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border shadow-xs ${
                              isBright
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                            }`}
                          >
                            <FileText className="w-3 h-3" />
                          </div>
                          <span
                            className={`text-[10px] font-mono font-black uppercase tracking-wider ${
                              isBright ? 'text-emerald-800' : 'text-emerald-400'
                            }`}
                          >
                            EVIDENCE
                          </span>
                        </div>

                        <div className="flex items-center space-x-0.5">
                          <div
                            onMouseDown={(e) => handleMouseDown(e, node.id)}
                            onTouchStart={(e) => handleTouchStart(e, node.id)}
                            className="p-1 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 cursor-grab active:cursor-grabbing transition-colors"
                            title="Drag node"
                          >
                            <Move className="w-3.5 h-3.5" />
                          </div>

                          {node.isCustom && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNode(node.id);
                              }}
                              className="p-1 text-emerald-600/70 hover:text-rose-600 cursor-pointer transition-colors"
                              title="Remove Node"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <h3
                        className={`font-black text-xs tracking-tight uppercase truncate ${
                          isBright ? 'text-slate-900' : 'text-white'
                        }`}
                        title={node.title}
                      >
                        {node.title}
                      </h3>
                      <p
                        className={`text-[11px] font-medium truncate mt-0.5 ${
                          isBright ? 'text-slate-600' : 'text-emerald-200'
                        }`}
                        title={node.subtitle}
                      >
                        {node.subtitle}
                      </p>

                      {/* Case Details Badge */}
                      <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[9px] font-mono">
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center space-x-1 truncate">
                          <FolderLock className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{node.caseId || c.id}</span>
                        </span>
                        <span className="text-slate-500 truncate max-w-[120px]">
                          {node.caseName || c.caseName}
                        </span>
                      </div>

                      {/* Interactive Drag Connection Ports */}
                      {renderConnectionPorts(node.id, 'bg-emerald-500')}
                    </div>
                  )}

                  {/* 3. LOCATION Template Card */}
                  {node.type === 'LOCATION' && (
                    <div
                      className={`w-68 p-3 rounded-xl border-2 transition-all relative ${
                        isBright
                          ? 'bg-white border-amber-300 shadow-md text-slate-900 hover:border-amber-400'
                          : 'bg-slate-900 border-amber-700 text-white shadow-xl hover:border-amber-600'
                      } ${
                        isSelected
                          ? 'ring-2 ring-blue-600 border-blue-600 shadow-2xl scale-[1.02]'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-1.5">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border shadow-xs ${
                              isBright
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-amber-950/80 text-amber-300 border-amber-700'
                            }`}
                          >
                            <MapPin className="w-3 h-3" />
                          </div>
                          <span
                            className={`text-[10px] font-mono font-black uppercase tracking-wider ${
                              isBright ? 'text-amber-800' : 'text-amber-400'
                            }`}
                          >
                            LOCATION
                          </span>
                        </div>

                        <div className="flex items-center space-x-0.5">
                          <div
                            onMouseDown={(e) => handleMouseDown(e, node.id)}
                            onTouchStart={(e) => handleTouchStart(e, node.id)}
                            className="p-1 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 cursor-grab active:cursor-grabbing transition-colors"
                            title="Drag node"
                          >
                            <Move className="w-3.5 h-3.5" />
                          </div>

                          {node.isCustom && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNode(node.id);
                              }}
                              className="p-1 text-amber-600/70 hover:text-rose-600 cursor-pointer transition-colors"
                              title="Remove Node"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <h3
                        className={`font-black text-xs tracking-tight uppercase truncate ${
                          isBright ? 'text-slate-900' : 'text-white'
                        }`}
                        title={node.title}
                      >
                        {node.title}
                      </h3>
                      <p
                        className={`text-[11px] font-medium truncate mt-0.5 ${
                          isBright ? 'text-slate-600' : 'text-amber-200'
                        }`}
                        title={node.subtitle}
                      >
                        {node.subtitle}
                      </p>

                      {/* Case Details Badge */}
                      <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[9px] font-mono">
                        <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center space-x-1 truncate">
                          <FolderLock className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{node.caseId || c.id}</span>
                        </span>
                        <span className="text-slate-500 truncate max-w-[120px]">
                          {node.caseName || c.caseName}
                        </span>
                      </div>

                      {/* Interactive Drag Connection Ports */}
                      {renderConnectionPorts(node.id, 'bg-amber-500')}
                    </div>
                  )}

                  {/* 4. TRANSACTION Template Card */}
                  {node.type === 'TRANSACTION' && (
                    <div
                      className={`w-68 p-3 rounded-xl border-2 transition-all relative ${
                        isBright
                          ? 'bg-white border-rose-300 shadow-md text-slate-900 hover:border-rose-400'
                          : 'bg-slate-900 border-rose-700 text-white shadow-xl hover:border-rose-600'
                      } ${
                        isSelected
                          ? 'ring-2 ring-blue-600 border-blue-600 shadow-2xl scale-[1.02]'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-1.5">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border shadow-xs ${
                              isBright
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : 'bg-rose-950/80 text-rose-300 border-rose-700'
                            }`}
                          >
                            <DollarSign className="w-3 h-3 stroke-[2.5]" />
                          </div>
                          <span
                            className={`text-[10px] font-mono font-black uppercase tracking-wider ${
                              isBright ? 'text-rose-800' : 'text-rose-400'
                            }`}
                          >
                            TRANSACTION
                          </span>
                        </div>

                        <div className="flex items-center space-x-0.5">
                          <div
                            onMouseDown={(e) => handleMouseDown(e, node.id)}
                            onTouchStart={(e) => handleTouchStart(e, node.id)}
                            className="p-1 rounded-md hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 cursor-grab active:cursor-grabbing transition-colors"
                            title="Drag node"
                          >
                            <Move className="w-3.5 h-3.5" />
                          </div>

                          {node.isCustom && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNode(node.id);
                              }}
                              className="p-1 text-rose-600/70 hover:text-rose-600 cursor-pointer transition-colors"
                              title="Remove Node"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <h3
                        className={`font-black text-xs tracking-tight uppercase truncate ${
                          isBright ? 'text-slate-900' : 'text-white'
                        }`}
                        title={node.title}
                      >
                        {node.title}
                      </h3>
                      <p
                        className={`text-[11px] font-medium truncate mt-0.5 ${
                          isBright ? 'text-slate-600' : 'text-rose-200'
                        }`}
                        title={node.subtitle}
                      >
                        {node.subtitle}
                      </p>

                      {node.badge && (
                        <div className="mt-1.5">
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border inline-block tracking-tight ${
                              node.badgeColor ||
                              (isBright
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-rose-950/80 text-rose-300 border-rose-800')
                            }`}
                          >
                            {node.badge}
                          </span>
                        </div>
                      )}

                      {/* Case Details Badge */}
                      <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[9px] font-mono">
                        <span className="text-rose-700 dark:text-rose-400 font-bold flex items-center space-x-1 truncate">
                          <FolderLock className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{node.caseId || c.id}</span>
                        </span>
                        <span className="text-slate-500 truncate max-w-[120px]">
                          {node.caseName || c.caseName}
                        </span>
                      </div>

                      {/* Interactive Drag Connection Ports */}
                      {renderConnectionPorts(node.id, 'bg-rose-500')}
                    </div>
                  )}

                  {/* 5. PHONE_CALL Template Card */}
                  {node.type === 'PHONE_CALL' && (
                    <div
                      className={`w-68 p-3 rounded-xl border-2 transition-all relative ${
                        isBright
                          ? 'bg-white border-blue-300 shadow-md text-slate-900 hover:border-blue-400'
                          : 'bg-slate-900 border-blue-700 text-white shadow-xl hover:border-blue-600'
                      } ${
                        isSelected
                          ? 'ring-2 ring-blue-600 border-blue-600 shadow-2xl scale-[1.02]'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-1.5">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border shadow-xs ${
                              isBright
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : 'bg-blue-950/80 text-blue-300 border-blue-700'
                            }`}
                          >
                            <Phone className="w-3 h-3" />
                          </div>
                          <span
                            className={`text-[10px] font-mono font-black uppercase tracking-wider ${
                              isBright ? 'text-blue-800' : 'text-blue-400'
                            }`}
                          >
                            CALL RECORD
                          </span>
                        </div>

                        <div className="flex items-center space-x-0.5">
                          <div
                            onMouseDown={(e) => handleMouseDown(e, node.id)}
                            onTouchStart={(e) => handleTouchStart(e, node.id)}
                            className="p-1 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 cursor-grab active:cursor-grabbing transition-colors"
                            title="Drag node"
                          >
                            <Move className="w-3.5 h-3.5" />
                          </div>

                          {node.isCustom && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNode(node.id);
                              }}
                              className="p-1 text-blue-600/70 hover:text-rose-600 cursor-pointer transition-colors"
                              title="Remove Node"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <h3
                        className={`font-black text-xs tracking-tight uppercase truncate ${
                          isBright ? 'text-slate-900' : 'text-white'
                        }`}
                        title={node.title}
                      >
                        {node.title}
                      </h3>
                      <p
                        className={`text-[11px] font-medium truncate mt-0.5 ${
                          isBright ? 'text-slate-600' : 'text-blue-200'
                        }`}
                        title={node.subtitle}
                      >
                        {node.subtitle}
                      </p>

                      {/* Case Details Badge */}
                      <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[9px] font-mono">
                        <span className="text-blue-700 dark:text-blue-400 font-bold flex items-center space-x-1 truncate">
                          <FolderLock className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{node.caseId || c.id}</span>
                        </span>
                        <span className="text-slate-500 truncate max-w-[120px]">
                          {node.caseName || c.caseName}
                        </span>
                      </div>

                      {/* Interactive Drag Connection Ports */}
                      {renderConnectionPorts(node.id, 'bg-blue-500')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          </NetworkGraphErrorBoundary>

          {/* Mobile Bottom Quick-Action Bar with relevant icons for touch devices */}
          <div className="sm:hidden absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-1 px-2.5 py-1.5 rounded-full border shadow-xl backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-slate-300 dark:border-slate-700">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleFitView}
              className="px-2 py-0.5 rounded-full text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors flex items-center space-x-1"
              title="Fit to Screen"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Fit</span>
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-3.5 bg-slate-300 dark:bg-slate-700 mx-0.5" />
            <button
              type="button"
              onClick={() => {
                setNewTemplateType('EVIDENCE');
                setNewTemplateTitle('');
                setNewTemplateSubtitle('');
                setShowAddTemplateModal(true);
              }}
              className="p-1.5 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
              title="Add Node"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className="p-1.5 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Filters"
            >
              <Filter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetLayout}
              className="p-1.5 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Reset Layout"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Status & Key Legend Bar */}
        <div
          className={`px-3 sm:px-4 py-2 sm:py-2.5 border-t shrink-0 flex flex-wrap items-center justify-between text-[10px] sm:text-xs font-mono gap-1.5 ${
            isBright
              ? 'bg-white border-slate-200 text-slate-600'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex flex-wrap items-center gap-2 sm:space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-600 inline-block shadow-xs" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Financial</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-600 inline-block shadow-xs" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Phone/SMS</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-500 inline-block shadow-xs" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Geo/Location</span>
            </span>
          </div>

          <div className="text-[10px] sm:text-[11px] text-slate-500 hidden sm:flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <Move className="w-3.5 h-3.5" />
              <span>Drag node to move</span>
            </span>
            <span>•</span>
            <span>Click any node to focus • Drag or pinch canvas to pan/zoom</span>
          </div>
        </div>

        {/* Modal: Add New Template Dialog with Multiple Connections to Existing Nodes */}
        {/* Modal: Add Case Template Node */}
        {showAddTemplateModal && (
          <div
            id="modal-add-template"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          >
            <div
              className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border p-5 shadow-2xl animate-in zoom-in-95 duration-150 ${
                isBright
                  ? 'bg-white border-slate-200 text-slate-900'
                  : 'bg-slate-900 border-slate-800 text-white'
              }`}
            >
              <div
                className={`flex items-center justify-between pb-3 border-b ${
                  isBright ? 'border-slate-200' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </div>
                  <h3
                    className={`font-bold text-sm tracking-tight ${
                      isBright ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    Add New Template Node
                  </h3>
                </div>
                <button
                  type="button"
                  id="btn-close-add-template"
                  onClick={() => setShowAddTemplateModal(false)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isBright
                      ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                      : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTemplate} className="space-y-3.5 mt-4">
                <div>
                  <label
                    htmlFor="select-template-type"
                    className={`block text-[11px] font-mono font-bold uppercase mb-1 ${
                      isBright ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    Template Type
                  </label>
                  <select
                    id="select-template-type"
                    value={newTemplateType}
                    onChange={(e) => setNewTemplateType(e.target.value as TemplateType)}
                    className={`w-full p-2.5 rounded-lg border text-xs font-bold transition-colors ${
                      isBright
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white'
                        : 'bg-slate-800 border-slate-700 text-white'
                    }`}
                  >
                    <option value="EVIDENCE">Evidence Exhibit</option>
                    <option value="LOCATION">Crime / Co-Location Scene</option>
                    <option value="TRANSACTION">Financial Transaction / Account</option>
                    <option value="PHONE_CALL">Phone / Intercept Record</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="input-template-title"
                    className={`block text-[11px] font-mono font-bold uppercase mb-1 ${
                      isBright ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    Template Title
                  </label>
                  <input
                    id="input-template-title"
                    type="text"
                    required
                    placeholder="e.g. CCTV FOOTAGE, VAULT TRANSACTION WIRE"
                    value={newTemplateTitle}
                    onChange={(e) => setNewTemplateTitle(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs font-medium transition-colors ${
                      isBright
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white'
                        : 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="input-template-subtitle"
                    className={`block text-[11px] font-mono font-bold uppercase mb-1 ${
                      isBright ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    Subtitle
                  </label>
                  <input
                    id="input-template-subtitle"
                    type="text"
                    placeholder="e.g. Keycard badge accessed at 03:22 AM"
                    value={newTemplateSubtitle}
                    onChange={(e) => setNewTemplateSubtitle(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs font-medium transition-colors ${
                      isBright
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white'
                        : 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                    }`}
                  />
                </div>

                <div
                  className={`flex justify-end space-x-2 pt-3 border-t ${
                    isBright ? 'border-slate-200' : 'border-slate-800'
                  }`}
                >
                  <button
                    type="button"
                    id="btn-cancel-add-template"
                    onClick={() => setShowAddTemplateModal(false)}
                    className={`px-3.5 py-2 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                      isBright
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="btn-submit-add-template"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs border border-blue-700 cursor-pointer shadow-xs active:scale-95 transition-all"
                  >
                    Create Template Node
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Connect Existing Nodes Manually */}
        {showConnectModal && (
          <div
            id="modal-manual-connect"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          >
            <div
              className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl animate-in zoom-in-95 duration-150 ${
                isBright
                  ? 'bg-white border-slate-200 text-slate-900'
                  : 'bg-slate-900 border-slate-800 text-white'
              }`}
            >
              <div
                className={`flex items-center justify-between pb-3 border-b ${
                  isBright ? 'border-slate-200' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Link2 className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <h3
                    className={`font-bold text-sm tracking-tight ${
                      isBright ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    Connect Nodes Manually
                  </h3>
                </div>
                <button
                  type="button"
                  id="btn-close-manual-connect"
                  onClick={() => setShowConnectModal(false)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isBright
                      ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                      : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateManualConnection} className="space-y-3.5 mt-4">
                <div>
                  <label
                    htmlFor="select-manual-source"
                    className={`block text-[11px] font-mono font-bold uppercase mb-1 ${
                      isBright ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    Source Node (From)
                  </label>
                  <select
                    id="select-manual-source"
                    value={manualSourceId}
                    onChange={(e) => setManualSourceId(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs font-bold transition-colors ${
                      isBright
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-800 border-slate-700 text-white'
                    }`}
                  >
                    {nodes.map((n) => (
                      <option key={`src-${n.id}`} value={n.id}>
                        {n.title} ({n.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="select-manual-target"
                    className={`block text-[11px] font-mono font-bold uppercase mb-1 ${
                      isBright ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    Target Node (To)
                  </label>
                  <select
                    id="select-manual-target"
                    value={manualTargetId}
                    onChange={(e) => setManualTargetId(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs font-bold transition-colors ${
                      isBright
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-800 border-slate-700 text-white'
                    }`}
                  >
                    {nodes
                      .filter((n) => n.id !== manualSourceId)
                      .map((n) => (
                        <option key={`tgt-${n.id}`} value={n.id}>
                          {n.title} ({n.type})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label
                      htmlFor="select-manual-link-type"
                      className={`block text-[11px] font-mono font-bold uppercase mb-1 ${
                        isBright ? 'text-slate-700' : 'text-slate-300'
                      }`}
                    >
                      Link Type
                    </label>
                    <select
                      id="select-manual-link-type"
                      value={manualLinkType}
                      onChange={(e) => setManualLinkType(e.target.value as LinkType)}
                      className={`w-full p-2.5 rounded-lg border text-xs font-bold transition-colors ${
                        isBright
                          ? 'bg-slate-50 border-slate-300 text-slate-900'
                          : 'bg-slate-800 border-slate-700 text-white'
                      }`}
                    >
                      <option value="financial">Financial Transaction</option>
                      <option value="phone">Phone Call</option>
                      <option value="location">Location Match</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="input-manual-link-label"
                      className={`block text-[11px] font-mono font-bold uppercase mb-1 ${
                        isBright ? 'text-slate-700' : 'text-slate-300'
                      }`}
                    >
                      Connection Text (Mid of Line) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-manual-link-label"
                      type="text"
                      required
                      placeholder="e.g. Call Record, Transfer, Co-location..."
                      value={manualLinkLabel}
                      onChange={(e) => setManualLinkLabel(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border text-xs font-medium transition-colors ${
                        isBright
                          ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                          : 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                      }`}
                    />
                  </div>
                </div>

                <div
                  className={`flex justify-end space-x-2 pt-3 border-t ${
                    isBright ? 'border-slate-200' : 'border-slate-800'
                  }`}
                >
                  <button
                    type="button"
                    id="btn-cancel-manual-connect"
                    onClick={() => setShowConnectModal(false)}
                    className={`px-3.5 py-2 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                      isBright
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="btn-submit-manual-connect"
                    disabled={
                      !manualSourceId ||
                      !manualTargetId ||
                      manualSourceId === manualTargetId ||
                      !manualLinkLabel.trim()
                    }
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs border border-blue-700 cursor-pointer shadow-xs active:scale-95 transition-all"
                  >
                    Create Connection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Define Template Connection & Fill Connection Text */}
        {pendingConnection && (
          <div
            id="modal-define-connection"
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          >
            <div
              className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl animate-in zoom-in-95 duration-150 ${
                isBright
                  ? 'bg-white border-slate-200 text-slate-900'
                  : 'bg-slate-900 border-slate-800 text-white'
              }`}
            >
              <div
                className={`flex items-center justify-between pb-3 border-b ${
                  isBright ? 'border-slate-200' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Link2 className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3
                      className={`font-bold text-sm tracking-tight ${
                        isBright ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      Define Connection
                    </h3>
                    <p
                      className={`text-[11px] font-medium ${
                        isBright ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      Enter the connection text displayed in the mid of the line
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  id="btn-close-define-connection"
                  onClick={() => {
                    setPendingConnection(null);
                    setConnectionInputText('');
                  }}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isBright
                      ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                      : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Connected Templates Preview Banner */}
              {(() => {
                const sNode = nodes.find((n) => n.id === pendingConnection.sourceId);
                const tNode = nodes.find((n) => n.id === pendingConnection.targetId);
                return (
                  <div
                    className={`my-3.5 p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
                      isBright
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-slate-800/80 border-slate-700'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div
                        className={`font-bold truncate ${
                          isBright ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {sNode?.title || 'Template A'}
                      </div>
                      <div
                        className={`text-[10px] font-semibold mt-0.5 ${
                          isBright ? 'text-blue-600' : 'text-blue-400'
                        }`}
                      >
                        {pendingConnection.sourcePort === 'left' ? 'Left Point' : 'Right Point'}
                      </div>
                    </div>

                    <div className="px-2 text-blue-500 shrink-0">
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </div>

                    <div className="flex-1 min-w-0 pl-2 text-right">
                      <div
                        className={`font-bold truncate ${
                          isBright ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {tNode?.title || 'Template B'}
                      </div>
                      <div
                        className={`text-[10px] font-semibold mt-0.5 ${
                          isBright ? 'text-blue-600' : 'text-blue-400'
                        }`}
                      >
                        {pendingConnection.targetPort === 'left' ? 'Left Point' : 'Right Point'}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <form onSubmit={handleConfirmConnection} className="space-y-3.5">
                <div>
                  <label
                    htmlFor="input-connection-text"
                    className={`block text-[11px] font-mono font-bold uppercase mb-1 ${
                      isBright ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    Connection Text (Mid of Line) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-connection-text"
                    type="text"
                    required
                    autoFocus
                    placeholder="Enter connection description..."
                    value={connectionInputText}
                    onChange={(e) => setConnectionInputText(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-colors ${
                      isBright
                        ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                        : 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                    }`}
                  />
                  <p
                    className={`text-[10px] mt-1.5 ${
                      isBright ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    This text will be displayed in the small text badge in the center of the line.
                  </p>
                </div>

                <div
                  className={`flex justify-end space-x-2 pt-3 border-t ${
                    isBright ? 'border-slate-200' : 'border-slate-800'
                  }`}
                >
                  <button
                    type="button"
                    id="btn-cancel-define-connection"
                    onClick={() => {
                      setPendingConnection(null);
                      setConnectionInputText('');
                    }}
                    className={`px-3.5 py-2 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                      isBright
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="btn-submit-define-connection"
                    disabled={!connectionInputText.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg text-xs border border-blue-700 cursor-pointer shadow-xs active:scale-95 transition-all"
                  >
                    Add Connection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit or Remove Connection */}
        {editingEdge && (
          <div
            id="modal-edit-connection"
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          >
            <div
              className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl animate-in zoom-in-95 duration-150 ${
                isBright
                  ? 'bg-white border-slate-200 text-slate-900'
                  : 'bg-slate-900 border-slate-800 text-white'
              }`}
            >
              <div
                className={`flex items-center justify-between pb-3 border-b ${
                  isBright ? 'border-slate-200' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Edit3 className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <h3
                    className={`font-bold text-sm tracking-tight ${
                      isBright ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    Edit Connection
                  </h3>
                </div>
                <button
                  type="button"
                  id="btn-close-edit-connection"
                  onClick={() => setEditingEdge(null)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isBright
                      ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                      : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!editEdgeText.trim()) return;
                  setEdges((prev) =>
                    prev.map((edge) =>
                      edge.id === editingEdge.id
                        ? { ...edge, label: editEdgeText.trim() }
                        : edge
                    )
                  );
                  setEditingEdge(null);
                }}
                className="space-y-3.5 mt-4"
              >
                <div>
                  <label
                    htmlFor="input-edit-connection-text"
                    className={`block text-[11px] font-mono font-bold uppercase mb-1 ${
                      isBright ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    Connection Text (Mid of Line) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-edit-connection-text"
                    type="text"
                    required
                    value={editEdgeText}
                    onChange={(e) => setEditEdgeText(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-colors ${
                      isBright
                        ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                        : 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                    }`}
                  />
                </div>

                <div
                  className={`flex justify-between items-center pt-3 border-t ${
                    isBright ? 'border-slate-200' : 'border-slate-800'
                  }`}
                >
                  <button
                    type="button"
                    id="btn-delete-connection"
                    onClick={() => {
                      handleDeleteEdge(editingEdge.id);
                      setEditingEdge(null);
                    }}
                    className={`px-3 py-2 border text-xs font-bold rounded-lg cursor-pointer flex items-center space-x-1.5 transition-colors ${
                      isBright
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300'
                        : 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border-rose-800'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Link</span>
                  </button>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      id="btn-cancel-edit-connection"
                      onClick={() => setEditingEdge(null)}
                      className={`px-3.5 py-2 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                        isBright
                          ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      id="btn-save-edit-connection"
                      disabled={!editEdgeText.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold rounded-lg text-xs border border-blue-700 cursor-pointer shadow-xs active:scale-95 transition-all"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Confirm Reset Graph */}
        {showResetConfirmModal && (
          <div
            id="modal-reset-confirm"
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          >
            <div
              className={`w-full max-w-sm rounded-2xl border p-5 shadow-2xl animate-in zoom-in-95 duration-150 ${
                isBright
                  ? 'bg-white border-slate-200 text-slate-900'
                  : 'bg-slate-900 border-slate-800 text-white'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    isBright
                      ? 'bg-amber-50 text-amber-600 border-amber-200'
                      : 'bg-amber-950/60 text-amber-400 border-amber-800'
                  }`}
                >
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    className={`font-bold text-sm ${
                      isBright ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    Reset Graph Layout?
                  </h3>
                  <p
                    className={`text-xs mt-0.5 ${
                      isBright ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    Restore graph to initial assigned case suspects and clear custom edges.
                  </p>
                </div>
              </div>
              <div
                className={`flex justify-end space-x-2 pt-3 border-t ${
                  isBright ? 'border-slate-200' : 'border-slate-800'
                }`}
              >
                <button
                  type="button"
                  id="btn-cancel-reset-graph"
                  onClick={() => setShowResetConfirmModal(false)}
                  className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                    isBright
                      ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="btn-confirm-reset-graph"
                  onClick={() => {
                    const defNodes = getDefaultNodesForCase(c, suspects);
                    const defEdges = getDefaultEdgesForCase();
                    setNodes(defNodes);
                    setEdges(defEdges);
                    setSelectedSubjectId(null);
                    setFilterFinancial(true);
                    setFilterPhone(true);
                    setFilterLocation(true);
                    setFilterEntityEvidence(false);
                    setFilterEntityColocation(false);
                    setFilterEntityTransaction(false);
                    setFilterEntityPhone(false);
                    setZoom(0.85);
                    setPan({ x: 0, y: 0 });
                    setShowResetConfirmModal(false);
                  }}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  Reset Graph
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
