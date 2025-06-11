import { useEffect, useState } from "react";
import { getProforma, saveProforma, Proforma } from "@/lib/session-storage";

interface UseProformaEditorArgs {
    projectId: string;
    proformaId: string;
}

/**
 * Thin wrapper around common data-fetching & persistence logic used by the
 * Proforma editor page. By colocating these concerns here we keep the main UI
 * component mostly declarative / markup-focused.
 */
export function useProformaEditor({ projectId, proformaId }: UseProformaEditorArgs) {
    const [proforma, setProforma] = useState<Proforma | null>(null);
    const [loading, setLoading] = useState(true);

    /**
     * Helper that writes updated proforma data to both local state and the
     * session-storage persistence layer.
     */
    const commit = (next: Proforma) => {
        setProforma(next);
        saveProforma(projectId, next);
    };

    /**
     * Fetch on mount.
     */
    useEffect(() => {
        const data = getProforma(projectId, proformaId);
        if (data) {
            commit(data);
        }
        setLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId, proformaId]);

    /**
     * Generic helper for updating a top-level scalar field such as `gba`,
     * `stories`, etc.
     */
    const updateScalar = (field: keyof Proforma, value: unknown) => {
        if (!proforma) return;
        commit({ ...proforma, [field]: value } as Proforma);
    };

    return {
        proforma,
        setProforma: commit,
        loading,
        updateScalar,
    } as const;
} 