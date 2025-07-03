
// This is a simplified dataset with major cities by country code
// In a production app, you might want to use a more complete dataset or an API
export const cities: Record<string, string[]> = {
  "US": [
    "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", 
    "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", 
    "San Francisco", "Charlotte", "Indianapolis", "Seattle", "Denver", "Washington DC", 
    "Boston", "Nashville", "Baltimore", "Oklahoma City", "Portland", "Las Vegas", "Milwaukee",
    "Albuquerque", "Tucson", "Fresno", "Sacramento", "Long Beach", "Kansas City", "Mesa",
    "Atlanta", "Colorado Springs", "Miami", "Raleigh", "Omaha", "Oakland", "Minneapolis"
  ],
  "CA": [
    "Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", 
    "Quebec City", "Hamilton", "Kitchener", "London", "Halifax", "Victoria", "Windsor",
    "Saskatoon", "Regina", "St. John's", "Kelowna", "Abbotsford", "Sherbrooke"
  ],
  "GB": [
    "London", "Birmingham", "Manchester", "Glasgow", "Edinburgh", "Liverpool", "Bristol",
    "Sheffield", "Leeds", "Cardiff", "Belfast", "Newcastle", "Nottingham", "Portsmouth",
    "Leicester", "Oxford", "Cambridge", "Aberdeen", "Brighton", "York"
  ],
  "AU": [
    "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Newcastle",
    "Canberra", "Wollongong", "Hobart", "Geelong", "Townsville", "Cairns", "Darwin",
    "Toowoomba", "Ballarat", "Bendigo", "Launceston", "Mackay", "Rockhampton"
  ],
  "DE": [
    "Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf",
    "Dortmund", "Essen", "Leipzig", "Bremen", "Dresden", "Hanover", "Nuremberg",
    "Duisburg", "Bochum", "Wuppertal", "Bielefeld", "Bonn", "Mannheim"
  ],
  "FR": [
    "Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg",
    "Montpellier", "Bordeaux", "Lille", "Rennes", "Reims", "Le Havre", "Saint-Étienne",
    "Toulon", "Grenoble", "Dijon", "Angers", "Villeurbanne", "Le Mans"
  ],
  "IN": [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad",
    "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam",
    "Patna", "Vadodara", "Ghaziabad", "Ludhiana"
  ],
  "BR": [
    "São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte",
    "Manaus", "Curitiba", "Recife", "Belém", "Porto Alegre", "Goiânia", "Guarulhos",
    "Campinas", "São Luís", "São Gonçalo", "Maceió", "Duque de Caxias", "Natal", "Campo Grande"
  ],
  "JP": [
    "Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo", "Kobe", "Kyoto", "Fukuoka",
    "Kawasaki", "Saitama", "Hiroshima", "Sendai", "Kitakyushu", "Chiba", "Sakai",
    "Kumamoto", "Okayama", "Sagamihara", "Hamamatsu", "Niigata"
  ],
  "CN": [
    "Shanghai", "Beijing", "Guangzhou", "Shenzhen", "Tianjin", "Wuhan", "Chongqing",
    "Chengdu", "Nanjing", "Xi'an", "Hangzhou", "Shenyang", "Harbin", "Jinan", "Zhengzhou",
    "Qingdao", "Changsha", "Dalian", "Kunming", "Ningbo"
  ]
};

// Add an "Other" option to each country to allow for cities not in the list
Object.keys(cities).forEach(countryCode => {
  cities[countryCode].push("Other - Please specify in location field");
  cities[countryCode].sort();
});
