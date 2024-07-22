export const TomTomSearch = async (value) => {
  const { Place } = await google.maps.importLibrary('places');
  const request = {
    textQuery: value,
    fields: ['displayName', 'location'],
  };

  const { places } = await Place.searchByText(request);

  if (places.length) {
    return places
      .map((place) => ({
        name: place.displayName,
        latitude: place.Eg.location.lat,
        longitude: place.Eg.location.lng,
      }))
      .filter((place) => place.latitude && place.longitude);
  } else {
    return [];
  }
};
