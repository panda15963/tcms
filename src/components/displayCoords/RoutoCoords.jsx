import RoutoMap from "../../pages/RoutoMap";

export default function RoutoCoords({ selectedCoords }) {
  const checkCoords = () => {
    if (selectedCoords === null) {
      return <RoutoMap />;
    }
    return selectedCoords;
  };
  return (
    <div>
      <RoutoMap lat={checkCoords().lat} lng={checkCoords().lng} />
    </div>
  );
}
