import { API } from "../../utils/api_base";

/**
 * Fetches project metadata and sets React state
 */
export async function fetchProjectMeta(projectId, username, setMeta, setError, setLoading) {
  setLoading(true);
  setError(null);

  try {
    const data = await API.getProjectMeta(projectId, username);
    setMeta(data);
  } catch (err) {
    setError(err.message || "Failed to fetch project metadata.");
    setMeta(null);
  } finally {
    setLoading(false);
  }
}
