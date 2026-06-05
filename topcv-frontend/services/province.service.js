const PROVINCE_API = 'https://provinces.open-api.vn/api/v1';

export const provinceService = {
    getAll: () => fetch(`${PROVINCE_API}/p/`).then((r) => r.json()),
    getDistricts: (provinceCode) => fetch(`${PROVINCE_API}/p/${provinceCode}?depth=2`).then((r) => r.json()),
};
