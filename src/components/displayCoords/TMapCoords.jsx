import TMap from '../../pages/TMap';

export default function TMapCoords({ selectedCoords }) {
    return (
        <div>
        {selectedCoords !== null ? (
            <TMap lat={selectedCoords.lat} lng={selectedCoords.lng} />
        ) : (
            <TMap />
        )}
        </div>
    );
}
