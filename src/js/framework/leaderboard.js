let leaderboard_data = [];
export function setData(data) {
  leaderboard_data = data;
}

function excelDateToJSDate(serial) {
  // Excel stores dates as days since 1900-01-01
  const utcDays = serial - 25569; // days between 1900-01-01 and 1970-01-01
  const utcValue = utcDays * 86400 * 1000; // convert to milliseconds
  return new Date(utcValue);
}

// Get laptimes with actual dates
export function getLapsWithDate(participant) {
  return leaderboard_data
    .filter((d) => d.Participant === participant)
    .map((d) => ({
      date: excelDateToJSDate(d.Date),
      laptime: d.Laptime,
      course: d.Course,
      battery: d.Battery,
    }));
}

export function getFastestEverLap() {
  if (!leaderboard_data.length) return null; // handle empty array

  // Start with the first lap
  let fastestLap = leaderboard_data[0];

  for (let i = 1; i < leaderboard_data.length; i++) {
    if (leaderboard_data[i].Laptime < fastestLap.Laptime) {
      fastestLap = leaderboard_data[i];
    }
  }

  // Optionally, include a JS Date version
  return {
    ...fastestLap,
    date: excelDateToJSDate(fastestLap.Date),
  };
}
