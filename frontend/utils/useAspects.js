// src/utils/useAspects.js
import { useState, useCallback } from "react";
import api from "./api";

export function useAspects() {
  const [dashboard, setDashboard]         = useState(null);
  const [aspectDetail, setAspectDetail]   = useState(null);
  const [loading, setLoading]             = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError]                 = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/aspects/");
      setDashboard(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load aspects");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAspectDetail = useCallback(async (id) => {
    setDetailLoading(true);
    setError(null);
    try {
      const res = await api.get(`/aspects/${id}/`);
      setAspectDetail(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load aspect");
      return null;
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const createAspect = useCallback(async (payload) => {
    try {
      const res = await api.post("/aspects/", payload);
      return { ok: true, data: res.data };
    } catch (err) {
      const msg =
        err.response?.data?.target_date?.[0] ||
        err.response?.data?.error ||
        "Failed to create aspect";
      return { ok: false, error: msg };
    }
  }, []);

  const updateAspect = useCallback(async (id, payload) => {
    try {
      const res = await api.patch(`/aspects/${id}/`, payload);
      return { ok: true, data: res.data };
    } catch (err) {
      return { ok: false, error: err.response?.data?.error || "Failed to update" };
    }
  }, []);

  const deleteAspect = useCallback(async (id) => {
    try {
      await api.delete(`/aspects/${id}/`);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.response?.data?.error || "Failed to delete" };
    }
  }, []);

  const toggleActivity = useCallback(async (activityId, currentCompleted) => {
    try {
      const res = await api.patch(`/activities/${activityId}/`, {
        completed: !currentCompleted,
      });
      return {
        ok: true,
        activity: res.data,
        newMilestones: res.data.newly_unlocked_milestones || [],
      };
    } catch (err) {
      return { ok: false, error: err.response?.data?.error || "Failed to update activity" };
    }
  }, []);

  const fetchActivities = useCallback(async (aspectId, date) => {
    try {
      const params = date ? `?date=${date}` : "";
      const res    = await api.get(`/aspects/${aspectId}/activities/${params}`);
      return { ok: true, data: res.data };
    } catch (err) {
      return { ok: false, error: err.response?.data?.error || "Failed to load activities" };
    }
  }, []);

  const fetchCalendar = useCallback(async (aspectId, month, year) => {
    try {
      const res = await api.get(`/aspects/${aspectId}/calendar/?month=${month}&year=${year}`);
      return { ok: true, data: res.data };
    } catch (err) {
      return { ok: false, error: "Failed to load calendar" };
    }
  }, []);

  /**
   * generateWrapped — handles the Saturday-only gate.
   * On 403, returns { ok: false, isSaturdayGate: true, data: { available_from } }
   * so the caller can show the correct modal.
   */
  const generateWrapped = useCallback(async (aspectId, weekStart) => {
    try {
      const body = weekStart ? { week_start: weekStart } : {};
      const res  = await api.post(`/aspects/${aspectId}/generate-wrapped/`, body);
      return { ok: true, data: res.data };
    } catch (err) {
      if (err.response?.status === 403) {
        const data = err.response.data;
        return {
          ok: false,
          isSaturdayGate: data?.error === "not_saturday",
          data,
          error: data?.error || "not_saturday",
        };
      }
      return { ok: false, error: err.response?.data?.error || "Failed to generate wrapped" };
    }
  }, []);

  const fetchWrapped = useCallback(async (wrappedId) => {
    try {
      const res = await api.get(`/wrapped/${wrappedId}/`);
      return { ok: true, data: res.data };
    } catch (err) {
      return { ok: false, error: "Failed to load wrapped" };
    }
  }, []);

  const fetchWrappedList = useCallback(async (aspectId) => {
    try {
      const res = await api.get(`/aspects/${aspectId}/wrapped/`);
      return { ok: true, data: res.data };
    } catch (err) {
      return { ok: false, error: "Failed to load wraps" };
    }
  }, []);

  const fetchMilestones = useCallback(async (aspectId) => {
    try {
      const res = await api.get(`/aspects/${aspectId}/milestones/`);
      return { ok: true, data: res.data };
    } catch (err) {
      return { ok: false, error: "Failed to load milestones" };
    }
  }, []);

  const fetchCombinedStats = useCallback(async () => {
    try {
      const res = await api.get("/combined-stats/");
      return { ok: true, data: res.data };
    } catch (err) {
      return { ok: false, error: "Failed to load stats" };
    }
  }, []);

  return {
    dashboard, aspectDetail, loading, detailLoading, error,
    setDashboard, setAspectDetail,
    fetchDashboard, fetchAspectDetail,
    createAspect, updateAspect, deleteAspect,
    toggleActivity, fetchActivities,
    fetchCalendar,
    generateWrapped, fetchWrapped, fetchWrappedList,
    fetchMilestones, fetchCombinedStats,
  };
}

export default useAspects;