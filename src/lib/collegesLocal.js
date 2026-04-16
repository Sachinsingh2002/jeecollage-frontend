import { COLLEGES_CATALOG } from '../data/collegesCatalog';

export function listStatesFromCatalog(catalog = COLLEGES_CATALOG) {
  const map = new Map();
  for (const c of catalog) {
    map.set(c.state, (map.get(c.state) || 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([state, count]) => ({ state, count }));
}

export function listCitiesFromCatalog(catalog = COLLEGES_CATALOG, stateFilter = '') {
  const map = new Map();
  for (const c of catalog) {
    if (stateFilter && c.state !== stateFilter) continue;
    const key = `${c.city}\0${c.state}`;
    const prev = map.get(key);
    map.set(key, {
      city: c.city,
      state: c.state,
      count: (prev?.count || 0) + 1,
    });
  }
  return [...map.values()].sort((a, b) => {
    const byCity = a.city.localeCompare(b.city);
    if (byCity !== 0) return byCity;
    return a.state.localeCompare(b.state);
  });
}

export function listCoursesFromCatalog(catalog = COLLEGES_CATALOG) {
  const set = new Set();
  for (const c of catalog) {
    for (const course of c.courses || []) set.add(course);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function filterCollegesCatalog(
  catalog = COLLEGES_CATALOG,
  { state = '', city = '', course = '', min_rating = 0, search = '' }
) {
  let list = [...catalog];
  if (state) list = list.filter((c) => c.state === state);
  if (city) list = list.filter((c) => c.city === city);
  if (course) list = list.filter((c) => (c.courses || []).includes(course));
  if (min_rating > 0) list = list.filter((c) => Number(c.rating) >= Number(min_rating));
  if (search && String(search).trim()) {
    const q = String(search).trim().toLowerCase();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q)
    );
  }
  return list;
}

export function paginateCollegesList(list, page, perPage) {
  const total = list.length;
  const total_pages = Math.max(1, Math.ceil(total / perPage) || 1);
  const pageClamped = Math.min(Math.max(1, page), total_pages);
  const start = (pageClamped - 1) * perPage;
  return {
    colleges: list.slice(start, start + perPage),
    total,
    total_pages,
    page: pageClamped,
  };
}

export function queryCollegesCatalog(filters, page, perPage) {
  const filtered = filterCollegesCatalog(COLLEGES_CATALOG, filters);
  return paginateCollegesList(filtered, page, perPage);
}
