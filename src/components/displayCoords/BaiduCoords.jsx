import BaiduMap from "../../pages/mapPages/BaiduMap";

export default function BaiduCoords({ selectedCoords }) {
  return (
    <>
      {selectedCoords !== null ? (
        <BaiduMap lat={selectedCoords.lat} lng={selectedCoords.lng} />
      ) : (
        <BaiduMap />
      )}
    </>
  );
}
