import TMap from '../../pages/TMap';

export default function TMapCoords({ selectedCoords }) {
  const checkCoords = () => {
    if (selectedCoords === null) {
      return <TMap />;
    }
    return selectedCoords;
  };
  return (
    <div>
      <TMap lat={checkCoords().lat} lng={checkCoords().lng} />
    </div>
  );
}
