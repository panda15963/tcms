import BaiduMap from '../../pages/mapPages/BaiduMap';

export default function BaiduCoords({ selectedCoords, baiduLocation }) {
  return (
    <>
      {selectedCoords !== null ? (
        <BaiduMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={baiduLocation}
        />
      ) : (
        <BaiduMap locationCoords={baiduLocation} />
      )}
    </>
  );
}
