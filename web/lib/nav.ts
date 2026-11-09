import { fetchMasters } from "./api";
import { present } from "./format";

export type NavLink = { href: string; label: string };

/**
 * Browse links built from the API masters, so they always carry valid ids
 * (search takes numeric real-estate-type / state / district ids).
 */
export async function fetchBrowseLinks(): Promise<{ purposes: NavLink[]; districts: NavLink[] }> {
  const m = await fetchMasters();
  const purposes = m.realEstateTypes.map((t) => ({ href: `/search?type=${t.id}`, label: t.type_name }));
  const districts = m.districts
    .filter((d) => present(d.name))
    .map((d) => ({ href: `/search?state=${d.state_id}&district=${d.id}`, label: d.name }));
  return { purposes, districts };
}
