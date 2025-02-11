import MapLogService from '../../service/MapLogService';

/**
 * 찾기 API
 */
const FIND_SPACE = async (inputCond) => {
  try {
    const res = await MapLogService.FIND_SPACE({
      cond: inputCond,
    });
    console.log('FIND_SPACE of res ==>', res.findMeta);
    if (res.findMeta && res.findMeta.length > 0) {
      return {
        list: res.findMeta,
        routeCount: res.findMeta.length,
      };
    } else {
      console.log('No data found');
      return {
        list: [],
        routeCount: 0,
      };
    }
  } catch (e) {
    console.log('FIND_SPACE of error ==>', e);
    return {
      list: [],
      routeCount: 0,
    };
  }
};

/**
 * 검색 API (FIND TCCFG)
 */
const FIND_TCCFG = async (inputCond) => {
  try {
    const res = await MapLogService.FIND_TCCFG_10003({
      cond: inputCond,
    });

    console.log('FIND_TCCFG_10003 of res ==>', res);

    if (res && Array.isArray(res.findTccfg)) {
      return {
        list: res.findTccfg,
        routeCount: res.findTccfg.length,
      };
    } else {
      console.error('Invalid or missing findTccfg field in response:', res);
      return {
        list: [],
        routeCount: 0,
      };
    }
  } catch (e) {
    console.log('FIND_TCCFG_10003 of error ==>', e);
    return {
      list: [],
      routeCount: 0,
    };
  }
};

/**
 * 메타 검색 API (FIND_META_ID)
 */
const FIND_META_ID = async (inputCond) => {
  try {
    const res = await MapLogService.FIND_META_ID({
      cond: inputCond,
    });

    console.log('FIND_META_ID of res ==>', res.findMeta);

    // res.findMeta 값을 반환하도록 수정
    return res.findMeta;
  } catch (e) {
    console.log('FIND_META_ID of error ==>', e);
    return null; // 오류가 발생하면 null을 반환하여 처리
  }
};

/**
 * 경로 표출 API (SPACE_INTERPOLATION)
 */
const SPACE_INTERPOLATION = async (fileIds) => {
  try {
    if (!Array.isArray(fileIds)) {
      fileIds = [fileIds];
    }

    const promises = fileIds.map((fileId) => {
      return MapLogService.SPACE_INTERPOLATION({
        cond: { file_id: fileId },
      }).then((res) => {
        try {
          if (typeof res === 'string') {
            const preprocessedRes = res.replace(
              /Coord\(lat=([\d.-]+),\s*lng=([\d.-]+)\)/g,
              '{"lat":$1,"lng":$2}'
            );
            return JSON.parse(preprocessedRes);
          } else {
            console.warn('Response is not a string:', res);
            return res;
          }
        } catch (error) {
          console.error(`Error parsing response for fileId ${fileId}:`, error);
          return null;
        }
      });
    });

    const results = await Promise.all(promises);
    return results.filter((res) => res !== null);
  } catch (e) {
    console.log('SPACE_INTERPOLATION of error ==>', e);
  }
};

/**
 * 태그 API (MAIN_TAG)
 */
const MAIN_TAG = async () => {
  try {
    const res = await MapLogService.MAIN_TAG({});

    console.log('MAIN_TAG of res ==>', res);

    if (!res || typeof res !== 'object' || !res.tag) {
      console.error('❌ MAIN_TAG returned undefined or invalid data:', res);
      return { tag: [] }; // 기본 빈 배열 반환
    }

    // 태그 데이터 정리
    const tagList = res.tag.map((tag) => ({
      id: tag.id,
      name: tag.str,
    }));

    return { tag: tagList };
  } catch (e) {
    console.error('MAIN_TAG of error ==>', e);
    return { tag: [] };
  }
};

/**
 * 대상 API (MAIN_TARGET)
 */
const MAIN_TARGET = async () => {
  try {
    const res = await MapLogService.MAIN_TARGET({});

    if (!res || typeof res !== 'object' || !res.target) {
      return { target: [] }; // 기본 빈 배열 반환
    }

    // 대상 (Target) 데이터 정리
    const targetList = res.target.map((target) => ({
      id: target.str,
      name: target.str,
    }));

    return { target: targetList };
  } catch (e) {
    console.error('MAIN_TARGET of error ==>', e);
    return { target: [] };
  }
};

/**
 * 특징 API (MAIN_FEATURE)
 */
const MAIN_FEATURE = async () => {
  try {
    const res = await MapLogService.MAIN_FEATURE({});

    if (!res || typeof res !== 'object') {
      return { featureTop: [], featureBottom: [] };
    }

    // feature 데이터 정리
    const withHyphen =
      res.feature?.filter((item) => item.str.startsWith('-')) || [];
    const withoutHyphen =
      res.feature?.filter((item) => !item.str.startsWith('-')) || [];

    console.log('With Hyphen:', withHyphen);
    console.log('Without Hyphen:', withoutHyphen);

    const topFeatureList = withHyphen.map((whn) => ({
      id: whn.id,
      name: whn.str.replace('-', ''),
    }));

    const bottomFeatureList = withoutHyphen.map((whn) => ({
      id: whn.id,
      name: whn.str,
    }));

    return {
      featureTop: topFeatureList,
      featureBottom: bottomFeatureList,
    };
  } catch (e) {
    console.error('MAIN_FEATURE of error ==>', e);
    return { featureTop: [], featureBottom: [] };
  }
};

/**
 * 대륙, 지역 API (MAIN_COUNTRY)
 * continent, country_Iso2, country_Iso3, country_name
 */
const MAIN_COUNTRY = async (continentNameMap) => {
  try {
    const res = await MapLogService.MAIN_COUNTRY({});
    console.log('MAIN_COUNTRY of res ==>', res.country);

    // 대륙(Continent) 데이터 정리
    const uniqueContinents = [
      ...new Set(res.country.map((country) => country.continent)),
    ].sort();
    const continentsList = uniqueContinents.map((continent) => ({
      id: continent.toLowerCase(),
      name: continentNameMap[continent] || continent,
    }));

    // ✅ `t` 없이 `continentNameMap['all']` 사용하도록 변경
    continentsList.unshift({ id: 'all', name: continentNameMap['all'] });

    // 지역 (Country) 데이터 정리
    const processedList = res.country.map((country) => ({
      id: country.country_Iso3,
      name: country.country_name,
    }));

    processedList.unshift({ id: 'all', name: continentNameMap['all'] });
    processedList.sort((a, b) => a.name.localeCompare(b.name));

    return {
      list: res.country,
      continent: continentsList,
      country: processedList,
    };
  } catch (e) {
    console.error('MAIN_COUNTRY of error ==>', e);
    return {
      list: [],
      continent: [],
      country: [],
    };
  }
};

/**
 * 메타 데이터 검색 API (FIND_META)
 */
const FIND_META = async (inputCond) => {
  try {
    const res = await MapLogService.FIND_META_10100({ cond: inputCond });

    if (res.findMeta) {
      return {
        list: res.findMeta,
        routeCount: res.findMeta.length,
      };
    } else {
      return {
        list: [],
        routeCount: 0,
      };
    }
  } catch (e) {
    console.log('FIND_META of error ==>', e);
    return {
      list: [],
      routeCount: 0,
    };
  }
};

export {
  FIND_META,
  MAIN_COUNTRY,
  MAIN_FEATURE,
  MAIN_TARGET,
  MAIN_TAG,
  SPACE_INTERPOLATION,
  FIND_META_ID,
  FIND_TCCFG,
  FIND_SPACE,
};
