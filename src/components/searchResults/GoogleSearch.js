export const GoogleSearch = async (value) => {
  const { Place } = await google.maps.importLibrary('places');
  const request = {
    textQuery: value,
    fields: ['displayName', 'location'],
  };

  const { places } = await Place.searchByText(request);

  if (places.length) {
    return places;
  } else {
    return [];
  }
};
